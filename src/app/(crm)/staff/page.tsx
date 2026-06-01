"use client";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/Button";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { Modal } from "@/components/ui/Modal";
import { Input, Select } from "@/components/ui/Input";
import { ToastContainer } from "@/components/ui/Toast";
import { fmtDate } from "@/lib/utils";
import type { UserProfile } from "@/types";

const ROLES = ["CRM_OPS","PROVIDER","ADMIN","SUPER_ADMIN"];
const RC: Record<string,string> = {CRM_OPS:"bg-blue-50 text-blue-700",PROVIDER:"bg-teal-50 text-teal-700",SUPER_ADMIN:"bg-red-50 text-red-700",ADMIN:"bg-purple-50 text-purple-700"};
type Toast = {id:string;message:string;type:"success"|"error"|"info"};

export default function StaffPage() {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({full_name:"",email:"",role:"CRM_OPS",department:""});
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (m:string,t:Toast["type"]="info") => setToasts(p=>[...p,{id:Math.random().toString(36).slice(2),message:m,type:t}]);
  const fetchProfiles = useCallback(async()=>{setLoading(true);const{data}=await supabase.from("user_profiles").select("*").order("created_at",{ascending:false});if(data)setProfiles(data as UserProfile[]);setLoading(false);},[]);
  useEffect(()=>{fetchProfiles();},[fetchProfiles]);

  async function invite(){
    if(!form.full_name||!form.email){addToast("Name and email required","error");return;}
    setSaving(true);
    const{error}=await supabase.from("staff_invitations").insert({email:form.email,role:form.role,full_name:form.full_name});
    setSaving(false);
    if(error)addToast(error.message,"error");
    else{addToast("Invite sent to "+form.email,"success");setShow(false);setForm({full_name:"",email:"",role:"CRM_OPS",department:""});}
  }
  const sf=(k:keyof typeof form)=>(v:string)=>setForm(p=>({...p,[k]:v}));

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={id=>setToasts(p=>p.filter(t=>t.id!==id))}/>
      <Modal open={show} onClose={()=>setShow(false)} title="Invite Staff Member"
        footer={<><Button variant="outline" onClick={()=>setShow(false)}>Cancel</Button><Button variant="primary" onClick={invite} loading={saving}>Send Invite</Button></>}>
        <div className="space-y-4">
          <Input label="Full Name" value={form.full_name} onChange={sf("full_name")} required placeholder="e.g. Priya Sharma"/>
          <Input label="Email" type="email" value={form.email} onChange={sf("email")} required placeholder="priya@checkupify.com"/>
          <Select label="Role" value={form.role} onChange={sf("role")} options={ROLES.map(r=>({value:r,label:r}))} required/>
          <Input label="Department" value={form.department} onChange={sf("department")} placeholder="Operations"/>
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-xs text-blue-700">A secure invite link (48hr expiry) will be sent via email.</div>
        </div>
      </Modal>
      <TopBar title="Staff" subtitle={`${profiles.filter(p=>p.is_active).length} active members`} loading={loading} onRefresh={fetchProfiles}
        actions={<Button variant="primary" size="sm" onClick={()=>setShow(true)}>+ Invite Staff</Button>}/>
      <main className="flex-1 overflow-y-auto p-6">
        <div className="bg-white rounded-2xl border border-[#E8ECF2] overflow-hidden" style={{boxShadow:"0 1px 3px rgba(11,30,61,0.06)"}}>
          {loading?<TableSkeleton rows={5}/>:(
            <table className="w-full">
              <thead><tr className="border-b border-[#F0F4FA]">{["Name","Employee ID","Dept","Designation","Role","Phone","Status","Joined"].map(h=><th key={h} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-[#A8BACC] bg-[#FAFBFD]">{h}</th>)}</tr></thead>
              <tbody>
                {profiles.length===0?<tr><td colSpan={8} className="px-4 py-16 text-center text-sm text-[#A8BACC]">No staff yet — invite your first team member</td></tr>
                :profiles.map(p=>(
                  <tr key={p.id} className="border-b border-[#F5F7FA] hover:bg-[#FAFBFD] transition-colors">
                    <td className="px-4 py-3.5"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700 text-[11px] font-bold">{p.full_name?.[0]??"?"}</div><span className="font-semibold text-[#0D1B35] text-sm">{p.full_name}</span></div></td>
                    <td className="px-4 py-3.5 font-mono text-[11px] text-[#A8BACC]">{p.employee_id??"—"}</td>
                    <td className="px-4 py-3.5 text-sm text-[#7A90B3]">{p.department??"—"}</td>
                    <td className="px-4 py-3.5 text-sm text-[#7A90B3]">{p.designation??"—"}</td>
                    <td className="px-4 py-3.5"><span className={"text-[10px] font-bold px-2.5 py-1 rounded-full "+(RC[p.role]??"bg-slate-100 text-slate-600")}>{p.role}</span></td>
                    <td className="px-4 py-3.5 text-xs text-[#A8BACC]">{p.phone??"—"}</td>
                    <td className="px-4 py-3.5"><span className={"text-[10px] font-bold px-2.5 py-1 rounded-full "+(p.is_active?"bg-emerald-50 text-emerald-700":"bg-slate-100 text-slate-500")}>{p.is_active?"Active":"Off"}</span></td>
                    <td className="px-4 py-3.5 text-xs text-[#A8BACC]">{fmtDate(p.created_at)}</td>
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
