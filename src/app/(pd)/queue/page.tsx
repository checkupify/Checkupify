"use client";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ToastContainer } from "@/components/ui/Toast";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { fmt } from "@/lib/utils";
import type { Booking } from "@/types";

const REJECT_REASONS = ["Slot already booked","Lab unavailable","Patient cancelled","Test not available","Capacity full","Other"];
type Toast = {id:string;message:string;type:"success"|"error"|"info"};

function countdown(createdAt: string) {
  const mins = Math.floor((new Date(createdAt).getTime() + 7200000 - Date.now()) / 60000);
  if (mins <= 0) return { text: "BREACHED", color: "#EF4444", urgent: true };
  if (mins < 30) return { text: `${mins}m left`, color: "#F59E0B", urgent: true };
  return { text: `${Math.floor(mins/60)}h ${mins%60}m`, color: "#22C55E", urgent: false };
}

export default function QueuePage() {
  const [queue, setQueue] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string|null>(null);
  const [confirmB, setConfirmB] = useState<Booking|null>(null);
  const [rejectB, setRejectB] = useState<Booking|null>(null);
  const [reason, setReason] = useState("");
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (m:string,t:Toast["type"]="info") => setToasts(p=>[...p,{id:Math.random().toString(36).slice(2),message:m,type:t}]);

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("bookings")
      .select("*,lab:labs(name),package:packages(name,base_price)")
      .eq("stage","New")
      .order("created_at", { ascending: true });
    if (data) setQueue(data as Booking[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchQueue();
    const timer = setInterval(() => setQueue(q => [...q]), 60000);
    const ch = supabase.channel("queue")
      .on("postgres_changes", {event:"*",schema:"public",table:"bookings"}, fetchQueue)
      .subscribe();
    return () => { clearInterval(timer); supabase.removeChannel(ch); };
  }, [fetchQueue]);

  async function doConfirm() {
    if (!confirmB) return;
    setSaving(confirmB.id);
    const { error } = await supabase.from("bookings").update({
      stage: "Confirmed", confirmed_at: new Date().toISOString(), updated_at: new Date().toISOString()
    }).eq("id", confirmB.id);
    setSaving(null);
    if (error) addToast(error.message, "error");
    else { addToast("✓ Confirmed: " + confirmB.patient_name, "success"); setConfirmB(null); fetchQueue(); }
  }

  async function doReject() {
    if (!rejectB || !reason) { addToast("Select a reason","error"); return; }
    setSaving(rejectB.id);
    const { error } = await supabase.from("bookings").update({
      stage: "Rejected", rejection_reason: reason, updated_at: new Date().toISOString()
    }).eq("id", rejectB.id);
    setSaving(null);
    if (error) addToast(error.message, "error");
    else { addToast("Rejected","info"); setRejectB(null); setReason(""); fetchQueue(); }
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={id=>setToasts(p=>p.filter(t=>t.id!==id))} />

      <Modal open={!!confirmB} onClose={()=>setConfirmB(null)} title="Confirm Booking"
        footer={<><Button variant="outline" onClick={()=>setConfirmB(null)}>Cancel</Button><Button variant="primary" onClick={doConfirm} loading={saving===confirmB?.id}>✓ Confirm</Button></>}>
        {confirmB && (
          <div className="space-y-0.5">
            {[["Patient",confirmB.patient_name],["Package",(confirmB as any).package?.name??"—"],["Date",confirmB.appointment_date],["Slot",confirmB.slot_time?.slice(0,5)??"—"],["Amount",fmt(confirmB.amount)]].map(([k,v])=>(
              <div key={k as string} className="flex justify-between py-2.5 border-b border-[#F5F7FA] last:border-0">
                <span className="text-sm text-[#7A90B3]">{k as string}</span>
                <span className="text-sm font-semibold text-[#0B2545]">{v as string}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mt-3">
              <span className="text-emerald-600">✓</span>
              <p className="text-xs text-emerald-700">Patient gets WhatsApp notification on confirmation</p>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!rejectB} onClose={()=>{setRejectB(null);setReason("");}} title="Reject Booking"
        footer={<><Button variant="outline" onClick={()=>{setRejectB(null);setReason("");}}>Cancel</Button><Button variant="danger" onClick={doReject} loading={saving===rejectB?.id}>Reject</Button></>}>
        <p className="text-sm text-[#7A90B3] mb-4">Select a reason for rejection.</p>
        <div className="space-y-2">
          {REJECT_REASONS.map(r => (
            <button key={r} onClick={()=>setReason(r)}
              className={"w-full text-left px-4 py-3 rounded-xl border text-sm cursor-pointer transition-all " +
                (reason===r ? "border-red-300 bg-red-50 text-red-800 font-medium" : "border-[#E2E8F0] text-[#3D5A80] hover:bg-[#FAFBFD]")}>
              {r}
            </button>
          ))}
        </div>
      </Modal>

      <TopBar title="Confirm Queue" subtitle={`${queue.length} bookings awaiting confirmation`} loading={loading} onRefresh={fetchQueue} />

      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        {/* SLA notice */}
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-4">
          <span className="text-xl flex-shrink-0">⚡</span>
          <div>
            <p className="text-sm font-bold text-amber-800">Confirm within 2 hours of booking time</p>
            <p className="text-xs text-amber-600 mt-0.5">Each breach = ₹400 SLA penalty deducted from payout</p>
          </div>
        </div>

        {loading ? <TableSkeleton rows={5} /> : queue.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-16 text-center">
            <p className="text-4xl mb-4">🎉</p>
            <p className="text-lg font-bold text-[#0B2545]">Queue is clear!</p>
            <p className="text-sm text-[#B0BEC5] mt-2">No pending confirmations</p>
          </div>
        ) : (
          <div className="space-y-3">
            {queue.map(b => {
              const ct = countdown(b.created_at);
              return (
                <div key={b.id} className="bg-white rounded-2xl border p-4 md:p-5"
                  style={{ borderColor: ct.urgent ? "rgba(239,68,68,0.3)" : "#E2E8F0", boxShadow: "0 1px 4px rgba(11,37,69,0.06)" }}>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-[15px] font-bold text-[#0B2545]">{b.patient_name}</p>
                        <span className="font-mono text-[10px] text-[#B0BEC5] bg-[#F0F4F8] px-2 py-0.5 rounded">{b.id.slice(-8)}</span>
                      </div>
                      <p className="text-sm text-[#7A90B3]">{(b as any).package?.name ?? "—"}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[13px] font-black" style={{ color: ct.color }}>{ct.text}</p>
                      <p className="text-[10px] text-[#B0BEC5] mt-0.5">SLA deadline</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs text-[#7A90B3] mb-4">
                    <span>📅 {b.appointment_date}</span>
                    <span>⏰ {b.slot_time?.slice(0,5) ?? "—"}</span>
                    <span>👤 {b.patient_gender}, {b.patient_age}y</span>
                    <span>📱 {b.patient_phone}</span>
                    <span>💳 {fmt(b.amount)}</span>
                    <span>🚗 {b.collection_type}</span>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => setConfirmB(b)} disabled={saving === b.id}
                      className="flex-1 py-3 rounded-xl font-bold text-sm cursor-pointer transition-all border"
                      style={{ background: "rgba(34,197,94,0.08)", borderColor: "rgba(34,197,94,0.3)", color: "#16A34A" }}>
                      {saving === b.id ? "…" : "✓ Confirm Booking"}
                    </button>
                    <button onClick={() => setRejectB(b)}
                      className="px-5 py-3 rounded-xl font-bold text-sm cursor-pointer transition-all border border-red-200 bg-red-50 text-red-600">
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
