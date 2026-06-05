"use client";
import React from "react";

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`card ${className ?? ""}`}>{children}</div>;
}

export function StatCard({ label, value, sub, accent, warn, icon, trend }: {
  label: string; value: string | number; sub?: string; accent?: boolean; warn?: boolean; icon?: string; trend?: string;
}) {
  return (
    <div className={`kpi${warn ? " warn" : ""}`}>
      <div className="kpi-label">
        {label}
        {icon && <span>{icon}</span>}
      </div>
      <div className={`kpi-value${accent ? " teal" : warn ? " red" : ""}`}>{value}</div>
      {sub && <div className="kpi-sub">{sub}</div>}
      {trend && (
        <div className={`kpi-trend ${trend.startsWith("+") || trend.includes("✓") ? "up" : trend.includes("⚠") ? "down" : "up"}`}>{trend}</div>
      )}
    </div>
  );
}
