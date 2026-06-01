"use client";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { TopBar } from "@/components/layout/TopBar";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { fmt, fmtDate } from "@/lib/utils";
import type { Booking } from "@/types";

interface Customer { phone:string;name:string;gender:string;age:number;count:number;spend:number;last:string; }

export default function CustomersPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetch = useCallback(async()=>{setLoading(true);const{data}=await supabase.from("bookings").select("*").order("created_at",{ascending:false});if(data)setBookings(data as Booking[]);setLoading(false);},[]);
  useEffect(()=>{fetch();},[fetch]);

  const cmap = new Map<string,Customer>();
  bookings.forEach(b=>{const e=cmap.get(b.patient_phone);if(!e)cmap.set(b.patient_phone,{phone:b.patient_phone,name:b.patient_name,gender:b.patient_gender,age:b.patient_age,count:1,spend:b.amount,last:b.created_at});else{e.count++;e.spend+=b.amount;if(b.created_at>e.last)e.last=b.created_at;}});
  const customers=Array.from(cmap.values()).sort((a,b)=>b.spend-a.spend).filter(c=>!search||c.name.toLowerCase().includes(search.toLowerCase())||c.phone.includes(search));

  return (
    <>
      <TopBar title="Customers" subtitle={`${customers.length} unique patients`} loading={loading} onRefresh={fetch}/>
      <main className="flex-1 overflow-y-auto p-6">
        <div className="bg-white rounded-2xl border border-[#E8ECF2] overflow-hidden" style={{boxShadow:"0 1px 3px rgba(11,30,61,0.06)"}}>
          <div className="px-5 py-4 border-b border-[#E8ECF2] flex items-center justify-between">
            <p className="text-sm font-bold text-[#0D1B35]">Patient Directory</p>
            <div className="flex items-center gap-2.5 bg-[#F5F7FA] border border-[#E8ECF2] rounded-xl px-3.5 py-2">
              <svg className="w-4 h-4 text-[#A8BACC]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <input className="bg-transparent text-sm text-[#0D1B35] placeholder-[#A8BACC] outline-none w-44" placeholder="Search patients…" value={search} onChange={e=>setSearch(e.target.value)}/>
            </div>
          </div>
          {loading?<TableSkeleton rows={6}/>:(
            <table className="w-full">
              <thead><tr className="border-b border-[#F0F4FA]">{["Patient","Phone","Profile","Bookings","Total Spend","Last Booking"].map(h=><th key={h} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-[#A8BACC] bg-[#FAFBFD]">{h}</th>)}</tr></thead>
              <tbody>
                {customers.length===0?<tr><td colSpan={6} className="px-4 py-16 text-center text-sm text-[#A8BACC]">No customers yet</td></tr>
                :customers.map(c=>(
                  <tr key={c.phone} className="border-b border-[#F5F7FA] hover:bg-[#FAFBFD] transition-colors">
                    <td className="px-4 py-3.5"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold text-sm">{c.name[0]}</div><span className="text-sm font-semibold text-[#0D1B35]">{c.name}</span></div></td>
                    <td className="px-4 py-3.5 text-sm text-[#3D5278]">{c.phone}</td>
                    <td className="px-4 py-3.5 text-xs text-[#A8BACC]">{c.gender}, {c.age} yrs</td>
                    <td className="px-4 py-3.5 text-sm font-bold text-[#0D1B35]">{c.count}</td>
                    <td className="px-4 py-3.5 text-sm font-bold text-[#22C55E]">{fmt(c.spend)}</td>
                    <td className="px-4 py-3.5 text-xs text-[#A8BACC]">{fmtDate(c.last)}</td>
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
