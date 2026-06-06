"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────
interface Booking {
  id: string; patient_name: string; patient_phone: string; patient_gender: string;
  patient_age: number; appointment_date: string; slot_time: string;
  stage: string; sla_status: string; amount: number; collection_type: string;
  confirmed_at: string | null; report_url: string | null; rejection_reason: string | null;
  created_at: string; notes: string | null;
  lab?: { name: string } | null;
  package?: { name: string; test_count?: number } | null;
}
interface TestResult {
  id: string; test_name: string; category: string;
  lab_status: "pending" | "skipped" | "not_done";
  lab_notes: string | null;
  vr_status: "pending" | "received" | "issue";
}

type Page = "dashboard" | "queue" | "reports" | "appointments" | "tat" | "quality" | "invoices" | "recon" | "contracts" | "settings";

// ─── Helpers ──────────────────────────────────────────
const fmt = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");

function slaCountdown(createdAt: string) {
  const ms = new Date(createdAt).getTime() + 7200000 - Date.now();
  if (ms <= 0) return { text: "BREACHED", color: "var(--red)", pct: 100 };
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const pct = Math.round(((7200000 - ms) / 7200000) * 100);
  const color = ms < 1800000 ? "var(--amber)" : "var(--green)";
  return { text: `${Math.floor(m / 60)}h ${m % 60}m ${s}s`, color, pct };
}

function stageBadge(stage: string) {
  const m: Record<string, string> = {
    "New": "bb", "Confirmed": "bg", "Completed": "bg",
    "Report Uploaded": "bg", "Partially Uploaded": "ba",
    "Under Verification": "bn", "Reports Received": "bg",
    "Pending Reports": "ba", "Partially Received": "bp",
    "Received": "bg", "Rejected": "br", "No Show": "bgr",
  };
  return <span className={`badge ${m[stage] ?? "bgr"}`}>{stage}</span>;
}

function slaBadge(status: string) {
  const m: Record<string, string> = { "On Track": "bg", "At Risk": "ba", "Breach": "br" };
  return <span className={`badge ${m[status] ?? "bgr"}`}>{status}</span>;
}

function Toast({ msg, type, onDone }: { msg: string; type: string; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 3800); return () => clearTimeout(t); }, [onDone]);
  return (
    <div className={`toast ${type}`}>
      <span style={{ fontSize: 15 }}>{type === "s" ? "✓" : type === "e" ? "✕" : type === "w" ? "⚠" : "ℹ"}</span>
      <span style={{ flex: 1 }}>{msg}</span>
    </div>
  );
}

// ─── SLA Countdown Timer component ───────────────────
function SLATimer({ createdAt }: { createdAt: string }) {
  const [tick, setTick] = useState(0);
  useEffect(() => { const t = setInterval(() => setTick(p => p + 1), 1000); return () => clearInterval(t); }, []);
  const { text, color, pct } = slaCountdown(createdAt);
  return (
    <div style={{ minWidth: 120 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color }}>{text}</div>
      <div className="pbar" style={{ marginTop: 4 }}>
        <div className={`pfill ${pct >= 100 ? "pf-r" : pct > 70 ? "pf-a" : "pf-g"}`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
    </div>
  );
}

// ─── Upload Panel ─────────────────────────────────────
function UploadPanel({
  open, booking, tests, onClose, onSubmit, saving,
  onTestStatus, reportUrl, setReportUrl, reportType, setReportType, uploadNotes, setUploadNotes
}: {
  open: boolean; booking: Booking | null; tests: TestResult[];
  onClose: () => void; onSubmit: () => void; saving: boolean;
  onTestStatus: (i: number, s: "pending" | "skipped" | "not_done") => void;
  reportUrl: string; setReportUrl: (v: string) => void;
  reportType: "partial" | "final"; setReportType: (v: "partial" | "final") => void;
  uploadNotes: string; setUploadNotes: (v: string) => void;
}) {
  const done = tests.filter(t => t.lab_status === "pending").length;
  const skipped = tests.filter(t => t.lab_status === "skipped").length;
  const notDone = tests.filter(t => t.lab_status === "not_done").length;

  return (
    <>
      <div id="panel-ov" style={{ display: open ? "block" : "none", position: "fixed", inset: 0, background: "rgba(0,0,0,.3)", zIndex: 899 }} onClick={onClose} />
      <div className={`upload-panel${open ? " open" : ""}`}>
        <div className="panel-head">
          <div>
            <div style={{ fontSize: 15, fontWeight: 800 }}>Upload Report</div>
            <div style={{ fontSize: 12, color: "var(--hint)", marginTop: 3 }}>{booking?.id ?? "Select appointment"}</div>
          </div>
          <button className="mclose" onClick={onClose}>✕</button>
        </div>
        <div className="panel-body">
          {!booking ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "var(--hint)" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📋</div>
              <div>Open upload from appointment row</div>
            </div>
          ) : (
            <>
              {/* Appointment info */}
              <div style={{ background: "var(--s2)", borderRadius: "var(--r8)", padding: "12px 14px", marginBottom: 16, border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 12, color: "var(--hint)", marginBottom: 4 }}>Apt ID</div>
                <div style={{ fontWeight: 700, fontFamily: "monospace", marginBottom: 8 }}>{booking.id}</div>
                <div className="frow f2" style={{ gap: 8 }}>
                  <div><div style={{ fontSize: 11, color: "var(--hint)" }}>Patient</div><div style={{ fontWeight: 600, fontSize: 13 }}>{booking.patient_name}</div></div>
                  <div><div style={{ fontSize: 11, color: "var(--hint)" }}>Package</div><div style={{ fontWeight: 600, fontSize: 13 }}>{(booking as any).package?.name ?? "—"}</div></div>
                </div>
              </div>

              {/* Test-wise status */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 10 }}>
                  Test-wise Status
                </div>
                <div style={{ display: "flex", gap: 8, marginBottom: 10, fontSize: 11, color: "var(--muted)" }}>
                  <span className="badge bg">{done} Done</span>
                  {skipped > 0 && <span className="badge ba">{skipped} Skipped</span>}
                  {notDone > 0 && <span className="badge br">{notDone} Not Done</span>}
                </div>
                {tests.map((test, idx) => (
                  <div key={idx} className="test-row"
                    style={{
                      background: test.lab_status === "pending" ? "#fff" : test.lab_status === "skipped" ? "var(--amberbg)" : "var(--redbg)",
                      borderColor: test.lab_status === "pending" ? "var(--border)" : test.lab_status === "skipped" ? "var(--amberbord)" : "var(--redbord)"
                    }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{test.test_name}</div>
                      <div style={{ fontSize: 11, color: "var(--hint)", marginTop: 2, textTransform: "capitalize" }}>{test.category}</div>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <button
                        onClick={() => onTestStatus(idx, "pending")}
                        className={`abt${test.lab_status === "pending" ? " c" : ""}`}>
                        ✓ Done
                      </button>
                      <button
                        onClick={() => onTestStatus(idx, "skipped")}
                        className={`abt${test.lab_status === "skipped" ? " a" : ""}`}>
                        Skip
                      </button>
                      <button
                        onClick={() => onTestStatus(idx, "not_done")}
                        className={`abt${test.lab_status === "not_done" ? " r" : ""}`}>
                        Not Done
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Report type */}
              <div className="fgrp">
                <label>Report Type</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {(["partial", "final"] as const).map(t => (
                    <button key={t} onClick={() => setReportType(t)}
                      style={{ flex: 1, padding: "8px", borderRadius: "var(--r8)", border: `1.5px solid ${reportType === t ? "var(--teal)" : "var(--border)"}`, background: reportType === t ? "var(--teal-l)" : "#fff", color: reportType === t ? "var(--teal-d)" : "var(--muted)", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", textTransform: "capitalize" }}>
                      {t === "partial" ? "📋 Partial" : "✅ Final"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Report URL */}
              <div className="fgrp">
                <label>Report PDF URL {reportType === "final" && <span className="req">*</span>}</label>
                <input value={reportUrl} onChange={e => setReportUrl(e.target.value)} placeholder="https://storage.checkupify.com/reports/..." />
              </div>

              {/* Notes */}
              <div className="fgrp">
                <label>Internal Notes</label>
                <textarea value={uploadNotes} onChange={e => setUploadNotes(e.target.value)} placeholder="Notes for verification team…" rows={2} style={{ resize: "vertical" }} />
              </div>

              {/* Summary */}
              <div style={{ background: "var(--s2)", borderRadius: "var(--r8)", padding: "12px 14px", border: "1px solid var(--border)", fontSize: 13 }}>
                <div className="iline"><span className="lbl">Completed tests</span><span style={{ color: "var(--green)", fontWeight: 700 }}>{done}</span></div>
                {skipped > 0 && <div className="iline"><span className="lbl">Skipped by patient</span><span style={{ color: "var(--amber)", fontWeight: 700 }}>{skipped}</span></div>}
                {notDone > 0 && <div className="iline"><span className="lbl">Not done by lab</span><span style={{ color: "var(--red)", fontWeight: 700 }}>{notDone}</span></div>}
                <div className="iline"><span>Booking stage after submit</span><span style={{ fontWeight: 700 }}>{skipped === 0 && notDone === 0 ? "Report Uploaded" : "Partially Uploaded"}</span></div>
              </div>
            </>
          )}
        </div>
        <div className="panel-foot">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={onSubmit} disabled={saving || !booking || (reportType === "final" && !reportUrl.trim())}>
            {saving ? "Submitting…" : "Submit Report"}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Confirm Modal ────────────────────────────────────
function ConfirmModal({ booking, onClose, onConfirm, saving }: {
  booking: Booking | null; onClose: () => void; onConfirm: () => void; saving: boolean;
}) {
  if (!booking) return null;
  return (
    <div className="ov open">
      <div className="modal modal-sm">
        <div className="mhead">
          <span className="mtitle">Confirm Appointment</span>
          <button className="mclose" onClick={onClose}>✕</button>
        </div>
        <div className="mbody">
          <div className="alert alert-g" style={{ marginBottom: 14 }}>
            <span>✓</span>
            <span>Confirming this slot will notify the patient via WhatsApp.</span>
          </div>
          {[["Patient", booking.patient_name], ["Package", (booking as any).package?.name ?? "—"], ["Date", booking.appointment_date], ["Slot", booking.slot_time?.slice(0, 5) ?? "—"], ["Amount", fmt(booking.amount)], ["Type", booking.collection_type]].map(([k, v]) => (
            <div key={k as string} className="iline">
              <span className="lbl">{k as string}</span>
              <span style={{ fontWeight: 600 }}>{v as string}</span>
            </div>
          ))}
        </div>
        <div className="mfoot">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={onConfirm} disabled={saving}>
            {saving ? "Confirming…" : "✓ Confirm Slot"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Reject Modal ─────────────────────────────────────
function RejectModal({ booking, onClose, onReject, saving }: {
  booking: Booking | null; onClose: () => void; onReject: (reason: string) => void; saving: boolean;
}) {
  const [reason, setReason] = useState("");
  const REASONS = ["Slot already booked", "Lab unavailable", "Test not available", "Patient cancelled request", "Capacity full", "Other"];
  if (!booking) return null;
  return (
    <div className="ov open">
      <div className="modal modal-sm">
        <div className="mhead">
          <span className="mtitle">Reject Appointment</span>
          <button className="mclose" onClick={onClose}>✕</button>
        </div>
        <div className="mbody">
          <div style={{ marginBottom: 12, fontSize: 13, color: "var(--muted)" }}>Select a reason for rejecting <strong>{booking.patient_name}</strong>:</div>
          {REASONS.map(r => (
            <button key={r} onClick={() => setReason(r)}
              style={{ display: "block", width: "100%", textAlign: "left", padding: "10px 12px", borderRadius: "var(--r8)", border: `1.5px solid ${reason === r ? "var(--red)" : "var(--border)"}`, background: reason === r ? "var(--redbg)" : "#fff", color: reason === r ? "var(--red)" : "var(--slate)", fontWeight: reason === r ? 700 : 500, fontSize: 13, cursor: "pointer", fontFamily: "inherit", marginBottom: 6 }}>
              {r}
            </button>
          ))}
        </div>
        <div className="mfoot">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn danger" onClick={() => reason && onReject(reason)} disabled={!reason || saving}>
            {saving ? "Rejecting…" : "Reject"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────
export default function PD() {
  const router = useRouter();
  const [page, setPage] = useState<Page>("dashboard");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState("");
  const [toasts, setToasts] = useState<Array<{ id: string; msg: string; type: string }>>([]);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadBooking, setUploadBooking] = useState<Booking | null>(null);
  const [uploadTests, setUploadTests] = useState<TestResult[]>([]);
  const [reportUrl, setReportUrl] = useState("");
  const [reportType, setReportType] = useState<"partial" | "final">("final");
  const [uploadNotes, setUploadNotes] = useState("");
  const [confirmB, setConfirmB] = useState<Booking | null>(null);
  const [rejectB, setRejectB] = useState<Booking | null>(null);
  const [aptTab, setAptTab] = useState("all");
  const [prTab, setPrTab] = useState("all");
  const [search, setSearch] = useState("");
  const [setTab, setSetTab] = useState("general");

  const addToast = useCallback((msg: string, type = "i") => {
    setToasts(p => [...p, { id: Date.now().toString(), msg, type }]);
  }, []);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("bookings")
      .select("*,lab:labs(name),package:packages(name,test_count)")
      .order("created_at", { ascending: false }).limit(500);
    if (data) setBookings(data as Booking[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.replace("/login"); return; }
      setEmail(session.user.email ?? "");
      fetchBookings();
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((e, s) => {
      if (e === "SIGNED_OUT" || !s) router.replace("/login");
      else if (e === "SIGNED_IN") fetchBookings();
    });
    const ch = supabase.channel("pd-rt")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "bookings" }, (p) => {
        addToast(`🔔 New booking: ${(p.new as Booking).patient_name} — Confirm within 2hrs`, "i");
        fetchBookings();
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "bookings" }, fetchBookings)
      .subscribe();
    return () => { subscription.unsubscribe(); supabase.removeChannel(ch); };
  }, [router, fetchBookings, addToast]);

  async function signOut() { await supabase.auth.signOut(); router.replace("/login"); }

  // Derived data
  const today = new Date().toISOString().split("T")[0];
  const queue = bookings.filter(b => b.stage === "New").sort((a, b) => a.created_at.localeCompare(b.created_at));
  const pendingReports = bookings.filter(b => ["Confirmed", "In Progress"].includes(b.stage));
  const done = bookings.filter(b => ["Received", "Reports Received", "Completed"].includes(b.stage));
  const gross = done.reduce((s, b) => s + b.amount, 0);
  const fee = Math.round(gross * 0.11);
  const net = gross - fee;
  const breaches = bookings.filter(b => b.sla_status === "Breach").length;
  const compliance = bookings.length > 0 ? Math.round(((bookings.length - breaches) / bookings.length) * 100) : 100;
  const confirmed = bookings.filter(b => b.stage === "Confirmed").length;
  const rejected = bookings.filter(b => b.stage === "Rejected").length;
  const noShow = bookings.filter(b => b.stage === "No Show").length;
  const todayB = bookings.filter(b => b.appointment_date === today);
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowB = bookings.filter(b => b.appointment_date === tomorrow.toISOString().split("T")[0]);

  // Charts
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - 6 + i);
    const ds = d.toISOString().split("T")[0];
    const rev = bookings.filter(b => b.appointment_date === ds && ["Received", "Reports Received"].includes(b.stage)).reduce((s, b) => s + b.amount, 0);
    return { day: d.toLocaleDateString("en-IN", { weekday: "short" }), rev, isToday: ds === today };
  });
  const maxRev = Math.max(...last7.map(d => d.rev), 1);

  // Open upload panel
  async function openUpload(b: Booking) {
    setUploadBooking(b);
    setUploadOpen(true);
    setReportUrl("");
    setUploadNotes("");
    setReportType("final");

    // Load tests
    const { data: existing } = await supabase.from("test_results").select("*").eq("booking_id", b.id);
    if (existing && existing.length > 0) {
      setUploadTests(existing as TestResult[]);
      return;
    }
    const pkgId = (b as any).package?.id;
    if (pkgId) {
      const { data: pkgTests } = await supabase.from("package_tests").select("test_id,tests!inner(id,name,category)").eq("package_id", pkgId);
      if (pkgTests && pkgTests.length > 0) {
        setUploadTests(pkgTests.map((pt: any) => ({ id: pt.tests.id, test_id: pt.tests.id, test_name: pt.tests.name, category: pt.tests.category || "general", lab_status: "pending", lab_notes: null, vr_status: "pending" })));
        return;
      }
    }
    // Fallback default tests
    const DEFAULTS = ["Complete Blood Count (CBC)", "Lipid Profile", "Thyroid Panel (TSH/T3/T4)", "HbA1c", "Liver Function Test", "Kidney Function Test", "Vitamin D3", "Urine Routine"];
    const testCount = (b as any).package?.test_count || 5;
    setUploadTests(DEFAULTS.slice(0, testCount).map((name, i) => ({ id: String(i), test_id: "", test_name: name, category: "general", lab_status: "pending", lab_notes: null, vr_status: "pending" })));
  }

  function setTestStatus(idx: number, status: "pending" | "skipped" | "not_done") {
    setUploadTests(p => p.map((t, i) => i === idx ? { ...t, lab_status: status } : t));
  }

  async function submitUpload() {
    if (!uploadBooking) return;
    setSaving(true);
    try {
      const now = new Date().toISOString();
      await supabase.from("test_results").upsert(
        uploadTests.map(t => ({ booking_id: uploadBooking.id, test_id: t.test_id || null, test_name: t.test_name, lab_status: t.lab_status, lab_notes: t.lab_notes || null, lab_marked_at: now, updated_at: now })),
        { onConflict: "booking_id,test_name" }
      );
      const sk = uploadTests.filter(t => t.lab_status === "skipped").length;
      const nd = uploadTests.filter(t => t.lab_status === "not_done").length;
      const newStage = sk === 0 && nd === 0 ? "Report Uploaded" : "Partially Uploaded";
      await supabase.from("bookings").update({ stage: newStage, report_url: reportUrl || null, notes: uploadNotes || null, updated_at: now }).eq("id", uploadBooking.id);
      const d = uploadTests.filter(t => t.lab_status === "pending").length;
      addToast(`Report uploaded! ${d} done, ${sk} skipped, ${nd} not done.`, "s");
      if (sk > 0 || nd > 0) setTimeout(() => addToast("Appointment moved to Partially Uploaded. Awaiting VR verification.", "i"), 1500);
      setUploadOpen(false); setUploadBooking(null);
      fetchBookings();
    } catch (e: any) { addToast(e.message, "e"); }
    setSaving(false);
  }

  async function doConfirm() {
    if (!confirmB) return;
    setSaving(true);
    await supabase.from("bookings").update({ stage: "Confirmed", confirmed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", confirmB.id);
    addToast(`✓ Confirmed: ${confirmB.patient_name}`, "s");
    setConfirmB(null); setSaving(false); fetchBookings();
  }

  async function doReject(reason: string) {
    if (!rejectB) return;
    setSaving(true);
    await supabase.from("bookings").update({ stage: "Rejected", rejection_reason: reason, updated_at: new Date().toISOString() }).eq("id", rejectB.id);
    addToast("Appointment rejected", "i");
    setRejectB(null); setSaving(false); fetchBookings();
  }

  const aptFiltered = bookings.filter(b => {
    if (aptTab === "all") return true;
    if (aptTab === "today") return b.appointment_date === today;
    if (aptTab === "tomorrow") return b.appointment_date === tomorrow.toISOString().split("T")[0];
    return b.stage === aptTab;
  }).filter(b => !search || b.patient_name.toLowerCase().includes(search.toLowerCase()) || b.id.toLowerCase().includes(search.toLowerCase()));

  const prFiltered = pendingReports.filter(b => {
    if (prTab === "all") return true;
    // For demo, split by appointment date proximity
    const daysUntil = Math.ceil((new Date(b.appointment_date).getTime() - Date.now()) / 86400000);
    if (prTab === "overdue") return daysUntil < -1;
    if (prTab === "today") return daysUntil >= -1 && daysUntil <= 0;
    if (prTab === "upcoming") return daysUntil > 0;
    return true;
  });

  const PAGE_LABELS: Record<Page, string> = {
    dashboard: "Dashboard", queue: "Confirmation Pending", reports: "Pending Reports",
    appointments: "All Appointments", tat: "TAT Analytics", quality: "Quality Score",
    invoices: "Invoices & Payouts", recon: "Reconciliation", contracts: "Contract & Packages", settings: "Settings",
  };

  return (
    <>
      {/* Toast container */}
      <div id="toasts">
        {toasts.map(t => <Toast key={t.id} msg={t.msg} type={t.type} onDone={() => setToasts(p => p.filter(x => x.id !== t.id))} />)}
      </div>

      {/* Upload panel */}
      <UploadPanel open={uploadOpen} booking={uploadBooking} tests={uploadTests}
        onClose={() => setUploadOpen(false)} onSubmit={submitUpload} saving={saving}
        onTestStatus={setTestStatus} reportUrl={reportUrl} setReportUrl={setReportUrl}
        reportType={reportType} setReportType={setReportType}
        uploadNotes={uploadNotes} setUploadNotes={setUploadNotes} />

      {/* Confirm/Reject modals */}
      {confirmB && <ConfirmModal booking={confirmB} onClose={() => setConfirmB(null)} onConfirm={doConfirm} saving={saving} />}
      {rejectB && <RejectModal booking={rejectB} onClose={() => setRejectB(null)} onReject={doReject} saving={saving} />}

      <div id="app">
        {/* ════ SIDEBAR ════ */}
        <aside id="sb">
          <div className="sb-top">
            <div className="sb-logo">
              <div className="sb-ic">CK</div>
              <div>
                <div className="sb-brand-name">Checkupify</div>
                <div className="sb-brand-sub">Provider Portal v2.0</div>
              </div>
            </div>
            <div className="lab-box">
              <div className="lab-logo">🏥</div>
              <div>
                <div className="lab-name">{email?.split("@")[0] ?? "Lab Partner"}</div>
                <div className="lab-city">Hyderabad</div>
                <div className="lab-nabl">✓ NABL Certified</div>
              </div>
            </div>
          </div>
          <nav className="sb-nav">
            <div className="sb-sect">Quick Actions</div>
            {[
              { p: "dashboard" as Page, label: "Dashboard", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> },
              { p: "queue" as Page, label: "Confirmation Pending", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>, badge: queue.length > 0 ? String(queue.length) : "", badgeCls: "" },
              { p: "reports" as Page, label: "Pending Reports", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>, badge: pendingReports.length > 0 ? String(pendingReports.length) : "", badgeCls: "a" },
              { p: "appointments" as Page, label: "All Appointments", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg> },
            ].map(item => (
              <button key={item.p} onClick={() => setPage(item.p)} className={`sb-item${page === item.p ? " active" : ""}`}>
                {item.icon}
                {item.label}
                {item.badge && <span className={`sb-badge${item.badgeCls ? " " + item.badgeCls : ""}`}>{item.badge}</span>}
              </button>
            ))}
            <div className="sb-divider" />
            <div className="sb-sect">Analytics</div>
            {[
              { p: "tat" as Page, label: "TAT Analytics", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
              { p: "quality" as Page, label: "Quality Score", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg> },
            ].map(item => (
              <button key={item.p} onClick={() => setPage(item.p)} className={`sb-item${page === item.p ? " active" : ""}`}>
                {item.icon}{item.label}
              </button>
            ))}
            <div className="sb-divider" />
            <div className="sb-sect">Finance</div>
            {[
              { p: "invoices" as Page, label: "Invoices & Payouts", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg> },
              { p: "recon" as Page, label: "Reconciliation", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
            ].map(item => (
              <button key={item.p} onClick={() => setPage(item.p)} className={`sb-item${page === item.p ? " active" : ""}`}>
                {item.icon}{item.label}
              </button>
            ))}
            <div className="sb-divider" />
            <div className="sb-sect">Account</div>
            {[
              { p: "contracts" as Page, label: "Contract & Packages", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg> },
              { p: "settings" as Page, label: "Settings", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg> },
            ].map(item => (
              <button key={item.p} onClick={() => setPage(item.p)} className={`sb-item${page === item.p ? " active" : ""}`}>
                {item.icon}{item.label}
              </button>
            ))}
          </nav>
          <div className="rm-box">
            <div className="rm-label">Your Relationship Manager</div>
            <div className="rm-name">Meera Subramaniam</div>
            <button className="rm-contact" onClick={() => addToast("Calling Meera: +91-98001 23456", "i")}>📞 +91-98001 23456</button>
            <button className="rm-contact" onClick={() => addToast("WhatsApp opened", "s")}>💬 Chat on WhatsApp</button>
          </div>
        </aside>

        {/* ════ MAIN ════ */}
        <div id="main">
          {/* Topbar */}
          <div id="topbar">
            <div className="breadcrumb">Home / <span>{PAGE_LABELS[page]}</span></div>
            <div className="tb-right">
              {loading && <span style={{ fontSize: 12, color: "var(--hint)", display: "flex", alignItems: "center", gap: 6 }}><span className="spin" style={{ width: 14, height: 14, border: "1.5px solid var(--border)", borderTopColor: "var(--teal)", borderRadius: "50%", display: "inline-block" }} />Syncing</span>}
              <button className="btn sm" onClick={() => setPage("queue")}>
                Confirm Pending {queue.length > 0 && <span style={{ background: "#EF4444", color: "#fff", borderRadius: 9, padding: "1px 6px", fontSize: 10, marginLeft: 3 }}>{queue.length}</span>}
              </button>
              <button className="btn sm primary" onClick={() => { setUploadBooking(null); setUploadTests([]); setUploadOpen(true); }}>Upload Report</button>
              <div className="icon-btn" onClick={() => addToast("2 new alerts", "i")}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                <div className="notif-dot" />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 12px", border: "1px solid var(--border)", borderRadius: "var(--r8)", background: "#fff", cursor: "pointer" }} onClick={signOut}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--teal)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff" }}>
                  {(email?.[0] ?? "L").toUpperCase()}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--slate)" }}>{email?.split("@")[0] ?? "Lab"}</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div id="content">

            {/* ═══ DASHBOARD ═══ */}
            {page === "dashboard" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16, animation: "fadein .15s" }}>
                {/* SLA Strip */}
                <div className="sla-strip">
                  {[
                    { label: "Confirmation TAT", target: "Target: <2 hours", val: "1h 38m", sub: "✓ Within SLA — " + compliance + "% compliance", color: compliance >= 90 ? "var(--green)" : "var(--amber)", fill: Math.min(compliance, 100), fillColor: compliance >= 90 ? "#10B981" : "#F59E0B", topColor: compliance >= 90 ? "#10B981" : "#F59E0B" },
                    { label: "First Report TAT", target: "Target: <6 hours", val: "5h 42m", sub: "⚠ Near SLA — 81% compliance", color: "var(--amber)", fill: 81, fillColor: "#F59E0B", topColor: "#F59E0B" },
                    { label: "Full Report TAT", target: "Target: <36 hours", val: "28h 12m", sub: "✓ Within SLA — 97% compliance", color: "var(--green)", fill: 78, fillColor: "#10B981", topColor: "#10B981" },
                  ].map(s => (
                    <div key={s.label} className="sla-card">
                      <div className="mcard-top" style={{ background: s.topColor }} />
                      <div className="sla-label">{s.label}</div>
                      <div className="sla-target">{s.target}</div>
                      <div className="sla-val" style={{ color: s.color }}>{s.val} <span style={{ fontSize: 13 }}>avg</span></div>
                      <div className="sla-bar"><div className="sla-fill" style={{ width: s.fill + "%", background: s.fillColor }} /></div>
                      <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 5 }}>{s.sub}</div>
                    </div>
                  ))}
                </div>

                {/* 6 Metric cards */}
                <div className="metrics m6">
                  {[
                    { label: "Today", val: String(todayB.length), sub: "Appointments", color: "var(--teal)", topColor: "var(--teal)", onClick: () => setPage("appointments") },
                    { label: "Tomorrow", val: String(tomorrowB.length), sub: "", color: "var(--ink)", topColor: "#6366F1", onClick: () => setPage("appointments") },
                    { label: "Total MTD", val: String(bookings.length), sub: "This month", color: "var(--ink)", topColor: "#0EA5E9", onClick: () => setPage("appointments") },
                    { label: "Needs Action", val: String(queue.length), sub: "Confirm within SLA", color: queue.length > 0 ? "var(--red)" : "var(--ink)", topColor: "#EF4444", onClick: () => setPage("queue") },
                    { label: "Reports Due", val: String(pendingReports.length), sub: "Upload pending", color: pendingReports.length > 0 ? "var(--amber)" : "var(--ink)", topColor: "#F59E0B", onClick: () => setPage("reports") },
                    { label: "QC Failed", val: "0", sub: "Needs re-upload", color: "var(--ink)", topColor: "#EF4444" },
                  ].map(m => (
                    <div key={m.label} className="mcard" onClick={m.onClick} style={{ cursor: m.onClick ? "pointer" : "default" }}>
                      <div className="mcard-top" style={{ background: m.topColor }} />
                      <div className="mlabel">{m.label}</div>
                      <div className="mval" style={{ color: m.color }}>{m.val}</div>
                      {m.sub && <div className="msub">{m.sub}</div>}
                    </div>
                  ))}
                </div>

                {/* Main 2-col layout */}
                <div className="g2-1">
                  <div className="fcol">
                    {/* Reports to upload */}
                    <div className="card">
                      <div className="card-head">
                        <span className="card-title">Reports to Upload (Pending)</span>
                        <button className="btn sm primary" onClick={() => { setUploadBooking(null); setUploadTests([]); setUploadOpen(true); }}>+ Upload Report</button>
                      </div>
                      <div className="tw">
                        <table>
                          <thead><tr><th>Apt ID</th><th>Patient</th><th>Package</th><th>Date</th><th>Stage</th><th>Action</th></tr></thead>
                          <tbody>
                            {pendingReports.slice(0, 5).map(b => (
                              <tr key={b.id}>
                                <td><span style={{ fontFamily: "monospace", fontSize: 12, color: "var(--teal)", fontWeight: 600 }}>{b.id.slice(-9)}</span></td>
                                <td><div style={{ fontWeight: 600, fontSize: 13 }}>{b.patient_name}</div><div style={{ fontSize: 11, color: "var(--hint)" }}>{b.patient_phone}</div></td>
                                <td style={{ maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{(b as any).package?.name ?? "—"}</td>
                                <td style={{ fontSize: 12 }}>{b.appointment_date}</td>
                                <td>{stageBadge(b.stage)}</td>
                                <td><button className="abt u" onClick={() => openUpload(b)}>↑ Upload</button></td>
                              </tr>
                            ))}
                            {pendingReports.length === 0 && <tr><td colSpan={6} style={{ textAlign: "center", padding: 24, color: "var(--hint)" }}>No pending reports</td></tr>}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    {/* Month earnings */}
                    <div className="card">
                      <div className="card-head"><span className="card-title">Month Earnings</span><span className="badge bg">{new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</span></div>
                      <div style={{ padding: "14px 16px" }}>
                        <div className="iline"><span className="lbl">Gross Revenue</span><span style={{ fontWeight: 600 }}>{fmt(gross)}</span></div>
                        <div className="iline"><span className="lbl">Platform Fee (11%)</span><span style={{ color: "var(--red)" }}>−{fmt(fee)}</span></div>
                        <div className="iline"><span className="lbl">SLA Deductions</span><span style={{ color: "var(--amber)" }}>−{fmt(breaches * 400)}</span></div>
                        <div className="iline"><span style={{ fontWeight: 700 }}>Net Payout</span><span style={{ color: "var(--green)", fontWeight: 800 }}>{fmt(net - breaches * 400)}</span></div>
                        <div style={{ marginTop: 10, fontSize: 12, color: "var(--hint)" }}>Next payout: 25th of this month</div>
                      </div>
                    </div>
                  </div>
                  <div className="fcol">
                    {/* SLA Performance */}
                    <div className="card">
                      <div className="card-head"><span className="card-title">SLA Performance</span><span style={{ fontSize: 11, color: "var(--hint)" }}>MTD</span></div>
                      <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 11 }}>
                        {[
                          { label: "Confirmation (<2 hr)", val: compliance + "%", pct: compliance, cls: compliance >= 90 ? "pf-g" : "pf-a", color: compliance >= 90 ? "var(--green)" : "var(--amber)" },
                          { label: "First Report (<6 hr)", val: "81%", pct: 81, cls: "pf-a", color: "var(--amber)" },
                          { label: "Full Report (<36 hr)", val: "97%", pct: 97, cls: "pf-g", color: "var(--green)" },
                          { label: "Rejection Rate (<2%)", val: bookings.length > 0 ? ((rejected / bookings.length) * 100).toFixed(1) + "%" : "0%", pct: bookings.length > 0 ? Math.min((rejected / bookings.length) * 100, 100) : 0, cls: "pf-g", color: "var(--green)" },
                        ].map(s => (
                          <div key={s.label}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                              <span style={{ color: "var(--muted)" }}>{s.label}</span>
                              <span style={{ color: s.color, fontWeight: 600 }}>{s.val}</span>
                            </div>
                            <div className="pbar"><div className={`pfill ${s.cls}`} style={{ width: s.pct + "%" }} /></div>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Revenue chart */}
                    <div className="card">
                      <div className="card-head"><span className="card-title">7-Day Revenue Trend</span></div>
                      <div style={{ padding: "14px 16px" }}>
                        <div className="chartbars" style={{ height: 80 }}>
                          {last7.map((d, i) => (
                            <div key={i} className="cbar" style={{ height: Math.max(3, Math.round((d.rev / maxRev) * 72)) + "px", background: d.isToday ? "var(--teal)" : "#E2E8F0" }} title={fmt(d.rev)} />
                          ))}
                        </div>
                        <div className="clabels">
                          {last7.map((d, i) => <div key={i} className="clbl">{d.day}</div>)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ═══ CONFIRM QUEUE ═══ */}
            {page === "queue" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16, animation: "fadein .15s" }}>
                <div className="alert alert-r">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/></svg>
                  <span><strong>SLA Alert:</strong> Confirm appointments within 2 hours or a penalty of ₹400 per breach will be applied. <strong>{queue.length} appointments awaiting confirmation.</strong></span>
                </div>
                <div className="card">
                  <div className="card-head">
                    <span className="card-title">Awaiting Confirmation</span>
                    <div className="card-acts">
                      <span className="badge br" style={{ fontSize: 12 }}>{queue.length} pending</span>
                      <button className="btn sm" onClick={fetchBookings}>↺ Refresh</button>
                    </div>
                  </div>
                  {queue.length === 0 ? (
                    <div style={{ padding: "48px 0", textAlign: "center" }}>
                      <div style={{ fontSize: 40, marginBottom: 10 }}>🎉</div>
                      <div style={{ fontSize: 15, fontWeight: 700 }}>Queue is clear!</div>
                      <div style={{ fontSize: 13, color: "var(--hint)", marginTop: 4 }}>All bookings confirmed.</div>
                    </div>
                  ) : (
                    <div className="tw">
                      <table>
                        <thead><tr><th>Apt ID</th><th>Patient</th><th>Package</th><th>Slot</th><th>Type</th><th>Time Left</th><th>Actions</th></tr></thead>
                        <tbody>
                          {queue.map(b => (
                            <tr key={b.id} style={{ background: new Date(b.created_at).getTime() + 7200000 - Date.now() < 1800000 ? "var(--redbg)" : undefined }}>
                              <td><span style={{ fontFamily: "monospace", fontSize: 12, color: "var(--teal)", fontWeight: 600 }}>{b.id.slice(-9)}</span></td>
                              <td>
                                <div style={{ fontWeight: 600, fontSize: 13 }}>{b.patient_name}</div>
                                <div style={{ fontSize: 11, color: "var(--hint)" }}>{b.patient_gender}, {b.patient_age}y · {b.patient_phone}</div>
                              </td>
                              <td style={{ maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{(b as any).package?.name ?? "—"}</td>
                              <td><div style={{ fontSize: 13 }}>{b.appointment_date}</div><div style={{ fontSize: 11, color: "var(--hint)" }}>{b.slot_time?.slice(0, 5) ?? "—"}</div></td>
                              <td><span className="badge bgr">{b.collection_type}</span></td>
                              <td><SLATimer createdAt={b.created_at} /></td>
                              <td>
                                <div style={{ display: "flex", gap: 5 }}>
                                  <button className="abt c" onClick={() => setConfirmB(b)}>✓ Confirm</button>
                                  <button className="abt r" onClick={() => setRejectB(b)}>✕</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ═══ PENDING REPORTS ═══ */}
            {page === "reports" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16, animation: "fadein .15s" }}>
                <div className="alert alert-a">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/></svg>
                  <span><strong>{pendingReports.length} reports pending upload.</strong> Upload reports before the 36-hour SLA deadline to avoid penalties.</span>
                </div>
                <div className="card">
                  <div className="card-head">
                    <span className="card-title">Pending Report Uploads</span>
                    <div className="card-acts">
                      <button className="btn sm primary" onClick={() => { setUploadBooking(null); setUploadTests([]); setUploadOpen(true); }}>+ Upload Report</button>
                    </div>
                  </div>
                  <div className="tabs">
                    {[["all", "All", pendingReports.length], ["overdue", "Overdue", 0], ["today", "Due Today", pendingReports.filter(b => b.appointment_date === today).length], ["upcoming", "Upcoming", pendingReports.filter(b => b.appointment_date > today).length]].map(([k, l, n]) => (
                      <button key={k as string} onClick={() => setPrTab(k as string)} className={`tab${prTab === k ? " on" : ""}`}>
                        {l as string} <span className="tcnt">{n as number}</span>
                      </button>
                    ))}
                  </div>
                  <div className="tw">
                    <table>
                      <thead><tr><th>Apt ID</th><th>Patient</th><th>Package</th><th>Visit Date</th><th>Stage</th><th>Report</th><th>Action</th></tr></thead>
                      <tbody>
                        {prFiltered.slice(0, 15).map(b => (
                          <tr key={b.id}>
                            <td><span style={{ fontFamily: "monospace", fontSize: 12, color: "var(--teal)", fontWeight: 600 }}>{b.id.slice(-9)}</span></td>
                            <td><div style={{ fontWeight: 600 }}>{b.patient_name}</div><div style={{ fontSize: 11, color: "var(--hint)" }}>{b.patient_phone}</div></td>
                            <td style={{ maxWidth: 130, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{(b as any).package?.name ?? "—"}</td>
                            <td style={{ fontSize: 12 }}>{b.appointment_date}</td>
                            <td>{stageBadge(b.stage)}</td>
                            <td>{b.report_url ? <a href={b.report_url} target="_blank" rel="noreferrer" style={{ color: "var(--teal)", fontSize: 12 }}>View →</a> : <span className="badge ba">Pending</span>}</td>
                            <td><button className="abt u" onClick={() => openUpload(b)}>↑ Upload</button></td>
                          </tr>
                        ))}
                        {prFiltered.length === 0 && <tr><td colSpan={7} style={{ textAlign: "center", padding: 32, color: "var(--hint)" }}>No reports pending</td></tr>}
                      </tbody>
                    </table>
                  </div>
                  {prFiltered.length > 15 && (
                    <div className="tpager">
                      <span>Showing 1–15 of {prFiltered.length}</span>
                      <div className="pgbtns"><button className="pgbtn">←</button><button className="pgbtn on">1</button><button className="pgbtn">→</button></div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ═══ ALL APPOINTMENTS ═══ */}
            {page === "appointments" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16, animation: "fadein .15s" }}>
                <div className="metrics m4">
                  {[
                    { label: "Total Bookings", val: String(bookings.length), sub: "All time" },
                    { label: "Confirmed", val: String(confirmed), color: "var(--green)" },
                    { label: "Rejected", val: String(rejected), color: "var(--red)" },
                    { label: "No Show", val: String(noShow), color: "var(--amber)" },
                  ].map(m => (
                    <div key={m.label} className="mcard">
                      <div className="mlabel">{m.label}</div>
                      <div className="mval" style={{ color: m.color ?? "var(--ink)" }}>{m.val}</div>
                      {m.sub && <div className="msub">{m.sub}</div>}
                    </div>
                  ))}
                </div>
                <div className="card">
                  <div className="card-head">
                    <span className="card-title">All Appointments</span>
                    <div className="card-acts">
                      <input type="search" placeholder="Search patient / ID…" value={search} onChange={e => setSearch(e.target.value)} style={{ padding: "6px 10px", border: "1px solid var(--border)", borderRadius: "var(--r8)", fontSize: 12, background: "#fff", fontFamily: "inherit", outline: "none" }} />
                      <button className="btn sm" onClick={() => addToast("CSV exported!", "s")}>Export</button>
                    </div>
                  </div>
                  <div className="tabs">
                    {[["all", "All", bookings.length], ["Confirmed", "Confirmed", confirmed], ["Rejected", "Rejected", rejected], ["No Show", "No Show", noShow], ["Received", "Received", done.length], ["today", "Today", todayB.length], ["tomorrow", "Tomorrow", tomorrowB.length]].map(([k, l, n]) => (
                      <button key={k as string} onClick={() => setAptTab(k as string)} className={`tab${aptTab === k ? " on" : ""}`}>
                        {l as string} <span className="tcnt">{n as number}</span>
                      </button>
                    ))}
                  </div>
                  <div className="tw">
                    <table>
                      <thead><tr><th>Apt ID</th><th>Patient</th><th>Package</th><th>Date & Time</th><th>Type</th><th>Stage</th><th>SLA</th><th>Amount</th><th>Actions</th></tr></thead>
                      <tbody>
                        {aptFiltered.slice(0, 25).map(b => (
                          <tr key={b.id}>
                            <td><span style={{ fontFamily: "monospace", fontSize: 12, color: "var(--teal)", fontWeight: 600 }}>{b.id.slice(-9)}</span></td>
                            <td><div style={{ fontWeight: 600, fontSize: 13 }}>{b.patient_name}</div><div style={{ fontSize: 11, color: "var(--hint)" }}>{b.patient_phone}</div></td>
                            <td style={{ maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 12 }}>{(b as any).package?.name ?? "—"}</td>
                            <td><div style={{ fontSize: 13 }}>{b.appointment_date}</div><div style={{ fontSize: 11, color: "var(--hint)" }}>{b.slot_time?.slice(0, 5) ?? "—"} · {b.collection_type}</div></td>
                            <td><span className="badge bgr">{b.collection_type}</span></td>
                            <td>{stageBadge(b.stage)}</td>
                            <td>{slaBadge(b.sla_status)}</td>
                            <td style={{ fontWeight: 700 }}>{fmt(b.amount)}</td>
                            <td>
                              <div style={{ display: "flex", gap: 4 }}>
                                {b.stage === "New" && <><button className="abt c" onClick={() => setConfirmB(b)}>✓</button><button className="abt r" onClick={() => setRejectB(b)}>✕</button></>}
                                {["Confirmed", "In Progress"].includes(b.stage) && <button className="abt u" onClick={() => openUpload(b)}>↑ Upload</button>}
                                {b.report_url && <a href={b.report_url} target="_blank" rel="noreferrer" className="abt">📄</a>}
                              </div>
                            </td>
                          </tr>
                        ))}
                        {aptFiltered.length === 0 && <tr><td colSpan={9} style={{ textAlign: "center", padding: 32, color: "var(--hint)" }}>No appointments found</td></tr>}
                      </tbody>
                    </table>
                  </div>
                  {aptFiltered.length > 25 && (
                    <div className="tpager">
                      <span>Showing 1–25 of {aptFiltered.length}</span>
                      <div className="pgbtns"><button className="pgbtn">←</button><button className="pgbtn on">1</button><button className="pgbtn">→</button></div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ═══ TAT ANALYTICS ═══ */}
            {page === "tat" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16, animation: "fadein .15s" }}>
                <div className="alert alert-b">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <span><strong>SLA Penalties are active.</strong> Deviations beyond SLA targets will incur financial charges. See breakdown below.</span>
                </div>
                <div className="metrics m4">
                  {[
                    { label: "Avg Confirmation TAT", val: "1h 38m", sub: "✓ Within SLA", subColor: "var(--green)", topColor: "var(--teal)" },
                    { label: "Avg First Report TAT", val: "5h 42m", valColor: "var(--amber)", sub: "⚠ Near SLA", subColor: "var(--amber)", topColor: "#F59E0B" },
                    { label: "Avg Full Report TAT", val: "28h 12m", sub: "✓ Within SLA", subColor: "var(--green)", topColor: "#10B981" },
                    { label: "SLA Breaches MTD", val: String(breaches), valColor: breaches > 0 ? "var(--red)" : "var(--green)", sub: fmt(breaches * 400) + " in penalties", topColor: "#EF4444" },
                  ].map(m => (
                    <div key={m.label} className="mcard">
                      <div className="mcard-top" style={{ background: m.topColor }} />
                      <div className="mlabel">{m.label}</div>
                      <div className="mval" style={{ color: m.valColor ?? "var(--ink)" }}>{m.val}</div>
                      {m.sub && <div className="msub" style={{ color: m.subColor }}>{m.sub}</div>}
                    </div>
                  ))}
                </div>
                <div className="g2">
                  <div className="card">
                    <div className="card-head">
                      <span className="card-title">7-Day SLA Compliance</span>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}><span style={{ width: 10, height: 10, background: "#10B981", borderRadius: 2, display: "inline-block" }} />Within SLA</span>
                        <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}><span style={{ width: 10, height: 10, background: "#EF4444", borderRadius: 2, display: "inline-block" }} />Breach</span>
                      </div>
                    </div>
                    <div style={{ padding: 16 }}>
                      <div className="chartbars" style={{ height: 100 }}>
                        {[96, 92, 88, 95, 78, 97, compliance].map((v, i) => (
                          <div key={i} className="cbar" style={{ height: Math.max(3, Math.round(v / 100 * 92)) + "px", background: v >= 90 ? "#10B981" : "#EF4444" }} title={v + "% compliance"} />
                        ))}
                      </div>
                      <div className="clabels">
                        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => <div key={d} className="clbl">{d}</div>)}
                      </div>
                    </div>
                  </div>
                  <div className="card">
                    <div className="card-head"><span className="card-title">SLA Breach Details</span><span className="badge bg" style={{ fontSize: 11 }}>Active</span></div>
                    <div style={{ padding: "14px 16px" }}>
                      <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
                        <thead><tr>
                          <th style={{ textAlign: "left", padding: "6px 0", fontSize: 10, color: "var(--hint)" }}>SLA Type</th>
                          <th style={{ textAlign: "center", padding: 6, fontSize: 10, color: "var(--hint)" }}>Target</th>
                          <th style={{ textAlign: "right", padding: 6, fontSize: 10, color: "var(--hint)" }}>Penalty</th>
                        </tr></thead>
                        <tbody>
                          {[["Confirmation", "<2 hours", "₹400/breach"], ["First Report", "<6 hours", "₹600/breach"], ["Full Report", "<36 hours", "₹1,000/breach"]].map(([t, v, p]) => (
                            <tr key={t}><td style={{ padding: "6px 0" }}>{t}</td><td style={{ textAlign: "center", color: "var(--muted)" }}>{v}</td><td style={{ textAlign: "right", color: "var(--red)", fontWeight: 600 }}>{p}</td></tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                <div className="card">
                  <div className="card-head"><span className="card-title">Tips to Avoid Penalties</span></div>
                  <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
                    {[
                      { bg: "var(--greenbg)", icon: "💡", title: "Confirm within 30 minutes", tip: "Enable WhatsApp alerts to get notified instantly when a booking arrives." },
                      { bg: "var(--bluebg)", icon: "🚀", title: "Upload first report within 5 hours", tip: "Even partial reports count as 'First Report' — upload as soon as one test is done." },
                      { bg: "var(--amberbg)", icon: "⚡", title: "Keep rejection rate under 2%", tip: "Only reject if genuinely unable to serve. Frequent rejections impact your quality score." },
                    ].map(t => (
                      <div key={t.title} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: 10, background: t.bg, borderRadius: "var(--r8)" }}>
                        <span style={{ fontSize: 16 }}>{t.icon}</span>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{t.title}</div>
                          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{t.tip}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ═══ QUALITY SCORE ═══ */}
            {page === "quality" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16, animation: "fadein .15s" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: "var(--r12)", padding: "20px 24px", display: "flex", alignItems: "center", gap: 18, flexShrink: 0 }}>
                    <div style={{ width: 72, height: 72, borderRadius: "50%", background: `conic-gradient(var(--teal) 0% ${compliance}%,var(--bord2) ${compliance}% 100%)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ width: 54, height: 54, background: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: 18, fontWeight: 800, color: "var(--teal)" }}>{compliance}</span>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 800 }}>Quality Score</div>
                      <div style={{ fontSize: 12, color: "var(--hint)", marginTop: 3 }}>{new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</div>
                      <span className={`badge ${compliance >= 80 ? "bg" : compliance >= 60 ? "ba" : "br"}`} style={{ marginTop: 6 }}>{compliance >= 80 ? "Good" : compliance >= 60 ? "Average" : "Needs Improvement"}</span>
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="alert alert-g">
                      <span>Your confirmation TAT improved. Keep uploading reports early to improve your score further.</span>
                    </div>
                  </div>
                </div>
                <div className="g2">
                  <div className="card">
                    <div className="card-head"><span className="card-title">SLA Metrics</span></div>
                    <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 13 }}>
                      {[
                        { label: "Confirmation SLA", val: compliance + "%", pct: compliance, cls: compliance >= 90 ? "pf-g" : "pf-a" },
                        { label: "First Report SLA", val: "81%", pct: 81, cls: "pf-a" },
                        { label: "Full Report SLA", val: "97%", pct: 97, cls: "pf-g" },
                      ].map(s => (
                        <div key={s.label}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                            <span style={{ color: "var(--muted)" }}>{s.label}</span>
                            <span style={{ fontWeight: 700 }}>{s.val}</span>
                          </div>
                          <div className="pbar"><div className={`pfill ${s.cls}`} style={{ width: s.pct + "%" }} /></div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="card">
                    <div className="card-head"><span className="card-title">Patient Experience</span></div>
                    <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 13 }}>
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}><span style={{ color: "var(--muted)" }}>Response Time</span><span style={{ color: "var(--green)", fontWeight: 700 }}>Excellent</span></div>
                        <div className="pbar"><div className="pfill pf-g" style={{ width: "91%" }} /></div>
                        <div style={{ fontSize: 11, color: "var(--hint)", marginTop: 3 }}>Avg 1h 38m · Target &lt;2 hrs</div>
                      </div>
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}><span style={{ color: "var(--muted)" }}>Patient Ratings</span><span style={{ color: "var(--green)", fontWeight: 700 }}>4.7 / 5</span></div>
                        <div className="pbar"><div className="pfill pf-g" style={{ width: "94%" }} /></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ═══ INVOICES ═══ */}
            {page === "invoices" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16, animation: "fadein .15s" }}>
                <div className="metrics m4">
                  {[
                    { label: "Gross Revenue", val: fmt(gross) },
                    { label: "Platform Fee", val: "−" + fmt(fee), color: "var(--red)" },
                    { label: "SLA Deductions", val: "−" + fmt(breaches * 400), color: "var(--amber)" },
                    { label: "Net Payout", val: fmt(net - breaches * 400), color: "var(--green)" },
                  ].map(m => (
                    <div key={m.label} className="mcard">
                      <div className="mlabel">{m.label}</div>
                      <div className="mval" style={{ color: m.color ?? "var(--ink)" }}>{m.val}</div>
                    </div>
                  ))}
                </div>
                <div className="card">
                  <div className="card-head">
                    <span className="card-title">Monthly Invoice</span>
                    <div className="card-acts">
                      <select style={{ padding: "7px 10px", border: "1px solid var(--border)", borderRadius: "var(--r8)", fontSize: 13, background: "#fff", fontFamily: "inherit" }}>
                        <option>{new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</option>
                      </select>
                      <button className="btn sm primary" onClick={() => addToast("Invoice PDF generated!", "s")}>Download PDF</button>
                    </div>
                  </div>
                  <div style={{ padding: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, paddingBottom: 14, borderBottom: "1px solid var(--border)" }}>
                      <div><div style={{ fontSize: 16, fontWeight: 800 }}>INVOICE</div><div style={{ fontSize: 12, color: "var(--hint)", marginTop: 2 }}>Invoice # INV-{new Date().getFullYear()}-{new Date().getMonth() + 1}-HFL</div></div>
                      <div style={{ textAlign: "right" }}><div style={{ fontSize: 12, color: "var(--hint)" }}>Period</div><div style={{ fontWeight: 700 }}>01–{new Date().getDate()} {new Date().toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</div></div>
                    </div>
                    <div className="iline"><span className="lbl">Bookings ({done.length})</span><span>{fmt(gross)}</span></div>
                    <div className="iline"><span className="lbl">Platform Fee 11%</span><span style={{ color: "var(--red)" }}>−{fmt(fee)}</span></div>
                    <div className="iline"><span className="lbl">SLA Deductions ({breaches} breaches)</span><span style={{ color: "var(--amber)" }}>−{fmt(breaches * 400)}</span></div>
                    <div className="iline" style={{ fontWeight: 800, fontSize: 14 }}><span>Net Payout</span><span style={{ color: "var(--green)" }}>{fmt(net - breaches * 400)}</span></div>
                    <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
                      <button className="btn primary" onClick={() => addToast("Invoice approved! Payout scheduled for 25th.", "s")}>Approve Invoice</button>
                      <button className="btn" onClick={() => addToast("Dispute form opened", "i")}>Raise Dispute</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ═══ RECONCILIATION ═══ */}
            {page === "recon" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16, animation: "fadein .15s" }}>
                <div className="metrics m3">
                  {[
                    { label: "Total Records", val: String(bookings.length), topColor: "var(--teal)" },
                    { label: "Matched", val: String(bookings.length - (bookings.length < 5 ? 0 : 2)), color: "var(--green)", topColor: "#10B981" },
                    { label: "Mismatch", val: String(bookings.length < 5 ? 0 : 2), color: "var(--red)", topColor: "#EF4444" },
                  ].map(m => (
                    <div key={m.label} className="mcard">
                      <div className="mcard-top" style={{ background: m.topColor }} />
                      <div className="mlabel">{m.label}</div>
                      <div className="mval" style={{ color: m.color ?? "var(--ink)" }}>{m.val}</div>
                    </div>
                  ))}
                </div>
                <div className="card">
                  <div className="card-head">
                    <span className="card-title">Reconciliation Log</span>
                    <button className="btn sm primary" onClick={() => addToast("CSV exported!", "s")}>Export</button>
                  </div>
                  <div className="tw">
                    <table>
                      <thead><tr><th>Apt ID</th><th>Patient</th><th>Lab Amount</th><th>CK Amount</th><th>Diff</th><th>Status</th><th>Action</th></tr></thead>
                      <tbody>
                        {bookings.filter(b => ["Received", "Reports Received"].includes(b.stage)).slice(0, 10).map(b => (
                          <tr key={b.id}>
                            <td><span style={{ fontFamily: "monospace", fontSize: 12, color: "var(--teal)", fontWeight: 600 }}>{b.id.slice(-9)}</span></td>
                            <td style={{ fontWeight: 600, fontSize: 13 }}>{b.patient_name}</td>
                            <td>{fmt(b.amount)}</td>
                            <td>{fmt(b.amount)}</td>
                            <td style={{ color: "var(--green)", fontWeight: 600 }}>₹0</td>
                            <td><span className="badge bg">Matched</span></td>
                            <td><button className="abt" onClick={() => addToast("Record opened", "i")}>View</button></td>
                          </tr>
                        ))}
                        {done.length === 0 && <tr><td colSpan={7} style={{ textAlign: "center", padding: 32, color: "var(--hint)" }}>No completed bookings</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ═══ CONTRACT ═══ */}
            {page === "contracts" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16, animation: "fadein .15s" }}>
                <div className="card">
                  <div className="card-head">
                    <span className="card-title">Contract Details</span>
                    <div className="card-acts">
                      <span className="badge bg">Active Contract</span>
                      <button className="btn sm" onClick={() => addToast("Downloading contract PDF", "i")}>Download PDF</button>
                    </div>
                  </div>
                  <div style={{ padding: 20 }}>
                    <div className="frow f2" style={{ marginBottom: 18 }}>
                      {[
                        { label: "Contract Period", val: "01 Jan 2026 — 31 Dec 2026", sub: "251 days remaining", subColor: "var(--teal)" },
                        { label: "Platform Fee", val: "11%", sub: "On all confirmed bookings" },
                        { label: "Network Type", val: "Premium", sub: "", badge: <span className="badge bb">NABL Certified</span> },
                        { label: "Payment Cycle", val: "Monthly", sub: "Settled on 25th every month" },
                      ].map(c => (
                        <div key={c.label} style={{ border: "1px solid var(--border)", borderRadius: "var(--r10)", padding: 14 }}>
                          <div style={{ fontSize: 11, color: "var(--hint)", marginBottom: 3 }}>{c.label}</div>
                          <div style={{ fontSize: 15, fontWeight: 700 }}>{c.val}</div>
                          {c.sub && <div style={{ fontSize: 12, color: c.subColor ?? "var(--hint)", marginTop: 5 }}>{c.sub}</div>}
                          {c.badge && <div style={{ marginTop: 6 }}>{c.badge}</div>}
                        </div>
                      ))}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>SLA Terms</div>
                    <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
                      <thead><tr><th style={{ textAlign: "left", padding: "8px 0", fontSize: 10, color: "var(--hint)", borderBottom: "1px solid var(--border)" }}>SLA Type</th><th style={{ textAlign: "center", padding: "8px", fontSize: 10, color: "var(--hint)", borderBottom: "1px solid var(--border)" }}>Target</th><th style={{ textAlign: "right", padding: "8px", fontSize: 10, color: "var(--hint)", borderBottom: "1px solid var(--border)" }}>Penalty</th></tr></thead>
                      <tbody>
                        {[["Confirmation", "<2 hours", "₹400/breach"], ["First Report", "<6 hours", "₹600/breach"], ["Full Report", "<36 hours", "₹1,000/breach"], ["Rejection Rate", "<2%", "Score impact"]].map(([t, v, p]) => (
                          <tr key={t}><td style={{ padding: "8px 0", borderBottom: "1px solid var(--bord2)" }}>{t}</td><td style={{ textAlign: "center", color: "var(--muted)", padding: 8, borderBottom: "1px solid var(--bord2)" }}>{v}</td><td style={{ textAlign: "right", color: "var(--red)", fontWeight: 600, padding: 8, borderBottom: "1px solid var(--bord2)" }}>{p}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ═══ SETTINGS ═══ */}
            {page === "settings" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16, animation: "fadein .15s" }}>
                <div style={{ display: "flex", gap: 16 }}>
                  <div style={{ width: 180, flexShrink: 0 }}>
                    {[["general", "⚙️ General"], ["sla", "⏱ SLA Config"], ["notif", "🔔 Notifications"], ["logo", "🖼 Lab Logo"], ["hours", "🕐 Operating Hours"]].map(([k, l]) => (
                      <button key={k} onClick={() => setSetTab(k)} className={`profile-tab${setTab === k ? " on" : ""}`}>{l}</button>
                    ))}
                  </div>
                  <div style={{ flex: 1 }}>
                    {setTab === "general" && (
                      <div className="card">
                        <div className="card-head"><span className="card-title">General Settings</span></div>
                        <div style={{ padding: 20 }}>
                          {[["Lab Name", email?.split("@")[0] ?? "Lab Partner"], ["City", "Hyderabad"], ["NABL Number", "NABL-ACC-2024-HFL"], ["Phone", "+91-98765 43210"], ["Email", email ?? ""]].map(([k, v]) => (
                            <div key={k as string} className="fgrp">
                              <label>{k as string}</label>
                              <input defaultValue={v as string} />
                            </div>
                          ))}
                          <button className="btn primary" onClick={() => addToast("Settings saved!", "s")}>Save Changes</button>
                        </div>
                      </div>
                    )}
                    {setTab === "sla" && (
                      <div className="card">
                        <div className="card-head"><span className="card-title">SLA Configuration</span></div>
                        <div style={{ padding: "14px 16px" }}>
                          <div className="alert alert-b" style={{ marginBottom: 14 }}><span>SLA targets are set by Checkupify. Contact your RM to discuss adjustments.</span></div>
                          {[["Confirmation SLA", "2 hours", "₹400/breach"], ["First Report SLA", "6 hours", "₹600/breach"], ["Full Report SLA", "36 hours", "₹1,000/breach"], ["Rejection Rate", "2%", "Quality score impact"]].map(([k, v, p]) => (
                            <div key={k as string} className="iline">
                              <div><div style={{ fontWeight: 600, fontSize: 13 }}>{k as string}</div><div style={{ fontSize: 11, color: "var(--red)", marginTop: 2 }}>Penalty: {p as string}</div></div>
                              <div style={{ fontSize: 15, fontWeight: 700, color: "var(--teal)" }}>{v as string}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {setTab === "notif" && (
                      <div className="card">
                        <div className="card-head"><span className="card-title">Notification Preferences</span></div>
                        <div style={{ padding: "14px 16px" }}>
                          {[
                            { label: "New Booking Alert", sub: "WhatsApp + SMS when new booking arrives", on: true },
                            { label: "SLA Warning (30 min)", sub: "Alert 30 minutes before SLA breach", on: true },
                            { label: "Report Reminder", sub: "Daily reminder for pending report uploads", on: false },
                            { label: "Invoice Ready", sub: "Notification when monthly invoice is generated", on: true },
                          ].map(n => (
                            <div key={n.label} className="tgl-row">
                              <div className="tgl-info"><h4>{n.label}</h4><p>{n.sub}</p></div>
                              <button className={`tgl${n.on ? " on" : ""}`} onClick={e => { e.currentTarget.classList.toggle("on"); addToast("Preference updated", "s"); }} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {(setTab === "logo" || setTab === "hours") && (
                      <div className="card">
                        <div className="card-head"><span className="card-title">{setTab === "logo" ? "Lab Logo" : "Operating Hours"}</span></div>
                        <div style={{ padding: 20, color: "var(--hint)", fontSize: 13, textAlign: "center" }}>
                          {setTab === "logo" ? "Upload lab logo for reports and patient-facing pages." : "Configure your lab's operating hours and collection timeslots."}
                          <div style={{ marginTop: 16 }}>
                            <button className="btn primary" onClick={() => addToast("Opening…", "i")}>{setTab === "logo" ? "Upload Logo" : "Configure Hours"}</button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}
