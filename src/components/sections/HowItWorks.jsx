const STEPS = [
  {num:'01', icon:'🔍', title:'Search & Select', desc:'Search by symptom or test name. Filter by location and price.'},
  {num:'02', icon:'📅', title:'Pick Date & Slot', desc:'Home or walk-in. Same-day slots till 9 AM.'},
  {num:'03', icon:'💳', title:'Pay Securely', desc:'UPI, card, EMI. 100% refund guarantee.'},
  {num:'04', icon:'📱', title:'Report on WhatsApp', desc:'PDF report within 6 hours. Doctor consult included.'},
]
export default function HowItWorks() {
  return (
    <section className="how-section">
      <div className="container" style={{position:'relative',zIndex:1}}>
        <div style={{textAlign:'center',marginBottom:40}}>
          <span className="sec-tag" style={{background:'rgba(0,204,142,.15)',color:'var(--g)',display:'inline-flex',marginBottom:10}}>⚡ How It Works</span>
          <div className="sec-title" style={{color:'white'}}>Book in 3 Minutes. Done.</div>
          <div className="sec-sub" style={{color:'rgba(255,255,255,.5)'}}>No paperwork. No waiting. Everything on WhatsApp.</div>
        </div>
        <div className="how-grid">
          {STEPS.map((s,i) => (
            <div key={s.num} className="how-card">
              {i < STEPS.length-1 && <div style={{position:'absolute',right:-8,top:24,fontSize:18,color:'rgba(255,255,255,.2)'}}>→</div>}
              <div className="how-num">{s.num}</div>
              <div className="how-icon">{s.icon}</div>
              <div className="how-title">{s.title}</div>
              <div className="how-desc">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
