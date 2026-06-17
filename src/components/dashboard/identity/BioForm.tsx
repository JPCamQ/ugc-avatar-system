import React, { useRef } from "react";
import { useDashboard } from "@/context/DashboardContext";
import { FormField } from "@/components/ui/FormField";
import { User } from "lucide-react";

export function BioForm() {
  const { currentAvatar, isEditingIdentity, updateCurrentAvatarField } = useDashboard();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Límite de entrada flexible para procesamiento
    if (file.size > 10 * 1024 * 1024) {
      alert("La imagen excede el tamaño máximo permitido (10MB)");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 400;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.85);
          updateCurrentAvatarField("avatarImage", compressedBase64);
        } else {
          updateCurrentAvatarField("avatarImage", reader.result as string);
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    updateCurrentAvatarField("avatarImage", null);
  };

  return (
    <div className="space-y-4">
      {/* Imagen de Referencia / Foto del Avatar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-slate-50 border border-slate-200/60 rounded-2xl">
        <div className="relative w-16 h-16 rounded-full bg-slate-250 border border-slate-300/40 flex-shrink-0 flex items-center justify-center overflow-hidden shadow-inner bg-slate-200">
          {currentAvatar.avatarImage ? (
            <img
              src={currentAvatar.avatarImage}
              alt={currentAvatar.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-8 h-8 text-slate-400" />
          )}
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h4 className="text-xs font-bold text-slate-800">Foto Base de Referencia</h4>
          <p className="text-[10px] text-slate-500 mt-0.5 mb-2 leading-relaxed">
            Sube el retrato generado en Flow a partir del Prompt Maestro para usarlo de consistencia visual.
          </p>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
            disabled={!isEditingIdentity}
          />
          
          <div className="flex flex-wrap justify-center sm:justify-start gap-2">
            <button
              type="button"
              disabled={!isEditingIdentity}
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1 rounded-xl text-[10px] font-bold bg-rose-50 text-rose-500 border border-rose-100 hover:bg-rose-100/70 transition-all disabled:opacity-50 cursor-pointer"
            >
              {currentAvatar.avatarImage ? "Cambiar Foto" : "Subir Foto"}
            </button>
            {currentAvatar.avatarImage && (
              <button
                type="button"
                disabled={!isEditingIdentity}
                onClick={handleRemoveImage}
                className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-slate-150 hover:bg-slate-200 text-slate-600 border border-slate-250 transition-all disabled:opacity-50 cursor-pointer"
              >
                Eliminar
              </button>
            )}
          </div>
        </div>
      </div>

      <FormField
        label="Nombre de la Modelo"
        type="text"
        value={currentAvatar.name}
        onChange={(val) => updateCurrentAvatarField("name", val)}
        disabled={!isEditingIdentity}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="Edad"
          type="number"
          value={currentAvatar.age}
          onChange={(val) => updateCurrentAvatarField("age", parseInt(val) || 25)}
          disabled={!isEditingIdentity}
        />
        <FormField
          label="Nicho / Especialidad"
          type="text"
          value={currentAvatar.niche}
          onChange={(val) => updateCurrentAvatarField("niche", val)}
          disabled={!isEditingIdentity}
        />
      </div>

      <FormField
        label="Historia de Origen / Backstory"
        type="textarea"
        value={currentAvatar.backstory}
        onChange={(val) => updateCurrentAvatarField("backstory", val)}
        disabled={!isEditingIdentity}
        rows={4}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="Producto de Monetización"
          type="text"
          value={currentAvatar.monetizationProduct || ""}
          onChange={(val) => updateCurrentAvatarField("monetizationProduct", val)}
          disabled={!isEditingIdentity}
        />
        <FormField
          label="Link de Destino"
          type="text"
          value={currentAvatar.monetizationLink || ""}
          onChange={(val) => updateCurrentAvatarField("monetizationLink", val)}
          disabled={!isEditingIdentity}
          inputClassName="text-amber-600 font-semibold"
        />
      </div>
    </div>
  );
}
