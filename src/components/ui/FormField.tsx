import React from "react";

interface FormFieldProps {
  label: string;
  type?: "text" | "number" | "textarea";
  value: string | number;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  rows?: number;
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
}

export function FormField({
  label,
  type = "text",
  value,
  onChange,
  disabled = false,
  placeholder = "",
  rows = 3,
  className = "",
  labelClassName = "",
  inputClassName = ""
}: FormFieldProps) {
  const baseLabelStyle = "block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1.5 font-semibold";
  const baseInputStyle = "w-full bg-slate-50 border border-slate-100 focus:border-rose-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none disabled:opacity-60 transition-all font-semibold";

  return (
    <div className={`w-full ${className}`}>
      <label className={`${baseLabelStyle} ${labelClassName}`}>{label}</label>
      {type === "textarea" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          rows={rows}
          className={`${baseInputStyle} resize-none leading-relaxed ${inputClassName}`}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          className={`${baseInputStyle} ${inputClassName}`}
        />
      )}
    </div>
  );
}
