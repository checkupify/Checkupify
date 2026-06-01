"use client";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { TopBar } from "@/components/layout/TopBar";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { fmt } from "@/lib/utils";
import type { Package } from "@/types";

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const fetch = useCallback(async()=>{setLoading(true);const{data}=await supabase.from("packages").select("*").order("sort_order");if(data)setPackages(data as Package[]);setLoading(false);},[]);
  useEffect(()=>{fetch();},[fetch]);
  return (
    <>
      <TopBar title="Health Packages" subtitle={`${packages.filter(p=>p.active).length} active packages`} loading={loading} onRefresh={fetch}/>
      <main className="flex-1 overflow-y-auto p-6">
        <div className="bg-white rounded-2xl border border-[#E8ECF2] overflow-hidden" style={{boxShadow:"0 1px 3px rgba(11,30,61,0.06)"}}>
          {loading?<TableSkeleton rows={6}/>:(
            <table className="w-full">
              <thead><tr className="border-b border-[#F0F4FA]">{["Package","Category","Tests","MRP","Price","Discount","Features","Status"].map(h=><th key={h} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-[#A8BACC] bg-[#FAFBFD]">{h}</th>)}</tr></thead>
              <tbody>
                {packages.map(p=>(
                  <tr key={p.id} className="border-b border-[#F5F7FA] hover:bg-[#FAFBFD] transition-colors">
                    <td className="px-4 py-4"><p className="font-semibold text-[#0D1B35] text-sm">{p.name}</p>{p.badge&&<span className="text-[9px] font-bold bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-lg mt-0.5 inline-block">{p.badge}</span>}</td>
                    <td className="px-4 py-4 text-sm text-[#7A90B3]">{p.category??"—"}</td>
                    <td className="px-4 py-4 text-sm font-bold text-[#0D1B35]">{p.test_count}</td>
                    <td className="px-4 py-4 text-sm text-[#A8BACC] line-through">{fmt(p.mrp??0)}</td>
                    <td className="px-4 py-4 text-sm font-bold text-[#22C55E]">{fmt(p.base_price)}</td>
                    <td className="px-4 py-4 text-sm font-bold text-emerald-600">{p.mrp&&p.mrp>p.base_price?Math.round((p.mrp-p.base_price)/p.mrp*100)+"%":"—"}</td>
                    <td className="px-4 py-4"><div className="flex gap-1.5">{p.fasting_required&&<span className="text-[9px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-lg">Fasting</span>}{p.home_collection&&<span className="text-[9px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-lg">Home</span>}</div></td>
                    <td className="px-4 py-4"><span className={"text-[10px] font-bold px-2.5 py-1 rounded-full "+(p.active?"bg-emerald-50 text-emerald-700":"bg-slate-100 text-slate-500")}>{p.active?"Active":"Off"}</span></td>
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
