"use client";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import React from "react";

const SIZES = { sm: "max-w-md", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" };

export function Modal({ open, onClose, title, children, footer, size = "md" }:
  { open: boolean; onClose: () => void; title: string; children: React.ReactNode; footer?: React.ReactNode; size?: "sm"|"md"|"lg"|"xl" }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0B1E3D]/40 backdrop-blur-sm" onClick={onClose} />
      <div className={cn("relative bg-white rounded-2xl shadow-2xl flex flex-col max-h-[88vh] w-full", SIZES[size])}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8ECF2] flex-shrink-0">
          <h2 className="text-[15px] font-bold text-[#0D1B35]">{title}</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-xl hover:bg-slate-100 flex items-center justify-center text-[#A8BACC] hover:text-[#3D5278] cursor-pointer transition-colors">✕</button>
        </div>
        <div className="px-6 py-5 overflow-y-auto flex-1">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-[#E8ECF2] flex justify-end gap-3 flex-shrink-0">{footer}</div>}
      </div>
    </div>
  );
}

export function SlideOver({ open, onClose, title, children, subtitle }:
  { open: boolean; onClose: () => void; title: string; children: React.ReactNode; subtitle?: string }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-[#0B1E3D]/30 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-xl bg-white shadow-2xl flex flex-col slide-right">
        <div className="flex items-start justify-between px-6 py-5 border-b border-[#E8ECF2] flex-shrink-0">
          <div>
            <h2 className="text-[15px] font-bold text-[#0D1B35]">{title}</h2>
            {subtitle && <p className="text-xs text-[#A8BACC] mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-xl hover:bg-slate-100 flex items-center justify-center text-[#A8BACC] cursor-pointer mt-0.5">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
