"use client";
import { useEffect } from "react";

type TType = "success" | "error" | "info" | "warning";

export function Toast({ message, type = "info", onClose, duration = 4000 }: {
  message: string; type?: TType; onClose: () => void; duration?: number;
}) {
  useEffect(() => { const t = setTimeout(onClose, duration); return () => clearTimeout(t); }, [onClose, duration]);
  const icon = type === "success" ? "✓" : type === "error" ? "✕" : type === "warning" ? "!" : "i";
  const cls = type === "info" ? "success" : type;
  return (
    <div className={`toast ${cls}`}>
      <div className="toast-icon">{icon}</div>
      <div className="toast-msg">{message}</div>
      <button className="toast-close" onClick={onClose}>×</button>
    </div>
  );
}

export function ToastContainer({ toasts, onRemove }: {
  toasts: { id: string; message: string; type: TType }[];
  onRemove: (id: string) => void;
}) {
  return (
    <div className="toast-stack">
      {toasts.map(t => <Toast key={t.id} message={t.message} type={t.type} onClose={() => onRemove(t.id)} />)}
    </div>
  );
}
