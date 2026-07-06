import { Link } from 'react-router-dom'
import SEOHead from '../components/seo/SEOHead'

export default function FounderPage() {
  return (
    <>
      <SEOHead
        title="Founder's Note — Why We Built Checkupify | Surya Vamshi"
        description="Read the authentic story behind Checkupify — why our founder built India's most trusted preventive health platform and the mission to make healthcare simple, affordable, and accessible for every Indian family."
        canonical="https://checkupify.com/founder"
      />
      <div style={{background:'linear-gradient(160deg,#f0fdf9,#fff)',padding:'64px 0 0'}}>
        <div className="container" style={{maxWidth:800}}>
          <div style={{textAlign:'center',marginBottom:48}}>
            <span className="sec-tag tag-g" style={{display:'inline-flex',marginBottom:16}}>💌 Founder's Note</span>
            <h1 style={{fontSize:'clamp(28px,5vw,44px)',fontWeight:800,color:'var(--ink)',letterSpacing:-1,lineHeight:1.15,marginBottom:16}}>
              Why I Built Checkupify
            </h1>
            <p style={{fontSize:16,color:'var(--slate)',lineHeight:1.7,maxWidth:600,margin:'0 auto'}}>
              A personal letter from our founder — written not from a boardroom, but from a hospital waiting room.
            </p>
          </div>

          {/* Author card */}
          <div style={{display:'flex',alignItems:'center',gap:20,background:'white',border:'1.5px solid var(--border)',borderRadius:16,padding:24,marginBottom:48,boxShadow:'var(--sh)'}}>
            <div style={{width:72,height:72,borderRadius:'50%',background:'linear-gradient(135deg,var(--g),var(--navy))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:28,flexShrink:0}}>👨‍💼</div>
            <div>
              <div style={{fontSize:18,fontWeight:800,color:'var(--ink)'}}>Surya Vamshi</div>
              <div style={{fontSize:13,color:'var(--slate)'}}>Founder & CEO, Checkupify · Unicribe Technologies</div>
              <div style={{fontSize:12,color:'var(--muted)',marginTop:4}}>Former tech professional · Health advocate · Son who almost lost his father to a preventable condition</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{background:'white',padding:'0 0 80px'}}>
        <div className="container" style={{maxWidth:780}}>
          <article style={{fontSize:17,lineHeight:1.85,color:'#334155'}}>

            <p style={{fontSize:20,fontWeight:600,color:'var(--ink)',marginBottom:28,marginTop:48}}>
              It started with a phone call I wasn't prepared for.
            </p>

            <p style={{marginBottom:24}}>
              It was a Tuesday evening. I was at my desk in Hyderabad, finishing a late-night sprint on a product feature, when my mother called. 
              She was crying — not dramatically, but that quiet, controlled kind of crying that parents do when they don't want to worry you. 
              My father had been feeling weak for weeks. They had finally visited a lab. The reports showed something alarming — his HbA1c was 
              critically high, his kidneys were showing early strain, and his Vitamin D was dangerously low.
            </p>

            <p style={{marginBottom:24}}>
              He had diabetes. Quietly. Silently. For what the doctors estimated was at least 3 years.
            </p>

            <div style={{background:'var(--gpale)',border:'2px solid rgba(0,204,142,.2)',borderRadius:16,padding:28,margin:'32px 0',position:'relative'}}>
              <div style={{fontSize:48,color:'var(--g)',lineHeight:.8,marginBottom:8,fontFamily:'Georgia,serif'}}>"</div>
              <p style={{fontSize:18,fontWeight:600,color:'var(--ink)',lineHeight:1.65,margin:0}}>
                He wasn't lazy. He wasn't careless. He simply didn't know. Because nobody had told him to get tested. 
                Nobody had made it easy enough for him to care about his own health.
              </p>
            </div>

            <p style={{marginBottom:24}}>
              Here's what broke my heart: getting a simple HbA1c test in India is — or at least was — an exercise in friction. 
              You had to find a lab. Figure out if it's NABL certified. Call to check if they do home collection. Book an appointment 
              that may or may not be honored. Take a half-day off work. Sit in a sterile waiting room next to people who are actually sick. 
              Wait 3 days for a report. Then try to understand what "8.4 mmol/L" even means.
            </p>

            <p style={{marginBottom:24}}>
              My father — like millions of Indian men in their 50s — chose not to deal with this friction. Not because he didn't value his health. 
              But because the system made it feel like a punishment to try.
            </p>

            <h2 style={{fontSize:24,fontWeight:800,color:'var(--ink)',margin:'40px 0 20px',letterSpacing:-.3}}>The Problem Nobody Was Solving the Right Way</h2>

            <p style={{marginBottom:24}}>
              I started researching the Indian diagnostics market. What I found was startling:
            </p>

            <div style={{background:'var(--bg)',borderRadius:14,padding:24,margin:'24px 0'}}>
              {[
                ['₹20,000 Crore+','Indian diagnostics market — growing 12% annually, yet massively fragmented'],
                ['Only 8%','Of Indians get an annual health checkup — compared to 70%+ in developed countries'],
                ['3-4 Days','Average wait time for routine lab reports — in 2024!'],
                ['₹500–₹2000','Price variation for the SAME test across different labs in the same city'],
              ].map(([num,text])=>(
                <div key={num} style={{display:'flex',gap:16,alignItems:'flex-start',marginBottom:16,paddingBottom:16,borderBottom:'1px solid var(--border)'}}>
                  <div style={{fontSize:20,fontWeight:800,color:'var(--g)',flexShrink:0,minWidth:120}}>{num}</div>
                  <div style={{fontSize:14,color:'var(--slate)',lineHeight:1.6}}>{text}</div>
                </div>
              ))}
            </div>

            <p style={{marginBottom:24}}>
              The existing players — big aggregators, hospital chains, standalone labs — were either too expensive, too complex, 
              or not trustworthy enough for the average Indian family. They were building for hospitals, not for humans.
            </p>

            <h2 style={{fontSize:24,fontWeight:800,color:'var(--ink)',margin:'40px 0 20px',letterSpacing:-.3}}>Why I Quit My Job and Bet Everything</h2>

            <p style={{marginBottom:24}}>
              I had a stable tech job. A good salary. A comfortable life. But I couldn't shake the image of my father — a man who worked 
              30 years to give his family a good life — sitting in a hospital bed because a ₹299 test wasn't accessible enough for him to take regularly.
            </p>

            <p style={{marginBottom:24}}>
              I asked myself: <strong style={{color:'var(--ink)'}}>What would it look like if healthcare worked like a great product?</strong>
            </p>

            <p style={{marginBottom:24}}>
              What if booking a health checkup was as simple as ordering food? What if your report arrived on WhatsApp — the app every Indian 
              already uses — within 6 hours? What if you could book a certified phlebotomist to come to your home at 7 AM so you didn't have to 
              miss work? What if the price was transparent, honest, and fair — every single time?
            </p>

            <p style={{marginBottom:24}}>
              That's when I started building Checkupify. From my apartment in Hyderabad. With one laptop, one co-founder, 
              and a burning conviction that preventive healthcare deserved to be redesigned from the ground up.
            </p>

            <h2 style={{fontSize:24,fontWeight:800,color:'var(--ink)',margin:'40px 0 20px',letterSpacing:-.3}}>What Checkupify Stands For</h2>

            <div style={{display:'flex',flexDirection:'column',gap:16,margin:'24px 0'}}>
              {[
                {icon:'🎯', title:'Radical Simplicity', text:'We believe that if a 60-year-old in a Tier 2 city cannot book a health test in under 3 minutes, we have failed. Simplicity is not a feature — it is our foundation.'},
                {icon:'💎', title:'Uncompromising Quality', text:'Every lab on our platform is NABL accredited. We audit them quarterly. We remove anyone who doesn\'t maintain standards — no exceptions, no excuses.'},
                {icon:'💬', title:'Radical Transparency', text:'The price you see is the price you pay. No hidden charges. No "facility fees". No confusion. We believe trust is built one honest transaction at a time.'},
                {icon:'❤️', title:'Preventive First', text:'We are not a sick-care company. We are a preventive-care company. Our mission is to help Indians catch problems early — when they are cheap to fix and easy to manage.'},
              ].map(p=>(
                <div key={p.title} style={{display:'flex',gap:16,background:'white',border:'1.5px solid var(--border)',borderRadius:14,padding:20}}>
                  <div style={{fontSize:28,flexShrink:0}}>{p.icon}</div>
                  <div>
                    <div style={{fontSize:15,fontWeight:700,color:'var(--ink)',marginBottom:4}}>{p.title}</div>
                    <div style={{fontSize:13,color:'var(--slate)',lineHeight:1.65}}>{p.text}</div>
                  </div>
                </div>
              ))}
            </div>

            <h2 style={{fontSize:24,fontWeight:800,color:'var(--ink)',margin:'40px 0 20px',letterSpacing:-.3}}>A Promise, From Me to You</h2>

            <p style={{marginBottom:24}}>
              If you're reading this, you're probably someone who cares — about your health, your family's health, or both. 
              That makes you one of us. Because caring is the first step.
            </p>

            <p style={{marginBottom:24}}>
              I want to make you a promise: Every decision we make at Checkupify will be filtered through one question — 
              <em>"Would this help Surya's father take better care of himself?"</em> If the answer is yes, we build it. If not, we don't.
            </p>

            <p style={{marginBottom:24}}>
              We're just getting started. We have 50,000 patients today. We want to reach 50 million. Not because it makes us a big company — 
              but because 50 million more Indians will get tested, catch issues early, live longer, and spend more time with the people they love.
            </p>

            <p style={{marginBottom:24}}>
              That's the mission. That's why I wake up every morning.
            </p>

            <div style={{background:'var(--navy)',borderRadius:20,padding:36,margin:'40px 0',textAlign:'center'}}>
              <p style={{fontSize:20,fontWeight:700,color:'white',lineHeight:1.6,margin:'0 0 8px'}}>
                "Your health is not a luxury. It is the foundation everything else is built on."
              </p>
              <p style={{fontSize:14,color:'rgba(255,255,255,.5)',margin:0}}>— Surya Vamshi, Founder, Checkupify</p>
            </div>

            <p style={{marginBottom:24}}>
              Thank you for trusting us. Thank you for choosing to take your health seriously. And please — don't wait for a phone call like the one I got. 
              Book your checkup today.
            </p>

            <p style={{fontWeight:700,color:'var(--ink)'}}>With love and purpose,</p>
            <p style={{fontWeight:800,fontSize:18,color:'var(--ink)',marginTop:4}}>Surya Vamshi</p>
            <p style={{color:'var(--muted)',fontSize:13}}>Founder & CEO, Checkupify · Hyderabad, India</p>
          </article>

          <div style={{display:'flex',gap:12,marginTop:48,flexWrap:'wrap'}}>
            <Link to="/services" style={{textDecoration:'none'}}>
              <button className="btn-book" style={{padding:'14px 28px',fontSize:15}}>Book Your Checkup →</button>
            </Link>
            <Link to="/about" style={{textDecoration:'none'}}>
              <button className="btn-signin" style={{padding:'14px 28px',fontSize:15}}>Meet the Team</button>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
