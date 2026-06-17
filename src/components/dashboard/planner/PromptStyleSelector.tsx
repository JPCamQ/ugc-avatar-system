import React from "react";
import { useDashboard } from "@/context/DashboardContext";

export function PromptStyleSelector() {
  const { selectedIdea, handleUpdatePromptStyle } = useDashboard();

  if (!selectedIdea || selectedIdea.type === "flyer") return null;

  const style = selectedIdea.promptStyle || "ugc";

  return (
    <div className="mb-4 p-4 bg-slate-50/70 border border-slate-200/40 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div>
        <span className="text-xs font-bold text-rose-500 uppercase tracking-wide block font-semibold">
          Estilo de Fotografía
        </span>
        <p className="text-[10px] text-slate-400 mt-0.5 font-semibold">
          Elige la estética y cámara para el render de Flow.
        </p>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => handleUpdatePromptStyle(selectedIdea.id, "ugc")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
            style === "ugc"
              ? "bg-rose-50 border-rose-200 text-rose-600 shadow-sm shadow-rose-500/5"
              : "bg-white border-slate-200/50 text-slate-500 hover:bg-slate-100"
          }`}
        >
          UGC (iPhone)
        </button>
        <button
          type="button"
          onClick={() => handleUpdatePromptStyle(selectedIdea.id, "editorial")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
            style === "editorial"
              ? "bg-rose-50 border-rose-200 text-rose-600 shadow-sm shadow-rose-500/5"
              : "bg-white border-slate-200/50 text-slate-500 hover:bg-slate-100"
          }`}
        >
          Editorial (Sony)
        </button>
      </div>
    </div>
  );
}
