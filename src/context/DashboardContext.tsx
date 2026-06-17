"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useAvatars } from "@/hooks/useAvatars";
import { usePostIdeas } from "@/hooks/usePostIdeas";
import { useChatSimulation } from "@/hooks/useChatSimulation";
import { useClipboard } from "@/hooks/useClipboard";
import { isKeyValid } from "@/lib/utils";
import { AvatarIdentity, PostIdea, ChatSimulation } from "@/lib/types";
import { NewAvatarInput } from "@/components/modals/CreateAvatarModal";

// Definir interfaz del Contexto
interface DashboardContextType {
  // Notificaciones / Feedback
  successMsg: string | null;
  showSuccess: (msg: string) => void;
  errorMsg: string | null;
  showError: (msg: string) => void;

  // useAvatars Hook
  apiKey: string;
  setApiKey: (val: string) => void;
  showApiKeyInput: boolean;
  setShowApiKeyInput: (val: boolean) => void;
  showPassword: boolean;
  setShowPassword: (val: boolean) => void;
  avatars: AvatarIdentity[];
  selectedAvatarId: string;
  currentAvatar: AvatarIdentity;
  isEditingIdentity: boolean;
  setIsEditingIdentity: (val: boolean) => void;
  showCreateAvatarModal: boolean;
  setShowCreateAvatarModal: (val: boolean) => void;
  newAvatarForm: NewAvatarInput;
  setNewAvatarForm: React.Dispatch<React.SetStateAction<NewAvatarInput>>;
  handleSelectAvatarChange: (id: string) => void;
  handleSaveApiKey: () => void;
  handleClearApiKey: () => void;
  handlePhotoUpload: (file: File) => void;
  handleRemovePhoto: () => void;
  handleCreateAvatar: () => void;
  isGeneratingAvatar: boolean;
  handleDeleteAvatarAction: (id: string) => void;
  handleSaveIdentity: () => void;
  updateCurrentAvatarField: (field: keyof AvatarIdentity, value: string | number | undefined | null) => void;

  // usePostIdeas Hook
  postIdeas: PostIdea[];
  selectedIdea: PostIdea | null;
  setSelectedIdeaId: (val: string | null) => void;
  customContext: string;
  setCustomContext: (val: string) => void;
  audioLanguage: "es" | "en" | "silent" | "voiceover";
  setAudioLanguage: (val: "es" | "en" | "silent" | "voiceover") => void;
  postPromptInput: string;
  setPostPromptInput: (val: string) => void;
  captionOutput: string;
  promptOutput: string;
  generatingIdeas: boolean;
  generatingPrompt: boolean;
  generatingCaption: boolean;
  handleGenerateIdeas: () => void;
  handleGeneratePrompt: (idea: PostIdea) => void;
  handleGenerateCaption: (idea: PostIdea) => void;
  handleDeleteIdea: (ideaId: string) => void;
  handleClearAllIdeas: () => void;
  handleUpdateProductInfo: (name: string, image?: string | null) => void;
  handleSelectIdea: (idea: PostIdea) => void;
  handleUpdatePromptStyle: (ideaId: string, style: "ugc" | "editorial") => void;
  handleUpdateIdeaStatus: (ideaId: string, status: "draft" | "generated" | "published") => void;
  handleUpdateIdeaScenePrompt: (ideaId: string, newScenePrompt: string) => void;

  // useChatSimulation Hook
  simulations: ChatSimulation[];
  activeSimulationId: string | null;
  setActiveSimulationId: (val: string | null) => void;
  chatInput: string;
  setChatInput: (val: string) => void;
  isAvatarTyping: boolean;
  handleSendMessage: () => void;
  handleForceSendLink: () => void;
  handleCreateNewSim: (userName?: string, userBio?: string) => void;
  handleDeleteSimulation: (simId: string) => void;
  handleUpdateSimulationStatus: (simId: string, status: "active" | "converted" | "lost") => void;
  handleSaveSimulationNotes: (simId: string, notes: string) => void;

  // useClipboard Hook
  copiedText: string | null;
  copyToClipboard: (text: string, label: string) => void;

  // Setup Viral de Cuenta
  setupData: {
    usernames: string[];
    bios: string[];
    gridPlan: string[];
    seoTips: string[];
  } | null;
  generatingSetup: boolean;
  handleGetSetupData: () => void;
  handleResetSims: () => void;

  // Confirm Dialog Customizado
  confirmOpen: boolean;
  setConfirmOpen: (val: boolean) => void;
  confirmTitle: string;
  confirmMessage: string;
  confirmCallback: () => void;
  openConfirmModal: (title: string, message: string, onConfirm: () => void) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  // 1. Notificaciones
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const showSuccess = useCallback((msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  }, []);

  const showError = useCallback((msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 5000);
  }, []);

  // 2. Instanciar useAvatars Hook
  const avatarsHook = useAvatars({ showSuccess, showError });
  const { currentAvatar, apiKey, setShowApiKeyInput } = avatarsHook;

  // 3. Instanciar usePostIdeas Hook
  const plannerHook = usePostIdeas({
    currentAvatar,
    apiKey,
    showSuccess,
    showError
  });

  // 4. Instanciar useChatSimulation Hook
  const chatHook = useChatSimulation({
    currentAvatar,
    apiKey,
    showSuccess,
    showError
  });

  // 5. Instanciar useClipboard Hook
  const clipboardHook = useClipboard();

  // 6. Estado del Setup Viral de Perfil
  const [setupData, setSetupData] = useState<{
    usernames: string[];
    bios: string[];
    gridPlan: string[];
    seoTips: string[];
  } | null>(null);
  const [generatingSetup, setGeneratingSetup] = useState(false);

  // Cargar setup al cambiar de avatar desde la base de datos
  useEffect(() => {
    if (!currentAvatar?.id) return;
    
    const fetchSetup = async () => {
      try {
        const res = await fetch(`/api/setup/db?avatarId=${currentAvatar.id}`);
        const data = await res.json();
        if (res.ok && data.data) {
          setSetupData(data.data);
        } else {
          setSetupData(null);
        }
      } catch (e) {
        console.error("Error al obtener setup de la DB:", e);
        setSetupData(null);
      }
    };

    fetchSetup();
  }, [currentAvatar?.id]);

  // API Call: Setup Viral de Cuenta
  const handleGetSetupData = async () => {
    if (!isKeyValid(apiKey)) {
      showError("Por favor, ingresa tu API Key de DeepSeek arriba.");
      setShowApiKeyInput(true);
      return;
    }
    setGeneratingSetup(true);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (apiKey) {
        headers["Authorization"] = `Bearer ${apiKey}`;
      }

      const response = await fetch("/api/setup", {
        method: "POST",
        headers,
        body: JSON.stringify({ avatar: currentAvatar })
      });

      const data = await response.json();
      if (!response.ok || data.error) throw new Error(data.error);

      // Guardar en Base de Datos
      const dbRes = await fetch("/api/setup/db", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          avatarId: currentAvatar.id,
          usernames: data.setupData.usernames,
          bios: data.setupData.bios,
          gridPlan: data.setupData.gridPlan,
          seoTips: data.setupData.seoTips
        })
      });

      const dbData = await dbRes.json();
      if (!dbRes.ok || dbData.error) throw new Error(dbData.error || "Fallo al guardar el setup en base de datos.");

      setSetupData(dbData.data);
      showSuccess("Plan de setup viral generado y guardado en base de datos.");
    } catch (error: unknown) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Error al conectar con la API de setup.";
      showError(message);
    } finally {
      setGeneratingSetup(false);
    }
  };

  // Resetear simulaciones
  const handleResetSims = async () => {
    if (!currentAvatar?.id) return;
    try {
      const res = await fetch(`/api/chat/simulations?avatarId=${currentAvatar.id}`, {
        method: "DELETE"
      });
      if (!res.ok) throw new Error("Error en servidor.");
      
      showSuccess("Conversaciones reseteadas en la base de datos.");
      window.location.reload();
    } catch {
      showError("No se pudieron resetear las conversaciones en el servidor.");
    }
  };

  // 7. Confirm Dialog Customizado
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmCallback, setConfirmCallback] = useState<() => void>(() => {});

  const openConfirmModal = useCallback((title: string, message: string, onConfirm: () => void) => {
    setConfirmTitle(title);
    setConfirmMessage(message);
    setConfirmCallback(() => () => {
      onConfirm();
      setConfirmOpen(false);
    });
    setConfirmOpen(true);
  }, []);

  return (
    <DashboardContext.Provider
      value={{
        // Notificaciones
        successMsg,
        showSuccess,
        errorMsg,
        showError,

        // useAvatars
        ...avatarsHook,

        // usePostIdeas
        ...plannerHook,

        // useChatSimulation
        ...chatHook,

        // useClipboard
        ...clipboardHook,

        // Setup
        setupData,
        generatingSetup,
        handleGetSetupData,
        handleResetSims,

        // Confirm Dialog
        confirmOpen,
        setConfirmOpen,
        confirmTitle,
        confirmMessage,
        confirmCallback,
        openConfirmModal
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard debe usarse dentro de un DashboardProvider");
  }
  return context;
}
