"use client";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { TopBar } from "@/components/layout/TopBar";
import { StatCard } from "@/components/ui/Card";
import { TableSkeleton, StatSkeleton } from "@/components/ui/Skeleton";
import { fmt } from "@/lib/utils";
import type { Booking } from "@/types";

const ALL_STAGES = ["New","Confirmed","Completed","Pending Reports","Partially Received","Received","Rejected","No Show"];

export default function FinancePage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const fetch = useCallback(async()=>{setLoading(true);const{data}=await supabase.from("bookings").select("*,lab:labs(name)").order("created_at",{ascending:false});if(data)setBookings(data as Booking[]);setLoading(false);},[]);
  useEffect(()=>{fetch();},[fetch]);

  const done=bookings.filter(b=>["Received","Completed"].includes(b.stage));
  const gross=done.reduce((s,b)=>s+b.amount,0);
  const fee=Math.round(gross*0.11);
  const net=gross-fee;
  const avg=done.length>0?Math.round(gross/done.length):0;
  const byLab=Object.entries(done.reduce((acc,b)=>{const n=(b as any).lab?.name??"Unknown";acc[n]=(acc[n]??0)+b.amount;return acc;},{} as Record<string,number>)).sort((a,b)=>b[1]-a[1]);
  const stageCounts=ALL_STAGES.map(s=>({s,n:bookings.filter(b=>b.stage===s).length}));
  const maxN=Math.max(...stageCounts.map(x=>x.n),1);

  return (
    <>
      <TopBar title="Finance" subtitle="Revenue & payout breakdown" loading={loading} onRefresh={fetch}/>
      <main className="flex-1 overflow-y-auto p-6 space-y-5">
        <div className="grid grid-cols-4 gap-4">
          {loading?Array.from({length:4}).map((_,i)=><StatSkeleton key={i}/>):<>
            <StatCard label="Gross Revenue" value={fmt(gross)} color="text-[#22C55E]" icon="💰" trend={done.length+" completed bookings"}/>
            <StatCard label="Platform Fee (11%)" value={fmt(fee)} color="text-amber-600" icon="%" trend="Deducted from lab payout"/>
            <StatCard label="Net to Labs" value={fmt(net)} color="text-blue-700" icon="🏥"/>
            <StatCard label="Avg Order Value" value={fmt(avg)} icon="📊"/>
          </>}
        </div>
        <div className="grid grid-cols-2 gap-5">
          <div className="bg-white rounded-2xl border border-[#E8ECF2] overflow-hidden" style={{boxShadow:"0 1px 3px rgba(11,30,61,0.06)"}}>
            <div className="px-5 py-4 border-b border-[#E8ECF2]"><p className="text-sm font-bold text-[#0D1B35]">Revenue by Lab</p></div>
            {loading?<TableSkeleton rows={4}/>:(
              <table className="w-full">
                <thead><tr className="border-b border-[#F0F4FA]">{["Lab","Gross","Fee","Net Payout"].map(h=><th key={h} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-[#A8BACC] bg-[#FAFBFD]">{h}</th>)}</tr></thead>
                <tbody>
                  {byLab.length===0?<tr><td colSpan={4} className="px-4 py-12 text-center text-sm text-[#A8BACC]">No completed bookings</td></tr>
                  :byLab.map(([name,rev])=>{const lf=Math.round(rev*0.11);return(
                    <tr key={name} className="border-b border-[#F5F7FA] hover:bg-[#FAFBFD] transition-colors">
                      <td className="px-4 py-3.5 font-semibold text-[#0D1B35] text-sm">{name}</td>
                      <td className="px-4 py-3.5 text-sm font-bold text-[#0D1B35]">{fmt(rev)}</td>
                      <td className="px-4 py-3.5 text-sm text-amber-600">−{fmt(lf)}</td>
                      <td className="px-4 py-3.5 text-sm font-bold text-[#22C55E]">{fmt(rev-lf)}</td>
                    </tr>
                  );})}
                </tbody>
              </table>
            )}
          </div>
          <div className="bg-white rounded-2xl border border-[#E8ECF2] p-5" style={{boxShadow:"0 1px 3px rgba(11,30,61,0.06)"}}>
            <p className="text-sm font-bold text-[#0D1B35] mb-5">Booking Stage Distribution</p>
            <div className="space-y-3">
              {stageCounts.map(({s,n})=>(
                <div key={s} className="flex items-center gap-3">
                  <span className="text-[11px] text-[#7A90B3] w-32 flex-shrink-0 truncate">{s}</span>
                  <div className="flex-1 h-2 bg-[#F5F7FA] rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#22C55E] to-[#16A34A] transition-all duration-700" style={{width:`${(n/maxN)*100}%`}}/>
                  </div>
                  <span className="text-[11px] font-bold text-[#3D5278] w-6 text-right">{n}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
