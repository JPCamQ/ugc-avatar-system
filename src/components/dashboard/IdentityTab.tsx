import React from "react";
import { User, Award, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useDashboard } from "@/context/DashboardContext";
import { BioForm } from "./identity/BioForm";
import { TechnicalDnaCard } from "./identity/TechnicalDnaCard";
import { getBasePortraitPrompt } from "@/lib/utils";

export function IdentityTab() {
  const {
    currentAvatar,
    isEditingIdentity,
    setIsEditingIdentity,
    handleSaveIdentity,
    handleDeleteAvatarAction,
    avatars,
    openConfirmModal,
    copiedText,
    copyToClipboard
  } = useDashboard();

  const onDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    openConfirmModal(
      "Eliminar Avatar",
      `¿Estás seguro de que deseas eliminar a '${currentAvatar.name}' y todos sus datos asociados? Esta acción no se puede deshacer.`,
      () => handleDeleteAvatarAction(currentAvatar.id)
    );
  };

  const basePortraitPrompt = getBasePortraitPrompt(currentAvatar);

  return (
    <motion.div
      key="identity"
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="flex flex-col gap-6 h-full"
    >
      <div className="bg-white/70 backdrop-blur-md border border-white/60 rounded-3xl p-6 sm:p-8 flex-1 flex flex-col justify-between shadow-lg shadow-slate-100/50">
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-rose-500" />
                Configuración del Cerebro de la Modelo AI
              </h2>
              <p className="text-xs text-slate-500">Configura la psicología, tono de voz y el DNA del avatar seleccionado.</p>
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto justify-end">
              {avatars.length > 1 && currentAvatar.id !== "milena_reyes" && (
                <button
                  type="button"
                  onClick={onDeleteClick}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 border border-red-100 transition-all cursor-pointer"
                >
                  Eliminar Cliente
                </button>
              )}
              {!isEditingIdentity ? (
                <button
                  type="button"
                  onClick={() => setIsEditingIdentity(true)}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-slate-100 border border-slate-200/50 hover:bg-slate-200 text-slate-800 transition-all cursor-pointer"
                >
                  Editar Perfil
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setIsEditingIdentity(false)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveIdentity}
                    className="px-4 py-1.5 rounded-xl text-xs font-bold bg-rose-500 text-white hover:bg-rose-600 transition-all cursor-pointer"
                  >
                    Guardar Cambios
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Formulario e Información de DNA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Lado Izquierdo: Biográficos */}
            <BioForm />

            {/* Lado Derecho: DNA y Voz para Flow */}
            <TechnicalDnaCard />

            {/* Retrato de ADN (Fijación Base) - Ancho Completo */}
            <div className="md:col-span-2 mt-2 border-t border-slate-100 pt-6">
              <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      Prompt Maestro de Retrato de ADN (Fijación Base)
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                      <strong>Acción Inicial Obligatoria:</strong> Ejecuta este prompt la primera vez para estabilizar los vectores faciales y de piel de {currentAvatar.name}, sirviendo como la imagen de referencia inmutable.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(basePortraitPrompt, "portrait")}
                    className="w-full sm:w-auto text-[10px] text-rose-500 hover:text-rose-600 flex items-center justify-center gap-1 cursor-pointer font-bold bg-white border border-slate-200 px-3.5 py-1.5 rounded-xl shadow-sm hover:shadow transition-all flex-shrink-0"
                  >
                    {copiedText === "portrait" ? "¡Copiado!" : "Copiar Prompt Maestro"}
                  </button>
                </div>
                <pre className="w-full bg-slate-900 text-slate-200 rounded-xl p-4 text-[10px] font-mono whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto no-scrollbar border border-slate-850">
                  {basePortraitPrompt}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Sección Informativa */}
        <div className="mt-6 p-4 rounded-2xl border border-rose-100 bg-rose-50/30 flex items-center gap-3">
          <Award className="w-8 h-8 text-rose-500 flex-shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-slate-800">Marca Personal e Influencer UGC Consistente</h4>
            <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
              Este panel resguarda la información del avatar. El Character DNA, la configuración de voz y de video deben copiarse directamente en la plataforma **Flow de Gemini** para mantener la consistencia física y auditiva en cada creación de post o video.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
