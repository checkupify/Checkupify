"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { TopBar } from "@/components/layout/TopBar";
import { StageBadge, SlaBadge } from "@/components/ui/Badge";
import { StatSkeleton, TableSkeleton } from "@/components/ui/Skeleton";
import { fmt } from "@/lib/utils";
import type { Booking } from "@/types";

function KPICard({ label, value, sub, accent = false, warn = false, icon }: {
  label: string; value: string | number; sub?: string; accent?: boolean; warn?: boolean; icon: string;
}) {
  return (
    <div className={`bg-white rounded-2xl border p-4 md:p-5 transition-all hover:-translate-y-0.5 hover:shadow-md ${warn ? "border-red-200" : "border-[#E2E8F0]"}`}
      style={{ boxShadow: "0 1px 4px rgba(11,37,69,0.06)" }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xl">{icon}</span>
        {warn && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
      </div>
      <p className={`text-2xl md:text-3xl font-black mb-1 ${warn ? "text-red-600" : accent ? "text-[#22C55E]" : "text-[#0B2545]"}`}>{value}</p>
      <p className="text-[10px] font-bold text-[#B0BEC5] uppercase tracking-widest mb-1">{label}</p>
      {sub && <p className="text-[11px] text-[#7A90B3]">{sub}</p>}
    </div>
  );
}

export default function PDDashboard() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("bookings")
      .select("*,lab:labs(name),package:packages(name)")
      .order("created_at", { ascending: false })
      .limit(200);
    if (data) setBookings(data as Booking[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
    const ch = supabase.channel("pd-dash")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, fetchData)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [fetchData]);

  const today = new Date().toISOString().split("T")[0];
  const todayB = bookings.filter(b => b.appointment_date === today);
  const newQ = bookings.filter(b => b.stage === "New");
  const pending = bookings.filter(b => ["Pending Reports", "Partially Received"].includes(b.stage));
  const breaches = bookings.filter(b => b.sla_status === "Breach");
  const done = bookings.filter(b => ["Received", "Completed"].includes(b.stage));
  const revenue = done.reduce((s, b) => s + b.amount, 0);
  const fee = Math.round(revenue * 0.11);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <TopBar title="Dashboard" loading={loading} onRefresh={fetchData}
        actions={
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}>
            <span className="w-2 h-2 rounded-full bg-[#22C55E]" style={{ boxShadow: "0 0 6px #22C55E" }} />
            <span className="text-[11px] font-bold text-[#22C55E]">LIVE</span>
          </div>
        }
      />

      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-5">
        {/* SLA alert */}
        {!loading && breaches.length > 0 && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
            <span className="text-xl flex-shrink-0">⚡</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-red-800">{breaches.length} SLA Breach{breaches.length > 1 ? "es" : ""} — ₹{(breaches.length * 400).toLocaleString("en-IN")} penalty</p>
            </div>
            <button onClick={() => router.push("/queue")} className="text-red-700 text-xs font-bold border border-red-300 px-3 py-1.5 rounded-xl cursor-pointer whitespace-nowrap">Fix →</button>
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
          {loading ? Array.from({ length: 5 }).map((_, i) => <StatSkeleton key={i} />) : (
            <>
              <KPICard label="Today" value={todayB.length} sub={new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" })} icon="📅" accent />
              <KPICard label="Confirm Queue" value={newQ.length} sub="Need action" warn={newQ.length > 0} icon="⏱" />
              <KPICard label="Pending Reports" value={pending.length} sub="To upload" icon="📋" />
              <KPICard label="SLA Breaches" value={breaches.length} sub={breaches.length > 0 ? "Action needed" : "All clear"} warn={breaches.length > 0} icon="⚡" />
              <KPICard label="Net Payout" value={"₹" + ((revenue - fee) / 1000).toFixed(0) + "K"} sub={done.length + " completed"} accent icon="💰" />
            </>
          )}
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5">
          {/* Today's bookings */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden" style={{ boxShadow: "0 1px 4px rgba(11,37,69,0.06)" }}>
            <div className="flex items-center justify-between px-4 md:px-5 py-4 border-b border-[#E2E8F0]">
              <div>
                <p className="text-[14px] font-bold text-[#0B2545]">Today's Bookings</p>
                <p className="text-xs text-[#B0BEC5] mt-0.5 hidden sm:block">{todayB.length} scheduled for today</p>
              </div>
              <button onClick={() => router.push("/bookings")} className="text-xs text-[#22C55E] font-semibold cursor-pointer">All →</button>
            </div>

            {loading ? <TableSkeleton rows={5} /> : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[550px]">
                  <thead>
                    <tr className="border-b border-[#F0F4F8]">
                      {["ID", "Patient", "Package", "Slot", "Stage", "SLA"].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-[#B0BEC5] bg-[#FAFBFD]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(todayB.length > 0 ? todayB : bookings.slice(0, 6)).map(b => (
                      <tr key={b.id} className="border-b border-[#F5F7FA] hover:bg-[#FAFBFD] transition-colors">
                        <td className="px-4 py-3"><span className="font-mono text-[11px] text-[#22C55E] font-bold">{b.id.slice(-8)}</span></td>
                        <td className="px-4 py-3 text-[12px] font-semibold text-[#0B2545]">{b.patient_name}</td>
                        <td className="px-4 py-3 text-[11px] text-[#7A90B3] max-w-[120px] truncate">{(b as any).package?.name ?? "—"}</td>
                        <td className="px-4 py-3 text-[11px] text-[#7A90B3] whitespace-nowrap">{b.slot_time?.slice(0, 5) ?? "—"}</td>
                        <td className="px-4 py-3"><StageBadge stage={b.stage} /></td>
                        <td className="px-4 py-3"><SlaBadge status={b.sla_status} /></td>
                      </tr>
                    ))}
                    {bookings.length === 0 && (
                      <tr><td colSpan={6} className="px-4 py-14 text-center text-sm text-[#B0BEC5]">No bookings</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Quick actions + Revenue */}
          <div className="flex flex-col gap-4">
            {/* Quick actions */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 md:p-5" style={{ boxShadow: "0 1px 4px rgba(11,37,69,0.06)" }}>
              <p className="text-[13px] font-bold text-[#0B2545] mb-4">Quick Actions</p>
              <div className="space-y-2">
                {[
                  { label: "Confirm Queue", sub: `${newQ.length} pending`, href: "/queue", urgent: newQ.length > 0 },
                  { label: "Upload Reports", sub: `${pending.length} waiting`, href: "/upload", urgent: false },
                  { label: "All Bookings", sub: `${bookings.length} total`, href: "/bookings", urgent: false },
                ].map(a => (
                  <button key={a.href} onClick={() => router.push(a.href)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl border cursor-pointer transition-all text-left"
                    style={{ borderColor: a.urgent ? "rgba(34,197,94,0.4)" : "#E2E8F0", background: a.urgent ? "rgba(34,197,94,0.06)" : "transparent" }}>
                    <div>
                      <p className="text-[13px] font-semibold" style={{ color: a.urgent ? "#16A34A" : "#0B2545" }}>{a.label}</p>
                      <p className="text-[11px] text-[#B0BEC5]">{a.sub}</p>
                    </div>
                    <span className="text-[#B0BEC5]">→</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Revenue summary */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 md:p-5" style={{ boxShadow: "0 1px 4px rgba(11,37,69,0.06)", background: "linear-gradient(135deg, #0B2545 0%, #1B4B8A 100%)" }}>
              <p className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-3">Your Earnings</p>
              <p className="text-3xl font-black text-white mb-1">₹{((revenue - fee) / 1000).toFixed(0)}K</p>
              <p className="text-xs text-white/50 mb-4">Net payout after 11% platform fee</p>
              <div className="flex justify-between text-xs">
                <div>
                  <p className="text-white/40">Gross</p>
                  <p className="text-white font-bold mt-0.5">{fmt(revenue)}</p>
                </div>
                <div className="text-right">
                  <p className="text-white/40">Platform Fee</p>
                  <p className="text-amber-400 font-bold mt-0.5">−{fmt(fee)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
