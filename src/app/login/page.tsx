"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const ACCOUNTS = [
  { email: "ops@checkupify.com",   label: "CRM Ops",   color: "#00CC8E" },
  { email: "admin@checkupify.com", label: "Admin",     color: "#3B82F6" },
  { email: "lab@checkupify.com",   label: "Provider",  color: "#7C3AED" },
];

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("ops@checkupify.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) { setError(err.message); setLoading(false); return; }
    if (data.user) { router.push("/dashboard"); router.refresh(); }
  }

  return (
    <div className="login-wrap">
      {/* Brand panel */}
      <div className="login-brand">
        <div className="login-brand-deco-1" />
        <div className="login-brand-deco-2" />

        {/* Logo */}
        <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 14, background: "var(--teal)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px rgba(0,204,142,.4)" }}>
            <span style={{ color: "white", fontWeight: 900, fontSize: 20 }}>C</span>
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: "white" }}>Checkupify</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)" }}>Operations Platform</div>
          </div>
        </div>

        {/* Headline */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <h1 style={{ fontSize: 44, fontWeight: 900, color: "white", letterSpacing: -2, lineHeight: 1.1, marginBottom: 16 }}>
            Healthcare<br />Operations<br /><span style={{ color: "var(--teal)" }}>Simplified.</span>
          </h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,.5)", lineHeight: 1.6, maxWidth: 320 }}>
            Manage bookings, verify reports, track SLAs and grow your healthcare network.
          </p>

          {/* Stats */}
          <div style={{ display: "flex", gap: 32, marginTop: 36 }}>
            {[["23+", "Bookings"], ["9", "Packages"], ["5", "Lab Partners"]].map(([n, l]) => (
              <div key={l}>
                <div style={{ fontSize: 26, fontWeight: 900, color: "white" }}>{n}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)", marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ fontSize: 11, color: "rgba(255,255,255,.2)", position: "relative", zIndex: 1 }}>
          © 2026 Checkupify Health Technologies
        </div>
      </div>

      {/* Form side */}
      <div className="login-form-side">
        <div className="login-form-box">
          {/* Mobile logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 36 }}>
            <div style={{ width: 36, height: 36, borderRadius: 12, background: "var(--teal)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "white", fontWeight: 900, fontSize: 16 }}>C</span>
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "var(--ink)" }}>Checkupify CRM</div>
          </div>

          <h2 style={{ fontSize: 28, fontWeight: 900, color: "var(--ink)", letterSpacing: -.5, marginBottom: 6 }}>Welcome back</h2>
          <p style={{ fontSize: 14, color: "var(--hint)", marginBottom: 28 }}>Sign in to your workspace</p>

          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="form-input" placeholder="ops@checkupify.com" />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="form-input" placeholder="••••••••••" />
            </div>

            {error && (
              <div className="alert danger">
                <span className="alert-icon">⚠</span>
                <div>
                  <div className="alert-title">{error}</div>
                </div>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn primary lg full" style={{ marginTop: 4 }}>
              {loading ? <><span className="spin-sm" />Signing in…</> : "Sign in to CRM →"}
            </button>
          </form>

          {/* Quick access */}
          <div style={{ marginTop: 28, paddingTop: 24, borderTop: "1px solid var(--border)" }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color: "var(--hint)", marginBottom: 10 }}>Quick Access</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {ACCOUNTS.map(a => (
                <button key={a.email} onClick={() => setEmail(a.email)} type="button"
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderRadius: "var(--r10)", border: "1px solid transparent", background: "none", cursor: "pointer", transition: "all .12s", fontFamily: "inherit" }}
                  onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = "var(--s2)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; }}
                  onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = "none"; (e.currentTarget as HTMLElement).style.borderColor = "transparent"; }}>
                  <span style={{ fontSize: 13, color: "var(--muted)" }}>{a.email}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: a.color + "15", color: a.color }}>{a.label}</span>
                </button>
              ))}
            </div>
            <div style={{ marginTop: 10, padding: "10px 12px", borderRadius: "var(--r10)", background: "var(--s2)", border: "1px solid var(--border)", textAlign: "center" }}>
              <span style={{ fontSize: 12, color: "var(--muted)" }}>Password: </span>
              <code style={{ fontSize: 12, fontWeight: 700, color: "var(--teal)", background: "var(--teal-l)", padding: "2px 8px", borderRadius: 4 }}>Checkupify@2026</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
