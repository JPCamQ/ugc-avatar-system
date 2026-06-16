"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";

// Hooks personalizados
import { useAvatars } from "@/hooks/useAvatars";
import { usePostIdeas } from "@/hooks/usePostIdeas";
import { useChatSimulation } from "@/hooks/useChatSimulation";
import { useClipboard } from "@/hooks/useClipboard";

// Componentes estructurales y de pestañas
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AvatarSidebar } from "@/components/dashboard/AvatarSidebar";
import { IdentityTab } from "@/components/dashboard/IdentityTab";
import { SetupTab } from "@/components/dashboard/SetupTab";
import { PlannerTab } from "@/components/dashboard/PlannerTab";
import { ChatTab } from "@/components/dashboard/ChatTab";
import { MetricsTab } from "@/components/dashboard/MetricsTab";
import { ShowcaseTab } from "@/components/dashboard/ShowcaseTab";

// Modales
import { CreateAvatarModal } from "@/components/modals/CreateAvatarModal";
import { ConfirmDialog } from "@/components/modals/ConfirmDialog";

// Utils
import { isKeyValid } from "@/lib/utils";

export default function Page() {
  // Pestaña Activa
  const [activeTab, setActiveTab] = useState<"identity" | "setup" | "planner" | "chat" | "metrics" | "showcase">("identity");

  // Alertas / Mensajes de Feedback
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

  // Hook 1: Gestión de Avatares y API Key
  const avatarsHook = useAvatars({ showSuccess, showError });
  const {
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
  } = avatarsHook;

  // Hook 2: Planificador de Contenido
  const plannerHook = usePostIdeas({
    currentAvatar,
    apiKey,
    showSuccess,
    showError
  });
  const {
    postIdeas,
    selectedIdea,
    setSelectedIdea,
    customContext,
    setCustomContext,
    audioLanguage,
    setAudioLanguage,
    postPromptInput,
    setPostPromptInput,
    captionOutput,
    promptOutput,
    generatingIdeas,
    generatingPrompt,
    generatingCaption,
    handleGenerateIdeas,
    handleGeneratePrompt,
    handleGenerateCaption,
    handleDeleteIdea,
    handleClearAllIdeas,
    handleUpdateProductInfo,
    handleSelectIdea,
    handleUpdateIdeaStatus,
    handleUpdatePromptStyle
  } = plannerHook;

  // Hook 3: Simulador de Chats DMs
  const chatHook = useChatSimulation({
    currentAvatar,
    apiKey,
    showSuccess,
    showError
  });
  const {
    simulations,
    activeSimulationId,
    setActiveSimulationId,
    chatInput,
    setChatInput,
    isAvatarTyping,
    handleSendMessage,
    handleForceSendLink,
    handleCreateNewSim,
    handleDeleteSimulation,
    handleUpdateSimulationStatus,
    handleSaveSimulationNotes
  } = chatHook;

  // Hook 4: Clipboard Copiado rápido con fallback
  const { copiedText, copyToClipboard } = useClipboard();

  // Estado del Setup Viral de Perfil
  const [setupData, setSetupData] = useState<{
    usernames: string[];
    bios: string[];
    gridPlan: string[];
    seoTips: string[];
  } | null>(null);
  const [generatingSetup, setGeneratingSetup] = useState(false);

  // Cargar setup al cambiar de avatar
  useEffect(() => {
    if (!currentAvatar?.id) return;
    const savedSetup = localStorage.getItem(`ugc_setup_${currentAvatar.id}`);
    if (savedSetup) {
      try {
        setSetupData(JSON.parse(savedSetup));
      } catch (e) {
        console.error(e);
        setSetupData(null);
      }
    } else {
      setSetupData(null);
    }
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

      setSetupData(data.setupData);
      localStorage.setItem(`ugc_setup_${currentAvatar.id}`, JSON.stringify(data.setupData));
      showSuccess("Plan de setup viral generado con DeepSeek.");
    } catch (error: any) {
      console.error(error);
      showError(error.message || "Error al conectar con la API de setup.");
    } finally {
      setGeneratingSetup(false);
    }
  };

  // Resetear simulaciones desde el layout central
  const handleResetSims = () => {
    localStorage.removeItem(`ugc_simulations_${currentAvatar.id}`);
    showSuccess("Conversaciones reseteadas.");
    // Forzar recarga en el hook re-leyendo o reiniciando
    window.location.reload(); // Recarga simple para limpiar estados en memoria de forma robusta
  };

  // Estado del Confirm Dialog Customizado
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
    <div className="relative min-h-screen bg-[#fafafc] text-slate-800 overflow-x-hidden flex flex-col justify-between font-sans">
      
      {/* Fondos decorativos premium */}
      <div className="absolute top-[-10%] left-[-15%] w-[600px] h-[600px] rounded-full bg-rose-200/20 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-15%] w-[700px] h-[700px] rounded-full bg-amber-200/20 blur-[150px] pointer-events-none" />

      {/* Alerta de éxito flotante */}
      <AnimatePresence>
        {successMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-2xl bg-slate-900 text-white text-xs font-bold shadow-xl flex items-center gap-2 border border-slate-800"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            {successMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cabecera */}
      <Header
        selectedAvatarId={selectedAvatarId}
        avatars={avatars}
        handleSelectAvatarChange={handleSelectAvatarChange}
        setShowCreateAvatarModal={setShowCreateAvatarModal}
        apiKey={apiKey}
        showApiKeyInput={showApiKeyInput}
        setShowApiKeyInput={setShowApiKeyInput}
      />

      {/* Panel de Configuración de API Key de DeepSeek */}
      <AnimatePresence>
        {showApiKeyInput && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative z-20 max-w-xl mx-auto w-full px-6 mt-4 font-sans"
          >
            <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xl shadow-slate-200/50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-2">
                <Check className="w-4 h-4 text-amber-500" />
                Configurar DeepSeek API Key
              </h3>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed font-semibold">
                Ingresa tu clave de API de DeepSeek para habilitar el planificador de contenido, el setup viral de perfiles y los chats de DMs simulados.
              </p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="w-full bg-slate-50 border border-slate-150 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-rose-500 font-semibold"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-xs font-bold text-slate-500 hover:text-slate-850 cursor-pointer font-bold"
                  >
                    {showPassword ? "Ocultar" : "Mostrar"}
                  </button>
                </div>
                <button
                  onClick={handleSaveApiKey}
                  className="px-4 py-2.5 rounded-xl bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 transition-all cursor-pointer shadow-lg shadow-rose-500/10 font-bold"
                >
                  Guardar
                </button>
                {apiKey && (
                  <button
                    onClick={handleClearApiKey}
                    className="px-3 py-2.5 rounded-xl bg-slate-100 text-slate-500 text-sm font-semibold hover:bg-slate-200 transition-all cursor-pointer font-bold"
                  >
                    Limpiar
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Banner de errores global */}
      {errorMsg && (
        <div className="max-w-[1600px] mx-auto w-full px-6 mt-4 font-sans">
          <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-500 text-xs sm:text-sm font-semibold">
            {errorMsg}
          </div>
        </div>
      )}

      {/* Cuerpo principal del Dashboard */}
      <main className="relative z-10 flex-1 max-w-[1600px] mx-auto w-full px-6 py-6 grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
        
        {/* Sidebar izquierdo de perfil y navegación */}
        <AvatarSidebar
          currentAvatar={currentAvatar}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          handlePhotoUpload={handlePhotoUpload}
          handleRemovePhoto={handleRemovePhoto}
          avatarsLength={avatars.length}
          showError={showError}
        />

        {/* Sección central dinámica de pestañas */}
        <section className="lg:col-span-3 flex flex-col justify-stretch">
          <AnimatePresence mode="wait">
            
            {activeTab === "identity" && (
              <IdentityTab
                currentAvatar={currentAvatar}
                isEditingIdentity={isEditingIdentity}
                setIsEditingIdentity={setIsEditingIdentity}
                updateCurrentAvatarField={updateCurrentAvatarField}
                handleSaveIdentity={handleSaveIdentity}
                handleDeleteAvatarAction={handleDeleteAvatarAction}
                copiedText={copiedText}
                copyToClipboard={copyToClipboard}
                avatarsLength={avatars.length}
                openConfirmModal={openConfirmModal}
              />
            )}

            {activeTab === "setup" && (
              <SetupTab
                currentAvatar={currentAvatar}
                setupData={setupData}
                generatingSetup={generatingSetup}
                handleGetSetupData={handleGetSetupData}
                copiedText={copiedText}
                copyToClipboard={copyToClipboard}
              />
            )}

            {activeTab === "planner" && (
              <PlannerTab
                currentAvatar={currentAvatar}
                postIdeas={postIdeas}
                selectedIdea={selectedIdea}
                customContext={customContext}
                setCustomContext={setCustomContext}
                audioLanguage={audioLanguage}
                setAudioLanguage={setAudioLanguage}
                postPromptInput={postPromptInput}
                setPostPromptInput={setPostPromptInput}
                captionOutput={captionOutput}
                promptOutput={promptOutput}
                generatingIdeas={generatingIdeas}
                generatingPrompt={generatingPrompt}
                generatingCaption={generatingCaption}
                handleGenerateIdeas={handleGenerateIdeas}
                handleGeneratePrompt={handleGeneratePrompt}
                handleGenerateCaption={handleGenerateCaption}
                handleDeleteIdea={handleDeleteIdea}
                handleClearAllIdeas={handleClearAllIdeas}
                handleUpdateProductInfo={handleUpdateProductInfo}
                handleSelectIdea={handleSelectIdea}
                handleUpdatePromptStyle={handleUpdatePromptStyle}
                copiedText={copiedText}
                copyToClipboard={copyToClipboard}
                showError={showError}
              />
            )}

            {activeTab === "chat" && (
              <ChatTab
                currentAvatar={currentAvatar}
                simulations={simulations}
                activeSimulationId={activeSimulationId}
                setActiveSimulationId={setActiveSimulationId}
                chatInput={chatInput}
                setChatInput={setChatInput}
                isAvatarTyping={isAvatarTyping}
                handleSendMessage={handleSendMessage}
                handleForceSendLink={handleForceSendLink}
                handleCreateNewSim={handleCreateNewSim}
                handleDeleteSimulation={handleDeleteSimulation}
                handleResetSims={handleResetSims}
              />
            )}

            {activeTab === "metrics" && (
              <MetricsTab
                currentAvatar={currentAvatar}
                showSuccess={showSuccess}
                showError={showError}
              />
            )}

            {activeTab === "showcase" && (
              <ShowcaseTab
                apiKey={apiKey}
                copiedText={copiedText}
                copyToClipboard={copyToClipboard}
                showError={showError}
                showSuccess={showSuccess}
              />
            )}

          </AnimatePresence>
        </section>
      </main>

      {/* Pie de página */}
      <Footer />

      {/* Modal interactivo de creación de avatares */}
      <CreateAvatarModal
        isOpen={showCreateAvatarModal}
        onClose={() => setShowCreateAvatarModal(false)}
        newAvatarForm={newAvatarForm}
        setNewAvatarForm={setNewAvatarForm}
        handleCreateAvatar={handleCreateAvatar}
        isGenerating={isGeneratingAvatar}
      />

      {/* Confirm Dialog customizado */}
      <ConfirmDialog
        isOpen={confirmOpen}
        title={confirmTitle}
        message={confirmMessage}
        onConfirm={confirmCallback}
        onCancel={() => setConfirmOpen(false)}
      />

    </div>
  );
}
