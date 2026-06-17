"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  DollarSign,
  Calendar as CalendarIcon,
  Sparkles,
  Shield,
  Trash2,
  X,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  Plus,
  TrendingUp,
  MessageCircle,
  Clock
} from "lucide-react";

interface Client {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  country: string;
  plan: string;
  startDate: string;
  billingDay: number;
  setupPaid: boolean;
  avatarName: string;
  niche: string;
  notes: string | null;
  status: string;
}

interface ContentItem {
  id: string;
  clientId: string;
  type: string;
  desc: string;
  date: string;
  status: string;
}

interface Avatar {
  id: string;
  name: string;
  niche: string;
  createdAt?: string;
}

const PLANS: Record<string, { name: string; setup: number; monthly: number }> = {
  basic: { name: "Básico", setup: 300, monthly: 500 },
  pro: { name: "Profesional", setup: 500, monthly: 1200 },
  premium: { name: "Premium", setup: 800, monthly: 2500 }
};

export default function IntegratedAdminPanel() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "clients" | "billing" | "calendar" | "avatars" | "content">("dashboard");
  const [clients, setClients] = useState<Client[]>([]);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [avatars, setAvatars] = useState<Avatar[]>([]);

  // Estados de Modales
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);

  // Formularios
  const [clientForm, setClientForm] = useState({
    name: "",
    email: "",
    whatsapp: "",
    country: "",
    plan: "",
    setup: "",
    monthly: "",
    startDate: "",
    billingDay: 1,
    setupPaid: false,
    avatarName: "",
    niche: "",
    notes: ""
  });

  const [contentForm, setContentForm] = useState({
    clientId: "",
    type: "post",
    desc: "",
    date: "",
    status: "pending"
  });

  // Estado del Calendario
  const [calDate, setCalDate] = useState(() => new Date(2026, 5, 1)); // Junio 2026

  // Cargar datos del servidor
  const fetchData = useCallback(async () => {
    try {
      const resClients = await fetch("/api/admin/clients");
      const dataClients = await resClients.json();
      if (dataClients.data) setClients(dataClients.data);

      const resContent = await fetch("/api/admin/content");
      const dataContent = await resContent.json();
      if (dataContent.data) setContent(dataContent.data);

      const resAvatars = await fetch("/api/avatars");
      const dataAvatars = await resAvatars.json();
      if (dataAvatars.data) setAvatars(dataAvatars.data);
    } catch (e) {
      console.error("Error al cargar datos de administración:", e);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchData();
    });
  }, [fetchData]);

  // Auxiliares de Facturación
  const getNextBillingDate = (client: Client) => {
    const today = new Date();
    let d = new Date(today.getFullYear(), today.getMonth(), client.billingDay);
    if (d <= today) {
      d = new Date(today.getFullYear(), today.getMonth() + 1, client.billingDay);
    }
    return d;
  };

  const getDaysUntil = (dueDate: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    return Math.round((due.getTime() - today.getTime()) / 86400000);
  };

  const formatShortDate = (dateStr: string | Date) => {
    return new Date(dateStr).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const getMonthsActive = (startDateStr: string) => {
    const start = new Date(startDateStr);
    const today = new Date();
    return Math.max(0, (today.getFullYear() - start.getFullYear()) * 12 + today.getMonth() - start.getMonth());
  };

  const getPaymentStatus = (client: Client) => {
    const nextBill = getNextBillingDate(client);
    const days = getDaysUntil(nextBill);
    if (days < 0) return { label: "Vencido", cls: "bg-red-50 text-red-700 border-red-100", days };
    if (days <= 5) return { label: `Vence ${days}d`, cls: "bg-amber-50 text-amber-700 border-amber-100", days };
    return { label: "Al día", cls: "bg-emerald-50 text-emerald-700 border-emerald-100", days };
  };

  // CRUD de Clientes
  const handleSaveClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientForm.name || !clientForm.plan) {
      alert("Por favor, completa el nombre y el plan.");
      return;
    }

    try {
      const res = await fetch("/api/admin/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: clientForm.name,
          email: clientForm.email,
          whatsapp: clientForm.whatsapp,
          country: clientForm.country,
          plan: clientForm.plan,
          startDate: clientForm.startDate,
          billingDay: clientForm.billingDay,
          setupPaid: clientForm.setupPaid,
          avatarName: clientForm.avatarName,
          niche: clientForm.niche,
          notes: clientForm.notes
        })
      });

      if (res.ok) {
        setIsClientModalOpen(false);
        setClientForm({
          name: "",
          email: "",
          whatsapp: "",
          country: "",
          plan: "",
          setup: "",
          monthly: "",
          startDate: "",
          billingDay: 1,
          setupPaid: false,
          avatarName: "",
          niche: "",
          notes: ""
        });
        fetchData();
        alert("Cliente guardado con éxito.");
      } else {
        const err = await res.json();
        alert("Error: " + err.error);
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión al guardar cliente.");
    }
  };

  const handleMarkSetupPaid = async (client: Client) => {
    try {
      const res = await fetch(`/api/admin/clients/${client.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ setupPaid: true })
      });
      if (res.ok) {
        fetchData();
        alert("Setup Fee marcado como pagado.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRegisterPayment = async (client: Client) => {
    try {
      alert(`Pago de mensualidad de $${(PLANS[client.plan]?.monthly || 0).toLocaleString()} registrado para ${client.name}.`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este cliente?")) return;
    try {
      const res = await fetch(`/api/admin/clients/${clientId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        fetchData();
        alert("Cliente eliminado.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // CRUD de Contenido
  const handleSaveContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contentForm.clientId || !contentForm.desc) {
      alert("Por favor, selecciona un cliente e introduce una descripción.");
      return;
    }

    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contentForm)
      });

      if (res.ok) {
        setIsContentModalOpen(false);
        setContentForm({
          clientId: "",
          type: "post",
          desc: "",
          date: "",
          status: "pending"
        });
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleNextStatus = async (item: ContentItem) => {
    const statuses = ["pending", "generated", "approved", "published"];
    const nextIndex = (statuses.indexOf(item.status) + 1) % statuses.length;
    try {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, status: statuses[nextIndex] })
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteContent = async (contentId: string) => {
    if (!confirm("¿Eliminar contenido?")) return;
    try {
      const res = await fetch(`/api/admin/content?id=${contentId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePlanChange = (planKey: string) => {
    const plan = PLANS[planKey];
    if (plan) {
      setClientForm((prev) => ({
        ...prev,
        plan: planKey,
        setup: `$${plan.setup}`,
        monthly: `$${plan.monthly.toLocaleString()}`
      }));
    } else {
      setClientForm((prev) => ({
        ...prev,
        plan: "",
        setup: "",
        monthly: ""
      }));
    }
  };

  const handleSendReminder = (client: Client, amount: number) => {
    const msg = encodeURIComponent(
      `Hola ${client.name}! Recordatorio de pago pendiente por $${amount.toLocaleString()} con VirtualSoul Agency. ¡Gracias!`
    );
    window.open(`https://wa.me/${client.whatsapp.replace(/\D/g, "")}?text=${msg}`, "_blank");
  };

  const exportCSV = () => {
    const rows = [["Cliente", "Plan", "Mensualidad", "Próximo Cobro", "Estado"]];
    clients.forEach((c) => {
      const ps = getPaymentStatus(c);
      rows.push([c.name, PLANS[c.plan]?.name || c.plan, `$${PLANS[c.plan]?.monthly || 0}`, formatShortDate(getNextBillingDate(c)), ps.label]);
    });
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(rows.map((r) => r.join(",")).join("\n"));
    a.download = "cobros.csv";
    a.click();
  };

  // Renderizado del Calendario
  const renderCalendarCells = () => {
    const months = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    const firstDay = new Date(calDate.getFullYear(), calDate.getMonth(), 1);
    let startDayIdx = firstDay.getDay() - 1;
    if (startDayIdx < 0) startDayIdx = 6; // Lunes = 0

    const totalDays = new Date(calDate.getFullYear(), calDate.getMonth() + 1, 0).getDate();
    const today = new Date();

    const cells: React.ReactNode[] = [];

    // Celdas grises del mes anterior
    for (let i = 0; i < startDayIdx; i++) {
      const prevDate = new Date(calDate.getFullYear(), calDate.getMonth(), -startDayIdx + i + 1);
      cells.push(
        <div key={`prev-${i}`} className="bg-slate-50 border border-slate-100 rounded-xl p-2 min-h-[70px] opacity-40 select-none">
          <span className="text-[10px] text-slate-400 font-bold font-mono">{prevDate.getDate()}</span>
        </div>
      );
    }

    // Celdas del mes activo
    for (let d = 1; d <= totalDays; d++) {
      const isToday =
        d === today.getDate() &&
        calDate.getMonth() === today.getMonth() &&
        calDate.getFullYear() === today.getFullYear();

      // Métricas y contenidos del día
      const dayEvents = content.filter((c) => {
        const cd = new Date(c.date);
        return (
          cd.getDate() === d &&
          cd.getMonth() === calDate.getMonth() &&
          cd.getFullYear() === calDate.getFullYear()
        );
      });

      const dayPayments = clients.filter((c) => c.billingDay === d);

      cells.push(
        <div
          key={`day-${d}`}
          className={`border rounded-xl p-2 min-h-[75px] transition-all flex flex-col justify-between ${
            isToday
              ? "bg-rose-50/50 border-rose-200 ring-1 ring-rose-200"
              : "bg-white border-slate-100 hover:border-slate-200"
          }`}
        >
          <span className={`text-[10px] font-bold font-mono ${isToday ? "text-rose-500 font-black" : "text-slate-500"}`}>{d}</span>
          
          <div className="flex flex-col gap-1 mt-1 overflow-hidden">
            {dayPayments.map((c) => (
              <div key={`pay-${c.id}`} className="text-[8px] font-bold px-1 py-0.5 rounded bg-emerald-50 text-emerald-655 border border-emerald-100 truncate" title={`Cobro mensual: ${c.name}`}>
                $ {c.avatarName || c.name}
              </div>
            ))}
            {dayEvents.map((e) => {
              const cl = clients.find((x) => x.id === e.clientId);
              const typeColor = e.type === "story" ? "bg-amber-50 text-amber-655 border-amber-100" : "bg-purple-50 text-purple-655 border-purple-100";
              return (
                <div
                  key={`ev-${e.id}`}
                  className={`text-[8px] font-bold px-1 py-0.5 rounded border truncate ${typeColor}`}
                  title={`${e.type.toUpperCase()}: ${e.desc}`}
                >
                  {e.type === "story" ? "◆" : "▪"} {cl?.avatarName || "Avatar"}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return {
      title: `${months[calDate.getMonth()]} ${calDate.getFullYear()}`,
      cells
    };
  };

  const moveMonth = (dir: number) => {
    setCalDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + dir);
      return d;
    });
  };

  const activeClients = clients.filter((c) => c.status === "active");
  const mrr = activeClients.reduce((sum, c) => sum + (PLANS[c.plan]?.monthly || 0), 0);
  const pendingClients = activeClients.filter((c) => getPaymentStatus(c).days <= 5);
  const pendingAmt = pendingClients.reduce((sum, c) => sum + (PLANS[c.plan]?.monthly || 0), 0);

  const thisMonthPosts = content.filter((c) => {
    const d = new Date(c.date);
    const today = new Date();
    return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
  }).length;

  const billingSetupPending = clients.filter((c) => !c.setupPaid).reduce((sum, c) => sum + (PLANS[c.plan]?.setup || 0), 0);

  const calData = renderCalendarCells();

  const handleMarkPaid = (client: Client, concept: string, amount: number) => {
    if (concept === "Setup Fee") {
      handleMarkSetupPaid(client);
    } else {
      handleRegisterPayment(client);
      alert(`Cobro registrado: ${concept} por $${amount.toLocaleString()}`);
    }
  };

  return (
    <motion.div
      key="admin"
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="flex flex-col gap-6 h-full font-sans"
    >
      {/* Contenedor Principal */}
      <div className="bg-white/70 backdrop-blur-md border border-white/60 rounded-3xl p-6 sm:p-8 flex-1 flex flex-col shadow-lg shadow-slate-100/50">
        
        {/* Cabecera del Panel */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-500" />
              Consola de Administración de Clientes
            </h2>
            <p className="text-xs text-slate-500">Administración financiera, banco de contenido y facturas de VirtualSoul Agency.</p>
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => setIsClientModalOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm font-bold"
            >
              <Plus className="w-3.5 h-3.5" />
              Nuevo Cliente
            </button>
            <button
              type="button"
              onClick={() => {
                if (clients.length === 0) {
                  alert("Primero debes crear al menos un cliente.");
                  return;
                }
                setIsContentModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white transition-all cursor-pointer flex items-center gap-1.5 shadow-sm font-bold"
            >
              <Plus className="w-3.5 h-3.5" />
              Nuevo Contenido
            </button>
          </div>
        </div>

        {/* Sub-Navegación del Admin */}
        <div className="flex flex-wrap gap-1 border-b border-slate-100 pb-3 mb-6">
          {([
            { id: "dashboard", label: "Consola Principal", icon: TrendingUp },
            { id: "clients", label: "Clientes & Contratos", icon: Users },
            { id: "billing", label: "Facturación & Cobros", icon: DollarSign },
            { id: "calendar", label: "Calendario Editorial", icon: CalendarIcon },
            { id: "avatars", label: "Avatares Vinculados", icon: Sparkles },
            { id: "content", label: "Banco de Contenidos", icon: Clock }
          ] as const).map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  active
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* VISTAS DE PESTAÑAS */}
        <div className="flex-1">

          {/* 1. DASHBOARD TAB */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Tarjetas de Métricas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Clientes Activos</span>
                  <div className="text-2xl font-black text-slate-800 flex items-baseline gap-1">
                    {activeClients.length}
                    <span className="text-xs font-semibold text-slate-400">avatares</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-2 block font-semibold">En operación de post y DMs</span>
                </div>

                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Ingresos MRR</span>
                  <div className="text-2xl font-black text-emerald-600 flex items-baseline gap-1">
                    ${mrr.toLocaleString()}
                    <span className="text-xs font-semibold text-emerald-400">/ mes</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-2 block font-semibold">Facturación recurrente mensual</span>
                </div>

                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Cobros Pendientes</span>
                  <div className="text-2xl font-black text-amber-500 flex items-baseline gap-1">
                    ${pendingAmt.toLocaleString()}
                    <span className="text-xs font-semibold text-amber-400">({pendingClients.length} clientes)</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-2 block font-semibold">Vencimientos próximos a 5 días</span>
                </div>

                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Posts Este Mes</span>
                  <div className="text-2xl font-black text-indigo-500">
                    {thisMonthPosts}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-2 block font-semibold">Contenidos en cola o programados</span>
                </div>
              </div>

              {/* Resumen de Clientes */}
              <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Estado de Contratos de Clientes</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] text-slate-400 uppercase font-black tracking-wider bg-slate-50/20">
                        <th className="px-5 py-3 font-bold">Cliente / Correo</th>
                        <th className="px-5 py-3 font-bold">Avatar Vinculado</th>
                        <th className="px-5 py-3 font-bold">Plan Contratado</th>
                        <th className="px-5 py-3 font-bold">Próximo Cobro</th>
                        <th className="px-5 py-3 font-bold">Estado Pago</th>
                        <th className="px-5 py-3 font-bold">Estado Cuenta</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {activeClients.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-5 py-10 text-center text-slate-400">
                            <span className="text-2xl block mb-2">✦</span>
                            No hay clientes registrados o activos actualmente.
                          </td>
                        </tr>
                      ) : (
                        activeClients.map((c) => {
                          const ps = getPaymentStatus(c);
                          return (
                            <tr key={c.id} className="hover:bg-slate-50/40">
                              <td className="px-5 py-3.5">
                                <div className="font-bold text-slate-800">{c.name}</div>
                                <div className="text-[10px] text-slate-400 font-semibold font-semibold">{c.email}</div>
                              </td>
                              <td className="px-5 py-3.5 font-bold text-slate-700">{c.avatarName || "—"}</td>
                              <td className="px-5 py-3.5 font-bold text-slate-650">{PLANS[c.plan]?.name || c.plan}</td>
                              <td className="px-5 py-3.5 text-slate-500 font-semibold">{formatShortDate(getNextBillingDate(c))}</td>
                              <td className="px-5 py-3.5">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${ps.cls}`}>
                                  {ps.label}
                                </span>
                              </td>
                              <td className="px-5 py-3.5">
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                                  Activo
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 2. CLIENTS TAB */}
          {activeTab === "clients" && (
            <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Todos los Clientes Registrados</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] text-slate-400 uppercase font-black tracking-wider bg-slate-50/20">
                      <th className="px-5 py-3 font-bold">Cliente / Correo</th>
                      <th className="px-5 py-3 font-bold">Plan</th>
                      <th className="px-5 py-3 font-bold">Setup Fee</th>
                      <th className="px-5 py-3 font-bold">Mensualidad</th>
                      <th className="px-5 py-3 font-bold">Inicio de Contrato</th>
                      <th className="px-5 py-3 font-bold">Antigüedad</th>
                      <th className="px-5 py-3 font-bold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {clients.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-5 py-10 text-center text-slate-400">
                          No hay clientes registrados en el sistema.
                        </td>
                      </tr>
                    ) : (
                      clients.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50/40">
                          <td className="px-5 py-3.5">
                            <div className="font-bold text-slate-800">{c.name}</div>
                            <div className="text-[10px] text-slate-400 font-semibold font-semibold">{c.email}</div>
                          </td>
                          <td className="px-5 py-3.5 font-bold text-slate-700">{PLANS[c.plan]?.name || c.plan}</td>
                          <td className="px-5 py-3.5">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${c.setupPaid ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"}`}>
                              ${PLANS[c.plan]?.setup} {c.setupPaid ? "✓ Pagado" : "Pendiente"}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-slate-650 font-bold">${(PLANS[c.plan]?.monthly || 0).toLocaleString()}/mes</td>
                          <td className="px-5 py-3.5 text-slate-500 font-semibold">{formatShortDate(c.startDate)}</td>
                          <td className="px-5 py-3.5 text-slate-500 font-semibold">{getMonthsActive(c.startDate)} meses</td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              {!c.setupPaid && (
                                <button
                                  type="button"
                                  onClick={() => handleMarkSetupPaid(c)}
                                  className="px-2 py-1 rounded-lg text-[10px] font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 cursor-pointer transition-all font-bold"
                                >
                                  Setup ✓
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleRegisterPayment(c)}
                                className="px-2 py-1 rounded-lg text-[10px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 cursor-pointer transition-all font-bold"
                              >
                                + Pago
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteClient(c.id)}
                                className="p-1 rounded-lg text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 cursor-pointer transition-all"
                                title="Eliminar Cliente"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. BILLING TAB */}
          {activeTab === "billing" && (
            <div className="space-y-6">
              {/* Tarjetas de Billing */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">MRR Actual</span>
                  <div className="text-2xl font-black text-slate-800">${mrr.toLocaleString()}</div>
                  <span className="text-[10px] text-slate-400 mt-2 block font-semibold">{activeClients.length} clientes activos</span>
                </div>

                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Setups Pendientes</span>
                  <div className="text-2xl font-black text-amber-500">${billingSetupPending.toLocaleString()}</div>
                  <span className="text-[10px] text-slate-400 mt-2 block font-semibold">{clients.filter(c => !c.setupPaid).length} contratos sin setup cobrar</span>
                </div>

                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Anual Proyectado (ARR)</span>
                  <div className="text-2xl font-black text-emerald-600">${(mrr * 12).toLocaleString()}</div>
                  <span className="text-[10px] text-slate-400 mt-2 block font-semibold">Tasa de corrida de ingresos</span>
                </div>
              </div>

              {/* Lista de Cobros */}
              <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Control Mensual de Cobros</h3>
                  <button
                    type="button"
                    onClick={exportCSV}
                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 cursor-pointer transition-all flex items-center gap-1 shadow-sm font-bold"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                    Exportar Cobros (CSV)
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] text-slate-400 uppercase font-black tracking-wider bg-slate-50/20">
                        <th className="px-5 py-3 font-bold">Cliente</th>
                        <th className="px-5 py-3 font-bold">Concepto</th>
                        <th className="px-5 py-3 font-bold">Monto</th>
                        <th className="px-5 py-3 font-bold">Próximo Vencimiento</th>
                        <th className="px-5 py-3 font-bold">Días Restantes</th>
                        <th className="px-5 py-3 font-bold">Estado</th>
                        <th className="px-5 py-3 font-bold">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {clients.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-5 py-10 text-center text-slate-400">
                            No hay cobros registrados.
                          </td>
                        </tr>
                      ) : (
                        clients
                          .flatMap((c) => {
                            const rows = [];
                            if (!c.setupPaid) {
                              rows.push({
                                c,
                                concept: "Setup Fee",
                                amount: PLANS[c.plan]?.setup || 0,
                                due: c.startDate,
                                status: getDaysUntil(new Date(c.startDate)) < 0 ? "overdue" : "pending",
                                days: getDaysUntil(new Date(c.startDate))
                              });
                            }
                            const nb = getNextBillingDate(c);
                            const ps = getPaymentStatus(c);
                            rows.push({
                              c,
                              concept: `Mensualidad ${PLANS[c.plan]?.name}`,
                              amount: PLANS[c.plan]?.monthly || 0,
                              due: nb.toISOString().split("T")[0],
                              status: ps.days < 0 ? "overdue" : ps.days <= 5 ? "pending" : "ok",
                              days: ps.days
                            });
                            return rows;
                          })
                          .map((r, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/40">
                              <td className="px-5 py-3.5 font-bold text-slate-800">{r.c.name}</td>
                              <td className="px-5 py-3.5 text-slate-500 font-semibold">{r.concept}</td>
                              <td className="px-5 py-3.5 text-slate-700 font-bold">${r.amount.toLocaleString()}</td>
                              <td className="px-5 py-3.5 text-slate-500 font-semibold">{formatShortDate(r.due)}</td>
                              <td className="px-5 py-3.5">
                                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black border ${
                                  r.status === "overdue"
                                    ? "bg-red-50 text-red-700 border-red-100"
                                    : r.status === "pending"
                                    ? "bg-amber-50 text-amber-700 border-amber-100"
                                    : "bg-emerald-50 text-emerald-600 border-emerald-100"
                                }`}>
                                  {r.days !== undefined
                                    ? r.days < 0
                                      ? `${Math.abs(r.days)}d vencido`
                                      : `en ${r.days}d`
                                    : "—"}
                                </span>
                              </td>
                              <td className="px-5 py-3.5">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                                  r.status === "overdue"
                                    ? "bg-red-50 text-red-600 border-red-100"
                                    : r.status === "pending"
                                    ? "bg-amber-50 text-amber-600 border-amber-100"
                                    : "bg-emerald-50 text-emerald-600 border-emerald-100"
                                }`}>
                                  {r.status === "overdue" ? "Vencido" : r.status === "pending" ? "Próximo" : "Al día"}
                                </span>
                              </td>
                              <td className="px-5 py-3.5">
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleMarkPaid(r.c, r.concept, r.amount)}
                                    className="px-2 py-1 rounded-lg text-[10px] font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 cursor-pointer transition-all font-bold"
                                  >
                                    ✓ Cobrado
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSendReminder(r.c, r.amount)}
                                    className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 border border-amber-100 cursor-pointer transition-all flex items-center gap-0.5 font-bold"
                                  >
                                    <MessageCircle className="w-3 h-3" />
                                    WA
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 4. CALENDAR TAB */}
          {activeTab === "calendar" && (
            <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                  <CalendarIcon className="w-4 h-4 text-rose-500" />
                  Calendario de Cobros & Posteos
                </h3>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveMonth(-1)}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer text-slate-500"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-bold text-slate-800 px-3 min-w-[120px] text-center font-mono">
                    {calData.title}
                  </span>
                  <button
                    type="button"
                    onClick={() => moveMonth(1)}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer text-slate-500"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Grid de días */}
              <div className="grid grid-cols-7 gap-1">
                {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((d) => (
                  <div key={d} className="text-center text-[10px] font-bold text-slate-400 py-1.5 uppercase font-mono">
                    {d}
                  </div>
                ))}
                {calData.cells}
              </div>

              {/* Leyenda */}
              <div className="flex items-center gap-4 text-[10px] text-slate-500 border-t border-slate-100 pt-4 mt-2">
                <span className="font-bold">Leyenda:</span>
                <span className="flex items-center gap-1 font-semibold">
                  <span className="w-2.5 h-2.5 rounded bg-purple-50 border border-purple-100 flex-shrink-0" />
                  Post Publicitario / Feed
                </span>
                <span className="flex items-center gap-1 font-semibold">
                  <span className="w-2.5 h-2.5 rounded bg-amber-50 border border-amber-100 flex-shrink-0" />
                  Story / Contenido Rápido
                </span>
                <span className="flex items-center gap-1 font-semibold">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-50 border border-emerald-100 flex-shrink-0" />
                  Cobro Programado ($)
                </span>
              </div>
            </div>
          )}

          {/* 5. AVATARS TAB */}
          {activeTab === "avatars" && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-1">Avatares del Portafolio de la Agencia</h3>
                <p className="text-[10px] text-slate-400">Modelos AI activas vinculadas a clientes contratantes de VirtualSoul.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {avatars.length === 0 ? (
                  <div className="col-span-full py-10 bg-white border border-slate-100 rounded-2xl text-center text-slate-400">
                    No hay avatares registrados en la base de datos de la aplicación.
                  </div>
                ) : (
                  avatars.map((av) => {
                    const client = clients.find((c) => c.avatarName.toLowerCase() === av.name.toLowerCase());
                    const activeMonths = av.createdAt ? getMonthsActive(av.createdAt) : 0;
                    return (
                      <div key={av.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-500/5 to-transparent rounded-full -mr-6 -mt-6" />
                        <div>
                          <div className="flex justify-between items-start mb-3">
                            <span className="text-[9px] font-black text-indigo-500 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full uppercase">
                              {av.niche}
                            </span>
                            <span className="text-[9px] font-mono text-slate-400 font-bold">ID: {av.id}</span>
                          </div>
                          
                          <h4 className="text-sm font-black text-slate-800 mb-1">{av.name}</h4>
                          
                          <div className="text-[10px] text-slate-500 space-y-1 mb-4 border-t border-slate-50 pt-2 font-semibold">
                            <div>Cliente: <span className="text-slate-800 font-bold">{client ? client.name : "Uso Interno"}</span></div>
                            <div>Plan Actual: <span className="text-slate-850 font-bold">{client ? PLANS[client.plan]?.name : "Plan Demo"}</span></div>
                            {client && (
                              <div>Inicio Contrato: <span className="text-slate-700 font-semibold">{formatShortDate(client.startDate)}</span></div>
                            )}
                          </div>
                        </div>

                        <div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 mb-1.5 overflow-hidden">
                            <div
                              className="bg-indigo-500 h-1.5 rounded-full transition-all"
                              style={{ width: `${Math.min((activeMonths / 3) * 100, 100)}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[9px] text-slate-400 font-semibold font-semibold">
                            <span>Mes {activeMonths} de contrato</span>
                            <span>Mínimo 3m</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* 6. CONTENT TAB */}
          {activeTab === "content" && (
            <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Banco de Contenidos Programados</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] text-slate-400 uppercase font-black tracking-wider bg-slate-50/20">
                      <th className="px-5 py-3 font-bold">Cliente / Avatar</th>
                      <th className="px-5 py-3 font-bold">Tipo</th>
                      <th className="px-5 py-3 font-bold">Descripción del Post</th>
                      <th className="px-5 py-3 font-bold">Fecha Programada</th>
                      <th className="px-5 py-3 font-bold">Estado</th>
                      <th className="px-5 py-3 font-bold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {content.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-10 text-center text-slate-400">
                          No hay publicaciones registradas en el banco de contenidos.
                        </td>
                      </tr>
                    ) : (
                      content.map((c) => {
                        const cl = clients.find((x) => x.id === c.clientId);
                        const statusColors: Record<string, string> = {
                          pending: "bg-amber-50 text-amber-600 border-amber-100",
                          generated: "bg-blue-50 text-blue-600 border-blue-100",
                          approved: "bg-emerald-50 text-emerald-600 border-emerald-100",
                          published: "bg-slate-100 text-slate-600 border-slate-200"
                        };
                        return (
                          <tr key={c.id} className="hover:bg-slate-50/40">
                            <td className="px-5 py-3.5">
                              <div className="font-bold text-slate-800">{cl ? cl.name : "—"}</div>
                              <div className="text-[10px] text-slate-400 font-semibold font-semibold">{cl ? cl.avatarName || "—" : "—"}</div>
                            </td>
                            <td className="px-5 py-3.5 font-bold text-slate-650 uppercase">{c.type}</td>
                            <td className="px-5 py-3.5 text-slate-700 max-w-[280px] truncate" title={c.desc}>{c.desc}</td>
                            <td className="px-5 py-3.5 text-slate-500 font-semibold">{c.date ? formatShortDate(c.date) : "—"}</td>
                            <td className="px-5 py-3.5">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${statusColors[c.status] || "badge-yellow"}`}>
                                {c.status}
                              </span>
                            </td>
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleNextStatus(c)}
                                  className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-bold cursor-pointer transition-all border border-slate-200/50 font-bold"
                                  title="Avanzar Estado"
                                >
                                  →
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteContent(c.id)}
                                  className="p-1 rounded text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 cursor-pointer transition-all"
                                  title="Eliminar Contenido"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* MODAL NUEVO CLIENTE */}
      <AnimatePresence>
        {isClientModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setIsClientModalOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 z-10 flex flex-col max-h-[90vh]"
            >
              <form onSubmit={handleSaveClient} className="flex flex-col h-full">
                
                {/* Header Modal */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Registrar Nuevo Cliente</h3>
                  <button
                    type="button"
                    onClick={() => setIsClientModalOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:bg-slate-50 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Body Modal Scrollable */}
                <div className="p-6 overflow-y-auto space-y-5">
                  
                  {/* Seccion 1: Datos Personales */}
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pb-1 border-b border-slate-50">1. Datos de Contacto del Cliente</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1 font-semibold">Nombre Completo</label>
                        <input
                          type="text"
                          required
                          placeholder="Juan Pérez"
                          value={clientForm.name}
                          onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-100 focus:border-rose-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1 font-semibold">Correo Electrónico</label>
                        <input
                          type="email"
                          placeholder="email@cliente.com"
                          value={clientForm.email}
                          onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-100 focus:border-rose-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1 font-semibold">Teléfono de WhatsApp</label>
                        <input
                          type="text"
                          placeholder="+34 600 000 000"
                          value={clientForm.whatsapp}
                          onChange={(e) => setClientForm({ ...clientForm, whatsapp: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-100 focus:border-rose-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1 font-semibold">País</label>
                        <input
                          type="text"
                          placeholder="España"
                          value={clientForm.country}
                          onChange={(e) => setClientForm({ ...clientForm, country: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-100 focus:border-rose-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none font-semibold"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Seccion 2: Contrato y Costes */}
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pb-1 border-b border-slate-50">2. Detalles del Contrato</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1 font-semibold">Plan</label>
                        <select
                          required
                          value={clientForm.plan}
                          onChange={(e) => handlePlanChange(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-100 focus:border-rose-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none font-semibold"
                        >
                          <option value="">Seleccionar Plan</option>
                          <option value="basic">Básico — $500/mes</option>
                          <option value="pro">Profesional — $1,200/mes</option>
                          <option value="premium">Premium — $2,500/mes</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1 font-semibold">Setup Fee</label>
                        <input
                          type="text"
                          readOnly
                          placeholder="Automático"
                          value={clientForm.setup}
                          className="w-full bg-slate-100 border border-slate-100 rounded-xl px-4 py-2.5 text-xs text-slate-500 focus:outline-none font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1 font-semibold">Mensualidad</label>
                        <input
                          type="text"
                          readOnly
                          placeholder="Automático"
                          value={clientForm.monthly}
                          className="w-full bg-slate-100 border border-slate-100 rounded-xl px-4 py-2.5 text-xs text-slate-500 focus:outline-none font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1 font-semibold">Fecha de Inicio</label>
                        <input
                          type="date"
                          value={clientForm.startDate}
                          onChange={(e) => setClientForm({ ...clientForm, startDate: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-100 focus:border-rose-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1 font-semibold">Día de Cobro (1 al 28)</label>
                        <input
                          type="number"
                          min="1"
                          max="28"
                          placeholder="ej: 10"
                          value={clientForm.billingDay}
                          onChange={(e) => setClientForm({ ...clientForm, billingDay: Number(e.target.value) || 1 })}
                          className="w-full bg-slate-50 border border-slate-100 focus:border-rose-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1 font-semibold">Setup Fee ¿Pagado?</label>
                        <select
                          value={clientForm.setupPaid ? "yes" : "no"}
                          onChange={(e) => setClientForm({ ...clientForm, setupPaid: e.target.value === "yes" })}
                          className="w-full bg-slate-50 border border-slate-100 focus:border-rose-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none font-semibold"
                        >
                          <option value="no">Pendiente de cobro</option>
                          <option value="yes">Sí, ya pagado</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Seccion 3: Personaje / Avatar */}
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pb-1 border-b border-slate-50">3. Vinculación del Personaje AI</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1 font-semibold">Nombre de la Modelo AI</label>
                        <input
                          type="text"
                          placeholder="Milena Reyes"
                          value={clientForm.avatarName}
                          onChange={(e) => setClientForm({ ...clientForm, avatarName: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-100 focus:border-rose-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1 font-semibold">Nicho Temático</label>
                        <input
                          type="text"
                          placeholder="Fitness & Lifestyle"
                          value={clientForm.niche}
                          onChange={(e) => setClientForm({ ...clientForm, niche: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-100 focus:border-rose-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none font-semibold"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Notas */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1 font-semibold">Notas Internas</label>
                    <textarea
                      placeholder="Escribe aquí notas sobre el contrato o requerimientos del cliente..."
                      value={clientForm.notes || ""}
                      onChange={(e) => setClientForm({ ...clientForm, notes: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 focus:border-rose-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none resize-none leading-relaxed h-20 font-semibold"
                    />
                  </div>

                </div>

                {/* Footer Modal */}
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsClientModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 transition-all cursor-pointer font-bold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white transition-all cursor-pointer shadow-md shadow-rose-500/10 font-bold"
                  >
                    Guardar Cliente
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL NUEVO CONTENIDO */}
      <AnimatePresence>
        {isContentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setIsContentModalOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 z-10"
            >
              <form onSubmit={handleSaveContent}>
                
                {/* Header Modal */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Agregar Contenido al Calendario</h3>
                  <button
                    type="button"
                    onClick={() => setIsContentModalOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:bg-slate-50 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Body Modal */}
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1 font-semibold">Cliente Contratante</label>
                      <select
                        required
                        value={contentForm.clientId}
                        onChange={(e) => setContentForm({ ...contentForm, clientId: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-100 focus:border-rose-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none font-semibold"
                      >
                        <option value="">Seleccionar Cliente</option>
                        {clients.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.avatarName || "Interno"})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1 font-semibold">Tipo de Publicación</label>
                      <select
                        value={contentForm.type}
                        onChange={(e) => setContentForm({ ...contentForm, type: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-100 focus:border-rose-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none font-semibold"
                      >
                        <option value="post">Post de Feed (Muro)</option>
                        <option value="story">Story</option>
                        <option value="reel">Reel / Video</option>
                        <option value="product">Promoción Producto</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1 font-semibold">Descripción / Copy / Concepto</label>
                    <input
                      type="text"
                      required
                      placeholder="ej. Post entrenando en Miami Beach promocionando proteína"
                      value={contentForm.desc}
                      onChange={(e) => setContentForm({ ...contentForm, desc: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 focus:border-rose-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1 font-semibold">Fecha Programada</label>
                      <input
                        type="date"
                        required
                        value={contentForm.date}
                        onChange={(e) => setContentForm({ ...contentForm, date: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-100 focus:border-rose-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1 font-semibold">Estado Inicial</label>
                      <select
                        value={contentForm.status}
                        onChange={(e) => setContentForm({ ...contentForm, status: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-100 focus:border-rose-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none font-semibold"
                      >
                        <option value="pending">Pendiente</option>
                        <option value="generated">Generado</option>
                        <option value="approved">Aprobado por Cliente</option>
                        <option value="published">Publicado</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Footer Modal */}
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsContentModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 transition-all cursor-pointer font-bold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white transition-all cursor-pointer shadow-md shadow-rose-500/10 font-bold"
                  >
                    Agregar Contenido
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
