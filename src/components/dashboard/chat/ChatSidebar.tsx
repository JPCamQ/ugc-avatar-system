import React from "react";
import { Trash } from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";
import { ChatSimulation } from "@/lib/types";

export function ChatSidebar() {
  const {
    simulations,
    activeSimulationId,
    setActiveSimulationId,
    handleCreateNewSim,
    handleDeleteSimulation,
    handleResetSims
  } = useDashboard();

  return (
    <div className="md:col-span-1 bg-white/70 backdrop-blur-md border border-white/60 rounded-3xl p-4 flex flex-col justify-between max-h-[620px] shadow-lg shadow-slate-100/50">
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex justify-between items-center mb-4 px-1 flex-shrink-0">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Chats de DMs</h3>
            <p className="text-[8px] text-slate-400">Embudo conversacional</p>
          </div>
          <button
            type="button"
            onClick={() => handleCreateNewSim()}
            className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200/80 border border-slate-200/50 text-slate-800 cursor-pointer font-bold text-xs"
            title="Nueva simulación de seguidor"
          >
            +
          </button>
        </div>

        <div className="space-y-1.5 overflow-y-auto pr-1 no-scrollbar flex-1">
          {simulations.length === 0 ? (
            <p className="text-[10px] text-slate-400 text-center py-10">No hay chats activos. Crea uno nuevo arriba.</p>
          ) : (
            simulations.map((sim: ChatSimulation) => (
              <div
                key={sim.id}
                onClick={() => setActiveSimulationId(sim.id)}
                className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between gap-1 transition-all cursor-pointer group/item ${
                  activeSimulationId === sim.id
                    ? "bg-rose-50 border-rose-200 shadow-sm"
                    : "bg-white border-slate-150 hover:bg-slate-50/70"
                }`}
              >
                <div className="flex flex-col gap-0.5 overflow-hidden flex-1">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    @{sim.userName}
                    {sim.status === "converted" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Convertido (Clic en enlace)" />
                    )}
                  </span>
                  <span className="text-[9px] text-slate-500 line-clamp-1 leading-normal">
                    {sim.messages[sim.messages.length - 1]?.text || "Sin mensajes"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteSimulation(sim.id);
                  }}
                  className="opacity-0 group-hover/item:opacity-100 p-1 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 transition-opacity cursor-pointer flex-shrink-0"
                  title="Eliminar chat"
                >
                  <Trash className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={handleResetSims}
        className="w-full py-2 mt-4 rounded-xl border border-red-100 bg-red-50 hover:bg-red-100 text-red-500 text-[9px] font-bold uppercase transition-all cursor-pointer flex-shrink-0"
      >
        Resetear Chats
      </button>
    </div>
  );
}
