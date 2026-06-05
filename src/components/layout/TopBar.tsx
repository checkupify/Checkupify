"use client";
import React from "react";

interface Props {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  loading?: boolean;
  onRefresh?: () => void;
  onMenuClick?: () => void;
}

export function TopBar({ title, subtitle, actions, loading, onRefresh, onMenuClick }: Props) {
  return (
    <header className="topbar">
      {onMenuClick && (
        <button className="topbar-hamburger" onClick={onMenuClick} style={{ display: "flex" }}>☰</button>
      )}
      <div style={{ flex: 1 }}>
        <div className="topbar-title">{title}</div>
        {subtitle && <div className="topbar-sub">{subtitle}</div>}
      </div>
      <div className="topbar-right">
        {loading && (
          <div className="syncing">
            <span className="spin-sm" />
            <span>Syncing</span>
          </div>
        )}
        {onRefresh && (
          <button className="btn sm" onClick={onRefresh}>↺ Refresh</button>
        )}
        {actions}
      </div>
    </header>
  );
}
