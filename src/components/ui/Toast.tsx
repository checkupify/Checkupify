"use client";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

type TType = "success" | "error" | "info" | "warning";
const TS: Record<TType, string> = {
  success: "bg-white border-emerald-200 shadow-emerald-100",
  error:   "bg-white border-red-200 shadow-red-100",
  info:    "bg-white border-blue-200 shadow-blue-100",
  warning: "bg-white border-amber-200 shadow-amber-100",
};
const TI: Record<TType, string> = {
  success: "bg-emerald-100 text-emerald-700",
  error:   "bg-red-100 text-red-700",
  info:    "bg-blue-100 text-blue-700",
  warning: "bg-amber-100 text-amber-700",
};
const TC: Record<TType, string> = { success: "✓", error: "✕", info: "i", warning: "!" };

export function Toast({ message, type = "info", onClose, duration = 3500 }:
  { message: string; type?: TType; onClose: () => void; duration?: number }) {
  useEffect(() => { const t = setTimeout(onClose, duration); return () => clearTimeout(t); }, [onClose, duration]);
  return (
    <div className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-lg text-[13px] font-medium toast-in",
      TS[type]
    )}>
      <span className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0", TI[type])}>
        {TC[type]}
      </span>
      <span className="flex-1 text-[#0D1B35]">{message}</span>
      <button onClick={onClose} className="text-[#A8BACC] hover:text-[#3D5278] cursor-pointer text-lg leading-none ml-1">×</button>
    </div>
  );
}

export function ToastContainer({ toasts, onRemove }:
  { toasts: { id: string; message: string; type: TType }[]; onRemove: (id: string) => void }) {
  return (
    <div className="fixed bottom-5 right-5 z-[200] flex flex-col gap-2 w-[380px]">
      {toasts.map(t => <Toast key={t.id} message={t.message} type={t.type} onClose={() => onRemove(t.id)} />)}
    </div>
  );
}
