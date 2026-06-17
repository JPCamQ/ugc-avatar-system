import React from "react";
import { useDashboard } from "@/context/DashboardContext";

export function AudioLanguageSelector() {
  const { selectedIdea, audioLanguage, setAudioLanguage } = useDashboard();

  if (!selectedIdea || selectedIdea.type !== "video") return null;

  return (
    <div className="mb-4 p-4 bg-slate-50/70 border border-slate-200/40 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div>
        <span className="text-xs font-bold text-rose-500 uppercase tracking-wide block font-semibold">
          Idioma de Voz (Flow)
        </span>
        <p className="text-[10px] text-slate-400 mt-0.5 font-semibold">
          Elige el idioma del audio a generar en Flow.
        </p>
      </div>
      <div className="flex flex-wrap gap-2 justify-end">
        <button
          type="button"
          onClick={() => setAudioLanguage("es")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
            audioLanguage === "es"
              ? "bg-rose-50 border-rose-200 text-rose-600 shadow-sm"
              : "bg-white border-slate-200/50 text-slate-600 hover:bg-slate-50"
          }`}
        >
          Español (Venezolano)
        </button>
        <button
          type="button"
          onClick={() => setAudioLanguage("en")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
            audioLanguage === "en"
              ? "bg-rose-50 border-rose-200 text-rose-600 shadow-sm"
              : "bg-white border-slate-200/50 text-slate-600 hover:bg-slate-50"
          }`}
        >
          Inglés (Nativo US)
        </button>
        <button
          type="button"
          onClick={() => setAudioLanguage("voiceover")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
            audioLanguage === "voiceover"
              ? "bg-rose-50 border-rose-200 text-rose-600 shadow-sm"
              : "bg-white border-slate-200/50 text-slate-600 hover:bg-slate-50"
          }`}
        >
          Voz en Off (Voiceover)
        </button>
        <button
          type="button"
          onClick={() => setAudioLanguage("silent")}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
            audioLanguage === "silent"
              ? "bg-rose-50 border-rose-200 text-rose-600 shadow-sm"
              : "bg-white border-slate-200/50 text-slate-600 hover:bg-slate-50"
          }`}
        >
          Sin diálogo (B-Roll)
        </button>
      </div>
    </div>
  );
}
