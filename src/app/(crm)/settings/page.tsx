"use client";
import { TopBar } from "@/components/layout/TopBar";

export default function SettingsPage() {
  return (
    <>
      <TopBar title="Settings" subtitle="Platform configuration & information"/>
      <main className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-2 gap-5 max-w-4xl">
          {[
            {title:"Platform Status", rows:[["Supabase","lguoussmsusadvmexjkb","✓ ACTIVE"],["Region","ap-northeast-1 (Tokyo)",""],["Auth Fix","email_change NULL resolved","✓ FIXED"],["SLA Cron","Every 5 minutes","✓ RUNNING"]] as [string,string,string][]},
            {title:"SLA Configuration", rows:[["Confirmation TAT","< 2 hours","₹400/breach"],["First Report TAT","< 6 hours","₹600/breach"],["Full Report TAT","< 36 hours","₹1,000/breach"],["Rejection Rate","< 2% MTD","Quality impact"]] as [string,string,string][]},
            {title:"Portal Access", rows:[["CRM","crm.checkupify.com","→ deploy-crm"],["PD","pd.checkupify.com","→ deploy-pd"],["Website","www.checkupify.com","→ deploy-web"]] as [string,string,string][]},
            {title:"Demo Credentials", rows:[["CRM Ops","ops@checkupify.com",""],["Provider","lab@checkupify.com",""],["Admin","admin@checkupify.com",""],["Password","Checkupify@2026",""]] as [string,string,string][]},
          ].map(({title, rows}) => (
            <div key={title} className="bg-white rounded-2xl border border-[#E8ECF2] p-5" style={{boxShadow:"0 1px 3px rgba(11,30,61,0.06)"}}>
              <p className="text-sm font-bold text-[#0D1B35] mb-4">{title}</p>
              <div className="space-y-0">
                {rows.map(([k,v,s]) => (
                  <div key={k} className="flex items-center justify-between py-2.5 border-b border-[#F5F7FA] last:border-0">
                    <span className="text-sm text-[#7A90B3]">{k}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[#3D5278]">{v}</span>
                      {s && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">{s}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
