"use client";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { TopBar } from "@/components/layout/TopBar";
import { fmt } from "@/lib/utils";
import type { Lab, Package } from "@/types";

export default function ContractsPage() {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [pkgs, setPkgs] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const fetch = useCallback(async () => {
    setLoading(true);
    const [lRes, pRes] = await Promise.allSettled([
      supabase.from("labs").select("*").order("name"),
      supabase.from("packages").select("*").eq("active", true).order("sort_order"),
    ]);
    if (lRes.status === "fulfilled" && lRes.value.data) setLabs(lRes.value.data as Lab[]);
    if (pRes.status === "fulfilled" && pRes.value.data) setPkgs(pRes.value.data as Package[]);
    setLoading(false);
  }, []);
  useEffect(() => { fetch(); }, [fetch]);

  return (
    <>
      <TopBar title="Contract & Packages" subtitle="Your lab's contracted packages" loading={loading} onRefresh={fetch} />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Lab info */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5" style={{ boxShadow: "0 1px 4px rgba(11,37,69,.06)" }}>
            <p className="text-[14px] font-bold text-[#0B2545] mb-4">Lab Partners</p>
            {labs.map(l => (
              <div key={l.id} className="flex items-start gap-3 py-3 border-b border-[#F5F7FA] last:border-0">
                <div className="w-10 h-10 rounded-xl bg-[#F0F4F8] flex items-center justify-center text-xl flex-shrink-0">🏥</div>
                <div className="flex-1">
                  <p className="text-[13px] font-bold text-[#0B2545]">{l.name}</p>
                  <p className="text-[11px] text-[#7A90B3]">{l.city} · ★ {l.rating}</p>
                  <div className="flex gap-2 mt-1.5 flex-wrap">
                    {l.nabl_certified && <span className="text-[9px] font-bold px-2 py-0.5 rounded text-white" style={{ background: "#00CC8E" }}>✓ NABL</span>}
                    {l.home_collection && <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700">🏠 Home</span>}
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-[#F0F4F8] text-[#7A90B3]">TAT {l.avg_tat_hours}h</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Packages */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5" style={{ boxShadow: "0 1px 4px rgba(11,37,69,.06)" }}>
            <p className="text-[14px] font-bold text-[#0B2545] mb-4">Active Packages ({pkgs.length})</p>
            <div className="max-h-96 overflow-y-auto space-y-2.5">
              {pkgs.map(p => (
                <div key={p.id} className="flex items-center justify-between py-2.5 border-b border-[#F5F7FA] last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-[#0B2545] truncate">{p.name}</p>
                    <p className="text-[10px] text-[#94A3B8]">{p.test_count} tests{p.fasting_required ? " · Fasting" : ""}</p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <p className="text-[13px] font-bold" style={{ color: "#00CC8E" }}>{fmt(p.base_price)}</p>
                    {p.mrp && p.mrp > p.base_price && (
                      <p className="text-[10px] text-[#94A3B8] line-through">{fmt(p.mrp)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contract terms */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5" style={{ boxShadow: "0 1px 4px rgba(11,37,69,.06)" }}>
          <p className="text-[14px] font-bold text-[#0B2545] mb-4">Contract Terms</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { l: "Platform Fee", v: "11%", sub: "Deducted per booking" },
              { l: "Payment Cycle", v: "Monthly", sub: "1st of each month" },
              { l: "SLA — Confirm", v: "2 hrs", sub: "₹400/breach" },
              { l: "SLA — Reports", v: "36 hrs", sub: "₹1,000/breach" },
            ].map(t => (
              <div key={t.l} className="bg-[#F8FAFC] rounded-xl p-4 border border-[#E2E8F0]">
                <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest mb-2">{t.l}</p>
                <p className="text-[15px] font-black text-[#0B2545]">{t.v}</p>
                <p className="text-[11px] text-[#94A3B8] mt-0.5">{t.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
