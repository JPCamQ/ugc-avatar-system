import React, { useState, useEffect, useCallback } from "react";
import { TrendingUp, Sparkles, RefreshCw, Key, Check, AlertCircle, ArrowUpRight, Users, Share2, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { AvatarIdentity } from "@/lib/types";

interface MetricsTabProps {
  currentAvatar: AvatarIdentity;
  showSuccess: (msg: string) => void;
  showError: (msg: string) => void;
}

interface RealMetrics {
  followers: number;
  followersChange: number;
  dmsReceived: number;
  dmsChange: number;
  reach: number;
  reachChange: number;
  engagement: number;
  platform: "instagram" | "tiktok" | null;
  isConnected?: boolean;
  isConnectedReal?: boolean;
  connectedUsername?: string | null;
}

interface HistoricalMetric {
  date: string;
  followers: number;
  reach: number;
  engagement: number;
}

export function MetricsTab({
  currentAvatar,
  showSuccess,
  showError
}: MetricsTabProps) {
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"followers" | "reach" | "engagement">("followers");
  
  // Estado para la información sobre métricas
  const [metrics, setMetrics] = useState<RealMetrics>({
    followers: 42300,
    followersChange: 12.0,
    dmsReceived: 3124,
    dmsChange: 8.4,
    reach: 245000,
    reachChange: 18.4,
    engagement: 5.8,
    platform: "instagram",
    isConnected: false,
    isConnectedReal: false,
    connectedUsername: null
  });

  // Estado para el histórico de 7 días
  const [historicalData, setHistoricalData] = useState<HistoricalMetric[]>([]);

  // Estado para el punto hovered en el SVG
  const [hoveredPoint, setHoveredPoint] = useState<{
    index: number;
    x: number;
    y: number;
    val: number;
    date: string;
  } | null>(null);

  const avatarId = currentAvatar?.id;

  // Función para obtener las métricas reales
  const fetchMetrics = useCallback(async () => {
    if (!avatarId) return;
    Promise.resolve().then(() => setLoading(true));
    try {
      const response = await fetch("/api/metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarId, platform: "instagram" })
      });
      const data = await response.json();
      
      if (!response.ok || data.error) {
        throw new Error(data.error || "Error al obtener métricas");
      }
      
      if (data.metrics) {
        setMetrics(data.metrics);
      }
      if (data.historicalData) {
        setHistoricalData(data.historicalData);
      }
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Error desconocido";
      showError(`No se pudieron cargar las métricas en tiempo real: ${msg}. Mostrando datos de simulación.`);
    } finally {
      setLoading(false);
    }
  }, [avatarId, showError]);

  // Cargar métricas al cambiar de avatar o al montar
  useEffect(() => {
    Promise.resolve().then(() => {
      fetchMetrics();
    });
  }, [fetchMetrics]);

  // Desconectar cuenta limpiando los tokens en la DB
  const handleDisconnect = async () => {
    if (!avatarId) return;
    Promise.resolve().then(() => setLoading(true));
    try {
      const response = await fetch(`/api/avatars/${avatarId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instagramAccessToken: null,
          instagramUserId: null,
          instagramUserName: null
        })
      });
      const data = await response.json();
      
      if (!response.ok || data.error) {
        throw new Error(data.error || "Error al desconectar la cuenta");
      }
      
      showSuccess("Cuenta de Instagram desconectada con éxito.");
      await fetchMetrics();
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Error desconocido";
      showError(`No se pudo desconectar la cuenta de Instagram: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  // --- LÓGICA DE DIBUJADO DE GRÁFICO SVG ---
  const width = 600;
  const height = 240;
  const margin = { top: 20, right: 30, bottom: 40, left: 55 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  // Obtener valores según la pestaña activa
  const getValuesArray = () => {
    if (!historicalData.length) return [];
    return historicalData.map(d => {
      if (selectedTab === "followers") return d.followers;
      if (selectedTab === "reach") return d.reach;
      return d.engagement;
    });
  };

  const values = getValuesArray();
  const maxVal = values.length ? Math.max(...values) : 1;
  const minVal = values.length ? Math.min(...values) : 0;
  const valRange = maxVal - minVal;
  
  // Agregar padding al eje Y para que no toque los bordes superior e inferior
  const yMax = maxVal + (valRange * 0.15 || 1);
  const yMin = Math.max(0, minVal - (valRange * 0.15 || 0.1));

  // Generar coordenadas X, Y para cada punto
  const points = historicalData.map((item, i) => {
    const val = selectedTab === "followers" ? item.followers : selectedTab === "reach" ? item.reach : item.engagement;
    const x = margin.left + (i * chartWidth) / (historicalData.length - 1 || 1);
    const y = margin.top + chartHeight - ((val - yMin) / (yMax - yMin || 1)) * chartHeight;
    return { x, y, val, date: item.date, index: i };
  });

  // Crear strings de dibujo para el SVG
  const pathD = points.length 
    ? points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")
    : "";

  const areaD = points.length
    ? `${pathD} L ${points[points.length - 1].x} ${margin.top + chartHeight} L ${points[0].x} ${margin.top + chartHeight} Z`
    : "";

  // Calcular las líneas horizontales de cuadrícula (grid lines)
  const gridLinesCount = 4;
  const gridLines = Array.from({ length: gridLinesCount }).map((_, idx) => {
    const ratio = idx / (gridLinesCount - 1);
    const y = margin.top + ratio * chartHeight;
    const val = yMax - ratio * (yMax - yMin);
    return { y, val };
  });

  // Formatear etiquetas Y
  const formatMetricValue = (val: number) => {
    if (selectedTab === "engagement") return `${val.toFixed(1)}%`;
    return formatNumber(Math.round(val));
  };

  // Manejar el movimiento del mouse sobre el gráfico
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!points.length) return;
    const svgRect = e.currentTarget.getBoundingClientRect();
    const mouseX = ((e.clientX - svgRect.left) / svgRect.width) * width;
    
    // Encontrar el punto X más cercano
    let closest = points[0];
    let minDiff = Math.abs(points[0].x - mouseX);
    
    for (let i = 1; i < points.length; i++) {
      const diff = Math.abs(points[i].x - mouseX);
      if (diff < minDiff) {
        minDiff = diff;
        closest = points[i];
      }
    }
    
    setHoveredPoint(closest);
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };

  return (
    <motion.div
      key="metrics"
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="flex flex-col gap-6 h-full font-sans"
    >
      <div className="bg-white/70 backdrop-blur-md border border-white/60 rounded-3xl p-6 sm:p-8 flex-1 flex flex-col justify-between shadow-lg shadow-slate-100/50">
        <div>
          {/* Cabecera */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-rose-500" />
                Métricas de Impacto de Marca & Engagement de Comunidad
              </h2>
              <p className="text-xs text-slate-500">Muestra el alcance, visualizaciones y fidelización de la comunidad de tu avatar en tiempo real.</p>
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto justify-end">
              {metrics.isConnected ? (
                <button
                  onClick={handleDisconnect}
                  disabled={loading}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold text-red-500 bg-red-50 border border-red-150 hover:bg-red-100 transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? "Procesando..." : "Desconectar API"}
                </button>
              ) : (
                <a
                  href={`/api/auth/instagram?avatarId=${currentAvatar.id}`}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white border border-rose-600/20 transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-rose-500/10"
                >
                  <Key className="w-3.5 h-3.5" />
                  Conectar API Real
                </a>
              )}
            </div>
          </div>

          {/* Banner de Estado de Conexión */}
          <div className={`mb-6 p-3 rounded-2xl border text-xs flex items-center justify-between gap-4 font-semibold ${metrics.isConnected ? "bg-emerald-50 border-emerald-100 text-emerald-800" : "bg-amber-50 border-amber-100 text-amber-800"}`}>
            <div className="flex items-center gap-2">
              {metrics.isConnected ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-amber-600" />}
              <span>
                {metrics.isConnected 
                  ? `Conectado exitosamente a la API de Instagram como @${metrics.connectedUsername || currentAvatar.name}. Datos reales sincronizados.`
                  : "Modo Demostración activo. Las métricas que ves abajo son simulaciones estables de engagement."
                }
              </span>
            </div>
            {!metrics.isConnected && (
              <a 
                href={`/api/auth/instagram?avatarId=${currentAvatar.id}`}
                className="text-[10px] text-amber-700 underline font-black hover:text-amber-900 cursor-pointer"
              >
                Conectar ahora
              </a>
            )}
          </div>

          {/* Fila de Tarjetas de Métricas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-left shadow-sm relative overflow-hidden group">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-semibold">Seguidores {metrics.isConnected ? "Reales" : "Estimados"}</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-black text-slate-800">{formatNumber(metrics.followers)}</span>
                <span className={`text-[10px] font-bold flex items-center ${metrics.followersChange >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                  <ArrowUpRight className="w-3 h-3 inline" /> {metrics.followersChange >= 0 ? "+" : ""}{metrics.followersChange}%
                </span>
              </div>
              <Users className="absolute right-3 bottom-3 w-8 h-8 text-slate-100 group-hover:text-sky-100 transition-colors pointer-events-none" />
            </div>

            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-left shadow-sm relative overflow-hidden group">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-semibold">Mensajes DMs {metrics.isConnected ? "API" : "Recibidos"}</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-black text-slate-800">{metrics.dmsReceived.toLocaleString()}</span>
                <span className={`text-[10px] font-bold flex items-center ${metrics.dmsChange >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                  <ArrowUpRight className="w-3 h-3 inline" /> {metrics.dmsChange >= 0 ? "+" : ""}{metrics.dmsChange}%
                </span>
              </div>
              <MessageSquare className="absolute right-3 bottom-3 w-8 h-8 text-slate-100 group-hover:text-emerald-100 transition-colors pointer-events-none" />
            </div>

            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-left shadow-sm relative overflow-hidden group">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-semibold">Alcance Semanal</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-black text-slate-800">{formatNumber(metrics.reach)}</span>
                <span className={`text-[10px] font-bold flex items-center ${metrics.reachChange >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                  <ArrowUpRight className="w-3 h-3 inline" /> {metrics.reachChange >= 0 ? "+" : ""}{metrics.reachChange}%
                </span>
              </div>
              <Share2 className="absolute right-3 bottom-3 w-8 h-8 text-slate-100 group-hover:text-rose-100 transition-colors pointer-events-none" />
            </div>

            <div className="bg-rose-50/70 border border-rose-100 p-4 rounded-2xl text-left shadow-sm relative overflow-hidden group">
              <span className="text-[9px] font-bold text-rose-600 uppercase tracking-wider block font-semibold">Engagement Promedio</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-black text-rose-600">{metrics.engagement}%</span>
                <span className="text-[10px] text-rose-500 font-bold ml-1">Muy Alto</span>
              </div>
              <Sparkles className="absolute right-3 bottom-3 w-8 h-8 text-rose-100/30 group-hover:text-rose-200/50 transition-colors pointer-events-none" />
            </div>
          </div>

          {/* Gráfico Histórico Interactivo SVG */}
          <div className="bg-white border border-slate-100 rounded-3xl p-5 mb-6 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
              <div>
                <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-rose-500" />
                  Rendimiento Histórico (Últimos 7 días)
                </h3>
                <p className="text-[10px] text-slate-400">Interactúa con el gráfico pasando el cursor sobre los puntos.</p>
              </div>

              {/* Pestañas del Gráfico */}
              <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200/40">
                <button
                  onClick={() => setSelectedTab("followers")}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${selectedTab === "followers" ? "bg-white text-sky-600 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                >
                  Seguidores
                </button>
                <button
                  onClick={() => setSelectedTab("reach")}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${selectedTab === "reach" ? "bg-white text-pink-600 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                >
                  Alcance
                </button>
                <button
                  onClick={() => setSelectedTab("engagement")}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${selectedTab === "engagement" ? "bg-white text-violet-600 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                >
                  Engagement
                </button>
              </div>
            </div>

            {loading ? (
              <div className="h-[240px] flex items-center justify-center text-slate-400 text-xs">
                <RefreshCw className="w-5 h-5 animate-spin mr-2 text-rose-500" />
                Cargando historial de métricas...
              </div>
            ) : historicalData.length === 0 ? (
              <div className="h-[240px] flex items-center justify-center text-slate-400 text-xs">
                No hay datos históricos disponibles en este momento.
              </div>
            ) : (
              <div className="relative w-full">
                {/* SVG del Gráfico */}
                <svg
                  viewBox={`0 0 ${width} ${height}`}
                  className="w-full h-auto overflow-visible select-none"
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                >
                  {/* Definición de degradados */}
                  <defs>
                    <linearGradient id="grad-followers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="grad-reach" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ec4899" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#ec4899" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="grad-engagement" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Líneas horizontales de cuadrícula (Grid Lines) */}
                  {gridLines.map((line, idx) => (
                    <g key={idx}>
                      <line
                        x1={margin.left}
                        y1={line.y}
                        x2={width - margin.right}
                        y2={line.y}
                        stroke="#f1f5f9"
                        strokeWidth={1}
                      />
                      <text
                        x={margin.left - 10}
                        y={line.y + 3}
                        textAnchor="end"
                        className="text-[9px] font-bold fill-slate-400 font-sans"
                      >
                        {formatMetricValue(line.val)}
                      </text>
                    </g>
                  ))}

                  {/* Líneas verticales tenues y etiquetas de fechas (Eje X) */}
                  {points.map((p, idx) => (
                    <g key={idx}>
                      <line
                        x1={p.x}
                        y1={margin.top}
                        x2={p.x}
                        y2={margin.top + chartHeight}
                        stroke="#f8fafc"
                        strokeWidth={1}
                      />
                      <text
                        x={p.x}
                        y={height - margin.bottom + 18}
                        textAnchor="middle"
                        className="text-[9px] font-bold fill-slate-400 font-sans"
                      >
                        {p.date}
                      </text>
                    </g>
                  ))}

                  {/* Degradado bajo la curva */}
                  <path
                    d={areaD}
                    fill={`url(#grad-${selectedTab})`}
                  />

                  {/* Línea de Curva Principal */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={
                      selectedTab === "followers" 
                        ? "#0ea5e9" 
                        : selectedTab === "reach" 
                        ? "#ec4899" 
                        : "#8b5cf6"
                    }
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Línea vertical de guía cuando hay Hover */}
                  {hoveredPoint && (
                    <line
                      x1={hoveredPoint.x}
                      y1={margin.top}
                      x2={hoveredPoint.x}
                      y2={margin.top + chartHeight}
                      stroke={
                        selectedTab === "followers" 
                          ? "#0ea5e9" 
                          : selectedTab === "reach" 
                          ? "#ec4899" 
                          : "#8b5cf6"
                      }
                      strokeWidth={1}
                      strokeDasharray="4 4"
                    />
                  )}

                  {/* Círculos en los nodos */}
                  {points.map((p, idx) => (
                    <circle
                      key={idx}
                      cx={p.x}
                      cy={p.y}
                      r={hoveredPoint?.index === idx ? 6 : 4}
                      fill={
                        selectedTab === "followers" 
                          ? "#0ea5e9" 
                          : selectedTab === "reach" 
                          ? "#ec4899" 
                          : "#8b5cf6"
                      }
                      stroke="#ffffff"
                      strokeWidth={2}
                      className="transition-all duration-75"
                    />
                  ))}
                </svg>

                {/* Tooltip flotante absoluto en HTML */}
                {hoveredPoint && (
                  <div
                    className="absolute pointer-events-none bg-slate-900/90 text-white text-[10px] p-2.5 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-md transition-all duration-75 font-sans"
                    style={{
                      left: `${(hoveredPoint.x / width) * 100}%`,
                      top: `${(hoveredPoint.y / height) * 100 - 18}%`,
                      transform: "translate(-50%, -100%)"
                    }}
                  >
                    <div className="font-bold text-slate-300 mb-0.5">{hoveredPoint.date}</div>
                    <div className="font-extrabold flex items-center gap-1">
                      <span 
                        className={`w-1.5 h-1.5 rounded-full ${
                          selectedTab === "followers" 
                            ? "bg-sky-400" 
                            : selectedTab === "reach" 
                            ? "bg-pink-400" 
                            : "bg-violet-400"
                        }`} 
                      />
                      {selectedTab === "followers" && `Seguidores: ${hoveredPoint.val.toLocaleString()}`}
                      {selectedTab === "reach" && `Alcance: ${hoveredPoint.val.toLocaleString()}`}
                      {selectedTab === "engagement" && `Engagement: ${hoveredPoint.val.toFixed(1)}%`}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tabla de Conversiones */}
          <div className="border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-sm">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h4 className="text-xs font-bold text-slate-800">Registro de Interacciones de Alto Valor en DMs</h4>
              <span className="px-2 py-0.5 rounded bg-rose-50 text-[9px] text-rose-500 font-bold uppercase animate-pulse">En vivo</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 font-bold text-[9px] uppercase">
                    <th className="p-3">Seguidor</th>
                    <th className="p-3">Nacionalidad</th>
                    <th className="p-3">Interacción</th>
                    <th className="p-3">Impacto / Estado</th>
                    <th className="p-3 text-right">Tiempo</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="p-3 text-slate-800 font-semibold">@sofia_style</td>
                    <td className="p-3 text-slate-500">Buenos Aires</td>
                    <td className="p-3 text-rose-600 font-semibold">Pregunta por Outfit en Foto</td>
                    <td className="p-3 text-slate-800 font-bold">Fidelizado / Conectado</td>
                    <td className="p-3 text-slate-400 text-right">Hace 15 min</td>
                  </tr>
                  <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="p-3 text-slate-800 font-semibold">@marcos_fit</td>
                    <td className="p-3 text-slate-500">Santiago</td>
                    <td className="p-3 text-rose-600 font-semibold">Recomendación de Spot en Caracas</td>
                    <td className="p-3 text-slate-800 font-bold">Fidelizado / Conectado</td>
                    <td className="p-3 text-slate-400 text-right">Hace 1 hora</td>
                  </tr>
                  <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="p-3 text-slate-800 font-semibold">@mariana_nomad</td>
                    <td className="p-3 text-slate-500">Bogotá</td>
                    <td className="p-3 text-rose-600 font-semibold">Pregunta por Rutina Gym de Reels</td>
                    <td className="p-3 text-slate-800 font-bold">Fidelizado / Conectado</td>
                    <td className="p-3 text-slate-400 text-right">Hace 2 horas</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Sección Informativa Comercial */}
        <div className="mt-6 p-5 rounded-2xl bg-slate-50 border border-slate-200/50">
          <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-rose-500" />
            Estrategia de Crecimiento & Engagement de Marca Personal
          </h4>
          <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
            El avatar de **{currentAvatar.name}** es tu muestra en vivo de la efectividad del contenido de lifestyle y engagement orgánico. Enséñales cómo {currentAvatar.name} planifica su contenido de fitness y estilo de vida centrado en la disciplina, genera prompts de video consistentes de 3 tomas para la plataforma Flow de Gemini, e interactúa con su comunidad respondiendo DMs de forma automatizada, directa y con actitud.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
