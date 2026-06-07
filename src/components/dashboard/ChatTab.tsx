import React, { useEffect, useRef } from "react";
import { MessageCircle, Send, Compass, Users, Trash } from "lucide-react";
import { motion } from "framer-motion";
import { AvatarIdentity, ChatSimulation } from "@/lib/db";

interface ChatTabProps {
  currentAvatar: AvatarIdentity;
  simulations: ChatSimulation[];
  activeSimulationId: string | null;
  setActiveSimulationId: (id: string | null) => void;
  chatInput: string;
  setChatInput: (input: string) => void;
  isAvatarTyping: boolean;
  handleSendMessage: () => void;
  handleForceSendLink: () => void;
  handleCreateNewSim: () => void;
  handleDeleteSimulation: (id: string) => void;
  handleResetSims: () => void;
}

export function ChatTab({
  currentAvatar,
  simulations,
  activeSimulationId,
  setActiveSimulationId,
  chatInput,
  setChatInput,
  isAvatarTyping,
  handleSendMessage,
  handleForceSendLink,
  handleCreateNewSim,
  handleDeleteSimulation,
  handleResetSims
}: ChatTabProps) {

  const chatEndRef = useRef<HTMLDivElement>(null);
  const activeSim = simulations.find(s => s.id === activeSimulationId);

  // Auto-scroll al final del chat cuando hay mensajes nuevos o cuando el avatar está escribiendo
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeSim?.messages.length, isAvatarTyping]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && chatInput.trim()) {
      handleSendMessage();
    }
  };

  return (
    <motion.div
      key="chat"
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="grid grid-cols-1 md:grid-cols-4 gap-6 items-stretch h-full"
    >
      {/* Listado de Chats Simulados (1 columna) */}
      <div className="md:col-span-1 bg-white/70 backdrop-blur-md border border-white/60 rounded-3xl p-4 flex flex-col justify-between max-h-[620px] shadow-lg shadow-slate-100/50">
        <div className="flex flex-col h-full overflow-hidden">
          <div className="flex justify-between items-center mb-4 px-1 flex-shrink-0">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Chats de DMs</h3>
              <p className="text-[8px] text-slate-400">Embudo conversacional</p>
            </div>
            <button
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
              simulations.map(sim => (
                <div
                  key={sim.id}
                  onClick={() => setActiveSimulationId(sim.id)}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between gap-1 transition-all cursor-pointer group/item ${activeSimulationId === sim.id ? "bg-rose-50 border-rose-200 shadow-sm" : "bg-white border-slate-150 hover:bg-slate-50/70"}`}
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
          onClick={handleResetSims}
          className="w-full py-2 mt-4 rounded-xl border border-red-100 bg-red-50 hover:bg-red-100 text-red-500 text-[9px] font-bold uppercase transition-all cursor-pointer flex-shrink-0"
        >
          Resetear Chats
        </button>
      </div>

      {/* Caja de Chat y Contexto del Seguidor (3 columnas) */}
      <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
        
        {/* Chat (2 columnas del subgrid) */}
        <div className="md:col-span-2 bg-white border border-slate-200/50 rounded-3xl flex flex-col justify-between max-h-[620px] relative overflow-hidden shadow-lg shadow-slate-100/50">
          
          {/* Cabecera del Chat */}
          {activeSimulationId && activeSim ? (
            <>
              <div className="px-5 py-3.5 border-b border-slate-100 bg-white/80 backdrop-blur flex justify-between items-center z-10 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-600 uppercase">
                    {activeSim.userName[0]}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">@{activeSim.userName}</h4>
                    <span className="text-[9px] text-emerald-600 font-semibold">Interactuando con {currentAvatar.name}</span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${activeSim.status === "converted" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"}`}>
                  {activeSim.status === "converted" ? "Convertido" : "Embudo Activo"}
                </span>
              </div>

              {/* Área de Mensajes */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 pr-1.5 no-scrollbar">
                {activeSim.messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex flex-col max-w-[80%] ${msg.sender === "avatar" ? "self-start items-start" : "self-end items-end ml-auto"}`}
                  >
                    <div className="flex items-center gap-2">
                      {msg.sender === "avatar" && (
                        <div className="w-5 h-5 rounded-full bg-rose-400 overflow-hidden flex-shrink-0">
                          {currentAvatar.avatarImage ? (
                            <img src={currentAvatar.avatarImage} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[8px] text-white font-bold flex items-center justify-center h-full uppercase">{currentAvatar.name[0]}</span>
                          )}
                        </div>
                      )}
                      <div 
                        className={`px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${msg.sender === "avatar" ? "bg-slate-100 text-slate-800 rounded-tl-sm font-medium" : "bg-gradient-to-tr from-rose-400 to-amber-500 text-white rounded-tr-sm font-medium"}`}
                      >
                        {msg.text}
                      </div>
                    </div>
                    <span className="text-[7px] text-slate-400 mt-1 px-8">{msg.timestamp}</span>
                  </div>
                ))}

                {/* Indicador de Escritura del Avatar */}
                {isAvatarTyping && (
                  <div className="flex flex-col self-start items-start max-w-[80%]">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-rose-400 overflow-hidden flex-shrink-0">
                        {currentAvatar.avatarImage ? (
                          <img src={currentAvatar.avatarImage} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[8px] text-white font-bold flex items-center justify-center h-full uppercase">{currentAvatar.name[0]}</span>
                        )}
                      </div>
                      <div className="px-3.5 py-2.5 rounded-2xl bg-slate-100 text-slate-500 text-xs rounded-tl-sm flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        <span className="text-[10px] text-slate-400 font-semibold">{currentAvatar.name} está pensando...</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Entrada de Mensajes */}
              <div className="p-4 border-t border-slate-100 bg-white flex gap-2 flex-shrink-0">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder={`Simula ser el seguidor y chatea con ${currentAvatar.name}...`}
                  className="flex-1 bg-slate-50 border border-slate-100 focus:border-rose-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!chatInput.trim()}
                  className="p-2.5 rounded-xl bg-gradient-to-tr from-rose-400 to-amber-500 hover:opacity-90 disabled:opacity-50 text-white transition-all cursor-pointer flex items-center justify-center shadow-md shadow-rose-500/10 font-bold"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-6 flex-1 min-h-[400px]">
              <MessageCircle className="w-12 h-12 text-slate-300 mb-3 animate-pulse" />
              <h4 className="text-sm font-bold text-slate-700">Ningún Chat Seleccionado</h4>
              <p className="text-xs text-slate-500 max-w-xs mt-1 leading-relaxed">
                Selecciona un lead de la izquierda para simular el embudo conversacional.
              </p>
            </div>
          )}

        </div>

        {/* Ficha de Contexto del Lead (1 columna del subgrid) */}
        <div className="bg-white/70 backdrop-blur-md border border-white/60 rounded-3xl p-5 flex flex-col justify-between max-h-[620px] shadow-lg shadow-slate-100/50">
          {activeSimulationId && activeSim ? (
            <>
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wide font-semibold">Perfil del Seguidor</span>
                  <h4 className="text-xs font-bold text-slate-900 mt-0.5">@{activeSim.userName}</h4>
                </div>

                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider font-semibold">{"Backstory / Intereses"}</span>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1">{activeSim.userBio}</p>
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider font-semibold">Objetivos de Engagement</span>
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
            </>
          ) : (
            <div className="text-center py-20 text-slate-400 h-full flex flex-col justify-center items-center">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-15 animate-pulse" />
              <p className="text-[10px]">Selecciona un chat activo para ver su perfil.</p>
            </div>
          )}
        </div>

      </div>
    </motion.div>
  );
}
