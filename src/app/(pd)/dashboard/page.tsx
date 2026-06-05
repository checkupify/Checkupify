"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { TopBar } from "@/components/layout/TopBar";
import { StageBadge, SlaBadge } from "@/components/ui/Badge";
import { StatSkeleton, TableSkeleton } from "@/components/ui/Skeleton";
import { ToastContainer } from "@/components/ui/Toast";
import { fmt } from "@/lib/utils";
import type { Booking } from "@/types";

type Toast = { id: string; message: string; type: "success" | "error" | "info" | "warning" };

export default function PDDashboard() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const addToast = (m: string, t: Toast["type"] = "info") => setToasts(p => [...p, { id: Date.now().toString(), message: m, type: t }]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("bookings")
      .select("*,lab:labs(name),package:packages(name)")
      .order("created_at", { ascending: false }).limit(200);
    if (data) setBookings(data as Booking[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
    const ch = supabase.channel("pd-dash-rt")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "bookings" }, (p) => {
        addToast(`🔔 New booking: ${(p.new as Booking).patient_name}`, "info");
        fetchData();
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [fetchData]);

  const today = new Date().toISOString().split("T")[0];
  const todayB = bookings.filter(b => b.appointment_date === today);
  const newQ = bookings.filter(b => b.stage === "New");
  const pending = bookings.filter(b => ["Confirmed", "In Progress"].includes(b.stage));
  const breaches = bookings.filter(b => b.sla_status === "Breach");
  const done = bookings.filter(b => ["Received", "Reports Received"].includes(b.stage));
  const gross = done.reduce((s, b) => s + b.amount, 0);
  const net = Math.round(gross * 0.89);

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
      <ToastContainer toasts={toasts} onRemove={id => setToasts(p => p.filter(t => t.id !== id))} />
      <TopBar title="Dashboard" loading={loading} onRefresh={fetchData}
        actions={
          <div className="live-badge">
            <span className="live-dot" />
            <span className="live-text">LIVE</span>
          </div>
        }
      />
      <div className="page-body">
        {/* SLA alert */}
        {!loading && breaches.length > 0 && (
          <div className="alert danger">
            <span className="alert-icon">⚡</span>
            <div style={{ flex: 1 }}>
              <div className="alert-title">{breaches.length} SLA Breach{breaches.length > 1 ? "es" : ""} — ₹{(breaches.length * 400).toLocaleString("en-IN")} penalty</div>
              <div className="alert-sub">Go to Confirmation Pending to resolve</div>
            </div>
            <button className="btn sm danger" onClick={() => router.push("/queue")}>Fix Now →</button>
          </div>
        )}

        {/* KPIs */}
        <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>
          {loading ? Array.from({ length: 5 }).map((_, i) => <StatSkeleton key={i} />) : (
            <>
              <div className="kpi">
                <div className="kpi-label">Today <span>📅</span></div>
                <div className="kpi-value teal">{todayB.length}</div>
                <div className="kpi-sub">{new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</div>
              </div>
              <div className={`kpi${newQ.length > 0 ? " warn" : ""}`}>
                <div className="kpi-label">Confirm Queue <span>⏱</span></div>
                <div className={`kpi-value${newQ.length > 0 ? " red" : ""}`}>{newQ.length}</div>
                <div className="kpi-sub">Need action</div>
                {newQ.length > 0 && (
                  <button className="btn sm primary" onClick={() => router.push("/queue")} style={{ marginTop: 8, fontSize: 11, padding: "4px 10px" }}>
                    Confirm →
                  </button>
                )}
              </div>
              <div className="kpi">
                <div className="kpi-label">Awaiting Reports <span>📋</span></div>
                <div className="kpi-value" style={{ color: "#7C3AED" }}>{pending.length}</div>
                <div className="kpi-sub">Upload pending</div>
              </div>
              <div className={`kpi${breaches.length > 0 ? " warn" : ""}`}>
                <div className="kpi-label">SLA Breaches <span>⚡</span></div>
                <div className={`kpi-value${breaches.length > 0 ? " red" : " teal"}`}>{breaches.length}</div>
                <div className="kpi-sub">{breaches.length > 0 ? "Action needed" : "All clear"}</div>
              </div>
              <div className="kpi">
                <div className="kpi-label">Net Payout <span>💰</span></div>
                <div className="kpi-value teal">{"₹" + (net / 1000).toFixed(0) + "K"}</div>
                <div className="kpi-sub">{done.length} completed</div>
              </div>
            </>
          )}
        </div>

        {/* Content */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20 }}>
          {/* Today's bookings */}
          <div className="card">
            <div className="card-hdr">
              <div>
                <div className="card-hdr-title">Today's Appointments</div>
                <div className="card-hdr-sub">{todayB.length > 0 ? `${todayB.length} scheduled` : "No appointments today"}</div>
              </div>
              <button className="btn sm" onClick={() => router.push("/bookings")}>All →</button>
            </div>
            {loading ? <TableSkeleton rows={5} /> : (
              <div className="tbl-wrap">
                <table>
                  <thead className="tbl-head">
                    <tr>
                      <th>ID</th>
                      <th>Patient</th>
                      <th>Package</th>
                      <th>Slot</th>
                      <th>Stage</th>
                      <th>SLA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(todayB.length > 0 ? todayB : bookings.slice(0, 6)).map(b => (
                      <tr key={b.id}>
                        <td className="td"><span className="td-id">{b.id.slice(-8)}</span></td>
                        <td className="td"><div className="td-name">{b.patient_name}</div></td>
                        <td className="td"><span className="td-text">{(b as any).package?.name ?? "—"}</span></td>
                        <td className="td"><span className="td-text">{b.slot_time?.slice(0, 5) ?? "—"}</span></td>
                        <td className="td"><StageBadge stage={b.stage} /></td>
                        <td className="td"><SlaBadge status={b.sla_status} /></td>
                      </tr>
                    ))}
                    {bookings.length === 0 && (
                      <tr><td colSpan={6}><div className="empty"><div className="empty-icon">📅</div><div className="empty-title">No bookings</div></div></td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right panel */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Quick actions */}
            <div className="card">
              <div className="card-hdr"><div className="card-hdr-title">Quick Actions</div></div>
              <div style={{ padding: "12px" }}>
                {[
                  { l: "Confirm Queue", sub: `${newQ.length} pending`, href: "/queue", urgent: newQ.length > 0 },
                  { l: "Upload Reports", sub: `${pending.length} ready`, href: "/upload", urgent: false },
                  { l: "All Appointments", sub: `${bookings.length} total`, href: "/bookings", urgent: false },
                ].map(a => (
                  <button key={a.href} onClick={() => router.push(a.href)}
                    style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 12px", borderRadius: "var(--r10)", border: a.urgent ? "1px solid rgba(0,204,142,.3)" : "1px solid var(--border)", background: a.urgent ? "var(--teal-l)" : "none", marginBottom: 6, cursor: "pointer", fontFamily: "inherit", transition: "all .12s" }}
                    onMouseOver={e => { if (!a.urgent) (e.currentTarget as HTMLElement).style.background = "var(--s2)"; }}
                    onMouseOut={e => { if (!a.urgent) (e.currentTarget as HTMLElement).style.background = "none"; }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: a.urgent ? "var(--teal-d)" : "var(--ink)", textAlign: "left" }}>{a.l}</div>
                      <div style={{ fontSize: 11, color: "var(--hint)" }}>{a.sub}</div>
                    </div>
                    <span style={{ color: "var(--hint)" }}>→</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Revenue card */}
            <div className="card" style={{ background: "var(--navy-grad)" }}>
              <div style={{ padding: "18px 20px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", color: "rgba(255,255,255,.4)", marginBottom: 10 }}>Net Earnings</div>
                <div style={{ fontSize: 34, fontWeight: 900, color: "white", marginBottom: 4 }}>₹{(net / 1000).toFixed(0)}K</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,.5)", marginBottom: 16 }}>After 11% platform fee</div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                  <div>
                    <div style={{ color: "rgba(255,255,255,.4)" }}>Gross</div>
                    <div style={{ color: "white", fontWeight: 600, marginTop: 2 }}>{fmt(gross)}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: "rgba(255,255,255,.4)" }}>Fee</div>
                    <div style={{ color: "#FCD34D", fontWeight: 600, marginTop: 2 }}>−{fmt(gross - net)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
