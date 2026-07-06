import { useApp } from '../../context/AppContext'

const TESTIMONIALS = [
  {initials:'PS', name:'Priya Sharma', detail:'Software Engineer · Hitech City', text:"Booked at 8 PM, phlebotomist at my door at 7:30 AM next morning. Report on WhatsApp by 2 PM. Absolutely seamless. Will never walk into a lab again."},
  {initials:'RK', name:'Ravi Krishnan', detail:'Business Owner · Secunderabad', text:"As a diabetic I need quarterly tests. Checkupify saves me so much time and money. The doctor consultation after my report explained every value in plain English."},
  {initials:'AN', name:'Asha Narayanan', detail:'HR Manager · TechCorp India', text:"Enrolled 200 employees through Checkupify. The HR dashboard made scheduling incredibly easy. The anonymised health report helped us plan our wellness programmes."},
]

export function TestimonialsSection() {
  return (
    <section className="section" style={{background:'var(--bg)'}}>
      <div className="container">
        <div style={{textAlign:'center',marginBottom:32}}>
          <span className="sec-tag tag-n" style={{display:'inline-flex',marginBottom:10}}>⭐ Reviews</span>
          <div className="sec-title">50,000+ Happy Patients</div>
          <div className="sec-sub">Real reviews from verified patients</div>
        </div>
        <div className="testi-grid">
          {TESTIMONIALS.map((t,i) => (
            <div key={i} className="testi-card">
              <div className="testi-badge">✓ Verified</div>
              <div className="testi-q">"</div>
              <div className="testi-text">{t.text}</div>
              <div className="testi-author">
                <div className="testi-av">{t.initials}</div>
                <div>
                  <div className="testi-name">{t.name}</div>
                  <div className="testi-detail">{t.detail}</div>
                </div>
                <div className="testi-stars">★★★★★</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function PlansSection() {
  const { openModal } = useApp()
  const plans = [
    {
      name:'Basic', price:'₹999', per:'/year', sub:'Perfect for individuals',
      features:[{ok:true,t:'2 Basic Health Checkups'},{ok:true,t:'10% discount on tests'},{ok:true,t:'WhatsApp report delivery'},{ok:true,t:'1 Doctor consultation'},{ok:false,t:'Priority slots'},{ok:false,t:'Free home collection'}],
      btn:'Get Started', btnClass:'btn-plan-def', feat:false
    },
    {
      name:'Health Plus', price:'₹2,499', per:'/year', sub:'Best for families', pop:'⭐ Most Popular',
      features:[{ok:true,t:'1 Full Body Checkup (₹2,499 value)'},{ok:true,t:'20% discount on all tests'},{ok:true,t:'3 Doctor consultations'},{ok:true,t:'Priority slot booking'},{ok:true,t:'Free home collection (5×)'},{ok:true,t:'WhatsApp + Email reports'}],
      btn:'Subscribe Now', btnClass:'btn-plan-feat', feat:true
    },
    {
      name:'Family Shield', price:'₹4,999', per:'/year', sub:'Up to 4 members',
      features:[{ok:true,t:'Full Body for 4 people'},{ok:true,t:'30% discount on all tests'},{ok:true,t:'Unlimited Doctor consultations'},{ok:true,t:'Priority slots always'},{ok:true,t:'Unlimited home collection'},{ok:true,t:'Dedicated health manager'}],
      btn:'Get Started', btnClass:'btn-plan-def', feat:false
    },
  ]
  return (
    <section className="section" id="plans">
      <div className="container">
        <div style={{textAlign:'center',marginBottom:36}}>
          <span className="sec-tag tag-g" style={{display:'inline-flex',marginBottom:10}}>💎 Health Plans</span>
          <div className="sec-title">Invest in Your Health. Save Every Year.</div>
          <div className="sec-sub">Annual plans with unlimited access to tests, doctor consultations, and priority booking.</div>
        </div>
        <div className="plans-grid">
          {plans.map(p => (
            <div key={p.name} className={`plan-card${p.feat?' feat':''}`}>
              {p.pop && <div className="plan-pop">{p.pop}</div>}
              <div className="plan-name">{p.name}</div>
              <div><span className="plan-price-n">{p.price}</span><span className="plan-price-per">{p.per}</span></div>
              <div className="plan-sub">{p.sub}</div>
              <div className="plan-features">
                {p.features.map(f => <div key={f.t} className={`pf ${f.ok?'pf-ok':'pf-no'}`} style={!f.ok?{color:'var(--muted)'}:{}}>{f.t}</div>)}
              </div>
              <button className={`btn-plan ${p.btnClass}`} onClick={()=>openModal('login')}>{p.btn}</button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
