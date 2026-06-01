"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const QUICK = [
  { email: "ops@checkupify.com", role: "CRM Ops", color: "#22C55E" },
  { email: "lab@checkupify.com", role: "Provider", color: "#3B82F6" },
  { email: "admin@checkupify.com", role: "Admin", color: "#8B5CF6" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("ops@checkupify.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }
      if (data.user) {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Connection error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Left panel — Brand */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0B1E3D 0%, #0D2A52 50%, #0B1E3D 100%)" }}
      >
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #22C55E, transparent)", transform: "translate(30%, -30%)" }} />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-8" style={{ background: "radial-gradient(circle, #3B82F6, transparent)", transform: "translate(-30%, 30%)" }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full opacity-5" style={{ background: "radial-gradient(circle, #22C55E, transparent)", transform: "translate(-50%, -50%)" }} />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "#22C55E", boxShadow: "0 0 20px rgba(34,197,94,0.4)" }}>
            <span className="text-white font-black text-lg">C</span>
          </div>
          <div>
            <p className="text-white font-black text-lg leading-none">Checkupify</p>
            <p className="text-white/40 text-xs mt-0.5">Operations Platform</p>
          </div>
        </div>

        {/* Main content */}
        <div className="relative z-10">
          <h1 className="text-5xl font-black text-white leading-tight mb-6" style={{ letterSpacing: "-1.5px" }}>
            Healthcare<br />
            Operations<br />
            <span style={{ color: "#22C55E" }}>Reimagined.</span>
          </h1>
          <p className="text-white/50 text-lg leading-relaxed max-w-xs">
            Manage bookings, labs, patients, and SLAs — all in one powerful platform.
          </p>

          {/* Stats */}
          <div className="flex gap-8 mt-10">
            {[["23+", "Bookings"], ["8", "Labs"], ["16+", "Leads"]].map(([n, l]) => (
              <div key={l}>
                <p className="text-2xl font-black text-white">{n}</p>
                <p className="text-white/40 text-xs mt-0.5">{l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-white/20 text-xs relative z-10">© 2026 Checkupify · Enterprise Healthcare Platform</p>
      </div>

      {/* Right panel — Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-[#F5F7FA]">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#22C55E" }}>
              <span className="text-white font-black">C</span>
            </div>
            <p className="text-[#0D1B35] font-black text-lg">Checkupify CRM</p>
          </div>

          <h2 className="text-3xl font-black text-[#0D1B35] mb-2" style={{ letterSpacing: "-0.5px" }}>
            Welcome back
          </h2>
          <p className="text-[#7A90B3] text-sm mb-8">Sign in to continue to your workspace</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-[#7A90B3] uppercase tracking-widest mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full bg-white border border-[#E8ECF2] rounded-2xl px-4 py-3.5 text-sm text-[#0D1B35] outline-none transition-all shadow-sm"
                style={{ boxShadow: "0 1px 3px rgba(11,30,61,0.06)" }}
                onFocus={e => { e.target.style.borderColor = "#22C55E"; e.target.style.boxShadow = "0 0 0 3px rgba(34,197,94,0.15)"; }}
                onBlur={e => { e.target.style.borderColor = "#E8ECF2"; e.target.style.boxShadow = "0 1px 3px rgba(11,30,61,0.06)"; }}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#7A90B3] uppercase tracking-widest mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••••"
                className="w-full bg-white border border-[#E8ECF2] rounded-2xl px-4 py-3.5 text-sm text-[#0D1B35] outline-none transition-all shadow-sm"
                style={{ boxShadow: "0 1px 3px rgba(11,30,61,0.06)" }}
                onFocus={e => { e.target.style.borderColor = "#22C55E"; e.target.style.boxShadow = "0 0 0 3px rgba(34,197,94,0.15)"; }}
                onBlur={e => { e.target.style.borderColor = "#E8ECF2"; e.target.style.boxShadow = "0 1px 3px rgba(11,30,61,0.06)"; }}
              />
            </div>

            {error && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
                <span className="text-red-500 text-lg leading-none mt-0.5">!</span>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl font-bold text-white text-[15px] transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2.5 mt-2"
              style={{
                background: "linear-gradient(135deg, #22C55E, #16A34A)",
                boxShadow: "0 4px 14px rgba(34,197,94,0.35)",
              }}
              onMouseOver={e => { (e.target as HTMLButtonElement).style.transform = "translateY(-1px)"; (e.target as HTMLButtonElement).style.boxShadow = "0 6px 20px rgba(34,197,94,0.45)"; }}
              onMouseOut={e => { (e.target as HTMLButtonElement).style.transform = "translateY(0)"; (e.target as HTMLButtonElement).style.boxShadow = "0 4px 14px rgba(34,197,94,0.35)"; }}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </>
              ) : "Sign in to CRM →"}
            </button>
          </form>

          {/* Quick Access */}
          <div className="mt-8 pt-6 border-t border-[#E8ECF2]">
            <p className="text-[10px] font-bold text-[#A8BACC] uppercase tracking-widest mb-3">Quick Access</p>
            <div className="space-y-1">
              {QUICK.map(q => (
                <button key={q.email} onClick={() => setEmail(q.email)}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl hover:bg-white cursor-pointer transition-all group border border-transparent hover:border-[#E8ECF2]">
                  <span className="text-[12px] text-[#7A90B3] group-hover:text-[#3D5278]">{q.email}</span>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: q.color + "15", color: q.color }}>{q.role}</span>
                </button>
              ))}
            </div>
            <div className="mt-3 px-3.5 py-2.5 rounded-xl bg-white border border-[#E8ECF2]">
              <p className="text-[11px] text-center text-[#A8BACC]">
                Password: <code className="font-mono text-[#3D5278] bg-slate-50 px-1.5 py-0.5 rounded">Checkupify@2026</code>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
