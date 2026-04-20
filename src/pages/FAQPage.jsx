import { useState } from 'react'
import SEOHead, { faqSchema } from '../components/seo/SEOHead'
import { Link } from 'react-router-dom'

const FAQS_ALL = [
  { cat:'Booking', q:'How do I book a lab test on Checkupify?', a:'Go to our services page, search for the test you need, choose home collection or walk-in, pick a date and slot, and pay securely. Your booking confirmation arrives on WhatsApp within 2 minutes.' },
  { cat:'Booking', q:'Can I book for a family member?', a:'Yes. You can book for any family member. During booking, enter the patient\'s details (name, age, gender). Reports are delivered to the phone number you provide for that booking.' },
  { cat:'Booking', q:'How soon can I book a home collection?', a:'Book by 9 AM for same-day home collection. Next-day slots are always available from 6 AM onwards. We cover most residential areas in our partner cities.' },
  { cat:'Reports', q:'How long does it take to get my report?', a:'Most routine tests (CBC, Thyroid, Lipid) are ready within 6 hours of sample collection. Specialized tests like cultures or hormone panels may take 24–48 hours. You\'ll receive the PDF report directly on WhatsApp.' },
  { cat:'Reports', q:'Are my reports password protected?', a:'Yes. Every report PDF is password-protected. Your password is your registered mobile number (without country code). This ensures your health data stays private.' },
  { cat:'Reports', q:'Can I share my report with my doctor?', a:'Absolutely. The WhatsApp PDF is easy to forward. You can also download it and share via email or any other platform. Reports are valid and accepted at all major hospitals.' },
  { cat:'Quality', q:'Are all partner labs NABL certified?', a:'Yes — every single partner lab on Checkupify is NABL (National Accreditation Board for Testing and Calibration Laboratories) accredited. We conduct quarterly audits and immediately remove any lab that fails our standards.' },
  { cat:'Quality', q:'Are the phlebotomists trained?', a:'All our phlebotomists are certified, trained professionals with minimum 2 years of experience. They use disposable, sterile needles and follow strict hygiene protocols for every visit.' },
  { cat:'Payment', q:'What payment methods are accepted?', a:'We accept all UPI apps (GPay, PhonePe, Paytm), debit/credit cards (Visa, Mastercard, Rupay), and net banking. All payments are processed via Razorpay with 256-bit SSL encryption.' },
  { cat:'Payment', q:'Is there a home collection charge?', a:'Home collection is FREE on orders above ₹999. For orders below ₹999, a nominal fee of ₹50 is charged. This fee covers the phlebotomist\'s travel and handling.' },
  { cat:'Payment', q:'What is the refund policy?', a:'We offer a 100% refund if: your booking is not confirmed within 30 minutes, the phlebotomist doesn\'t arrive within 30 minutes of the scheduled time, or you cancel at least 2 hours before your appointment. Refunds are processed within 5–7 business days.' },
  { cat:'Corporate', q:'Do you offer corporate health checkup programs?', a:'Yes! Checkupify Corporate Wellness offers bulk health checkups for teams of any size — from 10 to 10,000 employees. We handle scheduling, collection, and provide an anonymous HR dashboard with aggregate health insights. Contact us for a quote.' },
]

export default function FAQPage() {
  const [open, setOpen] = useState(null)
  const [cat, setCat] = useState('All')
  const cats = ['All', ...new Set(FAQS_ALL.map(f => f.cat))]
  const filtered = cat === 'All' ? FAQS_ALL : FAQS_ALL.filter(f => f.cat === cat)

  return (
    <>
      <SEOHead
        title="FAQ — Frequently Asked Questions | Checkupify Help Centre"
        description="Get answers to all your questions about booking lab tests, health checkups, reports, payments, and home collection on Checkupify."
        canonical="https://checkupify.com/faq"
        schema={faqSchema(FAQS_ALL.map(f=>({q:f.q,a:f.a})))}
      />

      <section style={{background:'linear-gradient(160deg,#f0fdf9,#fff)',padding:'64px 0 48px',textAlign:'center'}}>
        <div className="container" style={{maxWidth:700}}>
          <span className="sec-tag tag-g" style={{display:'inline-flex',marginBottom:16}}>❓ Help Centre</span>
          <h1 style={{fontSize:'clamp(26px,4vw,42px)',fontWeight:800,color:'var(--ink)',letterSpacing:-.8,marginBottom:16}}>Frequently Asked Questions</h1>
          <p style={{fontSize:16,color:'var(--slate)',lineHeight:1.7}}>Find answers to the most common questions about Checkupify's services, booking process, reports, and payments.</p>
        </div>
      </section>

      <section className="section" style={{paddingTop:0}}>
        <div className="container" style={{maxWidth:820}}>
          {/* Category tabs */}
          <div className="pkg-tabs" style={{marginBottom:32}}>
            {cats.map(c=><button key={c} className={`pkg-tab${cat===c?' act':''}`} onClick={()=>setCat(c)}>{c}</button>)}
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 320px',gap:32,alignItems:'start'}}>
            <div>
              {filtered.map((f,i)=>(
                <div key={i} className={`faq-item${open===i?' open':''}`} onClick={()=>setOpen(open===i?null:i)} style={{marginBottom:8}}>
                  <div className="faq-q">
                    {f.q}
                    <div className="faq-arrow">▼</div>
                  </div>
                  {open===i && <div className="faq-a">{f.a}</div>}
                </div>
              ))}
            </div>

            <div className="faq-contact">
              <div style={{fontSize:17,fontWeight:700,color:'var(--ink)'}}>Still have questions?</div>
              <div style={{fontSize:13,color:'var(--slate)'}}>Our health advisors are here 7 AM – 10 PM, 7 days a week.</div>
              {[
                {icon:'💬',name:'Chat on WhatsApp',sub:'Usually replies in 2 minutes',fn:()=>window.open('https://wa.me/919999999999','_blank'),bg:'#e8fff6'},
                {icon:'📞',name:'Call: 1800-XXX-XXXX',sub:'Free helpline · 7 AM – 10 PM',fn:()=>{},bg:'#eff6ff'},
                {icon:'✉️',name:'support@checkupify.com',sub:'Response within 2 hours',fn:()=>window.location.href='mailto:support@checkupify.com',bg:'#fff7ed'},
              ].map(c=>(
                <div key={c.name} className="faq-contact-opt" onClick={c.fn}>
                  <div className="fco-icon" style={{background:c.bg}}>{c.icon}</div>
                  <div><div className="fco-name">{c.name}</div><div className="fco-sub">{c.sub}</div></div>
                </div>
              ))}
              <Link to="/services" style={{textDecoration:'none'}}><button className="btn-book" style={{width:'100%',padding:12,fontSize:13}}>Book a Test Now →</button></Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
