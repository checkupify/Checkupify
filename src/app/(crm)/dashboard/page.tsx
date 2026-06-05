"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { TopBar } from "@/components/layout/TopBar";
import { StageBadge, SlaBadge } from "@/components/ui/Badge";
import { StatSkeleton, TableSkeleton } from "@/components/ui/Skeleton";
import { ToastContainer } from "@/components/ui/Toast";
import { fmt } from "@/lib/utils";
import type { Booking, Lead } from "@/types";

type Toast = { id: string; message: string; type: "success" | "error" | "info" | "warning" };

export default function Dashboard() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const prev = useRef(0);
  const addToast = useCallback((message: string, type: Toast["type"] = "info") => {
    setToasts(p => [...p, { id: Date.now().toString(), message, type }]);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [bRes, lRes] = await Promise.allSettled([
      supabase.from("bookings").select("*,lab:labs(name),package:packages(name)").order("created_at", { ascending: false }).limit(300),
      supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(100),
    ]);
    if (bRes.status === "fulfilled" && bRes.value.data) {
      const data = bRes.value.data as Booking[];
      const newQ = data.filter(b => b.stage === "New").length;
      if (prev.current > 0 && newQ > prev.current) addToast(`🔔 New booking arrived! Queue: ${newQ}`, "info");
      prev.current = newQ;
      setBookings(data);
    }
    if (lRes.status === "fulfilled" && lRes.value.data) setLeads(lRes.value.data as Lead[]);
    setLoading(false);
  }, [addToast]);

  useEffect(() => {
    fetchData();
    const ch = supabase.channel("dash-rt")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "bookings" }, (p) => {
        addToast(`📋 New booking: ${(p.new as Booking).patient_name}`, "success");
        fetchData();
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "bookings" }, fetchData)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [fetchData, addToast]);

  const today = new Date().toISOString().split("T")[0];
  const todayB = bookings.filter(b => b.appointment_date === today);
  const newQ = bookings.filter(b => b.stage === "New");
  const breaches = bookings.filter(b => b.sla_status === "Breach");
  const atRisk = bookings.filter(b => b.sla_status === "At Risk");
  const pending = bookings.filter(b => ["Pending Reports", "Partially Received", "Report Uploaded", "Partially Uploaded"].includes(b.stage));
  const done = bookings.filter(b => ["Received", "Completed", "Reports Received"].includes(b.stage));
  const revenue = done.reduce((s, b) => s + b.amount, 0);

  const stageData = [
    { s: "New", n: newQ.length, c: "#3B82F6" },
    { s: "Confirmed", n: bookings.filter(b => b.stage === "Confirmed").length, c: "#00CC8E" },
    { s: "Pending", n: pending.length, c: "#F59E0B" },
    { s: "Completed", n: done.length, c: "#059669" },
    { s: "Rejected", n: bookings.filter(b => b.stage === "Rejected").length, c: "#DC2626" },
  ];
  const maxN = Math.max(...stageData.map(x => x.n), 1);

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - 6 + i);
    const ds = d.toISOString().split("T")[0];
    return { day: d.toLocaleDateString("en-IN", { weekday: "short" }), n: bookings.filter(b => b.appointment_date === ds).length, isToday: ds === today };
  });
  const maxDay = Math.max(...last7.map(d => d.n), 1);

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
        {/* Alerts */}
        {!loading && (breaches.length > 0 || atRisk.length > 0) && (
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {breaches.length > 0 && (
              <div className="alert danger" style={{ flex: "1 1 300px" }}>
                <span className="alert-icon">⚡</span>
                <div style={{ flex: 1 }}>
                  <div className="alert-title">{breaches.length} SLA Breach{breaches.length > 1 ? "es" : ""} — {fmt(breaches.length * 400)} penalty</div>
                  <div className="alert-sub">IDs: {breaches.slice(0, 3).map(b => b.id.slice(-8)).join(", ")}</div>
                </div>
                <button className="btn sm danger" onClick={() => router.push("/bookings")}>Review →</button>
              </div>
            )}
            {atRisk.length > 0 && (
              <div className="alert warn" style={{ flex: "0 0 auto" }}>
                <span className="alert-icon">▲</span>
                <div>
                  <div className="alert-title">{atRisk.length} At Risk</div>
                  <div className="alert-sub">Confirm within 30 min</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* KPI Cards */}
        <div className="kpi-grid kpi-grid-6">
          {loading ? Array.from({ length: 6 }).map((_, i) => <StatSkeleton key={i} />) : (
            <>
              <div className="kpi">
                <div className="kpi-label">Today <span>📅</span></div>
                <div className="kpi-value teal">{todayB.length}</div>
                <div className="kpi-sub">{new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}</div>
              </div>
              <div className={`kpi${newQ.length > 3 ? " warn" : ""}`}>
                <div className="kpi-label">Confirm Queue <span>⏱</span></div>
                <div className={`kpi-value${newQ.length > 3 ? " red" : ""}`}>{newQ.length}</div>
                <div className="kpi-sub">Need action now</div>
                {newQ.length > 0 && (
                  <button className="btn sm primary" onClick={() => router.push("/bookings")} style={{ marginTop: 8, padding: "4px 10px", fontSize: 11 }}>
                    Confirm {newQ.length} →
                  </button>
                )}
              </div>
              <div className="kpi">
                <div className="kpi-label">Pending Reports <span>📋</span></div>
                <div className="kpi-value" style={{ color: "#7C3AED" }}>{pending.length}</div>
                <div className="kpi-sub">Awaiting upload</div>
              </div>
              <div className={`kpi${breaches.length > 0 ? " warn" : ""}`}>
                <div className="kpi-label">SLA Breaches <span>⚡</span></div>
                <div className={`kpi-value${breaches.length > 0 ? " red" : " teal"}`}>{breaches.length}</div>
                <div className="kpi-sub">{breaches.length > 0 ? fmt(breaches.length * 400) + " penalty" : "All on track"}</div>
              </div>
              <div className="kpi">
                <div className="kpi-label">Total Bookings <span>◫</span></div>
                <div className="kpi-value">{bookings.length}</div>
                <div className="kpi-sub">{done.length} completed</div>
              </div>
              <div className="kpi">
                <div className="kpi-label">MTD Revenue <span>💰</span></div>
                <div className="kpi-value teal">{"₹" + (revenue / 1000).toFixed(0) + "K"}</div>
                <div className="kpi-sub">{done.length > 0 ? fmt(Math.round(revenue / done.length)) + " avg" : "No data"}</div>
              </div>
            </>
          )}
        </div>

        {/* Main grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>
          {/* Live queue */}
          <div className="card">
            <div className="card-hdr">
              <div>
                <div className="card-hdr-title">Live Booking Queue</div>
                <div className="card-hdr-sub">{bookings.length} bookings · auto-refreshes</div>
              </div>
              <div className="live-badge">
                <span className="live-dot" />
                <span className="live-text">LIVE</span>
              </div>
            </div>
            {loading ? <TableSkeleton rows={8} /> : (
              <div className="tbl-wrap">
                <table>
                  <thead className="tbl-head">
                    <tr>
                      <th>ID</th>
                      <th>Patient</th>
                      <th>Package</th>
                      <th>Date</th>
                      <th>Stage</th>
                      <th>SLA</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.slice(0, 10).map(b => (
                      <tr key={b.id} onClick={() => router.push("/bookings")} style={{ cursor: "pointer", background: b.sla_status === "Breach" ? "#fff5f5" : b.stage === "New" ? "#f0fff8" : undefined }}>
                        <td className="td"><span className="td-id">{b.id.slice(-8)}</span></td>
                        <td className="td">
                          <div className="td-name">{b.patient_name}</div>
                          <div className="td-sub">{b.patient_phone}</div>
                        </td>
                        <td className="td"><span className="td-text truncate" style={{ maxWidth: 110, display: "block" }}>{(b as any).package?.name ?? "—"}</span></td>
                        <td className="td"><span className="td-text">{b.appointment_date}</span></td>
                        <td className="td"><StageBadge stage={b.stage} /></td>
                        <td className="td"><SlaBadge status={b.sla_status} /></td>
                        <td className="td"><span className="td-amount">{fmt(b.amount)}</span></td>
                      </tr>
                    ))}
                    {bookings.length === 0 && (
                      <tr><td colSpan={7}><div className="empty"><div className="empty-icon">📅</div><div className="empty-title">No bookings yet</div></div></td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
            <div style={{ padding: "10px 16px", borderTop: "1px solid var(--bord2)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, color: "var(--hint)" }}>Showing {Math.min(10, bookings.length)} of {bookings.length}</span>
              <button className="btn sm" onClick={() => router.push("/bookings")}>View all →</button>
            </div>
          </div>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* 7-day chart */}
            <div className="card">
              <div className="card-hdr"><div className="card-hdr-title">7-Day Bookings</div></div>
              <div style={{ padding: "16px 16px 8px" }}>
                <div className="chart-bar-wrap" style={{ height: 80 }}>
                  {last7.map((d, i) => (
                    <div key={i} className="chart-bar-col">
                      {d.n > 0 && <span className="chart-bar-val">{d.n}</span>}
                      <div className={`chart-bar${d.isToday ? " today" : " prev"}`} style={{ height: `${Math.max((d.n / maxDay) * 60, 3)}px` }} />
                      <span className="chart-bar-day">{d.day}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Stage breakdown */}
            <div className="card">
              <div className="card-hdr"><div className="card-hdr-title">Stage Breakdown</div></div>
              <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
                {stageData.map(({ s, n, c }) => (
                  <div key={s} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: c, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: "var(--muted)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, width: 88 }}>
                      <div className="progress-bar" style={{ flex: 1 }}>
                        <div className="progress-fill" style={{ width: `${(n / maxN) * 100}%`, background: c }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--slate)", width: 16, textAlign: "right" }}>{n}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Leads */}
            <div className="card" style={{ flex: 1 }}>
              <div className="card-hdr">
                <div className="card-hdr-title">Leads</div>
                <button className="btn sm" onClick={() => router.push("/leads")}>All →</button>
              </div>
              <div>
                {leads.slice(0, 5).map(l => {
                  const sc: Record<string, string> = { "New": "#3B82F6", "Won": "#00CC8E", "Lost": "#DC2626", "Negotiation": "#7C3AED", "Demo Scheduled": "#F59E0B", "Contacted": "#64748B" };
                  return (
                    <div key={l.id} onClick={() => router.push("/leads")}
                      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderBottom: "1px solid var(--bord2)", cursor: "pointer" }}
                      onMouseOver={e => (e.currentTarget as HTMLElement).style.background = "var(--s2)"}
                      onMouseOut={e => (e.currentTarget as HTMLElement).style.background = "none"}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.company_name}</div>
                        <div style={{ fontSize: 11, color: "var(--hint)" }}>{l.city ?? "—"}</div>
                      </div>
                      <span className="badge" style={{ background: (sc[l.status] ?? "#64748B") + "18", color: sc[l.status] ?? "#64748B", marginLeft: 8 }}>
                        {l.status}
                      </span>
                    </div>
                  );
                })}
                {leads.length === 0 && <div className="empty" style={{ padding: 32 }}><div className="empty-sub">No leads yet</div></div>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
