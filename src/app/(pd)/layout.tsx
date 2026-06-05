"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Sidebar } from "@/components/layout/Sidebar";

export default function PdLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [queueCount, setQueueCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [checking, setChecking] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchCounts = useCallback(async () => {
    const [qRes, pRes] = await Promise.allSettled([
      supabase.from("bookings").select("id", { count: "exact", head: true }).eq("stage", "New"),
      supabase.from("bookings").select("id", { count: "exact", head: true }).in("stage", ["Confirmed", "In Progress"]),
    ]);
    if (qRes.status === "fulfilled" && qRes.value.count != null) setQueueCount(qRes.value.count);
    if (pRes.status === "fulfilled" && pRes.value.count != null) setPendingCount(pRes.value.count);
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

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0B2545 0%, #1B4B8A 100%)" }}>
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "#00CC8E", boxShadow: "0 0 20px rgba(0,204,142,.4)" }}>
            <span className="text-white font-black text-xl">C</span>
          </div>
          <div className="w-5 h-5 border-2 border-white/20 border-t-[#00CC8E] rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
      <Sidebar userEmail={email} queueCount={queueCount} pendingCount={pendingCount} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">{children}</div>
    </div>
  );
}
