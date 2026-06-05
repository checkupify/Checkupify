"use client";

const STAGE_CLASS: Record<string, string> = {
  "New": "new", "Confirmed": "confirmed", "Completed": "received",
  "Pending Reports": "pending", "Partially Received": "pending",
  "Partially Uploaded": "pending", "Report Uploaded": "confirmed",
  "Under Verification": "pending", "Reports Received": "received",
  "Received": "received", "Rejected": "rejected", "No Show": "noshow",
};
const SLA_CLASS: Record<string, string> = {
  "On Track": "ontrack", "At Risk": "atrisk", "Breach": "breach",
};

export function StageBadge({ stage }: { stage: string }) {
  const cls = STAGE_CLASS[stage] ?? "noshow";
  return <span className={`badge ${cls}`}>{stage}</span>;
}

export function SlaBadge({ status }: { status: string }) {
  const cls = SLA_CLASS[status] ?? "ontrack";
  const icon = status === "Breach" ? "⚡" : status === "At Risk" ? "▲" : "✓";
  return <span className={`badge ${cls}`} style={{ gap: "4px" }}>{icon} {status}</span>;
}
