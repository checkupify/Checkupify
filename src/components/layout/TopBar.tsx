"use client";
import React from "react";
import { cn } from "@/lib/utils";

export function TopBar({ title, subtitle, actions, loading, onRefresh, back, onBack }:
  { title: string; subtitle?: string; actions?: React.ReactNode; loading?: boolean; onRefresh?: () => void; back?: boolean; onBack?: () => void }) {
  return (
    <header className="h-14 border-b border-[#E8ECF2] bg-white/80 backdrop-blur-sm flex items-center justify-between px-6 flex-shrink-0 sticky top-0 z-10">
      <div className="flex items-center gap-3">
        {back && (
          <button onClick={onBack}
            className="w-8 h-8 rounded-xl border border-[#E8ECF2] bg-white hover:bg-slate-50 flex items-center justify-center text-[#3D5278] cursor-pointer transition-colors shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <div>
          <h1 className="text-[15px] font-bold text-[#0D1B35] leading-none">{title}</h1>
          {subtitle && <p className="text-xs text-[#A8BACC] mt-0.5">{subtitle}</p>}
        </div>
        {loading && (
          <span className="text-[11px] text-[#A8BACC] flex items-center gap-1.5 ml-2">
            <span className="w-3 h-3 border-[1.5px] border-[#A8BACC] border-t-[#3D5278] rounded-full animate-spin" />
            Syncing…
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {onRefresh && (
          <button onClick={onRefresh}
            className="text-xs text-[#7A90B3] hover:text-[#0D1B35] px-3 py-1.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-[#E8ECF2] cursor-pointer transition-all font-medium">
            ↺ Refresh
          </button>
        )}
        {actions}
      </div>
    </header>
  );
}
