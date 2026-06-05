"use client";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/Button";
import { ToastContainer } from "@/components/ui/Toast";
import { fmt, fmtDate } from "@/lib/utils";
import type { Booking } from "@/types";

type Toast = { id: string; message: string; type: "success" | "error" | "info" };
type LabStatus = "pending" | "skipped" | "not_done";

interface TestItem {
  test_id: string;
  test_name: string;
  category: string;
  lab_status: LabStatus;
  lab_notes: string;
}

const STATUS_CONFIG = {
  pending:  { label: "Pending",  color: "#94A3B8", bg: "#F8FAFC",     border: "#E2E8F0" },
  skipped:  { label: "Skipped",  color: "#D97706", bg: "#FFFBEB",     border: "#FDE68A" },
  not_done: { label: "Not Done", color: "#DC2626", bg: "#FEF2F2",     border: "#FECACA" },
};

export default function UploadPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [recentUploads, setRecentUploads] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Selection state
  const [selBooking, setSelBooking] = useState<Booking | null>(null);
  const [tests, setTests] = useState<TestItem[]>([]);
  const [loadingTests, setLoadingTests] = useState(false);
  const [reportUrl, setReportUrl] = useState("");
  const [reportType, setReportType] = useState<"partial" | "final">("final");
  const [uploadNotes, setUploadNotes] = useState("");

  const [toasts, setToasts] = useState<Toast[]>([]);
  const addToast = (m: string, t: Toast["type"] = "info") =>
    setToasts(p => [...p, { id: Date.now().toString(), message: m, type: t }]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [eligRes, recRes] = await Promise.allSettled([
      supabase.from("bookings")
        .select("*,lab:labs(name),package:packages(name,id)")
        .in("stage", ["Confirmed", "In Progress", "Report Uploaded", "Partially Uploaded"])
        .order("appointment_date"),
      supabase.from("bookings")
        .select("*,package:packages(name)")
        .not("report_url", "is", null)
        .order("updated_at", { ascending: false })
        .limit(6),
    ]);
    if (eligRes.status === "fulfilled" && eligRes.value.data) setBookings(eligRes.value.data as Booking[]);
    if (recRes.status === "fulfilled" && recRes.value.data) setRecentUploads(recRes.value.data as Booking[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const loadTests = useCallback(async (booking: Booking) => {
    setSelBooking(booking);
    setTests([]);
    setLoadingTests(true);
    const pkgId = (booking as any).package?.id;

    // Check if test_results already exist for this booking
    const { data: existing } = await supabase.from("test_results")
      .select("*").eq("booking_id", booking.id);

    if (existing && existing.length > 0) {
      setTests(existing.map((r: any) => ({
        test_id: r.test_id,
        test_name: r.test_name,
        category: r.category || "General",
        lab_status: r.lab_status as LabStatus,
        lab_notes: r.lab_notes || "",
      })));
      setLoadingTests(false);
      return;
    }

    // Load tests from package_tests + tests table
    if (pkgId) {
      const { data: pkgTests } = await supabase
        .from("package_tests")
        .select("test_id, tests!inner(id, name, category)")
        .eq("package_id", pkgId);

      if (pkgTests && pkgTests.length > 0) {
        setTests(pkgTests.map((pt: any) => ({
          test_id: pt.tests.id,
          test_name: pt.tests.name,
          category: pt.tests.category || "General",
          lab_status: "pending" as LabStatus,
          lab_notes: "",
        })));
        setLoadingTests(false);
        return;
      }
    }

    // Fallback: generate from package name + test_count
    const pkg = (booking as any).package;
    const count = (booking as any).test_count || 5;
    const FALLBACK: Record<string, string[]> = {
      "Full Body":   ["CBC","Lipid Profile","Thyroid Panel (TSH/T3/T4)","HbA1c","Liver Function Test","Kidney Function Test","Vitamin D","Vitamin B12","Urine Routine","ECG"],
      "Diabetes":    ["Fasting Blood Sugar","Post Prandial Blood Sugar","HbA1c","Kidney Function Test","Lipid Profile","Urine Microalbumin"],
      "Thyroid":     ["TSH","T3","T4","Anti-TPO Antibodies"],
      "Cardiac":     ["ECG","Lipid Profile","Troponin I","CK-MB","CBC"],
      "Vitamin":     ["Vitamin D3 (25-OH)","Vitamin B12","Iron Studies","Folate"],
    };
    let testNames: string[] = [];
    for (const [key, names] of Object.entries(FALLBACK)) {
      if (pkg?.name?.includes(key)) { testNames = names; break; }
    }
    if (testNames.length === 0) testNames = Array.from({ length: Math.max(count, 3) }, (_, i) => `Test ${i + 1}`);
    setTests(testNames.map(name => ({ test_id: "", test_name: name, category: "General", lab_status: "pending", lab_notes: "" })));
    setLoadingTests(false);
  }, []);

  function setTestStatus(idx: number, status: LabStatus) {
    setTests(prev => prev.map((t, i) => i === idx ? { ...t, lab_status: status } : t));
  }

  function setTestNotes(idx: number, notes: string) {
    setTests(prev => prev.map((t, i) => i === idx ? { ...t, lab_notes: notes } : t));
  }

  function toggleCycle(idx: number) {
    const t = tests[idx];
    const next: LabStatus = t.lab_status === "pending" ? "skipped" : t.lab_status === "skipped" ? "not_done" : "pending";
    setTestStatus(idx, next);
  }

  const doneCount = tests.filter(t => t.lab_status === "pending").length;
  const skippedCount = tests.filter(t => t.lab_status === "skipped").length;
  const notDoneCount = tests.filter(t => t.lab_status === "not_done").length;

  async function submitReport() {
    if (!selBooking) { addToast("Select a booking first", "error"); return; }
    if (!reportUrl.trim() && reportType === "final") { addToast("Enter report PDF URL for final reports", "error"); return; }
    setSaving(true);
    try {
      const now = new Date().toISOString();
      // Save test results
      const rows = tests.map(t => ({
        booking_id: selBooking.id,
        test_id: t.test_id || null,
        test_name: t.test_name,
        lab_status: t.lab_status,
        lab_notes: t.lab_notes || null,
        lab_marked_at: now,
        updated_at: now,
      }));

      const { error: trErr } = await supabase.from("test_results")
        .upsert(rows, { onConflict: "booking_id,test_name" });
      if (trErr) throw trErr;

      // Update booking
      const newStage = skippedCount === 0 && notDoneCount === 0
        ? "Report Uploaded"
        : notDoneCount > 0 ? "Partially Uploaded" : "Report Uploaded";

      const { error: bErr } = await supabase.from("bookings").update({
        stage: newStage,
        report_url: reportUrl || null,
        notes: uploadNotes || null,
        updated_at: now,
      }).eq("id", selBooking.id);
      if (bErr) throw bErr;

      addToast(`✓ Report submitted — ${doneCount} done, ${skippedCount} skipped, ${notDoneCount} not done`, "success");
      setSelBooking(null); setTests([]); setReportUrl(""); setUploadNotes("");
      fetchData();
    } catch (e: any) {
      addToast(e.message || "Upload failed", "error");
    } finally {
      setSaving(false);
    }
  }

  const CATEGORY_COLORS: Record<string, string> = {
    haematology: "#3B82F6", thyroid: "#7C3AED", diabetes: "#F59E0B",
    cardiac: "#EF4444", liver: "#F97316", kidney: "#14B8A6",
    vitamins: "#22C55E", radiology: "#64748B", urine: "#8B5CF6",
  };

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={id => setToasts(p => p.filter(t => t.id !== id))} />
      <TopBar title="Upload Reports" subtitle="Mark test status & attach report PDF" loading={loading} onRefresh={fetchData} />

      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

          {/* LEFT: Upload Form */}
          <div className="flex flex-col gap-4">
            {/* Step 1 — Select Booking */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0]" style={{ boxShadow: "0 1px 4px rgba(11,37,69,.06)" }}>
              <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center gap-3">
                <div className="w-7 h-7 rounded-xl flex items-center justify-center text-white text-xs font-black" style={{ background: "#0B2545" }}>1</div>
                <p className="text-[14px] font-bold text-[#0B2545]">Select Appointment</p>
              </div>
              <div className="p-4">
                {selBooking ? (
                  <div className="flex items-start justify-between p-4 rounded-xl" style={{ background: "rgba(34,197,94,.06)", border: "1.5px solid rgba(34,197,94,.25)" }}>
                    <div>
                      <p className="text-[13px] font-bold text-[#0B2545]">{selBooking.patient_name}</p>
                      <p className="text-[11px] text-[#7A90B3] mt-0.5">{(selBooking as any).package?.name ?? "—"}</p>
                      <p className="text-[11px] text-[#7A90B3]">{selBooking.appointment_date} · {selBooking.patient_phone}</p>
                    </div>
                    <button onClick={() => { setSelBooking(null); setTests([]); }}
                      className="text-[#A8BACC] hover:text-red-500 cursor-pointer text-lg font-light">✕</button>
                  </div>
                ) : (
                  <div className="max-h-52 overflow-y-auto border border-[#E2E8F0] rounded-xl">
                    {loading ? (
                      <div className="p-8 text-center text-sm text-[#B0BEC5]">Loading…</div>
                    ) : bookings.length === 0 ? (
                      <div className="p-8 text-center">
                        <p className="text-2xl mb-2">📅</p>
                        <p className="text-sm text-[#B0BEC5]">No confirmed bookings awaiting reports</p>
                      </div>
                    ) : bookings.map(b => (
                      <button key={b.id} onClick={() => loadTests(b)}
                        className="w-full flex items-center justify-between px-4 py-3 border-b border-[#F5F7FA] last:border-0 text-left cursor-pointer hover:bg-[#FAFBFD] transition-colors">
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-semibold text-[#0B2545] truncate">{b.patient_name}</p>
                          <p className="text-[10px] text-[#B0BEC5]">{(b as any).package?.name ?? "—"} · {b.appointment_date}</p>
                        </div>
                        <span className="font-mono text-[10px] text-[#22C55E] ml-2 flex-shrink-0">{b.id.slice(-8)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Step 2 — Test-wise Status */}
            {selBooking && (
              <div className="bg-white rounded-2xl border border-[#E2E8F0]" style={{ boxShadow: "0 1px 4px rgba(11,37,69,.06)" }}>
                <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-xl flex items-center justify-center text-white text-xs font-black" style={{ background: "#0B2545" }}>2</div>
                    <p className="text-[14px] font-bold text-[#0B2545]">Test-wise Status</p>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-semibold">
                    <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-lg">{doneCount} Done</span>
                    {skippedCount > 0 && <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-lg">{skippedCount} Skipped</span>}
                    {notDoneCount > 0 && <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded-lg">{notDoneCount} Not Done</span>}
                  </div>
                </div>

                {/* Legend */}
                <div className="px-5 py-3 bg-[#FAFBFD] border-b border-[#E2E8F0] flex items-center gap-4 flex-wrap">
                  <p className="text-[11px] text-[#B0BEC5] font-medium">Default = Done (included in report). Mark only exceptions:</p>
                  <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /><span className="text-[10px] font-bold text-amber-700">Skipped</span><span className="text-[10px] text-[#B0BEC5]">= patient skipped</span></div>
                  <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" /><span className="text-[10px] font-bold text-red-700">Not Done</span><span className="text-[10px] text-[#B0BEC5]">= lab couldn't perform</span></div>
                </div>

                <div className="max-h-[420px] overflow-y-auto">
                  {loadingTests ? (
                    <div className="p-8 text-center"><div className="w-6 h-6 border-2 border-[#E2E8F0] border-t-[#22C55E] rounded-full animate-spin mx-auto" /></div>
                  ) : tests.map((test, idx) => {
                    const catColor = CATEGORY_COLORS[test.category?.toLowerCase()] ?? "#64748B";
                    const cfg = STATUS_CONFIG[test.lab_status];
                    return (
                      <div key={idx} className="border-b border-[#F5F7FA] last:border-0"
                        style={{ background: test.lab_status !== "pending" ? cfg.bg : "white" }}>
                        <div className="flex items-center justify-between px-5 py-3.5 gap-3">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: catColor }} />
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-semibold text-[#0B2545] truncate">{test.test_name}</p>
                              <p className="text-[10px] text-[#B0BEC5] capitalize">{test.category}</p>
                            </div>
                          </div>

                          {/* Status buttons */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {/* Done (assumed) */}
                            <button onClick={() => setTestStatus(idx, "pending")}
                              className="px-3 py-1.5 rounded-xl text-[11px] font-bold cursor-pointer transition-all border"
                              style={{
                                background: test.lab_status === "pending" ? "rgba(34,197,94,.1)" : "white",
                                borderColor: test.lab_status === "pending" ? "#22C55E" : "#E2E8F0",
                                color: test.lab_status === "pending" ? "#16A34A" : "#94A3B8",
                              }}>
                              ✓ Done
                            </button>
                            <button onClick={() => setTestStatus(idx, "skipped")}
                              className="px-3 py-1.5 rounded-xl text-[11px] font-bold cursor-pointer transition-all border"
                              style={{
                                background: test.lab_status === "skipped" ? "#FFFBEB" : "white",
                                borderColor: test.lab_status === "skipped" ? "#F59E0B" : "#E2E8F0",
                                color: test.lab_status === "skipped" ? "#D97706" : "#94A3B8",
                              }}>
                              ✕ Skip
                            </button>
                            <button onClick={() => setTestStatus(idx, "not_done")}
                              className="px-3 py-1.5 rounded-xl text-[11px] font-bold cursor-pointer transition-all border"
                              style={{
                                background: test.lab_status === "not_done" ? "#FEF2F2" : "white",
                                borderColor: test.lab_status === "not_done" ? "#EF4444" : "#E2E8F0",
                                color: test.lab_status === "not_done" ? "#DC2626" : "#94A3B8",
                              }}>
                              Not Done
                            </button>
                          </div>
                        </div>

                        {/* Notes for skip/not done */}
                        {test.lab_status !== "pending" && (
                          <div className="px-5 pb-3">
                            <input
                              value={test.lab_notes}
                              onChange={e => setTestNotes(idx, e.target.value)}
                              placeholder={test.lab_status === "skipped" ? "Reason patient skipped (optional)…" : "Reason test couldn't be done…"}
                              className="w-full text-[12px] text-[#0B2545] bg-white border border-[#E2E8F0] rounded-xl px-3 py-2 outline-none"
                              style={{ fontFamily: "inherit" }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 3 — Upload Report */}
            {selBooking && tests.length > 0 && (
              <div className="bg-white rounded-2xl border border-[#E2E8F0]" style={{ boxShadow: "0 1px 4px rgba(11,37,69,.06)" }}>
                <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center gap-3">
                  <div className="w-7 h-7 rounded-xl flex items-center justify-center text-white text-xs font-black" style={{ background: "#0B2545" }}>3</div>
                  <p className="text-[14px] font-bold text-[#0B2545]">Upload Report PDF</p>
                </div>
                <div className="p-5 space-y-4">
                  {/* Report type */}
                  <div>
                    <p className="text-[11px] font-bold text-[#7A90B3] uppercase tracking-widest mb-2">Report Type</p>
                    <div className="flex gap-3">
                      {(["partial", "final"] as const).map(t => (
                        <button key={t} onClick={() => setReportType(t)}
                          className="flex-1 py-3 rounded-xl text-[13px] font-bold cursor-pointer transition-all border capitalize"
                          style={{
                            borderColor: reportType === t ? "#22C55E" : "#E2E8F0",
                            background: reportType === t ? "rgba(34,197,94,.06)" : "white",
                            color: reportType === t ? "#16A34A" : "#7A90B3",
                          }}>
                          {t === "partial" ? "📋 Partial" : "✓ Final"}
                        </button>
                      ))}
                    </div>
                    {reportType === "partial" && (
                      <p className="text-[11px] text-amber-600 mt-2 bg-amber-50 px-3 py-2 rounded-xl">
                        Partial → booking stays "Partially Uploaded" until final report
                      </p>
                    )}
                  </div>

                  {/* PDF URL */}
                  <div>
                    <p className="text-[11px] font-bold text-[#7A90B3] uppercase tracking-widest mb-2">
                      Report PDF URL {reportType === "final" ? "*" : "(optional for partial)"}
                    </p>
                    <input
                      value={reportUrl}
                      onChange={e => setReportUrl(e.target.value)}
                      placeholder="https://storage.example.com/reports/CKXXXXXX.pdf"
                      className="w-full text-[13px] text-[#0B2545] bg-white border border-[#E2E8F0] rounded-xl px-4 py-3 outline-none"
                      style={{ fontFamily: "inherit" }}
                      onFocus={e => { e.target.style.borderColor = "#22C55E"; e.target.style.boxShadow = "0 0 0 3px rgba(34,197,94,.1)"; }}
                      onBlur={e => { e.target.style.borderColor = "#E2E8F0"; e.target.style.boxShadow = "none"; }}
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <p className="text-[11px] font-bold text-[#7A90B3] uppercase tracking-widest mb-2">Internal Notes</p>
                    <textarea
                      value={uploadNotes} onChange={e => setUploadNotes(e.target.value)}
                      placeholder="Any notes for the verification team…" rows={2}
                      className="w-full text-[13px] text-[#0B2545] bg-white border border-[#E2E8F0] rounded-xl px-4 py-3 outline-none resize-none"
                      style={{ fontFamily: "inherit" }}
                      onFocus={e => { e.target.style.borderColor = "#22C55E"; e.target.style.boxShadow = "0 0 0 3px rgba(34,197,94,.1)"; }}
                      onBlur={e => { e.target.style.borderColor = "#E2E8F0"; e.target.style.boxShadow = "none"; }}
                    />
                  </div>

                  {/* Summary */}
                  <div className="rounded-xl p-4" style={{ background: "rgba(11,37,69,.03)", border: "1px solid #E2E8F0" }}>
                    <p className="text-[11px] font-bold text-[#7A90B3] uppercase tracking-widest mb-3">Submission Summary</p>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[12px]">
                        <span className="text-[#7A90B3]">Tests completed (in report)</span>
                        <span className="font-bold text-emerald-600">{doneCount} / {tests.length}</span>
                      </div>
                      {skippedCount > 0 && (
                        <div className="flex justify-between text-[12px]">
                          <span className="text-[#7A90B3]">Patient skipped</span>
                          <span className="font-bold text-amber-600">{skippedCount}</span>
                        </div>
                      )}
                      {notDoneCount > 0 && (
                        <div className="flex justify-between text-[12px]">
                          <span className="text-[#7A90B3]">Could not perform</span>
                          <span className="font-bold text-red-600">{notDoneCount}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-[12px] pt-1.5 border-t border-[#E2E8F0] mt-1.5">
                        <span className="text-[#7A90B3]">Booking stage after submit</span>
                        <span className="font-bold text-[#0B2545]">
                          {skippedCount === 0 && notDoneCount === 0 ? "Report Uploaded" : "Partially Uploaded"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={submitReport}
                    disabled={saving || (reportType === "final" && !reportUrl.trim())}
                    className="w-full py-4 rounded-2xl font-bold text-[15px] text-white cursor-pointer transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    style={{ background: "linear-gradient(135deg, #22C55E, #16A34A)", boxShadow: "0 4px 16px rgba(34,197,94,.28)" }}>
                    {saving ? (
                      <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Submitting…</>
                    ) : "↑ Submit Report"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Recent Uploads */}
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-2xl border border-[#E2E8F0]" style={{ boxShadow: "0 1px 4px rgba(11,37,69,.06)" }}>
              <div className="px-5 py-4 border-b border-[#E2E8F0]">
                <p className="text-[14px] font-bold text-[#0B2545]">Recent Uploads</p>
                <p className="text-xs text-[#B0BEC5] mt-0.5">Submitted for verification</p>
              </div>
              {recentUploads.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-3xl mb-3">📄</p>
                  <p className="text-sm text-[#B0BEC5]">No reports uploaded yet</p>
                </div>
              ) : recentUploads.map(b => (
                <div key={b.id} className="flex items-start justify-between px-5 py-4 border-b border-[#F5F7FA] last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[#0B2545] truncate">{b.patient_name}</p>
                    <p className="text-[11px] text-[#7A90B3]">{(b as any).package?.name ?? "—"}</p>
                    <p className="text-[10px] text-[#B0BEC5] mt-0.5">{fmtDate(b.updated_at ?? b.created_at)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 ml-3 flex-shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      b.stage === "Report Uploaded" ? "bg-emerald-50 text-emerald-700"
                      : b.stage === "Partially Uploaded" ? "bg-amber-50 text-amber-700"
                      : "bg-slate-100 text-slate-600"
                    }`}>{b.stage}</span>
                    {b.report_url && (
                      <a href={b.report_url} target="_blank" rel="noreferrer"
                        className="text-[11px] font-semibold text-[#22C55E] hover:text-[#16A34A] cursor-pointer">
                        View PDF →
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Workflow guide */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5" style={{ boxShadow: "0 1px 4px rgba(11,37,69,.06)" }}>
              <p className="text-[13px] font-bold text-[#0B2545] mb-4">Report Flow</p>
              {[
                { step: "1", color: "#3B82F6", title: "Lab submits report", sub: "Marks each test: Done / Skipped / Not Done + uploads PDF" },
                { step: "2", color: "#7C3AED", title: "Verification team reviews", sub: "CRM ops checks each test, marks 'Received' per test" },
                { step: "3", color: "#22C55E", title: "Appointment completed", sub: "All 10 tests marked → booking = 'Reports Received'" },
              ].map(s => (
                <div key={s.step} className="flex items-start gap-3 mb-4 last:mb-0">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[11px] font-black flex-shrink-0" style={{ background: s.color }}>
                    {s.step}
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-[#0B2545]">{s.title}</p>
                    <p className="text-[11px] text-[#7A90B3] mt-0.5">{s.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
