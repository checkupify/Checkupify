"use client";
import { cn, STAGE_STYLE, SLA_STYLE } from "@/lib/utils";

export function Badge({ children, className, variant = "default", dot = false }:
  { children: React.ReactNode; className?: string; variant?: string; dot?: boolean }) {
  const V: Record<string, string> = {
    default: "bg-slate-100 text-slate-700",
    success: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    warning: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    danger:  "bg-red-50 text-red-700 ring-1 ring-red-200",
    info:    "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  };
  const D: Record<string, string> = {
    default: "bg-slate-500", success: "bg-emerald-500",
    warning: "bg-amber-500", danger: "bg-red-500", info: "bg-blue-500",
  };
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-[3px] rounded-full text-[11px] font-semibold tracking-wide whitespace-nowrap",
      V[variant] ?? V.default, className
    )}>
      {dot && <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", D[variant] ?? D.default)} />}
      {children}
    </span>
  );
}

export function StageBadge({ stage }: { stage: string }) {
  const s = STAGE_STYLE[stage];
  if (!s) return <Badge>{stage}</Badge>;
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-[3px] rounded-full text-[11px] font-semibold tracking-wide ring-1",
      s.pill
    )}>
      <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", s.dot)} />
      {stage}
    </span>
  );
}

export function SlaBadge({ status }: { status: string }) {
  const icon = status === "Breach" ? "⚡" : status === "At Risk" ? "▲" : "✓";
  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-2 py-[3px] rounded-md text-[11px] font-semibold",
      SLA_STYLE[status] ?? "bg-slate-100 text-slate-600"
    )}>
      {icon} {status}
    </span>
  );
}
