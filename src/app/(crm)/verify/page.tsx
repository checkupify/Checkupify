"use client";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { TopBar } from "@/components/layout/TopBar";
import { ToastContainer } from "@/components/ui/Toast";
import { fmtDate } from "@/lib/utils";
import type { Booking } from "@/types";

type Toast = { id: string; message: string; type: "success" | "error" | "info" };

interface TestResult {
  id: string;
  booking_id: string;
  test_name: string;
  lab_status: "pending" | "skipped" | "not_done";
  lab_notes: string | null;
  vr_status: "pending" | "received" | "issue";
  vr_notes: string | null;
  vr_marked_at: string | null;
}

const LAB_STATUS = {
  pending:  { label: "Done by Lab",     bg: "#F0FDF4", fg: "#15803D", dot: "#22C55E" },
  skipped:  { label: "Skipped by Patient", bg: "#FFFBEB", fg: "#B45309", dot: "#F59E0B" },
  not_done: { label: "Not Done by Lab", bg: "#FEF2F2", fg: "#DC2626", dot: "#EF4444" },
};
const VR_STATUS = {
  pending:  { label: "Pending Review", bg: "#F8FAFC", fg: "#64748B" },
  received: { label: "✓ Received",     bg: "#F0FDF4", fg: "#15803D" },
  issue:    { label: "⚠ Issue",         bg: "#FEF2F2", fg: "#DC2626" },
};

export default function VerifyPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selBooking, setSelBooking] = useState<Booking | null>(null);
  const [tests, setTests] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTests, setLoadingTests] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const addToast = (m: string, t: Toast["type"] = "info") =>
    setToasts(p => [...p, { id: Date.now().toString(), message: m, type: t }]);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("bookings")
      .select("*,lab:labs(name),package:packages(name)")
      .in("stage", ["Report Uploaded", "Partially Uploaded", "Under Verification"])
      .order("updated_at", { ascending: false });
    if (data) setBookings(data as Booking[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const loadTests = useCallback(async (b: Booking) => {
    setSelBooking(b);
    setLoadingTests(true);
    const { data } = await supabase.from("test_results")
      .select("*").eq("booking_id", b.id).order("test_name");
    setTests((data as TestResult[]) ?? []);
    setLoadingTests(false);

    // Move to Under Verification if not already
    if (b.stage === "Report Uploaded" || b.stage === "Partially Uploaded") {
      await supabase.from("bookings").update({ stage: "Under Verification", updated_at: new Date().toISOString() }).eq("id", b.id);
    }
  }, []);

  async function markTest(testId: string, vr_status: "received" | "issue", notes = "") {
    setSaving(testId);
    const { error } = await supabase.from("test_results").update({
      vr_status, vr_notes: notes || null, vr_marked_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    }).eq("id", testId);
    if (error) { addToast(error.message, "error"); setSaving(null); return; }
    setTests(prev => prev.map(t => t.id === testId ? { ...t, vr_status, vr_notes: notes } : t));
    setSaving(null);
  }

  async function markAllReceived() {
    if (!selBooking || tests.length === 0) return;
    setSaving("all");
    const now = new Date().toISOString();
    await supabase.from("test_results").update({ vr_status: "received", vr_marked_at: now, updated_at: now }).eq("booking_id", selBooking.id);
    setTests(prev => prev.map(t => ({ ...t, vr_status: "received" as const })));
    addToast("All tests marked received", "success");
    setSaving(null);
  }

  async function finalizeBooking() {
    if (!selBooking) return;
    const allReceived = tests.every(t => t.vr_status === "received" || t.lab_status !== "pending");
    if (!allReceived) { addToast("Mark all tests before finalizing", "error"); return; }
    setSaving("finalize");
    await supabase.from("bookings").update({ stage: "Reports Received", updated_at: new Date().toISOString() }).eq("id", selBooking.id);
    addToast(`✓ Booking finalized — Reports Received`, "success");
    setSelBooking(null); setTests([]);
    fetchBookings();
    setSaving(null);
  }

  const receivedCount = tests.filter(t => t.vr_status === "received").length;
  const pendingVR = tests.filter(t => t.vr_status === "pending" && t.lab_status === "pending").length;
  const allDone = tests.length > 0 && tests.every(t => t.vr_status !== "pending" || t.lab_status !== "pending");

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={id => setToasts(p => p.filter(t => t.id !== id))} />
      <TopBar title="Verify Reports" subtitle={`${bookings.length} bookings awaiting verification`} loading={loading} onRefresh={fetchBookings} />

      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Booking list */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden" style={{ boxShadow: "0 1px 4px rgba(11,37,69,.06)" }}>
            <div className="px-5 py-4 border-b border-[#E2E8F0]">
              <p className="text-[14px] font-bold text-[#0B2545]">Pending Verification</p>
              <p className="text-xs text-[#B0BEC5] mt-0.5">{bookings.length} uploaded by labs</p>
            </div>
            {loading ? (
              <div className="p-8 text-center"><div className="w-5 h-5 border-2 border-[#E2E8F0] border-t-[#22C55E] rounded-full animate-spin mx-auto" /></div>
            ) : bookings.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-3xl mb-3">✅</p>
                <p className="text-sm text-[#B0BEC5]">All reports verified!</p>
              </div>
            ) : bookings.map(b => (
              <button key={b.id} onClick={() => loadTests(b)}
                className="w-full flex items-start gap-3 px-5 py-4 border-b border-[#F5F7FA] last:border-0 text-left cursor-pointer transition-all"
                style={{ background: selBooking?.id === b.id ? "rgba(34,197,94,.04)" : "white", borderLeft: selBooking?.id === b.id ? "3px solid #22C55E" : "3px solid transparent" }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-[11px] text-[#22C55E] flex-shrink-0"
                  style={{ background: "rgba(34,197,94,.1)" }}>
                  {b.patient_name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-[#0B2545] truncate">{b.patient_name}</p>
                  <p className="text-[11px] text-[#7A90B3] truncate">{(b as any).package?.name ?? "—"}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      b.stage === "Report Uploaded" ? "bg-emerald-50 text-emerald-700"
                      : b.stage === "Partially Uploaded" ? "bg-amber-50 text-amber-700"
                      : "bg-blue-50 text-blue-700"
                    }`}>{b.stage}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Test verification */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {!selBooking ? (
              <div className="bg-white rounded-2xl border border-[#E2E8F0] p-16 text-center" style={{ boxShadow: "0 1px 4px rgba(11,37,69,.06)" }}>
                <p className="text-4xl mb-4">☑</p>
                <p className="text-[15px] font-bold text-[#0B2545]">Select a booking to verify</p>
                <p className="text-sm text-[#B0BEC5] mt-2">Review each test uploaded by the lab and mark as received</p>
              </div>
            ) : (
              <>
                {/* Patient info header */}
                <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5" style={{ boxShadow: "0 1px 4px rgba(11,37,69,.06)" }}>
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-black text-lg" style={{ background: "linear-gradient(135deg, #0B2545, #1B4B8A)" }}>
                        {selBooking.patient_name[0]}
                      </div>
                      <div>
                        <p className="text-[15px] font-bold text-[#0B2545]">{selBooking.patient_name}</p>
                        <p className="text-xs text-[#7A90B3]">{selBooking.patient_phone} · {selBooking.appointment_date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {(selBooking as any).report_url && (
                        <a href={(selBooking as any).report_url} target="_blank" rel="noreferrer"
                          className="text-xs font-bold text-[#22C55E] border border-[#22C55E]/30 px-3 py-1.5 rounded-xl hover:bg-emerald-50 cursor-pointer">
                          📄 View PDF
                        </a>
                      )}
                      <button onClick={markAllReceived} disabled={saving === "all"}
                        className="text-xs font-bold text-white px-3 py-1.5 rounded-xl cursor-pointer"
                        style={{ background: "linear-gradient(135deg, #22C55E, #16A34A)" }}>
                        {saving === "all" ? "…" : "Mark All Received"}
                      </button>
                    </div>
                  </div>
                  {tests.length > 0 && (
                    <div className="flex items-center gap-3 mt-4 p-3 rounded-xl bg-[#F5F7FA]">
                      <div className="flex-1 h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-[#22C55E] transition-all duration-500"
                          style={{ width: `${(receivedCount / tests.length) * 100}%` }} />
                      </div>
                      <span className="text-[12px] font-bold text-[#0B2545] flex-shrink-0">{receivedCount}/{tests.length} verified</span>
                    </div>
                  )}
                </div>

                {/* Tests list */}
                <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden" style={{ boxShadow: "0 1px 4px rgba(11,37,69,.06)" }}>
                  <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
                    <p className="text-[14px] font-bold text-[#0B2545]">Test-wise Verification</p>
                    <span className="text-[11px] text-[#B0BEC5]">{tests.length} tests</span>
                  </div>

                  {loadingTests ? (
                    <div className="p-8 text-center"><div className="w-5 h-5 border-2 border-[#E2E8F0] border-t-[#22C55E] rounded-full animate-spin mx-auto" /></div>
                  ) : tests.length === 0 ? (
                    <div className="p-8 text-center text-sm text-[#B0BEC5]">No test results found for this booking</div>
                  ) : tests.map(t => {
                    const ls = LAB_STATUS[t.lab_status];
                    const vs = VR_STATUS[t.vr_status];
                    return (
                      <div key={t.id} className="border-b border-[#F5F7FA] last:border-0"
                        style={{ background: t.vr_status === "received" ? "#FAFFFE" : "white" }}>
                        <div className="flex items-center gap-4 px-5 py-3.5">
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold text-[#0B2545]">{t.test_name}</p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: ls.bg, color: ls.fg }}>
                                {ls.label}
                              </span>
                              {t.lab_notes && (
                                <span className="text-[10px] text-[#7A90B3] italic">"{t.lab_notes}"</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {/* VR status pill */}
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg" style={{ background: vs.bg, color: vs.fg }}>{vs.label}</span>
                            {/* Actions */}
                            {t.vr_status === "pending" && t.lab_status === "pending" && (
                              <>
                                <button onClick={() => markTest(t.id, "received")} disabled={saving === t.id}
                                  className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl cursor-pointer hover:bg-emerald-100 transition-colors">
                                  {saving === t.id ? "…" : "✓ Received"}
                                </button>
                                <button onClick={() => markTest(t.id, "issue", "Report issue")} disabled={saving === t.id}
                                  className="text-[11px] font-bold text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-xl cursor-pointer hover:bg-red-100 transition-colors">
                                  ⚠
                                </button>
                              </>
                            )}
                            {t.vr_status === "received" && (
                              <button onClick={() => markTest(t.id, "pending" as any)} className="text-[10px] text-[#94A3B8] hover:text-[#3D5A80] cursor-pointer">undo</button>
                            )}
                            {(t.lab_status === "skipped" || t.lab_status === "not_done") && t.vr_status === "pending" && (
                              <span className="text-[10px] text-[#B0BEC5] italic">Auto-noted</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Finalize */}
                <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5" style={{ boxShadow: "0 1px 4px rgba(11,37,69,.06)" }}>
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <p className="text-[14px] font-bold text-[#0B2545]">Finalize Appointment</p>
                      <p className="text-xs text-[#7A90B3] mt-0.5">
                        {allDone ? "✓ All tests verified — ready to finalize" : `${pendingVR} test${pendingVR !== 1 ? "s" : ""} still pending review`}
                      </p>
                    </div>
                    <button
                      onClick={finalizeBooking}
                      disabled={!allDone || saving === "finalize"}
                      className="px-5 py-3 rounded-xl font-bold text-sm cursor-pointer transition-all disabled:opacity-50 text-white flex items-center gap-2"
                      style={{ background: allDone ? "linear-gradient(135deg, #22C55E, #16A34A)" : "#E2E8F0", color: allDone ? "white" : "#94A3B8", boxShadow: allDone ? "0 4px 12px rgba(34,197,94,.25)" : "none" }}>
                      {saving === "finalize" ? "…" : "Mark as Reports Received →"}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
