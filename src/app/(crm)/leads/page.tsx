"use client";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/Button";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { Modal } from "@/components/ui/Modal";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { ToastContainer } from "@/components/ui/Toast";
import { fmtDate, LEAD_STYLE } from "@/lib/utils";
import type { Lead } from "@/types";

const STATUSES = ["New","Contacted","Demo Scheduled","Negotiation","Won","Lost"];
const SOURCES = ["LinkedIn","Referral","Cold Email","Event","Inbound","Website","Other"];
const EMPTY = {company_name:"",contact_name:"",contact_email:"",contact_phone:"",employee_count:"",city:"",source:"",status:"New",notes:""};
type Toast = {id:string;message:string;type:"success"|"error"|"info"};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Lead|null>(null);
  const [form, setForm] = useState(EMPTY);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (m:string,t:Toast["type"]="info") => setToasts(p=>[...p,{id:Math.random().toString(36).slice(2),message:m,type:t}]);
  const fetchLeads = useCallback(async()=>{setLoading(true);const{data}=await supabase.from("leads").select("*").order("created_at",{ascending:false});if(data)setLeads(data as Lead[]);setLoading(false);},[]);
  useEffect(()=>{fetchLeads();},[fetchLeads]);

  function openCreate(){setEditing(null);setForm(EMPTY);setShowForm(true);}
  function openEdit(l:Lead){setEditing(l);setForm({company_name:l.company_name,contact_name:l.contact_name??"",contact_email:l.contact_email??"",contact_phone:l.contact_phone??"",employee_count:String(l.employee_count??""),city:l.city??"",source:l.source??"",status:l.status,notes:l.notes??""});setShowForm(true);}

  async function save(){
    if(!form.company_name.trim()){addToast("Company name required","error");return;}
    setSaving(true);
    const payload={...form,employee_count:form.employee_count?parseInt(form.employee_count):null};
    const{error}=editing?await supabase.from("leads").update(payload).eq("id",editing.id):await supabase.from("leads").insert(payload);
    setSaving(false);
    if(error)addToast(error.message,"error");
    else{addToast(editing?"Lead updated":"Lead created","success");setShowForm(false);setEditing(null);fetchLeads();}
  }

  async function updateStatus(id:string,status:string){
    const{error}=await supabase.from("leads").update({status}).eq("id",id);
    if(error)addToast(error.message,"error");else{addToast("Status updated","success");fetchLeads();}
  }

  const counts:Record<string,number>={All:leads.length};
  leads.forEach(l=>{counts[l.status]=(counts[l.status]??0)+1;});
  const filtered=filter==="All"?leads:leads.filter(l=>l.status===filter);
  const sf=(k:keyof typeof form)=>(v:string)=>setForm(p=>({...p,[k]:v}));

  const statusColors:Record<string,string>={New:"#3B82F6",Contacted:"#64748B","Demo Scheduled":"#F59E0B",Negotiation:"#8B5CF6",Won:"#22C55E",Lost:"#EF4444"};

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={id=>setToasts(p=>p.filter(t=>t.id!==id))}/>
      <Modal open={showForm} onClose={()=>{setShowForm(false);setEditing(null);}} title={editing?"Edit Lead":"New Lead"} size="lg"
        footer={<><Button variant="outline" onClick={()=>{setShowForm(false);setEditing(null);}}>Cancel</Button><Button variant="primary" onClick={save} loading={saving}>{editing?"Save Changes":"Create Lead"}</Button></>}>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Company Name" value={form.company_name} onChange={sf("company_name")} required placeholder="e.g. Infosys BPM"/>
          <Input label="Contact Name" value={form.contact_name} onChange={sf("contact_name")} placeholder="Full name"/>
          <Input label="Email" type="email" value={form.contact_email} onChange={sf("contact_email")} placeholder="name@company.com"/>
          <Input label="Phone" value={form.contact_phone} onChange={sf("contact_phone")} placeholder="+91-98765xxxxx"/>
          <Input label="Employee Count" type="number" value={form.employee_count} onChange={sf("employee_count")} placeholder="5000"/>
          <Input label="City" value={form.city} onChange={sf("city")} placeholder="Hyderabad"/>
          <Select label="Status" value={form.status} onChange={sf("status")} options={STATUSES.map(s=>({value:s,label:s}))}/>
          <Select label="Source" value={form.source} onChange={sf("source")} options={SOURCES.map(s=>({value:s,label:s}))}/>
          <div className="col-span-2"><Textarea label="Notes" value={form.notes} onChange={sf("notes")} placeholder="Context or next steps…"/></div>
        </div>
      </Modal>

      <TopBar title="Leads" subtitle={`${leads.length} total leads`} loading={loading} onRefresh={fetchLeads}
        actions={<Button variant="primary" size="sm" onClick={openCreate}>+ New Lead</Button>}/>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="bg-white rounded-2xl border border-[#E8ECF2] overflow-hidden" style={{boxShadow:"0 1px 3px rgba(11,30,61,0.06)"}}>
          <div className="flex gap-2 px-5 py-4 border-b border-[#E8ECF2] overflow-x-auto">
            {["All",...STATUSES].map(s=>(
              <button key={s} onClick={()=>setFilter(s)}
                className={"flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[12px] font-semibold border cursor-pointer transition-all whitespace-nowrap " +
                  (filter===s?"border-[#22C55E] bg-emerald-50 text-emerald-700":"border-[#E8ECF2] text-[#7A90B3] hover:border-[#D1D8E4] hover:text-[#3D5278]")}>
                {s}<span className="font-bold">{counts[s]??0}</span>
              </button>
            ))}
          </div>

          {loading?<TableSkeleton rows={6}/>:(
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="border-b border-[#F0F4FA]">
                  {["Company","Contact","Email","Employees","City","Status","Source","Added",""].map(h=>(
                    <th key={h} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-[#A8BACC] bg-[#FAFBFD]">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {filtered.length===0?<tr><td colSpan={9} className="px-4 py-16 text-center text-sm text-[#A8BACC]">No leads found</td></tr>
                  :filtered.map(l=>(
                    <tr key={l.id} className="border-b border-[#F5F7FA] hover:bg-[#FAFBFD] transition-colors group">
                      <td className="px-4 py-3.5"><p className="text-sm font-semibold text-[#0D1B35]">{l.company_name}</p></td>
                      <td className="px-4 py-3.5 text-sm text-[#3D5278]">{l.contact_name??"—"}</td>
                      <td className="px-4 py-3.5 text-xs text-[#7A90B3]">{l.contact_email??"—"}</td>
                      <td className="px-4 py-3.5 text-sm text-[#3D5278]">{l.employee_count?.toLocaleString("en-IN")??"—"}</td>
                      <td className="px-4 py-3.5 text-sm text-[#7A90B3]">{l.city??"—"}</td>
                      <td className="px-4 py-3.5">
                        <select value={l.status} onChange={e=>updateStatus(l.id,e.target.value)}
                          className="text-[11px] font-bold px-2.5 py-1 rounded-full border-0 cursor-pointer outline-none"
                          style={{background:(statusColors[l.status]??"#64748B")+"15",color:statusColors[l.status]??"#64748B"}}>
                          {STATUSES.map(s=><option key={s} value={s} style={{background:"white",color:"#0D1B35"}}>{s}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-[#A8BACC]">{l.source??"—"}</td>
                      <td className="px-4 py-3.5 text-xs text-[#A8BACC]">{fmtDate(l.created_at)}</td>
                      <td className="px-4 py-3.5">
                        <button onClick={()=>openEdit(l)} className="opacity-0 group-hover:opacity-100 text-[11px] text-[#7A90B3] hover:text-[#0D1B35] border border-[#E8ECF2] hover:border-[#D1D8E4] px-2.5 py-1 rounded-xl cursor-pointer transition-all font-medium">Edit</button>
                      </td>
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
