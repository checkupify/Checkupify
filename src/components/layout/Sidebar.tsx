"use client";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const NAV = [
  { href: "/dashboard",   label: "Dashboard",    icon: "⊞" },
  { href: "/bookings",    label: "Bookings",     icon: "📅", badge: "new" },
  { href: "/customers",   label: "Customers",    icon: "👥" },
  { href: "/labs",        label: "Labs",         icon: "🔬" },
  { href: "/packages",    label: "Packages",     icon: "📦" },
  { href: "/leads",       label: "Leads",        icon: "📈", badge: "leads", section: "B2B" },
  { href: "/enterprises", label: "Enterprises",  icon: "🏢" },
  { href: "/verify",      label: "Verify Reports",icon: "☑", badge: "verify", section: "OPS" },
  { href: "/finance",     label: "Finance",      icon: "💰" },
  { href: "/staff",       label: "Staff",        icon: "👤", section: "ADMIN" },
  { href: "/settings",    label: "Settings",     icon: "⚙️" },
];

interface Props {
  userEmail?: string;
  newBookings?: number;
  newLeads?: number;
  pendingVerify?: number;
  open?: boolean;
  onClose?: () => void;
}

function Inner({ userEmail = "", newBookings = 0, newLeads = 0, pendingVerify = 0, onClose }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() { await supabase.auth.signOut(); router.push("/login"); }
  function go(href: string) { router.push(href); onClose?.(); }

  let lastSection = "";

  return (
    <div className="sidebar" style={{ width: "220px", minWidth: "220px" }}>
      {/* Logo */}
      <div className="sb-head">
        <div className="sb-logo">C</div>
        <div className="sb-brand">
          <div className="sb-brand-name">Checkupify</div>
          <div className="sb-brand-sub">CRM Platform</div>
        </div>
        {onClose && (
          <button onClick={onClose} className="sb-signout" style={{ fontSize: 18 }} title="Close">✕</button>
        )}
      </div>

      {/* Nav */}
      <nav className="sb-nav">
        {NAV.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const showSection = item.section && item.section !== lastSection;
          if (item.section) lastSection = item.section;
          return (
            <div key={item.href}>
              {showSection && <div className="sb-sect">{item.section}</div>}
              <button onClick={() => go(item.href)} className={`sb-item${active ? " active" : ""}`}>
                <span className="sb-icon">{item.icon}</span>
                <span style={{ flex: 1, textAlign: "left" }}>{item.label}</span>
                {item.badge === "new" && newBookings > 0 && <span className="sb-badge">{newBookings}</span>}
                {item.badge === "leads" && newLeads > 0 && <span className="sb-badge warn">{newLeads}</span>}
                {item.badge === "verify" && pendingVerify > 0 && <span className="sb-badge warn">{pendingVerify}</span>}
              </button>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="sb-foot">
        <div className="sb-user">
          <div className="sb-avatar">{(userEmail?.[0] ?? "U").toUpperCase()}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="sb-uname" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{userEmail?.split("@")[0] ?? "User"}</div>
            <div className="sb-urole">Operations</div>
          </div>
          <button className="sb-signout" onClick={signOut} title="Sign out">↩</button>
        </div>
        <div className="sb-live">
          <span className="sb-live-dot" />
          <span className="sb-live-text">Live · Supabase</span>
        </div>
      </div>
    </div>
  );
}

export function Sidebar(props: Props) {
  return (
    <>
      {/* Desktop */}
      <div className="hidden md:flex" style={{ flexShrink: 0 }}>
        <Inner {...props} />
      </div>
      {/* Mobile */}
      {props.open && (
        <>
          <div className="mobile-overlay md:hidden" onClick={props.onClose} />
          <div className="fixed inset-y-0 left-0 z-50 md:hidden slide-left" style={{ zIndex: 50 }}>
            <Inner {...props} />
          </div>
        </>
      )}
    </>
  );
}
