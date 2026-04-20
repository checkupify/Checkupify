import { useApp } from '../../context/AppContext'
import { OFFERS } from '../../data'

export function TrustBar() {
  const items = [
    { icon:'🛡️', lbl:'NABL Certified Labs', sub:'Every partner accredited' },
    { icon:'📱', lbl:'WhatsApp Reports', sub:'Delivered in 6 hours' },
    { icon:'🏠', lbl:'Free Home Collection', sub:'Phlebotomist visits you' },
    { icon:'💳', lbl:'100% Refund', sub:'If appointment fails' },
    { icon:'⏰', lbl:'Same-Day Slots', sub:'Book until 9 AM' },
  ]
  return (
    <div className="trust">
      <div className="container">
        <div className="trust-inner">
          {items.map((it, i) => (
            <div key={it.lbl} style={{display:'flex',alignItems:'center',gap:12}}>
              {i > 0 && <div className="t-div"/>}
              <div className="ti">
                <div className="ti-icon">{it.icon}</div>
                <div><div className="ti-lbl">{it.lbl}</div><div className="ti-sub">{it.sub}</div></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function QuickActions() {
  const { openModal } = useApp()
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({behavior:'smooth'})
  const actions = [
    {icon:'🧪', name:'Book Lab Test', desc:'500+ tests, home collection', fn:()=>scrollTo('tests')},
    {icon:'👨‍⚕️', name:'Consult Doctor', desc:'Online & in-person', fn:()=>scrollTo('doctors'), primary:true},
    {icon:'💊', name:'Health Packages', desc:'Full body, cardiac, diabetes', fn:()=>scrollTo('packages')},
    {icon:'📋', name:'Upload Prescription', desc:'Get tests prescribed', fn:()=>openModal('login')},
    {icon:'🏢', name:'Corporate Wellness', desc:'For teams & companies', fn:()=>{}},
    {icon:'📊', name:'My Reports', desc:'Download, share anytime', fn:()=>openModal('login')},
  ]
  return (
    <section className="section-sm" style={{background:'var(--bg)'}}>
      <div className="container">
        <div className="qa-grid">
          {actions.map(a => (
            <div key={a.name} className={`qa-card${a.primary?' primary':''}`} onClick={a.fn}>
              <div className="qa-icon">{a.icon}</div>
              <div className="qa-name">{a.name}</div>
              <div className="qa-desc">{a.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function OffersSection() {
  const { addToast } = useApp()
  const copyCode = (code) => navigator.clipboard.writeText(code).then(()=>addToast('success',`Code "${code}" copied!`)).catch(()=>addToast('info',`Code: ${code}`))
  const offers = [
    {cls:'oc-navy', tag:'First Booking', title:'₹200 OFF', desc:'On any test above ₹999', code:'FIRST200'},
    {cls:'oc-green', tag:'Full Body Special', title:'40% OFF', desc:'Full Body Checkup — was ₹4,200', code:'FULL40'},
    {cls:'oc-orange', tag:'Weekend Flash', title:'₹500 FLAT', desc:'Cardiac Screening Package', code:'HEART500'},
    {cls:'oc-purple', tag:'Doctor Consult', title:'First FREE', desc:'With any lab test booking', code:'DOCFREE'},
    {cls:'oc-teal', tag:'Annual Plan', title:'₹999/Year', desc:'Unlimited basic tests + slots', code:'HEALTH999'},
  ]
  return (
    <section className="section-sm">
      <div className="container">
        <div className="sec-head" style={{marginBottom:14}}>
          <div><span className="sec-tag tag-n">🔥 Live Offers</span></div>
          <button className="view-all">See all →</button>
        </div>
        <div className="offers-row">
          {offers.map(o => (
            <div key={o.code} className={`offer-card ${o.cls}`}>
              <div className="offer-tag">{o.tag}</div>
              <div className="offer-title">{o.title}</div>
              <div className="offer-desc">{o.desc}</div>
              <div className="offer-code" onClick={()=>copyCode(o.code)}>{o.code} 📋</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
