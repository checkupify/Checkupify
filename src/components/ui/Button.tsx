"use client";
import { cn } from "@/lib/utils";
import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "xs" | "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit" | "reset";
  className?: string;
  fullWidth?: boolean;
}

const V = {
  primary:   "bg-[#22C55E] hover:bg-[#16A34A] text-white shadow-sm shadow-emerald-200 border border-transparent",
  secondary: "bg-[#0B1E3D] hover:bg-[#112957] text-white border border-transparent",
  outline:   "bg-white hover:bg-slate-50 text-slate-700 border border-[#E8ECF2] shadow-sm",
  ghost:     "bg-transparent hover:bg-slate-100 text-slate-600 border border-transparent",
  danger:    "bg-red-50 hover:bg-red-100 text-red-700 border border-red-200",
};
const S = {
  xs: "px-2.5 py-1 text-xs rounded-lg gap-1.5",
  sm: "px-3.5 py-1.5 text-[13px] rounded-xl gap-1.5",
  md: "px-4 py-2 text-sm rounded-xl gap-2",
  lg: "px-5 py-2.5 text-[15px] rounded-xl gap-2",
};

export function Button({
  children, onClick, variant = "outline", size = "md",
  disabled, loading, type = "button", className, fullWidth
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center font-semibold transition-all duration-150",
        "cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap",
        V[variant], S[size], fullWidth && "w-full", className
      )}
    >
      {loading && <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />}
      {children}
    </button>
  );
}
