import React from "react";
import { Users, Compass } from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";

export function LeadContextCard() {
  const { currentAvatar, simulations, activeSimulationId, handleForceSendLink } = useDashboard();
  const activeSim = simulations.find(s => s.id === activeSimulationId);

  if (!activeSimulationId || !activeSim) {
    return (
      <div className="bg-white/70 backdrop-blur-md border border-white/60 rounded-3xl p-5 flex flex-col justify-center items-center text-center max-h-[620px] shadow-lg shadow-slate-100/50 min-h-[400px]">
        <Users className="w-8 h-8 mx-auto mb-2 opacity-15 animate-pulse" />
        <p className="text-[10px] text-slate-400">Selecciona un chat activo para ver su perfil.</p>
      </div>
    );
  }

  return (
    <div className="bg-white/70 backdrop-blur-md border border-white/60 rounded-3xl p-5 flex flex-col justify-between max-h-[620px] shadow-lg shadow-slate-100/50">
      <div className="space-y-4">
        <div>
          <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wide font-semibold">
            Perfil del Seguidor
          </span>
          <h4 className="text-xs font-bold text-slate-900 mt-0.5">@{activeSim.userName}</h4>
        </div>

        <div>
          <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider font-semibold">
            Backstory / Intereses
          </span>
          <p className="text-xs text-slate-600 leading-relaxed mt-1">{activeSim.userBio}</p>
        </div>

        <div className="border-t border-slate-100 pt-3">
          <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider font-semibold">
            Objetivos de Engagement
          </span>
          <div className="mt-2 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-semibold">
              <span className="text-slate-500 font-semibold">1. Conexión Inicial</span>
              <span className="text-emerald-600 font-bold">Hecho</span>
            </div>
            <div className="flex items-center justify-between text-[10px] font-semibold">
              <span className="text-slate-500 font-semibold">2. Charla de Lifestyle</span>
              <span className="text-emerald-600 font-bold">Hecho</span>
            </div>
            <div className="flex items-center justify-between text-[10px] font-semibold">
              <span className="text-slate-500 font-semibold">3. Fidelización Seguidor</span>
              <span className={activeSim.status === "converted" ? "text-emerald-600 font-bold" : "text-amber-500 font-bold animate-pulse"}>
                {activeSim.status === "converted" ? "Fidelizado" : "En curso"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2 pt-4 border-t border-slate-100 flex-shrink-0">
        <button
          type="button"
          onClick={handleForceSendLink}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-rose-400 hover:opacity-95 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-rose-500/10"
        >
          <Compass className="w-4 h-4" />
          Enviar Recomendación
        </button>
        <p className="text-[8px] text-slate-400 text-center leading-normal">
          Envía una recomendación de spot de lifestyle de {currentAvatar.name} con su link de monetización en el chat.
        </p>
      </div>
    </div>
  );
}
