import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4">
        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.96, opacity: 0 }}
          className="bg-white border border-slate-100 rounded-3xl p-6 shadow-2xl max-w-sm w-full font-sans"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-500 flex-shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed mb-6 font-medium">
            {message}
          </p>

          <div className="flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 cursor-pointer transition-all"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold cursor-pointer transition-all shadow-md shadow-red-500/10"
            >
              Confirmar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
