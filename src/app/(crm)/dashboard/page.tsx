"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { TopBar } from "@/components/layout/TopBar";
import { StageBadge, SlaBadge } from "@/components/ui/Badge";
import { StatSkeleton, TableSkeleton } from "@/components/ui/Skeleton";
import { ToastContainer } from "@/components/ui/Toast";
import { fmt } from "@/lib/utils";
import type { Booking, Lead } from "@/types";

type Toast = { id: string; message: string; type: "success" | "error" | "info" | "warning" };

function KPI({ label, value, sub, color = "#0B2545", bg = "white", icon, warn, trend }: {
  label: string; value: string | number; sub?: string; color?: string;
  bg?: string; icon: string; warn?: boolean; trend?: { val: string; up: boolean };
}) {
  return (
    <div className={`rounded-2xl border p-4 md:p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg cursor-default ${warn ? "border-red-200" : "border-[#E2E8F0]"}`}
      style={{ background: bg, boxShadow: "0 1px 4px rgba(11,37,69,0.06)" }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-bold text-[#7A90B3] uppercase tracking-widest">{label}</span>
        <span className="text-xl">{icon}</span>
      </div>
      <p className={`text-3xl font-black tracking-tight mb-1`} style={{ color }}>{value}</p>
      {sub && <p className="text-[11px] text-[#B0BEC5] mt-1">{sub}</p>}
      {trend && (
        <div className="flex items-center gap-1 mt-2">
          <span className={`text-[10px] font-bold ${trend.up ? "text-emerald-600" : "text-red-500"}`}>
            {trend.up ? "▲" : "▼"} {trend.val}
          </span>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const prevCount = useRef(0);
  const addToast = useCallback((message: string, type: Toast["type"] = "info") => {
    setToasts(p => [...p, { id: Date.now().toString(), message, type }]);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [bRes, lRes] = await Promise.allSettled([
      supabase.from("bookings").select("*,lab:labs(name,city),package:packages(name)").order("created_at", { ascending: false }).limit(300),
      supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(100),
    ]);
    if (bRes.status === "fulfilled" && bRes.value.data) {
      const data = bRes.value.data as Booking[];
      const newQ = data.filter(b => b.stage === "New").length;
      if (prevCount.current > 0 && newQ > prevCount.current) {
        addToast(`🔔 New booking arrived! Queue: ${newQ}`, "info");
      }
      prevCount.current = newQ;
      setBookings(data);
    }
    if (lRes.status === "fulfilled" && lRes.value.data) setLeads(lRes.value.data as Lead[]);
    setLoading(false);
  }, [addToast]);

  useEffect(() => {
    fetchData();
    const ch = supabase.channel("dash-rt")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "bookings" }, (payload) => {
        addToast(`📋 New booking: ${(payload.new as Booking).patient_name}`, "success");
        fetchData();
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "bookings" }, fetchData)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [fetchData, addToast]);

  const today = new Date().toISOString().split("T")[0];
  const todayB = bookings.filter(b => b.appointment_date === today);
  const newQ = bookings.filter(b => b.stage === "New");
  const breaches = bookings.filter(b => b.sla_status === "Breach");
  const atRisk = bookings.filter(b => b.sla_status === "At Risk");
  const pending = bookings.filter(b => ["Pending Reports", "Partially Received"].includes(b.stage));
  const done = bookings.filter(b => ["Received", "Completed"].includes(b.stage));
  const revenue = done.reduce((s, b) => s + b.amount, 0);
  const todayRevenue = todayB.filter(b => ["Received", "Completed"].includes(b.stage)).reduce((s, b) => s + b.amount, 0);

  const stageData = [
    { s: "New", n: newQ.length, c: "#3B82F6" },
    { s: "Confirmed", n: bookings.filter(b => b.stage === "Confirmed").length, c: "#22C55E" },
    { s: "Pending Reports", n: pending.length, c: "#F59E0B" },
    { s: "Received", n: done.length, c: "#10B981" },
    { s: "Rejected", n: bookings.filter(b => b.stage === "Rejected").length, c: "#EF4444" },
  ];
  const maxN = Math.max(...stageData.map(x => x.n), 1);

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - 6 + i);
    const ds = d.toISOString().split("T")[0];
    return { day: d.toLocaleDateString("en-IN", { weekday: "short" }), n: bookings.filter(b => b.appointment_date === ds).length, date: ds };
  });
  const maxDay = Math.max(...last7.map(d => d.n), 1);

  const wonLeads = leads.filter(l => l.status === "Won").length;
  const pipelineValue = leads.filter(l => !["Won", "Lost"].includes(l.status)).length * 50000;

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <ToastContainer toasts={toasts} onRemove={id => setToasts(p => p.filter(t => t.id !== id))} />
      <TopBar title="Dashboard" loading={loading} onRefresh={fetchData}
        actions={
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}>
            <span className="w-2 h-2 rounded-full bg-[#22C55E]" style={{ boxShadow: "0 0 6px #22C55E" }} />
            <span className="text-[11px] font-bold text-[#22C55E]">LIVE</span>
          </div>
        }
      />

      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
        {/* Breach + At Risk alerts */}
        {!loading && (breaches.length > 0 || atRisk.length > 0) && (
          <div className="flex flex-col sm:flex-row gap-3">
            {breaches.length > 0 && (
              <div className="flex-1 flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
                <span className="text-xl flex-shrink-0">⚡</span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-red-800">{breaches.length} SLA Breach{breaches.length > 1 ? "es" : ""} — {fmt(breaches.length * 400)} penalty</p>
                  <p className="text-xs text-red-500 mt-0.5">Immediate action required</p>
                </div>
                <button onClick={() => router.push("/bookings")} className="text-red-700 text-xs font-bold border border-red-300 px-3 py-1.5 rounded-xl cursor-pointer hover:bg-red-100 flex-shrink-0">Fix →</button>
              </div>
            )}
            {atRisk.length > 0 && (
              <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
                <span className="text-xl flex-shrink-0">▲</span>
                <div>
                  <p className="text-sm font-bold text-amber-800">{atRisk.length} At Risk</p>
                  <p className="text-xs text-amber-600 mt-0.5">Confirm within 30 min</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* KPI Grid — 2 cols mobile, 3 tablet, 6 desktop */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {loading ? Array.from({ length: 6 }).map((_, i) => <StatSkeleton key={i} />) : (
            <>
              <KPI label="Today" value={todayB.length} sub={new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })} color="#22C55E" icon="📅" trend={todayB.length > 0 ? { val: "Booked", up: true } : undefined} />
              <KPI label="Confirm Queue" value={newQ.length} sub="Need action now" color={newQ.length > 0 ? "#D97706" : "#0B2545"} icon="⏱" warn={newQ.length > 3} />
              <KPI label="Pending Reports" value={pending.length} sub="Awaiting upload" color="#7C3AED" icon="📋" />
              <KPI label="SLA Breaches" value={breaches.length} sub={breaches.length > 0 ? fmt(breaches.length * 400) + " penalty" : "All on track"} color={breaches.length > 0 ? "#DC2626" : "#22C55E"} icon="⚡" warn={breaches.length > 0} />
              <KPI label="Total Bookings" value={bookings.length} sub={`${done.length} completed`} icon="◫" />
              <KPI label="MTD Revenue" value={"₹" + (revenue / 1000).toFixed(0) + "K"} sub={`Today: ${fmt(todayRevenue)}`} color="#22C55E" icon="💰" trend={revenue > 0 ? { val: fmt(Math.round(revenue / Math.max(done.length, 1))) + " avg", up: true } : undefined} />
            </>
          )}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Booking table */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden" style={{ boxShadow: "0 1px 4px rgba(11,37,69,0.06)" }}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E2E8F0]">
              <div>
                <p className="text-[14px] font-bold text-[#0B2545]">Live Booking Queue</p>
                <p className="text-xs text-[#B0BEC5] mt-0.5 hidden sm:block">Auto-refreshes on new bookings</p>
              </div>
              <div className="flex items-center gap-3">
                {newQ.length > 0 && (
                  <button onClick={() => router.push("/bookings")}
                    className="text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer text-white"
                    style={{ background: "#22C55E" }}>
                    Confirm {newQ.length} new →
                  </button>
                )}
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" style={{ boxShadow: "0 0 5px #22C55E" }} />
                  <span className="text-[10px] font-bold text-[#22C55E]">LIVE</span>
                </div>
              </div>
            </div>

            {loading ? <TableSkeleton rows={7} /> : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[580px]">
                  <thead>
                    <tr className="border-b border-[#F0F4F8]">
                      {["ID", "Patient", "Package", "Date", "Stage", "SLA", "Amount"].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-[#B0BEC5] bg-[#FAFBFD]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.slice(0, 10).map(b => (
                      <tr key={b.id} onClick={() => router.push("/bookings")}
                        className="border-b border-[#F5F7FA] hover:bg-[#FAFBFD] transition-colors cursor-pointer group"
                        style={{ background: b.sla_status === "Breach" ? "#FEF2F2" : b.stage === "New" ? "#F0FDF4" : undefined }}>
                        <td className="px-4 py-3"><span className="font-mono text-[11px] text-[#22C55E] font-bold">{b.id.slice(-8)}</span></td>
                        <td className="px-4 py-3">
                          <p className="text-[12px] font-semibold text-[#0B2545]">{b.patient_name}</p>
                          <p className="text-[10px] text-[#B0BEC5] hidden sm:block">{b.patient_phone}</p>
                        </td>
                        <td className="px-4 py-3 text-[11px] text-[#7A90B3] max-w-[110px] truncate">{(b as any).package?.name ?? "—"}</td>
                        <td className="px-4 py-3 text-[11px] text-[#7A90B3] whitespace-nowrap">{b.appointment_date}</td>
                        <td className="px-4 py-3"><StageBadge stage={b.stage} /></td>
                        <td className="px-4 py-3"><SlaBadge status={b.sla_status} /></td>
                        <td className="px-4 py-3 text-[12px] font-bold text-[#0B2545]">{fmt(b.amount)}</td>
                      </tr>
                    ))}
                    {bookings.length === 0 && (
                      <tr><td colSpan={7} className="px-4 py-16 text-center text-sm text-[#B0BEC5]">No bookings yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
            <div className="px-5 py-3 border-t border-[#F5F7FA] flex items-center justify-between">
              <span className="text-xs text-[#B0BEC5]">Showing {Math.min(10, bookings.length)} of {bookings.length}</span>
              <button onClick={() => router.push("/bookings")} className="text-xs text-[#22C55E] font-semibold cursor-pointer">View all →</button>
            </div>
          </div>

          {/* Right panel */}
          <div className="flex flex-col gap-4">
            {/* 7-day chart */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5" style={{ boxShadow: "0 1px 4px rgba(11,37,69,0.06)" }}>
              <p className="text-[13px] font-bold text-[#0B2545] mb-4">7-Day Bookings</p>
              <div className="flex items-end gap-1.5 h-16 mb-2">
                {last7.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[9px] text-[#B0BEC5] font-semibold">{d.n > 0 ? d.n : ""}</span>
                    <div className="w-full rounded-t-md transition-all duration-700 min-h-[3px]"
                      style={{
                        height: `${Math.max((d.n / maxDay) * 52, 3)}px`,
                        background: d.date === today ? "#22C55E" : "#E2E8F0",
                      }} />
                  </div>
                ))}
              </div>
              <div className="flex gap-1.5">
                {last7.map((d, i) => (
                  <span key={i} className="flex-1 text-[9px] text-[#B0BEC5] text-center font-medium">{d.day}</span>
                ))}
              </div>
            </div>

            {/* Pipeline */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5" style={{ boxShadow: "0 1px 4px rgba(11,37,69,0.06)" }}>
              <p className="text-[13px] font-bold text-[#0B2545] mb-4">Stage Distribution</p>
              <div className="space-y-2.5">
                {stageData.map(({ s, n, c }) => (
                  <div key={s} className="flex items-center gap-2.5">
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

            {/* Leads + revenue summary */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5" style={{ boxShadow: "0 1px 4px rgba(11,37,69,0.06)" }}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-[13px] font-bold text-[#0B2545]">Leads Pipeline</p>
                <button onClick={() => router.push("/leads")} className="text-xs text-[#22C55E] font-semibold cursor-pointer">All →</button>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {[
                  { l: "Active", v: leads.filter(l => !["Won", "Lost"].includes(l.status)).length, c: "#0B2545" },
                  { l: "Won", v: wonLeads, c: "#22C55E" },
                  { l: "Pipeline", v: "₹" + (pipelineValue / 100000).toFixed(0) + "L", c: "#7C3AED" },
                ].map(m => (
                  <div key={m.l} className="bg-[#F5F7FA] rounded-xl p-2.5 text-center">
                    <p className="text-[14px] font-black" style={{ color: m.c }}>{m.v}</p>
                    <p className="text-[9px] text-[#B0BEC5] font-semibold uppercase mt-0.5">{m.l}</p>
                  </div>
                ))}
              </div>
              {leads.slice(0, 3).map(l => {
                const sc: Record<string, string> = { "New": "#3B82F6", "Won": "#22C55E", "Lost": "#EF4444", "Negotiation": "#8B5CF6", "Demo Scheduled": "#F59E0B", "Contacted": "#64748B" };
                return (
                  <div key={l.id} onClick={() => router.push("/leads")}
                    className="flex items-center justify-between py-2 border-b border-[#F5F7FA] last:border-0 cursor-pointer hover:bg-[#FAFBFD] -mx-5 px-5">
                    <p className="text-[12px] font-medium text-[#0B2545] truncate flex-1">{l.company_name}</p>
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
