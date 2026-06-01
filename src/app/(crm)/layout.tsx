"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Sidebar } from "@/components/layout/Sidebar";

export default function CrmLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [newBookings, setNewBookings] = useState(0);
  const [newLeads, setNewLeads] = useState(0);
  const [checking, setChecking] = useState(true);

  const fetchCounts = useCallback(async () => {
    const [bRes, lRes] = await Promise.allSettled([
      supabase.from("bookings").select("id", { count: "exact", head: true }).eq("stage", "New"),
      supabase.from("leads").select("id", { count: "exact", head: true }).eq("status", "New"),
    ]);
    if (bRes.status === "fulfilled" && bRes.value.count != null) setNewBookings(bRes.value.count);
    if (lRes.status === "fulfilled" && lRes.value.count != null) setNewLeads(lRes.value.count);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.replace("/login"); return; }
      setEmail(session.user.email ?? "");
      setChecking(false);
      fetchCounts();
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) router.replace("/login");
    });
    return () => subscription.unsubscribe();
  }, [router, fetchCounts]);

  if (checking) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "#22C55E", boxShadow: "0 0 20px rgba(34,197,94,0.3)" }}>
            <span className="text-white font-black">C</span>
          </div>
          <div className="w-6 h-6 border-2 border-[#E8ECF2] border-t-[#22C55E] rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F5F7FA] overflow-hidden">
      <Sidebar userEmail={email} newBookings={newBookings} newLeads={newLeads} />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {children}
      </div>
    </div>
  );
}
