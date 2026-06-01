"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("lab@checkupify.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) { setError(authError.message); setLoading(false); return; }
      if (data.user) { router.push("/dashboard"); router.refresh(); }
    } catch {
      setError("Connection error. Try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left — Brand panel */}
      <div className="md:w-1/2 flex flex-col justify-between p-8 md:p-12 relative overflow-hidden min-h-[200px] md:min-h-screen"
        style={{ background: "linear-gradient(135deg, #0B2545 0%, #1B4B8A 100%)" }}>
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #22C55E, transparent)", transform: "translate(30%, -30%)" }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-8" style={{ background: "radial-gradient(circle, #22C55E, transparent)", transform: "translate(-30%, 30%)" }} />

        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "#22C55E", boxShadow: "0 0 20px rgba(34,197,94,0.4)" }}>
            <span className="text-white font-black text-lg">C</span>
          </div>
          <div>
            <p className="text-white font-black text-lg leading-none">Checkupify</p>
            <p className="text-white/40 text-xs mt-0.5">Provider Portal</p>
          </div>
        </div>

        <div className="relative z-10 hidden md:block">
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-4" style={{ letterSpacing: "-1px" }}>
            Lab Partner<br />Dashboard
          </h1>
          <p className="text-white/50 text-base leading-relaxed max-w-xs">
            Confirm bookings, upload reports, and track SLA compliance — all in one place.
          </p>
          <div className="flex gap-8 mt-8">
            {[["2hr", "Confirm SLA"], ["6hr", "Report TAT"], ["36hr", "Full Report"]].map(([n, l]) => (
              <div key={l}>
                <p className="text-xl font-black text-white">{n}</p>
                <p className="text-white/40 text-xs mt-0.5">{l}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-white/20 text-xs relative z-10 hidden md:block">© 2026 Checkupify</p>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 bg-[#F0F4F8]">
        <div className="w-full max-w-[380px]">
          <h2 className="text-2xl md:text-3xl font-black text-[#0B2545] mb-2" style={{ letterSpacing: "-0.5px" }}>Welcome back</h2>
          <p className="text-[#7A90B3] text-sm mb-8">Sign in to your lab partner account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[{ l: "Email Address", v: email, s: setEmail, t: "email", p: "lab@checkupify.com" },
              { l: "Password", v: password, s: setPassword, t: "password", p: "••••••••" }].map(f => (
              <div key={f.l}>
                <label className="block text-[11px] font-bold text-[#7A90B3] uppercase tracking-widest mb-2">{f.l}</label>
                <input type={f.t} value={f.v} onChange={e => f.s(e.target.value)} required placeholder={f.p}
                  className="w-full bg-white border border-[#E2E8F0] rounded-2xl px-4 py-3.5 text-sm text-[#0B2545] outline-none shadow-sm"
                  onFocus={e => { e.target.style.borderColor = "#22C55E"; e.target.style.boxShadow = "0 0 0 3px rgba(34,197,94,0.12)"; }}
                  onBlur={e => { e.target.style.borderColor = "#E2E8F0"; e.target.style.boxShadow = "0 1px 3px rgba(11,37,69,0.06)"; }} />
              </div>
            ))}

            {error && (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
                <span className="text-red-500 text-sm">!</span>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-2xl font-bold text-white text-[15px] transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2.5 mt-2"
              style={{ background: "linear-gradient(135deg, #22C55E, #16A34A)", boxShadow: "0 4px 14px rgba(34,197,94,0.35)" }}>
              {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in…</> : "Sign in to Provider Portal →"}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#E2E8F0]">
            <div className="rounded-2xl p-4 bg-white border border-[#E2E8F0]">
              <p className="text-[10px] font-bold text-[#B0BEC5] uppercase tracking-widest mb-2">Demo Account</p>
              <p className="text-sm text-[#3D5A80]">lab@checkupify.com</p>
              <p className="text-xs text-[#B0BEC5] mt-1">Password: <code className="font-mono text-[#3D5A80] bg-slate-50 px-1.5 py-0.5 rounded">Checkupify@2026</code></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
