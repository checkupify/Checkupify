import { useState } from 'react'
import SEOHead from '../components/seo/SEOHead'
import { useApp } from '../context/AppContext'

export default function ContactPage() {
  const { addToast } = useApp()
  const [form, setForm] = useState({name:'',phone:'',email:'',city:'Hyderabad',subject:'booking',message:''})
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.phone || !form.message) { addToast('error','Please fill all required fields'); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    addToast('success', '✅ Message sent! We\'ll reach out within 2 hours.')
    setForm({name:'',phone:'',email:'',city:'Hyderabad',subject:'booking',message:''})
    setLoading(false)
  }

  const upd = (k, v) => setForm(f=>({...f,[k]:v}))

  return (
    <>
      <SEOHead
        title="Contact Checkupify — Get Help, Partner with Us | 24/7 Support"
        description="Contact Checkupify for health test bookings, corporate wellness, lab partnerships, or any support. WhatsApp, phone, and email support available."
        canonical="https://checkupify.com/contact"
      />

      <section style={{background:'linear-gradient(160deg,#f0fdf9,#fff)',padding:'64px 0 48px'}}>
        <div className="container" style={{textAlign:'center',maxWidth:700}}>
          <span className="sec-tag tag-g" style={{display:'inline-flex',marginBottom:16}}>📬 Get in Touch</span>
          <h1 style={{fontSize:'clamp(26px,4vw,42px)',fontWeight:800,color:'var(--ink)',letterSpacing:-.8,marginBottom:16}}>We're here to help</h1>
          <p style={{fontSize:16,color:'var(--slate)',lineHeight:1.7}}>Whether you need help booking a test, want to partner with us as a lab, or have a question — we respond within 2 hours.</p>
        </div>
      </section>

      <section className="section" style={{paddingTop:0}}>
        <div className="container">
          <div style={{display:'grid',gridTemplateColumns:'1fr 1.4fr',gap:48,alignItems:'start'}}>

            {/* Contact options */}
            <div>
              <div style={{marginBottom:32}}>
                <h2 style={{fontSize:22,fontWeight:800,color:'var(--ink)',marginBottom:20}}>Reach Us Directly</h2>
                {[
                  {icon:'💬',title:'WhatsApp (Fastest)',sub:'Usually replies in 2 minutes',action:()=>window.open('https://wa.me/919999999999','_blank'),btn:'Chat Now',color:'#25d366'},
                  {icon:'📞',title:'Call Us',sub:'1800-XXX-XXXX · Free helpline · 7 AM – 10 PM',action:()=>{},btn:'Call Now',color:'var(--navy)'},
                  {icon:'✉️',title:'Email Support',sub:'support@checkupify.com · Response in 2 hours',action:()=>window.location.href='mailto:support@checkupify.com',btn:'Send Email',color:'var(--blue)'},
                ].map(c=>(
                  <div key={c.title} className="faq-contact-opt" style={{marginBottom:12}} onClick={c.action}>
                    <div style={{width:44,height:44,borderRadius:11,background:'var(--bg)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>{c.icon}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:14,fontWeight:700,color:'var(--ink)'}}>{c.title}</div>
                      <div style={{fontSize:11,color:'var(--muted)'}}>{c.sub}</div>
                    </div>
                    <button style={{background:c.color,color:'white',border:'none',borderRadius:8,padding:'6px 14px',fontSize:11,fontWeight:700,cursor:'pointer',flexShrink:0}}>{c.btn}</button>
                  </div>
                ))}
              </div>

              <div style={{background:'var(--bg)',borderRadius:16,padding:24}}>
                <h3 style={{fontSize:16,fontWeight:700,color:'var(--ink)',marginBottom:16}}>Office Address</h3>
                <p style={{fontSize:13,color:'var(--slate)',lineHeight:1.7}}>
                  Unicribe Technologies Pvt. Ltd.<br/>
                  Jubilee Hills, Road No. 36<br/>
                  Hyderabad, Telangana 500033<br/>
                  India
                </p>
                <p style={{fontSize:12,color:'var(--muted)',marginTop:12}}>⏰ Mon–Sat: 9 AM – 7 PM IST</p>
              </div>

              <div style={{background:'var(--gpale)',border:'1.5px solid rgba(0,204,142,.2)',borderRadius:16,padding:24,marginTop:20}}>
                <h3 style={{fontSize:15,fontWeight:700,color:'var(--ink)',marginBottom:8}}>🏥 Partner with Checkupify</h3>
                <p style={{fontSize:13,color:'var(--slate)',lineHeight:1.65,marginBottom:12}}>Are you a lab, hospital, or clinic? Join our network of 18+ trusted partners and reach 50,000+ patients actively looking for health tests.</p>
                <button className="btn-book" style={{width:'100%',padding:10,fontSize:13}}>Apply as Lab Partner →</button>
              </div>
            </div>

            {/* Form */}
            <div style={{background:'white',border:'1.5px solid var(--border)',borderRadius:20,padding:32,boxShadow:'var(--sh)'}}>
              <h2 style={{fontSize:20,fontWeight:800,color:'var(--ink)',marginBottom:4}}>Send us a message</h2>
              <p style={{fontSize:13,color:'var(--slate)',marginBottom:24}}>We'll get back to you within 2 hours during business hours.</p>
              <form onSubmit={submit}>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                  <div className="fg"><label>Full Name *</label><input placeholder="Rahul Sharma" value={form.name} onChange={e=>upd('name',e.target.value)} required/></div>
                  <div className="fg"><label>Phone *</label><input placeholder="98765 43210" value={form.phone} onChange={e=>upd('phone',e.target.value)} required/></div>
                </div>
                <div className="fg"><label>Email</label><input type="email" placeholder="rahul@company.com" value={form.email} onChange={e=>upd('email',e.target.value)}/></div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                  <div className="fg"><label>City</label>
                    <select value={form.city} onChange={e=>upd('city',e.target.value)}>
                      {['Hyderabad','Bangalore','Mumbai','Delhi','Chennai','Other'].map(c=><option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="fg"><label>I'm enquiring about</label>
                    <select value={form.subject} onChange={e=>upd('subject',e.target.value)}>
                      <option value="booking">Booking a Test</option>
                      <option value="corporate">Corporate Wellness</option>
                      <option value="partner">Lab Partnership</option>
                      <option value="doctor">Doctor Consultation</option>
                      <option value="support">Support / Complaint</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="fg"><label>Message *</label>
                  <textarea placeholder="Tell us how we can help you..." value={form.message} onChange={e=>upd('message',e.target.value)} required style={{minHeight:100,resize:'vertical',padding:'11px 14px',border:'1.5px solid var(--border)',borderRadius:10,fontFamily:'var(--font)',fontSize:14,outline:'none',width:'100%'}}/>
                </div>
                <button type="submit" className="modal-btn" disabled={loading} style={{marginTop:8}}>
                  {loading ? <div className="spinner"/> : 'Send Message →'}
                </button>
                <p style={{fontSize:11,color:'var(--muted)',textAlign:'center',marginTop:10}}>
                  🔒 Your data is encrypted and never shared with third parties. <a href="/privacy-policy" style={{color:'var(--g3)'}}>Privacy Policy</a>
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
