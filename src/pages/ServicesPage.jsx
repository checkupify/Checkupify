import { Link } from 'react-router-dom'
import SEOHead from '../components/seo/SEOHead'
import { useApp } from '../context/AppContext'
import { TESTS, PACKAGES } from '../data'

export default function ServicesPage() {
  const { startBooking } = useApp()
  return (
    <>
      <SEOHead
        title="Book Lab Tests & Health Checkup Packages | Checkupify Services"
        description="Browse and book from 500+ lab tests and health checkup packages. Full body checkup from ₹2,499. NABL-certified labs. Home collection. Reports in 6 hours."
        canonical="https://checkupify.com/services"
        keywords="book lab test online, health checkup packages, full body checkup price, blood test home collection, NABL certified lab test"
      />

      {/* Hero */}
      <section style={{background:'linear-gradient(160deg,#f0fdf9,#fff)',padding:'64px 0'}}>
        <div className="container" style={{textAlign:'center'}}>
          <span className="sec-tag tag-g" style={{display:'inline-flex',marginBottom:16}}>🧪 All Services</span>
          <h1 style={{fontSize:'clamp(26px,4.5vw,44px)',fontWeight:800,color:'var(--ink)',letterSpacing:-1,marginBottom:16}}>
            500+ Tests. 6 Packages. 1 Trusted Platform.
          </h1>
          <p style={{fontSize:16,color:'var(--slate)',lineHeight:1.7,maxWidth:600,margin:'0 auto 32px'}}>
            Every test from a NABL-certified lab. Transparent pricing. Home collection available. Reports in 6 hours on WhatsApp.
          </p>
          <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
            {['🏠 Home Collection','✅ NABL Certified','💬 WhatsApp Reports','🔄 Free Cancellation'].map(t=>(
              <span key={t} style={{background:'white',border:'1.5px solid var(--border)',borderRadius:20,padding:'6px 14px',fontSize:12,fontWeight:600,color:'var(--slate)'}}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Tests */}
      <section className="section" style={{background:'var(--bg)'}}>
        <div className="container">
          <div className="sec-head">
            <div>
              <span className="sec-tag tag-n" style={{marginBottom:8,display:'inline-flex'}}>Popular Tests</span>
              <h2 className="sec-title">Most Booked Lab Tests</h2>
              <p className="sec-sub">NABL-certified. Home collection available for all tests.</p>
            </div>
          </div>
          <div className="tests-grid">
            {TESTS.map(t => (
              <div key={t.id} className="test-card" onClick={() => startBooking('test', t)}>
                <div className="tc-top">
                  <div className="tc-icon">{t.icon}</div>
                  <div className="tc-name">{t.name}</div>
                  <div className="tc-params">{t.params}</div>
                  <div className="tc-tags">{t.tags.map(tag => <span key={tag} className="tc-tag">{tag}</span>)}</div>
                  <div className="tc-price">
                    <span className="p-new">₹{t.price}</span>
                    <span className="p-old">₹{t.mrp}</span>
                    <span className="p-disc">{t.disc} OFF</span>
                  </div>
                </div>
                <div className="tc-bot">
                  <div className="tat">⏱ {t.tat}</div>
                  <button className="btn-book-sm" onClick={e=>{e.stopPropagation();startBooking('test',t)}}>Book Now</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className="section">
        <div className="container">
          <div className="sec-head">
            <div>
              <span className="sec-tag tag-g" style={{marginBottom:8,display:'inline-flex'}}>🎯 Health Packages</span>
              <h2 className="sec-title">Complete Health Checkup Packages</h2>
              <p className="sec-sub">Curated by expert doctors. Save 40–60% vs individual tests.</p>
            </div>
          </div>
          <div className="pkgs-grid">
            {PACKAGES.map(p => (
              <div key={p.id} className={`pkg-card${p.feat?' feat':''}`} onClick={() => startBooking('package', p)}>
                {p.feat && <div className="pkg-pop">⭐ Most Popular</div>}
                <div className={`pkg-img ${p.bg}`}>{p.icon}</div>
                <div className="pkg-body">
                  <div className="pkg-name">{p.name}</div>
                  <div className="pkg-sub">{p.sub}</div>
                  <div className="pkg-includes">{p.includes.map(i=><div key={i} className="pkg-inc">{i}</div>)}</div>
                </div>
                <div className="pkg-foot">
                  <div><span className="p-new" style={{fontSize:20}}>₹{p.price}</span> <span className="p-old">₹{p.mrp}</span><br/><span className="p-disc">{p.disc} OFF</span></div>
                  <button className="btn-pkg" onClick={e=>{e.stopPropagation();startBooking('package',p)}}>Book Now</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section" style={{background:'var(--bg)'}}>
        <div className="container">
          <div style={{textAlign:'center',marginBottom:40}}>
            <span className="sec-tag tag-n" style={{display:'inline-flex',marginBottom:10}}>Why Checkupify</span>
            <h2 className="sec-title">The smartest way to get tested</h2>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:20}}>
            {[
              {icon:'🏅',t:'NABL Only Labs',d:'Every partner lab is NABL accredited. We audit quarterly and remove underperformers immediately.'},
              {icon:'💰',t:'Guaranteed Best Price',d:'We negotiate bulk rates with labs and pass 100% of savings to you. No middlemen markup.'},
              {icon:'⚡',t:'6-Hour Reports',d:'Most reports ready in 6 hours. Specialized tests in 24 hours. All delivered on WhatsApp as PDF.'},
              {icon:'🏠',t:'Home Collection',d:'Certified phlebotomist at your door between 6 AM – 8 PM. Free on orders above ₹999.'},
              {icon:'👨‍⚕️',t:'Doctor Consult Included',d:'Full Body and premium packages include free telemedicine consultation to interpret your reports.'},
              {icon:'🔄',t:'100% Refund Guarantee',d:"If we can't deliver — lab fails, phlebotomist doesn't arrive — full refund. Zero questions asked."},
            ].map(w=>(
              <div key={w.t} style={{background:'white',border:'1.5px solid var(--border)',borderRadius:14,padding:22}}>
                <div style={{fontSize:28,marginBottom:10}}>{w.icon}</div>
                <div style={{fontWeight:700,fontSize:14,color:'var(--ink)',marginBottom:6}}>{w.t}</div>
                <div style={{fontSize:12,color:'var(--slate)',lineHeight:1.6}}>{w.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{background:'var(--navy)',padding:'56px 0',textAlign:'center'}}>
        <div className="container">
          <h2 style={{fontSize:'clamp(20px,3.5vw,32px)',fontWeight:800,color:'white',marginBottom:12}}>Not sure which test you need?</h2>
          <p style={{color:'rgba(255,255,255,.6)',marginBottom:28}}>Our health advisors are available 7 AM – 10 PM. Chat with us on WhatsApp and we'll recommend the right tests for you.</p>
          <button className="btn-book" style={{padding:'14px 28px',fontSize:15}} onClick={()=>window.open('https://wa.me/919999999999?text=Hi, I need help choosing a health test','_blank')}>
            💬 Chat with Health Advisor
          </button>
        </div>
      </section>
    </>
  )
}
