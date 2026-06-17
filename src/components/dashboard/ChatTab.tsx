import React, { useEffect, useRef } from "react";
import { MessageCircle, Send } from "lucide-react";
import { motion } from "framer-motion";
import { useDashboard } from "@/context/DashboardContext";
import { ChatSidebar } from "./chat/ChatSidebar";
import { ChatMessageBubble } from "./chat/ChatMessageBubble";
import { LeadContextCard } from "./chat/LeadContextCard";

export function ChatTab() {
  const {
    currentAvatar,
    simulations,
    activeSimulationId,
    chatInput,
    setChatInput,
    isAvatarTyping,
    handleSendMessage
  } = useDashboard();

  const chatEndRef = useRef<HTMLDivElement>(null);
  const activeSim = simulations.find(s => s.id === activeSimulationId);

  // Auto-scroll al final del chat
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
      {/* Listado de Chats Simulados */}
      <ChatSidebar />

      {/* Caja de Chat y Contexto del Seguidor (3 columnas) */}
      <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
        
        {/* Chat (2 columnas del subgrid) */}
        <div className="md:col-span-2 bg-white border border-slate-200/50 rounded-3xl flex flex-col justify-between max-h-[620px] relative overflow-hidden shadow-lg shadow-slate-100/50">
          
          {activeSimulationId && activeSim ? (
            <>
              {/* Cabecera del Chat */}
              <div className="px-5 py-3.5 border-b border-slate-100 bg-white/80 backdrop-blur flex justify-between items-center z-10 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-600 uppercase">
                    {activeSim.userName[0]}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">@{activeSim.userName}</h4>
                    <span className="text-[9px] text-emerald-600 font-semibold">
                      Interactuando con {currentAvatar.name}
                    </span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${activeSim.status === "converted" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"}`}>
                  {activeSim.status === "converted" ? "Convertido" : "Embudo Activo"}
                </span>
              </div>

              {/* Área de Mensajes */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 pr-1.5 no-scrollbar">
                {activeSim.messages.map((msg) => (
                  <ChatMessageBubble
                    key={msg.id}
                    msg={msg}
                    currentAvatar={currentAvatar}
                  />
                ))}

                {/* Indicador de Escritura del Avatar */}
                {isAvatarTyping && (
                  <div className="flex flex-col self-start items-start max-w-[80%]">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-rose-400 overflow-hidden flex-shrink-0">
                        {currentAvatar.avatarImage ? (
                          <img src={currentAvatar.avatarImage} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[8px] text-white font-bold flex items-center justify-center h-full uppercase">
                            {currentAvatar.name[0]}
                          </span>
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
                  type="button"
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

        {/* Ficha de Contexto del Lead */}
        <LeadContextCard />

      </div>
    </motion.div>
  );
}
