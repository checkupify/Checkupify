"use client";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard",      label: "Dashboard",          emoji: "⊞",  section: "OPERATIONS" },
  { href: "/queue",          label: "Confirmation Pending",emoji: "⏱",  badge: "confirm" },
  { href: "/upload",         label: "Upload Reports",      emoji: "📤",  badge: "pending" },
  { href: "/bookings",       label: "All Appointments",    emoji: "📅"  },
  { href: "/tat",            label: "TAT Analytics",       emoji: "⏲",  section: "ANALYTICS" },
  { href: "/quality",        label: "Quality Score",       emoji: "⭐" },
  { href: "/invoices",       label: "Invoices & Payouts",  emoji: "💳",  section: "FINANCE" },
  { href: "/reconciliation", label: "Reconciliation",      emoji: "📊" },
  { href: "/contracts",      label: "Contract & Packages", emoji: "📋",  section: "ACCOUNT" },
  { href: "/analytics",      label: "Settings",            emoji: "⚙️" },
];

interface Props { userEmail?: string; queueCount?: number; pendingCount?: number; open?: boolean; onClose?: () => void; }

function SidebarContent({ userEmail = "", queueCount = 0, pendingCount = 0, onClose }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  async function signOut() { await supabase.auth.signOut(); router.push("/login"); }
  function navigate(href: string) { router.push(href); onClose?.(); }

  return (
    <div className="flex flex-col h-full" style={{ background: "linear-gradient(180deg, #0B2545 0%, #0D2A52 100%)" }}>
      {/* Logo */}
      <div className="px-4 py-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#00CC8E", boxShadow: "0 0 12px rgba(0,204,142,.4)" }}>
            <span className="text-white font-black text-sm">C</span>
          </div>
          <div>
            <p className="text-[13px] font-black text-white leading-none">Checkupify</p>
            <p className="text-[9px] text-white/40 mt-0.5">Provider Portal</p>
          </div>
        </div>
        {onClose && <button onClick={onClose} className="md:hidden w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-white/60 cursor-pointer text-xs">✕</button>}
      </div>

      {/* Lab info */}
      <div className="px-4 py-3 border-b border-white/8">
        <div className="bg-white/8 rounded-xl p-3 border border-white/10 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white/10 border border-dashed border-white/20 flex items-center justify-center text-lg flex-shrink-0">🏥</div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-bold text-white truncate">{userEmail?.split("@")[0] ?? "Lab"}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm text-white" style={{ background: "#00CC8E" }}>✓ NABL</span>
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto">
        {NAV.map((item, i) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const prevItem = NAV[i - 1];
          const showSection = item.section && item.section !== prevItem?.section;
          return (
            <div key={item.href}>
              {showSection && <p className="text-[9px] font-bold text-white/25 uppercase tracking-[.1em] px-3 pt-3 pb-1">{item.section}</p>}
              <button onClick={() => navigate(item.href)}
                className={cn("w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium cursor-pointer text-left transition-all mb-0.5 relative",
                  active ? "text-[#00CC8E]" : "text-white/50 hover:text-white/80 hover:bg-white/6")}
                style={{ background: active ? "rgba(0,204,142,.12)" : undefined, border: active ? "1px solid rgba(0,204,142,.18)" : "1px solid transparent" }}>
                {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full" style={{ background: "#00CC8E" }} />}
                <span className="text-sm w-4 text-center flex-shrink-0">{item.emoji}</span>
                <span className="flex-1 truncate text-[12px]">{item.label}</span>
                {item.badge === "confirm" && queueCount > 0 && <span className="px-1.5 py-0.5 bg-red-500 text-white text-[9px] font-black rounded-full">{queueCount}</span>}
                {item.badge === "pending" && pendingCount > 0 && <span className="px-1.5 py-0.5 text-white text-[9px] font-black rounded-full" style={{ background: "#F59E0B" }}>{pendingCount}</span>}
              </button>
            </div>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 pb-4 pt-3 border-t border-white/10">
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/8">
          <div className="w-7 h-7 rounded-full flex items-center justify-center font-black text-[11px] text-[#00CC8E] flex-shrink-0" style={{ background: "rgba(0,204,142,.15)", border: "1px solid rgba(0,204,142,.3)" }}>
            {(userEmail?.[0] ?? "L").toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-white/70 truncate">{userEmail?.split("@")[0] ?? "Lab"}</p>
            <p className="text-[9px] text-white/30">Lab Partner</p>
          </div>
          <button onClick={signOut} className="text-white/20 hover:text-red-400 transition-colors cursor-pointer text-sm" title="Sign out">↩</button>
        </div>
        <div className="flex items-center gap-1.5 px-3 mt-2">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#00CC8E", boxShadow: "0 0 5px #00CC8E" }} />
          <span className="text-[9px] text-white/25">Live · Supabase</span>
        </div>
      </div>
    </div>
  );
}

export function Sidebar(props: Props) {
  return (
    <>
      <aside className="hidden md:flex w-[220px] flex-shrink-0 flex-col h-screen sticky top-0 z-20">
        <SidebarContent {...props} />
      </aside>
      {props.open && (
        <>
          <div className="mobile-nav-overlay md:hidden" onClick={props.onClose} />
          <aside className="fixed inset-y-0 left-0 w-[260px] z-50 md:hidden slide-left">
            <SidebarContent {...props} />
          </aside>
        </>
      )}
    </>
  );
}
