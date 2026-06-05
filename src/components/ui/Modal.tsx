"use client";
import { useEffect } from "react";
import React from "react";

export function Modal({ open, onClose, title, children, footer, size = "md" }: {
  open: boolean; onClose: () => void; title: string; children: React.ReactNode;
  footer?: React.ReactNode; size?: "sm" | "md" | "lg";
}) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal ${size} scale-in`} onClick={e => e.stopPropagation()}>
        <div className="modal-hdr">
          <span className="modal-title">{title}</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

export function SlideOver({ open, onClose, title, children, subtitle }: {
  open: boolean; onClose: () => void; title: string;
  children: React.ReactNode; subtitle?: string;
}) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  if (!open) return null;
  return (
    <div className="slideover-overlay">
      <div className="slideover-bg" onClick={onClose} />
      <div className="slideover slide-right">
        <div className="slideover-hdr">
          <div>
            <div className="slideover-title">{title}</div>
            {subtitle && <div className="slideover-sub">{subtitle}</div>}
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="slideover-body">{children}</div>
      </div>
    </div>
  );
}
