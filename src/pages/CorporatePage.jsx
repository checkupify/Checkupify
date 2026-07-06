import { useState } from 'react'
import { useSEO } from '../hooks/useSEO'

export default function CorporatePage() {
  useSEO({ title: 'Corporate Health Checkups | Employee Wellness | Checkupify Business', description: 'Affordable corporate health checkup packages for teams. 200+ companies trust Checkupify for employee wellness. Custom packages, HR dashboard, bulk pricing.', canonical: 'https://checkupify.com/corporate' })
  const [form, setForm] = useState({ company:'', name:'', phone:'', email:'', size:'' })
  const [sent, setSent] = useState(false)

  const features = [
    { icon:'📊', title:'HR Dashboard', desc:'Track employee health status, upcoming tests, and report summaries — all from one clean dashboard.' },
    { icon:'💰', title:'Bulk Pricing', desc:'Save 25–40% more when booking for 10+ employees. Custom pricing for large enterprises.' },
    { icon:'🏠', title:'On-Site Collection', desc:'We come to your office. No productivity loss. Phlebotomists at your workplace on schedule.' },
    { icon:'📱', title:'Individual Reports', desc:'Every employee receives their own private, encrypted report. HR never sees individual data.' },
    { icon:'🔒', title:'DPDP Compliant', desc:'Fully compliant with India\'s Digital Personal Data Protection Act. Enterprise-grade security.' },
    { icon:'📋', title:'Fitness Certificates', desc:'Pre-employment health checks with certified fitness certificates for regulatory compliance.' },
  ]

  const packages = [
    { name:'Starter', size:'10–50 employees', price:'₹1,299', per:'per employee', features:['Basic health checkup (20 tests)','Digital reports on WhatsApp','HR summary report','Email support'], highlight:false },
    { name:'Growth', size:'51–200 employees', price:'₹2,199', per:'per employee', features:['Full body checkup (61 tests)','1 Doctor consultation each','HR analytics dashboard','On-site collection','Dedicated account manager'], highlight:true },
    { name:'Enterprise', size:'200+ employees', price:'Custom', per:'contact us', features:['Custom test packages','Quarterly health camps','Anonymous health trend reports','Priority support 24/7','White-label option available'], highlight:false },
  ]

  return (
    <div>
      <div style={{ background:'linear-gradient(135deg,#0A2747,#0d3360)', padding:'80px 0 60px', textAlign:'center' }}>
        <div className="container">
          <span className="sec-tag" style={{ background:'rgba(0,204,142,.15)', color:'var(--g)', display:'inline-flex', marginBottom:16 }}>🏢 Corporate Wellness</span>
          <h1 style={{ fontSize:'clamp(28px,4vw,48px)', fontWeight:800, color:'white', letterSpacing:'-1px', marginBottom:16, lineHeight:1.15 }}>
            Healthy Employees.<br/><span style={{ color:'var(--g)' }}>Healthier Business.</span>
          </h1>
          <p style={{ color:'rgba(255,255,255,.6)', maxWidth:520, margin:'0 auto 32px', fontSize:15, lineHeight:1.7 }}>
            Companies with regular health programs see 30% lower absenteeism and 25% higher productivity. Invest in your team's health — starting at ₹1,299 per employee.
          </p>
          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            <button style={{ background:'var(--g)', color:'var(--ink)', border:'none', borderRadius:10, padding:'13px 28px', fontWeight:700, fontSize:14, cursor:'pointer', fontFamily:'var(--font)' }} onClick={()=>document.getElementById('corp-form').scrollIntoView({behavior:'smooth'})}>
              Get a Custom Quote →
            </button>
            <button style={{ background:'rgba(255,255,255,.1)', color:'white', border:'1px solid rgba(255,255,255,.2)', borderRadius:10, padding:'13px 28px', fontWeight:700, fontSize:14, cursor:'pointer', fontFamily:'var(--font)' }}
              onClick={()=>window.open('https://wa.me/919999999999?text=Hi,+I+am+interested+in+corporate+wellness+packages','_blank')}>
              💬 Chat on WhatsApp
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ background:'white', padding:'36px 0', borderBottom:'1px solid var(--border)' }}>
        <div className="container">
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:24, textAlign:'center' }}>
            {[['200+','Companies Served'],['15,000+','Employees Covered'],['₹1,299','Starting Price'],['48 hrs','Onboarding Time'],['4.9★','Corporate Rating']].map(([n,l])=>(
              <div key={l}><div style={{ fontSize:32, fontWeight:800, color:'var(--g3)', letterSpacing:'-1px' }}>{n}</div><div style={{ fontSize:12, color:'var(--slate)', marginTop:4 }}>{l}</div></div>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="section" style={{ background:'var(--bg)' }}>
        <div className="container">
          <div style={{ textAlign:'center', marginBottom:40 }}>
            <span className="sec-tag tag-n" style={{ display:'inline-flex', marginBottom:10 }}>⚡ Features</span>
            <h2 className="sec-title">Everything Your HR Team Needs</h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:20 }}>
            {features.map(f=>(
              <div key={f.title} style={{ background:'white', border:'1.5px solid var(--border)', borderRadius:14, padding:22, transition:'all .18s' }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--g)';e.currentTarget.style.transform='translateY(-2px)'}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.transform='none'}}>
                <div style={{ fontSize:28, marginBottom:10 }}>{f.icon}</div>
                <div style={{ fontWeight:700, fontSize:14, color:'var(--ink)', marginBottom:6 }}>{f.title}</div>
                <div style={{ fontSize:12, color:'var(--slate)', lineHeight:1.65 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Packages */}
      <div className="section">
        <div className="container">
          <div style={{ textAlign:'center', marginBottom:40 }}>
            <span className="sec-tag tag-g" style={{ display:'inline-flex', marginBottom:10 }}>💎 Plans</span>
            <h2 className="sec-title">Corporate Health Plans</h2>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', gap:20, maxWidth:900, margin:'0 auto' }}>
            {packages.map(p=>(
              <div key={p.name} style={{ background:'white', border:`1.5px solid ${p.highlight?'var(--g)':'var(--border)'}`, borderRadius:18, padding:28, position:'relative', boxShadow:p.highlight?'0 0 0 3px rgba(0,204,142,.1)':undefined }}>
                {p.highlight && <div style={{ position:'absolute', top:-11, left:'50%', transform:'translateX(-50%)', background:'var(--g)', color:'var(--ink)', fontSize:10, fontWeight:700, padding:'3px 14px', borderRadius:20, whiteSpace:'nowrap' }}>⭐ Most Popular</div>}
                <div style={{ fontSize:12, fontWeight:700, color:'var(--slate)', textTransform:'uppercase', letterSpacing:'.5px', marginBottom:6 }}>{p.name}</div>
                <div style={{ fontSize:11, color:'var(--muted)', marginBottom:12 }}>{p.size}</div>
                <div style={{ fontSize:34, fontWeight:800, color:'var(--ink)', letterSpacing:'-1px', marginBottom:2 }}>{p.price}</div>
                <div style={{ fontSize:12, color:'var(--muted)', marginBottom:20 }}>{p.per}</div>
                <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:22 }}>
                  {p.features.map(f=><div key={f} style={{ fontSize:12, color:'var(--slate)', display:'flex', alignItems:'flex-start', gap:6 }}><span style={{ color:'var(--g)', fontWeight:700, flexShrink:0 }}>✓</span>{f}</div>)}
                </div>
                <button onClick={()=>document.getElementById('corp-form').scrollIntoView({behavior:'smooth'})} style={{ width:'100%', padding:11, borderRadius:10, fontSize:13, fontWeight:700, cursor:'pointer', border:'none', background:p.highlight?'var(--g)':'var(--bg)', color:p.highlight?'var(--ink)':'var(--slate)', fontFamily:'var(--font)', transition:'all .15s' }}>
                  {p.price==='Custom'?'Contact Us':'Get Started'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lead Form */}
      <div id="corp-form" style={{ background:'var(--bg)', padding:'64px 0' }}>
        <div className="container" style={{ maxWidth:600 }}>
          <div style={{ textAlign:'center', marginBottom:36 }}>
            <span className="sec-tag tag-g" style={{ display:'inline-flex', marginBottom:10 }}>📋 Get a Quote</span>
            <h2 className="sec-title">Request Corporate Pricing</h2>
            <p className="sec-sub">We'll get back within 2 hours with a custom quote for your team.</p>
          </div>
          <div style={{ background:'white', border:'1.5px solid var(--border)', borderRadius:20, padding:36 }}>
            {sent ? (
              <div style={{ textAlign:'center', padding:'40px 0' }}>
                <div style={{ fontSize:48, marginBottom:16 }}>🎉</div>
                <div style={{ fontSize:20, fontWeight:800, color:'var(--ink)', marginBottom:8 }}>Request Received!</div>
                <div style={{ fontSize:13, color:'var(--slate)' }}>Our corporate team will contact you within 2 hours on your phone/email.</div>
              </div>
            ) : (
              <form onSubmit={e=>{e.preventDefault();setSent(true)}}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <div className="fg"><label>Company Name *</label><input value={form.company} onChange={e=>setForm(f=>({...f,company:e.target.value}))} placeholder="Acme Pvt. Ltd." required /></div>
                  <div className="fg"><label>Your Name *</label><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Ravi Kumar" required /></div>
                  <div className="fg"><label>Phone *</label><input value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} placeholder="9876543210" required /></div>
                  <div className="fg"><label>Work Email *</label><input value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="hr@company.com" required /></div>
                </div>
                <div className="fg">
                  <label>Team Size *</label>
                  <select value={form.size} onChange={e=>setForm(f=>({...f,size:e.target.value}))} required>
                    <option value="">Select team size</option>
                    <option>10–50 employees</option>
                    <option>51–200 employees</option>
                    <option>201–500 employees</option>
                    <option>500+ employees</option>
                  </select>
                </div>
                <button className="modal-btn" type="submit">Request Custom Quote →</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
