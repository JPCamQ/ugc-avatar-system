import React from "react";
import { 
  Upload, Trash, ExternalLink, User, Award, Calendar, MessageCircle, DollarSign, Sparkles
} from "lucide-react";
import { AvatarIdentity } from "@/lib/db";

interface AvatarSidebarProps {
  currentAvatar: AvatarIdentity;
  activeTab: "identity" | "setup" | "planner" | "chat" | "metrics" | "showcase";
  setActiveTab: (tab: "identity" | "setup" | "planner" | "chat" | "metrics" | "showcase") => void;
  handlePhotoUpload: (file: File) => void;
  handleRemovePhoto: () => void;
  avatarsLength: number;
  showError: (msg: string) => void;
}

export function AvatarSidebar({
  currentAvatar,
  activeTab,
  setActiveTab,
  handlePhotoUpload,
  handleRemovePhoto,
  avatarsLength,
  showError
}: AvatarSidebarProps) {

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handlePhotoUpload(file);
    }
  };

  return (
    <section className="lg:col-span-1 flex flex-col gap-6 font-sans">
      
      {/* Card Resumen de Identidad del Avatar */}
      <div className="bg-white/70 backdrop-blur-md border border-white/60 rounded-3xl p-5 flex flex-col items-center text-center shadow-lg shadow-slate-100/50 relative overflow-hidden group">
        
        {/* Foto de Perfil con subida interactiva */}
        <div className="relative w-24 h-24 rounded-full p-0.5 bg-gradient-to-tr from-rose-400 to-amber-400 mb-4 shadow-md group/photo">
          <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center overflow-hidden relative">
            {currentAvatar.avatarImage ? (
              <img 
                src={currentAvatar.avatarImage} 
                alt={currentAvatar.name} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <span className="text-3xl font-extrabold tracking-widest text-rose-400 bg-clip-text text-transparent bg-gradient-to-tr from-rose-500 to-amber-400">
                {currentAvatar.name.split(" ").map(n => n[0]).join("")}
              </span>
            )}
            
            {/* Overlay para editar foto */}
            <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/photo:opacity-100 transition-opacity cursor-pointer">
              <Upload className="w-5 h-5 text-white" />
              <input
                type="file"
                accept="image/*"
                onChange={onFileChange}
                className="hidden"
              />
            </label>
          </div>

          {currentAvatar.avatarImage && (
            <button
              onClick={handleRemovePhoto}
              className="absolute -top-1 -right-1 p-1 rounded-full bg-red-100 hover:bg-red-200 border border-red-200 text-red-500 shadow transition-all cursor-pointer"
              title="Eliminar foto"
            >
              <Trash className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <h3 className="text-base font-extrabold text-slate-800 leading-tight flex items-center gap-1.5 justify-center">
          {currentAvatar.name}
        </h3>
        
        <div className="flex gap-1.5 items-center mt-1">
          <span className="text-[9px] font-bold text-rose-500 bg-rose-50 border border-rose-100 px-2.5 py-0.5 rounded-full uppercase tracking-wide">
            {currentAvatar.age} Años
          </span>
          <span className="text-[9px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2.5 py-0.5 rounded-full uppercase tracking-wide">
            UGC Influencer
          </span>
        </div>

        <p className="text-xs text-slate-500 mt-3.5 line-clamp-3 leading-relaxed">
          {currentAvatar.backstory}
        </p>

        <div className="w-full border-t border-slate-100 my-4" />

        {/* Producto de afiliado actual */}
        {currentAvatar.monetizationProduct ? (
          <div className="w-full text-left">
            <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider font-semibold">Colaboración / Marca</span>
            {currentAvatar.monetizationLink ? (
              <a 
                href={currentAvatar.monetizationLink} 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center justify-between text-xs text-amber-600 font-semibold hover:underline mt-0.5"
              >
                <span className="truncate max-w-[170px] font-semibold">{currentAvatar.monetizationProduct}</span>
                <ExternalLink className="w-3 h-3 flex-shrink-0 text-slate-400" />
              </a>
            ) : (
              <span className="block text-xs text-slate-650 font-semibold mt-0.5 truncate max-w-[170px]">
                {currentAvatar.monetizationProduct}
              </span>
            )}
          </div>
        ) : (
          <div className="w-full text-left">
            <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider font-semibold">Colaboración / Marca</span>
            <span className="block text-[10px] text-slate-400 italic mt-0.5">Sin colaboración asignada</span>
          </div>
        )}
      </div>

      {/* Menú de pestañas */}
      <div className="bg-white/60 backdrop-blur-md border border-white/40 rounded-3xl p-2 flex flex-col gap-1 shadow-md shadow-slate-100/50">
        <button
          onClick={() => setActiveTab("identity")}
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${activeTab === "identity" ? "bg-gradient-to-r from-rose-500/10 to-amber-500/10 border border-rose-100 text-rose-600 shadow-sm" : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"}`}
        >
          <User className="w-4 h-4 text-rose-500" />
          Identidad & DNA
        </button>
        <button
          onClick={() => setActiveTab("setup")}
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${activeTab === "setup" ? "bg-gradient-to-r from-rose-500/10 to-amber-500/10 border border-rose-100 text-rose-600 shadow-sm" : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"}`}
        >
          <Award className="w-4 h-4 text-rose-400" />
          Setup Viral Perfiles
        </button>
        <button
          onClick={() => setActiveTab("planner")}
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${activeTab === "planner" ? "bg-gradient-to-r from-rose-500/10 to-amber-500/10 border border-rose-100 text-rose-600 shadow-sm" : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"}`}
        >
          <Calendar className="w-4 h-4 text-amber-500" />
          Planificador Editorial
        </button>
        <button
          onClick={() => setActiveTab("chat")}
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${activeTab === "chat" ? "bg-gradient-to-r from-rose-500/10 to-amber-500/10 border border-rose-100 text-rose-600 shadow-sm" : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"}`}
        >
          <MessageCircle className="w-4 h-4 text-yellow-500" />
          Simulador de DMs
        </button>
        <button
          onClick={() => setActiveTab("metrics")}
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${activeTab === "metrics" ? "bg-gradient-to-r from-rose-500/10 to-amber-500/10 border border-rose-100 text-rose-600 shadow-sm" : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"}`}
        >
          <DollarSign className="w-4 h-4 text-emerald-500" />
          Métricas de Crecimiento
        </button>
        <button
          onClick={() => setActiveTab("showcase")}
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${activeTab === "showcase" ? "bg-gradient-to-r from-rose-500/10 to-amber-500/10 border border-rose-100 text-rose-600 shadow-sm" : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"}`}
        >
          <Sparkles className="w-4 h-4 text-purple-500" />
          Muestras de la Agencia
        </button>
      </div>
      
      {avatarsLength > 1 && (
        <div className="p-3 bg-rose-50/50 border border-rose-100 rounded-2xl text-center">
          <p className="text-[10px] text-slate-500">
            Estás gestionando un portafolio de <strong>{avatarsLength} avatares</strong>.
          </p>
        </div>
      )}
    </section>
  );
}
