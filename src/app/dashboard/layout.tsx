"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { DashboardProvider, useDashboard } from "@/context/DashboardContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AvatarSidebar } from "@/components/dashboard/AvatarSidebar";
import { CreateAvatarModal } from "@/components/modals/CreateAvatarModal";
import { ConfirmDialog } from "@/components/modals/ConfirmDialog";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </DashboardProvider>
  );
}

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const {
    // Alertas
    successMsg,
    errorMsg,
    showError,

    // Header & Selector
    selectedAvatarId,
    avatars,
    handleSelectAvatarChange,
    setShowCreateAvatarModal,
    apiKey,
    setApiKey,
    showApiKeyInput,
    setShowApiKeyInput,
    showPassword,
    setShowPassword,
    handleSaveApiKey,
    handleClearApiKey,

    // Photo Upload
    handlePhotoUpload,
    handleRemovePhoto,

    // Modales
    showCreateAvatarModal,
    newAvatarForm,
    setNewAvatarForm,
    handleCreateAvatar,
    isGeneratingAvatar,

    // Confirm
    confirmOpen,
    setConfirmOpen,
    confirmTitle,
    confirmMessage,
    confirmCallback
  } = useDashboard();

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
      <Header />

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
        <AvatarSidebar />

        {/* Sección central dinámica de páginas hijas */}
        <section className="lg:col-span-3 flex flex-col justify-stretch">
          <AnimatePresence mode="wait">
            <motion.div
              key={null} // Permite animaciones generales
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className="h-full flex flex-col"
            >
              {children}
            </motion.div>
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
