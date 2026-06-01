"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { fmt, fmtDate, cn } from "@/lib/utils";
import type { Package, Lab, Booking, UserData } from "@/types";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const C = {
  navy: "#0B2545", navyDeep: "#061529", navyMid: "#1B4B8A",
  green: "#22C55E", greenDark: "#16A34A", greenLight: "#DCFCE7",
  white: "#FFFFFF", bg: "#F9FAFB", card: "#FFFFFF",
  text: "#111827", textMid: "#4B5563", textLight: "#9CA3AF",
  border: "#E5E7EB", amber: "#F59E0B", red: "#EF4444",
};

type Screen = "splash"|"otp"|"verify"|"home"|"packages"|"select-lab"|"select-slot"|"confirm"|"success"|"bookings"|"booking-detail"|"reports"|"profile";

const STAGES: Record<string,{bg:string;text:string}> = {
  "New":{bg:"#EFF6FF",text:"#2563EB"},
  "Confirmed":{bg:"#F0FDF4",text:"#16A34A"},
  "Completed":{bg:"#F0FDFA",text:"#0D9488"},
  "Pending Reports":{bg:"#FFFBEB",text:"#D97706"},
  "Received":{bg:"#F0FDF4",text:"#16A34A"},
  "Rejected":{bg:"#FEF2F2",text:"#DC2626"},
};

const DEMO_USER: UserData = { id:"demo", phone:"+91-9999999999", name:"Demo User", email:"demo@checkupify.com", gender:"Male", city:"Hyderabad", dob:"1990-01-01" };

export default function PatientApp() {
  const [screen, setScreen] = useState<Screen>("splash");
  const [phone, setPhone] = useState("");
  const [user, setUser] = useState<UserData|null>(null);
  const [packages, setPackages] = useState<Package[]>([]);
  const [labs, setLabs] = useState<Lab[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [selPkg, setSelPkg] = useState<Package|null>(null);
  const [selLab, setSelLab] = useState<Lab|null>(null);
  const [selDate, setSelDate] = useState("");
  const [selSlot, setSelSlot] = useState("");
  const [selType, setSelType] = useState("walkin");
  const [doneId, setDoneId] = useState("");
  const [detailB, setDetailB] = useState<Booking|null>(null);

  const fetchData = useCallback(async (u?: UserData) => {
    const usr = u ?? user;
    setLoading(true);
    const [pRes, lRes] = await Promise.allSettled([
      supabase.from("packages").select("*").eq("active",true).order("sort_order"),
      supabase.from("labs").select("*").eq("active",true),
    ]);
    if (pRes.status==="fulfilled"&&pRes.value.data) setPackages(pRes.value.data as Package[]);
    if (lRes.status==="fulfilled"&&lRes.value.data) setLabs(lRes.value.data as Lab[]);
    if (usr?.phone) {
      const{data}=await supabase.from("bookings").select("*,lab:labs(name,city),package:packages(name)").eq("patient_phone",usr.phone).order("created_at",{ascending:false});
      if(data) setBookings(data as Booking[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { setTimeout(() => setScreen("otp"), 2000); }, []);

  const go = (s: Screen) => setScreen(s);

  if (screen === "splash") return <Splash />;
  if (screen === "otp") return <OTPScreen onSend={p=>{setPhone(p);go("verify");}} onGuest={()=>{setUser(DEMO_USER);fetchData(DEMO_USER);go("home");}} />;
  if (screen === "verify") return <OTPVerify phone={phone} onVerified={u=>{setUser(u);fetchData(u);go("home");}} onBack={()=>go("otp")} />;

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {user && (
        <>
          {screen==="home"    && <HomePage user={user} bookings={bookings} packages={packages} loading={loading} onNav={go} onRefresh={()=>fetchData()} />}
          {screen==="packages"&& <PackagesPage packages={packages} onSelect={p=>{setSelPkg(p);go("select-lab");}} onBack={()=>go("home")} />}
          {screen==="select-lab"&&selPkg && <SelectLabPage pkg={selPkg} labs={labs} onSelect={l=>{setSelLab(l);go("select-slot");}} onBack={()=>go("packages")} />}
          {screen==="select-slot"&&selPkg&&selLab && <SelectSlotPage pkg={selPkg} lab={selLab} onSelect={(d,s,t)=>{setSelDate(d);setSelSlot(s);setSelType(t);go("confirm");}} onBack={()=>go("select-lab")} />}
          {screen==="confirm"&&selPkg&&selLab && <ConfirmPage pkg={selPkg} lab={selLab} date={selDate} slot={selSlot} type={selType} user={user} onSuccess={id=>{setDoneId(id);fetchData();go("success");}} onBack={()=>go("select-slot")} />}
          {screen==="success" && <SuccessPage bookingId={doneId} onHome={()=>{fetchData();go("home");}} />}
          {screen==="bookings"&& <BookingsPage bookings={bookings} loading={loading} onRefresh={()=>fetchData()} onDetail={b=>{setDetailB(b);go("booking-detail");}} onBack={()=>go("home")} />}
          {screen==="booking-detail"&&detailB && <BookingDetailPage booking={detailB} onBack={()=>go("bookings")} />}
          {screen==="reports" && <ReportsPage bookings={bookings.filter(b=>b.report_url||b.stage==="Received")} onBack={()=>go("home")} />}
          {screen==="profile" && <ProfilePage user={user} bookings={bookings} onSave={u=>setUser(u)} onLogout={()=>{setUser(null);go("otp");}} onBack={()=>go("home")} />}
        </>
      )}
    </div>
  );
}

// ─── SPLASH ───────────────────────────────────────────────────────────────────
function Splash() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{background:"linear-gradient(135deg, #0B2545 0%, #1B4B8A 100%)"}}>
      <div className="fade-up text-center">
        <div className="w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center" style={{background:"#22C55E",boxShadow:"0 20px 40px rgba(34,197,94,0.4)"}}>
          <span className="text-white text-4xl font-black">✓</span>
        </div>
        <h1 className="text-4xl font-black text-white mb-2" style={{letterSpacing:"-1px"}}>Checkupify</h1>
        <p className="text-lg font-medium" style={{color:"rgba(255,255,255,0.6)"}}>Your Health. Simplified.</p>
      </div>
      <div className="absolute bottom-12 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-white opacity-40 animate-spin" style={{animationDuration:"1s"}} />
      </div>
    </div>
  );
}

// ─── OTP SCREEN ────────────────────────────────────────────────────────────────
function OTPScreen({ onSend, onGuest }: { onSend:(p:string)=>void; onGuest:()=>void }) {
  const [ph, setPh] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function send() {
    const c = ph.replace(/\D/g,"");
    if (c.length !== 10) { setErr("Enter 10-digit mobile number"); return; }
    setLoading(true); setErr("");
    const otp = String(Math.floor(100000+Math.random()*900000));
    await supabase.from("otp_sessions").upsert({phone:`+91${c}`,otp,expires_at:new Date(Date.now()+600000).toISOString(),used:false});
    setLoading(false);
    onSend(`+91${c}`);
  }

  return (
    <div className="min-h-screen" style={{background:"linear-gradient(160deg, #0B2545 0%, #1B4B8A 60%, #0B2545 100%)"}}>
      <div className="max-w-md mx-auto px-6 pt-20 pb-10">
        <div className="w-12 h-12 rounded-2xl mb-8 flex items-center justify-center" style={{background:"#22C55E"}}>
          <span className="text-white text-2xl font-black">C</span>
        </div>
        <h1 className="text-3xl font-black text-white mb-2" style={{letterSpacing:"-0.5px"}}>Welcome to<br/>Checkupify</h1>
        <p className="text-base mb-10" style={{color:"rgba(255,255,255,0.55)"}}>Book health checkups in minutes</p>

        <div className="rounded-2xl overflow-hidden mb-4 flex" style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.12)"}}>
          <div className="px-5 py-4 border-r flex items-center" style={{borderColor:"rgba(255,255,255,0.12)"}}>
            <span className="text-white font-bold text-base">🇮🇳 +91</span>
          </div>
          <input className="flex-1 bg-transparent px-4 text-2xl font-bold text-white placeholder-white/30 outline-none tracking-widest"
            placeholder="9876543210" maxLength={10} value={ph} onChange={e=>setPh(e.target.value.replace(/\D/g,""))}
            inputMode="numeric" />
        </div>
        {err && <p className="text-red-300 text-sm mb-3">{err}</p>}
        <button onClick={send} disabled={loading}
          className="w-full py-4 rounded-2xl font-bold text-base text-white disabled:opacity-50 cursor-pointer transition-all hover:opacity-90 mb-4"
          style={{background:"#22C55E",boxShadow:"0 8px 20px rgba(34,197,94,0.35)"}}>
          {loading ? "Sending OTP…" : "Get OTP →"}
        </button>
        <button onClick={onGuest} className="w-full py-3 text-sm text-center cursor-pointer transition-opacity hover:opacity-70" style={{color:"rgba(255,255,255,0.4)"}}>
          Continue as guest (demo mode)
        </button>
      </div>
    </div>
  );
}

// ─── OTP VERIFY ───────────────────────────────────────────────────────────────
function OTPVerify({ phone, onVerified, onBack }: { phone:string; onVerified:(u:UserData)=>void; onBack:()=>void }) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function verify() {
    if (otp.length!==6) { setErr("Enter 6-digit OTP"); return; }
    setLoading(true); setErr("");
    const{data}=await supabase.from("otp_sessions").select("*").eq("phone",phone).eq("used",false).single();
    if (!data||(otp!==data.otp&&otp!=="123456")) { setErr("Wrong OTP. Use 123456 for demo."); setLoading(false); return; }
    await supabase.from("otp_sessions").update({used:true}).eq("phone",phone);
    let{data:user}=await supabase.from("users").select("*").eq("phone",phone).single();
    if (!user) { const{data:nu}=await supabase.from("users").insert({phone,name:"",email:"",gender:"",city:""}).select().single(); user=nu; }
    setLoading(false);
    if (user) onVerified(user as UserData);
  }

  return (
    <div className="min-h-screen" style={{background:"linear-gradient(160deg, #0B2545 0%, #1B4B8A 60%, #0B2545 100%)"}}>
      <div className="max-w-md mx-auto px-6 pt-16 pb-10">
        <button onClick={onBack} className="text-white/60 text-sm mb-10 flex items-center gap-2 cursor-pointer hover:text-white/80">← Back</button>
        <h1 className="text-3xl font-black text-white mb-2">Verify OTP</h1>
        <p className="text-base mb-10" style={{color:"rgba(255,255,255,0.55)"}}>Sent to {phone}</p>

        <input className="w-full rounded-2xl px-6 py-5 text-center text-4xl font-black text-white outline-none tracking-[0.3em] mb-3"
          style={{background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.15)"}}
          placeholder="——————" maxLength={6} value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,""))} inputMode="numeric" />

        <div className="rounded-xl px-4 py-3 mb-6 text-sm text-center font-medium" style={{background:"rgba(99,102,241,0.15)",color:"#818CF8"}}>
          Demo: use OTP 123456
        </div>
        {err && <p className="text-red-300 text-sm mb-3">{err}</p>}
        <button onClick={verify} disabled={loading}
          className="w-full py-4 rounded-2xl font-bold text-base text-white disabled:opacity-50 cursor-pointer hover:opacity-90"
          style={{background:"#22C55E",boxShadow:"0 8px 20px rgba(34,197,94,0.35)"}}>
          {loading ? "Verifying…" : "Verify & Continue →"}
        </button>
      </div>
    </div>
  );
}

// ─── HOME PAGE ─────────────────────────────────────────────────────────────────
function HomePage({ user, bookings, packages, loading, onNav, onRefresh }: { user:UserData; bookings:Booking[]; packages:Package[]; loading:boolean; onNav:(s:Screen)=>void; onRefresh:()=>void }) {
  const upcoming = bookings.filter(b=>!["Received","Rejected"].includes(b.stage)).slice(0,2);
  const received = bookings.filter(b=>b.stage==="Received");
  const score = received.length>0 ? Math.min(100,50+received.length*12) : 0;

  return (
    <div className="min-h-screen" style={{background:"#F9FAFB"}}>
      {/* Hero header */}
      <div className="px-5 pt-14 pb-10" style={{background:"linear-gradient(160deg, #0B2545 0%, #1B4B8A 100%)"}}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-sm font-semibold mb-1" style={{color:"#22C55E"}}>{new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long"})}</p>
            <h1 className="text-2xl font-black text-white">Hi, {user.name?.split(" ")[0]||"there"} 👋</h1>
          </div>
          <button onClick={()=>onNav("profile")}
            className="w-11 h-11 rounded-full flex items-center justify-center font-black text-white cursor-pointer"
            style={{background:"#22C55E",boxShadow:"0 4px 12px rgba(34,197,94,0.4)"}}>
            {(user.name?.[0]||"U").toUpperCase()}
          </button>
        </div>

        {/* Health score card */}
        <div className="rounded-2xl p-5 mb-2" style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.12)"}}>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0" style={{border:`3px solid ${score>0?"#22C55E":"rgba(255,255,255,0.2)"}`,background:score>0?"rgba(34,197,94,0.15)":"rgba(255,255,255,0.05)"}}>
              <span className="text-xl font-black text-white">{score>0?score:"—"}</span>
            </div>
            <div className="flex-1">
              <p className="font-bold text-white mb-1">Health Score</p>
              <p className="text-sm" style={{color:"rgba(255,255,255,0.6)"}}>
                {score>0 ? (score>=80?"🟢 Excellent health!":"🟡 Book a checkup soon") : "Book your first checkup to see your score"}
              </p>
              {score===0 && (
                <button onClick={()=>onNav("packages")} className="text-sm font-bold mt-2 cursor-pointer" style={{color:"#22C55E"}}>Book now →</button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 -mt-2 pb-24">
        {/* Quick actions */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            {icon:"🧪",label:"Book",screen:"packages" as Screen},
            {icon:"📅",label:"Bookings",screen:"bookings" as Screen},
            {icon:"📄",label:"Reports",screen:"reports" as Screen},
            {icon:"👤",label:"Profile",screen:"profile" as Screen},
          ].map(a=>(
            <button key={a.screen} onClick={()=>onNav(a.screen)}
              className="flex flex-col items-center gap-2 p-3 rounded-2xl cursor-pointer transition-all hover:shadow-md"
              style={{background:"#FFFFFF",border:"1px solid #E5E7EB"}}>
              <span className="text-2xl">{a.icon}</span>
              <span className="text-xs font-semibold" style={{color:"#4B5563"}}>{a.label}</span>
            </button>
          ))}
        </div>

        {/* Upcoming bookings */}
        {upcoming.length>0 && (
          <div className="mb-6">
            <h2 className="text-base font-bold mb-3" style={{color:"#111827"}}>Upcoming Appointments</h2>
            <div className="space-y-3">
              {upcoming.map(b=>(
                <button key={b.id} onClick={()=>onNav("bookings")}
                  className="w-full text-left rounded-2xl p-4 cursor-pointer transition-all hover:shadow-md"
                  style={{background:"#FFFFFF",border:"1px solid #E5E7EB"}}>
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-bold text-sm" style={{color:"#111827"}}>{b.package?.name??"Health Checkup"}</p>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{background:STAGES[b.stage]?.bg??"#F3F4F6",color:STAGES[b.stage]?.text??"#374151"}}>{b.stage}</span>
                  </div>
                  <p className="text-sm mb-2" style={{color:"#6B7280"}}>{b.lab?.name??"—"}</p>
                  <div className="flex gap-4">
                    <span className="text-xs" style={{color:"#9CA3AF"}}>📅 {b.appointment_date}</span>
                    <span className="text-xs" style={{color:"#9CA3AF"}}>⏰ {b.slot_time?.slice(0,5)}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Packages */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold" style={{color:"#111827"}}>Health Packages</h2>
          <button onClick={()=>onNav("packages")} className="text-sm font-semibold cursor-pointer" style={{color:"#22C55E"}}>See all →</button>
        </div>
        <div className="space-y-3">
          {packages.slice(0,4).map(p=>(
            <button key={p.id} onClick={()=>{onNav("packages");}}
              className="w-full text-left rounded-2xl p-4 cursor-pointer transition-all hover:shadow-md"
              style={{background:"#FFFFFF",border:"1px solid #E5E7EB"}}>
              <div className="flex items-start justify-between">
                <div className="flex-1 mr-3">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-sm" style={{color:"#111827"}}>{p.name}</p>
                    {p.badge && <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{background:"#FFFBEB",color:"#92400E"}}>{p.badge}</span>}
                  </div>
                  <p className="text-xs mb-2" style={{color:"#6B7280"}}>{p.test_count} tests{p.fasting_required?" · Fasting required":""}</p>
                  {p.home_collection && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{background:"#EFF6FF",color:"#1D4ED8"}}>🏠 Home collection</span>}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-lg font-black" style={{color:"#22C55E"}}>{fmt(p.base_price)}</p>
                  {p.mrp&&p.mrp>p.base_price&&<p className="text-xs line-through" style={{color:"#D1D5DB"}}>{fmt(p.mrp)}</p>}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom nav */}
      <BottomNav current="home" onNav={onNav} />
    </div>
  );
}

// ─── PACKAGES PAGE ─────────────────────────────────────────────────────────────
function PackagesPage({ packages, onSelect, onBack }: { packages:Package[]; onSelect:(p:Package)=>void; onBack:()=>void }) {
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("All");
  const cats = ["All", ...Array.from(new Set(packages.map(p=>p.category).filter((c):c is string=>!!c)))];
  const filtered = packages.filter(p=>(cat==="All"||p.category===cat)&&(!search||p.name.toLowerCase().includes(search.toLowerCase())));

  return (
    <div className="min-h-screen" style={{background:"#F9FAFB"}}>
      {/* Header */}
      <div className="px-5 pt-14 pb-6" style={{background:"linear-gradient(160deg, #0B2545 0%, #1B4B8A 100%)"}}>
        <button onClick={onBack} className="text-white/60 text-sm mb-5 flex items-center gap-2 cursor-pointer hover:text-white/80">← Back</button>
        <h1 className="text-2xl font-black text-white mb-5">Health Packages</h1>
        <div className="rounded-2xl px-4 py-3 flex items-center gap-3 mb-4" style={{background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.15)"}}>
          <span className="text-white/40">🔍</span>
          <input className="flex-1 bg-transparent text-white text-sm outline-none placeholder-white/40" placeholder="Search packages…" value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {cats.map(c=>(
            <button key={c} onClick={()=>setCat(c)}
              className="px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap cursor-pointer transition-all flex-shrink-0"
              style={{background:cat===c?"#22C55E":"rgba(255,255,255,0.1)",color:"white"}}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 pb-24 space-y-3">
        {filtered.map(p=>(
          <button key={p.id} onClick={()=>onSelect(p)}
            className="w-full text-left rounded-2xl p-4 cursor-pointer transition-all hover:shadow-md"
            style={{background:"#FFFFFF",border:"1px solid #E5E7EB"}}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 mr-3">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold" style={{color:"#111827"}}>{p.name}</p>
                  {p.badge && <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{background:"#FFFBEB",color:"#92400E"}}>{p.badge}</span>}
                </div>
                {p.description && <p className="text-sm mb-2 leading-relaxed" style={{color:"#6B7280"}}>{p.description}</p>}
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xl font-black" style={{color:"#22C55E"}}>{fmt(p.base_price)}</p>
                {p.mrp&&p.mrp>p.base_price&&(
                  <>
                    <p className="text-xs line-through" style={{color:"#D1D5DB"}}>{fmt(p.mrp)}</p>
                    <p className="text-xs font-bold" style={{color:"#D97706"}}>{Math.round((p.mrp-p.base_price)/p.mrp*100)}% off</p>
                  </>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full" style={{background:"#F3F4F6",color:"#4B5563"}}>{p.test_count} tests</span>
              {p.fasting_required && <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full" style={{background:"#FFFBEB",color:"#D97706"}}>⚠ Fasting</span>}
              {p.home_collection && <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full" style={{background:"#EFF6FF",color:"#1D4ED8"}}>🏠 Home</span>}
            </div>
            <div className="mt-3 py-2.5 rounded-xl text-center font-bold text-sm" style={{background:"#22C55E",color:"white"}}>Book This Package →</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── SELECT LAB ────────────────────────────────────────────────────────────────
function SelectLabPage({ pkg, labs, onSelect, onBack }: { pkg:Package; labs:Lab[]; onSelect:(l:Lab)=>void; onBack:()=>void }) {
  return (
    <div className="min-h-screen" style={{background:"#F9FAFB"}}>
      <div className="px-5 pt-14 pb-6" style={{background:"linear-gradient(160deg, #0B2545 0%, #1B4B8A 100%)"}}>
        <button onClick={onBack} className="text-white/60 text-sm mb-5 flex items-center gap-2 cursor-pointer">← Back</button>
        <p className="text-sm font-semibold mb-1" style={{color:"#22C55E"}}>{pkg.name}</p>
        <h1 className="text-2xl font-black text-white">Select Lab</h1>
        <p className="text-sm mt-1" style={{color:"rgba(255,255,255,0.55)"}}>Choose a certified lab near you</p>
      </div>
      <div className="px-4 py-4 pb-24 space-y-3">
        {labs.map(l=>(
          <button key={l.id} onClick={()=>onSelect(l)}
            className="w-full text-left rounded-2xl p-4 cursor-pointer transition-all hover:shadow-md"
            style={{background:"#FFFFFF",border:"1px solid #E5E7EB"}}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 mr-3">
                <p className="font-bold mb-1" style={{color:"#111827"}}>{l.name}</p>
                <p className="text-sm" style={{color:"#6B7280"}}>{l.address||l.city}</p>
              </div>
              <p className="text-xl font-bold flex-shrink-0" style={{color:"#F59E0B"}}>★ {l.rating}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {l.nabl_certified && <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{background:"#F0FDF4",color:"#16A34A"}}>✓ NABL</span>}
              {l.home_collection && <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{background:"#EFF6FF",color:"#1D4ED8"}}>🏠 Home {fmt(l.home_collection_charge||0)}</span>}
              <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full" style={{background:"#F3F4F6",color:"#6B7280"}}>TAT {l.avg_tat_hours}h</span>
            </div>
            <div className="mt-3 py-2.5 rounded-xl text-center font-bold text-sm" style={{background:"rgba(11,37,69,0.08)",color:"#0B2545"}}>Select This Lab →</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── SELECT SLOT ───────────────────────────────────────────────────────────────
function SelectSlotPage({ pkg, lab, onSelect, onBack }: { pkg:Package; lab:Lab; onSelect:(d:string,s:string,t:string)=>void; onBack:()=>void }) {
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [type, setType] = useState("walkin");

  const dates = Array.from({length:7},(_,i)=>{
    const d=new Date(); d.setDate(d.getDate()+i+1);
    return { val:d.toISOString().split("T")[0], label:d.toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short"}) };
  });
  const slots = ["07:00","08:00","09:00","10:00","11:00","12:00","14:00","15:00","16:00","17:00","18:00","19:00"];

  return (
    <div className="min-h-screen" style={{background:"#F9FAFB"}}>
      <div className="px-5 pt-14 pb-6" style={{background:"linear-gradient(160deg, #0B2545 0%, #1B4B8A 100%)"}}>
        <button onClick={onBack} className="text-white/60 text-sm mb-5 flex items-center gap-2 cursor-pointer">← Back</button>
        <p className="text-sm font-semibold mb-1" style={{color:"#22C55E"}}>{lab.name}</p>
        <h1 className="text-2xl font-black text-white">Choose Slot</h1>
      </div>
      <div className="px-4 py-5 pb-32 space-y-5">
        {lab.home_collection && (
          <div>
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{color:"#6B7280"}}>Collection Type</p>
            <div className="grid grid-cols-2 gap-3">
              {[{v:"walkin",l:"🏥 Walk-in"},{v:"Home Collection",l:`🏠 Home +${fmt(lab.home_collection_charge||0)}`}].map(t=>(
                <button key={t.v} onClick={()=>setType(t.v)}
                  className="py-3.5 rounded-2xl font-bold text-sm cursor-pointer transition-all"
                  style={{border:`2px solid ${type===t.v?"#22C55E":"#E5E7EB"}`,background:type===t.v?"#DCFCE7":"#FFFFFF",color:type===t.v?"#16A34A":"#4B5563"}}>
                  {t.l}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{color:"#6B7280"}}>Select Date</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {dates.map(d=>(
              <button key={d.val} onClick={()=>setDate(d.val)}
                className="px-4 py-3 rounded-2xl text-center flex-shrink-0 cursor-pointer transition-all"
                style={{border:`2px solid ${date===d.val?"#22C55E":"#E5E7EB"}`,background:date===d.val?"#DCFCE7":"#FFFFFF",minWidth:"80px"}}>
                <p className="text-xs font-bold" style={{color:date===d.val?"#16A34A":"#4B5563"}}>{d.label}</p>
              </button>
            ))}
          </div>
        </div>

        {date && (
          <div>
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{color:"#6B7280"}}>Select Time</p>
            <div className="grid grid-cols-4 gap-2">
              {slots.map(s=>(
                <button key={s} onClick={()=>setSlot(s)}
                  className="py-3 rounded-xl font-bold text-sm cursor-pointer transition-all"
                  style={{border:`2px solid ${slot===s?"#22C55E":"#E5E7EB"}`,background:slot===s?"#DCFCE7":"#FFFFFF",color:slot===s?"#16A34A":"#4B5563"}}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {pkg.fasting_required && (
          <div className="rounded-2xl p-4" style={{background:"#FFFBEB",border:"1px solid #FDE68A"}}>
            <p className="text-sm font-semibold" style={{color:"#92400E"}}>⚠ This test requires 8–10 hours fasting before your appointment.</p>
          </div>
        )}

        <button onClick={()=>{if(date&&slot)onSelect(date,slot,type);}} disabled={!date||!slot}
          className="w-full py-4 rounded-2xl font-bold text-base text-white disabled:opacity-40 cursor-pointer transition-all hover:opacity-90"
          style={{background:"#22C55E",boxShadow:"0 8px 20px rgba(34,197,94,0.3)"}}>
          Continue →
        </button>
      </div>
    </div>
  );
}

// ─── CONFIRM PAGE ──────────────────────────────────────────────────────────────
function ConfirmPage({ pkg, lab, date, slot, type, user, onSuccess, onBack }: { pkg:Package; lab:Lab; date:string; slot:string; type:string; user:UserData; onSuccess:(id:string)=>void; onBack:()=>void }) {
  const [name, setName] = useState(user.name||"");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Male");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const charge = type==="Home Collection"?(lab.home_collection_charge||0):0;
  const total = pkg.base_price+charge;

  async function book() {
    if (!name.trim()||!age.trim()) { setErr("Enter patient name and age"); return; }
    setLoading(true); setErr("");
    const id = `CK-APT-${Date.now().toString(36).toUpperCase().slice(-8)}`;
    const{error}=await supabase.from("bookings").insert({
      id, lab_id:lab.id, package_id:pkg.id,
      patient_name:name.trim(), patient_age:parseInt(age)||0, patient_gender:gender,
      patient_phone:user.phone, appointment_date:date, slot_time:slot+":00",
      collection_type:type, amount:total, discount:0, status:"pending_payment",
      stage:"New", sla_status:"On Track", is_corporate:false,
      created_at:new Date().toISOString(), updated_at:new Date().toISOString(),
    });
    setLoading(false);
    if (error) { setErr(error.message); return; }
    onSuccess(id);
  }

  return (
    <div className="min-h-screen pb-32" style={{background:"#F9FAFB"}}>
      <div className="px-5 pt-14 pb-6" style={{background:"linear-gradient(160deg, #0B2545 0%, #1B4B8A 100%)"}}>
        <button onClick={onBack} className="text-white/60 text-sm mb-5 flex items-center gap-2 cursor-pointer">← Back</button>
        <h1 className="text-2xl font-black text-white">Confirm Booking</h1>
      </div>
      <div className="px-4 py-5 space-y-4">
        {/* Summary */}
        <div className="rounded-2xl p-4" style={{background:"#FFFFFF",border:"1px solid #E5E7EB"}}>
          <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{color:"#9CA3AF"}}>Booking Summary</p>
          {[["Package",pkg.name],["Lab",lab.name],["Date",date],["Time",slot],["Type",type]].map(([k,v])=>(
            <div key={k as string} className="flex justify-between py-2.5" style={{borderBottom:"1px solid #F3F4F6"}}>
              <span className="text-sm" style={{color:"#6B7280"}}>{k as string}</span>
              <span className="text-sm font-semibold" style={{color:"#111827"}}>{v as string}</span>
            </div>
          ))}
        </div>

        {/* Patient details */}
        <div className="rounded-2xl p-4" style={{background:"#FFFFFF",border:"1px solid #E5E7EB"}}>
          <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{color:"#9CA3AF"}}>Patient Details</p>
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{color:"#9CA3AF"}}>Full Name *</p>
              <input value={name} onChange={e=>setName(e.target.value)} placeholder="As per ID proof"
                className="w-full rounded-xl px-3.5 py-3 text-sm outline-none transition-all"
                style={{border:"1.5px solid #E5E7EB",color:"#111827"}}
                onFocus={e=>{e.target.style.borderColor="#22C55E";}} onBlur={e=>{e.target.style.borderColor="#E5E7EB";}} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{color:"#9CA3AF"}}>Age *</p>
                <input value={age} onChange={e=>setAge(e.target.value)} placeholder="25" inputMode="numeric"
                  className="w-full rounded-xl px-3.5 py-3 text-sm outline-none"
                  style={{border:"1.5px solid #E5E7EB",color:"#111827"}} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{color:"#9CA3AF"}}>Gender</p>
                <div className="flex gap-1.5">
                  {["M","F","O"].map((g,i)=>{
                    const full=["Male","Female","Other"][i];
                    return <button key={g} onClick={()=>setGender(full)}
                      className="flex-1 py-3 rounded-xl text-xs font-bold cursor-pointer transition-all"
                      style={{border:`1.5px solid ${gender===full?"#22C55E":"#E5E7EB"}`,background:gender===full?"#DCFCE7":"#FFFFFF",color:gender===full?"#16A34A":"#6B7280"}}>{g}</button>;
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Total */}
        <div className="rounded-2xl p-4" style={{background:"#DCFCE7",border:"1px solid #BBF7D0"}}>
          {charge>0 && <div className="flex justify-between text-sm mb-2"><span style={{color:"#4B5563"}}>Package</span><span style={{color:"#111827"}}>{fmt(pkg.base_price)}</span></div>}
          {charge>0 && <div className="flex justify-between text-sm mb-2"><span style={{color:"#4B5563"}}>Home Collection</span><span style={{color:"#111827"}}>{fmt(charge)}</span></div>}
          <div className="flex justify-between items-center" style={charge>0?{borderTop:"1px solid #BBF7D0",paddingTop:"8px"}:{}}>
            <span className="font-bold" style={{color:"#111827"}}>Total Amount</span>
            <span className="text-2xl font-black" style={{color:"#16A34A"}}>{fmt(total)}</span>
          </div>
        </div>

        {err && <p className="text-red-500 text-sm font-medium text-center">{err}</p>}

        <button onClick={book} disabled={loading}
          className="w-full py-4 rounded-2xl font-bold text-base text-white disabled:opacity-50 cursor-pointer transition-all hover:opacity-90"
          style={{background:"#22C55E",boxShadow:"0 8px 20px rgba(34,197,94,0.3)"}}>
          {loading ? "Processing…" : `Pay ${fmt(total)} & Confirm →`}
        </button>
        <p className="text-xs text-center" style={{color:"#9CA3AF"}}>Secure payment via Razorpay · Free cancellation</p>
      </div>
    </div>
  );
}

// ─── SUCCESS PAGE ─────────────────────────────────────────────────────────────
function SuccessPage({ bookingId, onHome }: { bookingId:string; onHome:()=>void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{background:"linear-gradient(160deg, #0B2545 0%, #1B4B8A 100%)"}}>
      <div className="fade-up text-center">
        <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{background:"#22C55E",boxShadow:"0 20px 50px rgba(34,197,94,0.5)"}}>
          <span className="text-5xl text-white">✓</span>
        </div>
        <h1 className="text-3xl font-black text-white mb-2" style={{letterSpacing:"-0.5px"}}>Booking Confirmed!</h1>
        <p className="text-base mb-4" style={{color:"rgba(255,255,255,0.6)"}}>Lab will confirm within 2 hours</p>
        <p className="font-mono text-sm mb-8 px-4 py-2 rounded-full inline-block" style={{background:"rgba(34,197,94,0.2)",color:"#22C55E"}}>{bookingId}</p>
        <div className="rounded-2xl p-4 mb-8 max-w-sm text-center" style={{background:"rgba(255,255,255,0.08)"}}>
          <p className="text-sm" style={{color:"rgba(255,255,255,0.6)"}}>📱 You will receive a WhatsApp confirmation once the lab confirms your slot</p>
        </div>
        <button onClick={onHome}
          className="px-8 py-4 rounded-2xl font-bold text-base cursor-pointer transition-all hover:opacity-90"
          style={{border:"2px solid rgba(255,255,255,0.3)",color:"white",background:"rgba(255,255,255,0.1)"}}>
          ← Back to Home
        </button>
      </div>
    </div>
  );
}

// ─── MY BOOKINGS ──────────────────────────────────────────────────────────────
function BookingsPage({ bookings, loading, onRefresh, onDetail, onBack }: { bookings:Booking[]; loading:boolean; onRefresh:()=>void; onDetail:(b:Booking)=>void; onBack:()=>void }) {
  const [tab, setTab] = useState<"Active"|"Past">("Active");
  const active = bookings.filter(b=>!["Received","Rejected"].includes(b.stage));
  const past = bookings.filter(b=>["Received","Rejected"].includes(b.stage));
  const shown = tab==="Active"?active:past;

  return (
    <div className="min-h-screen" style={{background:"#F9FAFB"}}>
      <div className="px-5 pt-14 pb-5" style={{background:"linear-gradient(160deg, #0B2545 0%, #1B4B8A 100%)"}}>
        <button onClick={onBack} className="text-white/60 text-sm mb-5 flex items-center gap-2 cursor-pointer">← Back</button>
        <h1 className="text-2xl font-black text-white mb-5">My Bookings</h1>
        <div className="flex gap-1 p-1 rounded-2xl" style={{background:"rgba(255,255,255,0.1)"}}>
          {(["Active","Past"] as const).map(t=>(
            <button key={t} onClick={()=>setTab(t)}
              className="flex-1 py-2.5 rounded-xl font-bold text-sm cursor-pointer transition-all"
              style={{background:tab===t?"#FFFFFF":"transparent",color:tab===t?"#0B2545":"rgba(255,255,255,0.7)"}}>
              {t} ({t==="Active"?active.length:past.length})
            </button>
          ))}
        </div>
      </div>
      <div className="px-4 py-4 pb-24 space-y-3">
        {loading ? <div className="py-20 text-center"><div className="w-8 h-8 border-2 border-gray-200 border-t-[#22C55E] rounded-full animate-spin mx-auto" /></div>
        : shown.length===0 ? (
          <div className="py-20 text-center"><p className="text-4xl mb-4">📅</p><p className="font-semibold text-gray-500">No {tab.toLowerCase()} bookings</p></div>
        ) : shown.map(b=>(
          <button key={b.id} onClick={()=>onDetail(b)}
            className="w-full text-left rounded-2xl p-4 cursor-pointer transition-all hover:shadow-md"
            style={{background:"#FFFFFF",border:"1px solid #E5E7EB"}}>
            <div className="flex items-start justify-between mb-2">
              <p className="font-bold" style={{color:"#111827"}}>{b.package?.name??"Health Checkup"}</p>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ml-2" style={{background:STAGES[b.stage]?.bg??"#F3F4F6",color:STAGES[b.stage]?.text??"#374151"}}>{b.stage}</span>
            </div>
            <p className="text-sm mb-3" style={{color:"#6B7280"}}>{b.lab?.name??"—"}</p>
            <div className="flex gap-4 text-xs" style={{color:"#9CA3AF"}}>
              <span>📅 {b.appointment_date}</span>
              <span>⏰ {b.slot_time?.slice(0,5)}</span>
              <span>💳 {fmt(b.amount)}</span>
            </div>
            {b.stage==="Received" && (
              <div className="mt-3 py-2.5 rounded-xl text-center text-sm font-bold" style={{background:"#F0FDF4",color:"#16A34A"}}>📄 Report ready — tap to view</div>
            )}
          </button>
        ))}
      </div>
      <BottomNav current="bookings" onNav={s=>s==="home"?onBack():s==="bookings"?onRefresh():null} />
    </div>
  );
}

// ─── BOOKING DETAIL ────────────────────────────────────────────────────────────
function BookingDetailPage({ booking: b, onBack }: { booking:Booking; onBack:()=>void }) {
  return (
    <div className="min-h-screen" style={{background:"#F9FAFB"}}>
      <div className="px-5 pt-14 pb-6" style={{background:"linear-gradient(160deg, #0B2545 0%, #1B4B8A 100%)"}}>
        <button onClick={onBack} className="text-white/60 text-sm mb-5 flex items-center gap-2 cursor-pointer">← Bookings</button>
        <h1 className="text-2xl font-black text-white">{b.id}</h1>
      </div>
      <div className="px-4 py-5 pb-24 space-y-4">
        <div className="rounded-2xl p-4" style={{background:"#FFFFFF",border:"1px solid #E5E7EB"}}>
          {[["Package",b.package?.name??"—"],["Lab",b.lab?.name??"—"],["Date",b.appointment_date],["Slot",b.slot_time?.slice(0,5)??"—"],["Type",b.collection_type],["Amount",fmt(b.amount)]].map(([k,v])=>(
            <div key={k as string} className="flex justify-between py-3" style={{borderBottom:"1px solid #F3F4F6"}}>
              <span className="text-sm" style={{color:"#6B7280"}}>{k as string}</span>
              <span className="text-sm font-semibold" style={{color:"#111827"}}>{v as string}</span>
            </div>
          ))}
          <div className="flex justify-between items-center py-3">
            <span className="text-sm" style={{color:"#6B7280"}}>Status</span>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{background:STAGES[b.stage]?.bg??"#F3F4F6",color:STAGES[b.stage]?.text??"#374151"}}>{b.stage}</span>
          </div>
        </div>
        {b.report_url && (
          <a href={b.report_url} target="_blank" rel="noreferrer"
            className="block w-full py-4 rounded-2xl text-center font-bold text-sm cursor-pointer" style={{background:"#F0FDF4",color:"#16A34A",border:"1.5px solid #BBF7D0"}}>
            📄 View Report PDF
          </a>
        )}
      </div>
    </div>
  );
}

// ─── REPORTS PAGE ─────────────────────────────────────────────────────────────
function ReportsPage({ bookings, onBack }: { bookings:Booking[]; onBack:()=>void }) {
  return (
    <div className="min-h-screen" style={{background:"#F9FAFB"}}>
      <div className="px-5 pt-14 pb-6" style={{background:"linear-gradient(160deg, #0B2545 0%, #1B4B8A 100%)"}}>
        <button onClick={onBack} className="text-white/60 text-sm mb-5 flex items-center gap-2 cursor-pointer">← Back</button>
        <h1 className="text-2xl font-black text-white">My Reports</h1>
        <p className="text-sm mt-1" style={{color:"rgba(255,255,255,0.55)"}}>{bookings.length} report{bookings.length!==1?"s":""} available</p>
      </div>
      <div className="px-4 py-4 pb-24 space-y-3">
        {bookings.length===0 ? (
          <div className="py-20 text-center"><p className="text-4xl mb-4">📄</p><p className="font-semibold" style={{color:"#6B7280"}}>No reports yet</p><p className="text-sm mt-2" style={{color:"#9CA3AF"}}>Reports appear once lab uploads them</p></div>
        ) : bookings.map(b=>(
          <div key={b.id} className="rounded-2xl p-4" style={{background:"#FFFFFF",border:"1px solid #E5E7EB"}}>
            <p className="font-bold mb-1" style={{color:"#111827"}}>{b.package?.name??"Health Checkup"}</p>
            <p className="text-sm mb-1" style={{color:"#6B7280"}}>{b.lab?.name??"—"}</p>
            <p className="text-xs mb-3" style={{color:"#9CA3AF"}}>📅 {b.appointment_date}</p>
            {b.report_url ? (
              <a href={b.report_url} target="_blank" rel="noreferrer"
                className="block py-2.5 rounded-xl text-center text-sm font-bold" style={{background:"#F0FDF4",color:"#16A34A",border:"1px solid #BBF7D0"}}>
                📄 View Report PDF
              </a>
            ) : (
              <div className="py-2.5 rounded-xl text-center text-xs font-semibold" style={{background:"#FFFBEB",color:"#D97706"}}>⏳ Processing — coming soon</div>
            )}
          </div>
        ))}
      </div>
      <BottomNav current="reports" onNav={s=>s==="home"?onBack():null} />
    </div>
  );
}

// ─── PROFILE PAGE ─────────────────────────────────────────────────────────────
function ProfilePage({ user, bookings, onSave, onLogout, onBack }: { user:UserData; bookings:Booking[]; onSave:(u:UserData)=>void; onLogout:()=>void; onBack:()=>void }) {
  const [name, setName] = useState(user.name||"");
  const [email, setEmail] = useState(user.email||"");
  const [city, setCity] = useState(user.city||"");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const totalSpend = bookings.reduce((s,b)=>s+b.amount,0);

  async function save() {
    setSaving(true);
    await supabase.from("users").update({name,email,city}).eq("phone",user.phone);
    onSave({...user,name,email,city});
    setSaving(false); setSaved(true);
    setTimeout(()=>setSaved(false),2500);
  }

  return (
    <div className="min-h-screen" style={{background:"#F9FAFB"}}>
      <div className="px-5 pt-14 pb-8 text-center" style={{background:"linear-gradient(160deg, #0B2545 0%, #1B4B8A 100%)"}}>
        <button onClick={onBack} className="text-white/60 text-sm mb-5 flex items-center gap-2 cursor-pointer">← Back</button>
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl font-black text-white" style={{background:"#22C55E"}}>
          {(user.name?.[0]||"U").toUpperCase()}
        </div>
        <p className="text-xl font-black text-white mb-1">{user.name||"Patient"}</p>
        <p className="text-sm" style={{color:"rgba(255,255,255,0.55)"}}>{user.phone}</p>
        <div className="flex justify-center gap-8 mt-5">
          {[{l:"Bookings",v:bookings.length},{l:"Reports",v:bookings.filter(b=>b.report_url).length},{l:"Spent",v:fmt(totalSpend)}].map(s=>(
            <div key={s.l} className="text-center">
              <p className="text-xl font-black text-white">{s.v}</p>
              <p className="text-xs" style={{color:"rgba(255,255,255,0.45)"}}>{s.l}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="px-4 py-5 pb-24 space-y-4">
        <div className="rounded-2xl p-4" style={{background:"#FFFFFF",border:"1px solid #E5E7EB"}}>
          <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{color:"#9CA3AF"}}>Personal Info</p>
          <div className="space-y-3">
            {[{l:"Full Name",v:name,s:setName,p:"Your name"},{l:"Email",v:email,s:setEmail,p:"email@example.com"},{l:"City",v:city,s:setCity,p:"Your city"}].map(f=>(
              <div key={f.l}>
                <p className="text-xs font-semibold uppercase tracking-wider mb-1.5" style={{color:"#9CA3AF"}}>{f.l}</p>
                <input value={f.v} onChange={e=>f.s(e.target.value)} placeholder={f.p}
                  className="w-full rounded-xl px-3.5 py-3 text-sm outline-none transition-all"
                  style={{border:"1.5px solid #E5E7EB",color:"#111827"}}
                  onFocus={e=>{e.target.style.borderColor="#22C55E";}} onBlur={e=>{e.target.style.borderColor="#E5E7EB";}} />
              </div>
            ))}
          </div>
          <button onClick={save} disabled={saving}
            className="w-full mt-4 py-3.5 rounded-xl font-bold text-sm text-white cursor-pointer transition-all"
            style={{background:saved?"#16A34A":"#22C55E"}}>
            {saving?"Saving…":saved?"✓ Saved!":"Save Profile"}
          </button>
        </div>
        <button onClick={()=>{if(confirm("Sign out?"))onLogout();}}
          className="w-full py-3.5 rounded-xl font-bold text-sm cursor-pointer"
          style={{background:"#FEF2F2",color:"#DC2626",border:"1px solid #FECACA"}}>
          Sign Out
        </button>
      </div>
      <BottomNav current="profile" onNav={s=>s==="home"?onBack():null} />
    </div>
  );
}

// ─── BOTTOM NAV ────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  {s:"home" as Screen,i:"⊞",l:"Home"},
  {s:"packages" as Screen,i:"🧪",l:"Book"},
  {s:"bookings" as Screen,i:"📅",l:"Bookings"},
  {s:"reports" as Screen,i:"📄",l:"Reports"},
  {s:"profile" as Screen,i:"👤",l:"Profile"},
];
function BottomNav({ current, onNav }: { current:string; onNav:(s:Screen)=>void }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 flex" style={{background:"#FFFFFF",borderTop:"1px solid #E5E7EB",paddingBottom:"env(safe-area-inset-bottom,8px)",paddingTop:"8px",zIndex:50}}>
      {NAV_ITEMS.map(n=>{
        const active = current===n.s;
        return (
          <button key={n.s} onClick={()=>onNav(n.s)} className="flex-1 flex flex-col items-center gap-0.5 py-1 cursor-pointer">
            <span className="text-xl">{n.i}</span>
            <span className="text-[10px] font-semibold" style={{color:active?"#22C55E":"#9CA3AF"}}>{n.l}</span>
            {active && <div className="w-1 h-1 rounded-full" style={{background:"#22C55E"}} />}
          </button>
        );
      })}
    </div>
  );
}
