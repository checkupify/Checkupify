'use client';
import { useState, useEffect, type ReactNode } from 'react';
import { createClient } from '@supabase/supabase-js';

const SB = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

type Page = 'staff'|'attendance'|'leave'|'salary'|'invite';
interface Profile { id:string;full_name:string;role:string;phone:string|null;department:string|null;designation:string|null;employee_id:string|null;is_active:boolean;created_at:string;avatar_url:string|null; }
interface HRRecord { id:string;user_id:string;date_of_joining:string|null;date_of_birth:string|null;blood_group:string|null;base_salary:number|null;emergency_contact_name:string|null;emergency_contact_phone:string|null; }
interface Attendance { id:string;user_id:string;date:string;check_in:string|null;check_out:string|null;status:string;notes:string|null; }
interface Leave { id:string;user_id:string;leave_type:string;from_date:string;to_date:string;days:number;reason:string|null;status:string;created_at:string; }

function cn(...c:(string|false|null|undefined)[]) { return c.filter(Boolean).join(' '); }
function fmtDate(d:string) { return d?new Date(d).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}):'—'; }
function fmtTime(d:string|null) { return d?new Date(d).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'}):'—'; }

function Badge({children,color='gray'}:{children:ReactNode;color?:string}) {
  const c:Record<string,string>={green:'bg-green-100 text-green-800',amber:'bg-amber-100 text-amber-800',red:'bg-red-100 text-red-800',blue:'bg-blue-100 text-blue-800',purple:'bg-purple-100 text-purple-800',gray:'bg-gray-100 text-gray-700'};
  return <span className={cn('inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold',c[color]??c.gray)}>{children}</span>;
}

function Toast({msg,type,onDone}:{msg:string;type:'success'|'error';onDone:()=>void}) {
  useEffect(()=>{ const t=setTimeout(onDone,3000); return ()=>clearTimeout(t); },[onDone]);
  return <div className={cn('fixed bottom-5 right-5 z-[200] px-4 py-3 rounded-xl shadow-lg text-sm font-medium',type==='success'?'bg-green-50 border border-green-200 text-green-800':'bg-red-50 border border-red-200 text-red-800')}>{msg}</div>;
}

function Card({title,children,action,sub}:{title:string;children:ReactNode;action?:ReactNode;sub?:string}) {
  return <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"><div className="flex items-center justify-between px-5 py-4 border-b border-gray-100"><div><div className="font-bold text-gray-900 text-[14px]">{title}</div>{sub&&<div className="text-[10px] text-gray-400 mt-0.5">{sub}</div>}</div>{action}</div>{children}</div>;
}

function Table({cols,rows,empty='No data'}:{cols:string[];rows:ReactNode[][];empty?:string}) {
  return <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-gray-100">{cols.map(c=><th key={c} className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50/50 whitespace-nowrap">{c}</th>)}</tr></thead><tbody className="divide-y divide-gray-50">{rows.length===0?<tr><td colSpan={cols.length} className="px-4 py-12 text-center text-gray-400">{empty}</td></tr>:rows.map((row,i)=><tr key={i} className="hover:bg-gray-50/60">{row.map((cell,j)=><td key={j} className="px-4 py-3">{cell}</td>)}</tr>)}</tbody></table></div>;
}

function Avatar({name,size='md'}:{name:string;size?:'sm'|'md'|'lg'}) {
  const colors=['#22C55E','#3B82F6','#8B5CF6','#F59E0B','#EF4444','#14B8A6'];
  const color=colors[name.charCodeAt(0)%colors.length];
  const s={sm:'w-8 h-8 text-[12px]',md:'w-10 h-10 text-[14px]',lg:'w-14 h-14 text-[18px]'};
  return <div className={cn('rounded-full flex items-center justify-center font-black text-white shrink-0',s[size])} style={{background:color}}>{name[0]?.toUpperCase()}</div>;
}

// Sidebar
const NAV=[{id:'staff',l:'Staff Directory',ic:'👥'},{id:'attendance',l:'Attendance',ic:'📊'},{id:'leave',l:'Leave Requests',ic:'🏖️'},{id:'salary',l:'Salary Info',ic:'💰'},{id:'invite',l:'Invite Staff',ic:'✉️'}] as const;

function Sidebar({page,onNav,pendingLeaves}:{page:Page;onNav:(p:Page)=>void;pendingLeaves:number}) {
  return (
    <aside className="w-56 shrink-0 bg-white border-r border-gray-100 flex flex-col h-screen sticky top-0 shadow-sm z-20">
      <div className="px-4 py-5 border-b border-gray-100">
        <img src="/logo.png" alt="Checkupify" className="h-8 mb-1"/>
        <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-2">HR & Staff Portal</div>
      </div>
      <nav className="flex-1 py-3 px-3">
        {NAV.map(n=><button key={n.id} onClick={()=>onNav(n.id as Page)} className={cn('w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[12.5px] font-medium transition-all mb-0.5 cursor-pointer text-left',page===n.id?'bg-green-50 text-green-700 font-semibold':'text-gray-600 hover:bg-gray-50')}><span className="text-base w-5 text-center shrink-0">{n.ic}</span><span className="flex-1">{n.l}</span>{n.id==='leave'&&pendingLeaves>0&&<span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-amber-500 text-white">{pendingLeaves}</span>}</button>)}
      </nav>
      <div className="px-4 py-3 border-t border-gray-100 text-[10px] text-gray-400 text-center">Checkupify HR · Live</div>
    </aside>
  );
}

// Staff Directory
function StaffPage({profiles,hrRecords}:{profiles:Profile[];hrRecords:HRRecord[]}) {
  const [search,setSearch]=useState('');
  const [dept,setDept]=useState('All');
  const depts=['All',...new Set(profiles.map(p=>p.department).filter(Boolean))];
  const filtered=profiles.filter(p=>(dept==='All'||p.department===dept)&&(!search||p.full_name.toLowerCase().includes(search.toLowerCase())||p.employee_id?.toLowerCase().includes(search.toLowerCase())||false));
  const ROLE_C:Record<string,string>={CRM_OPS:'blue',PROVIDER:'teal',SUPER_ADMIN:'red',ADMIN:'purple',PATIENT:'gray'};

  return (
    <div className="p-5 max-w-[1200px] mx-auto w-full">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        {[['Total Staff',profiles.length,'#3B82F6'],['Active',profiles.filter(p=>p.is_active).length,'#22C55E'],['Departments',depts.length-1,'#8B5CF6'],['Inactive',profiles.filter(p=>!p.is_active).length,'#F59E0B']].map(([l,v,c])=>(
          <div key={l as string} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <div className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-1">{l as string}</div>
            <div className="text-[26px] font-black" style={{color:c as string}}>{v as number}</div>
          </div>
        ))}
      </div>

      <Card title="Staff Directory" sub={`${filtered.length} members`} action={
        <div className="flex gap-2">
          <div className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-1.5 bg-gray-50">
            <span className="text-gray-400 text-xs">⌕</span>
            <input className="bg-transparent text-sm outline-none w-36 placeholder-gray-300" placeholder="Search name or ID…" value={search} onChange={e=>setSearch(e.target.value)}/>
          </div>
          <select className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs cursor-pointer outline-none" value={dept} onChange={e=>setDept(e.target.value)}>
            {depts.map(d=><option key={d as string} value={d as string}>{d as string}</option>)}
          </select>
        </div>
      }>
        <Table cols={['Employee','ID','Department','Designation','Role','Phone','Joined','Status']} rows={filtered.map(p=>{
          const hr=hrRecords.find(h=>h.user_id===p.id);
          return [
            <div key="n" className="flex items-center gap-3"><Avatar name={p.full_name}/><div><div className="font-semibold text-sm text-gray-900">{p.full_name}</div>{hr?.date_of_birth&&<div className="text-[10px] text-gray-400">{fmtDate(hr.date_of_birth)}</div>}</div></div>,
            <span key="id" className="font-mono text-[11px] text-gray-500 font-semibold">{p.employee_id??'—'}</span>,
            <span key="dept" className="text-xs text-gray-600">{p.department??'—'}</span>,
            <span key="des" className="text-xs text-gray-600">{p.designation??'—'}</span>,
            <Badge key="r" color={ROLE_C[p.role]??'gray'}>{p.role}</Badge>,
            <span key="ph" className="text-xs text-gray-600">{p.phone??'—'}</span>,
            <span key="j" className="text-xs text-gray-400">{hr?.date_of_joining?fmtDate(hr.date_of_joining):'—'}</span>,
            <Badge key="s" color={p.is_active?'green':'gray'}>{p.is_active?'Active':'Inactive'}</Badge>,
          ];
        })} empty="No staff found"/>
      </Card>
    </div>
  );
}

// Attendance
function AttendancePage({attendance,profiles}:{attendance:Attendance[];profiles:Profile[]}) {
  const [week,setWeek]=useState(0);
  const today=new Date();
  const days=Array.from({length:7},(_,i)=>{ const d=new Date(today); d.setDate(d.getDate()-6+i-week*7); return d.toISOString().split('T')[0]; });
  
  const totals={present:attendance.filter(a=>a.status==='Present').length,late:attendance.filter(a=>a.status==='Late').length,absent:attendance.filter(a=>a.status==='Absent').length};
  const presentPct=attendance.length>0?Math.round((totals.present/attendance.length)*100):0;

  return (
    <div className="p-5 max-w-[1200px] mx-auto w-full">
      <div className="grid grid-cols-4 gap-4 mb-5">
        {[['Present',totals.present,'#22C55E'],['Late',totals.late,'#F59E0B'],['Absent',totals.absent,'#EF4444'],['Compliance',presentPct+'%','#3B82F6']].map(([l,v,c])=>(
          <div key={l as string} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <div className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-1">{l as string}</div>
            <div className="text-[26px] font-black" style={{color:c as string}}>{v as string|number}</div>
          </div>
        ))}
      </div>

      <Card title="Attendance Register" action={
        <div className="flex gap-2 items-center">
          <button onClick={()=>setWeek(w=>w+1)} className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-50 text-sm">←</button>
          <span className="text-xs text-gray-500">Week {week===0?'(Current)':week===1?'(Last)':'-'+week}</span>
          {week>0&&<button onClick={()=>setWeek(w=>w-1)} className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-50 text-sm">→</button>}
        </div>
      }>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">Employee</th>
              {days.map(d=><th key={d} className="text-center px-2 py-2.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">{new Date(d).toLocaleDateString('en-IN',{weekday:'short',day:'numeric'})}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {profiles.slice(0,5).map(p=>(
                <tr key={p.id} className="hover:bg-gray-50/60">
                  <td className="px-4 py-3"><div className="flex items-center gap-2"><Avatar name={p.full_name} size="sm"/><span className="font-semibold text-sm text-gray-900">{p.full_name}</span></div></td>
                  {days.map(d=>{
                    const rec=attendance.find(a=>a.user_id===p.id&&a.date===d);
                    return <td key={d} className="text-center px-2 py-3">
                      {rec?(
                        <div>
                          <div className={cn('text-[11px] font-bold',rec.status==='Present'?'text-green-600':rec.status==='Late'?'text-amber-600':'text-red-600')}>{rec.status[0]}</div>
                          {rec.check_in&&<div className="text-[9px] text-gray-400">{fmtTime(rec.check_in)}</div>}
                        </div>
                      ):<span className="text-gray-200 text-xs">—</span>}
                    </td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex gap-4 px-5 py-3 border-t border-gray-50 text-[11px] text-gray-400">
          <span><span className="font-bold text-green-600">P</span> Present</span>
          <span><span className="font-bold text-amber-600">L</span> Late</span>
          <span><span className="font-bold text-red-600">A</span> Absent</span>
        </div>
      </Card>
    </div>
  );
}

// Leave Management
function LeavePage({leaves,profiles,onRefresh,showToast}:{leaves:Leave[];profiles:Profile[];onRefresh:()=>void;showToast:(m:string,t:'success'|'error')=>void}) {
  const [filter,setFilter]=useState('Pending');
  const filtered=leaves.filter(l=>filter==='All'||l.status===filter);
  const name=(uid:string)=>profiles.find(p=>p.id===uid)?.full_name??'Unknown';

  async function decide(id:string,status:'Approved'|'Rejected'){
    const{error}=await SB.from('leave_requests').update({status,approved_at:new Date().toISOString()}).eq('id',id);
    if(error) showToast(error.message,'error'); else { showToast(status==='Approved'?'Leave approved':'Leave rejected',status==='Approved'?'success':'error'); onRefresh(); }
  }

  return (
    <div className="p-5 max-w-[1200px] mx-auto w-full">
      <div className="grid grid-cols-3 gap-4 mb-5">
        {[['Pending',leaves.filter(l=>l.status==='Pending').length,'#F59E0B'],['Approved',leaves.filter(l=>l.status==='Approved').length,'#22C55E'],['Rejected',leaves.filter(l=>l.status==='Rejected').length,'#EF4444']].map(([l,v,c])=>(
          <button key={l as string} onClick={()=>setFilter(l as string)} className={cn('bg-white rounded-2xl border p-4 shadow-sm text-left transition-all cursor-pointer',filter===l?'border-green-400 bg-green-50':'border-gray-100')}>
            <div className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-1">{l as string}</div>
            <div className="text-[26px] font-black" style={{color:c as string}}>{v as number}</div>
          </button>
        ))}
      </div>
      <Card title="Leave Requests" action={<button onClick={()=>setFilter('All')} className="text-xs text-green-700 font-semibold cursor-pointer">Show All</button>}>
        <Table cols={['Employee','Type','From','To','Days','Reason','Status','Actions']} rows={filtered.map(l=>[
          <div key="n" className="flex items-center gap-2"><Avatar name={name(l.user_id)} size="sm"/><span className="font-semibold text-sm">{name(l.user_id)}</span></div>,
          <Badge key="t" color="blue">{l.leave_type}</Badge>,
          <span key="f" className="text-xs text-gray-600">{fmtDate(l.from_date)}</span>,
          <span key="to" className="text-xs text-gray-600">{fmtDate(l.to_date)}</span>,
          <span key="d" className="text-sm font-bold text-gray-900">{l.days}</span>,
          <span key="r" className="text-xs text-gray-500 max-w-[120px] truncate block">{l.reason??'—'}</span>,
          <Badge key="s" color={l.status==='Approved'?'green':l.status==='Pending'?'amber':'red'}>{l.status}</Badge>,
          <div key="act" className="flex gap-1.5">
            {l.status==='Pending'&&<>
              <button onClick={()=>decide(l.id,'Approved')} className="px-2.5 py-1 bg-green-100 text-green-700 rounded-lg text-[11px] font-bold cursor-pointer hover:bg-green-200 transition-all">✓ Approve</button>
              <button onClick={()=>decide(l.id,'Rejected')} className="px-2.5 py-1 bg-red-100 text-red-700 rounded-lg text-[11px] font-bold cursor-pointer hover:bg-red-200 transition-all">✕ Reject</button>
            </>}
          </div>,
        ])} empty="No leave requests"/>
      </Card>
    </div>
  );
}

// Salary
function SalaryPage({profiles,hrRecords}:{profiles:Profile[];hrRecords:HRRecord[]}) {
  const totalPayroll=hrRecords.reduce((s,h)=>s+(h.base_salary??0),0);
  return (
    <div className="p-5 max-w-[1200px] mx-auto w-full">
      <div className="grid grid-cols-3 gap-4 mb-5">
        {[['Total Monthly Payroll',`₹${totalPayroll.toLocaleString('en-IN')}`,'#22C55E'],['Avg Salary',`₹${hrRecords.length>0?Math.round(totalPayroll/hrRecords.length).toLocaleString('en-IN'):0}`,'#3B82F6'],['Employees',profiles.filter(p=>p.is_active).length,'#8B5CF6']].map(([l,v,c])=>(
          <div key={l as string} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="text-[10px] font-bold uppercase tracking-wide text-gray-400 mb-2">{l as string}</div>
            <div className="text-[24px] font-black" style={{color:c as string}}>{v as string|number}</div>
          </div>
        ))}
      </div>
      <Card title="Salary Register" sub="Monthly base salary — click to expand">
        <Table cols={['Employee','Employee ID','Department','Designation','Base Salary','Status']} rows={profiles.map(p=>{
          const hr=hrRecords.find(h=>h.user_id===p.id);
          return [
            <div key="n" className="flex items-center gap-3"><Avatar name={p.full_name}/><div><div className="font-semibold text-sm text-gray-900">{p.full_name}</div>{hr?.blood_group&&<div className="text-[10px] text-gray-400">Blood: {hr.blood_group}</div>}</div></div>,
            <span key="id" className="font-mono text-[11px] text-gray-500">{p.employee_id??'—'}</span>,
            <span key="dept" className="text-xs text-gray-600">{p.department??'—'}</span>,
            <span key="des" className="text-xs text-gray-600">{p.designation??'—'}</span>,
            <span key="s" className="text-sm font-black text-green-700">{hr?.base_salary?`₹${hr.base_salary.toLocaleString('en-IN')}`:'—'}</span>,
            <Badge key="act" color={p.is_active?'green':'gray'}>{p.is_active?'Active':'Inactive'}</Badge>,
          ];
        })} empty="No salary data"/>
      </Card>
    </div>
  );
}

// Invite
function InvitePage({showToast}:{showToast:(m:string,t:'success'|'error')=>void}) {
  const [form,setForm]=useState({full_name:'',email:'',role:'CRM_OPS',department:''});
  const [saving,setSaving]=useState(false);
  const [invites,setInvites]=useState<any[]>([]);

  useEffect(()=>{ SB.from('staff_invitations').select('*').order('created_at',{ascending:false}).limit(20).then(({data})=>{ if(data) setInvites(data); }); },[]);

  async function invite(){
    if(!form.full_name||!form.email){showToast('Name and email required','error');return;}
    setSaving(true);
    const{error}=await SB.from('staff_invitations').insert({email:form.email,role:form.role,full_name:form.full_name});
    setSaving(false);
    if(error){showToast(error.message,'error');return;}
    showToast('Invitation sent to '+form.email,'success');
    setForm({full_name:'',email:'',role:'CRM_OPS',department:''});
    const{data}=await SB.from('staff_invitations').select('*').order('created_at',{ascending:false}).limit(20);
    if(data) setInvites(data);
  }

  return (
    <div className="p-5 max-w-[1100px] mx-auto w-full grid grid-cols-2 gap-5">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="font-bold text-gray-900 text-[15px] mb-5">Invite New Staff Member</div>
        <div className="flex flex-col gap-4">
          {[{l:'Full Name',f:'full_name',t:'text',p:'e.g. Priya Sharma'},{l:'Email',f:'email',t:'email',p:'priya@checkupify.com'},{l:'Department',f:'department',t:'text',p:'Operations'}].map(({l,f,t,p})=>(
            <div key={f}><label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">{l}</label><input type={t} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-500" placeholder={p} value={(form as any)[f]} onChange={e=>setForm(fr=>({...fr,[f]:e.target.value}))}/></div>
          ))}
          <div><label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Role</label><select className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm cursor-pointer outline-none focus:border-green-500" value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value}))}>{['CRM_OPS','PROVIDER','ADMIN','SUPER_ADMIN'].map(r=><option key={r} value={r}>{r}</option>)}</select></div>
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-[11px] text-blue-800">Invitation link is valid for 48 hours. Staff must set a password via the link.</div>
          <button onClick={invite} disabled={saving} className="w-full py-3 rounded-xl bg-green-600 text-white font-bold text-sm hover:bg-green-700 disabled:opacity-50 cursor-pointer">{saving?'Sending…':'Send Invitation →'}</button>
        </div>
      </div>
      <Card title="Recent Invitations">
        <Table cols={['Name','Email','Role','Status','Sent']} rows={invites.map(i=>[
          <span key="n" className="font-semibold text-sm text-gray-900">{i.full_name??'—'}</span>,
          <span key="e" className="text-xs text-blue-700">{i.email}</span>,
          <Badge key="r" color="blue">{i.role}</Badge>,
          <Badge key="s" color={i.accepted_at?'green':new Date(i.expires_at)<new Date()?'red':'amber'}>{i.accepted_at?'Accepted':new Date(i.expires_at)<new Date()?'Expired':'Pending'}</Badge>,
          <span key="t" className="text-xs text-gray-400">{fmtDate(i.created_at)}</span>,
        ])} empty="No invitations sent yet"/>
      </Card>
    </div>
  );
}

// ROOT
export default function HRApp() {
  const [page,setPage]=useState<Page>('staff');
  const [profiles,setProfiles]=useState<Profile[]>([]);
  const [hrRecords,setHRRecords]=useState<HRRecord[]>([]);
  const [attendance,setAttendance]=useState<Attendance[]>([]);
  const [leaves,setLeaves]=useState<Leave[]>([]);
  const [loading,setLoading]=useState(true);
  const [toast,setToast]=useState<{msg:string;type:'success'|'error'}|null>(null);

  async function fetchAll(){
    const[pR,hR,aR,lR]=await Promise.allSettled([
      SB.from('user_profiles').select('*').order('created_at',{ascending:false}),
      SB.from('hr_records').select('*'),
      SB.from('attendance').select('*').order('date',{ascending:false}).limit(200),
      SB.from('leave_requests').select('*').order('created_at',{ascending:false}),
    ]);
    if(pR.status==='fulfilled'&&pR.value.data) setProfiles(pR.value.data as Profile[]);
    if(hR.status==='fulfilled'&&hR.value.data) setHRRecords(hR.value.data as HRRecord[]);
    if(aR.status==='fulfilled'&&aR.value.data) setAttendance(aR.value.data as Attendance[]);
    if(lR.status==='fulfilled'&&lR.value.data) setLeaves(lR.value.data as Leave[]);
    setLoading(false);
  }

  useEffect(()=>{ fetchAll(); },[]);

  function showToast(msg:string,type:'success'|'error'){setToast({msg,type});}
  const pendingLeaves=leaves.filter(l=>l.status==='Pending').length;
  const titles:Record<Page,string>={staff:'Staff Directory',attendance:'Attendance',leave:'Leave Management',salary:'Salary',invite:'Invite Staff'};

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {toast&&<Toast msg={toast.msg} type={toast.type} onDone={()=>setToast(null)}/>}
      <Sidebar page={page} onNav={p=>setPage(p)} pendingLeaves={pendingLeaves}/>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-5 shrink-0 shadow-sm">
          <div className="font-bold text-gray-900">{titles[page]}</div>
          <div className="flex items-center gap-3">
            {loading&&<span className="text-[11px] text-gray-400 flex items-center gap-1"><span className="w-3 h-3 border-2 border-gray-300 border-t-green-500 rounded-full animate-spin"/>Loading…</span>}
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/><span className="text-[11px] text-green-700 font-semibold">Live</span></div>
            <button onClick={fetchAll} className="text-[11px] text-gray-400 hover:text-gray-700 cursor-pointer px-2 py-1 rounded hover:bg-gray-100">↺</button>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto">
          {loading?(
            <div className="flex-1 flex items-center justify-center p-20"><div className="text-center"><div className="w-10 h-10 border-2 border-gray-200 border-t-green-500 rounded-full animate-spin mx-auto mb-4"/><div className="text-gray-400">Loading HR data…</div></div></div>
          ):(
            <>
              {page==='staff'     &&<StaffPage profiles={profiles} hrRecords={hrRecords}/>}
              {page==='attendance'&&<AttendancePage attendance={attendance} profiles={profiles}/>}
              {page==='leave'     &&<LeavePage leaves={leaves} profiles={profiles} onRefresh={fetchAll} showToast={showToast}/>}
              {page==='salary'    &&<SalaryPage profiles={profiles} hrRecords={hrRecords}/>}
              {page==='invite'    &&<InvitePage showToast={showToast}/>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
