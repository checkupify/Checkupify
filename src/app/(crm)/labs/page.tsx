"use client";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { TopBar } from "@/components/layout/TopBar";
import { TableSkeleton } from "@/components/ui/Skeleton";
import type { Lab } from "@/types";

export default function LabsPage() {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(true);
  const fetch = useCallback(async()=>{setLoading(true);const{data}=await supabase.from("labs").select("*").order("rating",{ascending:false});if(data)setLabs(data as Lab[]);setLoading(false);},[]);
  useEffect(()=>{fetch();},[fetch]);
  return (
    <>
      <TopBar title="Lab Network" subtitle={`${labs.filter(l=>l.active).length} active partners`} loading={loading} onRefresh={fetch}/>
      <main className="flex-1 overflow-y-auto p-6">
        <div className="bg-white rounded-2xl border border-[#E8ECF2] overflow-hidden" style={{boxShadow:"0 1px 3px rgba(11,30,61,0.06)"}}>
          <div className="px-5 py-4 border-b border-[#E8ECF2]"><p className="text-sm font-bold text-[#0D1B35]">Certified Lab Partners</p></div>
          {loading?<TableSkeleton rows={5}/>:(
            <table className="w-full">
              <thead><tr className="border-b border-[#F0F4FA]">{["Lab","City","Network","Rating","Quality Score","Avg TAT","NABL","Status"].map(h=><th key={h} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-[#A8BACC] bg-[#FAFBFD]">{h}</th>)}</tr></thead>
              <tbody>
                {labs.map(l=>(
                  <tr key={l.id} className="border-b border-[#F5F7FA] hover:bg-[#FAFBFD] transition-colors">
                    <td className="px-4 py-4"><p className="font-semibold text-[#0D1B35] text-sm">{l.name}</p>{l.phone&&<p className="text-[10px] text-[#A8BACC] mt-0.5">{l.phone}</p>}</td>
                    <td className="px-4 py-4 text-sm text-[#3D5278]">{l.city||"—"}</td>
                    <td className="px-4 py-4">
                      <span className={"text-[10px] font-bold px-2.5 py-1 rounded-full " + (l.network_type==="Super Premium"?"bg-purple-50 text-purple-700":l.network_type==="Premium"?"bg-blue-50 text-blue-700":"bg-slate-100 text-slate-600")}>
                        {l.network_type}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-amber-500 font-bold text-sm">★ {l.rating}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-[#F0F4FA] rounded-full overflow-hidden"><div className="h-full rounded-full bg-[#22C55E]" style={{width:`${l.score}%`}}/></div>
                        <span className="text-xs text-[#7A90B3] font-medium">{l.score}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-[#7A90B3]">{l.avg_tat_hours}h</td>
                    <td className="px-4 py-4">{l.nabl_certified?<span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg">✓ NABL</span>:<span className="text-[#D1D8E4] text-xs">—</span>}</td>
                    <td className="px-4 py-4"><span className={"text-[10px] font-bold px-2.5 py-1 rounded-full "+(l.active?"bg-emerald-50 text-emerald-700":"bg-slate-100 text-slate-500")}>{l.active?"Active":"Off"}</span></td>
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
