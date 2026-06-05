"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { fmt, fmtDate, fmtTime } from "@/lib/utils";
import type { Pkg, Lab, Booking, User } from "@/types";

// ─── Constants ────────────────────────────────────────────────────────────────
const N = "#0B2545";     // navy
const N2 = "#1B4B8A";   // navy mid
const G = "#22C55E";    // green
const GD = "#16A34A";   // green dark
const DEMO: User = { id:"demo", phone:"+91-0000000000", name:"Demo User", email:"demo@checkupify.com", gender:"Male", city:"Hyderabad" };

const STAGES: Record<string, { bg: string; fg: string; label: string }> = {
  "New":               { bg:"#EFF6FF", fg:"#1D4ED8", label:"Booked" },
  "Confirmed":         { bg:"#F0FDF4", fg:"#15803D", label:"Confirmed ✓" },
  "Completed":         { bg:"#F0FDFA", fg:"#0D9488", label:"Completed" },
  "Pending Reports":   { bg:"#FFFBEB", fg:"#B45309", label:"Reports Pending" },
  "Partially Received":{ bg:"#FAF5FF", fg:"#7E22CE", label:"Partial Report" },
  "Received":          { bg:"#F0FDF4", fg:"#15803D", label:"Report Ready ✓" },
  "Rejected":          { bg:"#FEF2F2", fg:"#DC2626", label:"Cancelled" },
  "No Show":           { bg:"#F9FAFB", fg:"#6B7280", label:"No Show" },
};

type Screen = "splash"|"otp"|"verify"|"home"|"packages"|"lab"|"slot"|"confirm"|"success"|"bookings"|"detail"|"reports"|"profile";

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState<Screen>("splash");
  const [phone, setPhone] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [pkgs, setPkgs] = useState<Pkg[]>([]);
  const [labs, setLabs] = useState<Lab[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selPkg, setSelPkg] = useState<Pkg | null>(null);
  const [selLab, setSelLab] = useState<Lab | null>(null);
  const [selDate, setSelDate] = useState("");
  const [selSlot, setSelSlot] = useState("");
  const [selType, setSelType] = useState("walkin");
  const [doneId, setDoneId] = useState("");
  const [detailB, setDetailB] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async (u?: User) => {
    const usr = u ?? user;
    setLoading(true);
    const [pRes, lRes] = await Promise.allSettled([
      supabase.from("packages").select("*").eq("active", true).order("sort_order"),
      supabase.from("labs").select("*").eq("active", true),
    ]);
    if (pRes.status === "fulfilled" && pRes.value.data) setPkgs(pRes.value.data as Pkg[]);
    if (lRes.status === "fulfilled" && lRes.value.data) setLabs(lRes.value.data as Lab[]);
    if (usr?.phone) {
      const { data } = await supabase.from("bookings")
        .select("*,lab:labs(name,city),package:packages(name)")
        .eq("patient_phone", usr.phone)
        .order("created_at", { ascending: false });
      if (data) setBookings(data as Booking[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { setTimeout(() => setScreen("otp"), 2000); }, []);

  const go = (s: Screen) => setScreen(s);

  const S = {
    splash: <Splash />,
    otp: <OTPScreen onSend={p => { setPhone(p); go("verify"); }} onGuest={() => { setUser(DEMO); loadData(DEMO); go("home"); }} />,
    verify: <OTPVerify phone={phone} onDone={u => { setUser(u); loadData(u); go("home"); }} onBack={() => go("otp")} />,
  };
  if (screen in S) return (S as any)[screen];
  if (!user) return (S as any).otp;

  return (
    <div style={{ minHeight: "100svh", maxWidth: "480px", margin: "0 auto", background: "white", position: "relative" }}>
      {screen === "home" && <Home user={user} pkgs={pkgs} bookings={bookings} loading={loading} onNav={go} onRefresh={() => loadData()} />}
      {screen === "packages" && <Packages pkgs={pkgs} onSelect={p => { setSelPkg(p); go("lab"); }} onBack={() => go("home")} />}
      {screen === "lab" && selPkg && <SelectLab pkg={selPkg} labs={labs} onSelect={l => { setSelLab(l); go("slot"); }} onBack={() => go("packages")} />}
      {screen === "slot" && selPkg && selLab && <SelectSlot pkg={selPkg} lab={selLab} onSelect={(d, s, t) => { setSelDate(d); setSelSlot(s); setSelType(t); go("confirm"); }} onBack={() => go("lab")} />}
      {screen === "confirm" && selPkg && selLab && <Confirm pkg={selPkg} lab={selLab} date={selDate} slot={selSlot} type={selType} user={user} onSuccess={id => { setDoneId(id); loadData(); go("success"); }} onBack={() => go("slot")} />}
      {screen === "success" && <Success id={doneId} onHome={() => { loadData(); go("home"); }} />}
      {screen === "bookings" && <Bookings bookings={bookings} loading={loading} onDetail={b => { setDetailB(b); go("detail"); }} onRefresh={() => loadData()} onNav={go} />}
      {screen === "detail" && detailB && <Detail booking={detailB} onBack={() => go("bookings")} />}
      {screen === "reports" && <Reports bookings={bookings.filter(b => b.report_url || b.stage === "Received")} onNav={go} />}
      {screen === "profile" && <Profile user={user} bookings={bookings} onSave={u => setUser(u)} onLogout={() => { setUser(null); go("otp"); }} onNav={go} />}
    </div>
  );
}

// ─── Shared UI primitives ─────────────────────────────────────────────────────
const navyGrad = `linear-gradient(160deg, ${N} 0%, ${N2} 100%)`;
const greenGrad = `linear-gradient(135deg, ${G}, ${GD})`;

function Btn({ children, onClick, disabled, loading: l, ghost, outline, small }: {
  children: React.ReactNode; onClick?: () => void; disabled?: boolean;
  loading?: boolean; ghost?: boolean; outline?: boolean; small?: boolean;
}) {
  const base: React.CSSProperties = {
    width: small ? undefined : "100%", display: "flex", alignItems: "center",
    justifyContent: "center", gap: "8px", cursor: "pointer", border: "none",
    fontFamily: "inherit", fontWeight: 700, transition: "all .15s",
    fontSize: small ? "13px" : "15px", padding: small ? "8px 18px" : "15px 20px",
    borderRadius: small ? "10px" : "14px", opacity: disabled || l ? .55 : 1,
  };
  if (ghost) return (
    <button onClick={onClick} disabled={disabled || l} style={{ ...base, background: "rgba(255,255,255,.12)", color: "white", border: "1px solid rgba(255,255,255,.25)" }}>
      {l ? <Spinner white /> : children}
    </button>
  );
  if (outline) return (
    <button onClick={onClick} disabled={disabled || l} style={{ ...base, background: "white", color: N, border: `1.5px solid #E2E8F0`, boxShadow: "0 1px 3px rgba(11,37,69,.07)" }}>
      {l ? <Spinner /> : children}
    </button>
  );
  return (
    <button onClick={onClick} disabled={disabled || l} style={{ ...base, background: greenGrad, color: "white", boxShadow: "0 4px 16px rgba(34,197,94,.28)" }}>
      {l ? <Spinner white /> : children}
    </button>
  );
}

function Spinner({ white }: { white?: boolean }) {
  return <span className="spin" style={{ width: 18, height: 18, borderRadius: "50%", border: `2.5px solid ${white ? "rgba(255,255,255,.3)" : "rgba(34,197,94,.3)"}`, borderTopColor: white ? "white" : G, display: "inline-block", flexShrink: 0 }} />;
}

function NavBar({ active, onNav }: { active: Screen; onNav: (s: Screen) => void }) {
  const items = [
    { s: "home" as Screen, emoji: "🏠", label: "Home" },
    { s: "packages" as Screen, emoji: "🧪", label: "Book" },
    { s: "bookings" as Screen, emoji: "📅", label: "Bookings" },
    { s: "reports" as Screen, emoji: "📄", label: "Reports" },
    { s: "profile" as Screen, emoji: "👤", label: "Profile" },
  ];
  return (
    <div className="tab-bar" style={{ position: "fixed", bottom: 0, left: 0, right: 0, maxWidth: 480, margin: "0 auto", display: "flex", zIndex: 50, paddingBottom: "max(env(safe-area-inset-bottom,0px),8px)" }}>
      {items.map(n => {
        const isActive = active === n.s;
        return (
          <button key={n.s} onClick={() => onNav(n.s)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "8px 0", cursor: "pointer", background: "none", border: "none", fontFamily: "inherit" }}>
            <span style={{ fontSize: 20, lineHeight: 1 }}>{n.emoji}</span>
            <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 500, color: isActive ? G : "#94A3B8" }}>{n.label}</span>
            {isActive && <span style={{ width: 16, height: 2.5, borderRadius: 99, background: G, marginTop: 1 }} />}
          </button>
        );
      })}
    </div>
  );
}

function BackHeader({ title, subtitle, onBack, white }: { title: string; subtitle?: string; onBack: () => void; white?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
      <button onClick={onBack} style={{ width: 36, height: 36, borderRadius: 12, background: white ? "rgba(255,255,255,.15)" : "#F0F4F8", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: white ? "white" : N, fontSize: 18, fontFamily: "inherit" }}>
        ←
      </button>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 900, color: white ? "white" : N, letterSpacing: "-.3px", lineHeight: 1.2 }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 13, color: white ? "rgba(255,255,255,.55)" : "#7A90B3", marginTop: 2 }}>{subtitle}</p>}
      </div>
    </div>
  );
}

function StagePill({ stage }: { stage: string }) {
  const s = STAGES[stage] ?? { bg: "#F3F4F6", fg: "#6B7280", label: stage };
  return <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: s.bg, color: s.fg }}>{s.label}</span>;
}

// ─── Splash ───────────────────────────────────────────────────────────────────
function Splash() {
  return (
    <div style={{ minHeight: "100svh", background: navyGrad, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div className="scale-in" style={{ textAlign: "center" }}>
        <div style={{ width: 88, height: 88, borderRadius: 28, background: G, boxShadow: "0 20px 50px rgba(34,197,94,.45)", margin: "0 auto 28px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
            <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1 style={{ fontSize: 42, fontWeight: 900, color: "white", letterSpacing: "-1.5px", lineHeight: 1, marginBottom: 10 }}>Checkupify</h1>
        <p style={{ fontSize: 17, color: "rgba(255,255,255,.55)", fontWeight: 400 }}>Your Health. Simplified.</p>
      </div>
      <div style={{ position: "absolute", bottom: 52, display: "flex", alignItems: "center", gap: 8 }}>
        <span className="spin" style={{ width: 22, height: 22, borderRadius: "50%", border: "2.5px solid rgba(255,255,255,.15)", borderTopColor: G, display: "inline-block" }} />
        <span style={{ fontSize: 13, color: "rgba(255,255,255,.4)" }}>Loading…</span>
      </div>
    </div>
  );
}

// ─── OTP Screen ───────────────────────────────────────────────────────────────
function OTPScreen({ onSend, onGuest }: { onSend: (p: string) => void; onGuest: () => void }) {
  const [ph, setPh] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function send() {
    const c = ph.replace(/\D/g, "");
    if (c.length !== 10) { setErr("Enter valid 10-digit number"); return; }
    setLoading(true); setErr("");
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await supabase.from("otp_sessions").upsert({ phone: `+91${c}`, otp, expires_at: new Date(Date.now() + 600000).toISOString(), used: false });
    setLoading(false);
    onSend(`+91${c}`);
  }

  return (
    <div style={{ minHeight: "100svh", background: navyGrad, display: "flex", flexDirection: "column" }}>
      {/* Hero */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px 28px 32px" }}>
        <div className="fade-up">
          <div style={{ width: 52, height: 52, borderRadius: 18, background: G, marginBottom: 28, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px rgba(34,197,94,.35)" }}>
            <span style={{ fontSize: 26, fontWeight: 900, color: "white", fontFamily: "inherit" }}>C</span>
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 900, color: "white", letterSpacing: "-1px", lineHeight: 1.1, marginBottom: 10 }}>Welcome to<br />Checkupify</h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,.5)", marginBottom: 36, fontWeight: 400 }}>Book health checkups in minutes</p>
        </div>

        {/* Phone input */}
        <div className="fade-up delay-1" style={{ background: "rgba(255,255,255,.08)", border: "1.5px solid rgba(255,255,255,.12)", borderRadius: 16, display: "flex", overflow: "hidden", marginBottom: 12 }}>
          <div style={{ padding: "0 18px", display: "flex", alignItems: "center", borderRight: "1px solid rgba(255,255,255,.12)" }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: "white", whiteSpace: "nowrap" }}>🇮🇳 +91</span>
          </div>
          <input
            type="tel" inputMode="numeric" maxLength={10} value={ph}
            onChange={e => { setPh(e.target.value.replace(/\D/g, "")); setErr(""); }}
            placeholder="98765 43210"
            onKeyDown={e => e.key === "Enter" && send()}
            style={{ flex: 1, background: "transparent", border: "none", padding: "16px 18px", fontSize: 20, fontWeight: 700, color: "white", outline: "none", letterSpacing: 2, fontFamily: "inherit" }}
          />
        </div>
        {err && <p style={{ fontSize: 13, color: "#FCA5A5", marginBottom: 12, paddingLeft: 4 }}>{err}</p>}

        <div className="fade-up delay-2">
          <Btn onClick={send} loading={loading}>Get OTP →</Btn>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: "0 28px 48px", textAlign: "center" }} className="fade-up delay-3">
        <button onClick={onGuest} style={{ background: "none", border: "1px solid rgba(255,255,255,.15)", borderRadius: 12, padding: "10px 24px", color: "rgba(255,255,255,.4)", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
          Continue as guest (demo mode)
        </button>
        <p style={{ marginTop: 16, fontSize: 12, color: "rgba(255,255,255,.25)" }}>By continuing, you agree to our Terms & Privacy Policy</p>
      </div>
    </div>
  );
}

// ─── OTP Verify ───────────────────────────────────────────────────────────────
function OTPVerify({ phone, onDone, onBack }: { phone: string; onDone: (u: User) => void; onBack: () => void }) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function verify() {
    if (otp.length !== 6) { setErr("Enter 6-digit OTP"); return; }
    setLoading(true); setErr("");
    const { data } = await supabase.from("otp_sessions").select("*").eq("phone", phone).eq("used", false).single();
    if (!data || (otp !== data.otp && otp !== "123456")) {
      setErr("Wrong OTP. Use 123456 for demo."); setLoading(false); return;
    }
    await supabase.from("otp_sessions").update({ used: true }).eq("phone", phone);
    let { data: u } = await supabase.from("users").select("*").eq("phone", phone).single();
    if (!u) {
      const { data: nu } = await supabase.from("users").insert({ phone, name: "", email: "", gender: "Male", city: "" }).select().single();
      u = nu;
    }
    setLoading(false);
    if (u) onDone(u as User);
  }

  return (
    <div style={{ minHeight: "100svh", background: navyGrad, display: "flex", flexDirection: "column", padding: "60px 28px 48px" }}>
      <BackHeader title="Verify OTP" subtitle={`Sent to ${phone}`} onBack={onBack} white />
      <div className="fade-up" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <input
          type="tel" inputMode="numeric" maxLength={6} value={otp}
          onChange={e => { setOtp(e.target.value.replace(/\D/g, "")); setErr(""); }}
          style={{ width: "100%", background: "rgba(255,255,255,.1)", border: "1.5px solid rgba(255,255,255,.15)", borderRadius: 16, padding: 20, fontSize: 40, fontWeight: 900, color: "white", letterSpacing: 16, textAlign: "center", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
        />
        <div style={{ background: "rgba(99,102,241,.15)", border: "1px solid rgba(99,102,241,.25)", borderRadius: 12, padding: "10px 16px", margin: "14px 0 20px", textAlign: "center" }}>
          <span style={{ fontSize: 13, color: "#A5B4FC", fontWeight: 600 }}>Demo: use OTP <strong style={{ color: "#818CF8" }}>123456</strong></span>
        </div>
        {err && <p style={{ fontSize: 13, color: "#FCA5A5", textAlign: "center", marginBottom: 16 }}>{err}</p>}
        <Btn onClick={verify} loading={loading} disabled={otp.length < 6}>Verify & Continue →</Btn>
        <button onClick={() => {}} style={{ marginTop: 16, color: "rgba(255,255,255,.35)", fontSize: 13, background: "none", border: "none", cursor: "pointer", textAlign: "center", fontFamily: "inherit", width: "100%" }}>
          Resend OTP in 30s
        </button>
      </div>
    </div>
  );
}

// ─── Home ─────────────────────────────────────────────────────────────────────
function Home({ user, pkgs, bookings, loading, onNav, onRefresh }: { user: User; pkgs: Pkg[]; bookings: Booking[]; loading: boolean; onNav: (s: Screen) => void; onRefresh: () => void }) {
  const upcoming = bookings.filter(b => !["Received", "Rejected"].includes(b.stage)).slice(0, 2);
  const completed = bookings.filter(b => b.stage === "Received").length;
  const score = completed > 0 ? Math.min(100, 45 + completed * 11) : 0;
  const todayStr = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div style={{ minHeight: "100svh", background: "#F0F4F8", paddingBottom: 80 }}>
      {/* Hero Header */}
      <div style={{ background: navyGrad, padding: "52px 20px 90px", position: "relative", overflow: "hidden" }}>
        {/* Decorative */}
        <div style={{ position: "absolute", right: -40, top: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(34,197,94,.08)" }} />
        <div style={{ position: "absolute", right: 40, bottom: -60, width: 130, height: 130, borderRadius: "50%", background: "rgba(255,255,255,.04)" }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative" }}>
          <div className="fade-up">
            <p style={{ fontSize: 12, fontWeight: 700, color: G, marginBottom: 6, letterSpacing: ".05em" }}>{todayStr}</p>
            <h1 style={{ fontSize: 26, fontWeight: 900, color: "white", letterSpacing: "-.5px" }}>
              Hi {user.name?.split(" ")[0] || "there"} 👋
            </h1>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,.5)", marginTop: 4 }}>What would you like to check today?</p>
          </div>
          <button onClick={() => onNav("profile")}
            style={{ width: 46, height: 46, borderRadius: "50%", background: G, border: "2.5px solid rgba(255,255,255,.2)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 900, color: "white", fontFamily: "inherit", boxShadow: "0 4px 14px rgba(34,197,94,.35)", flexShrink: 0 }}>
            {(user.name?.[0] || "U").toUpperCase()}
          </button>
        </div>

        {/* Health score */}
        <div className="fade-up delay-1" style={{ marginTop: 24, background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 20, padding: 18, display: "flex", alignItems: "center", gap: 16, position: "relative" }}>
          <div style={{ width: 60, height: 60, borderRadius: "50%", border: `3px solid ${score > 0 ? G : "rgba(255,255,255,.2)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, position: "relative" }}>
            <span style={{ fontSize: 20, fontWeight: 900, color: score > 0 ? G : "rgba(255,255,255,.4)" }}>{score > 0 ? score : "—"}</span>
          </div>
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: "white", marginBottom: 3 }}>Health Score</p>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,.5)", lineHeight: 1.4 }}>
              {score > 0 ? (score >= 80 ? "🟢 Excellent! Keep it up" : "🟡 Good — book a checkup") : "Book your first test to see your score"}
            </p>
          </div>
        </div>
      </div>

      {/* Quick actions — float over gradient */}
      <div style={{ margin: "-52px 16px 0", position: "relative", zIndex: 10 }} className="fade-up delay-2">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
          {[
            { emoji: "🧪", label: "Book Test", s: "packages" as Screen, accent: true },
            { emoji: "📅", label: "My Bookings", s: "bookings" as Screen },
            { emoji: "📄", label: "Reports", s: "reports" as Screen },
            { emoji: "👤", label: "Profile", s: "profile" as Screen },
          ].map(a => (
            <button key={a.s} onClick={() => onNav(a.s)}
              style={{
                background: a.accent ? G : "white", borderRadius: 16, border: a.accent ? "none" : "1px solid #E2E8F0",
                boxShadow: a.accent ? "0 8px 24px rgba(34,197,94,.3)" : "0 2px 8px rgba(11,37,69,.07)",
                padding: "14px 8px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer", fontFamily: "inherit",
              }}>
              <span style={{ fontSize: 22 }}>{a.emoji}</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: a.accent ? "white" : "#3D5A80", lineHeight: 1.2, textAlign: "center" }}>{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "20px 16px" }}>
        {/* Upcoming appointments */}
        {upcoming.length > 0 && (
          <div style={{ marginBottom: 24 }} className="fade-up">
            <p style={{ fontSize: 15, fontWeight: 800, color: N, marginBottom: 12 }}>Upcoming Appointments</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {upcoming.map(b => (
                <button key={b.id} onClick={() => onNav("bookings")}
                  style={{ background: "white", borderRadius: 18, border: "1px solid #E2E8F0", boxShadow: "0 2px 8px rgba(11,37,69,.06)", padding: 16, textAlign: "left", cursor: "pointer", width: "100%", fontFamily: "inherit" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: N, flex: 1, marginRight: 8 }}>{b.package?.name ?? "Health Checkup"}</p>
                    <StagePill stage={b.stage} />
                  </div>
                  <p style={{ fontSize: 13, color: "#7A90B3", marginBottom: 10 }}>{b.lab?.name ?? "—"} · {b.lab?.city ?? "—"}</p>
                  <div style={{ display: "flex", gap: 16, fontSize: 12, color: "#94A3B8" }}>
                    <span>📅 {b.appointment_date}</span>
                    <span>⏰ {fmtTime(b.slot_time)}</span>
                    <span>💳 {fmt(b.amount)}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Packages */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }} className="fade-up">
          <p style={{ fontSize: 15, fontWeight: 800, color: N }}>Popular Packages</p>
          <button onClick={() => onNav("packages")} style={{ fontSize: 13, fontWeight: 700, color: G, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>See all →</button>
        </div>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[1, 2, 3].map(i => <div key={i} className="sk" style={{ height: 110 }} />)}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {pkgs.slice(0, 4).map((p, i) => (
              <button key={p.id} onClick={() => { /* navigate via state */ onNav("packages"); }}
                className={`fade-up delay-${Math.min(i + 1, 3)}`}
                style={{ background: "white", borderRadius: 18, border: "1px solid #E2E8F0", boxShadow: "0 2px 8px rgba(11,37,69,.06)", padding: 16, textAlign: "left", cursor: "pointer", width: "100%", fontFamily: "inherit" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1, marginRight: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: N }}>{p.name}</p>
                      {p.badge && <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 7px", borderRadius: 99, background: "#FFFBEB", color: "#92400E" }}>{p.badge}</span>}
                    </div>
                    <p style={{ fontSize: 12, color: "#7A90B3", marginBottom: 8, lineHeight: 1.4 }}>
                      {p.test_count} tests{p.fasting_required ? " · Fasting required" : ""}
                    </p>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {p.home_collection && <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 99, background: "#EFF6FF", color: "#1D4ED8" }}>🏠 Home collection</span>}
                      {p.category && <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 99, background: "#F0F4F8", color: "#3D5A80" }}>{p.category}</span>}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p style={{ fontSize: 20, fontWeight: 900, color: G }}>{fmt(p.base_price)}</p>
                    {p.mrp && p.mrp > p.base_price && (
                      <>
                        <p style={{ fontSize: 11, color: "#CBD5E1", textDecoration: "line-through", marginTop: 1 }}>{fmt(p.mrp)}</p>
                        <p style={{ fontSize: 11, fontWeight: 700, color: "#D97706" }}>{Math.round((p.mrp - p.base_price) / p.mrp * 100)}% off</p>
                      </>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      <NavBar active="home" onNav={onNav} />
    </div>
  );
}

// ─── Packages ─────────────────────────────────────────────────────────────────
function Packages({ pkgs, onSelect, onBack }: { pkgs: Pkg[]; onSelect: (p: Pkg) => void; onBack: () => void }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const cats = ["All", ...Array.from(new Set(pkgs.map(p => p.category).filter((c): c is string => !!c)))];
  const filtered = pkgs.filter(p => (cat === "All" || p.category === cat) && (!q || p.name.toLowerCase().includes(q.toLowerCase())));

  return (
    <div style={{ minHeight: "100svh", background: "#F0F4F8" }}>
      <div style={{ background: navyGrad, padding: "52px 20px 24px" }}>
        <BackHeader title="Health Packages" subtitle={`${filtered.length} available`} onBack={onBack} white />
        <div style={{ background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.15)", borderRadius: 14, display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", marginBottom: 16 }}>
          <span style={{ fontSize: 16, color: "rgba(255,255,255,.4)" }}>🔍</span>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search tests & packages…"
            style={{ flex: 1, background: "transparent", border: "none", fontSize: 15, color: "white", outline: "none", fontFamily: "inherit" }} />
        </div>
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
          {cats.map(c => (
            <button key={c} onClick={() => setCat(c)}
              style={{ padding: "8px 18px", borderRadius: 99, whiteSpace: "nowrap", cursor: "pointer", border: "none", fontFamily: "inherit", fontSize: 13, fontWeight: 700, background: cat === c ? G : "rgba(255,255,255,.12)", color: "white", boxShadow: cat === c ? "0 4px 12px rgba(34,197,94,.3)" : "none", transition: "all .15s", flexShrink: 0 }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "16px 16px 32px", display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.map(p => (
          <button key={p.id} onClick={() => onSelect(p)}
            style={{ background: "white", borderRadius: 20, border: "1px solid #E2E8F0", boxShadow: "0 2px 10px rgba(11,37,69,.07)", padding: 18, textAlign: "left", cursor: "pointer", width: "100%", fontFamily: "inherit" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div style={{ flex: 1, marginRight: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5, flexWrap: "wrap" }}>
                  <p style={{ fontSize: 16, fontWeight: 800, color: N }}>{p.name}</p>
                  {p.badge && <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 99, background: "#FFFBEB", color: "#92400E" }}>{p.badge}</span>}
                </div>
                {p.description && <p style={{ fontSize: 13, color: "#7A90B3", lineHeight: 1.5, marginBottom: 4 }}>{p.description}</p>}
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <p style={{ fontSize: 22, fontWeight: 900, color: G }}>{fmt(p.base_price)}</p>
                {p.mrp && p.mrp > p.base_price && (
                  <>
                    <p style={{ fontSize: 12, color: "#CBD5E1", textDecoration: "line-through" }}>{fmt(p.mrp)}</p>
                    <p style={{ fontSize: 12, fontWeight: 800, color: "#F59E0B" }}>{Math.round((p.mrp - p.base_price) / p.mrp * 100)}% off</p>
                  </>
                )}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 99, background: "#F0F4F8", color: "#3D5A80" }}>{p.test_count} tests</span>
              {p.fasting_required && <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 99, background: "#FFFBEB", color: "#D97706" }}>⚠ Fasting</span>}
              {p.home_collection && <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 99, background: "#EFF6FF", color: "#1D4ED8" }}>🏠 Home available</span>}
            </div>
            <div style={{ background: navyGrad, borderRadius: 12, padding: "11px", textAlign: "center", fontSize: 13, fontWeight: 700, color: "white" }}>
              Book this package →
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <div style={{ padding: "60px 0", textAlign: "center" }}>
            <p style={{ fontSize: 36, marginBottom: 12 }}>🔍</p>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#7A90B3" }}>No packages found</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Select Lab ───────────────────────────────────────────────────────────────
function SelectLab({ pkg, labs, onSelect, onBack }: { pkg: Pkg; labs: Lab[]; onSelect: (l: Lab) => void; onBack: () => void }) {
  return (
    <div style={{ minHeight: "100svh", background: "#F0F4F8" }}>
      <div style={{ background: navyGrad, padding: "52px 20px 24px" }}>
        <BackHeader title="Select Lab" subtitle={pkg.name} onBack={onBack} white />
        <div style={{ background: "rgba(255,255,255,.08)", borderRadius: 12, padding: "10px 14px" }}>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,.5)", fontWeight: 600 }}>💡 All labs are NABL certified and quality verified</p>
        </div>
      </div>
      <div style={{ padding: "16px 16px 32px", display: "flex", flexDirection: "column", gap: 12 }}>
        {labs.map(l => (
          <button key={l.id} onClick={() => onSelect(l)}
            style={{ background: "white", borderRadius: 20, border: "1px solid #E2E8F0", boxShadow: "0 2px 10px rgba(11,37,69,.07)", padding: 18, textAlign: "left", cursor: "pointer", width: "100%", fontFamily: "inherit" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
              <div style={{ flex: 1, marginRight: 12 }}>
                <p style={{ fontSize: 16, fontWeight: 800, color: N, marginBottom: 4 }}>{l.name}</p>
                <p style={{ fontSize: 13, color: "#7A90B3" }}>{l.address ?? l.city}</p>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <p style={{ fontSize: 22, fontWeight: 900, color: "#F59E0B" }}>★ {l.rating}</p>
                <p style={{ fontSize: 11, color: "#94A3B8" }}>TAT {l.avg_tat_hours}h</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
              {l.nabl_certified && <span style={{ fontSize: 11, fontWeight: 800, padding: "4px 10px", borderRadius: 99, background: "#F0FDF4", color: "#15803D" }}>✓ NABL Certified</span>}
              {l.home_collection && <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 99, background: "#EFF6FF", color: "#1D4ED8" }}>🏠 Home +{fmt(l.home_collection_charge)}</span>}
            </div>
            <div style={{ background: "#F0F4F8", borderRadius: 12, padding: "11px", textAlign: "center", fontSize: 13, fontWeight: 700, color: N }}>
              Select this lab →
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Select Slot ─────────────────────────────────────────────────────────────
function SelectSlot({ pkg, lab, onSelect, onBack }: { pkg: Pkg; lab: Lab; onSelect: (d: string, s: string, t: string) => void; onBack: () => void }) {
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [type, setType] = useState("walkin");

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i + 1);
    return { val: d.toISOString().split("T")[0], day: d.toLocaleDateString("en-IN", { weekday: "short" }), num: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }) };
  });
  const slots = ["07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];

  return (
    <div style={{ minHeight: "100svh", background: "#F0F4F8" }}>
      <div style={{ background: navyGrad, padding: "52px 20px 24px" }}>
        <BackHeader title="Choose Slot" subtitle={`${lab.name} · ${pkg.name}`} onBack={onBack} white />
      </div>
      <div style={{ padding: "20px 16px 100px", display: "flex", flexDirection: "column", gap: 20 }}>
        {lab.home_collection && (
          <div>
            <p style={{ fontSize: 12, fontWeight: 800, color: "#7A90B3", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10 }}>Collection Type</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { v: "walkin", l: "🏥 Walk-in", sub: "Visit the lab" },
                { v: "Home Collection", l: "🏠 Home", sub: `+${fmt(lab.home_collection_charge)}` },
              ].map(t => (
                <button key={t.v} onClick={() => setType(t.v)}
                  style={{ padding: "14px 12px", borderRadius: 14, cursor: "pointer", fontFamily: "inherit", border: `2px solid ${type === t.v ? G : "#E2E8F0"}`, background: type === t.v ? "rgba(34,197,94,.06)" : "white", textAlign: "center", transition: "all .15s" }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: type === t.v ? GD : N, marginBottom: 3 }}>{t.l}</p>
                  <p style={{ fontSize: 11, color: type === t.v ? G : "#94A3B8" }}>{t.sub}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <p style={{ fontSize: 12, fontWeight: 800, color: "#7A90B3", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10 }}>Select Date</p>
          <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 }}>
            {dates.map(d => (
              <button key={d.val} onClick={() => { setDate(d.val); setSlot(""); }}
                style={{ flexShrink: 0, padding: "12px 14px", borderRadius: 16, cursor: "pointer", fontFamily: "inherit", border: `2px solid ${date === d.val ? G : "#E2E8F0"}`, background: date === d.val ? "rgba(34,197,94,.06)" : "white", textAlign: "center", minWidth: 72, transition: "all .15s" }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: date === d.val ? G : "#94A3B8", marginBottom: 3 }}>{d.day}</p>
                <p style={{ fontSize: 13, fontWeight: 800, color: date === d.val ? GD : N }}>{d.num}</p>
              </button>
            ))}
          </div>
        </div>

        {date && (
          <div className="fade-up">
            <p style={{ fontSize: 12, fontWeight: 800, color: "#7A90B3", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10 }}>Select Time</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
              {slots.map(s => (
                <button key={s} onClick={() => setSlot(s)}
                  style={{ padding: "12px 4px", borderRadius: 12, cursor: "pointer", fontFamily: "inherit", border: `2px solid ${slot === s ? G : "#E2E8F0"}`, background: slot === s ? "rgba(34,197,94,.06)" : "white", fontSize: 13, fontWeight: 700, color: slot === s ? GD : N, transition: "all .15s" }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {pkg.fasting_required && (
          <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 14, padding: "13px 16px" }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#92400E" }}>⚠ This test requires 8–10 hours of fasting before your appointment</p>
          </div>
        )}

        <Btn onClick={() => { if (date && slot) onSelect(date, slot, type); }} disabled={!date || !slot}>
          Continue → {date && slot ? `${date} · ${slot}` : ""}
        </Btn>
      </div>
    </div>
  );
}

// ─── Confirm Booking ─────────────────────────────────────────────────────────
function Confirm({ pkg, lab, date, slot, type, user, onSuccess, onBack }: { pkg: Pkg; lab: Lab; date: string; slot: string; type: string; user: User; onSuccess: (id: string) => void; onBack: () => void }) {
  const [name, setName] = useState(user.name || "");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Male");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const charge = type === "Home Collection" ? (lab.home_collection_charge || 0) : 0;
  const total = pkg.base_price + charge;

  const inp: React.CSSProperties = { width: "100%", background: "white", border: "1.5px solid #E2E8F0", borderRadius: 12, padding: "12px 14px", fontSize: 14, color: N, outline: "none", fontFamily: "inherit", boxSizing: "border-box" };

  async function book() {
    if (!name.trim() || !age.trim()) { setErr("Enter patient name and age"); return; }
    setLoading(true); setErr("");
    const id = "CK" + Date.now().toString(36).toUpperCase().slice(-8);
    const { error } = await supabase.from("bookings").insert({
      id, lab_id: lab.id, package_id: pkg.id,
      patient_name: name.trim(), patient_age: parseInt(age) || 0, patient_gender: gender,
      patient_phone: user.phone, appointment_date: date, slot_time: slot + ":00",
      collection_type: type, amount: total, discount: 0,
      status: "pending_payment", stage: "New", sla_status: "On Track", is_corporate: false,
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    });
    setLoading(false);
    if (error) { setErr(error.message); return; }
    onSuccess(id);
  }

  return (
    <div style={{ minHeight: "100svh", background: "#F0F4F8" }}>
      <div style={{ background: navyGrad, padding: "52px 20px 24px" }}>
        <BackHeader title="Confirm Booking" onBack={onBack} white />
      </div>
      <div style={{ padding: "16px 16px 100px", display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Summary */}
        <div style={{ background: "white", borderRadius: 20, border: "1px solid #E2E8F0", boxShadow: "0 2px 8px rgba(11,37,69,.06)", padding: 18 }}>
          <p style={{ fontSize: 12, fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 12 }}>Booking Summary</p>
          {[["Package", pkg.name], ["Lab", lab.name], ["Date", date], ["Time", slot], ["Type", type]].map(([k, v]) => (
            <div key={k as string} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid #F8FAFC" }}>
              <span style={{ fontSize: 13, color: "#7A90B3" }}>{k as string}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: N }}>{v as string}</span>
            </div>
          ))}
        </div>

        {/* Patient details */}
        <div style={{ background: "white", borderRadius: 20, border: "1px solid #E2E8F0", boxShadow: "0 2px 8px rgba(11,37,69,.06)", padding: 18 }}>
          <p style={{ fontSize: 12, fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 14 }}>Patient Details</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", marginBottom: 6 }}>Full Name *</p>
              <input style={inp} value={name} onChange={e => setName(e.target.value)} placeholder="As per ID proof"
                onFocus={e => { e.target.style.borderColor = G; e.target.style.boxShadow = `0 0 0 3px rgba(34,197,94,.1)`; }}
                onBlur={e => { e.target.style.borderColor = "#E2E8F0"; e.target.style.boxShadow = "none"; }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", marginBottom: 6 }}>Age *</p>
                <input style={inp} value={age} onChange={e => setAge(e.target.value)} placeholder="25" inputMode="numeric"
                  onFocus={e => { e.target.style.borderColor = G; e.target.style.boxShadow = `0 0 0 3px rgba(34,197,94,.1)`; }}
                  onBlur={e => { e.target.style.borderColor = "#E2E8F0"; e.target.style.boxShadow = "none"; }} />
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", marginBottom: 6 }}>Gender</p>
                <div style={{ display: "flex", gap: 6 }}>
                  {["M", "F", "O"].map((g, i) => {
                    const full = ["Male", "Female", "Other"][i];
                    return (
                      <button key={g} onClick={() => setGender(full)}
                        style={{ flex: 1, padding: "12px 0", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", border: `1.5px solid ${gender === full ? G : "#E2E8F0"}`, background: gender === full ? "rgba(34,197,94,.06)" : "white", color: gender === full ? GD : "#7A90B3" }}>
                        {g}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Price */}
        <div style={{ background: "rgba(34,197,94,.06)", border: "1.5px solid rgba(34,197,94,.2)", borderRadius: 16, padding: 16 }}>
          {charge > 0 && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 8 }}>
                <span style={{ color: "#7A90B3" }}>Package price</span><span style={{ color: N, fontWeight: 600 }}>{fmt(pkg.base_price)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid rgba(34,197,94,.15)" }}>
                <span style={{ color: "#7A90B3" }}>Home collection</span><span style={{ color: N, fontWeight: 600 }}>{fmt(charge)}</span>
              </div>
            </>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: N }}>Total Amount</span>
            <span style={{ fontSize: 26, fontWeight: 900, color: GD }}>{fmt(total)}</span>
          </div>
        </div>

        {err && <p style={{ fontSize: 13, color: "#EF4444", fontWeight: 600, textAlign: "center" }}>{err}</p>}
        <Btn onClick={book} loading={loading} disabled={!name.trim() || !age.trim()}>Pay {fmt(total)} & Confirm →</Btn>
        <p style={{ fontSize: 11, textAlign: "center", color: "#94A3B8" }}>🔒 Secure booking · Free cancellation within 2 hours</p>
      </div>
    </div>
  );
}

// ─── Success ─────────────────────────────────────────────────────────────────
function Success({ id, onHome }: { id: string; onHome: () => void }) {
  return (
    <div style={{ minHeight: "100svh", background: navyGrad, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 28px" }}>
      <div className="scale-in" style={{ textAlign: "center", maxWidth: 360 }}>
        <div style={{ width: 100, height: 100, borderRadius: "50%", background: G, boxShadow: "0 20px 60px rgba(34,197,94,.5)", margin: "0 auto 28px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="52" height="52" viewBox="0 0 24 24" fill="none">
            <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 style={{ fontSize: 34, fontWeight: 900, color: "white", letterSpacing: "-1px", marginBottom: 10 }}>Booking Confirmed!</h1>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,.55)", marginBottom: 20, lineHeight: 1.5 }}>Lab will confirm your slot within 2 hours via WhatsApp</p>
        <div style={{ background: "rgba(34,197,94,.15)", border: "1px solid rgba(34,197,94,.3)", borderRadius: 12, padding: "10px 20px", display: "inline-block", marginBottom: 32 }}>
          <span style={{ fontFamily: "monospace", fontSize: 15, color: G, fontWeight: 700 }}>{id}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Btn onClick={onHome}>← Back to Home</Btn>
        </div>
      </div>
    </div>
  );
}

// ─── My Bookings ─────────────────────────────────────────────────────────────
function Bookings({ bookings, loading, onDetail, onRefresh, onNav }: { bookings: Booking[]; loading: boolean; onDetail: (b: Booking) => void; onRefresh: () => void; onNav: (s: Screen) => void }) {
  const [tab, setTab] = useState<"Active" | "Past">("Active");
  const active = bookings.filter(b => !["Received", "Rejected", "No Show"].includes(b.stage));
  const past = bookings.filter(b => ["Received", "Rejected", "No Show"].includes(b.stage));
  const shown = tab === "Active" ? active : past;

  return (
    <div style={{ minHeight: "100svh", background: "#F0F4F8", paddingBottom: 80 }}>
      <div style={{ background: navyGrad, padding: "52px 20px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: "white" }}>My Bookings</h1>
          <button onClick={onRefresh} style={{ background: "rgba(255,255,255,.12)", border: "none", borderRadius: 10, padding: "6px 12px", color: "white", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>↺ Refresh</button>
        </div>
        <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,.1)", borderRadius: 14, padding: 4 }}>
          {(["Active", "Past"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ flex: 1, padding: "10px", borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", border: "none", background: tab === t ? "white" : "transparent", color: tab === t ? N : "rgba(255,255,255,.6)", transition: "all .2s" }}>
              {t} ({t === "Active" ? active.length : past.length})
            </button>
          ))}
        </div>
      </div>
      <div style={{ padding: "16px 16px 0", display: "flex", flexDirection: "column", gap: 10 }}>
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="sk" style={{ height: 120 }} />)
        ) : shown.length === 0 ? (
          <div style={{ padding: "60px 0", textAlign: "center" }}>
            <p style={{ fontSize: 40, marginBottom: 12 }}>📅</p>
            <p style={{ fontSize: 16, fontWeight: 700, color: "#7A90B3" }}>No {tab.toLowerCase()} bookings</p>
            {tab === "Active" && <button onClick={() => onNav("packages")} style={{ marginTop: 16, padding: "10px 24px", borderRadius: 12, background: G, color: "white", border: "none", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", fontSize: 14 }}>Book now →</button>}
          </div>
        ) : (
          shown.map(b => (
            <button key={b.id} onClick={() => onDetail(b)}
              style={{ background: "white", borderRadius: 18, border: "1px solid #E2E8F0", boxShadow: "0 2px 8px rgba(11,37,69,.06)", padding: 16, textAlign: "left", cursor: "pointer", width: "100%", fontFamily: "inherit" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: N, flex: 1, marginRight: 8 }}>{b.package?.name ?? "Health Checkup"}</p>
                <StagePill stage={b.stage} />
              </div>
              <p style={{ fontSize: 13, color: "#7A90B3", marginBottom: 10 }}>{b.lab?.name ?? "—"}</p>
              <div style={{ display: "flex", gap: 14, fontSize: 12, color: "#94A3B8", flexWrap: "wrap" }}>
                <span>📅 {b.appointment_date}</span>
                <span>⏰ {fmtTime(b.slot_time)}</span>
                <span>💳 {fmt(b.amount)}</span>
              </div>
              {b.stage === "Received" && (
                <div style={{ marginTop: 12, padding: "10px", borderRadius: 10, background: "#F0FDF4", textAlign: "center", fontSize: 13, fontWeight: 700, color: "#15803D" }}>
                  📄 Report ready — tap to view
                </div>
              )}
            </button>
          ))
        )}
      </div>
      <NavBar active="bookings" onNav={onNav} />
    </div>
  );
}

// ─── Booking Detail ───────────────────────────────────────────────────────────
function Detail({ booking: b, onBack }: { booking: Booking; onBack: () => void }) {
  return (
    <div style={{ minHeight: "100svh", background: "#F0F4F8" }}>
      <div style={{ background: navyGrad, padding: "52px 20px 24px" }}>
        <BackHeader title="Booking Detail" subtitle={b.id} onBack={onBack} white />
      </div>
      <div style={{ padding: "16px 16px 40px", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ background: "white", borderRadius: 20, border: "1px solid #E2E8F0", padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <p style={{ fontSize: 16, fontWeight: 800, color: N }}>{b.package?.name ?? "Health Checkup"}</p>
            <StagePill stage={b.stage} />
          </div>
          {[
            ["Lab", b.lab?.name ?? "—"],
            ["Date", b.appointment_date],
            ["Time", fmtTime(b.slot_time)],
            ["Type", b.collection_type],
            ["Amount", fmt(b.amount)],
            ["Patient", b.patient_name],
            ["Phone", b.patient_phone],
          ].map(([k, v]) => (
            <div key={k as string} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid #F8FAFC" }}>
              <span style={{ fontSize: 13, color: "#7A90B3" }}>{k as string}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: N }}>{v as string}</span>
            </div>
          ))}
        </div>
        {b.report_url && (
          <a href={b.report_url} target="_blank" rel="noreferrer" style={{ display: "block", textDecoration: "none" }}>
            <div style={{ background: "#F0FDF4", border: "1.5px solid #BBF7D0", borderRadius: 16, padding: 16, textAlign: "center", fontSize: 15, fontWeight: 700, color: "#15803D" }}>
              📄 View Report PDF →
            </div>
          </a>
        )}
        <div style={{ background: "#F0F4F8", borderRadius: 14, padding: "12px 16px" }}>
          <p style={{ fontSize: 12, color: "#94A3B8", marginBottom: 4 }}>Need help?</p>
          <p style={{ fontSize: 13, color: "#7A90B3" }}>Call your lab or contact Checkupify support at <strong>support@checkupify.com</strong></p>
        </div>
      </div>
    </div>
  );
}

// ─── Reports ─────────────────────────────────────────────────────────────────
function Reports({ bookings, onNav }: { bookings: Booking[]; onNav: (s: Screen) => void }) {
  return (
    <div style={{ minHeight: "100svh", background: "#F0F4F8", paddingBottom: 80 }}>
      <div style={{ background: navyGrad, padding: "52px 20px 24px" }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: "white", marginBottom: 4 }}>My Reports</h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,.5)" }}>{bookings.length} report{bookings.length !== 1 ? "s" : ""} available</p>
      </div>
      <div style={{ padding: "16px 16px 0", display: "flex", flexDirection: "column", gap: 12 }}>
        {bookings.length === 0 ? (
          <div style={{ padding: "60px 0", textAlign: "center" }}>
            <p style={{ fontSize: 40, marginBottom: 12 }}>📄</p>
            <p style={{ fontSize: 16, fontWeight: 700, color: "#7A90B3" }}>No reports yet</p>
            <p style={{ fontSize: 13, color: "#94A3B8", marginTop: 6 }}>Reports appear here once your lab uploads them</p>
          </div>
        ) : bookings.map(b => (
          <div key={b.id} style={{ background: "white", borderRadius: 18, border: "1px solid #E2E8F0", padding: 16 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: N, marginBottom: 4 }}>{b.package?.name ?? "Health Checkup"}</p>
            <p style={{ fontSize: 13, color: "#7A90B3", marginBottom: 4 }}>{b.lab?.name ?? "—"}</p>
            <p style={{ fontSize: 12, color: "#94A3B8", marginBottom: 12 }}>📅 {b.appointment_date}</p>
            {b.report_url ? (
              <a href={b.report_url} target="_blank" rel="noreferrer" style={{ display: "block", textDecoration: "none" }}>
                <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 12, padding: 11, textAlign: "center", fontSize: 13, fontWeight: 700, color: "#15803D" }}>📄 View Report PDF</div>
              </a>
            ) : (
              <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 12, padding: 11, textAlign: "center", fontSize: 12, fontWeight: 700, color: "#D97706" }}>⏳ Processing — coming soon</div>
            )}
          </div>
        ))}
      </div>
      <NavBar active="reports" onNav={onNav} />
    </div>
  );
}

// ─── Profile ─────────────────────────────────────────────────────────────────
function Profile({ user, bookings, onSave, onLogout, onNav }: { user: User; bookings: Booking[]; onSave: (u: User) => void; onLogout: () => void; onNav: (s: Screen) => void }) {
  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [city, setCity] = useState(user.city || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const totalSpend = bookings.reduce((s, b) => s + b.amount, 0);
  const inp: React.CSSProperties = { width: "100%", background: "white", border: "1.5px solid #E2E8F0", borderRadius: 12, padding: "12px 14px", fontSize: 14, color: N, outline: "none", fontFamily: "inherit", boxSizing: "border-box" };

  async function save() {
    setSaving(true);
    await supabase.from("users").update({ name, email, city }).eq("phone", user.phone);
    onSave({ ...user, name, email, city });
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div style={{ minHeight: "100svh", background: "#F0F4F8", paddingBottom: 80 }}>
      <div style={{ background: navyGrad, padding: "52px 20px 32px", textAlign: "center" }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: G, border: "3px solid rgba(255,255,255,.25)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontSize: 28, fontWeight: 900, color: "white", boxShadow: "0 8px 24px rgba(34,197,94,.3)" }}>
          {(user.name?.[0] || "U").toUpperCase()}
        </div>
        <p style={{ fontSize: 22, fontWeight: 900, color: "white", marginBottom: 4 }}>{user.name || "Patient"}</p>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,.5)" }}>{user.phone}</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 32, marginTop: 20 }}>
          {[{ l: "Bookings", v: bookings.length }, { l: "Reports", v: bookings.filter(b => b.report_url).length }, { l: "Spent", v: "₹" + (totalSpend / 1000).toFixed(0) + "K" }].map(s => (
            <div key={s.l} style={{ textAlign: "center" }}>
              <p style={{ fontSize: 22, fontWeight: 900, color: "white" }}>{s.v}</p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,.4)", marginTop: 2 }}>{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "16px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ background: "white", borderRadius: 20, border: "1px solid #E2E8F0", padding: 18 }}>
          <p style={{ fontSize: 12, fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 14 }}>Personal Info</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[{ l: "Full Name", v: name, s: setName, p: "Your name" }, { l: "Email", v: email, s: setEmail, p: "email@example.com" }, { l: "City", v: city, s: setCity, p: "Hyderabad" }].map(f => (
              <div key={f.l}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", marginBottom: 6 }}>{f.l}</p>
                <input style={inp} value={f.v} onChange={e => f.s(e.target.value)} placeholder={f.p}
                  onFocus={e => { e.target.style.borderColor = G; e.target.style.boxShadow = `0 0 0 3px rgba(34,197,94,.1)`; }}
                  onBlur={e => { e.target.style.borderColor = "#E2E8F0"; e.target.style.boxShadow = "none"; }} />
              </div>
            ))}
          </div>
          <button onClick={save} disabled={saving}
            style={{ width: "100%", marginTop: 16, padding: 14, borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit", border: "none", background: saved ? GD : G, color: "white", transition: "all .2s", boxShadow: "0 4px 14px rgba(34,197,94,.25)" }}>
            {saving ? "Saving…" : saved ? "✓ Saved!" : "Save Profile"}
          </button>
        </div>

        <div style={{ background: "white", borderRadius: 20, border: "1px solid #E2E8F0", padding: 18 }}>
          <p style={{ fontSize: 12, fontWeight: 800, color: "#94A3B8", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 12 }}>Support</p>
          {[{ l: "📞 Call Support", v: "+91-80-1234-5678" }, { l: "📧 Email", v: "support@checkupify.com" }, { l: "💬 WhatsApp", v: "+91-9876543210" }].map(r => (
            <div key={r.l} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid #F8FAFC" }}>
              <span style={{ fontSize: 13, color: N, fontWeight: 600 }}>{r.l}</span>
              <span style={{ fontSize: 13, color: "#7A90B3" }}>{r.v}</span>
            </div>
          ))}
        </div>

        <button onClick={() => { if (confirm("Sign out of Checkupify?")) onLogout(); }}
          style={{ width: "100%", padding: 14, borderRadius: 16, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit", border: "1.5px solid #FECACA", background: "#FEF2F2", color: "#DC2626" }}>
          Sign Out
        </button>
      </div>
      <NavBar active="profile" onNav={onNav} />
    </div>
  );
}
