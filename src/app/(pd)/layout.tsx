"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Sidebar } from "@/components/layout/Sidebar";

export default function PdLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [queueCount, setQueueCount] = useState(0);
  const [checking, setChecking] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchQueue = useCallback(async () => {
    const { count } = await supabase.from("bookings").select("id", { count: "exact", head: true }).eq("stage", "New");
    if (count != null) setQueueCount(count);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.replace("/login"); return; }
      setEmail(session.user.email ?? "");
      setChecking(false);
      fetchQueue();
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((e, s) => {
      if (e === "SIGNED_OUT" || !s) router.replace("/login");
    });
    return () => subscription.unsubscribe();
  }, [router, fetchQueue]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #0B2545 0%, #1B4B8A 100%)" }}>
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: "#22C55E", boxShadow: "0 0 20px rgba(34,197,94,0.4)" }}>
            <span className="text-white font-black text-xl">C</span>
          </div>
          <div className="w-5 h-5 border-2 border-white/20 border-t-[#22C55E] rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F0F4F8] overflow-hidden">
      <Sidebar userEmail={email} queueCount={queueCount} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">{children}</div>
    </div>
  );
}
