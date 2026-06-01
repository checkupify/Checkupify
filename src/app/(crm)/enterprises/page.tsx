"use client";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { TopBar } from "@/components/layout/TopBar";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { fmtDate } from "@/lib/utils";
import type { Enterprise } from "@/types";

export default function EnterprisesPage() {
  const [data, setData] = useState<Enterprise[]>([]);
  const [loading, setLoading] = useState(true);
  const fetch = useCallback(async()=>{setLoading(true);const{data}=await supabase.from("enterprises").select("*").order("name");if(data)setData(data as Enterprise[]);setLoading(false);},[]);
  useEffect(()=>{fetch();},[fetch]);
  return (
    <>
      <TopBar title="Enterprise Partners" subtitle={`${data.filter(e=>e.active).length} active contracts`} loading={loading} onRefresh={fetch}/>
      <main className="flex-1 overflow-y-auto p-6">
        <div className="bg-white rounded-2xl border border-[#E8ECF2] overflow-hidden" style={{boxShadow:"0 1px 3px rgba(11,30,61,0.06)"}}>
          {loading?<TableSkeleton rows={5}/>:data.length===0?<div className="px-4 py-16 text-center text-sm text-[#A8BACC]">No enterprise clients yet</div>:(
            <table className="w-full">
              <thead><tr className="border-b border-[#F0F4FA]">{["Enterprise","Type","POC","Contact","Discount","Contract Period","Status"].map(h=><th key={h} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-[#A8BACC] bg-[#FAFBFD]">{h}</th>)}</tr></thead>
              <tbody>
                {data.map(e=>(
                  <tr key={e.id} className="border-b border-[#F5F7FA] hover:bg-[#FAFBFD] transition-colors">
                    <td className="px-4 py-4 font-bold text-[#0D1B35] text-sm">{e.name}</td>
                    <td className="px-4 py-4"><span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">{e.type}</span></td>
                    <td className="px-4 py-4 text-sm text-[#3D5278] font-medium">{e.poc_name}</td>
                    <td className="px-4 py-4"><p className="text-xs text-[#7A90B3]">{e.poc_email}</p><p className="text-[10px] text-[#A8BACC]">{e.poc_phone}</p></td>
                    <td className="px-4 py-4 text-sm font-bold text-[#22C55E]">{e.discount_pct}% off</td>
                    <td className="px-4 py-4"><p className="text-xs text-[#7A90B3]">{fmtDate(e.contract_start)}</p><p className="text-[10px] text-[#A8BACC]">→ {fmtDate(e.contract_end)}</p></td>
                    <td className="px-4 py-4"><span className={"text-[10px] font-bold px-2.5 py-1 rounded-full "+(e.active?"bg-emerald-50 text-emerald-700":"bg-slate-100 text-slate-500")}>{e.active?"Active":"Off"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </>
  );
}
