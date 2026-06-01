"use client";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard",   label: "Dashboard",   icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { href: "/bookings",    label: "Bookings",    icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
  { href: "/customers",   label: "Customers",   icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
  { href: "/labs",        label: "Labs",        icon: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" },
  { href: "/packages",    label: "Packages",    icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
  { href: "/leads",       label: "Leads",       icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" },
  { href: "/enterprises", label: "Enterprises", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
  { href: "/finance",     label: "Finance",     icon: "M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" },
  { href: "/staff",       label: "Staff",       icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
  { href: "/settings",    label: "Settings",    icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
];

export function Sidebar({ userEmail = "", newBookings = 0, newLeads = 0 }:
  { userEmail?: string; newBookings?: number; newLeads?: number }) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <aside
      className="w-[220px] flex-shrink-0 flex flex-col h-screen sticky top-0 z-20 overflow-hidden"
      style={{ background: "linear-gradient(180deg, #0B1E3D 0%, #0D2347 100%)" }}
    >
      {/* Logo */}
      <div className="px-5 py-5 flex items-center gap-3 border-b border-white/8">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#22C55E", boxShadow: "0 0 12px rgba(34,197,94,0.35)" }}>
          <span className="text-white font-black text-sm">C</span>
        </div>
        <div>
          <p className="text-[13px] font-bold text-white leading-none">Checkupify</p>
          <p className="text-[10px] text-white/40 mt-0.5">CRM Platform</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-[9px] font-bold text-white/25 uppercase tracking-[0.15em] px-3 mb-2">Navigation</p>
        {NAV.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <button key={item.href} onClick={() => router.push(item.href)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium cursor-pointer text-left transition-all duration-150 group relative",
                active
                  ? "bg-white/10 text-white"
                  : "text-white/45 hover:text-white/80 hover:bg-white/6"
              )}>
              {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-[#22C55E]" />}
              <svg className={cn("w-4 h-4 flex-shrink-0", active ? "text-[#22C55E]" : "text-current")}
                fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={active ? 2.5 : 1.75}>
                {item.icon.includes("M") && item.icon.split("M").filter(Boolean).map((d, i) => (
                  <path key={i} strokeLinecap="round" strokeLinejoin="round" d={`M${d}`} />
                ))}
              </svg>
              <span className="flex-1">{item.label}</span>
              {item.href === "/bookings" && newBookings > 0 && (
                <span className="px-1.5 py-0.5 bg-[#22C55E] text-white text-[9px] font-black rounded-full leading-none">{newBookings}</span>
              )}
              {item.href === "/leads" && newLeads > 0 && (
                <span className="px-1.5 py-0.5 bg-blue-400 text-white text-[9px] font-black rounded-full leading-none">{newLeads}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 pb-5 pt-3 border-t border-white/8">
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.06)" }}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[#22C55E] text-[11px] font-black flex-shrink-0"
            style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.25)" }}>
            {(userEmail?.[0] ?? "U").toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-white/70 truncate">{userEmail?.split("@")[0] ?? "User"}</p>
            <p className="text-[9px] text-white/30">Operations</p>
          </div>
          <button onClick={signOut} className="text-white/20 hover:text-red-400 transition-colors cursor-pointer text-sm" title="Sign out">↩</button>
        </div>
        <div className="flex items-center gap-1.5 px-3 mt-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] flex-shrink-0" style={{ boxShadow: "0 0 6px #22C55E" }} />
          <span className="text-[10px] text-white/25">Live · Supabase</span>
        </div>
      </div>
    </aside>
  );
}
