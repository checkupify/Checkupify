import { useState } from 'react'
import { FAQS } from '../../data'

export default function FAQSection() {
  const [open, setOpen] = useState(null)
  const toggle = (i) => setOpen(open === i ? null : i)

  return (
    <section className="section" id="faq" style={{ background:'var(--bg)' }}>
      <div className="container">
        <div style={{ textAlign:'center', marginBottom:36 }}>
          <span className="sec-tag tag-n" style={{ display:'inline-flex', marginBottom:10 }}>💬 FAQ</span>
          <div className="sec-title">Common Questions</div>
        </div>
        <div className="faq-grid">
          <div>
            {FAQS.map((f, i) => (
              <div key={i} className={`faq-item${open === i ? ' open' : ''}`} onClick={() => toggle(i)}>
                <div className="faq-q">
                  {f.q}
                  <span className="faq-arrow">▼</span>
                </div>
                {open === i && <div className="faq-a">{f.a}</div>}
              </div>
            ))}
          </div>
          <div className="faq-contact">
            <div style={{ fontSize:17, fontWeight:700, color:'var(--ink)' }}>Still have questions?</div>
            <div style={{ fontSize:13, color:'var(--slate)' }}>Our health advisors are here 7 AM – 10 PM, 7 days a week.</div>
            <div className="faq-contact-opt" onClick={() => window.open('https://wa.me/919999999999?text=Hi+Checkupify,+I+need+help','_blank')}>
              <div className="fco-icon" style={{ background:'#e8fff6' }}>💬</div>
              <div><div className="fco-name">Chat on WhatsApp</div><div className="fco-sub">Usually replies in 2 minutes</div></div>
            </div>
            <div className="faq-contact-opt">
              <div className="fco-icon" style={{ background:'#eff6ff' }}>📞</div>
              <div><div className="fco-name">Call: 1800-XXX-XXXX</div><div className="fco-sub">Free helpline · 7 AM – 10 PM</div></div>
            </div>
            <div className="faq-contact-opt" onClick={() => window.location.href='mailto:support@checkupify.com'}>
              <div className="fco-icon" style={{ background:'#fff7ed' }}>✉️</div>
              <div><div className="fco-name">support@checkupify.com</div><div className="fco-sub">Response within 2 hours</div></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
