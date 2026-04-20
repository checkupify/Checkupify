import { useApp } from '../context/AppContext'
import { useSEO } from '../hooks/useSEO'
import { DOCTORS } from '../data'
export default function DoctorsPage() {
  const { startBooking } = useApp()
  useSEO({ title:'Consult a Doctor Online | Video Consultation from ₹299 | Checkupify', description:'Consult top-rated specialists online in 15 minutes. Internal medicine, cardiology, gynaecology, endocrinology. Video consultation from ₹299.', canonical:'https://checkupify.com/doctors' })
  return (
    <div>
      <div style={{ background:'linear-gradient(135deg,var(--navy),var(--navy2))', padding:'64px 0', textAlign:'center' }}>
        <div className="container">
          <span className="sec-tag" style={{ background:'rgba(0,204,142,.15)', color:'var(--g)', display:'inline-flex', marginBottom:16 }}>👨‍⚕️ Online Consultation</span>
          <h1 style={{ fontSize:'clamp(26px,4vw,44px)', fontWeight:800, color:'white', letterSpacing:'-1px', marginBottom:12 }}>Top Doctors.<br/>15 Minutes Away.</h1>
          <p style={{ color:'rgba(255,255,255,.6)', maxWidth:480, margin:'0 auto', fontSize:15 }}>Video consult with verified specialists from your phone. No travel, no waiting. Prescription included.</p>
        </div>
      </div>
      <div className="section">
        <div className="container">
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:16 }}>
            {DOCTORS.map(d=>(
              <div key={d.id} className="doc-card" onClick={()=>startBooking('doctor',d)}>
                <div className="doc-top" style={{ background:d.bg }}><div className="doc-av">{d.av}</div></div>
                <div className="doc-body">
                  <div className="doc-name">{d.name}</div>
                  <div className="doc-spec">{d.spec}</div>
                  <div className="doc-exp">{d.exp}</div>
                  <div className="doc-avail"><span style={{ width:5,height:5,borderRadius:'50%',background:d.avail?'var(--g)':'var(--amber)',display:'inline-block' }}/>{d.avail?'Available now':d.availText}</div>
                  <div className="doc-stats"><div className="ds-val">★ {d.rating}</div><div style={{ width:1,background:'var(--border)',margin:'0 4px' }}/><div><div className="ds-val">{d.consults}</div><div className="ds-lbl">consults</div></div></div>
                  <button className="btn-consult" onClick={e=>{e.stopPropagation();startBooking('doctor',d)}}>Consult — ₹{d.fee}</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
