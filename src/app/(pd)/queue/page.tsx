"use client";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ToastContainer } from "@/components/ui/Toast";
import { fmt } from "@/lib/utils";
import type { Booking } from "@/types";

const REJECT_REASONS = ["Slot already booked","Lab unavailable","Patient cancelled","Test not available","Capacity full","Other"];
type Toast = { id: string; message: string; type: "success" | "error" | "info" };

function SLATimer({ createdAt }: { createdAt: string }) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    const calc = () => {
      const deadline = new Date(createdAt).getTime() + 7200000; // 2 hours
      setRemaining(Math.max(0, deadline - Date.now()));
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [createdAt]);

  const mins = Math.floor(remaining / 60000);
  const secs = Math.floor((remaining % 60000) / 1000);
  const pct = Math.min(100, ((7200000 - remaining) / 7200000) * 100);
  const urgent = remaining < 1800000; // < 30 min
  const breached = remaining === 0;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-[#B0BEC5] uppercase tracking-wider">SLA Deadline</span>
        <span className={`text-[13px] font-black tabular-nums ${breached ? "text-red-600" : urgent ? "text-amber-600" : "text-[#22C55E]"}`}>
          {breached ? "BREACHED" : `${mins}:${String(secs).padStart(2, "0")}`}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-[#F0F4F8] overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${pct}%`,
            background: breached ? "#EF4444" : urgent ? "#F59E0B" : "#22C55E",
          }} />
      </div>
      <p className="text-[10px] text-[#B0BEC5]">
        {breached ? "₹400 penalty applied" : urgent ? "⚠ Confirm immediately" : "2hr SLA window"}
      </p>
    </div>
  );
}

export default function QueuePage() {
  const [queue, setQueue] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [confirmB, setConfirmB] = useState<Booking | null>(null);
  const [rejectB, setRejectB] = useState<Booking | null>(null);
  const [reason, setReason] = useState("");
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (m: string, t: Toast["type"] = "info") =>
    setToasts(p => [...p, { id: Date.now().toString(), message: m, type: t }]);

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("bookings")
      .select("*,lab:labs(name),package:packages(name,base_price)")
      .eq("stage", "New")
      .order("created_at", { ascending: true });
    if (data) setQueue(data as Booking[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchQueue();
    const ch = supabase.channel("pd-queue")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "bookings" }, (p) => {
        addToast(`🔔 New booking: ${(p.new as Booking).patient_name}`, "info");
        fetchQueue();
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "bookings" }, fetchQueue)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [fetchQueue]);

  async function doConfirm() {
    if (!confirmB) return;
    setSaving(confirmB.id);
    const { error } = await supabase.from("bookings").update({
      stage: "Confirmed", confirmed_at: new Date().toISOString(), updated_at: new Date().toISOString()
    }).eq("id", confirmB.id);
    setSaving(null);
    if (error) addToast(error.message, "error");
    else { addToast(`✓ Confirmed: ${confirmB.patient_name}`, "success"); setConfirmB(null); fetchQueue(); }
  }

  async function doReject() {
    if (!rejectB || !reason) { addToast("Select a reason", "error"); return; }
    setSaving(rejectB.id);
    const { error } = await supabase.from("bookings").update({
      stage: "Rejected", rejection_reason: reason, updated_at: new Date().toISOString()
    }).eq("id", rejectB.id);
    setSaving(null);
    if (error) addToast(error.message, "error");
    else { addToast("Rejected", "info"); setRejectB(null); setReason(""); fetchQueue(); }
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={id => setToasts(p => p.filter(t => t.id !== id))} />

      <Modal open={!!confirmB} onClose={() => setConfirmB(null)} title="Confirm Booking"
        footer={<><Button variant="outline" onClick={() => setConfirmB(null)}>Cancel</Button><Button variant="primary" onClick={doConfirm} loading={saving === confirmB?.id}>✓ Confirm Slot</Button></>}>
        {confirmB && (
          <div>
            {[["Patient", confirmB.patient_name], ["Package", (confirmB as any).package?.name ?? "—"], ["Date", confirmB.appointment_date], ["Slot", confirmB.slot_time?.slice(0, 5) ?? "—"], ["Amount", fmt(confirmB.amount)]].map(([k, v]) => (
              <div key={k as string} className="flex justify-between py-2.5 border-b border-[#F5F7FA] last:border-0">
                <span className="text-sm text-[#7A90B3]">{k as string}</span>
                <span className="text-sm font-semibold text-[#0B2545]">{v as string}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mt-3">
              <span className="text-emerald-600">✓</span>
              <p className="text-xs text-emerald-700">Patient gets WhatsApp confirmation automatically</p>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!rejectB} onClose={() => { setRejectB(null); setReason(""); }} title="Reject Booking"
        footer={<><Button variant="outline" onClick={() => { setRejectB(null); setReason(""); }}>Cancel</Button><Button variant="danger" onClick={doReject} loading={saving === rejectB?.id}>Reject</Button></>}>
        <p className="text-sm text-[#7A90B3] mb-3">Select reason for rejection:</p>
        <div className="space-y-2">
          {REJECT_REASONS.map(r => (
            <button key={r} onClick={() => setReason(r)}
              className={"w-full text-left px-4 py-3 rounded-xl border text-sm cursor-pointer transition-all " +
                (reason === r ? "border-red-300 bg-red-50 text-red-800 font-medium" : "border-[#E2E8F0] text-[#3D5A80] hover:bg-[#FAFBFD]")}>
              {r}
            </button>
          ))}
        </div>
      </Modal>

      <TopBar title="Confirm Queue" subtitle={`${queue.length} booking${queue.length !== 1 ? "s" : ""} waiting`} loading={loading} onRefresh={fetchQueue} />

      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-4">
          <span className="text-lg flex-shrink-0">⚡</span>
          <div>
            <p className="text-sm font-bold text-amber-800">Confirm within 2 hours — timer is live</p>
            <p className="text-xs text-amber-600 mt-0.5">₹400 penalty per breach, deducted from monthly payout</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#E2E8F0] p-5 h-40 skeleton" />
            ))}
          </div>
        ) : queue.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-16 text-center" style={{ boxShadow: "0 1px 4px rgba(11,37,69,0.06)" }}>
            <p className="text-5xl mb-4">🎉</p>
            <p className="text-lg font-bold text-[#0B2545]">Queue is empty!</p>
            <p className="text-sm text-[#B0BEC5] mt-2">All bookings confirmed. Great work.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {queue.map(b => {
              const msLeft = new Date(b.created_at).getTime() + 7200000 - Date.now();
              const urgent = msLeft < 1800000;
              return (
                <div key={b.id} className="bg-white rounded-2xl border p-4 md:p-5 transition-all"
                  style={{
                    borderColor: msLeft <= 0 ? "#FCA5A5" : urgent ? "#FCD34D" : "#E2E8F0",
                    boxShadow: "0 1px 4px rgba(11,37,69,0.06)",
                    background: msLeft <= 0 ? "#FEF2F2" : urgent ? "#FFFBEB" : "white",
                  }}>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="text-[15px] font-bold text-[#0B2545]">{b.patient_name}</p>
                        <span className="font-mono text-[10px] text-[#B0BEC5] bg-[#F0F4F8] px-2 py-0.5 rounded">{b.id.slice(-8)}</span>
                        {urgent && msLeft > 0 && <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">URGENT</span>}
                        {msLeft <= 0 && <span className="text-[10px] font-bold bg-red-100 text-red-800 px-2 py-0.5 rounded-full">BREACHED</span>}
                      </div>
                      <p className="text-sm text-[#7A90B3]">{(b as any).package?.name ?? "—"}</p>
                    </div>
                    <div className="w-full sm:w-48 flex-shrink-0">
                      <SLATimer createdAt={b.created_at} />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 text-xs text-[#7A90B3] mb-4 bg-[#F5F7FA] rounded-xl px-3 py-2.5">
                    <span>📅 {b.appointment_date}</span>
                    <span>⏰ {b.slot_time?.slice(0, 5) ?? "—"}</span>
                    <span>👤 {b.patient_gender}, {b.patient_age}y</span>
                    <span>📱 {b.patient_phone}</span>
                    <span className="font-semibold text-[#0B2545]">💳 {fmt(b.amount)}</span>
                    <span>🚗 {b.collection_type}</span>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => setConfirmB(b)} disabled={saving === b.id}
                      className="flex-1 py-3 rounded-xl font-bold text-sm cursor-pointer transition-all text-white disabled:opacity-50"
                      style={{ background: "linear-gradient(135deg, #22C55E, #16A34A)", boxShadow: "0 4px 12px rgba(34,197,94,0.25)" }}>
                      {saving === b.id ? "Processing…" : "✓ Confirm Booking"}
                    </button>
                    <button onClick={() => setRejectB(b)}
                      className="px-5 py-3 rounded-xl font-bold text-sm cursor-pointer transition-all border border-red-200 bg-red-50 text-red-600 hover:bg-red-100">
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
