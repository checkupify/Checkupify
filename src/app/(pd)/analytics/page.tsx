"use client";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { TopBar } from "@/components/layout/TopBar";
import { StatSkeleton } from "@/components/ui/Skeleton";
import { fmt } from "@/lib/utils";
import type { Booking } from "@/types";

function KPI({ label, value, sub, color = "#0B2545" }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5" style={{ boxShadow: "0 1px 4px rgba(11,37,69,0.06)" }}>
      <p className="text-[10px] font-bold text-[#B0BEC5] uppercase tracking-widest mb-3">{label}</p>
      <p className="text-3xl font-black" style={{ color }}>{value}</p>
      {sub && <p className="text-xs text-[#7A90B3] mt-1">{sub}</p>}
    </div>
  );
}

export default function AnalyticsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const fetch = useCallback(async () => { setLoading(true); const{data}=await supabase.from("bookings").select("*").order("created_at",{ascending:false}); if(data)setBookings(data as Booking[]); setLoading(false); }, []);
  useEffect(() => { fetch(); }, [fetch]);

  const done = bookings.filter(b=>["Received","Completed"].includes(b.stage));
  const gross = done.reduce((s,b)=>s+b.amount,0);
  const fee = Math.round(gross*0.11);
  const net = gross-fee;
  const breaches = bookings.filter(b=>b.sla_status==="Breach").length;
  const compliance = bookings.length>0?Math.round(((bookings.length-breaches)/bookings.length)*100):100;

  const last7 = Array.from({length:7},(_,i)=>{
    const d=new Date(); d.setDate(d.getDate()-6+i);
    const ds=d.toISOString().split("T")[0];
    const db=bookings.filter(b=>b.appointment_date===ds);
    return { day:d.toLocaleDateString("en-IN",{weekday:"short"}), n:db.length, comp:db.length>0?Math.round((db.filter(b=>b.sla_status!=="Breach").length/db.length)*100):100 };
  });
  const maxN = Math.max(...last7.map(d=>d.n),1);

  return (
    <>
      <TopBar title="Analytics" subtitle="Performance & SLA compliance" loading={loading} onRefresh={fetch} />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {loading ? Array.from({length:4}).map((_,i)=><StatSkeleton key={i}/>) : (
            <>
              <KPI label="SLA Compliance" value={compliance+"%"} sub="Last 30 days" color={compliance>=90?"#22C55E":compliance>=70?"#F59E0B":"#EF4444"} />
              <KPI label="SLA Breaches" value={String(breaches)} sub={breaches>0?"₹"+(breaches*400).toLocaleString("en-IN")+" penalty":"All clear"} color={breaches>0?"#EF4444":"#22C55E"} />
              <KPI label="Net Payout" value={fmt(net)} sub={"Gross: "+fmt(gross)} color="#22C55E" />
              <KPI label="Avg Order" value={fmt(done.length>0?Math.round(gross/done.length):0)} sub={done.length+" completed"} />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          {/* Daily chart */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5" style={{ boxShadow: "0 1px 4px rgba(11,37,69,0.06)" }}>
            <p className="text-[14px] font-bold text-[#0B2545] mb-5">7-Day Bookings</p>
            <div className="flex items-end gap-2 h-20 mb-2">
              {last7.map((d,i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[9px] text-[#B0BEC5]">{d.n}</span>
                  <div className="w-full rounded-t-lg transition-all" style={{ height: `${Math.max((d.n/maxN)*60,4)}px`, background: "linear-gradient(to top, #22C55E, #16A34A)" }} />
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              {last7.map((d,i) => <span key={i} className="flex-1 text-[9px] text-[#B0BEC5] text-center">{d.day}</span>)}
            </div>
          </div>

          {/* SLA config */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5" style={{ boxShadow: "0 1px 4px rgba(11,37,69,0.06)" }}>
            <p className="text-[14px] font-bold text-[#0B2545] mb-4">SLA Targets</p>
            {[["Confirmation","< 2 hours","₹400/breach"],["First Report","< 6 hours","₹600/breach"],["Full Report","< 36 hours","₹1,000/breach"]].map(([k,v,p]) => (
              <div key={k} className="py-3 border-b border-[#F5F7FA] last:border-0">
                <div className="flex justify-between mb-0.5">
                  <span className="text-[13px] font-semibold text-[#0B2545]">{k}</span>
                  <span className="text-[12px] text-[#22C55E] font-bold">{v}</span>
                </div>
                <p className="text-[10px] text-red-400">{p}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
