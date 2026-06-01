"use client";
import { cn } from "@/lib/utils";
import React from "react";

export function Card({ children, className, padding = "md" }:
  { children: React.ReactNode; className?: string; padding?: "none"|"sm"|"md"|"lg" }) {
  const p = { none: "", sm: "p-4", md: "p-5", lg: "p-6" };
  return (
    <div className={cn(
      "bg-white rounded-2xl border border-[#E8ECF2]",
      "shadow-[0_1px_3px_rgba(11,30,61,0.06),0_1px_8px_rgba(11,30,61,0.03)]",
      p[padding], className
    )}>
      {children}
    </div>
  );
}

export function StatCard({ label, value, sub, color = "text-[#0D1B35]", icon, trend, warn }:
  { label: string; value: string | number; sub?: string; color?: string; icon?: string; trend?: string; warn?: boolean }) {
  return (
    <div className={cn(
      "bg-white rounded-2xl border p-5 group transition-all duration-200",
      "shadow-[0_1px_3px_rgba(11,30,61,0.06),0_1px_8px_rgba(11,30,61,0.03)]",
      "hover:shadow-[0_4px_12px_rgba(11,30,61,0.1)] hover:-translate-y-0.5",
      warn ? "border-red-200 bg-red-50/20" : "border-[#E8ECF2]"
    )}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-semibold text-[#7A90B3] uppercase tracking-widest">{label}</p>
        {icon && <span className="text-xl opacity-70">{icon}</span>}
      </div>
      <p className={cn("text-[30px] font-black tracking-tight leading-none mb-1", color)}>{value}</p>
      {sub && <p className="text-xs text-[#A8BACC] mt-1">{sub}</p>}
      {trend && (
        <p className={cn("text-xs font-semibold mt-2",
          trend.startsWith("+") ? "text-emerald-600" : trend.startsWith("-") ? "text-red-500" : "text-slate-500"
        )}>{trend}</p>
      )}
    </div>
  );
}
