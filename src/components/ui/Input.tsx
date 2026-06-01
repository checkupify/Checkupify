"use client";
import { cn } from "@/lib/utils";

const BASE_INPUT = "w-full bg-white border rounded-xl px-3.5 py-2.5 text-sm text-[#0D1B35] placeholder-[#A8BACC] outline-none transition-all";
const FOCUS = "focus:ring-2 focus:ring-[#22C55E]/20 focus:border-[#22C55E]";

export function Input({ label, value, onChange, type = "text", placeholder, required, disabled, className, error }:
  { label?: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; required?: boolean; disabled?: boolean; className?: string; error?: string }) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label className="text-[11px] font-semibold text-[#7A90B3] uppercase tracking-wider">
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} required={required} disabled={disabled}
        className={cn(BASE_INPUT, FOCUS, error ? "border-red-300" : "border-[#E8ECF2]", disabled && "opacity-50 bg-slate-50")} />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function Select({ label, value, onChange, options, required, disabled, className, placeholder = "Select…" }:
  { label?: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; required?: boolean; disabled?: boolean; className?: string; placeholder?: string }) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label className="text-[11px] font-semibold text-[#7A90B3] uppercase tracking-wider">
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <select value={value} onChange={e => onChange(e.target.value)} required={required} disabled={disabled}
        className={cn(BASE_INPUT, FOCUS, "border-[#E8ECF2] cursor-pointer", disabled && "opacity-50 bg-slate-50")}>
        <option value="">{placeholder}</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

export function Textarea({ label, value, onChange, placeholder, rows = 3, className }:
  { label?: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && <label className="text-[11px] font-semibold text-[#7A90B3] uppercase tracking-wider">{label}</label>}
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
        className={cn(BASE_INPUT, FOCUS, "border-[#E8ECF2] resize-none")} />
    </div>
  );
}
