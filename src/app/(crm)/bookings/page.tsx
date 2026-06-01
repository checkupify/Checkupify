"use client";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/Button";
import { StageBadge, SlaBadge } from "@/components/ui/Badge";
import { TableSkeleton } from "@/components/ui/Skeleton";
import { Modal } from "@/components/ui/Modal";
import { Select, Textarea } from "@/components/ui/Input";
import { ToastContainer } from "@/components/ui/Toast";
import { fmt, fmtDate, fmtTime } from "@/lib/utils";
import type { Booking } from "@/types";

const STAGES = ["New","Confirmed","Completed","Pending Reports","Partially Received","Received","Rejected","No Show"];
const REJECT_REASONS = ["Slot already booked","Patient cancelled","Lab unavailable","Duplicate booking","Test not available","Patient unresponsive","Other"];
type Toast = {id:string;message:string;type:"success"|"error"|"info"};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Booking|null>(null);
  const [detailStage, setDetailStage] = useState("");
  const [detailNotes, setDetailNotes] = useState("");
  const [confirmB, setConfirmB] = useState<Booking|null>(null);
  const [rejectB, setRejectB] = useState<Booking|null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const PER = 25;

  const addToast = (message:string, type:Toast["type"]="info") =>
    setToasts(p => [...p, {id:Math.random().toString(36).slice(2), message, type}]);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    const {data, error} = await supabase
      .from("bookings")
      .select("*,lab:labs(name,city,phone),package:packages(name,base_price)")
      .order("created_at",{ascending:false})
      .limit(500);
    if (data) setBookings(data as Booking[]);
    if (error) addToast(error.message,"error");
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchBookings();
    const ch = supabase.channel("bookings").on("postgres_changes",{event:"*",schema:"public",table:"bookings"},fetchBookings).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [fetchBookings]);

  const stageCounts: Record<string,number> = {All:bookings.length};
  bookings.forEach(b => { stageCounts[b.stage] = (stageCounts[b.stage]??0)+1; });

  const filtered = bookings.filter(b => {
    const matchTab = tab === "All" || b.stage === tab;
    const q = search.toLowerCase();
    return matchTab && (!q || b.patient_name.toLowerCase().includes(q) || b.id.toLowerCase().includes(q) || b.patient_phone.includes(q));
  });
  const paged = filtered.slice((page-1)*PER, page*PER);
  const totalPages = Math.ceil(filtered.length/PER);

  async function doConfirm() {
    if (!confirmB) return;
    setSaving(true);
    const {error} = await supabase.from("bookings").update({stage:"Confirmed",confirmed_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq("id",confirmB.id);
    setSaving(false);
    if (error) addToast(error.message,"error");
    else { addToast(`✓ Confirmed: ${confirmB.patient_name}`,"success"); setConfirmB(null); fetchBookings(); }
  }

  async function doReject() {
    if (!rejectB || !rejectReason) { addToast("Select a rejection reason","error"); return; }
    setSaving(true);
    const {error} = await supabase.from("bookings").update({stage:"Rejected",rejection_reason:rejectReason,updated_at:new Date().toISOString()}).eq("id",rejectB.id);
    setSaving(false);
    if (error) addToast(error.message,"error");
    else { addToast("Booking rejected","info"); setRejectB(null); setRejectReason(""); fetchBookings(); }
  }

  async function saveDetail() {
    if (!selected) return;
    setSaving(true);
    const u: any = {stage:detailStage, notes:detailNotes, updated_at:new Date().toISOString()};
    if (detailStage === "Confirmed" && selected.stage !== "Confirmed") u.confirmed_at = new Date().toISOString();
    const {error} = await supabase.from("bookings").update(u).eq("id",selected.id);
    setSaving(false);
    if (error) addToast(error.message,"error");
    else { addToast("Booking updated","success"); setSelected(null); fetchBookings(); }
  }

  function exportCSV() {
    const rows = [
      ["ID","Patient","Phone","Package","Lab","Date","Stage","SLA","Amount"],
      ...filtered.map(b => [b.id,b.patient_name,b.patient_phone,(b as any).package?.name??"",(b as any).lab?.name??"",b.appointment_date,b.stage,b.sla_status,b.amount])
    ];
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(rows.map(r=>r.join(",")).join("\n"));
    a.download = "bookings.csv";
    a.click();
    addToast("CSV exported","success");
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={id=>setToasts(p=>p.filter(t=>t.id!==id))} />

      <Modal open={!!confirmB} onClose={()=>setConfirmB(null)} title="Confirm Booking"
        footer={<><Button variant="outline" onClick={()=>setConfirmB(null)}>Cancel</Button><Button variant="primary" onClick={doConfirm} loading={saving}>✓ Confirm Slot</Button></>}>
        {confirmB && (
          <div className="space-y-0.5">
            {[["Patient",confirmB.patient_name],["Package",(confirmB as any).package?.name??"—"],["Date & Slot",`${confirmB.appointment_date} · ${fmtTime(confirmB.slot_time)}`],["Lab",(confirmB as any).lab?.name??"—"],["Amount",fmt(confirmB.amount)]].map(([k,v]) => (
              <div key={k as string} className="flex justify-between py-3 border-b border-[#F5F7FA] last:border-0">
                <span className="text-sm text-[#7A90B3]">{k as string}</span>
                <span className="text-sm font-semibold text-[#0D1B35]">{v as string}</span>
              </div>
            ))}
            <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mt-3">
              <span className="text-emerald-600 text-sm">✓</span>
              <p className="text-xs text-emerald-700">Patient will receive WhatsApp confirmation</p>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={!!rejectB} onClose={()=>{setRejectB(null);setRejectReason("");}} title="Reject Booking"
        footer={<><Button variant="outline" onClick={()=>{setRejectB(null);setRejectReason("");}}>Cancel</Button><Button variant="danger" onClick={doReject} loading={saving}>Confirm Rejection</Button></>}>
        <div className="space-y-2">
          <p className="text-sm text-[#7A90B3] mb-4">Select a reason for rejection. This will be recorded.</p>
          {REJECT_REASONS.map(r => (
            <button key={r} onClick={()=>setRejectReason(r)}
              className={"w-full text-left px-4 py-3 rounded-xl border text-sm cursor-pointer transition-all " +
                (rejectReason===r ? "border-red-300 bg-red-50 text-red-800 font-medium" : "border-[#E8ECF2] text-[#3D5278] hover:border-[#D1D8E4] hover:bg-[#FAFBFD]")}>
              {r}
            </button>
          ))}
        </div>
      </Modal>

      {/* Detail SlideOver */}
      {selected && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-[#0B1E3D]/30 backdrop-blur-sm" onClick={()=>setSelected(null)} />
          <div className="w-full max-w-xl bg-white shadow-2xl flex flex-col slide-right">
            <div className="flex items-start justify-between px-6 py-5 border-b border-[#E8ECF2]">
              <div>
                <p className="text-[15px] font-bold text-[#0D1B35]">Booking Detail</p>
                <p className="text-xs text-[#A8BACC] mt-0.5 font-mono">{selected.id}</p>
              </div>
              <button onClick={()=>setSelected(null)} className="w-7 h-7 rounded-xl hover:bg-slate-100 flex items-center justify-center text-[#A8BACC] cursor-pointer">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              <div className="bg-[#FAFBFD] rounded-2xl p-4 border border-[#E8ECF2]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-[#22C55E]/10 flex items-center justify-center text-[#22C55E] font-bold text-sm">
                    {selected.patient_name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-[#0D1B35] text-sm">{selected.patient_name}</p>
                    <p className="text-xs text-[#A8BACC]">{selected.patient_gender}, {selected.patient_age} yrs</p>
                  </div>
                </div>
                {[["Phone",selected.patient_phone],["Collection",selected.collection_type],["Corporate",selected.is_corporate?"Yes":"No"]].map(([k,v]) => (
                  <div key={k as string} className="flex justify-between py-2 border-b border-[#F0F4FA] last:border-0">
                    <span className="text-xs text-[#A8BACC]">{k as string}</span>
                    <span className="text-xs font-semibold text-[#3D5278]">{v as string}</span>
                  </div>
                ))}
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#A8BACC] uppercase tracking-widest mb-3">Booking Details</p>
                <div className="space-y-0">
                  {[["Package",(selected as any).package?.name??"—"],["Lab",(selected as any).lab?.name??"—"],["Date",selected.appointment_date],["Slot",fmtTime(selected.slot_time)],["Amount",fmt(selected.amount)]].map(([k,v]) => (
                    <div key={k as string} className="flex justify-between py-2.5 border-b border-[#F5F7FA] last:border-0">
                      <span className="text-sm text-[#7A90B3]">{k as string}</span>
                      <span className="text-sm font-semibold text-[#0D1B35]">{v as string}</span>
                    </div>
                  ))}
                  {selected.report_url && (
                    <a href={selected.report_url} target="_blank" rel="noreferrer"
                      className="flex items-center gap-2 mt-3 text-[#22C55E] hover:text-[#16A34A] text-sm font-semibold">
                      📄 View Report →
                    </a>
                  )}
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-[#A8BACC] uppercase tracking-widest">Update Booking</p>
                <Select label="Stage" value={detailStage} onChange={setDetailStage} options={STAGES.map(s=>({value:s,label:s}))} />
                <Textarea label="Notes" value={detailNotes} onChange={setDetailNotes} placeholder="Internal notes…" />
              </div>
              {selected.rejection_reason && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider mb-1">Rejection Reason</p>
                  <p className="text-sm text-red-700">{selected.rejection_reason}</p>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-[#E8ECF2] flex gap-3">
              <Button variant="outline" onClick={()=>setSelected(null)} className="flex-1">Cancel</Button>
              <Button variant="primary" onClick={saveDetail} loading={saving} className="flex-1">Save Changes</Button>
            </div>
          </div>
        </div>
      )}

      <TopBar title="Bookings" subtitle={`${filtered.length} bookings`} loading={loading} onRefresh={fetchBookings}
        actions={<Button variant="outline" size="sm" onClick={exportCSV}>↓ CSV</Button>} />

      <main className="flex-1 overflow-y-auto p-6">
        <div className="bg-white rounded-2xl border border-[#E8ECF2] overflow-hidden" style={{boxShadow:"0 1px 3px rgba(11,30,61,0.06)"}}>
          <div className="px-5 py-4 border-b border-[#E8ECF2] flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5 bg-[#F5F7FA] border border-[#E8ECF2] rounded-xl px-3.5 py-2 w-80">
              <svg className="w-4 h-4 text-[#A8BACC] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <input className="bg-transparent text-sm text-[#0D1B35] placeholder-[#A8BACC] outline-none flex-1"
                placeholder="Search by name, ID, phone…" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} />
              {search && <button onClick={()=>setSearch("")} className="text-[#A8BACC] hover:text-[#3D5278] cursor-pointer text-sm">✕</button>}
            </div>
          </div>

          {/* Stage tabs */}
          <div className="flex overflow-x-auto border-b border-[#E8ECF2] px-2">
            {["All",...STAGES].map(t => (
              <button key={t} onClick={()=>{setTab(t);setPage(1);}}
                className={"flex items-center gap-1.5 px-4 py-3 text-[12px] font-semibold border-b-2 whitespace-nowrap cursor-pointer transition-all " +
                  (tab===t ? "text-[#22C55E] border-[#22C55E]" : "text-[#A8BACC] border-transparent hover:text-[#3D5278]")}>
                {t}
                <span className={"px-1.5 py-0.5 rounded-full text-[9px] font-bold " +
                  (tab===t ? "bg-[#22C55E]/10 text-[#22C55E]" : "bg-[#F5F7FA] text-[#A8BACC]")}>
                  {stageCounts[t]??0}
                </span>
              </button>
            ))}
          </div>

          {loading ? <TableSkeleton rows={8}/> : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#F0F4FA]">
                    {["Booking ID","Patient","Package","Lab","Date & Slot","Stage","SLA","Amount","Actions"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-[#A8BACC] bg-[#FAFBFD] whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paged.length === 0 ? (
                    <tr><td colSpan={9} className="px-4 py-16 text-center text-sm text-[#A8BACC]">No bookings found</td></tr>
                  ) : paged.map(b => (
                    <tr key={b.id} className="border-b border-[#F5F7FA] hover:bg-[#FAFBFD] transition-colors group">
                      <td className="px-4 py-3.5">
                        <button onClick={()=>{setSelected(b);setDetailStage(b.stage);setDetailNotes(b.notes??"");}}
                          className="font-mono text-[11px] text-[#22C55E] hover:text-[#16A34A] font-bold cursor-pointer">{b.id.slice(-10)}</button>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-[12px] font-semibold text-[#0D1B35]">{b.patient_name}</p>
                        <p className="text-[10px] text-[#A8BACC]">{b.patient_phone} · {b.patient_gender},{b.patient_age}
                          {b.is_corporate && <span className="ml-1 text-[9px] font-bold bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">CORP</span>}
                        </p>
                      </td>
                      <td className="px-4 py-3.5 text-[11px] text-[#7A90B3] max-w-[120px] truncate">{(b as any).package?.name??"—"}</td>
                      <td className="px-4 py-3.5 text-[11px] text-[#7A90B3] max-w-[110px] truncate">{(b as any).lab?.name??"—"}</td>
                      <td className="px-4 py-3.5">
                        <p className="text-[11px] text-[#3D5278] font-medium">{b.appointment_date}</p>
                        <p className="text-[10px] text-[#A8BACC]">{fmtTime(b.slot_time)} · {b.collection_type}</p>
                      </td>
                      <td className="px-4 py-3.5"><StageBadge stage={b.stage}/></td>
                      <td className="px-4 py-3.5"><SlaBadge status={b.sla_status}/></td>
                      <td className="px-4 py-3.5 text-[12px] font-bold text-[#0D1B35]">{fmt(b.amount)}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          {b.stage==="New" && (
                            <>
                              <button onClick={()=>setConfirmB(b)} className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[10px] font-bold cursor-pointer hover:bg-emerald-100">✓</button>
                              <button onClick={()=>setRejectB(b)} className="px-2 py-1 bg-red-50 text-red-600 border border-red-200 rounded-lg text-[10px] cursor-pointer hover:bg-red-100">✕</button>
                            </>
                          )}
                          <button onClick={()=>{setSelected(b);setDetailStage(b.stage);setDetailNotes(b.notes??"");}}
                            className="px-2 py-1 border border-[#E8ECF2] rounded-lg text-[10px] text-[#A8BACC] cursor-pointer hover:border-[#D1D8E4] hover:text-[#3D5278]">→</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-[#F5F7FA]">
              <span className="text-xs text-[#A8BACC]">{(page-1)*PER+1}–{Math.min(page*PER,filtered.length)} of {filtered.length}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="xs" disabled={page<=1} onClick={()=>setPage(p=>p-1)}>← Prev</Button>
                <span className="text-xs text-[#A8BACC] px-2 py-1.5">{page}/{totalPages}</span>
                <Button variant="outline" size="xs" disabled={page>=totalPages} onClick={()=>setPage(p=>p+1)}>Next →</Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
