import React from "react";
import { Check, Copy } from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";

export function CaptionOutput() {
  const { captionOutput, copiedText, copyToClipboard } = useDashboard();

  if (!captionOutput) return null;

  const isCopied = copiedText === "insta_caption";

  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs font-bold text-rose-500 uppercase tracking-wider flex items-center gap-1.5 font-semibold">
          Copy / Caption de Instagram
        </span>
        <button
          type="button"
          onClick={() => copyToClipboard(captionOutput, "insta_caption")}
          className="text-[11px] text-slate-400 hover:text-slate-800 flex items-center gap-1 cursor-pointer font-bold"
        >
          {isCopied ? (
            <Check className="w-3.5 h-3.5 text-emerald-500" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
          {isCopied ? "¡Copiado!" : "Copiar"}
        </button>
      </div>
      <textarea
        readOnly
        value={captionOutput}
        rows={6}
        className="w-full bg-slate-50 border border-slate-200/50 rounded-xl px-4 py-3 text-sm text-slate-750 leading-relaxed focus:outline-none resize-none no-scrollbar select-all font-medium"
      />
    </div>
  );
}
