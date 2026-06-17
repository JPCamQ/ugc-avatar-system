import React from "react";
import { Calendar, RefreshCw, Sparkles, Globe, Trash } from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";
import { FormField } from "@/components/ui/FormField";
import { PostIdea } from "@/lib/types";

export function IdeaList() {
  const {
    currentAvatar,
    postIdeas,
    selectedIdea,
    customContext,
    setCustomContext,
    generatingIdeas,
    handleGenerateIdeas,
    handleClearAllIdeas,
    handleDeleteIdea,
    handleSelectIdea
  } = useDashboard();

  const onDeleteClick = (ideaId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    handleDeleteIdea(ideaId);
  };

  return (
    <div className="md:col-span-2 bg-white/70 backdrop-blur-md border border-white/60 rounded-3xl p-5 flex flex-col justify-between max-h-[620px] shadow-lg shadow-slate-100/50">
      <div className="flex flex-col h-full overflow-hidden">
        
        {/* Contexto Manual Personalizado (Opcional) */}
        <FormField
          label="Contexto o Temática Manual (Opcional)"
          type="text"
          value={customContext}
          onChange={setCustomContext}
          placeholder="Ej: paseando por New York o en una playa de Tailandia"
          labelClassName="text-[9px] tracking-wider mb-1.5"
          inputClassName="px-3 py-2 bg-slate-50 border border-slate-200/50"
          className="mb-4 flex-shrink-0"
        />

        <div className="flex justify-between items-center mb-3 flex-shrink-0">
          <span className="text-xs font-bold text-slate-800">Ideas Planificadas</span>
          <div className="flex gap-2">
            {postIdeas.length > 0 && (
              <button
                type="button"
                onClick={handleClearAllIdeas}
                className="px-2.5 py-1.5 rounded-xl text-red-500 bg-red-50 hover:bg-red-100 border border-red-100 transition-all cursor-pointer flex items-center gap-1 text-[10px] font-bold"
              >
                <Trash className="w-3.5 h-3.5" />
                Limpiar Todo
              </button>
            )}
            <button
              type="button"
              onClick={handleGenerateIdeas}
              disabled={generatingIdeas}
              className="px-2.5 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white transition-all cursor-pointer flex items-center gap-1 text-[10px] font-bold shadow-md shadow-rose-500/10"
            >
              {generatingIdeas ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
              Generar 5 Ideas
            </button>
          </div>
        </div>

        {/* Lista Scrolleable */}
        <div className="space-y-2 overflow-y-auto pr-1.5 no-scrollbar flex-1">
          {postIdeas.length === 0 ? (
            <div className="text-center py-16 text-slate-400 border border-dashed border-slate-200 rounded-2xl bg-white/20">
              <Calendar className="w-8 h-8 mx-auto mb-1 opacity-20" />
              <p className="text-[10px] max-w-[170px] mx-auto leading-relaxed">
                No hay posts. Genera ideas para iniciar el planificador de contenido de {currentAvatar.name}.
              </p>
            </div>
          ) : (
            postIdeas.map((idea: PostIdea) => (
              <div
                key={idea.id}
                onClick={() => handleSelectIdea(idea)}
                className={`p-3 rounded-2xl border transition-all text-left cursor-pointer flex flex-col justify-between gap-1 group ${selectedIdea?.id === idea.id ? "bg-rose-50 border-rose-300" : "bg-white border-slate-200/40 hover:bg-slate-50 hover:border-slate-300"}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-1.5 items-center">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${idea.type === "carousel" ? "bg-purple-50 text-purple-600 border border-purple-100 font-bold" : idea.type === "video" ? "bg-orange-50 text-orange-600 border border-orange-100 font-bold" : idea.type === "flyer" ? "bg-amber-50 text-amber-700 border border-amber-200 font-bold" : "bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold"}`}>
                      {idea.type === "carousel" ? "Carrusel" : idea.type === "video" ? "Video" : idea.type === "flyer" ? "Flyer" : "Foto"}
                    </span>
                    {idea.type !== "flyer" && (
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${(!idea.promptStyle || idea.promptStyle === "ugc") ? "bg-rose-50/80 text-rose-600 border-rose-100" : "bg-slate-100 text-slate-600 border-slate-200/50"}`}>
                        {(!idea.promptStyle || idea.promptStyle === "ugc") ? "UGC (iPhone)" : "Editorial (Sony)"}
                      </span>
                    )}
                  </div>
                  <button 
                    type="button"
                    onClick={(e) => onDeleteClick(idea.id, e)}
                    className="opacity-0 group-hover:opacity-100 px-2 py-1 rounded bg-red-50 hover:bg-red-100 text-[11px] font-bold text-red-500 transition-all cursor-pointer border border-red-200/40"
                  >
                    Borrar
                  </button>
                </div>
                <h4 className="text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-rose-500 transition-colors">
                  {idea.title}
                </h4>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-semibold">
                  {idea.scenePrompt}
                </p>
                <span className="text-[11px] text-slate-400 flex items-center gap-1 font-semibold">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  {idea.location}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <p className="text-[11px] text-slate-400 mt-4 text-center border-t border-slate-100 pt-2 leading-relaxed font-semibold">
        {currentAvatar.name} documenta su camino de disciplina, fitness y lifestyle en Miami con una actitud real y fuerte.
      </p>
    </div>
  );
}
