export const fmt  = (n: number) => "₹" + n.toLocaleString("en-IN");
export const fmtDate = (d: string) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
export const fmtTime = (t: string) => t?.slice(0, 5) ?? "—";
export const ago = (d: string) => {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};
export const cn = (...c: (string | boolean | null | undefined)[]) => c.filter(Boolean).join(" ");

export const STAGE_STYLE: Record<string, { pill: string; dot: string }> = {
  "New":                { pill: "bg-blue-50 text-blue-700 ring-blue-200",     dot: "bg-blue-500" },
  "Confirmed":          { pill: "bg-emerald-50 text-emerald-700 ring-emerald-200", dot: "bg-emerald-500" },
  "Completed":          { pill: "bg-teal-50 text-teal-700 ring-teal-200",     dot: "bg-teal-500" },
  "Pending Reports":    { pill: "bg-amber-50 text-amber-700 ring-amber-200",  dot: "bg-amber-500" },
  "Partially Received": { pill: "bg-purple-50 text-purple-700 ring-purple-200", dot: "bg-purple-500" },
  "Received":           { pill: "bg-green-50 text-green-700 ring-green-200",  dot: "bg-green-500" },
  "Rejected":           { pill: "bg-red-50 text-red-700 ring-red-200",        dot: "bg-red-500" },
  "No Show":            { pill: "bg-gray-50 text-gray-500 ring-gray-200",     dot: "bg-gray-400" },
};

export const SLA_STYLE: Record<string, string> = {
  "On Track": "bg-emerald-50 text-emerald-700",
  "At Risk":  "bg-amber-50 text-amber-700",
  "Breach":   "bg-red-50 text-red-700",
};

export const LEAD_STYLE: Record<string, string> = {
  "New":           "bg-blue-50 text-blue-700",
  "Contacted":     "bg-slate-100 text-slate-600",
  "Demo Scheduled":"bg-amber-50 text-amber-700",
  "Negotiation":   "bg-purple-50 text-purple-700",
  "Won":           "bg-emerald-50 text-emerald-700",
  "Lost":          "bg-red-50 text-red-700",
};
