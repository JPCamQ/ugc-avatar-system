import React, { useRef } from "react";
import { Upload, Trash } from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";
import { FormField } from "@/components/ui/FormField";

export function ProductIntegration() {
  const { selectedIdea, handleUpdateProductInfo, showError } = useDashboard();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!selectedIdea) return null;

  const handleUploadProductImage = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    handleUpdateProductInfo(selectedIdea.productName || "", null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="mb-4 p-4 bg-slate-50/70 border border-slate-200/40 rounded-2xl">
      <label className="block text-[10px] font-bold text-rose-500 uppercase tracking-wide mb-2 font-semibold">
        Integración de Producto / Patrocinio (Opcional)
      </label>
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
          <FormField
            label="Nombre Comercial del Producto"
            type="text"
            value={selectedIdea.productName || ""}
            onChange={(val) => handleUpdateProductInfo(val, selectedIdea.productImage)}
            placeholder="Ej. Tarjeta Fintech Gold o Bebida Energética"
            labelClassName="text-[10px] font-bold text-slate-400 uppercase mb-1"
            inputClassName="bg-white border border-slate-200/50 px-3 py-1.5"
          />
          <p className="text-[10px] text-slate-400 mt-1 leading-normal font-semibold">
            La IA integrará este producto en los prompts de Flow de forma visualmente realista.
          </p>
          {selectedIdea.productImage && (
            <div className="mt-2.5 p-2.5 bg-amber-50/60 border border-amber-200/30 rounded-xl text-xs text-amber-900 leading-relaxed flex items-start gap-2 shadow-sm">
              <span className="text-amber-600 font-bold text-xs mt-0.5">💡</span>
              <div>
                <strong>Tip para consistencia en Flow:</strong> Al generar la imagen en Flow, asegúrate de activar la opción de <em>&quot;Object Reference&quot; (o subirla como imagen de apoyo/ControlNet)</em> y subir esta misma foto. El prompt generado ha sido estructurado para forzar al motor de Flow a calcar la forma, logotipos y colores de tu imagen sin distorsiones.
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
