"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { TopBar } from "@/components/layout/TopBar";
import { StageBadge, SlaBadge } from "@/components/ui/Badge";
import { StatSkeleton, TableSkeleton } from "@/components/ui/Skeleton";
import { fmt, fmtDate } from "@/lib/utils";
import type { Booking, Lead } from "@/types";

function StatCard({ label, value, sub, accent = false, warn = false, icon }: {
  label: string; value: string | number; sub?: string; accent?: boolean; warn?: boolean; icon: string;
}) {
  return (
    <div className={`bg-white rounded-2xl border p-4 md:p-5 transition-all hover:-translate-y-0.5 hover:shadow-md ${warn ? "border-red-200" : "border-[#E2E8F0]"}`}
      style={{ boxShadow: "0 1px 4px rgba(11,37,69,0.06)" }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-lg">{icon}</span>
        {warn && <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-lg">!</span>}
      </div>
      <p className={`text-2xl md:text-3xl font-black mb-1 ${warn ? "text-red-600" : accent ? "text-[#22C55E]" : "text-[#0B2545]"}`}>{value}</p>
      <p className="text-[10px] font-semibold text-[#B0BEC5] uppercase tracking-widest mb-1">{label}</p>
      {sub && <p className="text-[11px] text-[#7A90B3]">{sub}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [bRes, lRes] = await Promise.allSettled([
      supabase.from("bookings").select("*,lab:labs(name,city),package:packages(name)").order("created_at", { ascending: false }).limit(200),
      supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(50),
    ]);
    if (bRes.status === "fulfilled" && bRes.value.data) setBookings(bRes.value.data as Booking[]);
    if (lRes.status === "fulfilled" && lRes.value.data) setLeads(lRes.value.data as Lead[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
    const ch = supabase.channel("dash")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, fetchData)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [fetchData]);

  const today = new Date().toISOString().split("T")[0];
  const todayB = bookings.filter(b => b.appointment_date === today);
  const newQ = bookings.filter(b => b.stage === "New");
  const breaches = bookings.filter(b => b.sla_status === "Breach");
  const pending = bookings.filter(b => ["Pending Reports", "Partially Received"].includes(b.stage));
  const done = bookings.filter(b => ["Received", "Completed"].includes(b.stage));
  const revenue = done.reduce((s, b) => s + b.amount, 0);

  const stageData = [
    { s: "New", n: newQ.length, c: "#3B82F6" },
    { s: "Confirmed", n: bookings.filter(b => b.stage === "Confirmed").length, c: "#22C55E" },
    { s: "Pending", n: pending.length, c: "#F59E0B" },
    { s: "Received", n: done.length, c: "#10B981" },
    { s: "Rejected", n: bookings.filter(b => b.stage === "Rejected").length, c: "#EF4444" },
  ];
  const maxN = Math.max(...stageData.map(x => x.n), 1);

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
        {/* SLA Alert */}
        {!loading && breaches.length > 0 && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
            <span className="text-xl flex-shrink-0">⚡</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-red-800">{breaches.length} SLA Breach{breaches.length > 1 ? "es" : ""} — {fmt(breaches.length * 400)} penalty</p>
              <p className="text-xs text-red-500 mt-0.5 truncate">IDs: {breaches.slice(0, 3).map(b => b.id.slice(-8)).join(", ")}</p>
            </div>
            <button onClick={() => router.push("/bookings")} className="text-red-700 text-xs font-bold border border-red-300 px-3 py-1.5 rounded-xl cursor-pointer hover:bg-red-100 whitespace-nowrap flex-shrink-0">Review →</button>
          </div>
        )}

        {/* KPI Cards — 2 cols mobile, 3 tablet, 6 desktop */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {loading ? Array.from({ length: 6 }).map((_, i) => <StatSkeleton key={i} />) : (
            <>
              <StatCard label="Today" value={todayB.length} sub={new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })} accent icon="📅" />
              <StatCard label="New Queue" value={newQ.length} sub="Awaiting confirm" warn={newQ.length > 5} icon="⏱" />
              <StatCard label="Pending Reports" value={pending.length} sub="Need upload" icon="📋" />
              <StatCard label="SLA Breaches" value={breaches.length} sub={breaches.length > 0 ? fmt(breaches.length * 400) : "All on track"} warn={breaches.length > 0} icon="⚡" />
              <StatCard label="Total Bookings" value={bookings.length} sub="All time" icon="◫" />
              <StatCard label="Revenue" value={"₹" + (revenue / 1000).toFixed(0) + "K"} sub={done.length + " completed"} accent icon="💰" />
            </>
          )}
        </div>

        {/* Main content — stacks on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5">
          {/* Booking table */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden" style={{ boxShadow: "0 1px 4px rgba(11,37,69,0.06)" }}>
            <div className="flex items-center justify-between px-4 md:px-5 py-4 border-b border-[#E2E8F0]">
              <div>
                <p className="text-[14px] font-bold text-[#0B2545]">Live Queue</p>
                <p className="text-xs text-[#B0BEC5] mt-0.5 hidden sm:block">{bookings.length} bookings · real-time</p>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-100">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" style={{ boxShadow: "0 0 5px #22C55E" }} />
                <span className="text-[10px] font-bold text-[#22C55E]">LIVE</span>
              </div>
            </div>

            {loading ? <TableSkeleton rows={6} /> : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="border-b border-[#F0F4F8]">
                      {["ID", "Patient", "Package", "Date", "Stage", "₹"].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-[#B0BEC5] bg-[#FAFBFD] whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.slice(0, 8).map(b => (
                      <tr key={b.id} onClick={() => router.push("/bookings")}
                        className="border-b border-[#F5F7FA] hover:bg-[#FAFBFD] transition-colors cursor-pointer">
                        <td className="px-4 py-3"><span className="font-mono text-[11px] text-[#22C55E] font-bold">{b.id.slice(-8)}</span></td>
                        <td className="px-4 py-3">
                          <p className="text-[12px] font-semibold text-[#0B2545]">{b.patient_name}</p>
                          <p className="text-[10px] text-[#B0BEC5] hidden sm:block">{b.patient_phone}</p>
                        </td>
                        <td className="px-4 py-3 text-[11px] text-[#7A90B3] max-w-[100px] truncate">{(b as any).package?.name ?? "—"}</td>
                        <td className="px-4 py-3 text-[11px] text-[#7A90B3] whitespace-nowrap">{b.appointment_date}</td>
                        <td className="px-4 py-3"><StageBadge stage={b.stage} /></td>
                        <td className="px-4 py-3 text-[12px] font-bold text-[#0B2545]">{fmt(b.amount)}</td>
                      </tr>
                    ))}
                    {bookings.length === 0 && (
                      <tr><td colSpan={6} className="px-4 py-14 text-center text-sm text-[#B0BEC5]">No bookings yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            <div className="px-4 md:px-5 py-3 border-t border-[#F5F7FA] flex items-center justify-between">
              <span className="text-xs text-[#B0BEC5]">{Math.min(8, bookings.length)} of {bookings.length}</span>
              <button onClick={() => router.push("/bookings")} className="text-xs text-[#22C55E] font-semibold cursor-pointer">View all →</button>
            </div>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-4">
            {/* Pipeline */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 md:p-5" style={{ boxShadow: "0 1px 4px rgba(11,37,69,0.06)" }}>
              <p className="text-[13px] font-bold text-[#0B2545] mb-4">Pipeline</p>
              <div className="space-y-3">
                {stageData.map(({ s, n, c }) => (
                  <div key={s} className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c }} />
                    <span className="text-[11px] text-[#7A90B3] flex-1 truncate">{s}</span>
                    <div className="flex items-center gap-2 w-20">
                      <div className="flex-1 h-1.5 bg-[#F0F4F8] rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(n / maxN) * 100}%`, background: c }} />
                      </div>
                      <span className="text-[11px] font-bold text-[#3D5A80] w-4 text-right">{n}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Leads */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-4 md:p-5 flex-1" style={{ boxShadow: "0 1px 4px rgba(11,37,69,0.06)" }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[13px] font-bold text-[#0B2545]">Leads</p>
                <button onClick={() => router.push("/leads")} className="text-xs text-[#22C55E] font-semibold cursor-pointer">All →</button>
              </div>
              {leads.slice(0, 5).map(l => {
                const sc: Record<string, string> = { "New": "#3B82F6", "Won": "#22C55E", "Lost": "#EF4444", "Negotiation": "#8B5CF6", "Demo Scheduled": "#F59E0B" };
                return (
                  <div key={l.id} onClick={() => router.push("/leads")}
                    className="flex items-center justify-between py-2.5 border-b border-[#F5F7FA] last:border-0 cursor-pointer hover:bg-[#FAFBFD] -mx-4 md:-mx-5 px-4 md:px-5">
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-[#0B2545] truncate">{l.company_name}</p>
                      <p className="text-[10px] text-[#B0BEC5]">{l.city ?? "—"}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full ml-2 flex-shrink-0"
                      style={{ background: (sc[l.status] ?? "#64748B") + "15", color: sc[l.status] ?? "#64748B" }}>
                      {l.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
