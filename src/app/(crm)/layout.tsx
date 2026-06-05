"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Sidebar } from "@/components/layout/Sidebar";

export default function CrmLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [counts, setCounts] = useState({ new: 0, leads: 0, verify: 0 });
  const [checking, setChecking] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  const fetchCounts = useCallback(async () => {
    const [b, l, v] = await Promise.allSettled([
      supabase.from("bookings").select("id", { count: "exact", head: true }).eq("stage", "New"),
      supabase.from("leads").select("id", { count: "exact", head: true }).eq("status", "New"),
      supabase.from("bookings").select("id", { count: "exact", head: true }).in("stage", ["Report Uploaded", "Partially Uploaded"]),
    ]);
    setCounts({
      new:    b.status === "fulfilled" ? (b.value.count ?? 0) : 0,
      leads:  l.status === "fulfilled" ? (l.value.count ?? 0) : 0,
      verify: v.status === "fulfilled" ? (v.value.count ?? 0) : 0,
    });
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.replace("/login"); return; }
      setEmail(session.user.email ?? "");
      setChecking(false);
      fetchCounts();
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((e, s) => {
      if (e === "SIGNED_OUT" || !s) router.replace("/login");
    });
    return () => subscription.unsubscribe();
  }, [router, fetchCounts]);

  if (checking) return (
    <div className="flex-center" style={{ minHeight: "100vh", background: "var(--navy-grad)" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 48, height: 48, borderRadius: 16, background: "var(--teal)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", boxShadow: "0 0 20px rgba(0,204,142,.4)" }}>
          <span style={{ color: "white", fontWeight: 900, fontSize: 22 }}>C</span>
        </div>
        <div className="spin" style={{ width: 22, height: 22, border: "2.5px solid rgba(255,255,255,.15)", borderTopColor: "var(--teal)", borderRadius: "50%", margin: "0 auto" }} />
      </div>
    </div>
  );

  return (
    <div className="app-shell">
      <Sidebar userEmail={email} newBookings={counts.new} newLeads={counts.leads} pendingVerify={counts.verify} open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="main-area">
        {/* Inject onMenuClick into children via context — passed through cloneElement workaround */}
        {children}
      </div>
    </div>
  );
}
