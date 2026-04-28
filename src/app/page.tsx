'use client';
import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { createClient } from '@supabase/supabase-js';

const SB = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://lguoussmsusadvmexjkb.supabase.co', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxndW91c3Ntc3VzYWR2bWV4amtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3Njc1OTcsImV4cCI6MjA5MDM0MzU5N30.Mq6nW2ItZqywuIbVeOUR9HQOglZOL5Wm0uSFwT6hfjw');
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://lguoussmsusadvmexjkb.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxndW91c3Ntc3VzYWR2bWV4amtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3Njc1OTcsImV4cCI6MjA5MDM0MzU5N30.Mq6nW2ItZqywuIbVeOUR9HQOglZOL5Wm0uSFwT6hfjw';
const RZP_KEY = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? 'rzp_test_placeholder';

type Screen = 'splash'|'otp-phone'|'otp-verify'|'home'|'packages'|'book-pkg'|'book-lab'|'book-slot'|'book-confirm'|'pay'|'booking-done'|'my-bookings'|'booking-detail'|'reports'|'profile';

interface Pkg { id:string;name:string;slug:string;base_price:number;mrp:number;test_count:number;badge:string|null;fasting_required:boolean;home_collection:boolean;category:string|null;description:string|null; }
interface Lab { id:string;name:string;city:string;address:string;nabl_certified:boolean;rating:number;avg_tat_hours:number;home_collection:boolean;home_collection_charge:number;opening_time:string;closing_time:string; }
interface Booking { id:string;patient_name:string;appointment_date:string;slot_time:string;stage:string;sla_status:string;amount:number;collection_type:string;report_url:string|null;created_at:string;lab:Lab|null;package:Pkg|null; }
interface User { id:string;phone:string;name:string;email:string;dob:string;gender:string; }

function cn(...c:(string|false|null|undefined)[]) { return c.filter(Boolean).join(' '); }
function fmt(n:number) { return '₹'+n.toLocaleString('en-IN'); }

// Generate time slots from lab hours
function genSlots(open:string, close:string, dur:number=30): string[] {
  const slots:string[]=[];
  let [h,m]=open.split(':').map(Number);
  const [eh,em]=close.split(':').map(Number);
  while(h*60+m < eh*60+em-dur) {
    slots.push(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`);
    m+=dur; if(m>=60){h++;m-=60;}
  }
  return slots;
}

// Generate booking ID
function genBkId() { return `CK-APT-${Date.now().toString(36).toUpperCase().slice(-8)}`; }

// Load Razorpay script
function loadRzp():Promise<any> {
  return new Promise(res=>{
    if((window as any).Razorpay) return res((window as any).Razorpay);
    const s=document.createElement('script'); s.src='https://checkout.razorpay.com/v1/checkout.js';
    s.onload=()=>res((window as any).Razorpay); document.body.appendChild(s);
  });
}

// ── UI ATOMS ──────────────────────────────────────────────────────────────────
const NAV_BG = 'bg-[#0B2545]';
const PRIMARY = 'bg-green-500';

function Btn({children,onClick,variant='primary',disabled,full,size='md',className}:{children:ReactNode;onClick?:()=>void;variant?:'primary'|'outline'|'ghost'|'white';disabled?:boolean;full?:boolean;size?:'sm'|'md'|'lg';className?:string}) {
  const v={primary:'bg-green-500 text-white shadow-lg shadow-green-500/30 active:scale-95',outline:'border-2 border-green-500 text-green-600 bg-white',ghost:'text-gray-500',white:'bg-white text-[#0B2545] font-bold shadow'};
  const s={sm:'py-2 px-4 text-sm',md:'py-3 px-5 text-[15px]',lg:'py-4 px-6 text-[16px] font-bold'};
  return <button onClick={onClick} disabled={disabled} className={cn('rounded-2xl font-semibold transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2',v[variant],s[size],full&&'w-full',className)}>{children}</button>;
}

function Card({children,className,onClick}:{children:ReactNode;className?:string;onClick?:()=>void}) {
  return <div onClick={onClick} className={cn('bg-white rounded-3xl shadow-sm border border-gray-100',onClick&&'cursor-pointer active:scale-[0.98] transition-transform',className)}>{children}</div>;
}

function StagePill({stage}:{stage:string}) {
  const c:Record<string,string>={New:'bg-indigo-100 text-indigo-700',Confirmed:'bg-green-100 text-green-700',Completed:'bg-teal-100 text-teal-700','Pending Reports':'bg-amber-100 text-amber-700','Partially Received':'bg-purple-100 text-purple-700',Received:'bg-green-100 text-green-700',Rejected:'bg-red-100 text-red-700'};
  return <span className={cn('inline-flex px-3 py-1 rounded-full text-[12px] font-bold',c[stage]??'bg-gray-100 text-gray-600')}>{stage}</span>;
}

function Toast({msg,onDone}:{msg:string;onDone:()=>void}) {
  useEffect(()=>{ const t=setTimeout(onDone,3000); return ()=>clearTimeout(t); },[onDone]);
  return <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] bg-gray-900 text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-xl">{msg}</div>;
}

// ── SPLASH ────────────────────────────────────────────────────────────────────
function Splash({onNext}:{onNext:()=>void}) {
  useEffect(()=>{ const t=setTimeout(onNext,2200); return ()=>clearTimeout(t); },[onNext]);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0B2545]">
      <img src="/logo.png" alt="Checkupify" className="w-56 mb-6 animate-pulse"/>
      <p className="text-green-400 text-[15px] font-medium tracking-wide">Your Health. Simplified.</p>
      <div className="mt-12 w-6 h-6 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin"/>
    </div>
  );
}

// ── OTP AUTH ──────────────────────────────────────────────────────────────────
function OTPPhone({onSend}:{onSend:(phone:string)=>void}) {
  const [phone,setPhone]=useState('');
  const [loading,setLoading]=useState(false);
  const [err,setErr]=useState('');

  async function send(){
    const clean=phone.replace(/\D/g,'');
    if(clean.length!==10){setErr('Enter valid 10-digit number');return;}
    setErr('');setLoading(true);
    // Store OTP in otp_sessions table (we generate a 6-digit OTP)
    const otp=String(Math.floor(100000+Math.random()*900000));
    const expires=new Date(Date.now()+10*60000).toISOString();
    await SB.from('otp_sessions').upsert({phone:`+91${clean}`,otp,expires_at:expires,used:false});
    // In production: send via WATI. For now, show in console + store
    console.log(`OTP for ${clean}: ${otp}`);
    setLoading(false);
    onSend(`+91${clean}`);
    // Store OTP in sessionStorage for verify step
    sessionStorage.setItem('pending_otp',otp);
    sessionStorage.setItem('pending_phone',`+91${clean}`);
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0B2545]">
      <div className="flex-1 flex flex-col justify-end pb-0">
        <div className="bg-white rounded-t-[32px] px-6 pt-8 pb-10">
          <img src="/logo.png" alt="Checkupify" className="h-10 mb-6"/>
          <div className="text-[24px] font-black text-[#0B2545] mb-1">Enter your mobile</div>
          <div className="text-gray-400 text-sm mb-6">We'll send a verification code</div>
          <div className="flex items-center border-2 border-gray-200 rounded-2xl overflow-hidden focus-within:border-green-500 mb-4">
            <div className="px-4 py-3.5 bg-gray-50 border-r border-gray-200 text-[15px] font-semibold text-gray-700">🇮🇳 +91</div>
            <input type="tel" inputMode="numeric" maxLength={10} className="flex-1 px-4 py-3.5 text-[18px] font-bold outline-none tracking-widest" placeholder="9876543210" value={phone} onChange={e=>setPhone(e.target.value.replace(/\D/g,''))}/>
          </div>
          {err&&<div className="text-red-500 text-sm mb-3">{err}</div>}
          <Btn full size="lg" onClick={send} disabled={loading}>{loading?'Sending…':'Get OTP →'}</Btn>
          <p className="text-center text-xs text-gray-400 mt-4">By continuing you agree to our Terms & Privacy Policy</p>
        </div>
      </div>
    </div>
  );
}

function OTPVerify({phone,onVerified,onBack}:{phone:string;onVerified:(user:User)=>void;onBack:()=>void}) {
  const [otp,setOtp]=useState('');
  const [loading,setLoading]=useState(false);
  const [err,setErr]=useState('');

  async function verify(){
    if(otp.length!==6){setErr('Enter 6-digit OTP');return;}
    setErr('');setLoading(true);
    // Verify against otp_sessions
    const storedOtp=sessionStorage.getItem('pending_otp');
    if(otp===storedOtp||otp==='123456') { // fallback test OTP
      // Mark used
      await SB.from('otp_sessions').update({used:true}).eq('phone',phone);
      sessionStorage.removeItem('pending_otp');
      // Get or create user
      const{data:existing}=await SB.from('users').select('*').eq('phone',phone).single();
      if(existing) {
        sessionStorage.setItem('ck_user',JSON.stringify(existing));
        onVerified(existing as User);
      } else {
        const newUser={phone,name:'',email:'',dob:'',gender:'',role:'patient',created_at:new Date().toISOString()};
        const{data:created}=await SB.from('users').insert(newUser).select().single();
        const u=created??{...newUser,id:crypto.randomUUID()};
        sessionStorage.setItem('ck_user',JSON.stringify(u));
        onVerified(u as User);
      }
    } else {
      setErr('Incorrect OTP. Try 123456 for demo.');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0B2545]">
      <div className="flex-1 flex flex-col justify-end">
        <div className="bg-white rounded-t-[32px] px-6 pt-8 pb-10">
          <button onClick={onBack} className="text-gray-400 mb-6 flex items-center gap-1 cursor-pointer text-sm"><span>←</span> Back</button>
          <div className="text-[24px] font-black text-[#0B2545] mb-1">Verify OTP</div>
          <div className="text-gray-400 text-sm mb-6">Sent to {phone}</div>
          <input type="tel" inputMode="numeric" maxLength={6} className="w-full border-2 border-gray-200 rounded-2xl px-5 py-4 text-[24px] font-black text-center tracking-[12px] outline-none focus:border-green-500 mb-4" placeholder="——————" value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,''))}/>
          {err&&<div className="text-red-500 text-sm mb-3 text-center">{err}</div>}
          <div className="text-xs text-blue-600 text-center mb-4 bg-blue-50 py-2 rounded-xl">Demo mode: use OTP <strong>123456</strong></div>
          <Btn full size="lg" onClick={verify} disabled={loading}>{loading?'Verifying…':'Verify →'}</Btn>
        </div>
      </div>
    </div>
  );
}

// ── HOME ──────────────────────────────────────────────────────────────────────
function Home({user,bookings,pkgs,onNav}:{user:User;bookings:Booking[];pkgs:Pkg[];onNav:(s:Screen)=>void}) {
  const upcoming=bookings.filter(b=>!['Received','Rejected'].includes(b.stage));
  const received=bookings.filter(b=>b.stage==='Received');
  const score=received.length>0?Math.min(100,60+received.length*8):0;
  const today=new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'});

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-[#0B2545] px-5 pt-10 pb-8 rounded-b-[32px]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-green-400 text-[13px] font-medium">{today}</div>
            <div className="text-white text-[22px] font-black mt-0.5">Hi, {user.name||'there'} 👋</div>
          </div>
          <button onClick={()=>onNav('profile')} className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-black text-[16px] cursor-pointer">{(user.name||'U')[0].toUpperCase()}</button>
        </div>
        {/* Health Score */}
        {score>0?(
          <div className="bg-white/10 backdrop-blur rounded-2xl p-4 flex items-center gap-4">
            <div className="relative w-14 h-14 shrink-0">
              <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90">
                <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3"/>
                <circle cx="18" cy="18" r="15" fill="none" stroke="#22C55E" strokeWidth="3" strokeDasharray={`${(score/100)*94} 94`} strokeLinecap="round"/>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-white font-black text-[13px]">{score}</div>
            </div>
            <div><div className="text-white font-bold text-[15px]">Health Score</div><div className="text-green-300 text-xs">{score>=80?'Excellent! Keep it up':score>=60?'Good – book a checkup soon':'Book a checkup to improve'}</div></div>
          </div>
        ):(
          <div className="bg-white/10 rounded-2xl p-4 flex items-center gap-4 cursor-pointer" onClick={()=>onNav('packages')}>
            <div className="text-3xl">🏥</div>
            <div><div className="text-white font-bold">Book your first checkup</div><div className="text-green-300 text-xs">Start tracking your health →</div></div>
          </div>
        )}
      </div>

      <div className="px-4 py-5 flex flex-col gap-4">
        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3">
          {[{ic:'🧪',l:'Book Checkup',s:'packages'},{ic:'📅',l:'My Bookings',s:'my-bookings'},{ic:'📄',l:'My Reports',s:'reports'},{ic:'👤',l:'Profile',s:'profile'}].map(a=>(
            <Card key={a.l} className="p-4 flex items-center gap-3" onClick={()=>onNav(a.s as Screen)}>
              <span className="text-2xl">{a.ic}</span><span className="font-semibold text-[14px] text-gray-800">{a.l}</span>
            </Card>
          ))}
        </div>

        {/* Upcoming */}
        {upcoming.length>0&&(
          <div>
            <div className="font-bold text-gray-900 mb-2 px-1">Upcoming Bookings</div>
            {upcoming.slice(0,2).map(b=>(
              <Card key={b.id} className="p-4 mb-2" onClick={()=>onNav('my-bookings')}>
                <div className="flex items-center justify-between"><div><div className="font-bold text-gray-900 text-[14px]">{b.package?.name??'—'}</div><div className="text-xs text-gray-400 mt-0.5">{b.lab?.name??'—'} · {b.appointment_date}</div></div><StagePill stage={b.stage}/></div>
              </Card>
            ))}
          </div>
        )}

        {/* Popular packages */}
        <div>
          <div className="flex items-center justify-between px-1 mb-2">
            <div className="font-bold text-gray-900">Health Packages</div>
            <button onClick={()=>onNav('packages')} className="text-green-600 text-sm font-semibold cursor-pointer">See all →</button>
          </div>
          {pkgs.slice(0,3).map(p=>(
            <Card key={p.id} className="p-4 mb-2 flex items-center justify-between" onClick={()=>onNav('packages')}>
              <div className="flex-1"><div className="font-bold text-gray-900 text-[14px]">{p.name}</div><div className="text-xs text-gray-400 mt-0.5">{p.test_count} tests · {p.fasting_required?'Fasting required':'No fasting'}</div>{p.badge&&<span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 mt-1 inline-block">{p.badge}</span>}</div>
              <div className="text-right ml-3"><div className="font-black text-green-600 text-[16px]">{fmt(p.base_price)}</div>{p.mrp&&<div className="text-[11px] text-gray-400 line-through">{fmt(p.mrp)}</div>}</div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── PACKAGES ──────────────────────────────────────────────────────────────────
function Packages({pkgs,onSelect,onBack}:{pkgs:Pkg[];onSelect:(p:Pkg)=>void;onBack:()=>void}) {
  const [search,setSearch]=useState('');
  const cats=[...new Set(pkgs.map(p=>p.category).filter(Boolean))];
  const [cat,setCat]=useState('All');
  const filtered=pkgs.filter(p=>(cat==='All'||p.category===cat)&&(!search||p.name.toLowerCase().includes(search.toLowerCase())));
  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="bg-[#0B2545] px-4 pt-10 pb-5 rounded-b-[24px]">
        <button onClick={onBack} className="text-white/70 mb-3 flex items-center gap-1 text-sm cursor-pointer">← Home</button>
        <div className="text-white text-[22px] font-black mb-3">Health Packages</div>
        <div className="flex items-center gap-2 bg-white/10 rounded-2xl px-3 py-2.5">
          <span className="text-white/50">🔍</span>
          <input className="bg-transparent text-white placeholder-white/50 text-sm outline-none flex-1" placeholder="Search packages…" value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
      </div>
      <div className="px-4 py-3">
        <div className="flex gap-2 overflow-x-auto pb-1 mb-4 no-scrollbar">
          {['All',...cats].map(c=><button key={c} onClick={()=>setCat(c as string)} className={cn('px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap cursor-pointer flex-shrink-0 transition-all',cat===c?'bg-green-500 text-white shadow-lg shadow-green-500/30':'bg-white text-gray-600 border border-gray-200')}>{c as string}</button>)}
        </div>
        {filtered.map(p=>(
          <Card key={p.id} className="p-4 mb-3" onClick={()=>onSelect(p)}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1"><div className="font-bold text-gray-900 text-[15px]">{p.name}</div>{p.badge&&<span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 mt-1 inline-block">{p.badge}</span>}</div>
              <div className="text-right ml-3"><div className="font-black text-green-600 text-[18px]">{fmt(p.base_price)}</div>{p.mrp&&p.mrp>p.base_price&&<div className="text-xs text-gray-400 line-through">{fmt(p.mrp)}</div>}</div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <span className="text-[11px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{p.test_count} tests</span>
              {p.fasting_required&&<span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">Fasting</span>}
              {p.home_collection&&<span className="text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">Home collection</span>}
            </div>
            {p.description&&<div className="text-xs text-gray-400 mt-2 line-clamp-2">{p.description}</div>}
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── BOOK: LAB SELECT ──────────────────────────────────────────────────────────
function BookLab({pkg,labs,onSelect,onBack}:{pkg:Pkg;labs:Lab[];onSelect:(l:Lab)=>void;onBack:()=>void}) {
  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="bg-[#0B2545] px-4 pt-10 pb-5 rounded-b-[24px]">
        <button onClick={onBack} className="text-white/70 mb-3 text-sm cursor-pointer flex items-center gap-1">← Packages</button>
        <div className="text-white text-[22px] font-black">{pkg.name}</div>
        <div className="text-green-400 text-sm mt-1">{fmt(pkg.base_price)} · {pkg.test_count} tests · Select a lab</div>
      </div>
      <div className="px-4 py-4">
        {labs.filter(l=>l.nabl_certified||true).map(l=>(
          <Card key={l.id} className="p-4 mb-3" onClick={()=>onSelect(l)}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="font-bold text-gray-900 text-[15px]">{l.name}</div>
                <div className="text-xs text-gray-400 mt-0.5">{l.address||l.city}</div>
                <div className="flex gap-2 mt-2">
                  {l.nabl_certified&&<span className="text-[11px] text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full font-bold">NABL ✓</span>}
                  {l.home_collection&&<span className="text-[11px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">Home +{fmt(l.home_collection_charge||0)}</span>}
                  <span className="text-[11px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">TAT {l.avg_tat_hours}h</span>
                </div>
              </div>
              <div className="text-right ml-3"><div className="font-black text-yellow-500 text-[14px]">⭐ {l.rating}</div><div className="text-green-500 font-bold text-xs mt-1">Select →</div></div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── BOOK: SLOT ────────────────────────────────────────────────────────────────
function BookSlot({pkg,lab,onSelect,onBack}:{pkg:Pkg;lab:Lab;onSelect:(date:string,slot:string,type:string,addr:string)=>void;onBack:()=>void}) {
  const [date,setDate]=useState('');
  const [slot,setSlot]=useState('');
  const [type,setType]=useState('walkin');
  const [addr,setAddr]=useState('');

  const minDate=new Date(); minDate.setDate(minDate.getDate()+1);
  const maxDate=new Date(); maxDate.setDate(maxDate.getDate()+14);
  const slots=genSlots(lab.opening_time||'07:00',lab.closing_time||'20:00');

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-[#0B2545] px-4 pt-10 pb-5 rounded-b-[24px]">
        <button onClick={onBack} className="text-white/70 mb-3 text-sm cursor-pointer flex items-center gap-1">← Labs</button>
        <div className="text-white text-[22px] font-black">{lab.name}</div>
        <div className="text-green-400 text-sm mt-1">Select date & slot</div>
      </div>
      <div className="px-4 py-4 flex flex-col gap-4">
        <Card className="p-4">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Appointment Date</div>
          <input type="date" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-500" value={date} onChange={e=>setDate(e.target.value)} min={minDate.toISOString().split('T')[0]} max={maxDate.toISOString().split('T')[0]}/>
        </Card>

        {lab.home_collection&&(
          <Card className="p-4">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Collection Type</div>
            <div className="flex gap-3">
              {[{v:'walkin',l:'Walk-in',ic:'🏥'},{v:'Home Collection',l:`Home +${fmt(lab.home_collection_charge||0)}`,ic:'🏠'}].map(t=>(
                <button key={t.v} onClick={()=>setType(t.v)} className={cn('flex-1 py-2.5 rounded-xl border-2 text-sm font-semibold cursor-pointer transition-all flex items-center justify-center gap-1.5',type===t.v?'border-green-500 bg-green-50 text-green-700':'border-gray-200 text-gray-600')}>{t.ic} {t.l}</button>
              ))}
            </div>
            {type==='Home Collection'&&<textarea className="w-full mt-3 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-green-500 h-16 resize-none" placeholder="Enter your full address for home collection…" value={addr} onChange={e=>setAddr(e.target.value)}/>}
          </Card>
        )}

        {date&&(
          <Card className="p-4">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Select Time Slot</div>
            <div className="grid grid-cols-3 gap-2">
              {slots.map(s=>(
                <button key={s} onClick={()=>setSlot(s)} className={cn('py-2 rounded-xl text-sm font-semibold cursor-pointer transition-all border-2',slot===s?'border-green-500 bg-green-50 text-green-700':'border-gray-200 text-gray-600 hover:border-green-300')}>{s}</button>
              ))}
            </div>
          </Card>
        )}

        {pkg.fasting_required&&<div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">⚠️ This package requires 8-10 hours fasting before the test. Plan your appointment accordingly.</div>}

        <Btn full size="lg" disabled={!date||!slot||(type==='Home Collection'&&!addr)} onClick={()=>onSelect(date,slot,type,addr)}>Continue →</Btn>
      </div>
    </div>
  );
}

// ── BOOK: CONFIRM + PAY ───────────────────────────────────────────────────────
function BookConfirm({pkg,lab,date,slot,type,addr,user,onSuccess,onBack,showToast}:{pkg:Pkg;lab:Lab;date:string;slot:string;type:string;addr:string;user:User;onSuccess:(id:string)=>void;onBack:()=>void;showToast:(m:string)=>void}) {
  const [name,setName]=useState(user.name||'');
  const [age,setAge]=useState('');
  const [gender,setGender]=useState('Male');
  const [promo,setPromo]=useState('');
  const [discount,setDiscount]=useState(0);
  const [promoMsg,setPromoMsg]=useState('');
  const [loading,setLoading]=useState(false);
  const charge=type==='Home Collection'?lab.home_collection_charge||0:0;
  const total=pkg.base_price+charge-discount;

  async function applyPromo(){
    const{data}=await SB.from('promo_codes').select('*').eq('code',promo.toUpperCase()).eq('active',true).single();
    if(!data){setPromoMsg('Invalid code');return;}
    if(data.expires_at&&new Date(data.expires_at)<new Date()){setPromoMsg('Code expired');return;}
    const d=data.type==='percent'?Math.round(pkg.base_price*data.value/100):data.value;
    setDiscount(Math.min(d,pkg.base_price));
    setPromoMsg(`✓ Saved ${fmt(Math.min(d,pkg.base_price))}!`);
  }

  async function pay(){
    if(!name||!age){showToast('Fill in patient name and age');return;}
    setLoading(true);
    const bkId=genBkId();

    // Create order via razorpay-verify edge function
    let orderId='';
    try {
      const r=await fetch(`${SUPABASE_URL}/functions/v1/razorpay-verify?action=create`,{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${SUPABASE_ANON_KEY}`},body:JSON.stringify({booking_id:bkId,amount:total})});
      if(r.ok){const d=await r.json();orderId=d.order_id;}
    } catch(e){}

    // Insert booking record first
    const bkData={id:bkId,user_id:null,lab_id:lab.id,package_id:pkg.id,patient_name:name,patient_age:parseInt(age)||0,patient_gender:gender,patient_phone:user.phone,appointment_date:date,slot_time:slot+':00',collection_type:type,address:addr||null,amount:total,discount,promo_code:promo||null,status:'pending_payment',stage:'New',sla_status:'On Track',is_corporate:false,created_at:new Date().toISOString(),updated_at:new Date().toISOString()};
    const{error:bkErr}=await SB.from('bookings').insert(bkData);
    if(bkErr){setLoading(false);showToast('Booking failed: '+bkErr.message);return;}

    // If we have an order ID, open Razorpay
    if(orderId&&RZP_KEY!=='rzp_test_placeholder'){
      try{
        const Razorpay=await loadRzp();
        new Razorpay({key:RZP_KEY,order_id:orderId,amount:total*100,currency:'INR',name:'Checkupify',description:pkg.name,image:'/favicon.png',prefill:{contact:user.phone,name},theme:{color:'#22C55E'},handler:async(resp:any)=>{
          await fetch(`${SUPABASE_URL}/functions/v1/razorpay-verify?action=verify`,{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${SUPABASE_ANON_KEY}`},body:JSON.stringify({...resp,booking_id:bkId})});
          setLoading(false);
          onSuccess(bkId);
        },modal:{ondismiss:()=>setLoading(false)}}).open();
        return;
      }catch(e){}
    }

    // Demo: mark as paid directly
    await SB.from('bookings').update({status:'paid',paid_at:new Date().toISOString()}).eq('id',bkId);
    setLoading(false);
    onSuccess(bkId);
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-[#0B2545] px-4 pt-10 pb-5 rounded-b-[24px]">
        <button onClick={onBack} className="text-white/70 mb-3 text-sm cursor-pointer flex items-center gap-1">← Slots</button>
        <div className="text-white text-[22px] font-black">Confirm Booking</div>
      </div>
      <div className="px-4 py-4 flex flex-col gap-4">
        {/* Summary */}
        <Card className="p-4">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Booking Summary</div>
          {[['Package',pkg.name],['Lab',lab.name],['Date',date],['Slot',slot],['Collection',type]].map(([k,v])=>(
            <div key={k} className="flex justify-between py-2 border-b border-gray-50 last:border-0 text-sm"><span className="text-gray-500">{k}</span><span className="font-semibold text-gray-900">{v}</span></div>
          ))}
        </Card>

        {/* Patient details */}
        <Card className="p-4">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Patient Details</div>
          <div className="flex flex-col gap-3">
            <div><label className="text-xs text-gray-500 mb-1 block">Full Name *</label><input className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-500" value={name} onChange={e=>setName(e.target.value)} placeholder="As per ID proof"/></div>
            <div className="flex gap-3">
              <div className="flex-1"><label className="text-xs text-gray-500 mb-1 block">Age *</label><input type="number" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-500" value={age} onChange={e=>setAge(e.target.value)} placeholder="25"/></div>
              <div className="flex-1"><label className="text-xs text-gray-500 mb-1 block">Gender</label><select className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-500 cursor-pointer" value={gender} onChange={e=>setGender(e.target.value)}><option>Male</option><option>Female</option><option>Other</option></select></div>
            </div>
          </div>
        </Card>

        {/* Promo */}
        <Card className="p-4">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Promo Code</div>
          <div className="flex gap-2">
            <input className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-500 uppercase" placeholder="HEALTHFIRST" value={promo} onChange={e=>setPromo(e.target.value)}/>
            <Btn size="sm" onClick={applyPromo} disabled={!promo}>Apply</Btn>
          </div>
          {promoMsg&&<div className={cn('text-sm mt-2',promoMsg.startsWith('✓')?'text-green-600':'text-red-500')}>{promoMsg}</div>}
        </Card>

        {/* Price */}
        <Card className="p-4 bg-green-50 border-green-200">
          {[['Package',fmt(pkg.base_price)],['Home Collection',charge>0?fmt(charge):'Free'],['Discount',discount>0?`−${fmt(discount)}`:'—']].map(([k,v])=>(
            <div key={k} className="flex justify-between py-1.5 text-sm"><span className="text-gray-600">{k}</span><span className="text-gray-800">{v}</span></div>
          ))}
          <div className="border-t border-green-200 mt-2 pt-2 flex justify-between"><span className="font-bold text-gray-900">Total</span><span className="font-black text-green-600 text-[18px]">{fmt(total)}</span></div>
        </Card>

        <Btn full size="lg" onClick={pay} disabled={loading}>{loading?'Processing…':`Pay ${fmt(total)} →`}</Btn>
        <p className="text-center text-xs text-gray-400">Secure payment via Razorpay · Refundable</p>
      </div>
    </div>
  );
}

// ── MY BOOKINGS ────────────────────────────────────────────────────────────────
function MyBookings({bookings,onDetail,onBack}:{bookings:Booking[];onDetail:(b:Booking)=>void;onBack:()=>void}) {
  const [tab,setTab]=useState('Active');
  const active=bookings.filter(b=>!['Received','Rejected','No Show'].includes(b.stage));
  const done=bookings.filter(b=>['Received','Rejected'].includes(b.stage));
  const shown=tab==='Active'?active:done;
  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="bg-[#0B2545] px-4 pt-10 pb-5 rounded-b-[24px]">
        <button onClick={onBack} className="text-white/70 mb-3 text-sm cursor-pointer flex items-center gap-1">← Home</button>
        <div className="text-white text-[22px] font-black">My Bookings</div>
      </div>
      <div className="flex border-b border-gray-200 bg-white mx-4 mt-4 rounded-2xl overflow-hidden shadow-sm">
        {['Active','Past'].map(t=><button key={t} onClick={()=>setTab(t)} className={cn('flex-1 py-2.5 text-sm font-semibold cursor-pointer transition-all',tab===t?'bg-green-500 text-white':'text-gray-500')}>{t} ({t==='Active'?active.length:done.length})</button>)}
      </div>
      <div className="px-4 pt-4">
        {shown.length===0?<div className="text-center py-12 text-gray-400"><div className="text-4xl mb-3">📅</div><div className="font-semibold">No bookings yet</div></div>:shown.map(b=>(
          <Card key={b.id} className="p-4 mb-3" onClick={()=>onDetail(b)}>
            <div className="flex items-start justify-between mb-2">
              <div><div className="font-bold text-gray-900 text-[15px]">{b.package?.name??'Health Checkup'}</div><div className="text-xs text-gray-400 mt-0.5">{b.lab?.name??'—'}</div></div>
              <StagePill stage={b.stage}/>
            </div>
            <div className="flex gap-3 text-xs text-gray-500"><span>📅 {b.appointment_date}</span><span>⏰ {b.slot_time?.slice(0,5)}</span><span>💳 {fmt(b.amount)}</span></div>
            {b.stage==='Received'&&<div className="mt-2 text-green-600 text-sm font-semibold">📄 Report ready →</div>}
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── REPORTS ───────────────────────────────────────────────────────────────────
function Reports({bookings,onBack}:{bookings:Booking[];onBack:()=>void}) {
  const withReports=bookings.filter(b=>b.report_url||b.stage==='Received');
  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="bg-[#0B2545] px-4 pt-10 pb-5 rounded-b-[24px]">
        <button onClick={onBack} className="text-white/70 mb-3 text-sm cursor-pointer flex items-center gap-1">← Home</button>
        <div className="text-white text-[22px] font-black">My Reports</div>
        <div className="text-green-400 text-sm mt-1">{withReports.length} report{withReports.length!==1?'s':''} available</div>
      </div>
      <div className="px-4 pt-4">
        {withReports.length===0?(
          <div className="text-center py-16 text-gray-400"><div className="text-5xl mb-4">📄</div><div className="font-semibold text-gray-600 mb-1">No reports yet</div><div className="text-sm">Your lab reports will appear here once ready</div></div>
        ):withReports.map(b=>(
          <Card key={b.id} className="p-4 mb-3">
            <div className="font-bold text-gray-900 text-[15px]">{b.package?.name??'Health Checkup'}</div>
            <div className="text-xs text-gray-400 mt-0.5 mb-3">{b.lab?.name??'—'} · {b.appointment_date}</div>
            {b.report_url?(
              <a href={b.report_url} target="_blank" rel="noreferrer"><Btn size="sm" full variant="outline">📄 View Report</Btn></a>
            ):(
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-amber-700">Report being processed — will be available soon</div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── PROFILE ───────────────────────────────────────────────────────────────────
function Profile({user,onSave,onLogout,onBack}:{user:User;onSave:(u:User)=>void;onLogout:()=>void;onBack:()=>void}) {
  const [name,setName]=useState(user.name||'');
  const [email,setEmail]=useState(user.email||'');
  const [dob,setDob]=useState(user.dob||'');
  const [gender,setGender]=useState(user.gender||'');
  const [saved,setSaved]=useState(false);

  async function save(){
    const updated={...user,name,email,dob,gender};
    await SB.from('users').update({name,email,dob,gender}).eq('phone',user.phone);
    sessionStorage.setItem('ck_user',JSON.stringify(updated));
    onSave(updated); setSaved(true); setTimeout(()=>setSaved(false),2000);
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="bg-[#0B2545] px-4 pt-10 pb-5 rounded-b-[24px]">
        <button onClick={onBack} className="text-white/70 mb-3 text-sm cursor-pointer flex items-center gap-1">← Home</button>
        <div className="text-white text-[22px] font-black">My Profile</div>
        <div className="text-green-400 text-sm mt-1">{user.phone}</div>
      </div>
      <div className="px-4 pt-4 flex flex-col gap-3">
        <Card className="p-4">
          {[{l:'Full Name',v:name,s:setName,t:'text',p:'Your full name'},{l:'Email',v:email,s:setEmail,t:'email',p:'email@example.com'},{l:'Date of Birth',v:dob,s:setDob,t:'date',p:''}].map(f=>(
            <div key={f.l} className="mb-3 last:mb-0"><label className="text-xs text-gray-400 font-semibold mb-1 block">{f.l}</label><input type={f.t} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-500" value={f.v} onChange={e=>f.s(e.target.value)} placeholder={f.p}/></div>
          ))}
          <div className="mb-3"><label className="text-xs text-gray-400 font-semibold mb-1 block">Gender</label><select className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-green-500 cursor-pointer" value={gender} onChange={e=>setGender(e.target.value)}><option value="">Select</option><option>Male</option><option>Female</option><option>Other</option></select></div>
          <Btn full onClick={save} variant="primary">{saved?'✓ Saved!':'Save Profile'}</Btn>
        </Card>
        <Btn full variant="outline" onClick={onLogout}>Sign Out</Btn>
      </div>
    </div>
  );
}

// ── BOOKING SUCCESS ────────────────────────────────────────────────────────────
function BookingDone({bookingId,onHome}:{bookingId:string;onHome:()=>void}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#0B2545] to-[#1a3a6e] px-6 text-center">
      <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center mb-6 shadow-2xl shadow-green-500/40">
        <svg width="48" height="48" viewBox="0 0 100 100" fill="none"><path d="M22 50 L42 70 L78 30" stroke="white" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>
      <div className="text-white text-[26px] font-black mb-2">Booking Confirmed!</div>
      <div className="text-green-300 text-sm mb-1">Booking ID: <span className="font-mono font-bold">{bookingId}</span></div>
      <div className="text-white/60 text-sm mb-8">Your lab will confirm within 2 hours. You'll get a WhatsApp notification.</div>
      <Btn variant="white" onClick={onHome} size="lg">← Back to Home</Btn>
    </div>
  );
}

// ── BOTTOM NAV ────────────────────────────────────────────────────────────────
function BottomNav({screen,onNav}:{screen:Screen;onNav:(s:Screen)=>void}) {
  const SHOW=['home','packages','my-bookings','reports','profile'];
  if(!SHOW.includes(screen)) return null;
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 flex shadow-2xl">
      {[{ic:'🏠',l:'Home',s:'home'},{ic:'🧪',l:'Book',s:'packages'},{ic:'📅',l:'Bookings',s:'my-bookings'},{ic:'📄',l:'Reports',s:'reports'},{ic:'👤',l:'Profile',s:'profile'}].map(n=>(
        <button key={n.s} onClick={()=>onNav(n.s as Screen)} className={cn('flex-1 flex flex-col items-center py-2.5 gap-0.5 cursor-pointer transition-all',screen===n.s?'text-green-600':'text-gray-400')}>
          <span className="text-xl">{n.ic}</span>
          <span className={cn('text-[10px] font-semibold',screen===n.s?'text-green-600':'text-gray-400')}>{n.l}</span>
        </button>
      ))}
    </div>
  );
}

// ── ROOT ──────────────────────────────────────────────────────────────────────
export default function WebApp() {
  const [screen,setScreen]=useState<Screen>('splash');
  const [phone,setPhone]=useState('');
  const [user,setUser]=useState<User|null>(null);
  const [pkgs,setPkgs]=useState<Pkg[]>([]);
  const [labs,setLabs]=useState<Lab[]>([]);
  const [bookings,setBookings]=useState<Booking[]>([]);
  const [toast,setToast]=useState('');
  // Booking state
  const [selPkg,setSelPkg]=useState<Pkg|null>(null);
  const [selLab,setSelLab]=useState<Lab|null>(null);
  const [selDate,setSelDate]=useState('');
  const [selSlot,setSelSlot]=useState('');
  const [selType,setSelType]=useState('walkin');
  const [selAddr,setSelAddr]=useState('');
  const [doneId,setDoneId]=useState('');
  const [detailB,setDetailB]=useState<Booking|null>(null);

  useEffect(()=>{
    const saved=sessionStorage.getItem('ck_user');
    if(saved){setUser(JSON.parse(saved));setTimeout(()=>setScreen('home'),2000);}
  },[]);

  const fetchData=useCallback(async(u?:User)=>{
    const usr=u??user;
    const[pR,lR,bR]=await Promise.allSettled([
      SB.from('packages').select('*').eq('active',true).order('sort_order'),
      SB.from('labs').select('*').eq('active',true),
      usr?SB.from('bookings').select('*,lab:labs(name,city,address),package:packages(name,base_price)').eq('patient_phone',usr.phone).order('created_at',{ascending:false}):Promise.resolve({data:[]}),
    ]);
    if(pR.status==='fulfilled'&&pR.value.data) setPkgs(pR.value.data as Pkg[]);
    if(lR.status==='fulfilled'&&lR.value.data) setLabs(lR.value.data as Lab[]);
    if(bR.status==='fulfilled'&&(bR.value as any).data) setBookings((bR.value as any).data as Booking[]);
  },[user]);

  useEffect(()=>{ if(screen==='home') fetchData(); },[screen,fetchData]);

  function nav(s:Screen){setScreen(s);}
  function showToast(m:string){setToast(m);}

  return (
    <div className="max-w-[430px] mx-auto relative">
      {toast&&<Toast msg={toast} onDone={()=>setToast('')}/>}
      {screen==='splash'&&<Splash onNext={()=>{ const s=sessionStorage.getItem('ck_user'); s?setScreen('home'):setScreen('otp-phone'); }}/>}
      {screen==='otp-phone'&&<OTPPhone onSend={p=>{setPhone(p);setScreen('otp-verify');}}/>}
      {screen==='otp-verify'&&<OTPVerify phone={phone} onVerified={u=>{setUser(u);fetchData(u);setScreen('home');}} onBack={()=>setScreen('otp-phone')}/>}
      {screen==='home'&&user&&<Home user={user} bookings={bookings} pkgs={pkgs} onNav={nav}/>}
      {screen==='packages'&&<Packages pkgs={pkgs} onSelect={p=>{setSelPkg(p);setScreen('book-lab');}} onBack={()=>nav('home')}/>}
      {screen==='book-lab'&&selPkg&&<BookLab pkg={selPkg} labs={labs} onSelect={l=>{setSelLab(l);setScreen('book-slot');}} onBack={()=>nav('packages')}/>}
      {screen==='book-slot'&&selPkg&&selLab&&<BookSlot pkg={selPkg} lab={selLab} onSelect={(d,s,t,a)=>{setSelDate(d);setSelSlot(s);setSelType(t);setSelAddr(a);nav('book-confirm');}} onBack={()=>nav('book-lab')}/>}
      {screen==='book-confirm'&&selPkg&&selLab&&user&&<BookConfirm pkg={selPkg} lab={selLab} date={selDate} slot={selSlot} type={selType} addr={selAddr} user={user} onSuccess={id=>{setDoneId(id);fetchData();nav('booking-done');}} onBack={()=>nav('book-slot')} showToast={showToast}/>}
      {screen==='booking-done'&&<BookingDone bookingId={doneId} onHome={()=>{nav('home');fetchData();}}/>}
      {screen==='my-bookings'&&<MyBookings bookings={bookings} onDetail={b=>{setDetailB(b);nav('booking-detail');}} onBack={()=>nav('home')}/>}
      {screen==='booking-detail'&&detailB&&(
        <div className="min-h-screen bg-gray-50 pb-8">
          <div className="bg-[#0B2545] px-4 pt-10 pb-5 rounded-b-[24px]"><button onClick={()=>nav('my-bookings')} className="text-white/70 mb-3 text-sm cursor-pointer flex items-center gap-1">← Bookings</button><div className="text-white text-[20px] font-black">{detailB.id}</div></div>
          <div className="px-4 pt-4"><Card className="p-4">{[['Package',detailB.package?.name??'—'],['Lab',detailB.lab?.name??'—'],['Date',detailB.appointment_date],['Slot',detailB.slot_time?.slice(0,5)??'—'],['Type',detailB.collection_type],['Amount',fmt(detailB.amount)],['Status',detailB.stage]].map(([k,v])=><div key={k} className="flex justify-between py-2.5 border-b border-gray-50 last:border-0 text-sm"><span className="text-gray-400">{k}</span><span className="font-semibold text-gray-900">{v}</span></div>)}{detailB.report_url&&<a href={detailB.report_url} target="_blank" rel="noreferrer" className="block mt-3"><Btn full variant="outline">📄 View Report</Btn></a>}</Card></div>
        </div>
      )}
      {screen==='reports'&&<Reports bookings={bookings} onBack={()=>nav('home')}/>}
      {screen==='profile'&&user&&<Profile user={user} onSave={u=>{setUser(u);}} onLogout={()=>{sessionStorage.removeItem('ck_user');setUser(null);setScreen('otp-phone');}} onBack={()=>nav('home')}/>}
      <BottomNav screen={screen} onNav={nav}/>
    </div>
  );
}
