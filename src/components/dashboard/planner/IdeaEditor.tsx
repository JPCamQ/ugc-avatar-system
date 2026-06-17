import React from "react";
import { 
  Calendar, RefreshCw, Globe, Compass, Smartphone, ShieldAlert, Check, Copy 
} from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";
import { parsePromptSteps, parseRepeatingIngredients } from "@/lib/utils";
import { FormField } from "@/components/ui/FormField";
import { PromptStyleSelector } from "./PromptStyleSelector";
import { ProductIntegration } from "./ProductIntegration";
import { AudioLanguageSelector } from "./AudioLanguageSelector";
import { PromptStepCard } from "./PromptStepCard";
import { CaptionOutput } from "./CaptionOutput";

export function IdeaEditor() {
  const {
    currentAvatar,
    selectedIdea,
    postPromptInput,
    setPostPromptInput,
    promptOutput,
    generatingPrompt,
    generatingCaption,
    handleGeneratePrompt,
    handleGenerateCaption,
    copiedText,
    copyToClipboard
  } = useDashboard();

  if (!selectedIdea) {
    return (
      <div className="md:col-span-3 bg-white/40 border border-dashed border-slate-200 rounded-3xl p-6 flex flex-col items-center justify-center text-center flex-1 min-h-[400px]">
        <Calendar className="w-12 h-12 text-slate-300 mb-3 animate-pulse" />
        <h4 className="text-sm font-bold text-slate-700">Ningún Post Seleccionado</h4>
        <p className="text-xs text-slate-500 max-w-xs mt-1 leading-relaxed">
          Selecciona un post de la izquierda para estructurar sus directrices de vestuario y generar su caption de Instagram.
        </p>
      </div>
    );
  }

  const promptSteps = promptOutput ? parsePromptSteps(promptOutput, selectedIdea.type) : [];
  const repeatingIngredients = promptOutput ? parseRepeatingIngredients(promptOutput) : "";

  return (
    <div className="md:col-span-3 bg-white/70 backdrop-blur-md border border-white/60 rounded-3xl p-6 flex flex-col justify-between flex-1 max-h-[620px] overflow-y-auto no-scrollbar shadow-lg shadow-slate-100/50">
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
        <FormField
          label="Escena Visual & Vestuario Dinámico (Modificable)"
          type="textarea"
          value={postPromptInput}
          onChange={setPostPromptInput}
          rows={3}
          inputClassName="bg-slate-50 border border-slate-100 focus:border-rose-300 py-2 text-sm"
          className="mb-4"
        />

        {/* Selector de Estilo de Fotografía */}
        <PromptStyleSelector />

        {/* Integración de Producto */}
        <ProductIntegration />

        {/* Selector de idioma para Flow */}
        <AudioLanguageSelector />

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
                    <PromptStepCard
                      key={idx}
                      step={step}
                      idx={idx}
                      copiedText={copiedText}
                      copyToClipboard={copyToClipboard}
                    />
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
        <CaptionOutput />

      </div>
    </div>
  );
}
