import { useState, useEffect, useRef } from "react";

/* ─────────────────────────────────────────────────────────────────────────────
   BRAND & TOKENS
───────────────────────────────────────────────────────────────────────────── */
const T = {
  navy:    "#0B2545",
  teal:    "#00D68F",
  tealD:   "#00B876",
  tealBg:  "#E6FBF4",
  mid:     "#1E3A5F",
  muted:   "#64748B",
  border:  "#E2EAF0",
  bg:      "#F4F7FB",
  white:   "#FFFFFF",
  red:     "#EF4444",
  amber:   "#F59E0B",
  purple:  "#7C3AED",
};

/* ─────────────────────────────────────────────────────────────────────────────
   DEMO ACCOUNTS  (in real app → backend auth)
───────────────────────────────────────────────────────────────────────────── */
const ACCOUNTS = [
  { email: "patient@checkupify.com",  password: "patient123",  role: "patient",  name: "Arjun Mehta",      avatar: "AM" },
  { email: "doctor@checkupify.com",   password: "doctor123",   role: "doctor",   name: "Dr. Priya Sharma", avatar: "PS" },
  { email: "lab@checkupify.com",      password: "lab123",      role: "lab",      name: "MedLab India",     avatar: "ML" },
  { email: "hospital@checkupify.com", password: "hospital123", role: "hospital", name: "Apollo Hospital",  avatar: "AH" },
  { email: "pharmacy@checkupify.com", password: "pharmacy123", role: "pharmacy", name: "HealthMart Rx",    avatar: "HM" },
  { email: "admin@checkupify.com",    password: "admin123",    role: "admin",    name: "Admin Kumar",      avatar: "AK" },
];

/* ─────────────────────────────────────────────────────────────────────────────
   ICON COMPONENT
───────────────────────────────────────────────────────────────────────────── */
function Icon({ n, s = 18, c = "currentColor", style }) {
  const icons = {
    home:    <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>,
    users:   <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
    cal:     <><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
    act:     <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>,
    flask:   <><path d="M9 3h6l1 9H8L9 3z"/><path d="M6 21h12a1 1 0 0 0 .9-1.45L16 12H8L5.1 19.55A1 1 0 0 0 6 21z"/></>,
    pill:    <><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><line x1="8.5" y1="8.5" x2="15.5" y2="15.5"/></>,
    shield:  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>,
    bars:    <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>,
    bell:    <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>,
    search:  <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
    plus:    <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
    check:   <polyline points="20 6 9 17 4 12"/>,
    x:       <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    cr:      <polyline points="9 18 15 12 9 6"/>,
    cl:      <polyline points="15 18 9 12 15 6"/>,
    cd:      <polyline points="6 9 12 15 18 9"/>,
    clk:     <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
    vid:     <><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></>,
    file:    <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></>,
    send:    <><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></>,
    bot:     <><rect x="3" y="11" width="18" height="10" rx="2"/><path d="M12 11V3"/><path d="M8 3h8"/><circle cx="8.5" cy="16" r="1" fill={c}/><circle cx="15.5" cy="16" r="1" fill={c}/></>,
    tkn:     <><rect x="2" y="7" width="20" height="14" rx="5"/><circle cx="12" cy="14" r="3"/><circle cx="6" cy="14" r="1" fill={c}/><circle cx="18" cy="14" r="1" fill={c}/></>,
    wa:      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>,
    bld:     <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/><line x1="9" y1="7" x2="15" y2="7"/><line x1="12" y1="4" x2="12" y2="12"/></>,
    bed:     <><path d="M2 4v16"/><path d="M22 4v16"/><path d="M2 8h20"/><path d="M2 16h20"/><rect x="6" y="8" width="4" height="8"/><rect x="14" y="8" width="4" height="8"/></>,
    rcp:     <><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1z"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="13" x2="15" y2="13"/></>,
    trnd:    <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></>,
    edit:    <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
    eye:     <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>,
    eyeoff:  <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>,
    hrt:     <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>,
    baby:    <><circle cx="12" cy="5" r="2"/><path d="M10 8L6 16"/><path d="M14 8l4 8"/><line x1="9" y1="14" x2="15" y2="14"/><line x1="8" y1="21" x2="10" y2="17"/><line x1="16" y1="21" x2="14" y2="17"/></>,
    scan:    <><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="7" y1="12" x2="17" y2="12"/></>,
    lyrs:    <><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></>,
    stgs:    <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
    zap:     <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>,
    mail:    <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>,
    lock:    <><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>,
    phone:   <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>,
    star:    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>,
    arrow:   <><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>,
    logout:  <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
    wifi:    <><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></>,
    mic:     <><line x1="6" y1="18" x2="14" y2="18"/><line x1="10" y1="22" x2="10" y2="18"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="10" y1="11" x2="6" y2="7"/><line x1="10" y1="11" x2="14" y2="7"/><circle cx="10" cy="5" r="2"/></>,
    prt:     <><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></>,
    phn:     <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>,
    inf:     <><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></>,
    map:     <><polygon points="3 11 22 2 13 21 11 13 3 11"/></>,
    cc:      <><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></>,
  };
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c}
      strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={style}>
      {icons[n] || <circle cx="12" cy="12" r="10"/>}
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SHARED PRIMITIVES
───────────────────────────────────────────────────────────────────────────── */
const CheckLogo = ({ light }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
    <svg width={28} height={28} viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="13" stroke={T.teal} strokeWidth="2.5" fill="none"/>
      <polyline points="8,14 12,18 20,10" stroke={T.teal} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
    <span style={{ color: light ? T.white : T.navy, fontWeight: 800, fontSize: 18, letterSpacing: -0.5, fontFamily: "inherit" }}>
      Checkupify
    </span>
  </div>
);

const Av = ({ init, sz = 36, bg = T.navy, color = "#fff" }) => (
  <div style={{ width: sz, height: sz, borderRadius: "50%", background: bg, color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: sz * 0.33, fontWeight: 800, flexShrink: 0, fontFamily: "inherit" }}>
    {init}
  </div>
);

function Btn({ children, v = "primary", sz = "md", icon, full, disabled, onClick, style = {} }) {
  const sizes = { xs: { px: 10, py: 5, fs: 11 }, sm: { px: 13, py: 7, fs: 12 }, md: { px: 16, py: 9, fs: 13 }, lg: { px: 22, py: 12, fs: 15 }, xl: { px: 28, py: 15, fs: 16 } };
  const variants = {
    primary: { bg: T.teal, color: "#fff", border: T.teal },
    navy:    { bg: T.navy, color: "#fff", border: T.navy },
    outline: { bg: "#fff", color: T.teal, border: T.teal },
    white:   { bg: "#fff", color: T.navy, border: "#fff" },
    ghost:   { bg: "transparent", color: T.muted, border: "transparent" },
    danger:  { bg: "#FEF2F2", color: T.red, border: "#FECACA" },
  };
  const d = sizes[sz]; const vv = variants[v];
  return (
    <button disabled={!!disabled} onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7,
      padding: `${d.py}px ${d.px}px`, fontSize: d.fs, fontWeight: 700, borderRadius: 11,
      background: vv.bg, color: vv.color, border: `1.5px solid ${vv.border}`,
      cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1,
      width: full ? "100%" : undefined, fontFamily: "inherit",
      transition: "opacity .15s, transform .1s", ...style
    }}>
      {icon && <Icon n={icon} s={d.fs + 2} c={vv.color}/>}
      {children}
    </button>
  );
}

const Card = ({ children, pad = 20, style = {}, onClick }) => (
  <div onClick={onClick} style={{ background: T.white, borderRadius: 18, padding: pad, border: `1px solid ${T.border}`, boxShadow: "0 1px 6px rgba(11,37,69,.06)", cursor: onClick ? "pointer" : undefined, ...style }}>
    {children}
  </div>
);

const Tag = ({ children, color = T.teal }) => (
  <span style={{ background: color + "1A", color, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, display: "inline-block" }}>
    {children}
  </span>
);

/* ─────────────────────────────────────────────────────────────────────────────
   ██████  PUBLIC WEBSITE  ██████
───────────────────────────────────────────────────────────────────────────── */

/* ── Public Navbar ── */
function PublicNav({ onLogin }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? "rgba(11,37,69,.97)" : "transparent",
      backdropFilter: scrolled ? "blur(14px)" : "none",
      borderBottom: scrolled ? "1px solid rgba(255,255,255,.08)" : "none",
      transition: "all .3s", padding: "0 5%",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", height: 68, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <CheckLogo light />
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          {["Features", "For Doctors", "For Labs", "Pricing"].map(l => (
            <a key={l} href="#" style={{ color: "rgba(255,255,255,.72)", fontSize: 14, fontWeight: 600, textDecoration: "none", fontFamily: "inherit" }}>{l}</a>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Btn v="ghost" sz="sm" onClick={onLogin} style={{ color: "rgba(255,255,255,.85)", border: "1.5px solid rgba(255,255,255,.2)" }}>Sign in</Btn>
          <Btn sz="sm" onClick={onLogin}>Get Started Free</Btn>
        </div>
      </div>
    </nav>
  );
}

/* ── Hero Section ── */
function Hero({ onLogin }) {
  return (
    <section style={{ minHeight: "100vh", background: `linear-gradient(160deg, ${T.navy} 0%, #0F3460 55%, #0B2545 100%)`, display: "flex", alignItems: "center", position: "relative", overflow: "hidden", padding: "0 5%" }}>
      {/* Decorative blobs */}
      <div style={{ position: "absolute", top: -100, right: -100, width: 600, height: 600, borderRadius: "50%", background: T.teal + "0C", pointerEvents: "none" }}/>
      <div style={{ position: "absolute", bottom: -150, left: -100, width: 500, height: 500, borderRadius: "50%", background: T.teal + "06", pointerEvents: "none" }}/>
      {/* Grid lines */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px)`, backgroundSize: "60px 60px", pointerEvents: "none" }}/>

      <div style={{ maxWidth: 1200, margin: "0 auto", width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center", paddingTop: 80 }}>
        {/* Left */}
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: T.teal + "18", border: `1px solid ${T.teal}30`, borderRadius: 30, padding: "6px 14px 6px 6px", marginBottom: 28 }}>
            <div style={{ background: T.teal, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 800, color: "#fff" }}>NEW</div>
            <span style={{ fontSize: 12, color: T.teal, fontWeight: 600 }}>Kivi AI Assistant now available in Hindi & English</span>
          </div>

          <h1 style={{ fontSize: 52, fontWeight: 900, color: T.white, lineHeight: 1.1, marginBottom: 20, letterSpacing: -1.5 }}>
            India's Complete<br/>
            <span style={{ color: T.teal }}>Healthcare OS</span>
          </h1>

          <p style={{ fontSize: 18, color: "rgba(255,255,255,.6)", lineHeight: 1.7, marginBottom: 36, maxWidth: 480 }}>
            One platform connecting patients, doctors, labs, hospitals & pharmacies. Book, consult, diagnose and heal — all in one place.
          </p>

          <div style={{ display: "flex", gap: 14, marginBottom: 48 }}>
            <Btn sz="xl" icon="arrow" onClick={onLogin}>Book Appointment</Btn>
            <Btn sz="xl" v="ghost" onClick={onLogin} style={{ color: "rgba(255,255,255,.8)", border: "1.5px solid rgba(255,255,255,.2)" }}>Watch Demo</Btn>
          </div>

          {/* Trust badges */}
          <div style={{ display: "flex", gap: 28 }}>
            {[["2.8L+", "Patients"], ["4,200+", "Doctors"], ["1,800+", "Labs"], ["98%", "Satisfaction"]].map(([v, l]) => (
              <div key={l}>
                <div style={{ fontSize: 22, fontWeight: 900, color: T.teal }}>{v}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,.45)", fontWeight: 500 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right – floating cards */}
        <div style={{ position: "relative", height: 480 }}>
          {/* Main card */}
          <div style={{ position: "absolute", top: 40, left: 20, right: 20, background: "rgba(255,255,255,.06)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,.12)", borderRadius: 20, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: T.teal + "25", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon n="bot" s={22} c={T.teal}/>
              </div>
              <div>
                <div style={{ color: T.white, fontWeight: 700, fontSize: 14 }}>Kivi AI Health Assistant</div>
                <div style={{ color: "rgba(255,255,255,.45)", fontSize: 11 }}>Powered by Claude</div>
              </div>
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5, background: T.teal + "22", padding: "3px 10px", borderRadius: 20 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: T.teal }}/>
                <span style={{ color: T.teal, fontSize: 10, fontWeight: 700 }}>LIVE</span>
              </div>
            </div>
            <div style={{ background: "rgba(255,255,255,.06)", borderRadius: 12, padding: "10px 14px", marginBottom: 8 }}>
              <span style={{ color: "rgba(255,255,255,.6)", fontSize: 12 }}>User: </span>
              <span style={{ color: T.white, fontSize: 12 }}>I have fever since 2 days, what should I do?</span>
            </div>
            <div style={{ background: T.teal + "15", borderRadius: 12, padding: "10px 14px" }}>
              <span style={{ color: T.teal, fontSize: 12 }}>Kivi: Fever lasting 2+ days needs evaluation. I recommend booking with a General Physician today. Shall I check availability? 🩺</span>
            </div>
          </div>

          {/* Floating token badge */}
          <div style={{ position: "absolute", bottom: 80, right: 0, background: T.white, borderRadius: 14, padding: "12px 16px", boxShadow: "0 8px 32px rgba(0,0,0,.2)", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: T.teal + "18", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon n="tkn" s={18} c={T.teal}/>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: T.navy }}>Token T-003</div>
              <div style={{ fontSize: 11, color: T.muted }}>~12 min wait</div>
            </div>
          </div>

          {/* Floating report badge */}
          <div style={{ position: "absolute", bottom: 0, left: 0, background: T.white, borderRadius: 14, padding: "12px 16px", boxShadow: "0 8px 32px rgba(0,0,0,.2)", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#7C3AED18", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon n="file" s={17} c={T.purple}/>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: T.navy }}>CBC Report Ready</div>
              <div style={{ fontSize: 11, color: T.teal }}>✓ All values normal</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Features Strip ── */
function FeaturesStrip() {
  const features = [
    { icon: "cal", label: "Instant Booking", desc: "Book appointments with 4,200+ verified doctors online or in-clinic", color: T.teal },
    { icon: "flask", label: "Home Lab Tests", desc: "Sample collected at home. Reports in 4-8 hours on the app", color: T.purple },
    { icon: "bot", label: "Kivi AI Chat", desc: "Ask health questions in Hindi or English, get instant guidance", color: T.amber },
    { icon: "pill", label: "Medicine Delivery", desc: "Order medicines against digital prescriptions. 2-4 hr delivery", color: "#EF4444" },
    { icon: "shield", label: "Insurance Claims", desc: "Check coverage & file cashless claims from the app", color: "#0EA5E9" },
    { icon: "baby", label: "Baby Tracker", desc: "Growth charts, vaccination reminders & milestone tracking", color: "#EC4899" },
  ];
  return (
    <section style={{ padding: "90px 5%", background: T.bg }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <Tag>For Patients</Tag>
          <h2 style={{ fontSize: 40, fontWeight: 900, color: T.navy, marginTop: 12, marginBottom: 12, letterSpacing: -1 }}>Everything your health needs</h2>
          <p style={{ fontSize: 16, color: T.muted, maxWidth: 500, margin: "0 auto" }}>From booking to billing, Checkupify covers your entire healthcare journey.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {features.map((f, i) => (
            <Card key={i} pad={24} style={{ transition: "transform .2s, box-shadow .2s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 36px rgba(11,37,69,.1)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 1px 6px rgba(11,37,69,.06)"; }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: f.color + "18", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <Icon n={f.icon} s={22} c={f.color}/>
              </div>
              <div style={{ fontWeight: 800, fontSize: 16, color: T.navy, marginBottom: 6 }}>{f.label}</div>
              <div style={{ fontSize: 13, color: T.muted, lineHeight: 1.6 }}>{f.desc}</div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── For Partners Section ── */
function ForPartners({ onLogin }) {
  const partners = [
    { icon: "act", label: "Doctors & Clinics", desc: "OPD queue management, EHR, digital prescriptions, GST billing, WhatsApp follow-ups — run your clinic from one screen.", color: T.navy, features: ["OPD Token System", "EHR Templates", "Digital Rx", "GST Invoices", "Multi-clinic"] },
    { icon: "flask", label: "Diagnostic Labs", desc: "Manage bookings from Checkupify, track samples, upload reports directly to patient accounts. Smart OCR scanner included.", color: T.purple, features: ["Booking Management", "Sample Tracking", "Digital Reports", "OCR Scanner", "Revenue Dashboard"] },
    { icon: "bld", label: "Hospitals", desc: "IPD bed management, surgery packages, insurance eligibility, admission workflows and billing — all integrated.", color: "#0EA5E9", features: ["Bed Management", "IPD Workflows", "Insurance Verify", "Billing & Claims", "Discharge Summary"] },
    { icon: "pill", label: "Pharmacies", desc: "Receive digital prescriptions, manage inventory, process home delivery orders and in-store pickups efficiently.", color: "#EF4444", features: ["Digital Rx Intake", "Inventory Track", "Home Delivery", "Order Management", "WhatsApp Updates"] },
  ];
  return (
    <section style={{ padding: "90px 5%", background: T.white }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <Tag color={T.navy}>For Healthcare Partners</Tag>
          <h2 style={{ fontSize: 40, fontWeight: 900, color: T.navy, marginTop: 12, marginBottom: 12, letterSpacing: -1 }}>Built for every part of the ecosystem</h2>
          <p style={{ fontSize: 16, color: T.muted, maxWidth: 520, margin: "0 auto" }}>Separate portals for every partner type. One unified platform, tailored workflows.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 22 }}>
          {partners.map((p, i) => (
            <Card key={i} pad={28} style={{ borderTop: `3px solid ${p.color}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: p.color + "18", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon n={p.icon} s={22} c={p.color}/>
                </div>
                <div style={{ fontWeight: 800, fontSize: 18, color: T.navy }}>{p.label}</div>
              </div>
              <p style={{ fontSize: 13, color: T.muted, lineHeight: 1.7, marginBottom: 16 }}>{p.desc}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 18 }}>
                {p.features.map(f => <Tag key={f} color={p.color}>{f}</Tag>)}
              </div>
              <Btn sz="sm" v="outline" style={{ borderColor: p.color, color: p.color }} onClick={onLogin}>
                Access {p.label} Portal →
              </Btn>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Testimonials ── */
function Testimonials() {
  const reviews = [
    { name: "Dr. Priya Sharma", role: "General Physician, Mumbai", text: "The OPD token system completely changed how I run my clinic. Patients love getting WhatsApp updates about their queue position.", stars: 5, av: "PS", bg: T.navy },
    { name: "Arjun Mehta", role: "Patient, Delhi", text: "Kivi AI explained my CBC report in simple language and helped me book the right specialist. Saved me so much confusion.", stars: 5, av: "AM", bg: T.teal },
    { name: "Anita Singh", role: "MedLab India, Bangalore", text: "Report upload workflow is seamless. Patients get notified automatically. Our review ratings improved significantly.", stars: 5, av: "AS", bg: T.purple },
  ];
  return (
    <section style={{ padding: "80px 5%", background: T.bg }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 50 }}>
          <h2 style={{ fontSize: 36, fontWeight: 900, color: T.navy, letterSpacing: -0.8 }}>Trusted across India</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
          {reviews.map((r, i) => (
            <Card key={i} pad={26}>
              <div style={{ display: "flex", gap: 2, marginBottom: 14 }}>
                {Array(r.stars).fill(0).map((_, j) => <Icon key={j} n="star" s={14} c={T.amber} style={{ fill: T.amber }}/>)}
              </div>
              <p style={{ fontSize: 14, color: T.navy, lineHeight: 1.7, marginBottom: 18 }}>"{r.text}"</p>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Av init={r.av} sz={38} bg={r.bg}/>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: T.navy }}>{r.name}</div>
                  <div style={{ fontSize: 11, color: T.muted }}>{r.role}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── CTA Banner ── */
function CTABanner({ onLogin }) {
  return (
    <section style={{ padding: "80px 5%", background: `linear-gradient(135deg, ${T.navy}, ${T.mid})`, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", right: -80, top: -80, width: 400, height: 400, borderRadius: "50%", background: T.teal + "0D" }}/>
      <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center", position: "relative" }}>
        <h2 style={{ fontSize: 42, fontWeight: 900, color: T.white, letterSpacing: -1, marginBottom: 16 }}>
          Start your healthcare journey<br/>
          <span style={{ color: T.teal }}>today. It's free.</span>
        </h2>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,.6)", marginBottom: 36 }}>Join 2.8 lakh+ patients already managing their health on Checkupify.</p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center" }}>
          <Btn sz="xl" onClick={onLogin}>Create Free Account</Btn>
          <Btn sz="xl" v="ghost" onClick={onLogin} style={{ color: "rgba(255,255,255,.75)", border: "1.5px solid rgba(255,255,255,.2)" }}>Sign in to Portal</Btn>
        </div>
      </div>
    </section>
  );
}

/* ── Footer ── */
function Footer() {
  return (
    <footer style={{ background: T.navy, padding: "50px 5% 28px", borderTop: "1px solid rgba(255,255,255,.06)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40, marginBottom: 40 }}>
          <div>
            <CheckLogo light/>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,.45)", marginTop: 14, lineHeight: 1.7, maxWidth: 280 }}>
              India's Unified Healthcare Operating System. Connecting patients, doctors, labs, hospitals and pharmacies on one platform.
            </p>
          </div>
          {[
            { title: "Patients", links: ["Book Appointment", "Lab Tests", "Pharmacy", "Insurance", "Baby Tracker"] },
            { title: "Partners", links: ["For Doctors", "For Labs", "For Hospitals", "For Pharmacies", "Admin Portal"] },
            { title: "Company", links: ["About Us", "Careers", "Press", "Privacy Policy", "Terms of Service"] },
          ].map(col => (
            <div key={col.title}>
              <div style={{ fontWeight: 800, fontSize: 13, color: T.white, marginBottom: 14 }}>{col.title}</div>
              {col.links.map(l => (
                <div key={l} style={{ fontSize: 13, color: "rgba(255,255,255,.45)", marginBottom: 8, cursor: "pointer" }}>{l}</div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,.07)", paddingTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,.3)" }}>© 2026 Checkupify. All rights reserved.</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,.3)" }}>Made with ❤️ in India</div>
        </div>
      </div>
    </footer>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   ██████  LOGIN PAGE  ██████
───────────────────────────────────────────────────────────────────────────── */
function LoginPage({ onSuccess, onBack }) {
  const [tab, setTab] = useState("login");  // login | register | forgot
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [regRole, setRegRole] = useState("patient");

  // Demo quick-fill
  const DEMO = [
    { role: "patient",  label: "Patient",   color: T.teal,   email: "patient@checkupify.com",  pw: "patient123" },
    { role: "doctor",   label: "Doctor",    color: T.navy,   email: "doctor@checkupify.com",   pw: "doctor123" },
    { role: "lab",      label: "Lab",       color: T.purple, email: "lab@checkupify.com",      pw: "lab123" },
    { role: "hospital", label: "Hospital",  color: "#0EA5E9",email: "hospital@checkupify.com", pw: "hospital123" },
    { role: "pharmacy", label: "Pharmacy",  color: "#EF4444",email: "pharmacy@checkupify.com", pw: "pharmacy123" },
    { role: "admin",    label: "Admin",     color: T.amber,  email: "admin@checkupify.com",    pw: "admin123" },
  ];

  function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      const acc = ACCOUNTS.find(a => a.email.toLowerCase() === email.toLowerCase() && a.password === password);
      if (acc) {
        onSuccess(acc);
      } else {
        setError("Invalid email or password. Use a demo account below.");
      }
      setLoading(false);
    }, 900);
  }

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(160deg, ${T.navy} 0%, #0F3460 100%)`, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", position: "relative", overflow: "hidden" }}>
      {/* Background grid */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px)`, backgroundSize: "60px 60px", pointerEvents: "none" }}/>
      <div style={{ position: "absolute", top: -100, right: -100, width: 500, height: 500, borderRadius: "50%", background: T.teal + "08", pointerEvents: "none" }}/>

      <div style={{ width: "100%", maxWidth: 460, position: "relative" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", marginBottom: 20, display: "block", margin: "0 auto 20px" }}>
            <CheckLogo light/>
          </button>
          <div style={{ fontSize: 22, fontWeight: 900, color: T.white, letterSpacing: -0.5 }}>Welcome back</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,.45)", marginTop: 5 }}>Sign in to your Checkupify account</div>
        </div>

        {/* Card */}
        <div style={{ background: "rgba(255,255,255,.04)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 24, padding: 32 }}>
          {/* Tabs */}
          <div style={{ display: "flex", background: "rgba(255,255,255,.06)", borderRadius: 12, padding: 4, marginBottom: 28 }}>
            {[["login", "Sign In"], ["register", "Register"]].map(([id, label]) => (
              <button key={id} onClick={() => setTab(id)} style={{ flex: 1, padding: "8px", borderRadius: 9, border: "none", cursor: "pointer", background: tab === id ? T.white : "transparent", color: tab === id ? T.navy : "rgba(255,255,255,.55)", fontWeight: 700, fontSize: 13, fontFamily: "inherit", transition: "all .15s" }}>
                {label}
              </button>
            ))}
          </div>

          {tab === "login" && (
            <form onSubmit={handleLogin}>
              {/* Email */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,.6)", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Email</label>
                <div style={{ position: "relative" }}>
                  <Icon n="mail" s={15} c="rgba(255,255,255,.35)" style={{ position: "absolute", left: 13, top: 12 }}/>
                  <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="your@email.com" required
                    style={{ width: "100%", padding: "11px 14px 11px 40px", borderRadius: 12, border: "1.5px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.07)", color: T.white, fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}/>
                </div>
              </div>

              {/* Password */}
              <div style={{ marginBottom: 22 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,.6)", textTransform: "uppercase", letterSpacing: 0.5 }}>Password</label>
                  <button type="button" onClick={() => setTab("forgot")} style={{ fontSize: 12, color: T.teal, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>Forgot password?</button>
                </div>
                <div style={{ position: "relative" }}>
                  <Icon n="lock" s={15} c="rgba(255,255,255,.35)" style={{ position: "absolute", left: 13, top: 12 }}/>
                  <input value={password} onChange={e => setPassword(e.target.value)} type={showPw ? "text" : "password"} placeholder="••••••••" required
                    style={{ width: "100%", padding: "11px 42px 11px 40px", borderRadius: 12, border: "1.5px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.07)", color: T.white, fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}/>
                  <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: 13, top: 11, background: "none", border: "none", cursor: "pointer" }}>
                    <Icon n={showPw ? "eyeoff" : "eye"} s={16} c="rgba(255,255,255,.35)"/>
                  </button>
                </div>
              </div>

              {error && (
                <div style={{ background: "#EF444420", border: "1px solid #EF444440", borderRadius: 10, padding: "10px 14px", marginBottom: 18, fontSize: 13, color: "#FCA5A5" }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading} style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", background: T.teal, color: T.white, fontWeight: 800, fontSize: 15, cursor: loading ? "wait" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: loading ? 0.8 : 1 }}>
                {loading ? (
                  <><div style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin .7s linear infinite" }}/> Signing in…</>
                ) : (
                  <><Icon n="arrow" s={16} c="#fff"/> Sign In</>
                )}
              </button>
            </form>
          )}

          {tab === "register" && (
            <div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,.55)", marginBottom: 16, textAlign: "center" }}>Choose account type to register</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
                {[["patient", "Patient", "hrt", T.teal], ["doctor", "Doctor", "act", T.navy], ["lab", "Lab", "flask", T.purple], ["hospital", "Hospital", "bld", "#0EA5E9"], ["pharmacy", "Pharmacy", "pill", "#EF4444"]].map(([id, label, icon, color]) => (
                  <button key={id} onClick={() => setRegRole(id)} style={{ padding: "12px 10px", borderRadius: 12, border: `2px solid ${regRole === id ? color : "rgba(255,255,255,.1)"}`, background: regRole === id ? color + "18" : "transparent", color: regRole === id ? color : "rgba(255,255,255,.55)", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 7, justifyContent: "center" }}>
                    <Icon n={icon} s={14} c={regRole === id ? color : "rgba(255,255,255,.4)"}/>{label}
                  </button>
                ))}
              </div>
              <button style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", background: T.teal, color: T.white, fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: "inherit" }}>
                Continue as {regRole.charAt(0).toUpperCase() + regRole.slice(1)} →
              </button>
              <div style={{ textAlign: "center", marginTop: 12, fontSize: 12, color: "rgba(255,255,255,.35)" }}>Registration form opens in next step</div>
            </div>
          )}

          {tab === "forgot" && (
            <div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,.6)", marginBottom: 6 }}>REGISTERED EMAIL</label>
                <input type="email" placeholder="your@email.com"
                  style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: "1.5px solid rgba(255,255,255,.12)", background: "rgba(255,255,255,.07)", color: T.white, fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}/>
              </div>
              <button style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", background: T.teal, color: T.white, fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
                Send Reset Link
              </button>
              <button onClick={() => setTab("login")} style={{ width: "100%", marginTop: 10, padding: "10px", borderRadius: 12, border: "none", background: "transparent", color: "rgba(255,255,255,.45)", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                ← Back to Sign In
              </button>
            </div>
          )}

          {/* Divider */}
          {tab === "login" && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "22px 0 16px" }}>
                <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,.1)" }}/>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,.35)", fontWeight: 600 }}>TRY DEMO ACCOUNTS</span>
                <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,.1)" }}/>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 7 }}>
                {DEMO.map(d => (
                  <button key={d.role} onClick={() => { setEmail(d.email); setPassword(d.pw); }} style={{ padding: "7px 6px", borderRadius: 10, border: `1.5px solid ${d.color}30`, background: d.color + "12", color: d.color, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "background .15s" }}>
                    {d.label}
                  </button>
                ))}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,.25)", textAlign: "center", marginTop: 12 }}>Click a role to auto-fill credentials, then Sign In</div>
            </>
          )}
        </div>

        <button onClick={onBack} style={{ display: "block", margin: "20px auto 0", background: "none", border: "none", color: "rgba(255,255,255,.4)", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
          ← Back to checkupify.com
        </button>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   ██████  DASHBOARD SHELL  ██████
───────────────────────────────────────────────────────────────────────────── */

/* Role-specific nav configs */
const NAVS = {
  patient:  [{ id: "dash", label: "Dashboard", icon: "home" }, { id: "kivi", label: "Kivi AI", icon: "bot" }, { id: "appts", label: "Appointments", icon: "cal" }, { id: "labs", label: "Lab Tests", icon: "flask" }, { id: "reports", label: "Reports", icon: "file" }, { id: "pharmacy", label: "Pharmacy", icon: "pill" }, { id: "baby", label: "Baby Tracker", icon: "baby" }, { id: "insurance", label: "Insurance", icon: "shield" }],
  doctor:   [{ id: "dash", label: "Dashboard", icon: "home" }, { id: "opd", label: "OPD Queue", icon: "tkn", badge: "6" }, { id: "ehr", label: "EHR / Rx", icon: "edit" }, { id: "patients", label: "Patients", icon: "users" }, { id: "kivi", label: "Kivi AI", icon: "bot" }, { id: "teleconsult", label: "Teleconsult", icon: "vid" }, { id: "followup", label: "Follow-up", icon: "wa" }, { id: "ipd", label: "IPD", icon: "bed" }, { id: "billing", label: "GST Billing", icon: "rcp" }, { id: "analytics", label: "Analytics", icon: "bars" }, { id: "clinics", label: "My Clinics", icon: "bld" }],
  lab:      [{ id: "dash", label: "Dashboard", icon: "home" }, { id: "bookings", label: "Bookings", icon: "cal" }, { id: "samples", label: "Sample Tracking", icon: "mic" }, { id: "reports", label: "Report Upload", icon: "scan" }, { id: "analytics", label: "Analytics", icon: "trnd" }],
  hospital: [{ id: "dash", label: "Dashboard", icon: "home" }, { id: "ipd", label: "IPD / Beds", icon: "bed" }, { id: "admissions", label: "Admissions", icon: "users" }, { id: "billing", label: "Billing", icon: "rcp" }, { id: "insurance", label: "Insurance", icon: "shield" }, { id: "analytics", label: "Analytics", icon: "bars" }],
  pharmacy: [{ id: "dash", label: "Dashboard", icon: "home" }, { id: "orders", label: "Orders", icon: "cal" }, { id: "inventory", label: "Inventory", icon: "lyrs" }, { id: "delivery", label: "Delivery", icon: "map" }, { id: "analytics", label: "Analytics", icon: "bars" }],
  admin:    [{ id: "dash", label: "Dashboard", icon: "home" }, { id: "users", label: "User Management", icon: "users" }, { id: "partners", label: "Partners", icon: "lyrs" }, { id: "revenue", label: "Revenue", icon: "trnd" }, { id: "analytics", label: "Analytics", icon: "bars" }, { id: "settings", label: "Settings", icon: "stgs" }],
};

const PAGE_LABELS = {
  dash: "Dashboard", kivi: "Kivi AI Assistant", appts: "Appointments", labs: "Lab Tests",
  reports: "Reports", pharmacy: "Pharmacy", baby: "Baby Tracker", insurance: "Insurance",
  opd: "OPD Queue — Token System", ehr: "EHR & Prescription", patients: "Patient Database",
  teleconsult: "Teleconsultation", followup: "Follow-up & Alerts", ipd: "IPD Management",
  billing: "GST Billing & Invoices", analytics: "Analytics", clinics: "My Clinics",
  bookings: "Bookings", samples: "Sample Tracking", admissions: "Admissions",
  orders: "Orders", inventory: "Inventory", delivery: "Delivery",
  users: "User Management", partners: "Partners", revenue: "Revenue", settings: "Settings",
};

const ROLE_COLORS = {
  patient: T.teal, doctor: T.navy, lab: T.purple,
  hospital: "#0EA5E9", pharmacy: "#EF4444", admin: T.amber,
};

const ROLE_LABELS = {
  patient: "Patient Portal", doctor: "Doctor Portal", lab: "Lab Partner Portal",
  hospital: "Hospital Portal", pharmacy: "Pharmacy Portal", admin: "Super Admin",
};

/* ── Dashboard Sidebar ── */
function DashSidebar({ user, page, setPage, collapsed, setCollapsed }) {
  const nav = NAVS[user.role] || NAVS.patient;
  const roleColor = ROLE_COLORS[user.role];

  return (
    <div style={{ width: collapsed ? 58 : 220, minHeight: "100vh", background: T.navy, display: "flex", flexDirection: "column", transition: "width .25s", flexShrink: 0, overflow: "hidden" }}>
      {/* Logo + role */}
      <div style={{ padding: "16px 14px 12px", borderBottom: "1px solid rgba(255,255,255,.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <svg width={24} height={24} viewBox="0 0 28 28" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="14" cy="14" r="13" stroke={T.teal} strokeWidth="2.5" fill="none"/>
            <polyline points="8,14 12,18 20,10" stroke={T.teal} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {!collapsed && <span style={{ color: T.white, fontWeight: 800, fontSize: 16, letterSpacing: -0.3 }}>Checkupify</span>}
        </div>
        {!collapsed && (
          <div style={{ marginTop: 10, background: roleColor + "1A", borderRadius: 8, padding: "4px 10px", display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: roleColor }}/>
            <span style={{ fontSize: 10, fontWeight: 800, color: roleColor, letterSpacing: 0.3 }}>{ROLE_LABELS[user.role]}</span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "8px 8px", overflowY: "auto" }}>
        {nav.map(item => {
          const active = page === item.id;
          return (
            <button key={item.id} onClick={() => setPage(item.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 9, padding: "9px 10px", borderRadius: 10, marginBottom: 2, border: "none", cursor: "pointer", background: active ? roleColor + "22" : "transparent", color: active ? roleColor : "rgba(255,255,255,.45)", fontFamily: "inherit", fontWeight: 600, fontSize: 13, textAlign: "left", position: "relative" }}>
              <Icon n={item.icon} s={15} c={active ? roleColor : "rgba(255,255,255,.38)"}/>
              {!collapsed && <span style={{ flex: 1 }}>{item.label}</span>}
              {!collapsed && item.badge && (
                <span style={{ background: "#EF4444", color: "#fff", fontSize: 9, fontWeight: 800, padding: "1px 5px", borderRadius: 10 }}>{item.badge}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User info */}
      {!collapsed && (
        <div style={{ padding: "12px 14px", borderTop: "1px solid rgba(255,255,255,.07)", display: "flex", alignItems: "center", gap: 10 }}>
          <Av init={user.avatar} sz={32} bg={roleColor}/>
          <div style={{ flex: 1, overflow: "hidden" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.white, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name}</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,.4)", textTransform: "capitalize" }}>{user.role}</div>
          </div>
        </div>
      )}

      {/* Collapse */}
      <div style={{ padding: "8px", borderTop: "1px solid rgba(255,255,255,.06)" }}>
        <button onClick={() => setCollapsed(!collapsed)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", border: "none", background: "transparent", cursor: "pointer", color: "rgba(255,255,255,.3)", fontFamily: "inherit", fontSize: 12, fontWeight: 600 }}>
          <Icon n={collapsed ? "cr" : "cl"} s={14} c="rgba(255,255,255,.3)"/>
          {!collapsed && "Collapse"}
        </button>
      </div>
    </div>
  );
}

/* ── Dashboard Topbar ── */
function DashTopbar({ user, page, onLogout }) {
  const roleColor = ROLE_COLORS[user.role];
  return (
    <div style={{ height: 60, background: T.white, borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", padding: "0 20px", gap: 12, flexShrink: 0 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: T.navy }}>{PAGE_LABELS[page] || "Dashboard"}</div>
        <div style={{ fontSize: 10, color: T.muted }}>checkupify.com · Wed, 18 March 2026</div>
      </div>
      <div style={{ position: "relative" }}>
        <input style={{ paddingLeft: 30, paddingRight: 12, paddingTop: 7, paddingBottom: 7, borderRadius: 10, border: `1px solid ${T.border}`, fontSize: 12, background: T.bg, width: 200, fontFamily: "inherit", outline: "none", color: T.navy }} placeholder="Search…"/>
        <Icon n="search" s={13} c={T.muted} style={{ position: "absolute", left: 9, top: 8 }}/>
      </div>
      <button style={{ width: 34, height: 34, borderRadius: 10, background: T.bg, border: "none", cursor: "pointer", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon n="bell" s={15} c={T.navy}/>
        <span style={{ position: "absolute", top: 6, right: 6, width: 7, height: 7, borderRadius: "50%", background: T.red, border: "2px solid #fff" }}/>
      </button>
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <Av init={user.avatar} sz={32} bg={roleColor}/>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.navy }}>{user.name}</div>
          <div style={{ fontSize: 10, color: T.muted, textTransform: "capitalize" }}>{ROLE_LABELS[user.role]}</div>
        </div>
        <button onClick={onLogout} style={{ width: 32, height: 32, borderRadius: 9, background: T.bg, border: `1px solid ${T.border}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", marginLeft: 4 }} title="Sign out">
          <Icon n="logout" s={14} c={T.muted}/>
        </button>
      </div>
    </div>
  );
}

/* ── Dashboard Pages ── */
function StatCard({ label, value, sub, icon, color = T.teal }) {
  return (
    <Card>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 11, color: T.muted, fontWeight: 500, marginBottom: 4 }}>{label}</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: T.navy }}>{value}</div>
          {sub && <div style={{ fontSize: 11, color, fontWeight: 600, marginTop: 2 }}>{sub}</div>}
        </div>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: color + "18", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon n={icon} s={18} c={color}/>
        </div>
      </div>
    </Card>
  );
}

function PatientDash({ user, setPage }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ borderRadius: 18, padding: "22px 26px", background: `linear-gradient(135deg, ${T.navy}, ${T.mid})`, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: -40, top: -40, width: 180, height: 180, borderRadius: "50%", background: T.teal + "0D", pointerEvents: "none" }}/>
        <div style={{ color: T.white, fontSize: 20, fontWeight: 900 }}>Good morning, {user.name.split(" ")[0]}! 👋</div>
        <div style={{ color: "rgba(255,255,255,.55)", fontSize: 13, marginTop: 4 }}>Health Score: 86/100 · 2 appointments this week</div>
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <Btn sz="md" icon="bot" onClick={() => setPage("kivi")}>Ask Kivi AI</Btn>
          <button onClick={() => setPage("appts")} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 11, background: "rgba(255,255,255,.12)", border: "1.5px solid rgba(255,255,255,.22)", color: T.white, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
            <Icon n="cal" s={14} c="#fff"/> Book Appointment
          </button>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        <StatCard label="Appointments" value="3" icon="cal" color={T.teal}/>
        <StatCard label="Lab Reports" value="7" icon="flask" color={T.purple}/>
        <StatCard label="Prescriptions" value="2" icon="file" color={T.amber}/>
        <StatCard label="Health Score" value="86" sub="↑ Good" icon="hrt" color={T.red}/>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 14 }}>
        <Card pad={20}>
          <div style={{ fontWeight: 800, fontSize: 14, color: T.navy, marginBottom: 14 }}>Upcoming Appointments</div>
          {[{ doc: "Dr. Priya Sharma", spec: "General Physician", time: "Today 10:30 AM", type: "Video" }, { doc: "Dr. Arjun Mehta", spec: "Cardiologist", time: "Mar 20, 2:00 PM", type: "Clinic" }].map((a, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i === 0 ? `1px solid ${T.border}` : undefined }}>
              <Av init={a.doc.split(" ").filter((_, j) => j > 0).map(n => n[0]).join("")} sz={38}/>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: T.navy }}>{a.doc}</div>
                <div style={{ fontSize: 11, color: T.muted }}>{a.spec} · {a.time}</div>
              </div>
              <Tag color={a.type === "Video" ? T.purple : T.teal}>{a.type === "Video" ? "📹 Video" : "🏥 Clinic"}</Tag>
            </div>
          ))}
        </Card>
        <Card pad={18}>
          <div style={{ fontWeight: 800, fontSize: 13, color: T.navy, marginBottom: 10 }}>My Vitals</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[["BP", "118/78", "mmHg"], ["Pulse", "72", "bpm"], ["Sugar", "104", "mg/dL"], ["BMI", "23.4", "kg/m²"]].map(([l, v, u]) => (
              <div key={l} style={{ padding: "9px 11px", borderRadius: 10, background: T.bg }}>
                <div style={{ fontSize: 10, color: T.muted, fontWeight: 600 }}>{l}</div>
                <div style={{ fontSize: 17, fontWeight: 800, color: T.navy }}>{v}</div>
                <div style={{ fontSize: 10, color: T.muted }}>{u}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function DoctorDash({ user, setPage }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ borderRadius: 18, padding: "22px 26px", background: `linear-gradient(135deg, ${T.navy}, ${T.mid})`, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: -40, top: -40, width: 180, height: 180, borderRadius: "50%", background: T.teal + "0D", pointerEvents: "none" }}/>
        <div style={{ color: T.white, fontSize: 20, fontWeight: 900 }}>Good morning, {user.name} 👩‍⚕️</div>
        <div style={{ color: "rgba(255,255,255,.55)", fontSize: 13, marginTop: 4 }}>6 patients in OPD queue · 3 follow-ups due today</div>
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <Btn sz="md" icon="tkn" onClick={() => setPage("opd")}>Open OPD Queue</Btn>
          <button onClick={() => setPage("kivi")} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 11, background: "rgba(255,255,255,.12)", border: "1.5px solid rgba(255,255,255,.22)", color: T.white, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
            <Icon n="bot" s={14} c="#fff"/> Ask Kivi AI
          </button>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        <StatCard label="Today's Patients" value="18" sub="↑ +3 from yesterday" icon="users" color={T.teal}/>
        <StatCard label="OPD Queue" value="6" sub="4 still waiting" icon="tkn" color={T.amber}/>
        <StatCard label="Revenue Today" value="₹9,600" sub="↑ +18% this week" icon="trnd" color={T.purple}/>
        <StatCard label="Follow-ups Due" value="12" sub="3 urgent" icon="wa" color="#25D366"/>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 14 }}>
        <Card pad={20}>
          <div style={{ fontWeight: 800, fontSize: 14, color: T.navy, marginBottom: 14 }}>Quick Actions</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
            {[["edit", "New Rx", "ehr", T.teal], ["vid", "Video Call", "teleconsult", T.purple], ["wa", "Follow-up", "followup", "#25D366"], ["bed", "Admit", "ipd", T.red], ["rcp", "Bill", "billing", T.amber], ["bot", "Kivi AI", "kivi", T.navy]].map(([icon, label, pg, color]) => (
              <button key={pg} onClick={() => setPage(pg)} style={{ padding: "12px 6px", borderRadius: 12, background: color + "0E", border: `1px solid ${color}18`, display: "flex", flexDirection: "column", alignItems: "center", gap: 5, cursor: "pointer", fontFamily: "inherit" }}>
                <Icon n={icon} s={20} c={color}/>
                <span style={{ fontSize: 11, fontWeight: 700, color: T.navy }}>{label}</span>
              </button>
            ))}
          </div>
        </Card>
        <Card pad={18}>
          <div style={{ fontWeight: 800, fontSize: 14, color: T.navy, marginBottom: 12 }}>Today's OPD</div>
          {[{ token: "T-001", name: "Rahul Verma", type: "Follow-up", status: "active" }, { token: "T-002", name: "Priya Singh", type: "New Patient", status: "waiting" }, { token: "T-003", name: "Arun Kumar", type: "Consultation", status: "waiting" }].map((p, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: i < 2 ? `1px solid ${T.border}` : undefined }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: p.status === "active" ? T.teal + "18" : T.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: p.status === "active" ? T.teal : T.muted }}>{p.token}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.navy }}>{p.name}</div>
                <div style={{ fontSize: 11, color: T.muted }}>{p.type}</div>
              </div>
              <Tag color={p.status === "active" ? T.teal : T.amber}>{p.status === "active" ? "Now" : "Wait"}</Tag>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

function GenericDash({ user }) {
  const role = user.role;
  const configs = {
    lab:      { stats: [{ l: "Today's Bookings", v: "84", i: "cal", c: T.teal }, { l: "Pending Reports", v: "17", i: "clk", c: T.amber }, { l: "Revenue Today", v: "₹38,400", i: "trnd", c: T.purple }, { l: "Reports Uploaded", v: "67", i: "file", c: T.navy }] },
    hospital: { stats: [{ l: "Total Beds", v: "44", i: "bed", c: T.navy }, { l: "Occupied", v: "29", i: "users", c: T.red }, { l: "Available", v: "15", i: "check", c: T.teal }, { l: "Today's Admissions", v: "8", i: "plus", c: T.amber }] },
    pharmacy: { stats: [{ l: "Pending Orders", v: "23", i: "cal", c: T.amber }, { l: "Dispatched Today", v: "41", i: "map", c: T.teal }, { l: "Revenue Today", v: "₹18,400", i: "trnd", c: T.purple }, { l: "Low Stock Items", v: "5", i: "inf", c: T.red }] },
    admin:    { stats: [{ l: "Total Patients", v: "2,84,619", i: "users", c: T.teal }, { l: "Active Doctors", v: "4,231", i: "act", c: T.navy }, { l: "Monthly Revenue", v: "₹1.8Cr", i: "trnd", c: T.purple }, { l: "Tests Today", v: "8,942", i: "flask", c: T.amber }] },
  };
  const cfg = configs[role] || configs.admin;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ borderRadius: 18, padding: "22px 26px", background: `linear-gradient(135deg, ${T.navy}, ${T.mid})`, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: -40, top: -40, width: 180, height: 180, borderRadius: "50%", background: T.teal + "0D", pointerEvents: "none" }}/>
        <div style={{ color: T.white, fontSize: 20, fontWeight: 900 }}>Welcome, {user.name} 👋</div>
        <div style={{ color: "rgba(255,255,255,.55)", fontSize: 13, marginTop: 4 }}>{ROLE_LABELS[role]} · checkupify.com</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        {cfg.stats.map((s, i) => <StatCard key={i} label={s.l} value={s.v} icon={s.i} color={s.c}/>)}
      </div>
      <Card pad={20}>
        <div style={{ textAlign: "center", padding: "40px 0", color: T.muted }}>
          <Icon n="zap" s={40} c={T.border}/>
          <div style={{ fontSize: 16, fontWeight: 800, color: T.navy, marginTop: 12 }}>
            {ROLE_LABELS[role]} — Full modules available
          </div>
          <div style={{ fontSize: 13, marginTop: 6 }}>Use the sidebar to navigate between modules.</div>
        </div>
      </Card>
    </div>
  );
}

function Placeholder({ page }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 300 }}>
      <Icon n="zap" s={44} c={T.border}/>
      <div style={{ fontSize: 16, fontWeight: 800, color: T.navy, marginTop: 12 }}>{PAGE_LABELS[page] || page}</div>
      <div style={{ fontSize: 13, color: T.muted, marginTop: 6 }}>Module ready for full implementation.</div>
    </div>
  );
}

/* ── Main Dashboard Shell ── */
function Dashboard({ user, onLogout }) {
  const [page, setPage] = useState("dash");
  const [collapsed, setCollapsed] = useState(false);

  function renderPage() {
    if (page === "dash") {
      if (user.role === "patient") return <PatientDash user={user} setPage={setPage}/>;
      if (user.role === "doctor") return <DoctorDash user={user} setPage={setPage}/>;
      return <GenericDash user={user}/>;
    }
    return <Placeholder page={page}/>;
  }

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "inherit", background: T.bg, overflow: "hidden" }}>
      <DashSidebar user={user} page={page} setPage={setPage} collapsed={collapsed} setCollapsed={setCollapsed}/>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <DashTopbar user={user} page={page} onLogout={onLogout}/>
        <main style={{ flex: 1, overflowY: "auto", padding: 20 }}>
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   ██████  PUBLIC WEBSITE  ██████
───────────────────────────────────────────────────────────────────────────── */
function Website({ onLogin }) {
  return (
    <div style={{ fontFamily: "inherit" }}>
      <PublicNav onLogin={onLogin}/>
      <Hero onLogin={onLogin}/>
      <FeaturesStrip/>
      <ForPartners onLogin={onLogin}/>
      <Testimonials/>
      <CTABanner onLogin={onLogin}/>
      <Footer/>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   ██████  ROOT — ROUTING CONTROLLER  ██████
───────────────────────────────────────────────────────────────────────────── */
export default function App() {
  // screen: "website" | "login" | "dashboard"
  const [screen, setScreen] = useState("website");
  const [user, setUser] = useState(null);

  function handleLoginSuccess(account) {
    setUser(account);
    setScreen("dashboard");
  }

  function handleLogout() {
    setUser(null);
    setScreen("website");
  }

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"/>

      {screen === "website" && (
        <Website onLogin={() => setScreen("login")}/>
      )}

      {screen === "login" && (
        <LoginPage
          onSuccess={handleLoginSuccess}
          onBack={() => setScreen("website")}
        />
      )}

      {screen === "dashboard" && user && (
        <Dashboard user={user} onLogout={handleLogout}/>
      )}
    </div>
  );
}
