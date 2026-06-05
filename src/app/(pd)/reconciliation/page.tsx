"use client";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { TopBar } from "@/components/layout/TopBar";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { fmt, fmtDate } from "@/lib/utils";
import type { Booking } from "@/types";

export default function ReconciliationPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("bookings").select("*,package:packages(name)").order("appointment_date", { ascending: false }).limit(300);
    if (data) setBookings(data as Booking[]);
    setLoading(false);
  }, []);
  useEffect(() => { fetch(); }, [fetch]);

  const filtered = bookings.filter(b => !search || b.patient_name.toLowerCase().includes(search.toLowerCase()) || b.id.toLowerCase().includes(search.toLowerCase()));

  const done = bookings.filter(b => ["Received", "Reports Received"].includes(b.stage));
  const pending = bookings.filter(b => !["Received", "Reports Received", "Rejected", "No Show"].includes(b.stage));
  const gross = done.reduce((s, b) => s + b.amount, 0);

  return (
    <>
      <TopBar title="Reconciliation" subtitle="Match bookings with payouts" loading={loading} onRefresh={fetch} />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
        <div className="grid grid-cols-3 gap-4">
          {[
            { l: "Receivable", v: fmt(gross), sub: done.length + " completed", c: "#00CC8E" },
            { l: "Pending Settlement", v: fmt(pending.reduce((s, b) => s + b.amount, 0)), sub: pending.length + " in progress", c: "#F59E0B" },
            { l: "Net Payout Due", v: fmt(Math.round(gross * 0.89)), sub: "After 11% platform fee", c: "#0B2545" },
          ].map(c => (
            <div key={c.l} className="bg-white rounded-2xl border border-[#E2E8F0] p-4" style={{ boxShadow: "0 1px 4px rgba(11,37,69,.06)" }}>
              <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-2">{c.l}</p>
              <p className="text-2xl font-black" style={{ color: c.c }}>{c.v}</p>
              <p className="text-xs text-[#94A3B8] mt-1">{c.sub}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden" style={{ boxShadow: "0 1px 4px rgba(11,37,69,.06)" }}>
          <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 flex-1 max-w-sm">
              <span className="text-[#94A3B8]">🔍</span>
              <input className="bg-transparent text-sm text-[#0B2545] placeholder-[#B0BEC5] outline-none flex-1" placeholder="Search booking or ID…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>
          {loading ? <TableSkeleton rows={6} /> : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-[#F0F4F8]">
                    {["Booking ID", "Patient", "Package", "Date", "Amount", "Fee", "Net", "Status"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] bg-[#FAFBFD]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice(0, 50).map(b => {
                    const fee = Math.round(b.amount * 0.11);
                    const isSettled = ["Received", "Reports Received"].includes(b.stage);
                    return (
                      <tr key={b.id} className="border-b border-[#F5F7FA] hover:bg-[#FAFBFD]">
                        <td className="px-4 py-3"><span className="font-mono text-[11px] font-bold" style={{ color: "#00CC8E" }}>{b.id.slice(-9)}</span></td>
                        <td className="px-4 py-3 text-[12px] font-semibold text-[#0B2545]">{b.patient_name}</td>
                        <td className="px-4 py-3 text-[11px] text-[#7A90B3] max-w-[110px] truncate">{(b as any).package?.name ?? "—"}</td>
                        <td className="px-4 py-3 text-[11px] text-[#7A90B3]">{b.appointment_date}</td>
                        <td className="px-4 py-3 text-[12px] font-bold text-[#0B2545]">{fmt(b.amount)}</td>
                        <td className="px-4 py-3 text-[11px] text-[#F59E0B]">−{fmt(fee)}</td>
                        <td className="px-4 py-3 text-[12px] font-bold" style={{ color: "#00CC8E" }}>{fmt(b.amount - fee)}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isSettled ? "bg-[#E6FFF7] text-[#00A873]" : "bg-amber-50 text-amber-700"}`}>
                            {isSettled ? "Settled" : "Pending"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
