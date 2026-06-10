import React, { useRef } from "react";
import { 
  Calendar, RefreshCw, Sparkles, Globe, Upload, Trash, Compass, Smartphone, ShieldAlert, Check, Copy
} from "lucide-react";
import { motion } from "framer-motion";
import { AvatarIdentity, PostIdea } from "@/lib/db";
import { parsePromptSteps, parseRepeatingIngredients } from "@/lib/utils";

interface PlannerTabProps {
  currentAvatar: AvatarIdentity;
  postIdeas: PostIdea[];
  selectedIdea: PostIdea | null;
  customContext: string;
  setCustomContext: (context: string) => void;
  audioLanguage: "es" | "en" | "silent" | "voiceover";
  setAudioLanguage: (lang: "es" | "en" | "silent" | "voiceover") => void;
  postPromptInput: string;
  setPostPromptInput: (input: string) => void;
  captionOutput: string;
  promptOutput: string;
  generatingIdeas: boolean;
  generatingPrompt: boolean;
  generatingCaption: boolean;
  handleGenerateIdeas: () => void;
  handleGeneratePrompt: (idea: PostIdea) => void;
  handleGenerateCaption: (idea: PostIdea) => void;
  handleDeleteIdea: (id: string) => void;
  handleUpdateProductInfo: (name: string, image?: string | null) => void;
  handleSelectIdea: (idea: PostIdea) => void;
  handleUpdatePromptStyle: (ideaId: string, style: "ugc" | "editorial") => void;
  copiedText: string | null;
  copyToClipboard: (text: string, label: string) => void;
  showError: (msg: string) => void;
}

export function PlannerTab({
  currentAvatar,
  postIdeas,
  selectedIdea,
  customContext,
  setCustomContext,
  audioLanguage,
  setAudioLanguage,
  postPromptInput,
  setPostPromptInput,
  captionOutput,
  promptOutput,
  generatingIdeas,
  generatingPrompt,
  generatingCaption,
  handleGenerateIdeas,
  handleGeneratePrompt,
  handleGenerateCaption,
  handleDeleteIdea,
  handleUpdateProductInfo,
  handleSelectIdea,
  handleUpdatePromptStyle,
  copiedText,
  copyToClipboard,
  showError
}: PlannerTabProps) {

  const fileInputRef = useRef<HTMLInputElement>(null);

  const promptSteps = selectedIdea && promptOutput ? parsePromptSteps(promptOutput, selectedIdea.type) : [];
  const repeatingIngredients = promptOutput ? parseRepeatingIngredients(promptOutput) : "";

  const handleUploadProductImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedIdea) return;
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showError("La imagen del producto no debe superar los 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        handleUpdateProductInfo(selectedIdea.productName || "", base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveProductImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleUpdateProductInfo(selectedIdea?.productName || "", null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onDeleteClick = (ideaId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    handleDeleteIdea(ideaId);
  };

  return (
    <motion.div
      key="planner"
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="grid grid-cols-1 md:grid-cols-5 gap-6 items-stretch h-full"
    >
      {/* Lista de Ideas generadas (2 columnas) */}
      <div className="md:col-span-2 bg-white/70 backdrop-blur-md border border-white/60 rounded-3xl p-5 flex flex-col justify-between max-h-[620px] shadow-lg shadow-slate-100/50">
        <div className="flex flex-col h-full overflow-hidden">
          
          {/* Contexto Manual Personalizado (Opcional) */}
          <div className="mb-4 flex-shrink-0">
            <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 font-semibold">
              Contexto o Temática Manual (Opcional)
            </label>
            <input
              type="text"
              value={customContext}
              onChange={(e) => setCustomContext(e.target.value)}
              placeholder="Ej: paseando por New York o en una playa de Tailandia"
              className="w-full bg-slate-50 border border-slate-200/50 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-rose-300 font-semibold"
            />
          </div>

          <div className="flex justify-between items-center mb-3 flex-shrink-0">
            <span className="text-xs font-bold text-slate-800">Ideas Planificadas</span>
            <button
              onClick={handleGenerateIdeas}
              disabled={generatingIdeas}
              className="px-2.5 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white transition-all cursor-pointer flex items-center gap-1 text-[10px] font-bold shadow-md shadow-rose-500/10"
            >
              {generatingIdeas ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
              Generar 5 Ideas
            </button>
          </div>

          {/* Lista Scrolleable */}
          <div className="space-y-2 overflow-y-auto pr-1.5 no-scrollbar flex-1">
            {postIdeas.length === 0 ? (
              <div className="text-center py-16 text-slate-400 border border-dashed border-slate-200 rounded-2xl bg-white/20">
                <Calendar className="w-8 h-8 mx-auto mb-1 opacity-20" />
                <p className="text-[10px] max-w-[170px] mx-auto leading-relaxed">No hay posts. Genera ideas para iniciar el planificador de contenido de {currentAvatar.name}.</p>
              </div>
            ) : (
              postIdeas.map((idea) => (
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

      {/* Panel de Trabajo de Prompt y Copy (3 columnas) */}
      <div className="md:col-span-3 flex flex-col gap-4">
        {selectedIdea ? (
          <div className="bg-white/70 backdrop-blur-md border border-white/60 rounded-3xl p-6 flex flex-col justify-between flex-1 max-h-[620px] overflow-y-auto no-scrollbar shadow-lg shadow-slate-100/50">
            <div>
              
              {/* Cabecera del post */}
              <div className="flex justify-between items-start gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Mesa de Edición</span>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 mt-1">{selectedIdea.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1 font-semibold">
                    <Globe className="w-3.5 h-3.5 text-amber-500" />
                    {selectedIdea.location}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-slate-100 text-[10px] font-black uppercase text-slate-600 border border-slate-200/50">
                  {selectedIdea.type}
                </span>
              </div>

              {/* Modificador del Prompt de Escena */}
              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5 font-semibold">Escena Visual & Vestuario Dinámico (Modificable)</label>
                <textarea
                  value={postPromptInput}
                  onChange={(e) => setPostPromptInput(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-100 focus:border-rose-300 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none resize-none leading-relaxed transition-all font-semibold"
                />
              </div>

              {/* Selector de Estilo de Fotografía (UGC vs Editorial) */}
              {selectedIdea.type !== "flyer" && (
                <div className="mb-4 p-4 bg-slate-50/70 border border-slate-200/40 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-rose-500 uppercase tracking-wide block font-semibold">Estilo de Fotografía</span>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-semibold">Elige la estética y cámara para el render de Flow.</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleUpdatePromptStyle(selectedIdea.id, "ugc")}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${(!selectedIdea.promptStyle || selectedIdea.promptStyle === "ugc") ? "bg-rose-50 border-rose-200 text-rose-600 shadow-sm shadow-rose-500/5" : "bg-white border-slate-200/50 text-slate-500 hover:bg-slate-100"}`}
                    >
                      UGC (iPhone)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdatePromptStyle(selectedIdea.id, "editorial")}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${selectedIdea.promptStyle === "editorial" ? "bg-rose-50 border-rose-200 text-rose-600 shadow-sm shadow-rose-500/5" : "bg-white border-slate-200/50 text-slate-500 hover:bg-slate-100"}`}
                    >
                      Editorial (Sony)
                    </button>
                  </div>
                </div>
              )}

              {/* Integración de Producto de Afiliados / Patrocinio */}
              <div className="mb-4 p-4 bg-slate-50/70 border border-slate-200/40 rounded-2xl">
                <label className="block text-[10px] font-bold text-rose-500 uppercase tracking-wide mb-2 font-semibold">{"Integración de Producto / Patrocinio (Opcional)"}</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                  
                  {/* Subida de Imagen */}
                  <div className="sm:col-span-1 flex flex-col items-center">
                    <div className="w-14 h-14 rounded-xl border border-dashed border-slate-200 bg-white flex items-center justify-center overflow-hidden relative group/prod shadow-sm">
                      {selectedIdea.productImage ? (
                        <img 
                          src={selectedIdea.productImage} 
                          alt={selectedIdea.productName || "Producto"} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <Upload className="w-4 h-4 text-slate-400" />
                      )}
                      <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/prod:opacity-100 transition-opacity cursor-pointer">
                        <Upload className="w-4 h-4 text-white" />
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleUploadProductImage}
                          className="hidden"
                        />
                      </label>
                      {selectedIdea.productImage && (
                        <button
                          type="button"
                          onClick={handleRemoveProductImage}
                          className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-red-100 hover:bg-red-200 text-red-500 shadow transition-all cursor-pointer"
                          title="Remover imagen"
                        >
                          <Trash className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 font-semibold">Foto Referencia</span>
                  </div>

                  {/* Nombre del Producto */}
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 font-semibold">Nombre Comercial del Producto</label>
                    <input
                      type="text"
                      value={selectedIdea.productName || ""}
                      onChange={(e) => handleUpdateProductInfo(e.target.value)}
                      placeholder="Ej. Tarjeta Fintech Gold o Bebida Energética"
                      className="w-full bg-white border border-slate-200/50 rounded-xl px-3 py-1.5 text-sm text-slate-800 focus:outline-none focus:border-rose-300 font-semibold"
                    />
                    <p className="text-[10px] text-slate-400 mt-1 leading-normal font-semibold">
                      La IA integrará este producto en los prompts de Flow de forma visualmente realista.
                    </p>
                    {selectedIdea.productImage && (
                      <div className="mt-2.5 p-2.5 bg-amber-50/60 border border-amber-200/30 rounded-xl text-xs text-amber-900 leading-relaxed flex items-start gap-2 shadow-sm">
                        <span className="text-amber-600 font-bold text-xs mt-0.5">💡</span>
                        <div>
                          <strong>Tip para consistencia en Flow:</strong> Al generar la imagen en Flow, asegúrate de activar la opción de <em>"Object Reference" (o subirla como imagen de apoyo/ControlNet)</em> y subir esta misma foto. El prompt generado ha sido estructurado para forzar al motor de Flow a calcar la forma, logotipos y colores de tu imagen sin distorsiones.
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              </div>

              {/* Selector de idioma para Flow en caso de Video */}
              {selectedIdea.type === "video" && (
                <div className="mb-4 p-4 bg-slate-50/70 border border-slate-200/40 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-rose-500 uppercase tracking-wide block font-semibold">Idioma de Voz (Flow)</span>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-semibold">Elige el idioma del audio a generar en Flow.</p>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setAudioLanguage("es")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${audioLanguage === "es" ? "bg-rose-50 border-rose-200 text-rose-600 shadow-sm" : "bg-white border-slate-200/50 text-slate-600 hover:bg-slate-50"}`}
                    >
                      Español (Venezolano)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAudioLanguage("en")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${audioLanguage === "en" ? "bg-rose-50 border-rose-200 text-rose-600 shadow-sm" : "bg-white border-slate-200/50 text-slate-600 hover:bg-slate-50"}`}
                    >
                      Inglés (Nativo US)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAudioLanguage("voiceover")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${audioLanguage === "voiceover" ? "bg-rose-50 border-rose-200 text-rose-600 shadow-sm" : "bg-white border-slate-200/50 text-slate-600 hover:bg-slate-50"}`}
                    >
                      Voz en Off (Voiceover)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAudioLanguage("silent")}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${audioLanguage === "silent" ? "bg-rose-50 border-rose-200 text-rose-600 shadow-sm" : "bg-white border-slate-200/50 text-slate-600 hover:bg-slate-50"}`}
                    >
                      Sin diálogo (B-Roll)
                    </button>
                  </div>
                </div>
              )}

              {/* Botones de acción */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => handleGeneratePrompt(selectedIdea)}
                  disabled={generatingPrompt}
                  className="py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/50 text-slate-800 text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  {generatingPrompt ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Compass className="w-3.5 h-3.5 text-amber-500" />}
                  Crear Prompt de Flow
                </button>
                <button
                  type="button"
                  onClick={() => handleGenerateCaption(selectedIdea)}
                  disabled={generatingCaption}
                  className="py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/50 text-slate-800 text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  {generatingCaption ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Smartphone className="w-3.5 h-3.5 text-rose-400" />}
                  Generar Copy Instagram
                </button>
              </div>

              {/* Prompt estructurado de Flow con Vestuario Dinámico */}
              {promptOutput && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-bold text-amber-600 uppercase tracking-wider font-semibold">
                      {selectedIdea.type === "carousel" ? "Prompts de Carrusel Estructurados (Flow de Gemini)" :
                       selectedIdea.type === "video" ? "Prompts de Video Multitoma Estructurados (Flow de Gemini)" :
                       selectedIdea.type === "flyer" ? "Prompt de Flyer Publicitario de Lujo (Flow de Gemini)" :
                       "Prompt Estructurado Exclusivo (Copia a Flow de Gemini)"}
                    </span>
                    {promptSteps.length === 0 && (
                      <button
                        type="button"
                        onClick={() => copyToClipboard(promptOutput, "flow_prompt")}
                        className="text-[11px] text-slate-400 hover:text-slate-800 flex items-center gap-1 cursor-pointer font-bold"
                      >
                        {copiedText === "flow_prompt" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedText === "flow_prompt" ? "¡Copiado!" : "Copiar"}
                      </button>
                    )}
                  </div>

                  {promptSteps.length > 0 ? (
                    <div className="space-y-3">
                      {repeatingIngredients && (
                        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/50 text-xs text-amber-800 flex items-start gap-2.5 shadow-sm mb-3">
                          <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5 animate-pulse" />
                          <div>
                            <h4 className="font-bold text-amber-900 text-xs">{"Ingredientes Fijos Detectados"}</h4>
                            <p className="text-[10px] text-amber-700 leading-relaxed mt-0.5 font-semibold">
                              {"Para evitar que los objetos cambien de forma entre fotos/tomas, te sugerimos buscar una imagen única de los siguientes elementos y cargarla como ingrediente de referencia en Flow:"}
                            </p>
                            <p className="font-mono bg-white/50 px-2.5 py-1 rounded border border-amber-100 text-[10px] text-amber-900 mt-2 font-bold inline-block">
                              {repeatingIngredients}
                            </p>
                          </div>
                        </div>
                      )}
                      <p className="text-xs text-slate-500 leading-normal mb-2 font-semibold">
                        Hemos detectado {promptSteps.length} {selectedIdea.type === "carousel" ? "fotos individuales" : "tomas individuales"}. 
                        Copia y genera el prompt de cada una por separado en Flow de Gemini para mantener continuidad total:
                      </p>
                      <div className="grid grid-cols-1 gap-2.5">
                        {promptSteps.map((step, idx) => (
                          <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 relative group flex flex-col justify-between gap-2 shadow-inner">
                            <div className="flex justify-between items-center">
                              <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-wider font-bold">
                                {step.label}
                              </span>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(step.fullText, `flow_step_${idx}`)}
                                className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-[10px] text-slate-200 font-bold flex items-center gap-1 cursor-pointer transition-all border border-white/5"
                              >
                                {copiedText === `flow_step_${idx}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 animate-pulse" />}
                                {copiedText === `flow_step_${idx}` ? "¡Copiado!" : `Copiar Prompt Completo ${step.label}`}
                              </button>
                            </div>
                            
                            <div className="text-[12px] text-slate-350 font-sans italic leading-relaxed bg-slate-950 p-2.5 rounded-lg border border-slate-800 select-all max-h-[120px] overflow-y-auto no-scrollbar font-normal">
                              {step.text}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <textarea
                      readOnly
                      value={promptOutput}
                      rows={6}
                      className="w-full bg-slate-900 border border-slate-850 rounded-xl px-4 py-3 text-xs text-slate-200 font-mono focus:outline-none resize-none leading-relaxed no-scrollbar select-all font-semibold"
                    />
                  )}
                  <p className="text-[10px] text-slate-400 mt-2.5 leading-normal font-semibold">
                    *Nota: La sección DYNAMIC SCENE de arriba viste dinámicamente al avatar {currentAvatar.name} de acuerdo a su entorno.
                  </p>
                </div>
              )}

              {/* Copy de Instagram */}
              {captionOutput && (
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-bold text-rose-500 uppercase tracking-wider flex items-center gap-1.5 font-semibold">
                      {"Copy / Caption de Instagram"}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(captionOutput, "insta_caption")}
                      className="text-[11px] text-slate-400 hover:text-slate-800 flex items-center gap-1 cursor-pointer font-bold"
                    >
                      {copiedText === "insta_caption" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedText === "insta_caption" ? "¡Copiado!" : "Copiar"}
                    </button>
                  </div>
                  <textarea
                    readOnly
                    value={captionOutput}
                    rows={6}
                    className="w-full bg-slate-50 border border-slate-200/50 rounded-xl px-4 py-3 text-sm text-slate-750 leading-relaxed focus:outline-none resize-none no-scrollbar select-all font-medium"
                  />
                </div>
              )}

            </div>
          </div>
        ) : (
          <div className="bg-white/40 border border-dashed border-slate-200 rounded-3xl p-6 flex flex-col items-center justify-center text-center flex-1 min-h-[400px]">
            <Calendar className="w-12 h-12 text-slate-300 mb-3 animate-pulse" />
            <h4 className="text-sm font-bold text-slate-700">Ningún Post Seleccionado</h4>
            <p className="text-xs text-slate-500 max-w-xs mt-1 leading-relaxed">
              Selecciona un post de la izquierda para estructurar sus directrices de vestuario y generar su caption de Instagram.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
