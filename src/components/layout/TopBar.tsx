"use client";
import React from "react";
import { cn } from "@/lib/utils";

interface TopBarProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  loading?: boolean;
  onRefresh?: () => void;
  onMenuClick?: () => void;
}

export function TopBar({ title, subtitle, actions, loading, onRefresh, onMenuClick }: TopBarProps) {
  return (
    <header className="h-14 border-b border-[#E2E8F0] bg-white flex items-center justify-between px-4 md:px-6 flex-shrink-0 sticky top-0 z-10">
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuClick}
          className="md:hidden w-9 h-9 rounded-xl border border-[#E2E8F0] flex items-center justify-center text-[#3D5A80] cursor-pointer hover:bg-slate-50 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div>
          <h1 className="text-[14px] md:text-[15px] font-bold text-[#0B2545] leading-none">{title}</h1>
          {subtitle && <p className="text-[11px] text-[#B0BEC5] mt-0.5 hidden sm:block">{subtitle}</p>}
        </div>

        {loading && (
          <span className="text-[11px] text-[#B0BEC5] hidden sm:flex items-center gap-1.5">
            <span className="w-3 h-3 border-[1.5px] border-[#B0BEC5] border-t-[#3D5A80] rounded-full animate-spin" />
            Syncing
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="hidden sm:block text-xs text-[#7A90B3] hover:text-[#0B2545] px-3 py-1.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-[#E2E8F0] cursor-pointer transition-all font-medium"
          >
            ↺ Refresh
          </button>
        )}
        {actions}
      </div>
    </header>
  );
}
