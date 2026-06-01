"use client";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Dashboard",  emoji: "⊞" },
  { href: "/queue",     label: "Confirm Queue", emoji: "⏱" },
  { href: "/bookings",  label: "All Bookings",  emoji: "📅" },
  { href: "/upload",    label: "Upload Reports",emoji: "📤" },
  { href: "/analytics", label: "Analytics",     emoji: "📊" },
];

interface Props {
  userEmail?: string;
  queueCount?: number;
  open?: boolean;
  onClose?: () => void;
}

function SidebarContent({ userEmail = "", queueCount = 0, onClose }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() { await supabase.auth.signOut(); router.push("/login"); }
  function navigate(href: string) { router.push(href); onClose?.(); }

  return (
    <div className="flex flex-col h-full" style={{ background: "linear-gradient(180deg, #0B2545 0%, #0D2A52 100%)" }}>
      <div className="px-5 py-5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#22C55E", boxShadow: "0 0 16px rgba(34,197,94,0.4)" }}>
            <span className="text-white font-black text-base">C</span>
          </div>
          <div>
            <p className="text-[14px] font-black text-white leading-none">Checkupify</p>
            <p className="text-[10px] text-white/40 mt-0.5">Provider Portal</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="md:hidden w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-white/60 cursor-pointer">✕</button>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <button key={item.href} onClick={() => navigate(item.href)}
              className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold cursor-pointer text-left transition-all relative",
                active ? "bg-white/12 text-white" : "text-white/50 hover:text-white/80 hover:bg-white/8")}>
              {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-[#22C55E]" />}
              <span className="text-base w-5 text-center">{item.emoji}</span>
              <span className="flex-1">{item.label}</span>
              {item.href === "/queue" && queueCount > 0 && (
                <span className="px-1.5 py-0.5 bg-[#22C55E] text-white text-[9px] font-black rounded-full">{queueCount}</span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="px-3 pb-5 pt-3 border-t border-white/10">
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/8">
          <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-[13px] text-[#22C55E]"
            style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)" }}>
            {(userEmail?.[0] ?? "L").toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-white/70 truncate">{userEmail?.split("@")[0] ?? "Lab"}</p>
            <p className="text-[10px] text-white/30">Lab Partner</p>
          </div>
          <button onClick={signOut} className="text-white/20 hover:text-red-400 transition-colors cursor-pointer text-sm">↩</button>
        </div>
        <div className="flex items-center gap-2 px-3 mt-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" style={{ boxShadow: "0 0 6px #22C55E" }} />
          <span className="text-[10px] text-white/25">Live · Supabase</span>
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
