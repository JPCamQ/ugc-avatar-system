import React from "react";
import { User, Award } from "lucide-react";
import { motion } from "framer-motion";
import { AvatarIdentity } from "@/lib/db";

interface IdentityTabProps {
  currentAvatar: AvatarIdentity;
  isEditingIdentity: boolean;
  setIsEditingIdentity: (val: boolean) => void;
  updateCurrentAvatarField: (field: keyof AvatarIdentity, value: any) => void;
  handleSaveIdentity: () => void;
  handleDeleteAvatarAction: (id: string) => void;
  copiedText: string | null;
  copyToClipboard: (text: string, label: string) => void;
  avatarsLength: number;
  openConfirmModal: (title: string, message: string, onConfirm: () => void) => void;
}

export function IdentityTab({
  currentAvatar,
  isEditingIdentity,
  setIsEditingIdentity,
  updateCurrentAvatarField,
  handleSaveIdentity,
  handleDeleteAvatarAction,
  copiedText,
  copyToClipboard,
  avatarsLength,
  openConfirmModal
}: IdentityTabProps) {

  const onDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    openConfirmModal(
      "Eliminar Avatar",
      `¿Estás seguro de que deseas eliminar a '${currentAvatar.name}' y todos sus datos asociados? Esta acción no se puede deshacer.`,
      () => handleDeleteAvatarAction(currentAvatar.id)
    );
  };

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
              {avatarsLength > 1 && currentAvatar.id !== "milena_reyes" && (
                <button
                  onClick={onDeleteClick}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 border border-red-100 transition-all cursor-pointer"
                >
                  Eliminar Cliente
                </button>
              )}
              {!isEditingIdentity ? (
                <button
                  onClick={() => setIsEditingIdentity(true)}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-slate-100 border border-slate-200/50 hover:bg-slate-200 text-slate-800 transition-all cursor-pointer"
                >
                  Editar Perfil
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setIsEditingIdentity(false);
                      // Cargar datos originales del localStorage
                      const savedList = localStorage.getItem("ugc_multi_avatars_list");
                      if (savedList) {
                        try {
                          const list = JSON.parse(savedList);
                          const found = list.find((a: any) => a.id === currentAvatar.id);
                          if (found) {
                            Object.keys(found).forEach((key) => {
                              updateCurrentAvatarField(key as keyof AvatarIdentity, found[key]);
                            });
                          }
                        } catch (e) {
                          console.error(e);
                        }
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveIdentity}
                    className="px-4 py-1.5 rounded-xl text-xs font-bold bg-rose-500 text-white hover:bg-rose-600 transition-all cursor-pointer"
                  >
                    Guardar Cambios
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Formulario */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Lado Izquierdo: Biográficos */}
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5 font-semibold">Nombre de la Modelo</label>
                <input
                  type="text"
                  value={currentAvatar.name}
                  onChange={(e) => updateCurrentAvatarField("name", e.target.value)}
                  disabled={!isEditingIdentity}
                  className="w-full bg-slate-50 border border-slate-100 focus:border-rose-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none disabled:opacity-60 transition-all font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5 font-semibold">Edad</label>
                  <input
                    type="number"
                    value={currentAvatar.age}
                    onChange={(e) => updateCurrentAvatarField("age", parseInt(e.target.value) || 25)}
                    disabled={!isEditingIdentity}
                    className="w-full bg-slate-50 border border-slate-100 focus:border-rose-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none disabled:opacity-60 transition-all font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5 font-semibold">{"Nicho / Especialidad"}</label>
                  <input
                    type="text"
                    value={currentAvatar.niche}
                    onChange={(e) => updateCurrentAvatarField("niche", e.target.value)}
                    disabled={!isEditingIdentity}
                    className="w-full bg-slate-50 border border-slate-100 focus:border-rose-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none disabled:opacity-60 transition-all font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5 font-semibold">{"Historia de Origen / Backstory"}</label>
                <textarea
                  value={currentAvatar.backstory}
                  onChange={(e) => updateCurrentAvatarField("backstory", e.target.value)}
                  disabled={!isEditingIdentity}
                  rows={4}
                  className="w-full bg-slate-50 border border-slate-100 focus:border-rose-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none disabled:opacity-60 resize-none leading-relaxed transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5 font-semibold">Producto de Monetización</label>
                  <input
                    type="text"
                    value={currentAvatar.monetizationProduct}
                    onChange={(e) => updateCurrentAvatarField("monetizationProduct", e.target.value)}
                    disabled={!isEditingIdentity}
                    className="w-full bg-slate-50 border border-slate-100 focus:border-rose-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none disabled:opacity-60 transition-all font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5 font-semibold">Link de Destino</label>
                  <input
                    type="text"
                    value={currentAvatar.monetizationLink}
                    onChange={(e) => updateCurrentAvatarField("monetizationLink", e.target.value)}
                    disabled={!isEditingIdentity}
                    className="w-full bg-slate-50 border border-slate-100 focus:border-rose-300 rounded-xl px-4 py-2.5 text-xs text-amber-600 font-semibold focus:outline-none disabled:opacity-60 transition-all font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Lado Derecho: DNA y Voz para Flow */}
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-rose-500 uppercase tracking-wider flex items-center justify-between font-semibold">
                  <span>Character DNA (Físico Fijo en Flow)</span>
                  <button 
                    type="button"
                    onClick={() => copyToClipboard(currentAvatar.characterDna, "dna")}
                    className="text-[9px] text-slate-400 hover:text-slate-800 flex items-center gap-0.5 cursor-pointer font-semibold"
                  >
                    {copiedText === "dna" ? "¡Copiado!" : "Copiar"}
                  </button>
                </label>
                <textarea
                  value={currentAvatar.characterDna}
                  onChange={(e) => updateCurrentAvatarField("characterDna", e.target.value)}
                  disabled={!isEditingIdentity}
                  rows={3}
                  className="w-full bg-slate-100 border border-slate-200/50 focus:border-rose-300 rounded-xl px-4 py-2 text-xs text-slate-700 font-mono focus:outline-none disabled:opacity-65 resize-none leading-relaxed transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-amber-600 uppercase tracking-wider flex items-center justify-between font-semibold">
                  <span>Audio Settings (Voz en Flow)</span>
                  <button 
                    type="button"
                    onClick={() => copyToClipboard(currentAvatar.audioSettings, "audio")}
                    className="text-[9px] text-slate-400 hover:text-slate-800 flex items-center gap-0.5 cursor-pointer font-semibold"
                  >
                    {copiedText === "audio" ? "¡Copiado!" : "Copiar"}
                  </button>
                </label>
                <textarea
                  value={currentAvatar.audioSettings}
                  onChange={(e) => updateCurrentAvatarField("audioSettings", e.target.value)}
                  disabled={!isEditingIdentity}
                  rows={3}
                  className="w-full bg-slate-100 border border-slate-200/50 focus:border-rose-300 rounded-xl px-4 py-2 text-xs text-slate-700 font-mono focus:outline-none disabled:opacity-65 resize-none leading-relaxed transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-yellow-600 uppercase tracking-wider flex items-center justify-between font-semibold">
                  <span>Video Performance (Gestos en Flow)</span>
                  <button 
                    type="button"
                    onClick={() => copyToClipboard(currentAvatar.videoSettings, "video")}
                    className="text-[9px] text-slate-400 hover:text-slate-800 flex items-center gap-0.5 cursor-pointer font-semibold"
                  >
                    {copiedText === "video" ? "¡Copiado!" : "Copiar"}
                  </button>
                </label>
                <textarea
                  value={currentAvatar.videoSettings}
                  onChange={(e) => updateCurrentAvatarField("videoSettings", e.target.value)}
                  disabled={!isEditingIdentity}
                  rows={3}
                  className="w-full bg-slate-100 border border-slate-200/50 focus:border-rose-300 rounded-xl px-4 py-2 text-xs text-slate-700 font-mono focus:outline-none disabled:opacity-65 resize-none leading-relaxed transition-all"
                />
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
