import React, { memo } from "react";
import { Check, Copy } from "lucide-react";

interface PromptStep {
  label: string;
  text: string;
  fullText: string;
}

interface PromptStepCardProps {
  step: PromptStep;
  idx: number;
  copiedText: string | null;
  copyToClipboard: (text: string, label: string) => void;
}

export const PromptStepCard = memo(function PromptStepCard({ step, idx, copiedText, copyToClipboard }: PromptStepCardProps) {
  const stepKey = `flow_step_${idx}`;
  const isCopied = copiedText === stepKey;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 relative group flex flex-col justify-between gap-2 shadow-inner">
      <div className="flex justify-between items-center">
        <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-wider font-bold">
          {step.label}
        </span>
        <button
          type="button"
          onClick={() => copyToClipboard(step.fullText, stepKey)}
          className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-[10px] text-slate-200 font-bold flex items-center gap-1 cursor-pointer transition-all border border-white/5"
        >
          {isCopied ? (
            <Check className="w-3 h-3 text-emerald-400" />
          ) : (
            <Copy className="w-3 h-3 animate-pulse" />
          )}
          {isCopied ? "¡Copiado!" : `Copiar Prompt Completo ${step.label}`}
        </button>
      </div>
      
      <div className="text-[12px] text-slate-350 font-sans italic leading-relaxed bg-slate-950 p-2.5 rounded-lg border border-slate-800 select-all max-h-[120px] overflow-y-auto no-scrollbar font-normal">
        {step.text}
      </div>
    </div>
  );
});
