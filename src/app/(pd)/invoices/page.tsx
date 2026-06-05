"use client";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { TopBar } from "@/components/layout/TopBar";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { fmt, fmtDate } from "@/lib/utils";
import type { Booking } from "@/types";

export default function InvoicesPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"all" | "pending" | "paid">("all");
  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("bookings").select("*,package:packages(name)").order("appointment_date", { ascending: false }).limit(200);
    if (data) setBookings(data as Booking[]);
    setLoading(false);
  }, []);
  useEffect(() => { fetch(); }, [fetch]);

  const done = bookings.filter(b => ["Received", "Reports Received", "Completed"].includes(b.stage));
  const gross = done.reduce((s, b) => s + b.amount, 0);
  const fee = Math.round(gross * 0.11);
  const net = gross - fee;

  // Group by month
  const byMonth: Record<string, { gross: number; count: number }> = {};
  done.forEach(b => {
    const m = b.appointment_date?.slice(0, 7) ?? "Unknown";
    if (!byMonth[m]) byMonth[m] = { gross: 0, count: 0 };
    byMonth[m].gross += b.amount;
    byMonth[m].count++;
  });
  const months = Object.entries(byMonth).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 6);

  const filtered = tab === "all" ? done : tab === "pending" ? bookings.filter(b => b.stage === "Confirmed") : done;

  return (
    <>
      <TopBar title="Invoices & Payouts" subtitle="Revenue tracking and payout summary" loading={loading} onRefresh={fetch} />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { l: "Gross Revenue", v: fmt(gross), sub: done.length + " completed bookings", c: "#0B2545" },
            { l: "Platform Fee (11%)", v: "−" + fmt(fee), sub: "Deducted by Checkupify", c: "#F59E0B" },
            { l: "Net Payout", v: fmt(net), sub: "Your earnings", c: "#00CC8E" },
          ].map(c => (
            <div key={c.l} className="bg-white rounded-2xl border border-[#E2E8F0] p-5" style={{ boxShadow: "0 1px 4px rgba(11,37,69,.06)" }}>
              <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-3">{c.l}</p>
              <p className="text-2xl font-black" style={{ color: c.c }}>{c.v}</p>
              <p className="text-xs text-[#94A3B8] mt-1">{c.sub}</p>
            </div>
          ))}
        </div>

        {/* Monthly breakdown */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden" style={{ boxShadow: "0 1px 4px rgba(11,37,69,.06)" }}>
          <div className="px-5 py-4 border-b border-[#E2E8F0]">
            <p className="text-[14px] font-bold text-[#0B2545]">Monthly Summary</p>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#F0F4F8]">
                {["Month", "Bookings", "Gross", "Fee (11%)", "Net Payout"].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-[#94A3B8] bg-[#FAFBFD]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {months.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-12 text-center text-sm text-[#94A3B8]">No completed bookings yet</td></tr>
              ) : months.map(([m, data]) => {
                const mFee = Math.round(data.gross * 0.11);
                return (
                  <tr key={m} className="border-b border-[#F5F7FA] hover:bg-[#FAFBFD]">
                    <td className="px-5 py-3.5 text-sm font-semibold text-[#0B2545]">{m}</td>
                    <td className="px-5 py-3.5 text-sm text-[#7A90B3]">{data.count}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-[#0B2545]">{fmt(data.gross)}</td>
                    <td className="px-5 py-3.5 text-sm text-[#F59E0B]">−{fmt(mFee)}</td>
                    <td className="px-5 py-3.5 text-sm font-bold" style={{ color: "#00CC8E" }}>{fmt(data.gross - mFee)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
