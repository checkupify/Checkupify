import { useApp } from '../../context/AppContext'
import { TESTS } from '../../data'
export default function TestsSection() {
  const { startBooking } = useApp()
  return (
    <section className="section" id="tests" style={{background:'var(--bg)'}}>
      <div className="container">
        <div className="sec-head">
          <div>
            <span className="sec-tag tag-n" style={{marginBottom:8,display:'inline-flex'}}>Popular Tests</span>
            <div className="sec-title">Most Booked Tests</div>
            <div className="sec-sub">NABL-certified. Home collection available for all.</div>
          </div>
          <button className="view-all">All 500+ →</button>
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
  )
}
