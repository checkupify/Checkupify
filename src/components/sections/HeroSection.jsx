import { useState, useRef, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import { TESTS, PACKAGES } from '../../data'

const ALL_SEARCHABLE = [
  ...TESTS.map(t => ({ ...t, type: 'test' })),
  ...PACKAGES.map(p => ({ ...p, type: 'package' })),
]

const PILLS = ['🧪 Full Body Checkup','💉 Diabetes Panel','🦋 Thyroid Test','☀️ Vitamin D','🩸 CBC Test','❤️ Lipid Profile']

export default function HeroSection() {
  const { startBooking, openModal } = useApp()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (!searchRef.current?.contains(e.target)) setShowResults(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSearch = (val) => {
    setQuery(val)
    if (val.trim().length < 2) { setResults([]); setShowResults(false); return }
    const filtered = ALL_SEARCHABLE.filter(i => i.name.toLowerCase().includes(val.toLowerCase())).slice(0, 6)
    setResults(filtered)
    setShowResults(filtered.length > 0)
  }

  const pickResult = (item) => {
    setQuery(item.name); setShowResults(false); startBooking(item.type, item)
  }

  return (
    <section className="hero" id="hero">
      <div className="container">
        <div className="hero-grid">
          <div>
            <div className="hero-tag">🇮🇳 India's Fastest Growing Health Platform</div>
            <h1 className="hero-h">
              Healthcare<br/>in <span className="g">3 Clicks.</span><br/>Results in 6 hrs.
            </h1>
            <p className="hero-p">
              Book lab tests from NABL-certified labs, consult top doctors, and get WhatsApp reports — all from home. No queues, no stress.
            </p>
            <div className="search-wrap" ref={searchRef}>
              <div className="search-box">
                <div className="search-in">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:18,height:18,minWidth:18,color:'var(--muted)',flexShrink:0}}>
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input
                    placeholder="Search tests, symptoms, doctors…"
                    value={query}
                    onChange={e => handleSearch(e.target.value)}
                    onFocus={() => query.length >= 2 && setShowResults(true)}
                  />
                </div>
                <button className="search-btn">Search</button>
              </div>
              {showResults && results.length > 0 && (
                <div className="search-results">
                  {results.map(r => (
                    <div key={r.id} className="sr-item" onClick={() => pickResult(r)}>
                      <span className="sr-icon">{r.icon}</span>
                      <div>
                        <div className="sr-name">{r.name}</div>
                        <div className="sr-cat">{r.type === 'test' ? r.params : r.sub}</div>
                      </div>
                      <div className="sr-price">₹{r.price}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="pills">
              {PILLS.map(p => (
                <button key={p} className="pill" onClick={() => handleSearch(p.replace(/^[^ ]+ /,''))}>{p}</button>
              ))}
            </div>
            <div className="hero-stats">
              <div className="hs"><div className="hs-n">50<span>K+</span></div><div className="hs-l">Happy Patients</div></div>
              <div className="hs-div"/>
              <div className="hs"><div className="hs-n">18<span>+</span></div><div className="hs-l">Partner Labs</div></div>
              <div className="hs-div"/>
              <div className="hs"><div className="hs-n">500<span>+</span></div><div className="hs-l">Tests Available</div></div>
              <div className="hs-div"/>
              <div className="hs"><div className="hs-n">4.9<span>★</span></div><div className="hs-l">App Rating</div></div>
            </div>
          </div>
          <div className="hero-right">
            <div className="float-badge fb1"><div className="fb-icon">🏥</div><div className="fb-text">NABL Certified</div><div className="fb-sub">18 partner labs</div></div>
            <div className="float-badge fb3"><div style={{fontSize:12,color:'var(--amber)'}}>★★★★★</div><div className="fb-text">4.9 / 5</div><div className="fb-sub">50K+ reviews</div></div>
            <div className="phone-wrap">
              <div className="phone-notch"/>
              <div className="phone-screen">
                <div className="ph-top">
                  <div className="ph-top-lbl">✅ Booking Confirmed</div>
                  <div className="ph-top-val">Full Body Checkup</div>
                  <div className="ph-track">
                    <div className="ph-track-item"><div className="ph-dot" style={{background:'white'}}/><div className="ph-track-text">HealthFirst Labs confirmed</div><div className="ph-track-time">Now</div></div>
                    <div className="ph-track-item" style={{background:'rgba(255,255,255,.08)'}}><div className="ph-dot" style={{background:'rgba(255,255,255,.3)'}}/><div className="ph-track-text" style={{opacity:.6}}>Sample collection at 9:00 AM</div><div className="ph-track-time" style={{opacity:.5}}>Today</div></div>
                    <div className="ph-track-item" style={{background:'rgba(255,255,255,.08)'}}><div className="ph-dot" style={{background:'rgba(255,255,255,.3)'}}/><div className="ph-track-text" style={{opacity:.6}}>Report on WhatsApp</div><div className="ph-track-time" style={{opacity:.5}}>~3 PM</div></div>
                  </div>
                </div>
                <div className="ph-body">
                  <div className="ph-card">
                    <div className="ph-card-icon">🩸</div>
                    <div><div className="ph-card-name">CBC + Lipid Profile</div><div className="ph-card-sub">12 tests · NABL</div></div>
                    <div className="ph-card-price">₹599</div>
                  </div>
                  <div className="ph-card" style={{background:'#eff6ff'}}>
                    <div className="ph-card-icon" style={{background:'#3b82f6'}}>👨‍⚕️</div>
                    <div><div className="ph-card-name">Dr. Priya Rao</div><div className="ph-card-sub">Internal Medicine</div></div>
                    <div className="ph-card-price" style={{color:'#2563eb'}}>₹299</div>
                  </div>
                  <div className="ph-btn" onClick={() => openModal('login')}>🎉 Book in 30 seconds</div>
                </div>
              </div>
            </div>
            <div className="float-badge fb2"><div className="fb-icon">⚡</div><div className="fb-text">6hr Reports</div><div className="fb-sub">WhatsApp delivery</div></div>
          </div>
        </div>
      </div>
    </section>
  )
}
