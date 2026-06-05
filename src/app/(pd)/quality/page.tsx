"use client";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { TopBar } from "@/components/layout/TopBar";
import type { Booking } from "@/types";

export default function QualityPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("bookings").select("*").order("created_at", { ascending: false }).limit(200);
    if (data) setBookings(data as Booking[]);
    setLoading(false);
  }, []);
  useEffect(() => { fetch(); }, [fetch]);

  const total = bookings.length;
  const completed = bookings.filter(b => ["Received", "Reports Received"].includes(b.stage)).length;
  const rejected = bookings.filter(b => b.stage === "Rejected").length;
  const noShow = bookings.filter(b => b.stage === "No Show").length;
  const breaches = bookings.filter(b => b.sla_status === "Breach").length;
  const atRisk = bookings.filter(b => b.sla_status === "At Risk").length;

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const rejectionRate = total > 0 ? Math.round((rejected / total) * 100) : 0;
  const slaScore = total > 0 ? Math.round(((total - breaches) / total) * 100) : 100;

  // Overall quality score (weighted)
  const qualityScore = Math.round((completionRate * 0.4) + (slaScore * 0.4) + ((100 - rejectionRate * 5) * 0.2));

  const metrics = [
    { label: "Overall Quality Score", value: qualityScore, max: 100, color: qualityScore >= 80 ? "#00CC8E" : qualityScore >= 60 ? "#F59E0B" : "#EF4444", icon: "⭐" },
    { label: "Completion Rate", value: completionRate, max: 100, color: "#00CC8E", icon: "✓" },
    { label: "SLA Compliance", value: slaScore, max: 100, color: slaScore >= 90 ? "#00CC8E" : "#F59E0B", icon: "⏱" },
    { label: "Rejection Rate", value: rejectionRate, max: 20, color: rejectionRate <= 5 ? "#00CC8E" : "#EF4444", icon: "✕", invert: true },
  ];

  return (
    <>
      <TopBar title="Quality Score" subtitle="Lab performance metrics" loading={loading} onRefresh={fetch} />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
        {/* Score ring */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 flex items-center gap-6" style={{ boxShadow: "0 1px 4px rgba(11,37,69,.06)" }}>
          <div className="relative w-28 h-28 flex-shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#F0F4F8" strokeWidth="12" />
              <circle cx="50" cy="50" r="40" fill="none" stroke="#00CC8E" strokeWidth="12"
                strokeDasharray={`${qualityScore * 2.51} 251`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-[#0B2545]">{qualityScore}</span>
              <span className="text-[10px] text-[#94A3B8] font-medium">/ 100</span>
            </div>
          </div>
          <div>
            <p className="text-[15px] font-bold text-[#0B2545] mb-1">Quality Score</p>
            <p className="text-sm text-[#7A90B3] mb-3">Based on completion, SLA compliance, and rejection rate</p>
            <span className="text-[12px] font-bold px-3 py-1.5 rounded-xl" style={{
              background: qualityScore >= 80 ? "#E6FFF7" : qualityScore >= 60 ? "#FFFBEB" : "#FEF2F2",
              color: qualityScore >= 80 ? "#00A873" : qualityScore >= 60 ? "#D97706" : "#DC2626"
            }}>
              {qualityScore >= 80 ? "🟢 Excellent" : qualityScore >= 60 ? "🟡 Good" : "🔴 Needs Improvement"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.map(m => (
            <div key={m.label} className="bg-white rounded-2xl border border-[#E2E8F0] p-4" style={{ boxShadow: "0 1px 4px rgba(11,37,69,.06)" }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest leading-tight">{m.label}</span>
                <span className="text-lg">{m.icon}</span>
              </div>
              <p className="text-3xl font-black mb-2" style={{ color: m.color }}>{m.value}{m.label.includes("Rate") || m.label.includes("Score") || m.label.includes("Compliance") ? "%" : ""}</p>
              <div className="h-1.5 bg-[#F0F4F8] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min((m.value / m.max) * 100, 100)}%`, background: m.color }} />
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5" style={{ boxShadow: "0 1px 4px rgba(11,37,69,.06)" }}>
          <p className="text-[14px] font-bold text-[#0B2545] mb-4">Breakdown</p>
          {[
            ["Total Appointments", total],
            ["Completed (Report Received)", completed],
            ["Rejected", rejected],
            ["No Show", noShow],
            ["SLA Breaches", breaches],
            ["SLA At Risk", atRisk],
          ].map(([k, v]) => (
            <div key={k as string} className="flex justify-between items-center py-2.5 border-b border-[#F5F7FA] last:border-0">
              <span className="text-sm text-[#7A90B3]">{k as string}</span>
              <span className="text-sm font-bold text-[#0B2545]">{v as number}</span>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
