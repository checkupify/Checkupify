import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useApp } from '../../context/AppContext'

const NAV = [
  { label:'Home', to:'/' },
  { label:'Services', to:'/services' },
  { label:'Doctors', to:'/#doctors' },
  { label:'About', to:'/about' },
  { label:'Blog', to:'/blog' },
  { label:'Contact', to:'/contact' },
]

export default function Navbar() {
  const { city, openModal, user } = useApp()
  const { pathname } = useLocation()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', h, { passive:true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  const isAct = (to) => to === '/' ? pathname === '/' : pathname.startsWith(to)

  return (
    <nav className="nav" style={scrolled?{boxShadow:'0 4px 24px rgba(15,23,42,.12)'}:{}}>
      <div className="container">
        <div className="nav-inner">
          <Link to="/" className="logo" style={{textDecoration:'none'}}>
            <svg width="38" height="38" viewBox="0 0 100 100" fill="none">
              <circle cx="50" cy="50" r="42" stroke="#00CC8E" strokeWidth="10" strokeLinecap="round" strokeDasharray="226 40" strokeDashoffset="55" fill="none"/>
              <polyline points="24,50 40,66 72,32" stroke="#00CC8E" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
            <span className="logo-text">Checkup<span>ify</span></span>
          </Link>

          <button className="nav-city" onClick={() => openModal('city')}>📍 {city} ▾</button>

          <div className="nav-links">
            {NAV.map(l => (
              l.to.includes('#') ?
                <button key={l.label} className="nav-link" onClick={() => { window.location.href = l.to }}>{l.label}</button> :
                <Link key={l.label} to={l.to} className={`nav-link${isAct(l.to)?' act':''}`} style={{textDecoration:'none'}}>{l.label}</Link>
            ))}
          </div>

          <div className="nav-r">
            {user ?
              <button className="btn-signin" onClick={() => openModal('account')}>👤 My Account</button> :
              <button className="btn-signin" onClick={() => openModal('login')}>Sign In</button>
            }
            <Link to="/services" style={{textDecoration:'none'}}>
              <button className="btn-book">Book a Test</button>
            </Link>
            <button className="hamburger" onClick={() => openModal('drawer')}>☰</button>
          </div>
        </div>
      </div>
    </nav>
  )
}
