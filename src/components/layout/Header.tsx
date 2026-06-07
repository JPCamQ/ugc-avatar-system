import React from "react";
import { Sparkles, UserPlus, Key } from "lucide-react";
import { AvatarIdentity } from "@/lib/db";
import { isKeyValid } from "@/lib/utils";

interface HeaderProps {
  selectedAvatarId: string;
  avatars: AvatarIdentity[];
  handleSelectAvatarChange: (id: string) => void;
  setShowCreateAvatarModal: (val: boolean) => void;
  apiKey: string;
  showApiKeyInput: boolean;
  setShowApiKeyInput: (val: boolean) => void;
}

export function Header({
  selectedAvatarId,
  avatars,
  handleSelectAvatarChange,
  setShowCreateAvatarModal,
  apiKey,
  showApiKeyInput,
  setShowApiKeyInput
}: HeaderProps) {
  return (
    <header className="relative z-10 border-b border-slate-100 bg-white/70 backdrop-blur-md px-6 py-4 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
        
        {/* Logo y título */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-400 via-rose-500 to-amber-400 flex items-center justify-center shadow-lg shadow-rose-500/10">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-extrabold tracking-tight text-slate-900">
                UGC Avatar<span className="text-rose-500 font-medium"> Studio</span>
              </span>
              <span className="px-2 py-0.5 rounded-md bg-rose-50 border border-rose-100 text-[9px] font-bold text-rose-500 uppercase tracking-widest">
                v2.0
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-semibold">Gestor de Influencers AI y Embudos de Redes Sociales</p>
          </div>
        </div>

        {/* Selector de Avatar (Multi-Avatar) y API Key */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          
          {/* Selector de Avatar */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 hidden md:inline">Avatar Activo:</span>
            <div className="relative flex items-center">
              <select
                value={selectedAvatarId}
                onChange={(e) => handleSelectAvatarChange(e.target.value)}
                className="bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs font-bold px-3 py-2 pr-8 rounded-xl border border-slate-200/50 focus:outline-none appearance-none cursor-pointer min-w-[140px]"
              >
                {avatars.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
              <div className="absolute right-3.5 pointer-events-none text-slate-500 text-[10px]">▼</div>
            </div>
            
            <button
              onClick={() => setShowCreateAvatarModal(true)}
              className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-500 transition-all cursor-pointer flex items-center gap-1.5"
              title="Añadir Avatar de Cliente"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="text-xs font-bold hidden md:inline">Nuevo</span>
            </button>
          </div>

          <span className="h-6 w-px bg-slate-200/70" />

          {isKeyValid(apiKey) ? (
            <button 
              onClick={() => setShowApiKeyInput(!showApiKeyInput)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100/70 transition-all cursor-pointer font-bold"
            >
              <Key className="w-3.5 h-3.5" />
              API Conectada
            </button>
          ) : (
            <button 
              onClick={() => setShowApiKeyInput(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 hover:bg-rose-100/70 transition-all cursor-pointer animate-pulse font-bold"
            >
              <Key className="w-3.5 h-3.5" />
              Falta API Key
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
