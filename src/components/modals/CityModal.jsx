import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { CITIES } from '../../data'

const CITY_ICONS = { Hyderabad:'🏙️', Secunderabad:'🌆', Warangal:'🏘️', Bengaluru:'🌳', Delhi:'🏛️', Mumbai:'🌊', Chennai:'🌴', Pune:'🏔️' }

export default function CityModal() {
  const { modal, closeModal, selectCity } = useApp()
  const [filter, setFilter] = useState('')
  if (modal !== 'city') return null

  const filtered = CITIES.filter(c => c.toLowerCase().includes(filter.toLowerCase()))

  return (
    <div className={`overlay${modal === 'city' ? ' open' : ''}`} onClick={e => e.target.classList.contains('overlay') && closeModal()}>
      <div className="modal">
        <button className="modal-close" onClick={closeModal}>✕</button>
        <div className="modal-title">Select Your City</div>
        <div className="modal-sub">We'll show the best labs and doctors near you</div>
        <div className="fg"><input placeholder="🔍 Search city…" value={filter} onChange={e => setFilter(e.target.value)}/></div>
        <div className="city-grid">
          {filtered.map(c => (
            <div key={c} className="city-btn" onClick={() => selectCity(c)}>
              <div className="city-btn-icon">{CITY_ICONS[c] || '🏙️'}</div>
              {c}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
