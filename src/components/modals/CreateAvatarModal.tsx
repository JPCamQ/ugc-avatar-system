import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Sparkles, Loader2 } from "lucide-react";

export interface NewAvatarInput {
  gender: string;
  niche: string;
  location: string;
  bodyType: string;
}

interface CreateAvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  newAvatarForm: NewAvatarInput;
  setNewAvatarForm: React.Dispatch<React.SetStateAction<NewAvatarInput>>;
  handleCreateAvatar: () => void;
  isGenerating: boolean;
}

export function CreateAvatarModal({
  isOpen,
  onClose,
  newAvatarForm,
  setNewAvatarForm,
  handleCreateAvatar,
  isGenerating
}: CreateAvatarModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white border border-slate-100 rounded-3xl p-6 shadow-2xl max-w-md w-full max-h-[85vh] overflow-y-auto no-scrollbar font-sans"
        >
          {/* Cabecera del Modal */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                <UserPlus className="w-5 h-5 text-rose-500" />
                Crear Nuevo Avatar IA (UGC Studio)
              </h3>
              <p className="text-xs text-slate-500">Expansión de Identidad Sintética Automatizada.</p>
            </div>
            {!isGenerating && (
              <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-slate-700 font-bold text-xs cursor-pointer px-2 py-1"
              >
                Cerrar
              </button>
            )}
          </div>

          {/* Loader o Formulario */}
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="relative mb-6">
                <div className="absolute inset-0 rounded-full bg-rose-500/10 blur-xl animate-pulse" />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  className="relative z-10 p-3 bg-white rounded-full border border-slate-100 shadow-md flex items-center justify-center"
                >
                  <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
                </motion.div>
              </div>
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 justify-center mb-1">
                <Sparkles className="w-4 h-4 text-amber-500 animate-bounce" />
                Arquitecto de Identidades
              </h4>
              <p className="text-xs text-rose-500 font-bold mb-2 animate-pulse">Expandiendo Identidad Base...</p>
              <p className="text-[10px] text-slate-400 max-w-sm leading-relaxed">
                Antigravity LLM está estructurando la psicología, backstory técnico, DNA fotorrealista e instrucciones de voz y video. Esto puede tardar unos segundos.
              </p>
            </div>
          ) : (
            <div className="space-y-4 mb-6">
              {/* Variable 1: Género */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 font-semibold tracking-wide">
                  Género del Avatar
                </label>
                <select
                  value={newAvatarForm.gender}
                  onChange={(e) => setNewAvatarForm({ ...newAvatarForm, gender: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200/60 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-rose-450 font-medium transition-all"
                >
                  <option value="Femenino">Femenino (Mujer / Woman)</option>
                  <option value="Masculino">Masculino (Hombre / Man)</option>
                  <option value="Andrógino">Andrógino / Neutro</option>
                </select>
              </div>

              {/* Variable: Silueta / Tipo de Cuerpo */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 font-semibold tracking-wide">
                  Silueta / Tipo de Cuerpo
                </label>
                <select
                  value={newAvatarForm.bodyType}
                  onChange={(e) => setNewAvatarForm({ ...newAvatarForm, bodyType: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200/60 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-rose-450 font-medium transition-all"
                >
                  <option value="fitness">Atlético / Fitness (Tonificado)</option>
                  <option value="voluptuous">Curvilíneo / Voluptuoso (Sensual / Reloj de Arena)</option>
                  <option value="slim">Esbelto / Delgado</option>
                  <option value="plus">Curvas Plus / Voluminoso</option>
                </select>
              </div>

              {/* Variable 2: Nicho / Ángulo */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 font-semibold tracking-wide">
                  Nicho / Ángulo Comercial
                </label>
                <input
                  type="text"
                  value={newAvatarForm.niche}
                  onChange={(e) => setNewAvatarForm({ ...newAvatarForm, niche: e.target.value })}
                  placeholder="Ej. Fitness & Lifestyle, Finanzas Personales, Moda Sostenible"
                  className="w-full bg-slate-50 border border-slate-200/60 rounded-xl px-3.5 py-2.5 text-xs text-slate-850 focus:outline-none focus:border-rose-450 font-medium transition-all"
                />
              </div>

              {/* Variable 3: Raza - Etnia / Ubicación */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 font-semibold tracking-wide">
                  Raza - Etnia / Ubicación del Avatar
                </label>
                <input
                  type="text"
                  value={newAvatarForm.location}
                  onChange={(e) => setNewAvatarForm({ ...newAvatarForm, location: e.target.value })}
                  placeholder="Ej. Latina - Miami, FL o Europea - Milan, Italia"
                  className="w-full bg-slate-50 border border-slate-200/60 rounded-xl px-3.5 py-2.5 text-xs text-slate-850 focus:outline-none focus:border-rose-450 font-medium transition-all"
                />
              </div>

              {/* Nota Informativa */}
              <div className="p-3 bg-rose-50/40 border border-rose-100 rounded-2xl flex gap-2">
                <Sparkles className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Al presionar "Crear e Iniciar", la inteligencia artificial estructurará automáticamente un perfil detallado de dolores pasados, un DNA fotorrealista en inglés y configuraciones de audio y video.
                </p>
              </div>

              {/* Botones de acción */}
              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-550 hover:bg-slate-100 cursor-pointer transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleCreateAvatar}
                  disabled={!newAvatarForm.niche.trim() || !newAvatarForm.location.trim()}
                  className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold cursor-pointer shadow-md shadow-rose-500/10 transition-all flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                  Crear e Iniciar
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
