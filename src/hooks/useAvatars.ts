import { useState, useEffect, useCallback } from "react";
import { DEFAULT_AVATAR, AvatarIdentity } from "@/lib/db";
import { encodeApiKey, decodeApiKey, generateId } from "@/lib/utils";
import { NewAvatarInput } from "@/components/modals/CreateAvatarModal";

interface UseAvatarsProps {
  showSuccess: (msg: string) => void;
  showError: (msg: string) => void;
}

const NEW_AVATAR_INITIAL_FORM: NewAvatarInput = {
  gender: "Femenino",
  niche: "",
  location: ""
};

export function useAvatars({ showSuccess, showError }: UseAvatarsProps) {
  const [apiKey, setApiKey] = useState("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [avatars, setAvatars] = useState<AvatarIdentity[]>([]);
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>("");
  const [currentAvatar, setCurrentAvatar] = useState<AvatarIdentity>(DEFAULT_AVATAR);
  const [showCreateAvatarModal, setShowCreateAvatarModal] = useState(false);
  const [isEditingIdentity, setIsEditingIdentity] = useState(false);
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);

  const [newAvatarForm, setNewAvatarForm] = useState<NewAvatarInput>(NEW_AVATAR_INITIAL_FORM);

  // Cargar datos iniciales
  useEffect(() => {
    // 1. Cargar API Key ofuscada
    const savedKeyEncoded = localStorage.getItem("deepseek_avatar_api_key_enc");
    const savedKeyPlain = localStorage.getItem("deepseek_avatar_api_key"); // Legacy

    if (savedKeyEncoded) {
      setApiKey(decodeApiKey(savedKeyEncoded));
    } else if (savedKeyPlain && savedKeyPlain.trim() !== "" && savedKeyPlain !== "undefined") {
      // Migrar key a formato ofuscado y borrar el plano
      setApiKey(savedKeyPlain);
      localStorage.setItem("deepseek_avatar_api_key_enc", encodeApiKey(savedKeyPlain));
      localStorage.removeItem("deepseek_avatar_api_key");
    } else {
      setApiKey("");
      setShowApiKeyInput(true);
    }

    // 2. Cargar Lista de Avatares
    const savedAvatarsList = localStorage.getItem("ugc_multi_avatars_list");
    let loadedAvatars: AvatarIdentity[] = [];
    let needsSave = false;

    if (savedAvatarsList) {
      try {
        loadedAvatars = JSON.parse(savedAvatarsList);
        
        loadedAvatars = loadedAvatars.map(avatar => {
          const isOldMilenaReyes = avatar.id === "milena_reyes" && (!avatar.characterDna.includes("visible real pores") || avatar.niche !== "Fitness & Lifestyle");
          if (avatar.id === "milena_basset" || avatar.id === "valeria_cruz" || avatar.name === "Milena Basset" || avatar.name === "Valeria Cruz" || isOldMilenaReyes) {
            needsSave = true;
            const oldId = avatar.id;
            const newId = "milena_reyes";
            
            // Migrar ideas de posts
            const savedIdeas = localStorage.getItem(`ugc_post_ideas_${oldId}`);
            if (savedIdeas) {
              localStorage.setItem(`ugc_post_ideas_${newId}`, savedIdeas);
              localStorage.removeItem(`ugc_post_ideas_${oldId}`);
            }

            // Migrar chats/simulaciones
            const savedSims = localStorage.getItem(`ugc_simulations_${oldId}`);
            if (savedSims) {
              localStorage.setItem(`ugc_simulations_${newId}`, savedSims);
              localStorage.removeItem(`ugc_simulations_${oldId}`);
            }

            // Migrar setup de cuenta
            const savedSetup = localStorage.getItem(`ugc_setup_${oldId}`);
            if (savedSetup) {
              localStorage.setItem(`ugc_setup_${newId}`, savedSetup);
              localStorage.removeItem(`ugc_setup_${oldId}`);
            }

            return {
              ...DEFAULT_AVATAR,
              id: newId,
              avatarImage: avatar.avatarImage // Preservamos la foto cargada por el usuario
            };
          }
          return avatar;
        });

        // Si por alguna razón la lista quedó vacía tras un parse fallido
        if (loadedAvatars.length === 0) {
          loadedAvatars = [DEFAULT_AVATAR];
          needsSave = true;
        }
      } catch (e) {
        console.error("Error al parsear la lista de avatares:", e);
        loadedAvatars = [DEFAULT_AVATAR];
        needsSave = true;
      }
    } else {
      loadedAvatars = [DEFAULT_AVATAR];
      needsSave = true;
    }

    setAvatars(loadedAvatars);
    if (needsSave) {
      localStorage.setItem("ugc_multi_avatars_list", JSON.stringify(loadedAvatars));
    }

    // 3. Cargar Avatar seleccionado
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

    const foundAvatar = loadedAvatars.find(a => a.id === currentId) || loadedAvatars[0];
    setCurrentAvatar(foundAvatar);
  }, []);

  // Cambio de Avatar Seleccionado
  const handleSelectAvatarChange = useCallback((avatarId: string) => {
    setSelectedAvatarId(avatarId);
    localStorage.setItem("ugc_selected_avatar_id", avatarId);
    
    setAvatars((prevAvatars) => {
      const found = prevAvatars.find(a => a.id === avatarId) || prevAvatars[0];
      setCurrentAvatar(found);
      return prevAvatars;
    });

    setIsEditingIdentity(false);
  }, []);

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

  // Subir foto de perfil (base64)
  const handlePhotoUpload = useCallback((file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      showError("La imagen no debe superar los 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setCurrentAvatar((prev) => {
        const updatedAvatar = { ...prev, avatarImage: base64String };
        
        setAvatars((prevAvatars) => {
          const updatedList = prevAvatars.map(a => a.id === prev.id ? updatedAvatar : a);
          localStorage.setItem("ugc_multi_avatars_list", JSON.stringify(updatedList));
          return updatedList;
        });

        return updatedAvatar;
      });
      showSuccess("Foto de avatar cargada con éxito.");
    };
    reader.readAsDataURL(file);
  }, [showError, showSuccess]);

  // Eliminar foto de perfil
  const handleRemovePhoto = useCallback(() => {
    setCurrentAvatar((prev) => {
      const updatedAvatar = { ...prev, avatarImage: undefined };
      
      setAvatars((prevAvatars) => {
        const updatedList = prevAvatars.map(a => a.id === prev.id ? updatedAvatar : a);
        localStorage.setItem("ugc_multi_avatars_list", JSON.stringify(updatedList));
        return updatedList;
      });

      return updatedAvatar;
    });
    showSuccess("Foto de avatar eliminada.");
  }, [showSuccess]);

  // Crear Avatar Asíncrono con Expansión de Identidad por IA
  const handleCreateAvatar = useCallback(async () => {
    if (!newAvatarForm.niche.trim() || !newAvatarForm.location.trim()) {
      showError("Por favor, completa todos los parámetros del avatar.");
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
        toneOfVoice: expandedData.audio_settings, // Mapeamos a toneOfVoice también por compatibilidad
        language: "Español",
        characterDna: expandedData.character_dna,
        audioSettings: expandedData.audio_settings,
        videoSettings: expandedData.video_performance,
        gender: newAvatarForm.gender // Guardamos el género seleccionado
      };

      setAvatars((prevAvatars) => {
        const updatedList = [...prevAvatars, newAvatar];
        localStorage.setItem("ugc_multi_avatars_list", JSON.stringify(updatedList));
        return updatedList;
      });

      setShowCreateAvatarModal(false);
      handleSelectAvatarChange(newId);
      showSuccess(`Avatar '${newAvatar.name}' creado y expandido con éxito.`);
      setNewAvatarForm(NEW_AVATAR_INITIAL_FORM);
    } catch (error: any) {
      console.error(error);
      showError(error.message || "Error al expandir la identidad del nuevo avatar con IA.");
    } finally {
      setIsGeneratingAvatar(false);
    }
  }, [newAvatarForm, apiKey, handleSelectAvatarChange, showSuccess, showError]);

  // Eliminar un Avatar
  const handleDeleteAvatarAction = useCallback((idToDelete: string) => {
    let fallbackId = "";
    
    setAvatars((prevAvatars) => {
      if (prevAvatars.length <= 1) {
        showError("Debe haber al menos un avatar en el sistema.");
        return prevAvatars;
      }

      const updatedList = prevAvatars.filter(a => a.id !== idToDelete);
      localStorage.setItem("ugc_multi_avatars_list", JSON.stringify(updatedList));

      // Limpiar datos asociados
      localStorage.removeItem(`ugc_post_ideas_${idToDelete}`);
      localStorage.removeItem(`ugc_simulations_${idToDelete}`);
      localStorage.removeItem(`ugc_setup_${idToDelete}`);

      fallbackId = updatedList[0].id;
      return updatedList;
    });

    if (fallbackId) {
      if (idToDelete === selectedAvatarId) {
        handleSelectAvatarChange(fallbackId);
      } else {
        showSuccess("Avatar eliminado.");
      }
    }
  }, [selectedAvatarId, handleSelectAvatarChange, showError, showSuccess]);

  // Guardar cambios en la identidad
  const handleSaveIdentity = useCallback(() => {
    setCurrentAvatar((prev) => {
      setAvatars((prevAvatars) => {
        const updatedList = prevAvatars.map(a => a.id === prev.id ? prev : a);
        localStorage.setItem("ugc_multi_avatars_list", JSON.stringify(updatedList));
        return updatedList;
      });
      return prev;
    });
    setIsEditingIdentity(false);
    showSuccess("Identidad del avatar guardada.");
  }, [showSuccess]);

  const updateCurrentAvatarField = useCallback((field: keyof AvatarIdentity, value: any) => {
    setCurrentAvatar((prev) => ({ ...prev, [field]: value }));
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
    setIsEditingIdentity,
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
