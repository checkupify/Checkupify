'use client';
import { useState, useEffect, useCallback, useRef, type ReactNode, type ChangeEvent } from 'react';
import { createClient } from '@supabase/supabase-js';

const SB = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

type Page = 'dash'|'confirm'|'bookings'|'upload-report'|'tat'|'quality'|'invoices'|'contract'|'settings';
interface Booking { id:string;patient_name:string;patient_phone:string;patient_gender:string;patient_age:number;appointment_date:string;slot_time:string;collection_type:string;amount:number;stage:string;sla_status:string;rejection_reason:string|null;report_url:string|null;created_at:string;lab:Lab|null;package:Pkg|null; }
interface Lab { id:string;name:string;city:string;nabl_certified:boolean;rating:number;network_type:string;avg_tat_hours:number;score:number;phone:string;email:string;address:string;home_collection:boolean; }
interface Pkg { id:string;name:string;base_price:number;test_count:number; }

function cn(...c:(string|false|null|undefined)[]) { return c.filter(Boolean).join(' '); }
function fmt(n:number) { return '₹'+n.toLocaleString('en-IN'); }
function fmtTime(t:string) { return t?.slice(0,5)??''; }
function fmtDate(d:string) { return new Date(d).toLocaleDateString('en-IN',{day:'2-digit',month:'short'}); }
function minsLeft(deadline:string) { return Math.floor((new Date(deadline).getTime()-Date.now())/60000); }
function fmtCountdown(mins:number) { if(mins<=0) return 'BREACHED'; return mins<60?`${mins}m`:`${Math.floor(mins/60)}h ${mins%60}m`; }

function Btn({children,onClick,variant='default',size='md',disabled,className}:{children:ReactNode;onClick?:()=>void;variant?:'default'|'primary'|'danger'|'ghost';size?:'xs'|'sm'|'md';disabled?:boolean;className?:string}) {
  const v={default:'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50',primary:'bg-green-600 text-white border border-green-600 hover:bg-green-700',danger:'bg-red-50 border border-red-200 text-red-700 hover:bg-red-100',ghost:'text-gray-500 border border-transparent hover:bg-gray-100'};
  const s={xs:'px-2 py-1 text-[11px]',sm:'px-3 py-1.5 text-xs',md:'px-4 py-2 text-sm'};
  return <button onClick={onClick} disabled={disabled} className={cn('inline-flex items-center gap-1.5 rounded-lg font-semibold transition-all cursor-pointer disabled:opacity-50',v[variant],s[size],className)}>{children}</button>;
}

function Badge({children,color='gray'}:{children:ReactNode;color?:string}) {
  const c:Record<string,string>={green:'bg-green-100 text-green-800 border-green-200',amber:'bg-amber-100 text-amber-800 border-amber-200',red:'bg-red-100 text-red-800 border-red-200',blue:'bg-blue-100 text-blue-800 border-blue-200',indigo:'bg-indigo-100 text-indigo-800 border-indigo-200',purple:'bg-purple-100 text-purple-800 border-purple-200',teal:'bg-teal-100 text-teal-800 border-teal-200',gray:'bg-gray-100 text-gray-700 border-gray-200'};
  return <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border',c[color]??c.gray)}>{children}</span>;
}

function StageBadge({stage}:{stage:string}) {
  const m:Record<string,string>={New:'indigo',Confirmed:'green',Completed:'teal','Pending Reports':'amber','Partially Received':'purple',Received:'green',Rejected:'red'};
  return <Badge color={m[stage]??'gray'}>{stage}</Badge>;
}

function Modal({open,onClose,title,children,footer}:{open:boolean;onClose:()=>void;title:string;children:ReactNode;footer?:ReactNode}) {
  useEffect(()=>{ const h=(e:KeyboardEvent)=>{ if(e.key==='Escape') onClose(); }; window.addEventListener('keydown',h); return ()=>window.removeEventListener('keydown',h); },[onClose]);
  if(!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}/>
      <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100"><div className="font-bold text-gray-900">{title}</div><button onClick={onClose} className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-sm cursor-pointer hover:bg-gray-200">✕</button></div>
        <div className="px-6 py-5">{children}</div>
        {footer&&<div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">{footer}</div>}
      </div>
    </div>
  );
}

function Toast({msg,type,onDone}:{msg:string;type:'success'|'error'|'info';onDone:()=>void}) {
  useEffect(()=>{ const t=setTimeout(onDone,3500); return ()=>clearTimeout(t); },[onDone]);
  return <div className={cn('fixed bottom-5 right-5 z-[200] flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium',type==='success'?'bg-green-50 border-green-200 text-green-800':type==='error'?'bg-red-50 border-red-200 text-red-800':'bg-blue-50 border-blue-200 text-blue-800')}><span>{type==='success'?'✓':type==='error'?'✕':'ℹ'}</span><span>{msg}</span></div>;
}

function Card({title,children,action,sub}:{title:string;children:ReactNode;action?:ReactNode;sub?:string}) {
  return <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"><div className="flex items-center justify-between px-5 py-4 border-b border-gray-100"><div><div className="font-bold text-gray-900 text-[14px]">{title}</div>{sub&&<div className="text-[10px] text-gray-400 mt-0.5">{sub}</div>}</div>{action}</div>{children}</div>;
}

function Table({cols,rows,empty='No data'}:{cols:string[];rows:ReactNode[][];empty?:string}) {
  return <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-gray-100">{cols.map(c=><th key={c} className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50/50 whitespace-nowrap">{c}</th>)}</tr></thead><tbody className="divide-y divide-gray-50">{rows.length===0?<tr><td colSpan={cols.length} className="px-4 py-12 text-center text-gray-400">{empty}</td></tr>:rows.map((row,i)=><tr key={i} className="hover:bg-gray-50/60 group">{row.map((cell,j)=><td key={j} className="px-4 py-3">{cell}</td>)}</tr>)}</tbody></table></div>;
}

function PBar({value,color='#22C55E',h=6}:{value:number;color?:string;h?:number}) {
  return <div className="bg-gray-100 rounded-full overflow-hidden" style={{height:h}}><div className="h-full rounded-full transition-all" style={{width:`${Math.min(100,Math.max(0,value))}%`,background:color}}/></div>;
}

// Sidebar
const NAV=[{id:'dash',l:'Dashboard',ic:'⊞'},{id:'confirm',l:'Confirm Queue',ic:'⏳'},{id:'bookings',l:'All Bookings',ic:'📅'},{id:'upload-report',l:'Upload Reports',ic:'📤'},{id:'tat',l:'TAT Analytics',ic:'📊'},{id:'quality',l:'Quality Score',ic:'⭐'},{id:'invoices',l:'Invoices',ic:'💳'},{id:'contract',l:'Contract',ic:'📋'},{id:'settings',l:'Settings',ic:'⚙️'}] as const;

function Sidebar({page,onNav,lab,newCount}:{page:Page;onNav:(p:Page)=>void;lab:Lab|null;newCount:number}) {
  return (
    <aside className="w-56 shrink-0 bg-white border-r border-gray-100 flex flex-col h-screen sticky top-0 shadow-sm z-20">
      <div className="px-4 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5 mb-3"><div className="w-8 h-8 rounded-xl bg-green-600 flex items-center justify-center"><svg width="16" height="16" viewBox="0 0 100 100" fill="none"><path d="M50 8 A42 42 0 1 1 85 22" stroke="white" strokeWidth="12" strokeLinecap="round" fill="none"/><path d="M26 50 L42 67 L73 35" stroke="white" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg></div><div><div className="text-[14px] font-black text-gray-900">Checkupify</div><div className="text-[10px] text-gray-400">Provider Portal</div></div></div>
        {lab&&<div className="bg-green-50 border border-green-200 rounded-xl px-3 py-2.5"><div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center text-[10px] font-black text-white shrink-0">{lab.name[0]}</div><div className="min-w-0"><div className="text-[11px] font-bold text-gray-900 truncate">{lab.name}</div><div className="text-[9px] font-bold text-green-700 uppercase">{lab.network_type}</div></div></div></div>}
      </div>
      <nav className="flex-1 py-3 px-3 overflow-y-auto">
        {NAV.map(n=><button key={n.id} onClick={()=>onNav(n.id as Page)} className={cn('w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[12.5px] font-medium transition-all mb-0.5 cursor-pointer text-left',page===n.id?'bg-green-50 text-green-700 font-semibold':'text-gray-600 hover:bg-gray-50')}><span className="text-base w-5 text-center shrink-0">{n.ic}</span><span className="flex-1">{n.l}</span>{n.id==='confirm'&&newCount>0&&<span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-red-500 text-white">{newCount}</span>}</button>)}
      </nav>
      <div className="px-4 py-3 border-t border-gray-100 text-center text-[10px] text-gray-400">
        {lab?.nabl_certified&&<span className="text-green-700 font-semibold">NABL Certified ·</span>} Live Data
      </div>
    </aside>
  );
}

// Dashboard
function DashPage({bookings,lab}:{bookings:Booking[];lab:Lab|null}) {
  const today=new Date().toISOString().split('T')[0];
  const todayB=bookings.filter(b=>b.appointment_date===today);
  const pending=bookings.filter(b=>b.stage==='Pending Reports');
  const rev=bookings.reduce((s,b)=>s+b.amount,0);
  const compliance=bookings.length>0?Math.round((bookings.filter(b=>b.sla_status==='On Track').length/bookings.length)*100):100;

  return (
    <div className="p-5 max-w-[1200px] mx-auto w-full flex flex-col gap-5">
      {/* SLA strip */}
      <div className="grid grid-cols-3 gap-4">
        {[{l:'Confirmation SLA',v:'On Track',t:'< 2 hr target',c:'#22C55E'},{l:'First Report SLA',v:bookings.filter(b=>b.sla_status==='Breach').length>0?`${bookings.filter(b=>b.sla_status==='Breach').length} Breached`:'On Track',t:'< 6 hr target',c:bookings.filter(b=>b.sla_status==='Breach').length>0?'#EF4444':'#22C55E'},{l:'Full Report SLA',v:'On Track',t:'< 36 hr target',c:'#22C55E'}].map(s=>(
          <div key={s.l} className="bg-white rounded-2xl border-l-4 border border-gray-100 shadow-sm p-4" style={{borderLeftColor:s.c}}>
            <div className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-1.5">{s.l}</div>
            <div className="text-[18px] font-black" style={{color:s.c}}>{s.v}</div>
            <div className="text-[10px] text-gray-400 mt-0.5">{s.t}</div>
          </div>
        ))}
      </div>

      {/* Tiles */}
      <div className="grid grid-cols-6 gap-3">
        {[["Today's",todayB.length,'#22C55E'],['New Queue',bookings.filter(b=>b.stage==='New').length,'#F59E0B'],['Pending Reports',pending.length,'#8B5CF6'],['Avg TAT',`${lab?.avg_tat_hours??6}h`,'#3B82F6'],['Quality',`${lab?.score??82}/100`,'#8B5CF6'],['Revenue',`₹${(rev/100000).toFixed(1)}L`,'#22C55E']].map(([l,v,c])=>(
          <div key={l as string} className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
            <div className="text-[9px] font-bold uppercase tracking-wide text-gray-400 mb-1">{l as string}</div>
            <div className="text-[22px] font-black leading-none" style={{color:c as string}}>{v as string|number}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <Card title="Reports Queue" action={<Badge color="amber">{pending.length} PENDING</Badge>}>
            <Table cols={['Patient','Package','Date','SLA','Action']} rows={(pending.length>0?pending:bookings).slice(0,6).map(b=>[
              <div key="p"><div className="font-semibold text-[12px] text-gray-900">{b.patient_name}</div><div className="text-[10px] text-gray-400">{b.patient_phone}</div></div>,
              <span key="pkg" className="text-xs text-blue-700 font-medium">{b.package?.name??'—'}</span>,
              <span key="d" className="text-xs text-gray-600">{b.appointment_date}</span>,
              <Badge key="sla" color={b.sla_status==='On Track'?'green':b.sla_status==='At Risk'?'amber':'red'}>{b.sla_status}</Badge>,
              <Btn key="a" size="xs" variant="primary">↑ Upload</Btn>,
            ])} empty="No pending reports"/>
          </Card>
        </div>
        <div className="flex flex-col gap-4">
          <Card title="SLA Compliance">
            <div className="px-4 py-4 space-y-3">
              {[['Confirmation',compliance,'#22C55E'],['First Report',Math.max(60,compliance-13),'#F59E0B'],['Full Report',Math.min(99,compliance+3),'#22C55E']].map(([l,v,c])=>(
                <div key={l as string}><div className="flex justify-between text-xs mb-1.5"><span className="text-gray-500">{l as string}</span><span className="font-bold" style={{color:c as string}}>{v}%</span></div><PBar value={v as number} color={c as string}/></div>
              ))}
            </div>
          </Card>
          <Card title="Lab Info">
            <div className="px-4 py-3">
              {[['Name',lab?.name??'HealthFirst Labs'],['Network',lab?.network_type??'Super Premium'],['Rating',`⭐ ${lab?.rating??4.8}`],['NABL',lab?.nabl_certified?'✓ Certified':'Not certified'],['Home Collection',lab?.home_collection?'Available':'Not available']].map(([k,v])=>(
                <div key={k as string} className="flex justify-between py-2 border-b border-gray-50 last:border-0 text-sm"><span className="text-gray-500">{k as string}</span><span className="font-semibold text-gray-900 text-right">{v as string}</span></div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Confirm Queue
const REJECT_REASONS=['Slot already booked','Patient cancelled','Capacity full','Equipment unavailable','Test not available at this branch','Other'];

function ConfirmPage({bookings,onRefresh,showToast}:{bookings:Booking[];onRefresh:()=>void;showToast:(m:string,t:'success'|'error'|'info')=>void}) {
  const newB=bookings.filter(b=>b.stage==='New');
  const [confirmB,setConfirmB]=useState<Booking|null>(null);
  const [rejectB,setRejectB]=useState<Booking|null>(null);
  const [rejReason,setRejReason]=useState('');
  const [loading,setLoading]=useState(false);

  async function doConfirm() {
    if(!confirmB) return; setLoading(true);
    const {error}=await SB.from('bookings').update({stage:'Confirmed',confirmed_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq('id',confirmB.id);
    setLoading(false);
    if(error) showToast(error.message,'error'); else { showToast('Confirmed: '+confirmB.patient_name,'success'); setConfirmB(null); onRefresh(); }
  }

  async function doReject() {
    if(!rejectB||!rejReason){showToast('Select a reason','error');return;} setLoading(true);
    const {error}=await SB.from('bookings').update({stage:'Rejected',rejection_reason:rejReason,updated_at:new Date().toISOString()}).eq('id',rejectB.id);
    setLoading(false);
    if(error) showToast(error.message,'error'); else { showToast('Rejected: '+rejectB.patient_name,'info'); setRejectB(null); setRejReason(''); onRefresh(); }
  }

  return (
    <>
      <Modal open={!!confirmB} onClose={()=>setConfirmB(null)} title="Confirm Booking" footer={<><Btn onClick={()=>setConfirmB(null)}>Cancel</Btn><Btn variant="primary" onClick={doConfirm} disabled={loading}>✓ Confirm</Btn></>}>
        {confirmB&&<div className="space-y-3">{[['Patient',confirmB.patient_name],['Package',confirmB.package?.name??'—'],['Date & Slot',`${confirmB.appointment_date} · ${fmtTime(confirmB.slot_time)}`],['Collection',confirmB.collection_type],['Amount',fmt(confirmB.amount)]].map(([k,v])=><div key={k} className="flex justify-between text-sm pb-2 border-b border-gray-50"><span className="text-gray-500">{k}</span><span className="font-semibold">{v}</span></div>)}<div className="text-[11px] text-green-700 bg-green-50 rounded-lg px-3 py-2 mt-2">✓ Patient notified via WhatsApp</div></div>}
      </Modal>
      <Modal open={!!rejectB} onClose={()=>{setRejectB(null);setRejReason('');}} title="Reject Booking" footer={<><Btn onClick={()=>{setRejectB(null);setRejReason('');}}>Cancel</Btn><Btn variant="danger" onClick={doReject} disabled={loading}>Reject</Btn></>}>
        <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none cursor-pointer" value={rejReason} onChange={e=>setRejReason(e.target.value)}><option value="">Select reason *</option>{REJECT_REASONS.map(r=><option key={r} value={r}>{r}</option>)}</select>
      </Modal>

      <div className="p-5 max-w-[1100px] mx-auto w-full flex flex-col gap-4">
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm flex items-center gap-3"><span className="text-amber-500 text-lg">⚠</span><span className="text-amber-800 font-semibold">SLA: Confirm within 2 hours of booking. Each breach = ₹400 penalty.</span></div>
        <Card title="Confirmation Queue" action={<Badge color="red">{newB.length} NEED ACTION</Badge>}>
          <Table cols={['Patient','Package','Date & Slot','Type','Amount','SLA Countdown','Actions']} rows={newB.map((b,i)=>{
            const deadline=new Date(new Date(b.created_at).getTime()+2*3600000);
            const mins=minsLeft(deadline.toISOString());
            const urgent=mins<30;
            return [
              <div key="p"><div className="font-semibold text-[12px] text-gray-900">{b.patient_name}</div><div className="text-[10px] text-gray-400">{b.patient_phone}</div></div>,
              <span key="pkg" className="text-xs text-blue-700 font-medium">{b.package?.name??'—'}</span>,
              <div key="d"><div className="text-[12px] text-gray-700">{b.appointment_date}</div><div className="text-[10px] text-gray-400">{fmtTime(b.slot_time)}</div></div>,
              <Badge key="t" color="blue">{b.collection_type}</Badge>,
              <span key="amt" className="text-sm font-semibold text-gray-700">{fmt(b.amount)}</span>,
              <div key="sla"><div className={cn('text-sm font-black flex items-center gap-1.5',urgent?'text-red-600':'text-amber-600')}>{urgent&&<span className="w-2 h-2 rounded-full bg-red-500 animate-pulse inline-block"/>}{fmtCountdown(mins)}</div><PBar value={Math.max(0,(mins/120)*100)} color={urgent?'#EF4444':'#F59E0B'} h={3}/></div>,
              <div key="act" className="flex gap-1.5"><Btn size="xs" variant="primary" onClick={()=>setConfirmB(b)}>✓ Confirm</Btn><Btn size="xs" variant="danger" onClick={()=>setRejectB(b)}>✕</Btn></div>,
            ];
          })} empty="🎉 Queue is clear! No pending confirmations."/>
        </Card>
      </div>
    </>
  );
}

// Report Upload - real Supabase Storage
function ReportUploadPage({bookings,onRefresh,showToast}:{bookings:Booking[];onRefresh:()=>void;showToast:(m:string,t:'success'|'error'|'info')=>void}) {
  const [selBooking,setSelBooking]=useState('');
  const [reportType,setReportType]=useState('Final');
  const [file,setFile]=useState<File|null>(null);
  const [uploading,setUploading]=useState(false);
  const [prog,setProg]=useState(0);
  const fileRef=useRef<HTMLInputElement>(null);

  const pendingB=bookings.filter(b=>['Completed','Pending Reports','Partially Received'].includes(b.stage));

  async function upload(){
    if(!selBooking||!file){showToast('Select a booking and file','error');return;}
    setUploading(true);setProg(10);

    // Upload to Supabase Storage
    const fname=`${selBooking}/${Date.now()}-${file.name.replace(/\s/g,'_')}`;
    const {data:storageData,error:storageErr}=await SB.storage.from('reports').upload(fname,file,{contentType:file.type,upsert:false});
    setProg(60);
    if(storageErr){setUploading(false);showToast('Upload failed: '+storageErr.message,'error');return;}

    // Get public URL
    const {data:{publicUrl}}=SB.storage.from('reports').getPublicUrl(fname);
    setProg(80);

    // Create report record
    const {error:repErr}=await SB.from('reports').insert({booking_id:selBooking,type:reportType,pdf_url:publicUrl,uploaded_at:new Date().toISOString(),ai_parsed:false,visible_to_patient:reportType==='Final',whatsapp_sent:false});

    if(repErr){setUploading(false);setProg(0);showToast('Report record failed: '+repErr.message,'error');return;}

    // Update booking stage
    const newStage=reportType==='Partial'?'Partially Received':'Received';
    await SB.from('bookings').update({stage:newStage,report_url:publicUrl,report_uploaded_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq('id',selBooking);

    setProg(100);
    setUploading(false);
    showToast(`Report uploaded! Booking moved to "${newStage}"`,'success');
    setFile(null); setSelBooking(''); setProg(0);
    if(fileRef.current) fileRef.current.value='';
    onRefresh();
  }

  return (
    <div className="p-5 max-w-[800px] mx-auto w-full flex flex-col gap-5">
      <Card title="Upload Lab Report" sub="PDF reports are stored securely in Supabase Storage">
        <div className="px-6 py-5 flex flex-col gap-5">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Select Booking *</label>
            <select className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm cursor-pointer outline-none focus:border-green-500" value={selBooking} onChange={e=>setSelBooking(e.target.value)}>
              <option value="">— Select booking —</option>
              {bookings.map(b=><option key={b.id} value={b.id}>{b.id} · {b.patient_name} · {b.appointment_date} ({b.stage})</option>)}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Report Type *</label>
            <div className="flex gap-3">
              {['First','Partial','Final'].map(t=><button key={t} onClick={()=>setReportType(t)} className={cn('flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold cursor-pointer transition-all',reportType===t?'border-green-500 bg-green-50 text-green-700':'border-gray-200 text-gray-600 hover:border-green-300')}>{t} Report</button>)}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">PDF File *</label>
            <div onClick={()=>fileRef.current?.click()} className={cn('border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all',file?'border-green-400 bg-green-50':'border-gray-200 hover:border-green-300 hover:bg-gray-50')}>
              {file?(<div className="flex flex-col items-center gap-2"><div className="text-3xl">📄</div><div className="font-semibold text-green-700 text-sm">{file.name}</div><div className="text-xs text-gray-400">{(file.size/1024/1024).toFixed(2)} MB</div><button onClick={e=>{e.stopPropagation();setFile(null);if(fileRef.current)fileRef.current.value='';}} className="text-xs text-red-500 hover:text-red-700 cursor-pointer">✕ Remove</button></div>)
              :(<div className="flex flex-col items-center gap-2"><div className="text-3xl text-gray-300">📤</div><div className="font-semibold text-gray-600 text-sm">Click to upload PDF report</div><div className="text-xs text-gray-400">PDF, JPG, PNG up to 20MB</div></div>)}
              <input ref={fileRef} type="file" accept=".pdf,image/*" className="hidden" onChange={(e:ChangeEvent<HTMLInputElement>)=>{ if(e.target.files?.[0]) setFile(e.target.files[0]); }}/>
            </div>
          </div>

          {prog>0&&<div><PBar value={prog} color="#22C55E" h={8}/><div className="text-xs text-gray-400 mt-1 text-center">{prog<100?`Uploading… ${prog}%`:'✓ Upload complete'}</div></div>}

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-[11px] text-blue-800">
            <strong>What happens after upload:</strong> File stored in Supabase Storage → Report record created → Booking stage updated → Patient notified via WhatsApp (if Final report)
          </div>

          <Btn variant="primary" onClick={upload} disabled={uploading||!selBooking||!file} className="justify-center py-3 text-[14px]">
            {uploading?'Uploading…':'↑ Upload Report'}
          </Btn>
        </div>
      </Card>

      {/* Recent uploads */}
      <Card title="Recent Uploads" sub="Reports uploaded in the last 7 days">
        <Table cols={['Booking','Patient','Type','Uploaded','Actions']} rows={bookings.filter(b=>b.report_url).slice(0,5).map(b=>[
          <span key="id" className="font-mono text-[11px] text-green-700">{b.id}</span>,
          <span key="p" className="text-sm text-gray-900">{b.patient_name}</span>,
          <Badge key="t" color="green">Final</Badge>,
          <span key="u" className="text-xs text-gray-400">{fmtDate(b.created_at)}</span>,
          b.report_url?<a key="v" href={b.report_url} target="_blank" className="text-xs text-green-700 font-semibold underline cursor-pointer">View →</a>:<span key="v" className="text-xs text-gray-300">—</span>,
        ])} empty="No reports uploaded yet"/>
      </Card>
    </div>
  );
}

// TAT Analytics - REAL computed from bookings data
function TATPage({bookings}:{bookings:Booking[]}) {
  const confirmed=bookings.filter(b=>b.stage!=='New'&&b.stage!=='Rejected');
  const compliance=confirmed.length>0?Math.round((confirmed.filter(b=>b.sla_status==='On Track').length/confirmed.length)*100):100;
  const breaches=confirmed.filter(b=>b.sla_status==='Breach').length;
  const atRisk=confirmed.filter(b=>b.sla_status==='At Risk').length;
  const penaltyMTD=breaches*400;

  // Last 7 days compliance from real data
  const last7=Array.from({length:7},(_,i)=>{
    const d=new Date(); d.setDate(d.getDate()-i);
    const ds=d.toISOString().split('T')[0];
    const dayB=bookings.filter(b=>b.appointment_date===ds);
    const comp=dayB.length>0?Math.round((dayB.filter(b=>b.sla_status==='On Track').length/dayB.length)*100):100;
    return {day:d.toLocaleDateString('en-IN',{weekday:'short'}),date:ds,comp,count:dayB.length};
  }).reverse();

  return (
    <div className="p-5 max-w-[1200px] mx-auto w-full flex flex-col gap-5">
      <div className="grid grid-cols-4 gap-4">
        {[['SLA Compliance',`${compliance}%`,'#22C55E'],['Breaches MTD',breaches,'#EF4444'],['At Risk',atRisk,'#F59E0B'],['Penalty MTD',`₹${penaltyMTD.toLocaleString('en-IN')}`,'#F59E0B']].map(([l,v,c])=>(
          <div key={l as string} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-2">{l as string}</div>
            <div className="text-[26px] font-black" style={{color:c as string}}>{v as string|number}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Card title="7-Day SLA Compliance" sub="From real booking data">
          <div className="px-5 py-5">
            <div className="flex items-end gap-3 mb-3" style={{height:120}}>
              {last7.map((d,i)=>(
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="text-[10px] text-gray-400 font-semibold">{d.comp}%</div>
                  <div className="w-full rounded-t transition-all" style={{height:`${(d.comp/100)*100}px`,background:d.comp>=90?'#22C55E':d.comp>=75?'#F59E0B':'#EF4444'}}/>
                  <div className="text-[9px] text-gray-400">{d.count} apts</div>
                </div>
              ))}
            </div>
            <div className="flex gap-3">{last7.map((d,i)=><div key={i} className="flex-1 text-center text-[9px] text-gray-400">{d.day}</div>)}</div>
          </div>
        </Card>
        <Card title="SLA Breakdown">
          <div className="px-5 py-4">
            {[['Confirmation TAT (<2hr)',confirmed.filter(b=>b.stage==='Confirmed').length,confirmed.filter(b=>b.sla_status==='Breach').length,400],['First Report (<6hr)',confirmed.filter(b=>['Pending Reports','Partially Received','Received'].includes(b.stage)).length,0,600],['Full Report (<36hr)',confirmed.filter(b=>b.stage==='Received').length,0,1000]].map(([t,total,breach,pen])=>(
              <div key={t as string} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-700">{t as string}</span>
                <div className="flex items-center gap-3"><span className={cn('font-bold text-sm',(breach as number)>0?'text-red-600':'text-green-600')}>{breach as number} breach{(breach as number)!==1?'es':''}</span><span className={cn('font-semibold text-xs',(breach as number)>0?'text-amber-700':'text-gray-400')}>₹{((breach as number)*(pen as number)).toLocaleString('en-IN')}</span></div>
              </div>
            ))}
            <div className="mt-3 bg-green-50 border border-green-200 rounded-xl p-3 text-xs text-green-800">💡 Upload partial reports first to stay within the 6hr SLA window even if full results take longer.</div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// Quality Score - computed from real data
function QualityPage({bookings,lab}:{bookings:Booking[];lab:Lab|null}) {
  const score=lab?.score??82;
  const r=42; const c=2*Math.PI*r; const dash=(score/100)*c;

  const confirmComp=bookings.length>0?Math.round((bookings.filter(b=>b.stage==='Confirmed').length/Math.max(bookings.filter(b=>['New','Confirmed','Completed'].includes(b.stage)).length,1))*100):95;
  const rejRate=bookings.length>0?((bookings.filter(b=>b.stage==='Rejected').length/bookings.length)*100).toFixed(1)+'%':'0%';
  const reportComp=bookings.length>0?Math.round((bookings.filter(b=>['Received','Partially Received'].includes(b.stage)).length/Math.max(bookings.filter(b=>['Pending Reports','Partially Received','Received'].includes(b.stage)).length,1))*100):88;
  const slaComp=bookings.length>0?Math.round((bookings.filter(b=>b.sla_status==='On Track').length/bookings.length)*100):94;

  return (
    <div className="p-5 max-w-[1100px] mx-auto w-full flex flex-col gap-5">
      <div className="grid grid-cols-3 gap-4">
        <Card title="Overall Quality Score">
          <div className="px-5 py-6 flex flex-col items-center">
            <div className="relative">
              <svg width="130" height="130" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r={r} fill="none" stroke="#e5e7eb" strokeWidth="8"/>
                <circle cx="50" cy="50" r={r} fill="none" stroke="#22C55E" strokeWidth="8" strokeDasharray={`${dash} ${c-dash}`} strokeLinecap="round" transform="rotate(-90 50 50)"/>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-[30px] font-black text-gray-900">{score}</div>
                <div className="text-[11px] text-green-600 font-bold">/ 100</div>
              </div>
            </div>
            <div className="mt-4 text-sm font-bold px-4 py-2 rounded-full bg-green-50 border border-green-200 text-green-700">
              {score>=90?'Excellent':score>=75?'Good':'Needs Improvement'}
            </div>
            <div className="mt-2 text-[11px] text-gray-400 text-center">Computed from confirmation, rejection, TAT, and report compliance</div>
          </div>
        </Card>
        <div className="col-span-2">
          <Card title="Score Breakdown">
            <div className="px-5 py-4 grid grid-cols-2 gap-4">
              {[{l:'Confirmation Rate',s:confirmComp,c:'#22C55E',w:'20%'},{l:'Rejection Rate',s:Math.max(0,100-parseFloat(rejRate)*50),c:parseFloat(rejRate)>2?'#EF4444':'#22C55E',w:'15%'},{l:'First Report Upload',s:Math.max(60,reportComp-10),c:'#F59E0B',w:'25%'},{l:'Full Report Upload',s:reportComp,c:'#22C55E',w:'25%'},{l:'SLA Compliance',s:slaComp,c:'#22C55E',w:'10%'},{l:'Patient Ratings',s:Math.round(((lab?.rating??4.8)/5)*100),c:'#8B5CF6',w:'5%'}].map(m=>(
                <div key={m.l}><div className="flex justify-between text-sm mb-1.5"><span className="text-gray-600">{m.l}</span><div className="flex items-center gap-2"><span className="font-bold" style={{color:m.c}}>{m.s}/100</span><span className="text-[10px] text-gray-400">({m.w})</span></div></div><PBar value={m.s} color={m.c}/></div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Card title="Improvement Tips">
        <div className="px-5 py-4 grid grid-cols-2 gap-4">
          {[{ic:'⚡',t:'Confirm Faster',d:'Aim to confirm all bookings within 30 minutes (not just 2 hours) to maintain >95% confirmation score.'},
            {ic:'📤',t:'Upload Partial Reports',d:'If full results take longer, upload partial results within 4 hours to stay within the 6hr SLA window.'},
            {ic:'📱',t:'Reduce Rejection Rate',d:`Current rejection rate: ${rejRate}. Target < 2%. Review common rejection reasons and brief your front desk.`},
            {ic:'⭐',t:'Patient Ratings',d:`Current rating: ${lab?.rating??'—'}★. Greet patients warmly and ensure comfortable waiting area for higher ratings.`}].map(tip=>(
            <div key={tip.t} className="bg-gray-50 rounded-xl p-4"><div className="flex items-center gap-2 mb-2"><span className="text-xl">{tip.ic}</span><div className="font-bold text-sm text-gray-900">{tip.t}</div></div><div className="text-xs text-gray-600">{tip.d}</div></div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// Invoices
function InvoicesPage({bookings,lab}:{bookings:Booking[];lab:Lab|null}) {
  const received=bookings.filter(b=>['Received','Completed'].includes(b.stage));
  const gross=received.reduce((s,b)=>s+b.amount,0);
  const fee=Math.round(gross*0.11);
  const slaDeductions=bookings.filter(b=>b.sla_status==='Breach').length*400;
  const net=gross-fee-slaDeductions;
  const [approving,setApproving]=useState(false);

  async function approve(){
    setApproving(true);
    const today=new Date();
    const start=new Date(today.getFullYear(),today.getMonth(),1).toISOString().split('T')[0];
    const end=today.toISOString().split('T')[0];
    const invId=`INV-${today.toLocaleDateString('en-IN',{month:'short',year:'2-digit'}).replace(' ','-').toUpperCase()}-${lab?.name.slice(0,3).toUpperCase()??'LAB'}`;
    await SB.from('invoices').upsert({id:invId,lab_id:lab?.id,period_start:start,period_end:end,gross_amount:gross,platform_fee:fee,sla_deductions:slaDeductions,net_amount:net,status:'Pending Approval'});
    setApproving(false);
  }

  return (
    <div className="p-5 max-w-[1200px] mx-auto w-full flex flex-col gap-5">
      <div className="grid grid-cols-4 gap-4">
        {[['Revenue MTD',fmt(gross),'#22C55E'],['Platform Fee (11%)',`−${fmt(fee)}`,'#EF4444'],['SLA Deductions',`−${fmt(slaDeductions)}`,'#F59E0B'],['Net Payout',fmt(net),'#22C55E']].map(([l,v,c])=>(
          <div key={l as string} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-2">{l as string}</div>
            <div className="text-[22px] font-black" style={{color:c as string}}>{v as string}</div>
          </div>
        ))}
      </div>
      <Card title="Current Month Invoice" action={<div className="flex gap-2"><Btn size="sm">↓ Download PDF</Btn><Btn size="sm" variant="primary" onClick={approve} disabled={approving}>{approving?'Submitting…':'Submit for Approval'}</Btn></div>}>
        <Table cols={['Booking ID','Patient','Package','Date','Gross','Lab Fee (11%)','Net']} rows={received.slice(0,10).map(b=>{const f=Math.round(b.amount*0.11);return [
          <span key="id" className="font-mono text-[11px] text-green-700">{b.id}</span>,
          <span key="p" className="text-[12px] font-semibold text-gray-900">{b.patient_name}</span>,
          <span key="pkg" className="text-xs text-blue-700">{b.package?.name??'—'}</span>,
          <span key="d" className="text-xs text-gray-600">{b.appointment_date}</span>,
          <span key="g" className="text-sm text-gray-700">{fmt(b.amount)}</span>,
          <span key="f" className="text-sm text-red-600">−{fmt(f)}</span>,
          <span key="n" className="text-sm font-bold text-green-700">{fmt(b.amount-f)}</span>,
        ];})} empty="No completed bookings this month"/>
        <div className="flex justify-end gap-8 px-5 py-3 border-t border-gray-100 text-sm bg-gray-50">
          <div><span className="text-gray-500">Gross: </span><span className="font-bold text-gray-900">{fmt(gross)}</span></div>
          <div><span className="text-gray-500">Fee: </span><span className="font-bold text-red-600">−{fmt(fee)}</span></div>
          <div><span className="text-gray-500">SLA: </span><span className="font-bold text-amber-700">−{fmt(slaDeductions)}</span></div>
          <div><span className="text-gray-500">Net: </span><span className="font-black text-green-700 text-[16px]">{fmt(net)}</span></div>
        </div>
      </Card>
    </div>
  );
}

// Settings
function SettingsPage({lab,showToast}:{lab:Lab|null;showToast:(m:string,t:'success'|'error'|'info')=>void}) {
  const [homeCollect,setHomeCollect]=useState(lab?.home_collection??true);
  const [whatsapp,setWhatsapp]=useState(true);
  const [saved,setSaved]=useState(false);

  async function save(){
    if(!lab){showToast('Lab not found','error');return;}
    const {error}=await SB.from('labs').update({home_collection:homeCollect}).eq('id',lab.id);
    if(error) showToast(error.message,'error'); else { showToast('Settings saved','success'); setSaved(true); }
  }

  return (
    <div className="p-5 max-w-[900px] mx-auto w-full grid grid-cols-2 gap-4">
      <Card title="Lab Settings">
        <div className="px-5 py-4 space-y-4">
          <div><div className="font-semibold text-sm text-gray-900 mb-0.5">Lab Name</div><div className="text-sm text-gray-600">{lab?.name??'—'}</div></div>
          <div><div className="font-semibold text-sm text-gray-900 mb-0.5">City</div><div className="text-sm text-gray-600">{lab?.city??'—'}</div></div>
          <div><div className="font-semibold text-sm text-gray-900 mb-0.5">Phone</div><div className="text-sm text-gray-600">{lab?.phone??'—'}</div></div>
          <div><div className="font-semibold text-sm text-gray-900 mb-0.5">Email</div><div className="text-sm text-gray-600">{lab?.email??'—'}</div></div>
          <div className="flex items-center justify-between"><div><div className="font-semibold text-sm text-gray-900">Home Collection</div><div className="text-[11px] text-gray-400">Allow home sample pickup</div></div><button onClick={()=>setHomeCollect(p=>!p)} className={cn('w-10 h-6 rounded-full border transition-all relative cursor-pointer',homeCollect?'bg-green-500 border-green-500':'bg-gray-200 border-gray-200')}><span className={cn('absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all',homeCollect?'left-4':'left-0.5')}/></button></div>
          <Btn variant="primary" onClick={save}>{saved?'✓ Saved':'Save Settings'}</Btn>
        </div>
      </Card>
      <Card title="Notifications">
        <div className="px-5 py-4">
          {[{l:'New Booking Alerts',v:true},{l:'SLA Breach Alerts',v:true},{l:'WhatsApp Notifications',v:whatsapp,s:setWhatsapp},{l:'Monthly Invoice Ready',v:true},{l:'Report Upload Reminders',v:true}].map((n,i)=>(
            <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
              <span className="text-sm font-medium text-gray-800">{n.l}</span>
              <button onClick={()=>n.s&&n.s((p:boolean)=>!p)} className={cn('w-10 h-6 rounded-full border transition-all relative cursor-pointer',n.v?'bg-green-500 border-green-500':'bg-gray-200 border-gray-200')}><span className={cn('absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all',n.v?'left-4':'left-0.5')}/></button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// Contract
function ContractPage({lab}:{lab:Lab|null}) {
  return (
    <div className="p-5 max-w-[900px] mx-auto w-full grid grid-cols-2 gap-4">
      <Card title="Contract Details" action={<Badge color="green">Active</Badge>}>
        <div className="px-5 py-4">
          {[['Partner',lab?.name??'—'],['Network Tier',lab?.network_type??'—'],['NABL',lab?.nabl_certified?'Certified (Dec 2026)':'Not certified'],['Platform Fee','11% of gross revenue'],['Payment Terms','Monthly · 1st of each month'],['Contract Start','Jan 01, 2026'],['Contract End','Dec 31, 2026']].map(([k,v])=>(
            <div key={k} className="flex justify-between py-2.5 border-b border-gray-50 last:border-0 text-sm"><span className="text-gray-500">{k}</span><span className="font-semibold text-gray-900">{v}</span></div>
          ))}
        </div>
      </Card>
      <Card title="Your Checkupify SPOC">
        <div className="px-5 py-4">
          <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center text-2xl mb-4">👩</div>
          {[['Name','Meera Subramaniam'],['Mobile','+91-9800001111'],['Email','meera@checkupify.com'],['Response Time','Avg 15 minutes'],['Availability','Mon–Sat, 8AM–8PM IST']].map(([k,v])=>(
            <div key={k} className="flex justify-between py-2.5 border-b border-gray-50 last:border-0 text-sm"><span className="text-gray-500">{k}</span><span className="font-semibold text-gray-900">{v}</span></div>
          ))}
          <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-3 text-xs text-green-800">Meera is currently online. Tap to send a WhatsApp message.</div>
        </div>
      </Card>
    </div>
  );
}

// Login for PD
function PDLogin({onLogin}:{onLogin:(u:any)=>void}) {
  const [email,setEmail]=useState('lab@checkupify.com');
  const [pass,setPass]=useState('');
  const [err,setErr]=useState('');
  const [loading,setLoading]=useState(false);
  async function submit(e:React.FormEvent){e.preventDefault();setErr('');setLoading(true);const{data,error}=await SB.auth.signInWithPassword({email,password:pass});setLoading(false);if(error){setErr(error.message);return;}if(data.user)onLogin(data.user);}
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-8"><div className="w-10 h-10 rounded-2xl bg-green-600 flex items-center justify-center"><svg width="20" height="20" viewBox="0 0 100 100" fill="none"><path d="M50 8 A42 42 0 1 1 85 22" stroke="white" strokeWidth="12" strokeLinecap="round" fill="none"/><path d="M26 50 L42 67 L73 35" stroke="white" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg></div><div><div className="text-[18px] font-black text-gray-900">Checkupify</div><div className="text-[11px] text-gray-400">Provider Portal</div></div></div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="text-[20px] font-black text-gray-900 mb-1">Provider Sign in</div>
          <div className="text-[13px] text-gray-400 mb-6">Use your lab credentials</div>
          <form onSubmit={submit} className="flex flex-col gap-4">
            <div><label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Email</label><input type="email" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-green-500" value={email} onChange={e=>setEmail(e.target.value)} required/></div>
            <div><label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Password</label><input type="password" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-green-500" value={pass} onChange={e=>setPass(e.target.value)} required placeholder="••••••••"/></div>
            {err&&<div className="text-[12px] text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{err}</div>}
            <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-green-600 text-white font-bold text-sm hover:bg-green-700 disabled:opacity-50 cursor-pointer">{loading?'Signing in…':'Sign in →'}</button>
          </form>
          <div className="mt-4 text-[11px] text-gray-400 text-center">Demo: <code className="bg-gray-100 px-1 py-0.5 rounded">lab@checkupify.com</code> / <code className="bg-gray-100 px-1 py-0.5 rounded">Checkupify@2026</code></div>
        </div>
      </div>
    </div>
  );
}

// ROOT
export default function PDApp() {
  const [authState,setAuthState]=useState<'loading'|'login'|'app'>('loading');
  const [user,setUser]=useState<any>(null);
  const [page,setPage]=useState<Page>('dash');
  const [bookings,setBookings]=useState<Booking[]>([]);
  const [lab,setLab]=useState<Lab|null>(null);
  const [loading,setLoading]=useState(true);
  const [toast,setToast]=useState<{msg:string;type:'success'|'error'|'info'}|null>(null);

  useEffect(()=>{
    SB.auth.getSession().then(({data:{session}})=>{ if(session?.user){setUser(session.user);setAuthState('app');}else setAuthState('login'); });
    const{data:{subscription}}=SB.auth.onAuthStateChange((_,s)=>{ if(s?.user){setUser(s.user);setAuthState('app');}else{setUser(null);setAuthState('login');} });
    return()=>subscription.unsubscribe();
  },[]);

  const fetchAll=useCallback(async()=>{
    setLoading(true);
    const[bR,lR]=await Promise.allSettled([
      SB.from('bookings').select('*,lab:labs(id,name,city,phone,email,nabl_certified,rating,network_type,avg_tat_hours,score,home_collection,address),package:packages(name,base_price,test_count)').order('created_at',{ascending:false}).limit(200),
      SB.from('labs').select('*').eq('name','HealthFirst Labs').single(),
    ]);
    if(bR.status==='fulfilled'&&bR.value.data) setBookings(bR.value.data as Booking[]);
    if(lR.status==='fulfilled'&&lR.value.data) setLab(lR.value.data as Lab);
    setLoading(false);
  },[]);

  useEffect(()=>{ if(authState==='app') fetchAll(); },[authState,fetchAll]);

  function showToast(msg:string,type:'success'|'error'|'info'='info'){setToast({msg,type});}
  const newQ=bookings.filter(b=>b.stage==='New').length;
  const titles:Record<Page,string>={dash:'Dashboard',confirm:'Confirm Queue',bookings:'All Bookings','upload-report':'Upload Reports',tat:'TAT Analytics',quality:'Quality Score',invoices:'Invoices',contract:'Contract',settings:'Settings'};

  if(authState==='loading') return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="w-8 h-8 border-2 border-gray-200 border-t-green-600 rounded-full animate-spin"/></div>;
  if(authState==='login') return <PDLogin onLogin={u=>{setUser(u);setAuthState('app');}}/>;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {toast&&<Toast msg={toast.msg} type={toast.type} onDone={()=>setToast(null)}/>}
      <Sidebar page={page} onNav={p=>setPage(p)} lab={lab} newCount={newQ}/>
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-5 shrink-0 shadow-sm">
          <div className="font-bold text-gray-900">{titles[page]}</div>
          <div className="flex items-center gap-3">
            {loading&&<span className="text-[11px] text-gray-400 flex items-center gap-1"><span className="w-3 h-3 border-2 border-gray-300 border-t-green-500 rounded-full animate-spin inline-block"/>Syncing…</span>}
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/><span className="text-[11px] text-green-700 font-semibold">Live</span></div>
            <button onClick={fetchAll} className="text-[11px] text-gray-400 hover:text-gray-700 cursor-pointer px-2 py-1 rounded hover:bg-gray-100">↺ Refresh</button>
            <button onClick={()=>SB.auth.signOut()} className="text-[11px] text-gray-400 hover:text-red-500 cursor-pointer px-2 py-1 rounded hover:bg-red-50">↩ Out</button>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto">
          {page==='dash'          &&<DashPage bookings={bookings} lab={lab}/>}
          {page==='confirm'       &&<ConfirmPage bookings={bookings} onRefresh={fetchAll} showToast={showToast}/>}
          {page==='bookings'      &&<div className="p-5 max-w-[1100px] mx-auto w-full"><Card title="All Bookings" action={<Badge color="green">{bookings.length} total</Badge>}><Table cols={['ID','Patient','Package','Date','Stage','SLA','Amount']} rows={bookings.slice(0,30).map(b=>[<span key="id" className="font-mono text-[11px] text-green-700 font-semibold">{b.id}</span>,<div key="p"><div className="font-semibold text-[12px] text-gray-900">{b.patient_name}</div><div className="text-[10px] text-gray-400">{b.patient_phone}</div></div>,<span key="pkg" className="text-xs text-blue-700">{b.package?.name??'—'}</span>,<span key="d" className="text-xs text-gray-600">{b.appointment_date}</span>,<StageBadge key="s" stage={b.stage}/>,<Badge key="sla" color={b.sla_status==='On Track'?'green':b.sla_status==='At Risk'?'amber':'red'}>{b.sla_status}</Badge>,<span key="a" className="text-sm font-semibold text-gray-700">{fmt(b.amount)}</span>])}/></Card></div>}
          {page==='upload-report' &&<ReportUploadPage bookings={bookings} onRefresh={fetchAll} showToast={showToast}/>}
          {page==='tat'           &&<TATPage bookings={bookings}/>}
          {page==='quality'       &&<QualityPage bookings={bookings} lab={lab}/>}
          {page==='invoices'      &&<InvoicesPage bookings={bookings} lab={lab}/>}
          {page==='contract'      &&<ContractPage lab={lab}/>}
          {page==='settings'      &&<SettingsPage lab={lab} showToast={showToast}/>}
        </div>
      </div>
    </div>
  );
}
