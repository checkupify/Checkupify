import { LABS } from '../../data'
export default function LabsSection() {
  return (
    <section className="section" style={{background:'var(--bg)'}}>
      <div className="container">
        <div className="sec-head">
          <div>
            <span className="sec-tag tag-n" style={{marginBottom:8,display:'inline-flex'}}>🏥 Partner Labs</span>
            <div className="sec-title">NABL-Certified Partner Labs</div>
            <div className="sec-sub">All verified, rated by 50,000+ patients</div>
          </div>
          <button className="view-all">View all →</button>
        </div>
        <div className="labs-row">
          {LABS.map(l => (
            <div key={l.id} className="lab-card">
              <div className="lab-logo">{l.icon}</div>
              <div className="lab-name">{l.name}</div>
              <div className="lab-loc">📍 {l.loc}</div>
              <div className="lab-certs">
                {l.nabl && <span className="nabl">NABL</span>}
                {l.iso && <span className="iso">ISO</span>}
              </div>
              <div className="lab-rating">★ {l.rating} <span style={{fontSize:10,color:'var(--muted)'}}>({l.reviews} reviews)</span></div>
              <div className="lab-tat">⚡ Reports in {l.tat}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
