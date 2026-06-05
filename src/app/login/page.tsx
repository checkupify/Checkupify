"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("lab@checkupify.com");
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
        <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 14, background: "var(--teal)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px rgba(0,204,142,.4)" }}>
            <span style={{ color: "white", fontWeight: 900, fontSize: 20 }}>C</span>
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, color: "white" }}>Checkupify</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)" }}>Provider Portal</div>
          </div>
        </div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <h1 style={{ fontSize: 44, fontWeight: 900, color: "white", letterSpacing: -2, lineHeight: 1.1, marginBottom: 16 }}>
            Lab Partner<br />Dashboard<br /><span style={{ color: "var(--teal)" }}>Simplified.</span>
          </h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,.5)", lineHeight: 1.6 }}>
            Confirm bookings, upload reports, and track your lab's SLA performance.
          </p>
          <div style={{ display: "flex", gap: 28, marginTop: 32 }}>
            {[["2hr", "Confirm SLA"], ["36hr", "Report TAT"], ["11%", "Platform Fee"]].map(([n, l]) => (
              <div key={l}>
                <div style={{ fontSize: 26, fontWeight: 900, color: "white" }}>{n}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,.4)", marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,.2)", position: "relative", zIndex: 1 }}>
          © 2026 Checkupify · Lab Partner Portal
        </div>
      </div>

      {/* Form */}
      <div className="login-form-side">
        <div className="login-form-box">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 36 }}>
            <div style={{ width: 36, height: 36, borderRadius: 12, background: "var(--teal)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "white", fontWeight: 900, fontSize: 16 }}>C</span>
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "var(--ink)" }}>Checkupify Provider</div>
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: "var(--ink)", letterSpacing: -.5, marginBottom: 6 }}>Welcome back</h2>
          <p style={{ fontSize: 14, color: "var(--hint)", marginBottom: 28 }}>Sign in to your lab partner account</p>
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="form-input" placeholder="lab@checkupify.com" />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="form-input" placeholder="••••••••" />
            </div>
            {error && (
              <div className="alert danger">
                <span className="alert-icon">⚠</span>
                <div><div className="alert-title">{error}</div></div>
              </div>
            )}
            <button type="submit" disabled={loading} className="btn primary lg full" style={{ marginTop: 4 }}>
              {loading ? <><span className="spin-sm" />Signing in…</> : "Sign in to Provider Portal →"}
            </button>
          </form>
          <div style={{ marginTop: 24, padding: "14px 16px", borderRadius: "var(--r12)", background: "var(--s2)", border: "1px solid var(--border)", textAlign: "center" }}>
            <div style={{ fontSize: 11, color: "var(--hint)", marginBottom: 4 }}>Demo Account</div>
            <div style={{ fontSize: 13, color: "var(--slate)", fontWeight: 600 }}>lab@checkupify.com</div>
            <div style={{ fontSize: 12, color: "var(--hint)", marginTop: 4 }}>
              Password: <code style={{ color: "var(--teal)", background: "var(--teal-l)", padding: "1px 6px", borderRadius: 4 }}>Checkupify@2026</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
