import React from "react";
import { Award, RefreshCw, Sparkles, Smartphone, Check, Copy, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";
import { AvatarIdentity } from "@/lib/db";

interface SetupTabProps {
  currentAvatar: AvatarIdentity;
  setupData: {
    usernames: string[];
    bios: string[];
    gridPlan: string[];
    seoTips: string[];
  } | null;
  generatingSetup: boolean;
  handleGetSetupData: () => void;
  copiedText: string | null;
  copyToClipboard: (text: string, label: string) => void;
}

export function SetupTab({
  currentAvatar,
  setupData,
  generatingSetup,
  handleGetSetupData,
  copiedText,
  copyToClipboard
}: SetupTabProps) {
  return (
    <motion.div
      key="setup"
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="flex flex-col gap-6 h-full"
    >
      <div className="bg-white/70 backdrop-blur-md border border-white/60 rounded-3xl p-6 sm:p-8 flex-1 flex flex-col justify-between shadow-lg shadow-slate-100/50">
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-rose-500" />
                Módulo de Setup Viral (Instagram & TikTok)
              </h2>
              <p className="text-xs text-slate-500">Crea el perfil profesional perfecto desde cero para que el algoritmo impulse al avatar rápidamente.</p>
            </div>

            <button
              onClick={handleGetSetupData}
              disabled={generatingSetup}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:opacity-90 disabled:opacity-50 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-rose-500/10 w-full sm:w-auto justify-center"
            >
              {generatingSetup ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              Generar Plan de Setup
            </button>
          </div>

          {setupData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Nombres de usuario y Biografía */}
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wide font-semibold">Nombres de Usuario Recomendados (Disponibilidad SEO)</span>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {setupData.usernames.map((u, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => copyToClipboard(u, `usr_${i}`)}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200/50 hover:bg-slate-50 hover:border-slate-300 text-xs font-bold text-slate-700 flex items-center gap-1 cursor-pointer transition-all"
                      >
                        {u}
                        {copiedText === `usr_${i}` ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-slate-400" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wide font-semibold">Biografías Magnéticas (Ganchos de Conversión)</span>
                  <div className="mt-2.5 space-y-3">
                    {setupData.bios.map((b, i) => (
                      <div key={i} className="bg-white p-3 rounded-xl border border-slate-200/30 relative group">
                        <pre className="text-xs text-slate-700 font-sans whitespace-pre-line leading-relaxed">{b}</pre>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(b, `bio_${i}`)}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-all cursor-pointer"
                          title="Copiar biografía"
                        >
                          {copiedText === `bio_${i}` ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Plan de Grid Inicial y Tips Algorítmicos */}
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wide font-semibold">Primeros 3 Posts Fijos Anclados (Feed Setup)</span>
                  <div className="mt-2.5 space-y-2">
                    {setupData.gridPlan.map((p, i) => (
                      <div key={i} className="flex gap-2 items-start bg-white p-3 rounded-xl border border-slate-200/30 font-semibold">
                        <span className="w-5 h-5 rounded-full bg-amber-50 border border-amber-100 text-amber-600 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                          {i + 1}
                        </span>
                        <p className="text-xs text-slate-700 leading-normal font-normal">{p}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide font-semibold">Estrategias SEO y Algoritmo para Cuentas Nuevas</span>
                  <div className="mt-2.5 space-y-2">
                    {setupData.seoTips.map((t, i) => (
                      <div key={i} className="flex gap-2 items-start bg-white p-3 rounded-xl border border-slate-200/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                        <p className="text-xs text-slate-600 leading-normal">{t}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-10 py-16 border border-dashed border-slate-200 rounded-3xl">
              <Smartphone className="w-12 h-12 text-slate-300 mb-3 animate-pulse" />
              <h4 className="text-sm font-bold text-slate-700">El plan no se ha configurado</h4>
              <p className="text-xs text-slate-500 max-w-xs mt-1 leading-relaxed">
                Haz clic en **"Generar Plan de Setup"** para que DeepSeek analice el nicho de {currentAvatar.name} y te diseñe los usernames, bios magnéticas y el feed inicial perfecto.
              </p>
            </div>
          )}

        </div>

        <div className="mt-6 p-4 rounded-2xl bg-amber-50/50 border border-amber-100 flex items-center gap-3">
          <ShieldAlert className="w-6 h-6 text-amber-600 flex-shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-slate-800">Importancia de la Optimización Inicial</h4>
            <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
              Instagram y TikTok otorgan un "boost inicial" de visibilidad a los perfiles recién creados para calentar la cuenta. Configurar una biografía clara con SEO (palabras clave del nicho) y anclar los posts biográficos correctos multiplicará tu conversión de seguidores el primer mes.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
