import { useState, useEffect, useCallback } from "react";
import { AvatarIdentity, PostIdea } from "@/lib/db";
import { generateId } from "@/lib/utils";

interface UsePostIdeasProps {
  currentAvatar: AvatarIdentity;
  apiKey: string;
  showSuccess: (msg: string) => void;
  showError: (msg: string) => void;
}

// Helper para sanitizar y unificar dinámicamente locaciones obsoletas (como Medellín/Colombia) al lugar actual del avatar
function sanitizeIdeas(ideas: PostIdea[], avatar: AvatarIdentity): { cleaned: PostIdea[]; hasChanges: boolean } {
  if (!avatar || !avatar.location) return { cleaned: ideas, hasChanges: false };
  
  // Extraer ciudad y país del campo location del avatar de forma limpia
  const parts = avatar.location.split(/[,\/]/);
  const targetCity = (parts[0] || "Caracas").trim();
  const targetCountry = (parts[1] || "Venezuela").trim();

  let hasChanges = false;
  const cleaned = ideas.map(idea => {
    let updated = { ...idea };
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
  const [selectedIdea, setSelectedIdea] = useState<PostIdea | null>(null);
  const [customContext, setCustomContext] = useState("");
  const [audioLanguage, setAudioLanguage] = useState<"es" | "en" | "silent" | "voiceover">("es");
  const [postPromptInput, setPostPromptInput] = useState("");
  const [captionOutput, setCaptionOutput] = useState("");
  const [promptOutput, setPromptOutput] = useState("");

  const [generatingIdeas, setGeneratingIdeas] = useState(false);
  const [generatingPrompt, setGeneratingPrompt] = useState(false);
  const [generatingCaption, setGeneratingCaption] = useState(false);

  // Recargar e higienizar ideas al cambiar de avatar o su locación
  useEffect(() => {
    if (!currentAvatar?.id) return;
    const savedIdeas = localStorage.getItem(`ugc_post_ideas_${currentAvatar.id}`);
    if (savedIdeas) {
      try {
        const parsedIdeas: PostIdea[] = JSON.parse(savedIdeas);
        
        // Sanitización dinámica de datos anteriores
        const { cleaned, hasChanges } = sanitizeIdeas(parsedIdeas, currentAvatar);

        if (hasChanges) {
          localStorage.setItem(`ugc_post_ideas_${currentAvatar.id}`, JSON.stringify(cleaned));
        }

        setPostIdeas(cleaned);
      } catch (e) {
        console.error("Error parsing post ideas:", e);
        setPostIdeas([]);
      }
    } else {
      setPostIdeas([]);
    }
    setSelectedIdea(null);
    setPromptOutput("");
    setCaptionOutput("");
    setPostPromptInput("");
  }, [currentAvatar?.id, currentAvatar?.location]);

  // Generar ideas con DeepSeek
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
        body: JSON.stringify({ avatar: currentAvatar, customContext })
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || `Error en el servidor (${response.status})`);
      }

      const generatedIdeas: PostIdea[] = (data.ideas || []).map((idea: any, idx: number) => {
        let normalizedType: "image" | "carousel" | "video" | "flyer" = "image";
        const rawType = String(idea.type || "").toLowerCase();
        if (rawType.includes("carousel") || rawType.includes("carrusel")) {
          normalizedType = "carousel";
        } else if (rawType.includes("video") || rawType.includes("reel") || rawType.includes("short")) {
          normalizedType = "video";
        } else if (rawType.includes("flyer") || rawType.includes("anuncio") || rawType.includes("poster") || rawType.includes("afiche")) {
          normalizedType = "flyer";
        }
        return {
          id: `idea_${generateId()}_${idx}`,
          avatarId: currentAvatar.id,
          title: idea.title,
          type: normalizedType,
          location: idea.location,
          phase: "storytelling" as const,
          scenePrompt: idea.description,
          formattedFlowPrompt: "",
          instagramCaption: "",
          status: "draft",
          createdAt: new Date().toLocaleDateString()
        };
      });

      // Sanitizar inmediatamente las ideas recién generadas
      const { cleaned: sanitizedNewIdeas } = sanitizeIdeas(generatedIdeas, currentAvatar);

      setPostIdeas((prev) => {
        const updatedIdeas = [...sanitizedNewIdeas, ...prev].slice(0, 30); // Aumentamos cupo a 30 posts max
        localStorage.setItem(`ugc_post_ideas_${currentAvatar.id}`, JSON.stringify(updatedIdeas));
        return updatedIdeas;
      });

      showSuccess("Generadas 5 ideas de contenido con éxito.");
    } catch (error: any) {
      console.error(error);
      showError(error.message || "Error al conectar con la API de generación de ideas.");
    } finally {
      setGeneratingIdeas(false);
    }
  }, [currentAvatar, apiKey, customContext, showSuccess, showError]);

  // Generar prompt estructurado para Flow
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
          avatar: currentAvatar,
          idea: { ...idea, scenePrompt: postPromptInput || idea.scenePrompt },
          audioLanguage
        })
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || `Error en el servidor (${response.status})`);
      }

      setPromptOutput(data.flowPrompt);
      
      setPostIdeas((prev) => {
        const updated = prev.map(item => {
          if (item.id === idea.id) {
            return { 
              ...item, 
              scenePrompt: postPromptInput || item.scenePrompt,
              formattedFlowPrompt: data.flowPrompt 
            };
          }
          return item;
        });
        localStorage.setItem(`ugc_post_ideas_${currentAvatar.id}`, JSON.stringify(updated));
        return updated;
      });

      setSelectedIdea((prev) => prev && prev.id === idea.id ? { 
        ...prev, 
        scenePrompt: postPromptInput || prev.scenePrompt,
        formattedFlowPrompt: data.flowPrompt 
      } : prev);

      showSuccess("Prompt de Flow generado.");
    } catch (error: any) {
      console.error(error);
      showError(error.message || "Error al generar el prompt.");
    } finally {
      setGeneratingPrompt(false);
    }
  }, [currentAvatar, apiKey, postPromptInput, audioLanguage, showSuccess, showError]);

  // Generar pie de foto (Caption) para Instagram
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
          avatar: currentAvatar,
          idea: { ...idea, scenePrompt: postPromptInput || idea.scenePrompt }
        })
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || `Error en el servidor (${response.status})`);
      }

      setCaptionOutput(data.caption);

      setPostIdeas((prev) => {
        const updated = prev.map(item => {
          if (item.id === idea.id) {
            return { 
              ...item, 
              scenePrompt: postPromptInput || item.scenePrompt,
              instagramCaption: data.caption 
            };
          }
          return item;
        });
        localStorage.setItem(`ugc_post_ideas_${currentAvatar.id}`, JSON.stringify(updated));
        return updated;
      });

      setSelectedIdea((prev) => prev && prev.id === idea.id ? { 
        ...prev, 
        scenePrompt: postPromptInput || prev.scenePrompt,
        instagramCaption: data.caption 
      } : prev);

      showSuccess("Caption de Instagram generado.");
    } catch (error: any) {
      console.error(error);
      showError(error.message || "Error al generar pie de foto.");
    } finally {
      setGeneratingCaption(false);
    }
  }, [currentAvatar, apiKey, postPromptInput, showSuccess, showError]);

  // Eliminar una Idea de Contenido
  const handleDeleteIdea = useCallback((ideaId: string) => {
    setPostIdeas((prev) => {
      const updated = prev.filter(item => item.id !== ideaId);
      localStorage.setItem(`ugc_post_ideas_${currentAvatar.id}`, JSON.stringify(updated));
      return updated;
    });
    setSelectedIdea(null);
    setPromptOutput("");
    setCaptionOutput("");
    setPostPromptInput("");
    showSuccess("Idea eliminada.");
  }, [currentAvatar.id, showSuccess]);

  // Actualizar información del producto de afiliados
  const handleUpdateProductInfo = useCallback((name: string, image?: string | null) => {
    if (!selectedIdea) return;
    
    setSelectedIdea((prev) => {
      if (!prev) return null;
      const updatedIdea: PostIdea = { 
        ...prev, 
        productName: name
      };
      
      if (image === null) {
        delete updatedIdea.productImage;
      } else if (image !== undefined) {
        updatedIdea.productImage = image;
      }

      setPostIdeas((prevIdeas) => {
        const updated = prevIdeas.map(item => item.id === prev.id ? updatedIdea : item);
        localStorage.setItem(`ugc_post_ideas_${currentAvatar.id}`, JSON.stringify(updated));
        return updated;
      });

      return updatedIdea;
    });

    showSuccess("Información del producto de afiliado actualizada.");
  }, [currentAvatar.id, selectedIdea, showSuccess]);

  // Actualizar la descripción o el scenePrompt localmente
  const handleUpdateIdeaScenePrompt = useCallback((ideaId: string, newScenePrompt: string) => {
    setPostIdeas((prev) => {
      const updated = prev.map(item => {
        if (item.id === ideaId) {
          return { ...item, scenePrompt: newScenePrompt };
        }
        return item;
      });
      localStorage.setItem(`ugc_post_ideas_${currentAvatar.id}`, JSON.stringify(updated));
      return updated;
    });
    
    setSelectedIdea((prev) => {
      if (prev && prev.id === ideaId) {
        return { ...prev, scenePrompt: newScenePrompt };
      }
      return prev;
    });
  }, [currentAvatar.id]);

  // Actualizar el estado de la publicación ("draft" | "generated" | "published")
  const handleUpdateIdeaStatus = useCallback((ideaId: string, status: "draft" | "generated" | "published") => {
    setPostIdeas((prev) => {
      const updated = prev.map(item => {
        if (item.id === ideaId) {
          return { ...item, status };
        }
        return item;
      });
      localStorage.setItem(`ugc_post_ideas_${currentAvatar.id}`, JSON.stringify(updated));
      return updated;
    });

    setSelectedIdea((prev) => {
      if (prev && prev.id === ideaId) {
        return { ...prev, status };
      }
      return prev;
    });
    showSuccess(`Estado de publicación actualizado a: ${status === "published" ? "Publicado" : status === "generated" ? "Generado" : "Borrador"}`);
  }, [currentAvatar.id, showSuccess]);

  // Seleccionar una idea de post para trabajar
  const handleSelectIdea = useCallback((idea: PostIdea) => {
    setSelectedIdea(idea);
    setPostPromptInput(idea.scenePrompt);
    setPromptOutput(idea.formattedFlowPrompt || "");
    setCaptionOutput(idea.instagramCaption || "");
  }, []);

  return {
    postIdeas,
    setPostIdeas,
    selectedIdea,
    setSelectedIdea,
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
    handleUpdateProductInfo,
    handleUpdateIdeaScenePrompt,
    handleUpdateIdeaStatus,
    handleSelectIdea
  };
}
