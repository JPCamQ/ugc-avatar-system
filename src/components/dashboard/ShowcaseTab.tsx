import React, { useState, useEffect } from "react";
import { 
  Sparkles, RefreshCw, Copy, Check, Instagram, User, Image, FileText, AlertTriangle 
} from "lucide-react";
import { motion } from "framer-motion";
import { parsePromptSteps } from "@/lib/utils";

interface ShowcaseTabProps {
  apiKey: string;
  copiedText: string | null;
  copyToClipboard: (text: string, label: string) => void;
  showError: (msg: string) => void;
  showSuccess: (msg: string) => void;
}

interface ShowcaseData {
  avatar_info: {
    nombre: string;
    detalles: string;
    dna_fisico: string;
  };
  carrusel_prompts: {
    dynamic_scene: string;
    makeup_level: string;
  };
  instagram_caption: string;
}

export function ShowcaseTab({
  apiKey,
  copiedText,
  copyToClipboard,
  showError,
  showSuccess
}: ShowcaseTabProps) {
  const [showcaseData, setShowcaseData] = useState<ShowcaseData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedGender, setSelectedGender] = useState<"Femenino" | "Masculino">("Femenino");

  // Recuperar última muestra guardada localmente
  useEffect(() => {
    const saved = localStorage.getItem("ugc_agency_showcase");
    if (saved) {
      try {
        setShowcaseData(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleGenerateShowcase = async () => {
    setIsGenerating(true);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (apiKey) {
        headers["Authorization"] = `Bearer ${apiKey}`;
      }

      const response = await fetch("/api/showcase/generate", {
        method: "POST",
        headers,
        body: JSON.stringify({ apiKey, gender: selectedGender })
      });

      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || `Error en el servidor (${response.status})`);
      }

      setShowcaseData(data.showcaseData);
      localStorage.setItem("ugc_agency_showcase", JSON.stringify(data.showcaseData));
      showSuccess("Muestra de carrusel y copy de ventas generados con éxito.");
    } catch (e: any) {
      console.error(e);
      showError(e.message || "Error al conectar con la API de generación de muestras.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Ensamblar el prompt completo de carrusel de producción v2.0
  const getFullPrompt = (): string => {
    if (!showcaseData) return "";
    return `HIGH-FIDELITY CHARACTER DNA: [${showcaseData.avatar_info.dna_fisico}] Master.

MAKEUP PROTOCOL — Context-adaptive:
LEVEL 1 / GYM & SPORT: No makeup. Natural face, slight sweat shine, real skin only.
LEVEL 2 / CASUAL & LIFESTYLE: Minimal makeup — subtle brow definition, light tinted moisturizer, clear lip balm. Looks effortless, not done up.
LEVEL 3 / GOING OUT & SOCIAL: Natural glam — defined brows, light foundation, soft contour, nude or berry lip, subtle mascara. Polished but not overdone.
LEVEL 4 / FORMAL & EVENTS: Polished glam — flawless base, soft sculpted contour, defined brows, nude-rose or soft berry lip — NEVER dark red or gothic tones. Defined lashes. Looks powerful but still recognizably the character.
Apply the makeup level that matches the scene context automatically. Never leave face bare in formal or social contexts.

DYNAMIC SCENE: [${showcaseData.carrusel_prompts.dynamic_scene}]

MAKEUP LEVEL TO APPLY: [${showcaseData.carrusel_prompts.makeup_level}]

AUTHENTIC CREATOR: Shot on iPhone 17 Pro Max, wide angle lens, natural light only, no flash. Slightly overexposed. Real skin texture with natural inconsistencies — uneven tone, Soft makeup, nothing exaggerated, real pores, slight shine from heat and sun. Hair not perfectly styled — a few strands out of place. Expression relaxed, not composed for a camera. Framing slightly imperfect, subject not perfectly centered. The image looks like something posted to Instagram stories without editing. No studio lighting. No cinematic look. No color science adjustments.
Negative prompt constraints: bokeh, blurred background, golden hour, cinematic lighting, soft diffusion, studio lighting, color grading, beauty filter, perfect symmetry, airbrushed skin, plastic skin, 8K, hyper-detailed, Sony camera aesthetic, magazine quality, luxury campaign feel.`;
  };

  const fullPrompt = getFullPrompt();

  // Parsear tomas individuales
  const promptSteps = showcaseData && fullPrompt 
    ? parsePromptSteps(fullPrompt, "carousel") 
    : [];

  return (
    <motion.div
      key="showcase"
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="flex flex-col gap-6 h-full font-sans"
    >
      <div className="bg-white/70 backdrop-blur-md border border-white/60 rounded-3xl p-6 sm:p-8 flex-1 flex flex-col justify-between shadow-lg shadow-slate-100/50">
        
        <div>
          {/* Cabecera de la sección */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                Muestras Publicitarias de la Agencia
              </h2>
              <p className="text-xs text-slate-500">
                Genera campañas de muestra de avatares aleatorios consistentes y copys comerciales para promocionar VirtualSoul.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              {/* Selector de Género para Muestra */}
              <div className="flex items-center bg-slate-100/80 p-1 rounded-xl border border-slate-200/50 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setSelectedGender("Femenino")}
                  disabled={isGenerating}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedGender === "Femenino"
                      ? "bg-white text-purple-600 shadow-sm"
                      : "text-slate-550 hover:text-slate-800"
                  } disabled:opacity-50`}
                >
                  Femenino
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedGender("Masculino")}
                  disabled={isGenerating}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedGender === "Masculino"
                      ? "bg-white text-purple-600 shadow-sm"
                      : "text-slate-550 hover:text-slate-800"
                  } disabled:opacity-50`}
                >
                  Masculino
                </button>
              </div>

              {!isGenerating && (
                <button
                  type="button"
                  onClick={handleGenerateShowcase}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-rose-500 text-white hover:from-purple-700 hover:to-rose-600 transition-all cursor-pointer shadow-md shadow-purple-500/10 flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Generar Muestra
                </button>
              )}
            </div>
          </div>

          {/* Estado de Carga */}
          {isGenerating && (
            <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-slate-200 rounded-3xl bg-white/40">
              <div className="relative mb-6">
                <div className="absolute inset-0 rounded-full bg-purple-500/10 blur-xl animate-pulse" />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  className="relative z-10 p-4 bg-white rounded-full border border-slate-100 shadow-md flex items-center justify-center"
                >
                  <RefreshCw className="w-8 h-8 text-purple-500 animate-spin" />
                </motion.div>
              </div>
              <h4 className="text-sm font-bold text-slate-800 mb-1 flex items-center gap-1.5 justify-center">
                <Sparkles className="w-4 h-4 text-amber-500 animate-bounce" />
                Diseñando Campaña de Muestra
              </h4>
              <p className="text-xs text-purple-500 font-bold mb-2 animate-pulse">
                Poblando características de modelo ficticio y copy de ventas...
              </p>
              <p className="text-[10px] text-slate-400 max-w-sm leading-relaxed">
                Nuestra IA está modelando una estructura de 5 fotos altamente consistentes y redactando una propuesta comercial con alto gancho de conversión para tu Instagram corporativo.
              </p>
            </div>
          )}

          {/* Contenido Generado */}
          {!isGenerating && showcaseData && (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">
              
              {/* Columna Izquierda: Información del Avatar Ficticio e Ideas (2 Columnas) */}
              <div className="lg:col-span-2 flex flex-col gap-5">
                
                {/* Caja de Identidad del Avatar */}
                <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-5">
                  <span className="text-[9px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold border border-purple-100 mb-2.5 inline-block">
                    Avatar Sintético Creado
                  </span>
                  <h3 className="text-sm font-extrabold text-slate-800 mb-1 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-purple-500" />
                    {showcaseData.avatar_info.nombre}
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-3">
                    {showcaseData.avatar_info.detalles}
                  </p>
                  
                  <div className="mt-3">
                    <label className="block text-[9px] font-bold text-slate-450 uppercase mb-1 font-semibold">
                      DNA Físico (Consistencia Visual)
                    </label>
                    <div className="bg-slate-900 text-slate-200 font-mono text-[9px] rounded-xl p-3 leading-relaxed border border-slate-850 max-h-36 overflow-y-auto no-scrollbar whitespace-pre-wrap select-all">
                      {showcaseData.avatar_info.dna_fisico}
                    </div>
                  </div>
                </div>

                {/* Caja del Copy Publicitario de la Agencia */}
                <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[9px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold border border-rose-100 flex items-center gap-0.5">
                        <Instagram className="w-3 h-3" />
                        Copy Corporativo
                      </span>
                      <button
                        onClick={() => copyToClipboard(showcaseData.instagram_caption, "showcase_caption")}
                        className="text-[9px] text-purple-600 hover:text-purple-700 flex items-center gap-0.5 cursor-pointer font-bold bg-white border border-slate-200 px-2 py-0.5 rounded-lg shadow-sm hover:shadow-md transition-all"
                      >
                        {copiedText === "showcase_caption" ? "¡Copiado!" : "Copiar Copy"}
                      </button>
                    </div>
                    
                    <pre className="w-full bg-white border border-slate-150 rounded-xl p-4 text-[10px] text-slate-650 leading-relaxed font-sans whitespace-pre-wrap max-h-80 overflow-y-auto no-scrollbar">
                      {showcaseData.instagram_caption}
                    </pre>
                  </div>
                </div>

              </div>

              {/* Columna Derecha: Prompts del Carrusel de Flow (3 Columnas) */}
              <div className="lg:col-span-3 flex flex-col gap-5">
                
                {/* Encabezado de la barra del carrusel */}
                <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-5">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Image className="w-4 h-4 text-purple-500" />
                      Tomas de Consistencia Visual del Carrusel (Flow)
                    </h3>
                    <button
                      onClick={() => copyToClipboard(fullPrompt, "showcase_full_prompt")}
                      className="text-[9px] text-rose-500 hover:text-rose-600 flex items-center gap-0.5 cursor-pointer font-bold bg-white border border-slate-200 px-2 py-0.5 rounded-lg shadow-sm hover:shadow-md transition-all"
                    >
                      {copiedText === "showcase_full_prompt" ? "¡Copiado!" : "Copiar Prompt Completo"}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed mb-4">
                    Copia e introduce cada toma de manera individual en la plataforma **Flow de Gemini** para renderizar las 5 fotos consistentes del nuevo avatar ficticio.
                  </p>

                  <div className="space-y-3 max-h-[350px] overflow-y-auto no-scrollbar pr-1">
                    {promptSteps.map((step, idx) => (
                      <div key={idx} className="bg-white border border-slate-150 rounded-xl p-3">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-[9px] font-bold text-purple-600 bg-purple-50/50 px-2 py-0.5 rounded-md border border-purple-100 uppercase">
                            {step.label}
                          </span>
                          <button
                            onClick={() => copyToClipboard(step.fullText, `showcase_step_${idx}`)}
                            className="text-[9px] text-slate-450 hover:text-slate-700 flex items-center gap-0.5 cursor-pointer font-bold border border-slate-100 px-2 py-0.5 rounded-md hover:bg-slate-50 transition-all"
                          >
                            {copiedText === `showcase_step_${idx}` ? "¡Copiado!" : "Copiar Prompt"}
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-650 font-mono leading-relaxed truncate-2-lines whitespace-normal">
                          {step.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Caja de Instrucciones */}
                <div className="p-4 bg-amber-50/40 border border-amber-100 rounded-2xl flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-[11px] font-bold text-slate-800">¿Cómo usar estas muestras?</h4>
                    <p className="text-[9px] text-slate-500 mt-0.5 leading-relaxed">
                      1. Copia el <strong>Prompt de la Toma 1</strong> y ejecútalo en Flow de Gemini. Almacena ese primer retrato como tu imagen base.<br />
                      2. Copia los prompts de las Tomas 2 a 5 para renderizar el resto del carrusel con perfecta consistencia física.<br />
                      3. Publica las imágenes resultantes en el Instagram de tu agencia y acompáñalas del <strong>Copy Corporativo</strong> para captar nuevos clientes interesados.
                    </p>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* Estado Vacío */}
          {!isGenerating && !showcaseData && (
            <div className="flex flex-col items-center justify-center py-28 text-center border border-dashed border-slate-200 rounded-3xl bg-white/20">
              <Sparkles className="w-10 h-10 text-purple-300 opacity-30 mb-2.5" />
              <h4 className="text-sm font-bold text-slate-700 mb-1">Generador de Muestras para el Instagram de tu Agencia</h4>
              <p className="text-xs text-slate-500 max-w-sm mb-6 leading-relaxed">
                Genera al instante material publicitario consistente de un avatar inventado y copys de ventas corporativos para atraer marcas de clientes a tu agencia.
              </p>
              <button
                onClick={handleGenerateShowcase}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-rose-500 hover:from-purple-700 hover:to-rose-600 text-white text-xs font-bold transition-all cursor-pointer shadow-lg shadow-purple-500/15 flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-white animate-pulse" />
                Diseñar Primera Muestra Aleatoria
              </button>
            </div>
          )}

        </div>

      </div>
    </motion.div>
  );
}
