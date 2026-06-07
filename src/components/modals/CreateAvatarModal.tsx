import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus } from "lucide-react";
import { AvatarIdentity } from "@/lib/db";

interface CreateAvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  newAvatarForm: Omit<AvatarIdentity, "id">;
  setNewAvatarForm: React.Dispatch<React.SetStateAction<Omit<AvatarIdentity, "id">>>;
  handleCreateAvatar: () => void;
}

export function CreateAvatarModal({
  isOpen,
  onClose,
  newAvatarForm,
  setNewAvatarForm,
  handleCreateAvatar
}: CreateAvatarModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white border border-slate-100 rounded-3xl p-6 shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto no-scrollbar font-sans"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                <UserPlus className="w-5 h-5 text-rose-500" />
                Crear Avatar de Cliente (Servicio de Agencia)
              </h3>
              <p className="text-xs text-slate-500">Configura la identidad base para un nuevo influencer de IA.</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 font-bold text-xs cursor-pointer px-2 py-1"
            >
              Cerrar
            </button>
          </div>

          {/* Formulario Modal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 font-semibold">Nombre Completo</label>
              <input
                type="text"
                value={newAvatarForm.name}
                onChange={(e) => setNewAvatarForm({ ...newAvatarForm, name: e.target.value })}
                placeholder="Ej. Milena Basset"
                className="w-full bg-slate-50 border border-slate-150 rounded-xl px-3.5 py-2 text-xs text-slate-850 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 font-semibold">Edad</label>
                <input
                  type="number"
                  value={newAvatarForm.age}
                  onChange={(e) => setNewAvatarForm({ ...newAvatarForm, age: parseInt(e.target.value) || 25 })}
                  className="w-full bg-slate-50 border border-slate-150 rounded-xl px-3.5 py-2 text-xs text-slate-850 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 font-semibold">Ubicación</label>
                <input
                  type="text"
                  value={newAvatarForm.location}
                  onChange={(e) => setNewAvatarForm({ ...newAvatarForm, location: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-150 rounded-xl px-3.5 py-2 text-xs text-slate-850 focus:outline-none"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 font-semibold">{"Historia del Personaje / Backstory"}</label>
              <textarea
                value={newAvatarForm.backstory}
                onChange={(e) => setNewAvatarForm({ ...newAvatarForm, backstory: e.target.value })}
                placeholder="Describe los dolores pasados, la transformación y el objetivo del avatar..."
                rows={3}
                className="w-full bg-slate-50 border border-slate-150 rounded-xl px-3.5 py-2 text-xs text-slate-850 focus:outline-none resize-none leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 font-semibold">{"Nicho / Ángulo"}</label>
              <input
                type="text"
                value={newAvatarForm.niche}
                onChange={(e) => setNewAvatarForm({ ...newAvatarForm, niche: e.target.value })}
                className="w-full bg-slate-50 border border-slate-150 rounded-xl px-3.5 py-2 text-xs text-slate-850 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 font-semibold">Prod. Monetizar</label>
                <input
                  type="text"
                  value={newAvatarForm.monetizationProduct}
                  onChange={(e) => setNewAvatarForm({ ...newAvatarForm, monetizationProduct: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-150 rounded-xl px-3.5 py-2 text-xs text-slate-850 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 font-semibold">Link Afiliado</label>
                <input
                  type="text"
                  value={newAvatarForm.monetizationLink}
                  onChange={(e) => setNewAvatarForm({ ...newAvatarForm, monetizationLink: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-150 rounded-xl px-3.5 py-2 text-xs text-slate-850 focus:outline-none"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 font-semibold">Character DNA (Físico en Flow)</label>
              <textarea
                value={newAvatarForm.characterDna}
                onChange={(e) => setNewAvatarForm({ ...newAvatarForm, characterDna: e.target.value })}
                rows={2}
                className="w-full bg-slate-50 border border-slate-150 rounded-xl px-3.5 py-2 text-xs text-slate-700 font-mono focus:outline-none resize-none leading-relaxed"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleCreateAvatar}
              className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold cursor-pointer shadow-md shadow-rose-500/10"
            >
              Crear e Iniciar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
