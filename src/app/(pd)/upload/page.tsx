"use client";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/Button";
import { ToastContainer } from "@/components/ui/Toast";
import { fmt } from "@/lib/utils";
import type { Booking } from "@/types";

type Toast = {id:string;message:string;type:"success"|"error"|"info"};

export default function UploadPage() {
  const [eligible, setEligible] = useState<Booking[]>([]);
  const [recent, setRecent] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selId, setSelId] = useState("");
  const [repType, setRepType] = useState("Final");
  const [url, setUrl] = useState("");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const addToast = (m:string,t:Toast["type"]="info") => setToasts(p=>[...p,{id:Math.random().toString(36).slice(2),message:m,type:t}]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [eRes, rRes] = await Promise.allSettled([
      supabase.from("bookings").select("*,package:packages(name)").in("stage",["Confirmed","Completed","Pending Reports","Partially Received"]).order("appointment_date"),
      supabase.from("bookings").select("*,package:packages(name)").not("report_url","is",null).order("updated_at",{ascending:false}).limit(5),
    ]);
    if (eRes.status==="fulfilled"&&eRes.value.data) setEligible(eRes.value.data as Booking[]);
    if (rRes.status==="fulfilled"&&rRes.value.data) setRecent(rRes.value.data as Booking[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function upload() {
    if (!selId || !url.trim()) { addToast("Select a booking and enter the report URL","error"); return; }
    setSaving(true);
    const newStage = repType === "Partial" ? "Partially Received" : "Received";
    const { error: re } = await supabase.from("reports").insert({ booking_id: selId, type: repType, pdf_url: url, uploaded_at: new Date().toISOString(), ai_parsed: false, visible_to_patient: repType === "Final", whatsapp_sent: false });
    if (re) { setSaving(false); addToast(re.message,"error"); return; }
    await supabase.from("bookings").update({ stage: newStage, report_url: url, updated_at: new Date().toISOString() }).eq("id", selId);
    setSaving(false);
    addToast(`✓ Report uploaded — booking → "${newStage}"`,"success");
    setSelId(""); setUrl("");
    fetchData();
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={id=>setToasts(p=>p.filter(t=>t.id!==id))} />
      <TopBar title="Upload Reports" subtitle="Attach lab reports to bookings" loading={loading} onRefresh={fetchData} />
      <main className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
          {/* Upload form */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5" style={{ boxShadow: "0 1px 4px rgba(11,37,69,0.06)" }}>
            <p className="text-[14px] font-bold text-[#0B2545] mb-1">Upload Report</p>
            <p className="text-xs text-[#B0BEC5] mb-5">Patient notified via WhatsApp on Final upload</p>

            <div className="space-y-4">
              <div>
                <p className="text-[11px] font-bold text-[#7A90B3] uppercase tracking-widest mb-2">Select Booking *</p>
                <div className="border border-[#E2E8F0] rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                  {eligible.length === 0 ? (
                    <div className="p-4 text-sm text-[#B0BEC5]">No eligible bookings</div>
                  ) : eligible.map(b => (
                    <button key={b.id} onClick={() => setSelId(b.id)}
                      className="w-full flex items-center justify-between px-4 py-3 border-b border-[#F5F7FA] last:border-0 text-left cursor-pointer transition-all"
                      style={{ background: selId===b.id ? "rgba(34,197,94,0.06)" : "transparent", borderLeftWidth: selId===b.id ? "3px" : "0", borderLeftColor: "#22C55E", borderLeftStyle: "solid" }}>
                      <div>
                        <p className="text-[12px] font-semibold" style={{ color: selId===b.id ? "#16A34A" : "#0B2545" }}>{b.patient_name}</p>
                        <p className="text-[10px] text-[#B0BEC5]">{b.id.slice(-9)} · {b.appointment_date}</p>
                      </div>
                      {selId===b.id && <span className="text-[#22C55E] text-lg">✓</span>}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[11px] font-bold text-[#7A90B3] uppercase tracking-widest mb-2">Report Type</p>
                <div className="flex gap-2">
                  {["First","Partial","Final"].map(t => (
                    <button key={t} onClick={() => setRepType(t)}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all border"
                      style={{
                        borderColor: repType===t ? "#22C55E" : "#E2E8F0",
                        background: repType===t ? "rgba(34,197,94,0.08)" : "white",
                        color: repType===t ? "#16A34A" : "#7A90B3"
                      }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[11px] font-bold text-[#7A90B3] uppercase tracking-widest mb-2">Report URL *</p>
                <input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://storage.example.com/report.pdf"
                  className="w-full bg-white border border-[#E2E8F0] rounded-xl px-3.5 py-3 text-sm text-[#0B2545] outline-none"
                  onFocus={e=>{e.target.style.borderColor="#22C55E";e.target.style.boxShadow="0 0 0 3px rgba(34,197,94,0.12)";}}
                  onBlur={e=>{e.target.style.borderColor="#E2E8F0";e.target.style.boxShadow="none";}} />
              </div>

              <Button variant="primary" fullWidth onClick={upload} loading={saving} disabled={!selId||!url.trim()}>
                ↑ Upload Report
              </Button>
            </div>
          </div>

          {/* Recent uploads */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5" style={{ boxShadow: "0 1px 4px rgba(11,37,69,0.06)" }}>
            <p className="text-[14px] font-bold text-[#0B2545] mb-4">Recent Uploads</p>
            {recent.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-3xl mb-3">📄</p>
                <p className="text-sm text-[#B0BEC5]">No reports uploaded yet</p>
              </div>
            ) : recent.map(b => (
              <div key={b.id} className="flex items-center justify-between py-3 border-b border-[#F5F7FA] last:border-0">
                <div>
                  <p className="text-[12px] font-semibold text-[#0B2545]">{b.patient_name}</p>
                  <p className="text-[10px] text-[#B0BEC5]">{b.appointment_date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-lg">Uploaded</span>
                  {b.report_url && (
                    <a href={b.report_url} target="_blank" rel="noreferrer" className="text-[#22C55E] text-xs font-medium cursor-pointer">View →</a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
