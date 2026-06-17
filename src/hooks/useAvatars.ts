/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { useState, useEffect, useCallback, useMemo } from "react";
import { DEFAULT_AVATAR, AvatarIdentity } from "@/lib/types";
import { encodeApiKey, decodeApiKey, generateId } from "@/lib/utils";
import { NewAvatarInput } from "@/components/modals/CreateAvatarModal";
import { newAvatarInputSchema, avatarIdentitySchema } from "@/lib/validations/avatar";

interface UseAvatarsProps {
  showSuccess: (msg: string) => void;
  showError: (msg: string) => void;
}

const NEW_AVATAR_INITIAL_FORM: NewAvatarInput = {
  gender: "Femenino",
  niche: "",
  location: "",
  bodyType: "fitness"
};

export function useAvatars({ showSuccess, showError }: UseAvatarsProps) {
  const [apiKey, setApiKey] = useState("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [avatars, setAvatars] = useState<AvatarIdentity[]>([]);
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>("");
  const [editingAvatar, setEditingAvatar] = useState<AvatarIdentity | null>(null);
  const [showCreateAvatarModal, setShowCreateAvatarModal] = useState(false);
  const [isEditingIdentity, setIsEditingIdentity] = useState(false);
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);

  const [newAvatarForm, setNewAvatarForm] = useState<NewAvatarInput>(NEW_AVATAR_INITIAL_FORM);

  // Derivar currentAvatar mediante useMemo.
  // Si estamos editando y existe editingAvatar, se usa esa versión temporal.
  // Si no, se busca en la lista de avatars según selectedAvatarId.
  const currentAvatar = useMemo(() => {
    if (isEditingIdentity && editingAvatar) {
      return editingAvatar;
    }
    return avatars.find(a => a.id === selectedAvatarId) || DEFAULT_AVATAR;
  }, [avatars, selectedAvatarId, isEditingIdentity, editingAvatar]);

  // Cargar datos iniciales
  useEffect(() => {
    // 1. Cargar API Key ofuscada de localStorage
    const savedKeyEncoded = localStorage.getItem("deepseek_avatar_api_key_enc");
    const savedKeyPlain = localStorage.getItem("deepseek_avatar_api_key"); // Legacy

    if (savedKeyEncoded) {
      setApiKey(decodeApiKey(savedKeyEncoded));
    } else if (savedKeyPlain && savedKeyPlain.trim() !== "" && savedKeyPlain !== "undefined") {
      setApiKey(savedKeyPlain);
      localStorage.setItem("deepseek_avatar_api_key_enc", encodeApiKey(savedKeyPlain));
      localStorage.removeItem("deepseek_avatar_api_key");
    } else {
      setApiKey("");
      setShowApiKeyInput(true);
    }

    // 2. Cargar Lista de Avatares desde la Base de Datos con Fallback a localStorage
    const fetchAvatars = async () => {
      try {
        const res = await fetch("/api/avatars");
        if (!res.ok) throw new Error("Error en respuesta de API");
        const data = await res.json();
        
        let loadedAvatars: AvatarIdentity[] = data.data || [];
        
        if (loadedAvatars.length === 0) {
          // Si la base de datos está vacía, sembramos con DEFAULT_AVATAR mediante POST
          const response = await fetch("/api/avatars", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(DEFAULT_AVATAR)
          });
          const seedData = await response.json();
          if (seedData.data) {
            loadedAvatars = [seedData.data];
          } else {
            loadedAvatars = [DEFAULT_AVATAR];
          }
        }

        setAvatars(loadedAvatars);

        // Cargar selección
        let savedSelectedId = localStorage.getItem("ugc_selected_avatar_id");
        if (savedSelectedId === "valeria_cruz" || savedSelectedId === "milena_basset") {
          savedSelectedId = "milena_reyes";
          localStorage.setItem("ugc_selected_avatar_id", "milena_reyes");
        }

        const currentId = savedSelectedId && loadedAvatars.some(a => a.id === savedSelectedId)
          ? savedSelectedId
          : loadedAvatars[0].id;

        setSelectedAvatarId(currentId);
        localStorage.setItem("ugc_selected_avatar_id", currentId);
      } catch (err) {
        console.error("Fallo al consultar API de avatares:", err);
        setAvatars([DEFAULT_AVATAR]);
        setSelectedAvatarId(DEFAULT_AVATAR.id);
      }
    };

    fetchAvatars();
  }, []);

  // Cambio de Avatar Seleccionado
  const handleSelectAvatarChange = useCallback((avatarId: string) => {
    setSelectedAvatarId(avatarId);
    localStorage.setItem("ugc_selected_avatar_id", avatarId);
    setIsEditingIdentity(false);
    setEditingAvatar(null);
  }, []);

  // Setter interceptado para setIsEditingIdentity
  const handleSetIsEditingIdentity = useCallback((val: boolean) => {
    setIsEditingIdentity(val);
    if (val) {
      // Buscar avatar fresco en el listado para inicializar la edición temporal
      setAvatars((prevAvatars) => {
        const found = prevAvatars.find(a => a.id === selectedAvatarId) || DEFAULT_AVATAR;
        setEditingAvatar({ ...found });
        return prevAvatars;
      });
    } else {
      setEditingAvatar(null);
    }
  }, [selectedAvatarId]);

  // Guardar API Key
  const handleSaveApiKey = useCallback(() => {
    const trimmed = apiKey.trim();
    if (!trimmed || trimmed === "undefined") {
      showError("Por favor, ingresa una API Key de DeepSeek válida.");
      return;
    }
    localStorage.setItem("deepseek_avatar_api_key_enc", encodeApiKey(trimmed));
    setApiKey(trimmed);
    setShowApiKeyInput(false);
    showSuccess("API Key guardada de forma segura (obfuscada localmente).");
  }, [apiKey, showError, showSuccess]);

  // Limpiar API Key
  const handleClearApiKey = useCallback(() => {
    localStorage.removeItem("deepseek_avatar_api_key_enc");
    localStorage.removeItem("deepseek_avatar_api_key");
    setApiKey("");
    setShowApiKeyInput(true);
    showSuccess("API Key eliminada del almacenamiento local.");
  }, [showSuccess]);

  // Subir foto de perfil
  const handlePhotoUpload = useCallback((file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      showError("La imagen no debe superar los 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;

      try {
        // Persistir en servidor
        const res = await fetch(`/api/avatars/${selectedAvatarId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ avatarImage: base64String })
        });
        
        if (!res.ok) throw new Error("Error en servidor");

        setAvatars((prevAvatars) => {
          const targetAvatar = prevAvatars.find(a => a.id === selectedAvatarId);
          if (!targetAvatar) return prevAvatars;
          const updatedAvatar = { ...targetAvatar, avatarImage: base64String };
          return prevAvatars.map(a => a.id === selectedAvatarId ? updatedAvatar : a);
        });
        showSuccess("Foto de avatar cargada con éxito.");
      } catch {
        showError("No se pudo guardar la imagen en la base de datos.");
      }
    };
    reader.readAsDataURL(file);
  }, [selectedAvatarId, showError, showSuccess]);

  // Eliminar foto de perfil
  const handleRemovePhoto = useCallback(async () => {
    try {
      const res = await fetch(`/api/avatars/${selectedAvatarId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarImage: null })
      });
      
      if (!res.ok) throw new Error("Error en servidor");

      setAvatars((prevAvatars) => {
        const targetAvatar = prevAvatars.find(a => a.id === selectedAvatarId);
        if (!targetAvatar) return prevAvatars;
        const updatedAvatar = { ...targetAvatar, avatarImage: undefined };
        return prevAvatars.map(a => a.id === selectedAvatarId ? updatedAvatar : a);
      });
      showSuccess("Foto de avatar eliminada.");
    } catch {
      showError("No se pudo actualizar la imagen en la base de datos.");
    }
  }, [selectedAvatarId, showError, showSuccess]);

  // Crear Avatar con Expansión e Inserción en DB
  const handleCreateAvatar = useCallback(async () => {
    const validation = newAvatarInputSchema.safeParse(newAvatarForm);
    if (!validation.success) {
      const errorMsg = validation.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
      showError(`Datos del formulario inválidos: ${errorMsg}`);
      return;
    }

    setIsGeneratingAvatar(true);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (apiKey) {
        headers["Authorization"] = `Bearer ${apiKey}`;
      }

      const response = await fetch("/api/avatar/expand", {
        method: "POST",
        headers,
        body: JSON.stringify({
          gender: newAvatarForm.gender,
          niche: newAvatarForm.niche,
          location: newAvatarForm.location,
          bodyType: newAvatarForm.bodyType,
          apiKey
        })
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || `Error en el servidor (${response.status})`);
      }

      const { expandedData } = data;
      const newId = `avatar_${generateId()}`;
      const newAvatar: AvatarIdentity = {
        id: newId,
        name: expandedData.nombre_completo,
        age: expandedData.edad,
        niche: newAvatarForm.niche,
        location: newAvatarForm.location,
        backstory: expandedData.backstory,
        monetizationProduct: "",
        monetizationLink: "",
        toneOfVoice: expandedData.audio_settings,
        language: "Español",
        characterDna: expandedData.character_dna,
        audioSettings: expandedData.audio_settings,
        videoSettings: expandedData.video_performance,
        gender: newAvatarForm.gender,
        bodyType: newAvatarForm.bodyType
      };

      // 1. Guardar en Base de Datos vía POST
      const dbResponse = await fetch("/api/avatars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAvatar)
      });
      const dbData = await dbResponse.json();
      if (!dbResponse.ok || dbData.error) {
        throw new Error(dbData.error || "Fallo al guardar el avatar en la base de datos.");
      }

      const savedAvatar = dbData.data;

      // 2. Actualizar estado y localStorage
      setAvatars((prevAvatars) => [...prevAvatars, savedAvatar]);

      setShowCreateAvatarModal(false);
      handleSelectAvatarChange(newId);
      showSuccess(`Avatar '${savedAvatar.name}' creado y expandido con éxito.`);
      setNewAvatarForm(NEW_AVATAR_INITIAL_FORM);
    } catch (error: unknown) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Error al expandir la identidad del nuevo avatar con IA.";
      showError(message);
    } finally {
      setIsGeneratingAvatar(false);
    }
  }, [newAvatarForm, apiKey, handleSelectAvatarChange, showSuccess, showError]);

  // Eliminar un Avatar en Servidor y Local
  const handleDeleteAvatarAction = useCallback(async (idToDelete: string) => {
    try {
      const res = await fetch(`/api/avatars/${idToDelete}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Fallo al eliminar de base de datos.");

      setAvatars((prevAvatars) => {
        if (prevAvatars.length <= 1) {
          return prevAvatars;
        }
        return prevAvatars.filter(a => a.id !== idToDelete);
      });

      // Si el id eliminado era el seleccionado, cambiar al fallback
      if (idToDelete === selectedAvatarId) {
        setAvatars((prevAvatars) => {
          if (prevAvatars.length > 0) {
            // Sincronizar selección asíncronamente
            setTimeout(() => handleSelectAvatarChange(prevAvatars[0].id), 0);
          }
          return prevAvatars;
        });
      } else {
        showSuccess("Avatar eliminado.");
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "No se pudo eliminar el avatar.";
      showError(message);
    }
  }, [selectedAvatarId, handleSelectAvatarChange, showError, showSuccess]);

  // Guardar cambios en la identidad (PUT /api/avatars/[id])
  const handleSaveIdentity = useCallback(async () => {
    if (!editingAvatar) return;

    const validation = avatarIdentitySchema.safeParse(editingAvatar);
    if (!validation.success) {
      const errorMsg = validation.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
      showError(`Datos del avatar inválidos: ${errorMsg}`);
      return;
    }

    try {
      const res = await fetch(`/api/avatars/${editingAvatar.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingAvatar)
      });

      if (!res.ok) throw new Error("Fallo al actualizar el avatar en base de datos.");

      setAvatars((prevAvatars) => {
        return prevAvatars.map(a => a.id === editingAvatar.id ? editingAvatar : a);
      });

      setIsEditingIdentity(false);
      setEditingAvatar(null);
      showSuccess("Identidad del avatar guardada.");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "No se pudo actualizar la identidad en la base de datos.";
      showError(message);
    }
  }, [editingAvatar, showError, showSuccess]);

  const updateCurrentAvatarField = useCallback((field: keyof AvatarIdentity, value: string | number | undefined | null) => {
    setEditingAvatar((prev) => prev ? { ...prev, [field]: value } : null);
  }, []);

  return {
    apiKey,
    setApiKey,
    showApiKeyInput,
    setShowApiKeyInput,
    showPassword,
    setShowPassword,
    avatars,
    selectedAvatarId,
    currentAvatar,
    isEditingIdentity,
    setIsEditingIdentity: handleSetIsEditingIdentity,
    showCreateAvatarModal,
    setShowCreateAvatarModal,
    newAvatarForm,
    setNewAvatarForm,
    handleSelectAvatarChange,
    handleSaveApiKey,
    handleClearApiKey,
    handlePhotoUpload,
    handleRemovePhoto,
    handleCreateAvatar,
    isGeneratingAvatar,
    handleDeleteAvatarAction,
    handleSaveIdentity,
    updateCurrentAvatarField
  };
}
