"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { TopBar } from "@/components/layout/TopBar";
import { StatCard } from "@/components/ui/Card";
import { StageBadge, SlaBadge } from "@/components/ui/Badge";
import { StatSkeleton, TableSkeleton } from "@/components/ui/Skeleton";
import { fmt, fmtDate, ago } from "@/lib/utils";
import type { Booking, Lead } from "@/types";

export default function DashboardPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [bRes, lRes] = await Promise.allSettled([
      supabase.from("bookings").select("*,lab:labs(name,city),package:packages(name)").order("created_at",{ascending:false}).limit(200),
      supabase.from("leads").select("*").order("created_at",{ascending:false}).limit(50),
    ]);
    if (bRes.status==="fulfilled" && bRes.value.data) setBookings(bRes.value.data as Booking[]);
    if (lRes.status==="fulfilled" && lRes.value.data) setLeads(lRes.value.data as Lead[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
    const ch = supabase.channel("dashboard")
      .on("postgres_changes", {event:"*",schema:"public",table:"bookings"}, fetchData)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [fetchData]);

  const today = new Date().toISOString().split("T")[0];
  const todayB = bookings.filter(b => b.appointment_date === today);
  const newQ = bookings.filter(b => b.stage === "New");
  const breaches = bookings.filter(b => b.sla_status === "Breach");
  const pending = bookings.filter(b => ["Pending Reports","Partially Received"].includes(b.stage));
  const done = bookings.filter(b => ["Received","Completed"].includes(b.stage));
  const revenue = done.reduce((s,b) => s+b.amount, 0);

  const stageData = [
    {s:"New",          n:bookings.filter(b=>b.stage==="New").length,          c:"#3B82F6"},
    {s:"Confirmed",    n:bookings.filter(b=>b.stage==="Confirmed").length,     c:"#22C55E"},
    {s:"Pending",      n:pending.length,                                       c:"#F59E0B"},
    {s:"Received",     n:done.length,                                          c:"#10B981"},
    {s:"Rejected",     n:bookings.filter(b=>b.stage==="Rejected").length,      c:"#EF4444"},
  ];
  const maxN = Math.max(...stageData.map(x=>x.n), 1);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <TopBar
        title="Dashboard"
        loading={loading}
        onRefresh={fetchData}
        actions={
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{background:"rgba(34,197,94,0.08)",border:"1px solid rgba(34,197,94,0.2)"}}>
            <span className="w-2 h-2 rounded-full bg-[#22C55E]" style={{boxShadow:"0 0 6px #22C55E"}} />
            <span className="text-xs font-semibold text-[#22C55E]">LIVE</span>
          </div>
        }
      />

      <main className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* SLA Breach Banner */}
        {!loading && breaches.length > 0 && (
          <div className="flex items-center gap-4 bg-red-50 border border-red-200 rounded-2xl px-5 py-4">
            <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
              <span className="text-lg">⚡</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-red-800">
                {breaches.length} Active SLA Breach{breaches.length>1?"es":""} — {fmt(breaches.length * 400)} in penalties
              </p>
              <p className="text-xs text-red-500 mt-0.5">
                IDs: {breaches.slice(0,3).map(b=>b.id.slice(-8)).join(", ")}{breaches.length>3&&` +${breaches.length-3} more`}
              </p>
            </div>
            <button onClick={()=>router.push("/bookings")}
              className="text-red-700 text-xs font-bold border border-red-300 hover:border-red-400 px-3 py-1.5 rounded-xl cursor-pointer transition-colors bg-white whitespace-nowrap">
              Review →
            </button>
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-6 gap-4">
          {loading ? (
            Array.from({length:6}).map((_,i) => <StatSkeleton key={i}/>)
          ) : (
            <>
              <StatCard label="Today" value={todayB.length}
                sub={new Date().toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short"})}
                color="text-[#22C55E]" icon="📅"
                trend={todayB.length > 0 ? `+${todayB.length} appointments` : "No bookings today"} />
              <StatCard label="New Queue" value={newQ.length}
                sub="Pending confirmation"
                color={newQ.length > 0 ? "text-amber-600" : "text-slate-800"}
                icon="⏱" warn={newQ.length > 5}
                trend={newQ.length > 5 ? "⚠ Action needed" : ""} />
              <StatCard label="Pending Reports" value={pending.length}
                sub="Awaiting upload" color="text-purple-700" icon="📋" />
              <StatCard label="SLA Breaches" value={breaches.length}
                sub={breaches.length > 0 ? fmt(breaches.length * 400)+" penalty" : "All compliant"}
                color={breaches.length > 0 ? "text-red-600" : "text-[#22C55E]"}
                icon="⚡" warn={breaches.length > 0} />
              <StatCard label="Total Bookings" value={bookings.length} sub="All time" icon="◫" />
              <StatCard label="MTD Revenue" value={"₹"+(revenue/1000).toFixed(0)+"K"}
                sub={done.length+" completed"}
                color="text-[#22C55E]" icon="💰"
                trend={done.length > 0 ? fmt(Math.round(revenue/Math.max(done.length,1)))+" avg" : ""} />
            </>
          )}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-3 gap-5">
          {/* Live Booking Table */}
          <div className="col-span-2 bg-white rounded-2xl border border-[#E8ECF2] overflow-hidden" style={{boxShadow:"0 1px 3px rgba(11,30,61,0.06)"}}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8ECF2]">
              <div>
                <p className="text-sm font-bold text-[#0D1B35]">Live Booking Queue</p>
                <p className="text-xs text-[#A8BACC] mt-0.5">{bookings.length} total · real-time updates</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-100">
                <span className="w-2 h-2 rounded-full bg-[#22C55E]" style={{boxShadow:"0 0 5px #22C55E"}} />
                <span className="text-[11px] font-bold text-[#22C55E]">LIVE</span>
              </div>
            </div>

            {loading ? <TableSkeleton rows={7} /> : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#F0F4FA]">
                      {["ID","Patient","Package","Date","Stage","SLA","₹",""].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-[#A8BACC] bg-[#FAFBFD] whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.slice(0,8).map(b => (
                      <tr key={b.id} onClick={()=>router.push("/bookings")}
                        className="border-b border-[#F5F7FA] hover:bg-[#FAFBFD] transition-colors cursor-pointer group">
                        <td className="px-4 py-3.5">
                          <span className="font-mono text-[11px] text-[#22C55E] font-bold">{b.id.slice(-9)}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="text-[12px] font-semibold text-[#0D1B35]">{b.patient_name}</p>
                          <p className="text-[10px] text-[#A8BACC]">{b.patient_phone}</p>
                        </td>
                        <td className="px-4 py-3.5 text-[11px] text-[#7A90B3] max-w-[100px] truncate">
                          {(b as any).package?.name ?? "—"}
                        </td>
                        <td className="px-4 py-3.5 text-[11px] text-[#7A90B3]">{b.appointment_date}</td>
                        <td className="px-4 py-3.5"><StageBadge stage={b.stage}/></td>
                        <td className="px-4 py-3.5"><SlaBadge status={b.sla_status}/></td>
                        <td className="px-4 py-3.5 text-[12px] font-bold text-[#0D1B35]">{fmt(b.amount)}</td>
                        <td className="px-4 py-3.5">
                          <span className="opacity-0 group-hover:opacity-100 text-[10px] text-[#7A90B3] hover:text-[#0D1B35] border border-[#E8ECF2] px-2 py-1 rounded-lg transition-all">→</span>
                        </td>
                      </tr>
                    ))}
                    {bookings.length === 0 && (
                      <tr><td colSpan={8} className="px-4 py-16 text-center text-sm text-[#A8BACC]">No bookings yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            <div className="px-5 py-3 border-t border-[#F5F7FA] flex items-center justify-between">
              <span className="text-xs text-[#A8BACC]">Showing 8 of {bookings.length}</span>
              <button onClick={()=>router.push("/bookings")} className="text-xs text-[#22C55E] hover:text-[#16A34A] font-semibold cursor-pointer">
                View all bookings →
              </button>
            </div>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-4">
            {/* Pipeline chart */}
            <div className="bg-white rounded-2xl border border-[#E8ECF2] p-5" style={{boxShadow:"0 1px 3px rgba(11,30,61,0.06)"}}>
              <p className="text-sm font-bold text-[#0D1B35] mb-4">Pipeline Status</p>
              <div className="space-y-3">
                {stageData.map(({s,n,c}) => (
                  <div key={s} className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{background:c}} />
                    <span className="text-[11px] text-[#7A90B3] flex-1 truncate">{s}</span>
                    <div className="flex items-center gap-2 w-24">
                      <div className="flex-1 h-1.5 bg-[#F0F4FA] rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700 ease-out"
                          style={{width:`${(n/maxN)*100}%`, background:c}} />
                      </div>
                      <span className="text-[11px] font-bold text-[#3D5278] w-4 text-right">{n}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Leads */}
            <div className="bg-white rounded-2xl border border-[#E8ECF2] p-5 flex-1" style={{boxShadow:"0 1px 3px rgba(11,30,61,0.06)"}}>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-bold text-[#0D1B35]">Leads</p>
                <button onClick={()=>router.push("/leads")} className="text-xs text-[#22C55E] hover:text-[#16A34A] cursor-pointer font-semibold">All →</button>
              </div>
              <div className="space-y-0">
                {leads.slice(0,5).map(l => {
                  const colors: Record<string,string> = {
                    "New":"#3B82F6","Contacted":"#64748B","Demo Scheduled":"#F59E0B",
                    "Negotiation":"#8B5CF6","Won":"#22C55E","Lost":"#EF4444"
                  };
                  return (
                    <div key={l.id} onClick={()=>router.push("/leads")}
                      className="flex items-center justify-between py-2.5 border-b border-[#F5F7FA] last:border-0 hover:bg-[#FAFBFD] -mx-5 px-5 cursor-pointer transition-colors">
                      <div>
                        <p className="text-[12px] font-semibold text-[#0D1B35]">{l.company_name}</p>
                        <p className="text-[10px] text-[#A8BACC]">{l.city ?? "—"} · {l.employee_count?.toLocaleString("en-IN") ?? "?"} emp</p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{background:(colors[l.status]??"#64748B")+"15", color:colors[l.status]??"#64748B"}}>
                        {l.status}
                      </span>
                    </div>
                  );
                })}
                {leads.length === 0 && !loading && (
                  <p className="text-xs text-[#A8BACC] py-8 text-center">No leads yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
