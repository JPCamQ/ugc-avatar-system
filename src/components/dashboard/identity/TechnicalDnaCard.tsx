import React from "react";
import { useDashboard } from "@/context/DashboardContext";

export function TechnicalDnaCard() {
  const {
    currentAvatar,
    isEditingIdentity,
    updateCurrentAvatarField,
    copiedText,
    copyToClipboard
  } = useDashboard();

  return (
    <div className="space-y-4">
      {/* Character DNA */}
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

      {/* Audio Settings */}
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

      {/* Video Performance */}
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
  );
}
