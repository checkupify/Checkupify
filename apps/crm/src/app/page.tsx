'use client';
import { useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { createClient } from '@supabase/supabase-js';

const SB = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

// ── Types ─────────────────────────────────────────────────────────────────────
type Page = 'dash'|'bookings'|'booking-detail'|'customers'|'labs'|'packages'|'leads'|'enterprises'|'finance'|'users'|'settings';
interface Booking { id:string;patient_name:string;patient_age:number;patient_gender:string;patient_phone:string;appointment_date:string;slot_time:string;collection_type:string;amount:number;discount:number;status:string;stage:string;sla_status:string;is_corporate:boolean;rejection_reason:string|null;report_url:string|null;notes:string|null;created_at:string;updated_at:string;lab:Lab|null;package:Pkg|null; }
interface Lab { id:string;name:string;city:string;nabl_certified:boolean;rating:number;network_type:string;active:boolean;avg_tat_hours:number;score:number;phone:string;email:string; }
interface Pkg { id:string;name:string;slug:string;base_price:number;mrp:number;test_count:number;badge:string|null;active:boolean;fasting_required:boolean;home_collection:boolean;category:string|null; }
interface Lead { id:string;company_name:string;contact_name:string;contact_email:string;contact_phone:string;employee_count:number|null;city:string|null;status:string;source:string|null;notes:string|null;created_at:string; }
interface Enterprise { id:string;name:string;type:string;poc_name:string;poc_email:string;poc_phone:string;contract_start:string;contract_end:string;discount_pct:number;active:boolean; }
interface Profile { id:string;full_name:string;role:string;phone:string|null;department:string|null;designation:string|null;employee_id:string|null;is_active:boolean;created_at:string; }

// ── Utils ─────────────────────────────────────────────────────────────────────
function cn(...c:(string|false|null|undefined)[]) { return c.filter(Boolean).join(' '); }
function fmt(n:number) { return '₹'+n.toLocaleString('en-IN'); }
function fmtDate(d:string) { return new Date(d).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}); }
function fmtTime(t:string) { return t?.slice(0,5)??''; }
function ago(d:string) { const s=Math.floor((Date.now()-new Date(d).getTime())/1000); if(s<60) return s+'s ago'; if(s<3600) return Math.floor(s/60)+'m ago'; if(s<86400) return Math.floor(s/3600)+'h ago'; return Math.floor(s/86400)+'d ago'; }

// ── UI atoms ──────────────────────────────────────────────────────────────────
function Btn({children,onClick,variant='default',size='md',disabled,className}:{children:ReactNode;onClick?:()=>void;variant?:'default'|'primary'|'danger'|'success'|'ghost';size?:'xs'|'sm'|'md';disabled?:boolean;className?:string}) {
  const v={default:'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50',primary:'bg-green-600 text-white border border-green-600 hover:bg-green-700',danger:'bg-red-50 border border-red-200 text-red-700 hover:bg-red-100',success:'bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100',ghost:'text-gray-500 border border-transparent hover:bg-gray-100 hover:text-gray-800'};
  const s={xs:'px-2 py-1 text-[11px]',sm:'px-3 py-1.5 text-xs',md:'px-4 py-2 text-sm'};
  return <button onClick={onClick} disabled={disabled} className={cn('inline-flex items-center gap-1.5 rounded-lg font-semibold transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap',v[variant],s[size],className)}>{children}</button>;
}

function Badge({children,color='gray'}:{children:ReactNode;color?:string}) {
  const c:Record<string,string>={green:'bg-green-100 text-green-800 border-green-200',blue:'bg-blue-100 text-blue-800 border-blue-200',amber:'bg-amber-100 text-amber-800 border-amber-200',red:'bg-red-100 text-red-800 border-red-200',purple:'bg-purple-100 text-purple-800 border-purple-200',teal:'bg-teal-100 text-teal-800 border-teal-200',indigo:'bg-indigo-100 text-indigo-800 border-indigo-200',gray:'bg-gray-100 text-gray-700 border-gray-200',orange:'bg-orange-100 text-orange-800 border-orange-200'};
  return <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border',c[color]??c.gray)}>{children}</span>;
}

function StageBadge({stage}:{stage:string}) {
  const m:Record<string,string>={New:'indigo',Confirmed:'green',Completed:'teal','Pending Reports':'amber','Partially Received':'purple',Received:'green',Rejected:'red','No Show':'red'};
  return <Badge color={m[stage]??'gray'}>{stage}</Badge>;
}

function SlaBadge({s}:{s:string}) { return <Badge color={s==='On Track'?'green':s==='At Risk'?'amber':'red'}>{s}</Badge>; }

function Modal({open,onClose,title,children,footer,wide}:{open:boolean;onClose:()=>void;title:string;children:ReactNode;footer?:ReactNode;wide?:boolean}) {
  useEffect(()=>{ const h=(e:KeyboardEvent)=>{ if(e.key==='Escape') onClose(); }; window.addEventListener('keydown',h); return ()=>window.removeEventListener('keydown',h); },[onClose]);
  if(!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}/>
      <div className={cn('relative bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col max-h-[90vh]',wide?'w-full max-w-3xl':'w-full max-w-lg')}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="font-bold text-gray-900 text-[15px]">{title}</div>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center text-sm cursor-pointer">✕</button>
        </div>
        <div className="px-6 py-5 overflow-y-auto flex-1">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 shrink-0">{footer}</div>}
      </div>
    </div>
  );
}

function Toast({msg,type,onDone}:{msg:string;type:'success'|'error'|'info';onDone:()=>void}) {
  useEffect(()=>{ const t=setTimeout(onDone,3500); return ()=>clearTimeout(t); },[onDone]);
  const c={success:'bg-green-50 border-green-200 text-green-800',error:'bg-red-50 border-red-200 text-red-800',info:'bg-blue-50 border-blue-200 text-blue-800'};
  const ic={success:'✓',error:'✕',info:'ℹ'};
  return <div className={cn('fixed bottom-5 right-5 z-[200] flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium max-w-sm',c[type])}><span className="shrink-0">{ic[type]}</span><span>{msg}</span></div>;
}

function Input({label,value,onChange,placeholder,type='text',required}:{label:string;value:string;onChange:(v:string)=>void;placeholder?:string;type?:string;required?:boolean}) {
  return <div><label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">{label}{required&&<span className="text-red-500 ml-0.5">*</span>}</label><input type={type} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500 focus:ring-1 focus:ring-green-200 transition-all" value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} required={required}/></div>;
}

function Select({label,value,onChange,options,required}:{label:string;value:string;onChange:(v:string)=>void;options:{value:string;label:string}[];required?:boolean}) {
  return <div><label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">{label}{required&&<span className="text-red-500 ml-0.5">*</span>}</label><select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500 cursor-pointer" value={value} onChange={e=>onChange(e.target.value)}><option value="">Select…</option>{options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select></div>;
}

function Card({title,children,action,sub}:{title:string;children:ReactNode;action?:ReactNode;sub?:string}) {
  return <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"><div className="flex items-center justify-between px-5 py-4 border-b border-gray-100"><div><div className="font-bold text-gray-900 text-[14px]">{title}</div>{sub&&<div className="text-[10px] text-gray-400 mt-0.5">{sub}</div>}</div>{action}</div>{children}</div>;
}

function Table({cols,rows,empty='No data',compact}:{cols:string[];rows:ReactNode[][];empty?:string;compact?:boolean}) {
  return <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-gray-100">{cols.map(c=><th key={c} className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50/50 whitespace-nowrap">{c}</th>)}</tr></thead><tbody className="divide-y divide-gray-50">{rows.length===0?<tr><td colSpan={cols.length} className="px-4 py-12 text-center text-gray-400">{empty}</td></tr>:rows.map((row,i)=><tr key={i} className="hover:bg-gray-50/60 transition-colors group">{row.map((cell,j)=><td key={j} className={cn('px-4',compact?'py-2':'py-3')}>{cell}</td>)}</tr>)}</tbody></table></div>;
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
const NAV = [
  {id:'dash',l:'Dashboard',ic:'⊞'},
  {id:'bookings',l:'Bookings',ic:'📅'},
  {id:'customers',l:'Customers',ic:'👥'},
  {id:'labs',l:'Labs & Providers',ic:'🏥'},
  {id:'packages',l:'Packages',ic:'📦'},
  {id:'leads',l:'Leads',ic:'📊'},
  {id:'enterprises',l:'Enterprises',ic:'🏢'},
  {id:'finance',l:'Finance',ic:'💳'},
  {id:'users',l:'Staff / Users',ic:'👤'},
  {id:'settings',l:'Settings',ic:'⚙️'},
] as const;

function Sidebar({page,onNav,user,bookingCount,newLeads}:{page:Page;onNav:(p:Page)=>void;user:any;bookingCount:number;newLeads:number}) {
  return (
    <aside className="w-56 shrink-0 bg-white border-r border-gray-100 flex flex-col h-screen sticky top-0 shadow-sm z-20">
      <div className="px-4 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-green-600 flex items-center justify-center"><svg width="16" height="16" viewBox="0 0 100 100" fill="none"><path d="M50 8 A42 42 0 1 1 85 22" stroke="white" strokeWidth="12" strokeLinecap="round" fill="none"/><path d="M26 50 L42 67 L73 35" stroke="white" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg></div>
          <div><div className="text-[14px] font-black text-gray-900">Checkupify</div><div className="text-[10px] text-gray-400">CRM · Operations</div></div>
        </div>
      </div>
      <nav className="flex-1 py-3 px-3 overflow-y-auto">
        {NAV.map(n=>(
          <button key={n.id} onClick={()=>onNav(n.id as Page)} className={cn('w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[12.5px] font-medium transition-all mb-0.5 cursor-pointer text-left',page===n.id?'bg-green-50 text-green-700 font-semibold':'text-gray-600 hover:bg-gray-50 hover:text-gray-900')}>
            <span className="text-base w-5 text-center shrink-0">{n.ic}</span>
            <span className="flex-1">{n.l}</span>
            {n.id==='bookings'&&bookingCount>0&&<span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-red-500 text-white">{bookingCount}</span>}
            {n.id==='leads'&&newLeads>0&&<span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-blue-500 text-white">{newLeads}</span>}
          </button>
        ))}
      </nav>
      <div className="px-3 py-4 border-t border-gray-100">
        <div className="flex items-center gap-2 px-2 py-2 rounded-xl bg-gray-50 mb-2">
          <div className="w-7 h-7 rounded-full bg-green-600 flex items-center justify-center text-white text-[11px] font-black shrink-0">{(user?.email?.[0]??'?').toUpperCase()}</div>
          <div className="flex-1 min-w-0"><div className="text-[11px] font-semibold text-gray-800 truncate">{user?.email}</div><div className="text-[9px] text-green-700 font-bold uppercase">{user?.user_metadata?.role??'Staff'}</div></div>
        </div>
        <button onClick={()=>SB.auth.signOut()} className="w-full text-[11px] font-semibold text-gray-400 hover:text-red-500 hover:bg-red-50 py-1.5 rounded-lg transition-all cursor-pointer">↩ Sign out</button>
      </div>
    </aside>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function DashPage({bookings,labs,pkgs,leads,onNav}:{bookings:Booking[];labs:Lab[];pkgs:Pkg[];leads:Lead[];onNav:(p:Page,id?:string)=>void}) {
  const today=new Date().toISOString().split('T')[0];
  const todayB=bookings.filter(b=>b.appointment_date===today);
  const newQ=bookings.filter(b=>b.stage==='New');
  const breaches=bookings.filter(b=>b.sla_status==='Breach');
  const rev=bookings.reduce((s,b)=>s+b.amount,0);
  const STAGE_COLORS:Record<string,string>={New:'#6366F1',Confirmed:'#22C55E',Completed:'#14B8A6','Pending Reports':'#F59E0B','Partially Received':'#A855F7',Received:'#22C55E',Rejected:'#EF4444'};
  const stageCounts = ['New','Confirmed','Completed','Pending Reports','Received','Rejected'].map(s=>({s,n:bookings.filter(b=>b.stage===s).length}));

  return (
    <div className="flex flex-col gap-5 max-w-[1200px] mx-auto p-5">
      {breaches.length>0&&<div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm"><span className="text-red-500 text-lg">⚠</span><span className="text-red-700 font-semibold">{breaches.length} SLA breach{breaches.length>1?'es':''} active — penalties accruing</span><button onClick={()=>onNav('bookings')} className="ml-auto text-red-600 underline text-xs cursor-pointer">View →</button></div>}

      {/* KPI tiles */}
      <div className="grid grid-cols-6 gap-3">
        {[["Today's",todayB.length,'📅','#22C55E'],['Confirm Queue',newQ.length,'⏳',newQ.length>0?'#F59E0B':'#22C55E'],['Pending Reports',bookings.filter(b=>b.stage==='Pending Reports').length,'📋','#8B5CF6'],['SLA Breaches',breaches.length,'🚨',breaches.length>0?'#EF4444':'#22C55E'],['Active Labs',labs.filter(l=>l.active).length,'🏥','#3B82F6'],['MTD Revenue',`₹${(rev/100000).toFixed(1)}L`,'💰','#22C55E']].map(([l,v,ic,c])=>(
          <div key={l as string} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-start justify-between mb-2"><div className="text-[9px] font-bold uppercase tracking-wide text-gray-400">{l as string}</div><span className="text-lg">{ic as string}</span></div>
            <div className="text-[24px] font-black leading-none" style={{color:c as string}}>{v as any}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Live queue */}
        <div className="col-span-2">
          <Card title="Live Booking Queue" action={<div className="flex items-center gap-1.5 text-[11px]"><div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"/><span className="text-green-700 font-semibold">LIVE</span></div>}>
            <Table compact cols={['ID','Patient','Package','Lab','Date','Stage','SLA','Actions']} rows={bookings.slice(0,8).map(b=>[
              <button key="id" onClick={()=>onNav('booking-detail',b.id)} className="font-mono text-[11px] text-green-700 font-semibold hover:underline cursor-pointer">{b.id}</button>,
              <div key="p"><div className="font-semibold text-[12px] text-gray-900">{b.patient_name}</div><div className="text-[10px] text-gray-400">{b.patient_phone}</div></div>,
              <span key="pkg" className="text-xs text-blue-700 font-medium">{b.package?.name??'—'}</span>,
              <span key="lab" className="text-xs text-gray-600">{b.lab?.name??'—'}</span>,
              <span key="d" className="text-xs text-gray-600">{b.appointment_date}</span>,
              <StageBadge key="s" stage={b.stage}/>,
              <SlaBadge key="sla" s={b.sla_status}/>,
              <button key="a" onClick={()=>onNav('booking-detail',b.id)} className="text-[10px] text-gray-500 hover:text-green-700 cursor-pointer font-semibold">View →</button>,
            ])}/>
          </Card>
        </div>

        {/* Right col */}
        <div className="flex flex-col gap-4">
          <Card title="By Stage">
            <div className="px-4 py-3">
              {stageCounts.map(({s,n})=>(
                <div key={s} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-600">{s}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{width:`${Math.min(100,(n/Math.max(bookings.length,1))*100)}%`,background:STAGE_COLORS[s]}}/></div>
                    <span className="font-black text-gray-900 text-sm w-4 text-right">{n}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <Card title="Recent Leads">
            <div className="px-4 py-3">
              {leads.slice(0,4).map(l=>(
                <div key={l.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div><div className="text-sm font-semibold text-gray-900">{l.company_name}</div><div className="text-[10px] text-gray-400">{l.city??'—'} · {l.employee_count??'?'} employees</div></div>
                  <Badge color={l.status==='Won'?'green':l.status==='Lost'?'red':l.status==='New'?'indigo':'blue'}>{l.status}</Badge>
                </div>
              ))}
              <button onClick={()=>onNav('leads')} className="w-full text-center text-[11px] text-green-700 font-semibold hover:text-green-600 cursor-pointer mt-2">View all leads →</button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ── Booking Detail ─────────────────────────────────────────────────────────────
function BookingDetail({id,onBack,onRefresh,showToast}:{id:string;onBack:()=>void;onRefresh:()=>void;showToast:(m:string,t:'success'|'error'|'info')=>void}) {
  const [b,setB]=useState<Booking|null>(null);
  const [loading,setLoading]=useState(true);
  const [stage,setStage]=useState('');
  const [notes,setNotes]=useState('');
  const [saving,setSaving]=useState(false);

  useEffect(()=>{
    SB.from('bookings').select('*,lab:labs(name,city,phone,email),package:packages(name,base_price,test_count)').eq('id',id).single()
      .then(({data})=>{ if(data){setB(data as Booking);setStage(data.stage);setNotes(data.notes??'');} setLoading(false); });
  },[id]);

  async function saveStage() {
    if(!b) return;
    setSaving(true);
    const updates:any={stage,notes,updated_at:new Date().toISOString()};
    if(stage==='Confirmed') updates.confirmed_at=new Date().toISOString();
    const {error}=await SB.from('bookings').update(updates).eq('id',id);
    setSaving(false);
    if(error) showToast(error.message,'error');
    else { showToast('Booking updated','success'); onRefresh(); }
  }

  if(loading) return <div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-2 border-gray-200 border-t-green-500 rounded-full animate-spin"/></div>;
  if(!b) return <div className="flex-1 flex items-center justify-center text-gray-400">Booking not found</div>;

  return (
    <div className="flex-1 overflow-y-auto p-5 max-w-[1100px] mx-auto w-full">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={onBack} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center cursor-pointer text-gray-600 transition-colors">←</button>
        <div><div className="font-bold text-gray-900 text-[18px]">Booking {b.id}</div><div className="text-[12px] text-gray-400">Created {ago(b.created_at)}</div></div>
        <div className="ml-auto flex gap-2"><StageBadge stage={b.stage}/><SlaBadge s={b.sla_status}/></div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Patient */}
        <Card title="Patient Info">
          <div className="px-5 py-4 space-y-3">
            {[['Name',b.patient_name],['Phone',b.patient_phone],['Age / Gender',`${b.patient_age} yrs / ${b.patient_gender}`],['Collection',b.collection_type],['Corporate',b.is_corporate?'Yes':'No']].map(([k,v])=>(
              <div key={k} className="flex justify-between text-sm border-b border-gray-50 pb-2.5 last:border-0"><span className="text-gray-500">{k}</span><span className="font-semibold text-gray-900 text-right">{v}</span></div>
            ))}
          </div>
        </Card>

        {/* Booking info */}
        <Card title="Booking Details">
          <div className="px-5 py-4 space-y-3">
            {[['Package',b.package?.name??'—'],['Lab',b.lab?.name??'—'],['Date',b.appointment_date],['Slot',fmtTime(b.slot_time)],['Amount',fmt(b.amount)],['Status',b.status]].map(([k,v])=>(
              <div key={k} className="flex justify-between text-sm border-b border-gray-50 pb-2.5 last:border-0"><span className="text-gray-500">{k}</span><span className="font-semibold text-gray-900 text-right">{v}</span></div>
            ))}
            {b.report_url&&<div className="pt-2"><a href={b.report_url} target="_blank" className="text-green-700 text-sm font-semibold underline">📄 View Report</a></div>}
          </div>
        </Card>

        {/* Actions */}
        <Card title="Update Booking">
          <div className="px-5 py-4 space-y-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Stage</label>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm cursor-pointer focus:border-green-500 outline-none" value={stage} onChange={e=>setStage(e.target.value)}>
                {['New','Confirmed','Completed','Pending Reports','Partially Received','Received','Rejected','No Show'].map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Internal Notes</label>
              <textarea className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500 h-20 resize-none" value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Add notes…"/>
            </div>
            <Btn variant="primary" onClick={saveStage} disabled={saving} className="w-full justify-center">{saving?'Saving…':'Save Changes'}</Btn>
          </div>
        </Card>
      </div>

      {b.rejection_reason&&(
        <div className="mt-4 bg-red-50 border border-red-100 rounded-xl p-4 text-sm">
          <div className="font-semibold text-red-700 mb-1">Rejection Reason</div>
          <div className="text-red-600">{b.rejection_reason}</div>
        </div>
      )}
    </div>
  );
}

// ── Bookings Page ──────────────────────────────────────────────────────────────
const REJECT_REASONS=['Slot already booked','Patient cancelled','Lab unavailable','Duplicate booking','Test not available','Patient unresponsive','Other'];

function BookingsPage({bookings,onRefresh,onViewDetail,showToast}:{bookings:Booking[];onRefresh:()=>void;onViewDetail:(id:string)=>void;showToast:(m:string,t:'success'|'error'|'info')=>void}) {
  const [tab,setTab]=useState('All');
  const [search,setSearch]=useState('');
  const [sortBy,setSortBy]=useState('created_at');
  const [confirmB,setConfirmB]=useState<Booking|null>(null);
  const [rejectB,setRejectB]=useState<Booking|null>(null);
  const [rejReason,setRejReason]=useState('');
  const [rejNote,setRejNote]=useState('');
  const [loading,setLoading]=useState(false);
  const [page,setPage]=useState(1);
  const PER=25;

  const filtered=bookings
    .filter(b=>(tab==='All'||b.stage===tab)&&(!search||b.patient_name.toLowerCase().includes(search.toLowerCase())||b.id.toLowerCase().includes(search.toLowerCase())||b.patient_phone.includes(search)))
    .sort((a,b)=>sortBy==='amount'?b.amount-a.amount:new Date(b.created_at).getTime()-new Date(a.created_at).getTime());

  const paged=filtered.slice((page-1)*PER, page*PER);
  const totalPages=Math.ceil(filtered.length/PER);
  const counts:Record<string,number>={All:bookings.length};
  bookings.forEach(b=>{ counts[b.stage]=(counts[b.stage]??0)+1; });

  async function doConfirm() {
    if(!confirmB) return; setLoading(true);
    const {error}=await SB.from('bookings').update({stage:'Confirmed',confirmed_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq('id',confirmB.id);
    setLoading(false);
    if(error) showToast(error.message,'error'); else { showToast(`Confirmed: ${confirmB.patient_name}`,'success'); setConfirmB(null); onRefresh(); }
  }

  async function doReject() {
    if(!rejectB||!rejReason){showToast('Select a reason','error');return;} setLoading(true);
    const fullReason=rejNote?`${rejReason} — ${rejNote}`:rejReason;
    const {error}=await SB.from('bookings').update({stage:'Rejected',rejection_reason:fullReason,updated_at:new Date().toISOString()}).eq('id',rejectB.id);
    setLoading(false);
    if(error) showToast(error.message,'error'); else { showToast(`Rejected: ${rejectB.patient_name}`,'info'); setRejectB(null); setRejReason(''); setRejNote(''); onRefresh(); }
  }

  function exportCSV() {
    const rows=[['ID','Patient','Phone','Package','Lab','Date','Stage','SLA','Amount'],...filtered.map(b=>[b.id,b.patient_name,b.patient_phone,b.package?.name??'',b.lab?.name??'',b.appointment_date,b.stage,b.sla_status,b.amount])];
    const csv=rows.map(r=>r.map(String).join(',')).join('\n');
    const a=document.createElement('a'); a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(csv); a.download=`bookings-${new Date().toISOString().slice(0,10)}.csv`; a.click();
    showToast('CSV exported','success');
  }

  return (
    <>
      <Modal open={!!confirmB} onClose={()=>setConfirmB(null)} title="Confirm Booking" footer={<><Btn onClick={()=>setConfirmB(null)}>Cancel</Btn><Btn variant="primary" onClick={doConfirm} disabled={loading}>✓ Confirm Slot</Btn></>}>
        {confirmB&&<div className="space-y-3">{[['Patient',confirmB.patient_name],['Package',confirmB.package?.name??'—'],['Date & Slot',`${confirmB.appointment_date} · ${fmtTime(confirmB.slot_time)}`],['Lab',confirmB.lab?.name??'—'],['Amount',fmt(confirmB.amount)]].map(([k,v])=><div key={k} className="flex justify-between text-sm pb-2.5 border-b border-gray-50"><span className="text-gray-500">{k}</span><span className="font-semibold">{v}</span></div>)}<div className="text-[11px] text-green-700 bg-green-50 rounded-lg px-3 py-2 mt-2">✓ Patient will be notified via WhatsApp</div></div>}
      </Modal>
      <Modal open={!!rejectB} onClose={()=>{setRejectB(null);setRejReason('');setRejNote('');}} title="Reject Booking" footer={<><Btn onClick={()=>{setRejectB(null);setRejReason('');setRejNote('');}}>Cancel</Btn><Btn variant="danger" onClick={doReject} disabled={loading}>✕ Confirm Rejection</Btn></>}>
        <div className="space-y-3">
          <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm cursor-pointer focus:border-green-500 outline-none" value={rejReason} onChange={e=>setRejReason(e.target.value)}><option value="">Select reason *</option>{REJECT_REASONS.map(r=><option key={r} value={r}>{r}</option>)}</select>
          <textarea className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500 h-16 resize-none placeholder-gray-300" placeholder="Additional notes (optional)…" value={rejNote} onChange={e=>setRejNote(e.target.value)}/>
          <div className="text-[11px] text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">Patient will be notified via WhatsApp automatically</div>
        </div>
      </Modal>

      <div className="p-5 max-w-[1200px] mx-auto w-full">
        <Card title="Bookings" action={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-1.5 bg-gray-50">
              <span className="text-gray-400 text-xs">⌕</span>
              <input className="bg-transparent text-sm outline-none w-40 placeholder-gray-300" placeholder="Search name, ID, phone…" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}}/>
              {search&&<button onClick={()=>setSearch('')} className="text-gray-400 hover:text-gray-600 cursor-pointer">✕</button>}
            </div>
            <select className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs cursor-pointer" value={sortBy} onChange={e=>setSortBy(e.target.value)}>
              <option value="created_at">Latest first</option>
              <option value="amount">Highest amount</option>
            </select>
            <Btn size="sm" onClick={onRefresh}>↺</Btn>
            <Btn size="sm" onClick={exportCSV}>↓ CSV</Btn>
          </div>
        }>
          {/* Tabs */}
          <div className="flex border-b border-gray-100 overflow-x-auto">
            {['All','New','Confirmed','Completed','Pending Reports','Partially Received','Received','Rejected','No Show'].map(t=>(
              <button key={t} onClick={()=>{setTab(t);setPage(1);}} className={cn('flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 whitespace-nowrap transition-all cursor-pointer',tab===t?'text-green-700 border-green-500 font-semibold':'text-gray-400 border-transparent hover:text-gray-700')}>
                {t}<span className={cn('px-1.5 py-0.5 rounded-full text-[9px] font-bold',tab===t?'bg-green-100 text-green-700':'bg-gray-100 text-gray-400')}>{counts[t]??0}</span>
              </button>
            ))}
          </div>

          <Table cols={['Booking ID','Patient','Package','Lab','Date & Slot','Stage','SLA','Amount','Actions']} rows={paged.map(b=>[
            <button key="id" onClick={()=>onViewDetail(b.id)} className="font-mono text-[11px] text-green-700 font-semibold hover:underline cursor-pointer">{b.id}</button>,
            <div key="p"><div className="font-semibold text-[12px] text-gray-900">{b.patient_name}</div><div className="text-[10px] text-gray-400">{b.patient_phone} · {b.patient_gender},{b.patient_age}</div>{b.is_corporate&&<Badge color="blue">CORP</Badge>}</div>,
            <span key="pkg" className="text-xs text-blue-700 font-medium">{b.package?.name??'—'}</span>,
            <span key="lab" className="text-xs text-gray-600">{b.lab?.name??'—'}</span>,
            <div key="d"><div className="text-[12px] text-gray-700">{b.appointment_date}</div><div className="text-[10px] text-gray-400">{fmtTime(b.slot_time)} · {b.collection_type}</div></div>,
            <StageBadge key="s" stage={b.stage}/>,
            <SlaBadge key="sla" s={b.sla_status}/>,
            <span key="a" className="text-sm font-semibold text-gray-700">{fmt(b.amount)}</span>,
            <div key="act" className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              {b.stage==='New'&&<><Btn size="xs" variant="success" onClick={()=>setConfirmB(b)}>✓</Btn><Btn size="xs" variant="danger" onClick={()=>setRejectB(b)}>✕</Btn></>}
              <Btn size="xs" onClick={()=>onViewDetail(b.id)}>→</Btn>
            </div>
          ])} empty="No bookings found"/>

          {totalPages>1&&(
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 text-xs text-gray-400">
              <span>Showing {(page-1)*PER+1}–{Math.min(page*PER,filtered.length)} of {filtered.length}</span>
              <div className="flex gap-2">
                <Btn size="xs" disabled={page<=1} onClick={()=>setPage(p=>p-1)}>← Prev</Btn>
                <Btn size="xs" disabled={page>=totalPages} onClick={()=>setPage(p=>p+1)}>Next →</Btn>
              </div>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}

// ── Leads Page (with create form) ──────────────────────────────────────────────
function LeadsPage({leads,onRefresh,showToast}:{leads:Lead[];onRefresh:()=>void;showToast:(m:string,t:'success'|'error'|'info')=>void}) {
  const [tab,setTab]=useState('All');
  const [search,setSearch]=useState('');
  const [creating,setCreating]=useState(false);
  const [editing,setEditing]=useState<Lead|null>(null);
  const [form,setForm]=useState({company_name:'',contact_name:'',contact_email:'',contact_phone:'',employee_count:'',city:'',source:'',status:'New',notes:''});
  const [saving,setSaving]=useState(false);
  const STATUS_COLORS:Record<string,string>={New:'indigo',Contacted:'blue','Demo Scheduled':'amber',Negotiation:'purple',Won:'green',Lost:'red'};

  function openCreate(){setForm({company_name:'',contact_name:'',contact_email:'',contact_phone:'',employee_count:'',city:'',source:'',status:'New',notes:''});setCreating(true);}
  function openEdit(l:Lead){setForm({company_name:l.company_name,contact_name:l.contact_name??'',contact_email:l.contact_email??'',contact_phone:l.contact_phone??'',employee_count:String(l.employee_count??''),city:l.city??'',source:l.source??'',status:l.status,notes:l.notes??''});setEditing(l);setCreating(true);}

  async function saveLead(){
    if(!form.company_name){showToast('Company name required','error');return;}
    setSaving(true);
    const payload={...form,employee_count:form.employee_count?parseInt(form.employee_count):null};
    const {error}=editing
      ?await SB.from('leads').update(payload).eq('id',editing.id)
      :await SB.from('leads').insert(payload);
    setSaving(false);
    if(error) showToast(error.message,'error');
    else { showToast(editing?'Lead updated':'Lead created','success'); setCreating(false); setEditing(null); onRefresh(); }
  }

  async function updateStatus(id:string,status:string){
    const {error}=await SB.from('leads').update({status}).eq('id',id);
    if(error) showToast(error.message,'error'); else { showToast('Status updated','success'); onRefresh(); }
  }

  const STATUSES=['New','Contacted','Demo Scheduled','Negotiation','Won','Lost'];
  const filtered=leads.filter(l=>(tab==='All'||l.status===tab)&&(!search||l.company_name.toLowerCase().includes(search.toLowerCase())));
  const counts:Record<string,number>={All:leads.length};
  leads.forEach(l=>{ counts[l.status]=(counts[l.status]??0)+1; });

  return (
    <>
      <Modal open={creating} onClose={()=>{setCreating(false);setEditing(null);}} title={editing?'Edit Lead':'Add Lead'} footer={<><Btn onClick={()=>{setCreating(false);setEditing(null);}}>Cancel</Btn><Btn variant="primary" onClick={saveLead} disabled={saving}>{saving?'Saving…':editing?'Save Changes':'Create Lead'}</Btn></>} wide>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Company Name" value={form.company_name} onChange={v=>setForm(f=>({...f,company_name:v}))} required placeholder="e.g. Infosys BPM"/>
          <Input label="Contact Name" value={form.contact_name} onChange={v=>setForm(f=>({...f,contact_name:v}))} placeholder="Full name"/>
          <Input label="Email" type="email" value={form.contact_email} onChange={v=>setForm(f=>({...f,contact_email:v}))} placeholder="contact@company.com"/>
          <Input label="Phone" type="tel" value={form.contact_phone} onChange={v=>setForm(f=>({...f,contact_phone:v}))} placeholder="+91-9876543210"/>
          <Input label="Employee Count" type="number" value={form.employee_count} onChange={v=>setForm(f=>({...f,employee_count:v}))} placeholder="e.g. 5000"/>
          <Input label="City" value={form.city} onChange={v=>setForm(f=>({...f,city:v}))} placeholder="Hyderabad"/>
          <Select label="Status" value={form.status} onChange={v=>setForm(f=>({...f,status:v}))} options={STATUSES.map(s=>({value:s,label:s}))}/>
          <Select label="Source" value={form.source} onChange={v=>setForm(f=>({...f,source:v}))} options={['LinkedIn','Referral','Cold Email','Event','Inbound','Website'].map(s=>({value:s,label:s}))}/>
          <div className="col-span-2"><label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Notes</label><textarea className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500 h-20 resize-none" value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Any relevant notes…"/></div>
        </div>
      </Modal>

      <div className="p-5 max-w-[1200px] mx-auto w-full">
        <Card title="Leads Pipeline" action={<Btn variant="primary" onClick={openCreate}>+ Add Lead</Btn>}>
          <div className="flex border-b border-gray-100 overflow-x-auto">
            {['All',...STATUSES].map(t=><button key={t} onClick={()=>setTab(t)} className={cn('flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 whitespace-nowrap cursor-pointer',tab===t?'text-green-700 border-green-500 font-semibold':'text-gray-400 border-transparent hover:text-gray-700')}>{t}<span className={cn('px-1.5 py-0.5 rounded-full text-[9px] font-bold',tab===t?'bg-green-100 text-green-700':'bg-gray-100 text-gray-400')}>{counts[t]??0}</span></button>)}
          </div>
          <div className="px-5 py-3 border-b border-gray-50">
            <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-1.5 bg-gray-50 max-w-xs">
              <span className="text-gray-400 text-xs">⌕</span>
              <input className="bg-transparent text-sm outline-none flex-1 placeholder-gray-300" placeholder="Search company…" value={search} onChange={e=>setSearch(e.target.value)}/>
            </div>
          </div>
          <Table cols={['Company','Contact','Email','Employees','City','Status','Source','Created','Actions']} rows={filtered.map(l=>[
            <div key="c"><div className="font-semibold text-sm text-gray-900">{l.company_name}</div></div>,
            <span key="cn" className="text-sm text-gray-700">{l.contact_name??'—'}</span>,
            <span key="e" className="text-xs text-blue-700">{l.contact_email??'—'}</span>,
            <span key="emp" className="text-sm text-gray-600">{l.employee_count?.toLocaleString('en-IN')??'—'}</span>,
            <span key="ci" className="text-sm text-gray-600">{l.city??'—'}</span>,
            <select key="s" className="text-xs border border-gray-200 rounded-lg px-2 py-1 cursor-pointer" value={l.status} onChange={e=>updateStatus(l.id,e.target.value)}>
              {STATUSES.map(s=><option key={s} value={s}>{s}</option>)}
            </select>,
            <span key="src" className="text-xs text-gray-400">{l.source??'—'}</span>,
            <span key="cr" className="text-xs text-gray-400">{fmtDate(l.created_at)}</span>,
            <Btn key="edit" size="xs" onClick={()=>openEdit(l)}>Edit</Btn>,
          ])} empty="No leads found"/>
        </Card>
      </div>
    </>
  );
}

// ── Labs Page ──────────────────────────────────────────────────────────────────
function LabsPage({labs}:{labs:Lab[]}) {
  const [search,setSearch]=useState('');
  const filtered=labs.filter(l=>!search||l.name.toLowerCase().includes(search.toLowerCase())||l.city.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="p-5 max-w-[1200px] mx-auto w-full">
      <Card title="Labs & Providers" action={<div className="flex items-center gap-2"><div className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-1.5 bg-gray-50"><span className="text-gray-400 text-xs">⌕</span><input className="bg-transparent text-sm outline-none w-32 placeholder-gray-300" placeholder="Search…" value={search} onChange={e=>setSearch(e.target.value)}/></div><Badge color="green">{labs.filter(l=>l.active).length} active</Badge></div>}>
        <Table cols={['Lab Name','City','Network','Rating','Score','TAT','NABL','Status','Actions']} rows={filtered.map(l=>[
          <div key="n"><div className="font-semibold text-sm text-gray-900">{l.name}</div>{l.phone&&<div className="text-[10px] text-gray-400">{l.phone}</div>}</div>,
          <span key="c" className="text-sm text-gray-600">{l.city||'—'}</span>,
          <Badge key="nt" color={l.network_type==='Super Premium'?'purple':l.network_type==='Premium'?'blue':'gray'}>{l.network_type}</Badge>,
          <span key="r" className="text-sm font-semibold text-gray-700">⭐ {l.rating}</span>,
          <div key="sc" className="flex items-center gap-1.5"><div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-green-500 rounded-full" style={{width:`${l.score}%`}}/></div><span className="text-xs text-gray-600">{l.score}</span></div>,
          <span key="t" className="text-sm text-gray-600">{l.avg_tat_hours}h</span>,
          l.nabl_certified?<Badge key="nabl" color="green">NABL ✓</Badge>:<span key="nabl" className="text-xs text-gray-300">—</span>,
          <Badge key="s" color={l.active?'green':'red'}>{l.active?'Active':'Off'}</Badge>,
          <Btn key="view" size="xs">View →</Btn>,
        ])} empty="No labs found"/>
      </Card>
    </div>
  );
}

// ── Packages Page ──────────────────────────────────────────────────────────────
function PackagesPage({pkgs}:{pkgs:Pkg[]}) {
  const [search,setSearch]=useState('');
  const filtered=pkgs.filter(p=>!search||p.name.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="p-5 max-w-[1200px] mx-auto w-full">
      <Card title="Health Packages" action={<div className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-1.5 bg-gray-50"><span className="text-gray-400 text-xs">⌕</span><input className="bg-transparent text-sm outline-none w-40 placeholder-gray-300" placeholder="Search package…" value={search} onChange={e=>setSearch(e.target.value)}/></div>}>
        <Table cols={['Package','Category','Tests','MRP','Price','Discount','Fasting','Home','Badge','Status']} rows={filtered.map(p=>[
          <div key="n"><div className="font-semibold text-sm text-gray-900">{p.name}</div><div className="font-mono text-[10px] text-gray-400">{p.slug}</div></div>,
          <span key="cat" className="text-xs text-gray-600">{p.category??'—'}</span>,
          <span key="tc" className="text-sm font-semibold text-gray-700">{p.test_count}</span>,
          <span key="mrp" className="text-sm text-gray-400 line-through">{fmt(p.mrp??0)}</span>,
          <span key="pr" className="text-sm font-bold text-green-700">{fmt(p.base_price)}</span>,
          <span key="d" className="text-sm font-semibold text-green-600">{p.mrp?Math.round((p.mrp-p.base_price)/p.mrp*100)+'%':'—'}</span>,
          p.fasting_required?<Badge key="f" color="amber">Yes</Badge>:<span key="f" className="text-xs text-gray-400">No</span>,
          p.home_collection?<Badge key="h" color="blue">✓</Badge>:<span key="h" className="text-xs text-gray-400">—</span>,
          p.badge?<Badge key="b" color="orange">{p.badge}</Badge>:<span key="b">—</span>,
          <Badge key="s" color={p.active?'green':'red'}>{p.active?'Active':'Off'}</Badge>,
        ])} empty="No packages found"/>
      </Card>
    </div>
  );
}

// ── Enterprises Page ───────────────────────────────────────────────────────────
function EnterprisesPage({enterprises}:{enterprises:Enterprise[]}) {
  return (
    <div className="p-5 max-w-[1200px] mx-auto w-full">
      <Card title="Enterprises" action={<Badge color="green">{enterprises.filter(e=>e.active).length} active</Badge>}>
        <Table cols={['Enterprise','Type','POC','Email','Phone','Discount','Contract','Status']} rows={enterprises.map(e=>[
          <div key="n"><div className="font-bold text-sm text-gray-900">{e.name}</div></div>,
          <Badge key="t" color="blue">{e.type}</Badge>,
          <span key="poc" className="text-sm text-gray-700">{e.poc_name}</span>,
          <span key="e" className="text-xs text-blue-700">{e.poc_email}</span>,
          <span key="ph" className="text-xs text-gray-600">{e.poc_phone}</span>,
          <span key="d" className="text-sm font-bold text-green-700">{e.discount_pct}%</span>,
          <div key="c"><div className="text-xs text-gray-600">{e.contract_start}</div><div className="text-xs text-gray-400">→ {e.contract_end}</div></div>,
          <Badge key="s" color={e.active?'green':'red'}>{e.active?'Active':'Inactive'}</Badge>,
        ])} empty="No enterprises yet"/>
      </Card>
    </div>
  );
}

// ── Finance Page ───────────────────────────────────────────────────────────────
function FinancePage({bookings}:{bookings:Booking[]}) {
  const received=bookings.filter(b=>['Received','Completed'].includes(b.stage));
  const grossRevenue=received.reduce((s,b)=>s+b.amount,0);
  const platformFee=Math.round(grossRevenue*0.11);
  const netToLabs=grossRevenue-platformFee;
  const byLab=Object.entries(received.reduce((acc,b)=>{ const n=b.lab?.name??'Unknown'; acc[n]=(acc[n]??0)+b.amount; return acc; },{} as Record<string,number>)).sort((a,b)=>b[1]-a[1]);

  return (
    <div className="p-5 max-w-[1200px] mx-auto w-full flex flex-col gap-5">
      <div className="grid grid-cols-4 gap-4">
        {[['Gross Revenue',fmt(grossRevenue),'#22C55E'],['Platform Fee (11%)',fmt(platformFee),'#F59E0B'],['Net to Labs',fmt(netToLabs),'#3B82F6'],['Avg Order Value',fmt(received.length>0?Math.round(grossRevenue/received.length):0),'#8B5CF6']].map(([l,v,c])=>(
          <div key={l} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-2">{l}</div>
            <div className="text-[24px] font-black" style={{color:c}}>{v}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Card title="Revenue by Lab">
          <Table cols={['Lab','Revenue','Fee','Net']} rows={byLab.map(([name,rev])=>[
            <span key="n" className="font-semibold text-sm text-gray-900">{name}</span>,
            <span key="r" className="text-sm font-bold text-gray-700">{fmt(rev)}</span>,
            <span key="f" className="text-sm text-amber-700">−{fmt(Math.round(rev*0.11))}</span>,
            <span key="net" className="text-sm font-bold text-green-700">{fmt(rev-Math.round(rev*0.11))}</span>,
          ])} empty="No completed bookings"/>
        </Card>
        <Card title="Booking Status Breakdown">
          <div className="px-5 py-4">
            {[['New',bookings.filter(b=>b.stage==='New').length,'indigo'],['Confirmed',bookings.filter(b=>b.stage==='Confirmed').length,'green'],['Completed',bookings.filter(b=>b.stage==='Completed').length,'teal'],['Received',bookings.filter(b=>b.stage==='Received').length,'green'],['Rejected',bookings.filter(b=>b.stage==='Rejected').length,'red']].map(([s,n,c])=>(
              <div key={s as string} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-600">{s as string}</span>
                <div className="flex items-center gap-3"><div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{width:`${Math.min(100,((n as number)/Math.max(bookings.length,1))*100)}%`,background:c==='green'?'#22C55E':c==='indigo'?'#6366F1':c==='teal'?'#14B8A6':c==='red'?'#EF4444':'#9CA3AF'}}/></div><span className="font-black text-gray-900 text-sm w-6 text-right">{n as number}</span></div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── Users Page ─────────────────────────────────────────────────────────────────
function UsersPage({showToast}:{showToast:(m:string,t:'success'|'error'|'info')=>void}) {
  const [profiles,setProfiles]=useState<Profile[]>([]);
  const [loading,setLoading]=useState(true);
  const [inviting,setInviting]=useState(false);
  const [invForm,setInvForm]=useState({full_name:'',email:'',role:'CRM_OPS',department:''});
  const [saving,setSaving]=useState(false);

  useEffect(()=>{
    SB.from('user_profiles').select('id,full_name,role,phone,department,designation,employee_id,is_active,created_at').order('created_at',{ascending:false})
      .then(({data})=>{ setProfiles((data as Profile[])??[]); setLoading(false); });
  },[]);

  async function invite(){
    if(!invForm.full_name||!invForm.email){showToast('Name and email required','error');return;}
    setSaving(true);
    const {error}=await SB.from('staff_invitations').insert({email:invForm.email,role:invForm.role,full_name:invForm.full_name});
    setSaving(false);
    if(error) showToast(error.message,'error');
    else { showToast('Invitation sent to '+invForm.email,'success'); setInviting(false); setInvForm({full_name:'',email:'',role:'CRM_OPS',department:''}); }
  }

  const ROLES=['CRM_OPS','PROVIDER','SUPER_ADMIN','ADMIN'];
  const ROLE_COLORS:Record<string,string>={CRM_OPS:'blue',PROVIDER:'teal',SUPER_ADMIN:'red',ADMIN:'purple',PATIENT:'gray'};

  return (
    <>
      <Modal open={inviting} onClose={()=>setInviting(false)} title="Invite Staff Member" footer={<><Btn onClick={()=>setInviting(false)}>Cancel</Btn><Btn variant="primary" onClick={invite} disabled={saving}>{saving?'Sending…':'Send Invite'}</Btn></>}>
        <div className="space-y-4">
          <Input label="Full Name" value={invForm.full_name} onChange={v=>setInvForm(f=>({...f,full_name:v}))} required placeholder="e.g. Priya Sharma"/>
          <Input label="Email" type="email" value={invForm.email} onChange={v=>setInvForm(f=>({...f,email:v}))} required placeholder="priya@checkupify.com"/>
          <Select label="Role" value={invForm.role} onChange={v=>setInvForm(f=>({...f,role:v}))} options={ROLES.map(r=>({value:r,label:r}))} required/>
          <Input label="Department" value={invForm.department} onChange={v=>setInvForm(f=>({...f,department:v}))} placeholder="e.g. Operations"/>
          <div className="text-[11px] text-blue-700 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">An invitation email will be sent with a secure login link (48h expiry).</div>
        </div>
      </Modal>

      <div className="p-5 max-w-[1100px] mx-auto w-full">
        {loading?<div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-gray-200 border-t-green-500 rounded-full animate-spin"/></div>:(
          <Card title="Staff & Users" sub={`${profiles.filter(p=>p.is_active).length} active members`} action={<Btn variant="primary" onClick={()=>setInviting(true)}>+ Invite Staff</Btn>}>
            <Table cols={['Name','Role','Employee ID','Department','Designation','Phone','Status','Joined']} rows={profiles.map(p=>[
              <div key="n"><div className="font-semibold text-sm text-gray-900">{p.full_name}</div></div>,
              <Badge key="r" color={ROLE_COLORS[p.role]??'gray'}>{p.role}</Badge>,
              <span key="eid" className="text-xs font-mono text-gray-500">{p.employee_id??'—'}</span>,
              <span key="dept" className="text-xs text-gray-600">{p.department??'—'}</span>,
              <span key="des" className="text-xs text-gray-600">{p.designation??'—'}</span>,
              <span key="ph" className="text-xs text-gray-600">{p.phone??'—'}</span>,
              <Badge key="s" color={p.is_active?'green':'gray'}>{p.is_active?'Active':'Inactive'}</Badge>,
              <span key="j" className="text-xs text-gray-400">{fmtDate(p.created_at)}</span>,
            ])} empty="No staff members"/>
          </Card>
        )}
      </div>
    </>
  );
}

// ── Settings Page ─────────────────────────────────────────────────────────────
function SettingsPage() {
  const [saved,setSaved]=useState(false);
  const sla=[['Confirmation TAT','< 2 hours','₹400 penalty'],['First Report TAT','< 6 hours','₹600 penalty'],['Full Report TAT','< 36 hours','₹1,000 penalty'],['Rejection Rate','< 2% MTD','Quality score impact']];
  return (
    <div className="p-5 max-w-[1100px] mx-auto w-full flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <Card title="Platform Config">
          <div className="px-5 py-4">
            {[['Supabase URL','lguoussmsusadvmexjkb.supabase.co'],['Region','ap-northeast-1 (Tokyo)'],['Migrations Applied','011'],['Edge Functions','3 active'],['SLA Cron','Every 5 minutes'],['Status','ACTIVE_HEALTHY']].map(([k,v])=>(
              <div key={k} className="flex justify-between py-2.5 border-b border-gray-50 last:border-0 text-sm"><span className="text-gray-500">{k}</span><span className="font-semibold text-gray-900">{v}</span></div>
            ))}
          </div>
        </Card>
        <Card title="SLA Configuration">
          <div className="px-5 py-4">
            {sla.map(([k,v,p])=>(
              <div key={k} className="py-2.5 border-b border-gray-50 last:border-0">
                <div className="flex justify-between text-sm mb-0.5"><span className="font-semibold text-gray-900">{k}</span><Badge color="green">{v}</Badge></div>
                <div className="text-[11px] text-red-600">{p}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <Card title="Notification Settings">
        <div className="px-5 py-4">
          {[['WhatsApp on Booking Confirm',true],['WhatsApp on Report Ready',true],['SLA Breach Alert to OPS',true],['Daily Report Email',false],['Weekly Summary Email',true]].map(([l,v])=>(
            <div key={l as string} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
              <span className="text-sm font-medium text-gray-800">{l as string}</span>
              <div className={cn('w-10 h-6 rounded-full transition-all relative cursor-pointer border',v?'bg-green-500 border-green-500':'bg-gray-200 border-gray-200')}>
                <span className={cn('absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all',v?'left-4':'left-0.5')}/>
              </div>
            </div>
          ))}
          <div className="pt-3"><Btn variant="primary" onClick={()=>setSaved(true)}>{saved?'✓ Saved':'Save Settings'}</Btn></div>
        </div>
      </Card>
    </div>
  );
}

// ── Customers Page ─────────────────────────────────────────────────────────────
function CustomersPage({bookings,onViewBooking}:{bookings:Booking[];onViewBooking:(id:string)=>void}) {
  const [search,setSearch]=useState('');
  // Aggregate unique patients from bookings
  const patients=Object.values(bookings.reduce((acc,b)=>{ if(!acc[b.patient_phone]) acc[b.patient_phone]={phone:b.patient_phone,name:b.patient_name,gender:b.patient_gender,age:b.patient_age,bookings:0,spend:0,last:''}; acc[b.patient_phone].bookings++; acc[b.patient_phone].spend+=b.amount; if(!acc[b.patient_phone].last||b.created_at>acc[b.patient_phone].last) acc[b.patient_phone].last=b.created_at; return acc; },{} as Record<string,any>)).filter(p=>!search||p.name.toLowerCase().includes(search.toLowerCase())||p.phone.includes(search)).sort((a,b)=>b.spend-a.spend);

  return (
    <div className="p-5 max-w-[1200px] mx-auto w-full">
      <Card title="Customers" sub={`${patients.length} unique patients`} action={<div className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-1.5 bg-gray-50"><span className="text-gray-400 text-xs">⌕</span><input className="bg-transparent text-sm outline-none w-40 placeholder-gray-300" placeholder="Search name or phone…" value={search} onChange={e=>setSearch(e.target.value)}/></div>}>
        <Table cols={['Patient','Phone','Gender / Age','Bookings','Total Spend','Last Booking','Actions']} rows={patients.map((p:any)=>[
          <div key="n"><div className="font-semibold text-sm text-gray-900">{p.name}</div></div>,
          <span key="ph" className="text-sm text-gray-700">{p.phone}</span>,
          <span key="ga" className="text-sm text-gray-600">{p.gender},{p.age}</span>,
          <span key="b" className="text-sm font-bold text-gray-900">{p.bookings}</span>,
          <span key="s" className="text-sm font-bold text-green-700">{fmt(p.spend)}</span>,
          <span key="l" className="text-xs text-gray-400">{fmtDate(p.last)}</span>,
          <button key="v" onClick={()=>{ const lb=bookings.find(b=>b.patient_phone===p.phone); if(lb) onViewBooking(lb.id); }} className="text-xs text-green-700 font-semibold hover:underline cursor-pointer">View →</button>,
        ])} empty="No customers found"/>
      </Card>
    </div>
  );
}

// ── Login ─────────────────────────────────────────────────────────────────────
function Login({onLogin}:{onLogin:(u:any)=>void}) {
  const [email,setEmail]=useState('ops@checkupify.com');
  const [pass,setPass]=useState('');
  const [err,setErr]=useState('');
  const [loading,setLoading]=useState(false);

  async function submit(e:React.FormEvent) {
    e.preventDefault(); setErr(''); setLoading(true);
    const {data,error}=await SB.auth.signInWithPassword({email,password:pass});
    setLoading(false);
    if(error){setErr(error.message);return;}
    if(data.user) onLogin(data.user);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-8"><div className="w-10 h-10 rounded-2xl bg-green-600 flex items-center justify-center"><svg width="20" height="20" viewBox="0 0 100 100" fill="none"><path d="M50 8 A42 42 0 1 1 85 22" stroke="white" strokeWidth="12" strokeLinecap="round" fill="none"/><path d="M26 50 L42 67 L73 35" stroke="white" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg></div><div><div className="text-[18px] font-black text-gray-900">Checkupify</div><div className="text-[11px] text-gray-400">CRM · Staff Only</div></div></div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="text-[20px] font-black text-gray-900 mb-1">Sign in</div>
          <div className="text-[13px] text-gray-400 mb-6">Use your Checkupify staff credentials</div>
          <form onSubmit={submit} className="flex flex-col gap-4">
            <Input label="Email" type="email" value={email} onChange={setEmail} required/>
            <Input label="Password" type="password" value={pass} onChange={setPass} required placeholder="••••••••"/>
            {err&&<div className="text-[12px] text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{err}</div>}
            <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-green-600 text-white font-bold text-sm hover:bg-green-700 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2">{loading?<><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Signing in…</>:'Sign in →'}</button>
          </form>
          <div className="mt-5 pt-4 border-t border-gray-100">
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Demo Accounts</div>
            {[['ops@checkupify.com','CRM Ops'],['lab@checkupify.com','Provider'],['admin@checkupify.com','Super Admin']].map(([e,r])=>(
              <button key={e} onClick={()=>setEmail(e)} className="w-full flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 cursor-pointer mb-1">
                <span className="text-[12px] text-gray-700">{e}</span><span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">{r}</span>
              </button>
            ))}
            <div className="text-[11px] text-gray-400 text-center mt-2">Password: <code className="bg-gray-100 px-1.5 py-0.5 rounded">Checkupify@2026</code></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── ROOT APP ──────────────────────────────────────────────────────────────────
export default function CRMApp() {
  const [authState,setAuthState]=useState<'loading'|'login'|'app'>('loading');
  const [user,setUser]=useState<any>(null);
  const [page,setPage]=useState<Page>('dash');
  const [detailId,setDetailId]=useState('');
  const [bookings,setBookings]=useState<Booking[]>([]);
  const [labs,setLabs]=useState<Lab[]>([]);
  const [pkgs,setPkgs]=useState<Pkg[]>([]);
  const [leads,setLeads]=useState<Lead[]>([]);
  const [enterprises,setEnterprises]=useState<Enterprise[]>([]);
  const [dataLoading,setDataLoading]=useState(true);
  const [toast,setToast]=useState<{msg:string;type:'success'|'error'|'info'}|null>(null);

  useEffect(()=>{
    SB.auth.getSession().then(({data:{session}})=>{ if(session?.user){setUser(session.user);setAuthState('app');}else setAuthState('login'); });
    const{data:{subscription}}=SB.auth.onAuthStateChange((_,s)=>{ if(s?.user){setUser(s.user);setAuthState('app');}else{setUser(null);setAuthState('login');} });
    return()=>subscription.unsubscribe();
  },[]);

  const fetchAll=useCallback(async()=>{
    setDataLoading(true);
    const [bR,lR,pR,ldR,eR]=await Promise.allSettled([
      SB.from('bookings').select('*,lab:labs(id,name,city,phone,email),package:packages(name,base_price,test_count)').order('created_at',{ascending:false}).limit(200),
      SB.from('labs').select('*').order('rating',{ascending:false}),
      SB.from('packages').select('*').order('sort_order'),
      SB.from('leads').select('*').order('created_at',{ascending:false}),
      SB.from('enterprises').select('*').order('name'),
    ]);
    if(bR.status==='fulfilled'&&bR.value.data) setBookings(bR.value.data as Booking[]);
    if(lR.status==='fulfilled'&&lR.value.data) setLabs(lR.value.data as Lab[]);
    if(pR.status==='fulfilled'&&pR.value.data) setPkgs(pR.value.data as Pkg[]);
    if(ldR.status==='fulfilled'&&ldR.value.data) setLeads(ldR.value.data as Lead[]);
    if(eR.status==='fulfilled'&&eR.value.data) setEnterprises(eR.value.data as Enterprise[]);
    setDataLoading(false);
  },[]);

  useEffect(()=>{ if(authState==='app') fetchAll(); },[authState,fetchAll]);

  function showToast(msg:string,type:'success'|'error'|'info'='info') { setToast({msg,type}); }
  function navTo(p:Page,id?:string) { if(id) setDetailId(id); setPage(p); }

  if(authState==='loading') return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="w-8 h-8 border-2 border-gray-200 border-t-green-600 rounded-full animate-spin"/></div>;
  if(authState==='login') return <Login onLogin={u=>{setUser(u);setAuthState('app');}}/>;

  const titles:Record<Page,string>={dash:'Dashboard',bookings:'Bookings','booking-detail':'Booking Detail',customers:'Customers',labs:'Labs & Providers',packages:'Packages',leads:'Leads',enterprises:'Enterprises',finance:'Finance',users:'Staff & Users',settings:'Settings'};
  const newQ=bookings.filter(b=>b.stage==='New').length;
  const newLeads=leads.filter(l=>l.status==='New').length;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {toast&&<Toast msg={toast.msg} type={toast.type} onDone={()=>setToast(null)}/>}
      <Sidebar page={page} onNav={p=>setPage(p)} user={user} bookingCount={newQ} newLeads={newLeads}/>
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Topbar */}
        <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-5 shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            {page==='booking-detail'&&<button onClick={()=>setPage('bookings')} className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center cursor-pointer text-gray-600 text-sm">←</button>}
            <div className="font-bold text-gray-900 text-[15px]">{titles[page]}</div>
          </div>
          <div className="flex items-center gap-3">
            {dataLoading&&<span className="text-[11px] text-gray-400 flex items-center gap-1"><span className="w-3 h-3 border-2 border-gray-300 border-t-green-500 rounded-full animate-spin inline-block"/>Syncing…</span>}
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/><span className="text-[11px] text-green-700 font-semibold">Supabase Live</span></div>
            <button onClick={fetchAll} className="text-[11px] font-semibold text-gray-400 hover:text-gray-700 cursor-pointer px-2 py-1 rounded hover:bg-gray-100 transition-colors">↺ Refresh</button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {page==='dash'          &&<DashPage bookings={bookings} labs={labs} pkgs={pkgs} leads={leads} onNav={navTo}/>}
          {page==='bookings'      &&<BookingsPage bookings={bookings} onRefresh={fetchAll} onViewDetail={id=>navTo('booking-detail',id)} showToast={showToast}/>}
          {page==='booking-detail'&&<BookingDetail id={detailId} onBack={()=>setPage('bookings')} onRefresh={fetchAll} showToast={showToast}/>}
          {page==='customers'     &&<CustomersPage bookings={bookings} onViewBooking={id=>navTo('booking-detail',id)}/>}
          {page==='labs'          &&<LabsPage labs={labs}/>}
          {page==='packages'      &&<PackagesPage pkgs={pkgs}/>}
          {page==='leads'         &&<LeadsPage leads={leads} onRefresh={fetchAll} showToast={showToast}/>}
          {page==='enterprises'   &&<EnterprisesPage enterprises={enterprises}/>}
          {page==='finance'       &&<FinancePage bookings={bookings}/>}
          {page==='users'         &&<UsersPage showToast={showToast}/>}
          {page==='settings'      &&<SettingsPage/>}
        </div>
      </div>
    </div>
  );
}
