import React from "react";

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-slate-100 bg-white/70 px-6 py-6 text-xs text-slate-500 font-sans">
      <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          &copy; {new Date().getFullYear()} UGC Avatar Studio. Desarrollado en Modo Claro Premium.
        </div>
        <div className="flex gap-4 font-semibold text-slate-400">
          <span>Proyecto: Ecosistema Milena Reyes & VirtualSoul Agency</span>
          <span>|</span>
          <span>Flow-Optimized API</span>
        </div>
      </div>
    </footer>
  );
}
export default Footer;
