import { Link } from 'react-router-dom'

export default function Footer() {
  const yr = new Date().getFullYear()
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div>
            <div className="footer-logo">
              <svg className="footer-logo-mark" viewBox="0 0 100 100" fill="none">
                <circle cx="50" cy="50" r="42" stroke="#00CC8E" strokeWidth="10" strokeLinecap="round" strokeDasharray="226 40" strokeDashoffset="55" fill="none"/>
                <polyline points="24,50 40,66 72,32" stroke="#00CC8E" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
              <div className="footer-logo-name">Checkupify</div>
            </div>
            <div className="footer-desc">India's most trusted preventive healthcare platform. NABL certified labs, WhatsApp reports, home collection — healthcare simplified for every Indian family.</div>
            <div className="footer-socials">
              {['𝕏','in','f','📸'].map(s=><button key={s} className="footer-social">{s}</button>)}
            </div>
          </div>

          <div>
            <div className="footer-col-title">Services</div>
            <div className="footer-links">
              <Link to="/services" className="footer-link" style={{textDecoration:'none'}}>Book Lab Test</Link>
              <Link to="/services" className="footer-link" style={{textDecoration:'none'}}>Health Packages</Link>
              <Link to="/services" className="footer-link" style={{textDecoration:'none'}}>Doctor Consultation</Link>
              <Link to="/services" className="footer-link" style={{textDecoration:'none'}}>Home Collection</Link>
              <Link to="/services" className="footer-link" style={{textDecoration:'none'}}>Corporate Wellness</Link>
            </div>
          </div>

          <div>
            <div className="footer-col-title">Company</div>
            <div className="footer-links">
              <Link to="/about" className="footer-link" style={{textDecoration:'none'}}>About Us</Link>
              <Link to="/founder" className="footer-link" style={{textDecoration:'none'}}>Founder's Note</Link>
              <Link to="/blog" className="footer-link" style={{textDecoration:'none'}}>Health Blog</Link>
              <Link to="/contact" className="footer-link" style={{textDecoration:'none'}}>Partner with Us</Link>
              <Link to="/contact" className="footer-link" style={{textDecoration:'none'}}>Careers</Link>
            </div>
          </div>

          <div>
            <div className="footer-col-title">Support</div>
            <div className="footer-links">
              <Link to="/faq" className="footer-link" style={{textDecoration:'none'}}>Help Centre</Link>
              <Link to="/faq" className="footer-link" style={{textDecoration:'none'}}>Track Booking</Link>
              <Link to="/faq" className="footer-link" style={{textDecoration:'none'}}>Refund Policy</Link>
              <Link to="/privacy-policy" className="footer-link" style={{textDecoration:'none'}}>Privacy Policy</Link>
              <Link to="/terms" className="footer-link" style={{textDecoration:'none'}}>Terms of Service</Link>
            </div>
          </div>

          <div>
            <div className="footer-col-title">Cities</div>
            <div className="footer-links">
              <Link to="/health-checkup-in-hyderabad" className="footer-link" style={{textDecoration:'none'}}>Hyderabad</Link>
              <Link to="/health-checkup-in-bangalore" className="footer-link" style={{textDecoration:'none'}}>Bangalore</Link>
              <Link to="/health-checkup-in-mumbai" className="footer-link" style={{textDecoration:'none'}}>Mumbai</Link>
              <Link to="/health-checkup-in-delhi" className="footer-link" style={{textDecoration:'none'}}>Delhi NCR</Link>
              <Link to="/health-checkup-in-chennai" className="footer-link" style={{textDecoration:'none'}}>Chennai</Link>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-text">© {yr} Unicribe Technologies Pvt. Ltd. · All rights reserved · CIN: U85100TG2024PTC000000</div>
          <div className="footer-certs">
            {['NABL','ISO 9001','SSL','DPDP'].map(c=><div key={c} className="footer-cert">{c}</div>)}
          </div>
        </div>
      </div>
    </footer>
  )
}
