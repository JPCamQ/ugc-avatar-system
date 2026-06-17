import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { AvatarIdentity, PostIdea } from "@/lib/types";
import { generateId } from "@/lib/utils";

interface UsePostIdeasProps {
  currentAvatar: AvatarIdentity;
  apiKey: string;
  showSuccess: (msg: string) => void;
  showError: (msg: string) => void;
}

// Helper para sanitizar y unificar dinámicamente locaciones obsoletas
function sanitizeIdeas(ideas: PostIdea[], avatar: AvatarIdentity): { cleaned: PostIdea[]; hasChanges: boolean } {
  if (!avatar || !avatar.location) return { cleaned: ideas, hasChanges: false };
  
  const parts = avatar.location.split(/[,\/]/);
  const targetCity = (parts[0] || "Caracas").trim();
  const targetCountry = (parts[1] || "Venezuela").trim();

  let hasChanges = false;
  const cleaned = ideas.map(idea => {
    const updated = { ...idea };
    const medellinRegex = /Medell[íi]n/gi;
    const colombiaRegex = /Colombia/gi;

    if (medellinRegex.test(updated.location) || medellinRegex.test(updated.scenePrompt) || medellinRegex.test(updated.title)) {
      updated.location = updated.location.replace(medellinRegex, targetCity);
      updated.scenePrompt = updated.scenePrompt.replace(medellinRegex, targetCity);
      updated.title = updated.title.replace(medellinRegex, targetCity);
      hasChanges = true;
    }

    if (colombiaRegex.test(updated.location) || colombiaRegex.test(updated.scenePrompt) || colombiaRegex.test(updated.title)) {
      updated.location = updated.location.replace(colombiaRegex, targetCountry);
      updated.scenePrompt = updated.scenePrompt.replace(colombiaRegex, targetCountry);
      updated.title = updated.title.replace(colombiaRegex, targetCountry);
      hasChanges = true;
    }
    return updated;
  });

  return { cleaned, hasChanges };
}

export function usePostIdeas({ currentAvatar, apiKey, showSuccess, showError }: UsePostIdeasProps) {
  const [postIdeas, setPostIdeas] = useState<PostIdea[]>([]);
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);
  const [customContext, setCustomContext] = useState("");
  const [audioLanguage, setAudioLanguage] = useState<"es" | "en" | "silent" | "voiceover">("es");
  const [postPromptInput, setPostPromptInput] = useState("");
  const [captionOutput, setCaptionOutput] = useState("");
  const [promptOutput, setPromptOutput] = useState("");

  const [generatingIdeas, setGeneratingIdeas] = useState(false);
  const [generatingPrompt, setGeneratingPrompt] = useState(false);
  const [generatingCaption, setGeneratingCaption] = useState(false);

  // Mantener una referencia mutable al avatar para evitar la recreación de funciones al cambiar el avatar cosméticamente
  const currentAvatarRef = useRef(currentAvatar);
  useEffect(() => {
    currentAvatarRef.current = currentAvatar;
  }, [currentAvatar]);

  // Derivar selectedIdea mediante useMemo a partir de postIdeas y selectedIdeaId
  const selectedIdea = useMemo(() => {
    return postIdeas.find(idea => idea.id === selectedIdeaId) || null;
  }, [postIdeas, selectedIdeaId]);

  // Recargar ideas desde la base de datos al cambiar de avatar o locación
  useEffect(() => {
    if (!currentAvatar?.id) return;

    const fetchIdeas = async () => {
      try {
        const res = await fetch(`/api/ideas?avatarId=${currentAvatar.id}`);
        if (!res.ok) throw new Error("Error en respuesta de API");
        const data = await res.json();
        
        const loadedIdeas: PostIdea[] = data.data || [];
        const { cleaned, hasChanges } = sanitizeIdeas(loadedIdeas, currentAvatar);

        // Si hay cambios locales de sanitización, actualizamos el servidor de forma silenciosa
        if (hasChanges) {
          for (const idea of cleaned) {
            fetch("/api/ideas", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(idea)
            }).catch(console.error);
          }
        }

        setPostIdeas(cleaned);
      } catch (err) {
        console.error("Fallo al obtener ideas de la DB:", err);
        setPostIdeas([]);
      }
    };

    fetchIdeas();
    setSelectedIdeaId(null);
    setPromptOutput("");
    setCaptionOutput("");
    setPostPromptInput("");
  }, [currentAvatar?.id, currentAvatar?.location]);

  // Generar ideas con DeepSeek (las guarda en DB directamente y las retorna)
  const handleGenerateIdeas = useCallback(async () => {
    setGeneratingIdeas(true);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (apiKey) {
        headers["Authorization"] = `Bearer ${apiKey}`;
      }

      const response = await fetch("/api/ideas", {
        method: "POST",
        headers,
        body: JSON.stringify({ avatar: currentAvatarRef.current, customContext })
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || `Error en el servidor (${response.status})`);
      }

      const newIdeas: PostIdea[] = data.ideas || [];

      setPostIdeas((prev) => {
        return [...newIdeas, ...prev].slice(0, 30);
      });

      showSuccess("Generadas 5 ideas de contenido con éxito (guardadas en base de datos).");
    } catch (error: any) {
      console.error(error);
      showError(error.message || "Error al conectar con la API de generación de ideas.");
    } finally {
      setGeneratingIdeas(false);
    }
  }, [apiKey, customContext, showSuccess, showError]);

  // Generar prompt estructurado para Flow y guardarlo en DB
  const handleGeneratePrompt = useCallback(async (idea: PostIdea) => {
    setGeneratingPrompt(true);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (apiKey) {
        headers["Authorization"] = `Bearer ${apiKey}`;
      }

      const response = await fetch("/api/prompt", {
        method: "POST",
        headers,
        body: JSON.stringify({
          avatar: currentAvatarRef.current,
          idea: { ...idea, scenePrompt: postPromptInput || idea.scenePrompt },
          audioLanguage
        })
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || `Error en el servidor (${response.status})`);
      }

      const updatedIdeaProps = {
        scenePrompt: postPromptInput || idea.scenePrompt,
        formattedFlowPrompt: data.flowPrompt
      };

      // Guardar en Base de Datos vía PUT
      const dbRes = await fetch("/api/ideas", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: idea.id,
          ...updatedIdeaProps
        })
      });

      if (!dbRes.ok) throw new Error("Error al guardar el prompt generado en el servidor.");

      setPromptOutput(data.flowPrompt);
      
      setPostIdeas((prev) => {
        return prev.map(item => {
          if (item.id === idea.id) {
            return { ...item, ...updatedIdeaProps };
          }
          return item;
        });
      });

      showSuccess("Prompt de Flow generado y guardado.");
    } catch (error: any) {
      console.error(error);
      showError(error.message || "Error al generar el prompt.");
    } finally {
      setGeneratingPrompt(false);
    }
  }, [apiKey, postPromptInput, audioLanguage, showSuccess, showError]);

  // Generar pie de foto (Caption) para Instagram y guardarlo en DB
  const handleGenerateCaption = useCallback(async (idea: PostIdea) => {
    setGeneratingCaption(true);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (apiKey) {
        headers["Authorization"] = `Bearer ${apiKey}`;
      }

      const response = await fetch("/api/caption", {
        method: "POST",
        headers,
        body: JSON.stringify({
          avatar: currentAvatarRef.current,
          idea: { ...idea, scenePrompt: postPromptInput || idea.scenePrompt }
        })
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || `Error en el servidor (${response.status})`);
      }

      const updatedIdeaProps = {
        scenePrompt: postPromptInput || idea.scenePrompt,
        instagramCaption: data.caption
      };

      // Guardar en Base de Datos vía PUT
      const dbRes = await fetch("/api/ideas", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: idea.id,
          ...updatedIdeaProps
        })
      });

      if (!dbRes.ok) throw new Error("Error al guardar el caption generado en el servidor.");

      setCaptionOutput(data.caption);

      setPostIdeas((prev) => {
        return prev.map(item => {
          if (item.id === idea.id) {
            return { ...item, ...updatedIdeaProps };
          }
          return item;
        });
      });

      showSuccess("Caption de Instagram generado y guardado.");
    } catch (error: any) {
      console.error(error);
      showError(error.message || "Error al generar pie de foto.");
    } finally {
      setGeneratingCaption(false);
    }
  }, [apiKey, postPromptInput, showSuccess, showError]);

  // Eliminar una Idea de Contenido en DB y Local
  const handleDeleteIdea = useCallback(async (ideaId: string) => {
    try {
      const res = await fetch(`/api/ideas?id=${ideaId}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Fallo al eliminar de base de datos.");

      setPostIdeas((prev) => prev.filter(item => item.id !== ideaId));
      setSelectedIdeaId(null);
      setPromptOutput("");
      setCaptionOutput("");
      setPostPromptInput("");
      showSuccess("Idea eliminada.");
    } catch (err: any) {
      showError(err.message || "No se pudo eliminar la idea de la base de datos.");
    }
  }, [showError, showSuccess]);

  // Actualizar información del producto de afiliados
  const handleUpdateProductInfo = useCallback(async (name: string, image?: string | null) => {
    if (!selectedIdeaId) return;
    
    try {
      const res = await fetch("/api/ideas", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedIdeaId,
          productName: name,
          productImage: image === null ? null : image
        })
      });

      if (!res.ok) throw new Error("Error al persistir cambios.");

      setPostIdeas((prevIdeas) => {
        return prevIdeas.map(item => {
          if (item.id === selectedIdeaId) {
            return {
              ...item,
              productName: name,
              productImage: image === null ? undefined : (image !== undefined ? image : item.productImage)
            };
          }
          return item;
        });
      });

      showSuccess("Información del producto de afiliado actualizada.");
    } catch (err: any) {
      showError("Error al guardar la información del producto patrocinado.");
    }
  }, [selectedIdeaId, showError, showSuccess]);

  // Actualizar la descripción o el scenePrompt localmente en DB y Local
  const handleUpdateIdeaScenePrompt = useCallback(async (ideaId: string, newScenePrompt: string) => {
    try {
      const res = await fetch("/api/ideas", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: ideaId,
          scenePrompt: newScenePrompt
        })
      });
      
      if (!res.ok) throw new Error("Error al persistir cambios.");

      setPostIdeas((prev) => {
        return prev.map(item => {
          if (item.id === ideaId) {
            return { ...item, scenePrompt: newScenePrompt };
          }
          return item;
        });
      });
    } catch (err) {
      console.error("No se pudo guardar la descripción editada:", err);
    }
  }, []);

  // Actualizar el estado de la publicación ("draft" | "generated" | "published")
  const handleUpdateIdeaStatus = useCallback(async (ideaId: string, status: "draft" | "generated" | "published") => {
    try {
      const res = await fetch("/api/ideas", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: ideaId,
          status
        })
      });
      
      if (!res.ok) throw new Error("Error al persistir cambios.");

      setPostIdeas((prev) => {
        return prev.map(item => {
          if (item.id === ideaId) {
            return { ...item, status };
          }
          return item;
        });
      });
      showSuccess(`Estado de publicación actualizado a: ${status === "published" ? "Publicado" : status === "generated" ? "Generado" : "Borrador"}`);
    } catch (err) {
      showError("No se pudo actualizar el estado en el servidor.");
    }
  }, [showSuccess, showError]);

  // Actualizar el estilo del prompt del post ("ugc" | "editorial")
  const handleUpdatePromptStyle = useCallback(async (ideaId: string, style: "ugc" | "editorial") => {
    try {
      const res = await fetch("/api/ideas", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: ideaId,
          promptStyle: style
        })
      });
      
      if (!res.ok) throw new Error("Error al persistir cambios.");

      setPostIdeas((prev) => {
        return prev.map(item => {
          if (item.id === ideaId) {
            return { ...item, promptStyle: style };
          }
          return item;
        });
      });

      showSuccess(`Estilo del prompt de imagen configurado en: ${style === "ugc" ? "UGC (iPhone)" : "Editorial (Sony)"}`);
    } catch (err) {
      showError("No se pudo actualizar el estilo del prompt en el servidor.");
    }
  }, [showSuccess, showError]);

  // Limpiar todas las ideas planificadas de una sola vez
  const handleClearAllIdeas = useCallback(async () => {
    try {
      const res = await fetch(`/api/ideas?avatarId=${currentAvatarRef.current.id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Error al borrar en el servidor.");

      setPostIdeas([]);
      setSelectedIdeaId(null);
      setPostPromptInput("");
      setPromptOutput("");
      setCaptionOutput("");
      showSuccess("Todas las ideas planificadas han sido eliminadas.");
    } catch (err: any) {
      showError(err.message || "No se pudo limpiar el planificador en el servidor.");
    }
  }, [showSuccess, showError]);

  // Seleccionar una idea de post para trabajar
  const handleSelectIdea = useCallback((idea: PostIdea) => {
    setSelectedIdeaId(idea.id);
    setPostPromptInput(idea.scenePrompt);
    setPromptOutput(idea.formattedFlowPrompt || "");
    setCaptionOutput(idea.instagramCaption || "");
  }, []);

  return {
    postIdeas,
    setPostIdeas,
    selectedIdea,
    setSelectedIdeaId, // Exportamos setSelectedIdeaId para coincidir con la firma del hook si es necesario
    customContext,
    setCustomContext,
    audioLanguage,
    setAudioLanguage,
    postPromptInput,
    setPostPromptInput,
    captionOutput,
    setCaptionOutput,
    promptOutput,
    setPromptOutput,
    generatingIdeas,
    generatingPrompt,
    generatingCaption,
    handleGenerateIdeas,
    handleGeneratePrompt,
    handleGenerateCaption,
    handleDeleteIdea,
    handleClearAllIdeas,
    handleUpdateProductInfo,
    handleUpdateIdeaScenePrompt,
    handleUpdateIdeaStatus,
    handleUpdatePromptStyle,
    handleSelectIdea
  };
}
