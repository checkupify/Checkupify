import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { PACKAGES } from '../../data'

const TABS = ['all','preventive','cardiac','women','diabetes','senior']

export default function PackagesSection() {
  const { startBooking } = useApp()
  const [activeTab, setActiveTab] = useState('all')
  const filtered = activeTab === 'all' ? PACKAGES : PACKAGES.filter(p => p.cat === activeTab)

  return (
    <section className="section" id="packages" style={{ background:'var(--bg)' }}>
      <div className="container">
        <div className="sec-head">
          <div>
            <span className="sec-tag tag-n">📦 Health Packages</span>
            <div className="sec-title">Comprehensive Health Packages</div>
            <div className="sec-sub">Bundled tests at unbeatable prices</div>
          </div>
        </div>
        <div className="pkg-tabs">
          {TABS.map(tab => (
            <button key={tab} className={`pkg-tab${activeTab === tab ? ' act' : ''}`} onClick={() => setActiveTab(tab)}>
              {tab === 'all' ? '🔥 All Packages' : tab === 'preventive' ? '🛡️ Preventive' : tab === 'cardiac' ? '❤️ Cardiac' : tab === 'women' ? '🌸 Women' : tab === 'diabetes' ? '🍬 Diabetes' : '👴 Senior'}
            </button>
          ))}
        </div>
        <div className="pkgs-grid">
          {filtered.map(p => (
            <div key={p.id} className={`pkg-card${p.feat ? ' feat' : ''}`} onClick={() => startBooking('package', p)}>
              {p.feat && <div className="pkg-pop">⭐ Most Popular</div>}
              <div className={`pkg-img ${p.bg}`}>{p.icon}</div>
              <div className="pkg-body">
                <div className="pkg-name">{p.name}</div>
                <div className="pkg-sub">{p.sub}</div>
                <div className="pkg-includes">
                  {p.includes.map(inc => <div key={inc} className="pkg-inc">{inc}</div>)}
                </div>
              </div>
              <div className="pkg-foot">
                <div>
                  <span className="p-new" style={{ fontSize:20 }}>₹{p.price}</span>{' '}
                  <span className="p-old">₹{p.mrp}</span><br/>
                  <span className="p-disc">{p.disc} OFF</span>
                </div>
                <button className="btn-pkg" onClick={e => { e.stopPropagation(); startBooking('package', p) }}>Book Now</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
