"use client";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { TopBar } from "@/components/layout/TopBar";
import { StageBadge, SlaBadge } from "@/components/ui/Badge";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { fmt } from "@/lib/utils";
import type { Booking } from "@/types";

const STAGES = ["All","New","Confirmed","Completed","Pending Reports","Partially Received","Received","Rejected"];

export default function PDBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("All");
  const [search, setSearch] = useState("");

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("bookings")
      .select("*,lab:labs(name),package:packages(name)")
      .order("created_at", { ascending: false }).limit(500);
    if (data) setBookings(data as Booking[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const counts: Record<string,number> = { All: bookings.length };
  bookings.forEach(b => { counts[b.stage] = (counts[b.stage]??0)+1; });

  const filtered = bookings.filter(b => {
    const matchTab = tab === "All" || b.stage === tab;
    const q = search.toLowerCase();
    return matchTab && (!q || b.patient_name.toLowerCase().includes(q) || b.id.toLowerCase().includes(q));
  });

  return (
    <>
      <TopBar title="All Bookings" subtitle={`${filtered.length} bookings`} loading={loading} onRefresh={fetch} />
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden" style={{ boxShadow: "0 1px 4px rgba(11,37,69,0.06)" }}>
          {/* Search */}
          <div className="px-4 md:px-5 py-4 border-b border-[#E2E8F0] flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#F0F4F8] border border-[#E2E8F0] rounded-xl px-3 py-2 flex-1 max-w-sm">
              <svg className="w-4 h-4 text-[#B0BEC5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <input className="bg-transparent text-sm text-[#0B2545] placeholder-[#B0BEC5] outline-none flex-1"
                placeholder="Search patient or ID…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          {/* Tabs */}
          <div className="flex overflow-x-auto border-b border-[#E2E8F0] px-2">
            {STAGES.map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={"flex items-center gap-1.5 px-3 md:px-4 py-3 text-[11px] md:text-[12px] font-semibold border-b-2 whitespace-nowrap cursor-pointer transition-all " +
                  (tab===t ? "text-[#22C55E] border-[#22C55E]" : "text-[#B0BEC5] border-transparent hover:text-[#3D5A80]")}>
                {t}
                <span className={"px-1.5 py-0.5 rounded-full text-[9px] font-bold " + (tab===t ? "bg-[#22C55E]/10 text-[#22C55E]" : "bg-[#F0F4F8] text-[#B0BEC5]")}>
                  {counts[t]??0}
                </span>
              </button>
            ))}
          </div>
          {/* Table */}
          {loading ? <TableSkeleton rows={6} /> : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="border-b border-[#F0F4F8]">
                    {["ID","Patient","Package","Date","Slot","Stage","SLA","Amount"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-[#B0BEC5] bg-[#FAFBFD]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={8} className="px-4 py-16 text-center text-sm text-[#B0BEC5]">No bookings found</td></tr>
                  ) : filtered.map(b => (
                    <tr key={b.id} className="border-b border-[#F5F7FA] hover:bg-[#FAFBFD] transition-colors">
                      <td className="px-4 py-3"><span className="font-mono text-[11px] text-[#22C55E] font-bold">{b.id.slice(-9)}</span></td>
                      <td className="px-4 py-3"><p className="text-[12px] font-semibold text-[#0B2545]">{b.patient_name}</p><p className="text-[10px] text-[#B0BEC5]">{b.patient_phone}</p></td>
                      <td className="px-4 py-3 text-[11px] text-[#7A90B3] max-w-[120px] truncate">{(b as any).package?.name??"—"}</td>
                      <td className="px-4 py-3 text-[11px] text-[#7A90B3]">{b.appointment_date}</td>
                      <td className="px-4 py-3 text-[11px] text-[#7A90B3]">{b.slot_time?.slice(0,5)??"—"}</td>
                      <td className="px-4 py-3"><StageBadge stage={b.stage}/></td>
                      <td className="px-4 py-3"><SlaBadge status={b.sla_status}/></td>
                      <td className="px-4 py-3 text-[12px] font-bold text-[#0B2545]">{fmt(b.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
