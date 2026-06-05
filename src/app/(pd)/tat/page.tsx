"use client";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { TopBar } from "@/components/layout/TopBar";
import { StatSkeleton } from "@/components/ui/Skeleton";
import type { Booking } from "@/types";

function KPI({ label, value, sub, good = true, icon }: { label: string; value: string; sub?: string; good?: boolean; icon: string }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5" style={{ boxShadow: "0 1px 4px rgba(11,37,69,.06)" }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">{label}</span>
        <span className="text-xl">{icon}</span>
      </div>
      <p className="text-3xl font-black mb-1" style={{ color: good ? "#00CC8E" : "#EF4444" }}>{value}</p>
      {sub && <p className="text-[11px] text-[#94A3B8]">{sub}</p>}
    </div>
  );
}

export default function TATPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("bookings").select("*,package:packages(name)").order("created_at", { ascending: false }).limit(200);
    if (data) setBookings(data as Booking[]);
    setLoading(false);
  }, []);
  useEffect(() => { fetch(); }, [fetch]);

  const confirmed = bookings.filter(b => b.confirmed_at);
  const avgConfirmMins = confirmed.length > 0
    ? Math.round(confirmed.reduce((s, b) => {
        const diff = (new Date(b.confirmed_at!).getTime() - new Date(b.created_at).getTime()) / 60000;
        return s + diff;
      }, 0) / confirmed.length)
    : 0;

  const done = bookings.filter(b => ["Received", "Completed", "Reports Received"].includes(b.stage));
  const breaches = bookings.filter(b => b.sla_status === "Breach").length;
  const compliance = bookings.length > 0 ? Math.round(((bookings.length - breaches) / bookings.length) * 100) : 100;

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - 6 + i);
    const ds = d.toISOString().split("T")[0];
    const dayB = bookings.filter(b => b.appointment_date === ds);
    const dayBreaches = dayB.filter(b => b.sla_status === "Breach").length;
    const dayComp = dayB.length > 0 ? Math.round(((dayB.length - dayBreaches) / dayB.length) * 100) : 100;
    return { day: d.toLocaleDateString("en-IN", { weekday: "short" }), n: dayB.length, comp: dayComp };
  });
  const maxN = Math.max(...last7.map(d => d.n), 1);

  const SLA_TARGETS = [
    { label: "Confirmation SLA", target: "< 2 hours", breach: "₹400", stat: avgConfirmMins < 120 ? "✓ On Track" : "⚡ Breach", ok: avgConfirmMins < 120 },
    { label: "First Report TAT", target: "< 6 hours", breach: "₹600", stat: compliance > 90 ? "✓ On Track" : "At Risk", ok: compliance > 90 },
    { label: "Full Report TAT", target: "< 36 hours", breach: "₹1,000", stat: compliance > 85 ? "✓ On Track" : "At Risk", ok: compliance > 85 },
  ];

  return (
    <>
      <TopBar title="TAT Analytics" subtitle="Turnaround time performance" loading={loading} onRefresh={fetch} />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {loading ? Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />) : (
            <>
              <KPI label="SLA Compliance" value={compliance + "%"} sub="Last 30 days" good={compliance >= 90} icon="✅" />
              <KPI label="Avg Confirm Time" value={avgConfirmMins > 0 ? avgConfirmMins + "m" : "—"} sub="Target: < 120m" good={avgConfirmMins < 120 || avgConfirmMins === 0} icon="⏱" />
              <KPI label="SLA Breaches" value={String(breaches)} sub={breaches > 0 ? "₹" + (breaches * 400).toLocaleString("en-IN") + " penalty" : "All clear"} good={breaches === 0} icon="⚡" />
              <KPI label="Completed" value={String(done.length)} sub={bookings.length + " total bookings"} good icon="✓" />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* 7-day chart */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5" style={{ boxShadow: "0 1px 4px rgba(11,37,69,.06)" }}>
            <p className="text-[14px] font-bold text-[#0B2545] mb-5">7-Day Volume</p>
            <div className="flex items-end gap-2 h-20 mb-2">
              {last7.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  {d.n > 0 && <span className="text-[9px] text-[#94A3B8]">{d.n}</span>}
                  <div className="w-full rounded-t-md" style={{ height: `${Math.max((d.n / maxN) * 60, 3)}px`, background: d.comp >= 90 ? "#00CC8E" : "#F59E0B" }} />
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              {last7.map((d, i) => <span key={i} className="flex-1 text-[9px] text-[#94A3B8] text-center">{d.day}</span>)}
            </div>
          </div>

          {/* SLA targets */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5" style={{ boxShadow: "0 1px 4px rgba(11,37,69,.06)" }}>
            <p className="text-[14px] font-bold text-[#0B2545] mb-4">SLA Targets & Penalties</p>
            {SLA_TARGETS.map(t => (
              <div key={t.label} className="py-3 border-b border-[#F5F7FA] last:border-0">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[13px] font-semibold text-[#0B2545]">{t.label}</span>
                  <span className="text-[11px] font-bold" style={{ color: t.ok ? "#00CC8E" : "#F59E0B" }}>{t.stat}</span>
                </div>
                <div className="flex gap-4 text-[11px] text-[#94A3B8]">
                  <span>Target: {t.target}</span>
                  <span>Breach penalty: {t.breach}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
