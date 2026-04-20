import { useApp } from '../../context/AppContext'
import { DOCTORS } from '../../data'

export default function DoctorsSection() {
  const { startBooking } = useApp()
  return (
    <section className="section" id="doctors">
      <div className="container">
        <div className="sec-head">
          <div>
            <span className="sec-tag tag-n" style={{marginBottom:8,display:'inline-flex'}}>👨‍⚕️ Doctors</span>
            <div className="sec-title">Consult Top-Rated Doctors</div>
            <div className="sec-sub">Online video from ₹299. Instant appointments.</div>
          </div>
          <button className="view-all">All doctors →</button>
        </div>
        <div className="doc-grid">
          {DOCTORS.map(d => (
            <div key={d.id} className="doc-card" onClick={() => startBooking('doctor', d)}>
              <div className="doc-top" style={{background: d.bg}}>
                <div className="doc-av">{d.av}</div>
              </div>
              <div className="doc-body">
                <div className="doc-name">{d.name}</div>
                <div className="doc-spec">{d.spec}</div>
                <div className="doc-exp">{d.exp}</div>
                <div className="doc-avail">
                  <span style={{width:5,height:5,borderRadius:'50%',background:d.avail?'var(--g)':'var(--amber)',display:'inline-block',animation:d.avail?'pulse 2s infinite':undefined}}/>
                  {d.avail ? 'Available now' : (d.availText || 'Booked')}
                </div>
                <div className="doc-stats">
                  <div><div className="ds-val">★ {d.rating}</div></div>
                  <div style={{width:1,background:'var(--border)',margin:'0 4px'}}/>
                  <div><div className="ds-val">{d.consults}</div><div className="ds-lbl">consults</div></div>
                </div>
                <button className="btn-consult" onClick={e=>{e.stopPropagation();startBooking('doctor',d)}}>
                  Consult — ₹{d.fee}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
