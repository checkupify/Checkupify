import { Link } from 'react-router-dom'
import SEOHead from '../components/seo/SEOHead'

const VALUES = [
  {icon:'🎯',title:'Radical Simplicity',text:'Healthcare should be simpler than ordering food. We obsess over removing every unnecessary step from your health journey.'},
  {icon:'🏅',title:'Uncompromising Quality',text:'Every partner lab is NABL accredited. We audit quarterly. Zero tolerance for substandard practices — ever.'},
  {icon:'💬',title:'Full Transparency',text:'The price you see is the price you pay. No hidden fees, no surprise charges. Honest healthcare, period.'},
  {icon:'❤️',title:'Prevention First',text:"We're not a sick-care company. We help you catch problems before they become crises — saving lives and money."},
  {icon:'🤝',title:'Community Trust',text:'50,000 patients trust us with their most personal health data. We treat that responsibility as sacred.'},
  {icon:'🚀',title:'Technology for Good',text:'We use AI and tech not to replace human care, but to make access to great healthcare faster and fairer.'},
]

const TEAM = [
  {name:'Surya Vamshi',role:'Founder & CEO',emoji:'👨‍💼',bg:'linear-gradient(135deg,#f0fdf9,#dcfce7)',note:'Former tech professional turned healthcare rebel. Built Checkupify after his father\'s preventable health scare.'},
  {name:'Dr. Meera Krishnan',role:'Chief Medical Officer',emoji:'👩‍⚕️',bg:'linear-gradient(135deg,#eff6ff,#dbeafe)',note:'MBBS, MD Internal Medicine. 18 years clinical experience. Ensures clinical accuracy across all services.'},
  {name:'Ravi Shankar',role:'Head of Operations',emoji:'👨‍💻',bg:'linear-gradient(135deg,#fdf4ff,#f3e8ff)',note:'Ex-Swiggy operations lead. Built the home collection network across 5 cities in 8 months.'},
  {name:'Ananya Reddy',role:'Head of Product',emoji:'👩‍💻',bg:'linear-gradient(135deg,#fff7ed,#fed7aa)',note:'Product designer obsessed with simplicity. Every click you save on our app is her doing.'},
]

const MILESTONES = [
  {year:'2023',event:'Founded in Hyderabad · First 100 patients'},
  {year:'2024 Q1',event:'Launched in Bangalore & Chennai · ₹1Cr ARR milestone'},
  {year:'2024 Q3',event:'50,000 patients served · 18 partner labs · Series A fundraising'},
  {year:'2025',event:'Delhi & Mumbai launch · AI report analysis · Corporate wellness module'},
  {year:'2026',event:'500,000 patient target · 50 cities · Full-stack health OS'},
]

export default function AboutPage() {
  return (
    <>
      <SEOHead
        title="About Checkupify — India's Trusted Preventive Healthcare Platform"
        description="Learn about Checkupify's mission to make preventive healthcare simple, affordable, and accessible for every Indian family. Founded in Hyderabad. 50,000+ patients served."
        canonical="https://checkupify.com/about"
      />

      {/* Hero */}
      <section style={{background:'linear-gradient(160deg,#f0fdf9,#fff)',padding:'80px 0 64px'}}>
        <div className="container" style={{maxWidth:820,textAlign:'center'}}>
          <span className="sec-tag tag-g" style={{display:'inline-flex',marginBottom:16}}>🏥 Our Story</span>
          <h1 style={{fontSize:'clamp(28px,5vw,48px)',fontWeight:800,color:'var(--ink)',letterSpacing:-1,lineHeight:1.15,marginBottom:20}}>
            We're on a mission to make preventive<br/>healthcare the default for every Indian.
          </h1>
          <p style={{fontSize:17,color:'var(--slate)',lineHeight:1.75,maxWidth:680,margin:'0 auto 32px'}}>
            Checkupify was born from a simple frustration: getting a health checkup in India is harder than it should be. 
            We built the platform we wished existed — simple, fast, honest, and genuinely helpful.
          </p>
          <div style={{display:'flex',gap:16,justifyContent:'center',flexWrap:'wrap'}}>
            <Link to="/founder" style={{textDecoration:'none'}}><button className="btn-book" style={{padding:'12px 24px'}}>Read Founder's Story →</button></Link>
            <Link to="/services" style={{textDecoration:'none'}}><button className="btn-signin" style={{padding:'12px 24px'}}>Explore Services</button></Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{background:'var(--navy)',padding:'48px 0'}}>
        <div className="container">
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:24}}>
            {[['50,000+','Patients Served'],['18+','Partner Labs'],['5','Cities Active'],['4.9★','Average Rating'],['6 hrs','Avg Report Time'],['100%','NABL Certified']].map(([n,l])=>(
              <div key={l} style={{textAlign:'center'}}>
                <div style={{fontSize:32,fontWeight:800,color:'var(--g)',letterSpacing:-1}}>{n}</div>
                <div style={{fontSize:12,color:'rgba(255,255,255,.5)',marginTop:4}}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="section">
        <div className="container" style={{maxWidth:820}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:48,alignItems:'center'}}>
            <div>
              <span className="sec-tag tag-n" style={{display:'inline-flex',marginBottom:12}}>Our Mission</span>
              <h2 className="sec-title" style={{marginBottom:16}}>Healthcare that works<br/>for real people</h2>
              <p style={{color:'var(--slate)',lineHeight:1.75,marginBottom:20}}>
                In India, 92% of people don't get an annual health checkup. Not because they don't care — but because the system 
                makes it unnecessarily hard. Confusing prices. Long waits. Unverified labs. Zero follow-up.
              </p>
              <p style={{color:'var(--slate)',lineHeight:1.75,marginBottom:24}}>
                Checkupify exists to fix that. One booking at a time. We believe that when healthcare is simple and affordable, 
                people use it. And when people use preventive care, lives are saved.
              </p>
              <Link to="/founder" style={{textDecoration:'none'}}>
                <button className="btn-book">Read the Full Story →</button>
              </Link>
            </div>
            <div style={{background:'var(--gpale)',borderRadius:20,padding:32,border:'1.5px solid rgba(0,204,142,.2)'}}>
              <div style={{fontSize:18,fontWeight:800,color:'var(--ink)',marginBottom:20}}>The Problem We Solve</div>
              {[
                ['🔴','Confusing lab choices — hundreds of options, zero trust signals'],
                ['🔴','Price opacity — same test, wildly different prices'],
                ['🔴','Long waits — 2-3 day report delays for routine tests'],
                ['🔴','Poor experience — cold labs, unhelpful staff, paper reports'],
              ].map(([dot,text])=>(
                <div key={text} style={{display:'flex',gap:10,marginBottom:14,fontSize:14,color:'var(--slate)',lineHeight:1.5}}>
                  <span style={{flexShrink:0}}>{dot}</span>{text}
                </div>
              ))}
              <div style={{borderTop:'1px solid rgba(0,204,142,.2)',paddingTop:16,marginTop:8}}>
                <div style={{fontSize:15,fontWeight:700,color:'var(--g3)',marginBottom:8}}>✅ How Checkupify Fixes This</div>
                {['NABL-only labs — zero compromise on quality','Transparent pricing — locked, no surprises','6-hour reports — WhatsApp delivery','Home collection — phlebotomist at your door'].map(t=>(
                  <div key={t} style={{fontSize:13,color:'var(--g3)',marginBottom:6}}>✓ {t}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section" style={{background:'var(--bg)'}}>
        <div className="container">
          <div style={{textAlign:'center',marginBottom:40}}>
            <span className="sec-tag tag-g" style={{display:'inline-flex',marginBottom:10}}>Our Values</span>
            <h2 className="sec-title">What we stand for</h2>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:20}}>
            {VALUES.map(v=>(
              <div key={v.title} style={{background:'white',border:'1.5px solid var(--border)',borderRadius:16,padding:24,transition:'all .2s'}}
                onMouseEnter={e=>e.currentTarget.style.borderColor='var(--g)'}
                onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>
                <div style={{fontSize:28,marginBottom:12}}>{v.icon}</div>
                <div style={{fontWeight:700,fontSize:15,color:'var(--ink)',marginBottom:8}}>{v.title}</div>
                <div style={{fontSize:13,color:'var(--slate)',lineHeight:1.65}}>{v.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section">
        <div className="container">
          <div style={{textAlign:'center',marginBottom:40}}>
            <span className="sec-tag tag-n" style={{display:'inline-flex',marginBottom:10}}>👥 The Team</span>
            <h2 className="sec-title">People behind Checkupify</h2>
            <p className="sec-sub">A team of healthcare obsessives, technologists, and patient advocates.</p>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:20}}>
            {TEAM.map(m=>(
              <div key={m.name} style={{background:'white',border:'1.5px solid var(--border)',borderRadius:16,overflow:'hidden'}}>
                <div style={{height:80,background:m.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:40}}>{m.emoji}</div>
                <div style={{padding:20}}>
                  <div style={{fontWeight:800,fontSize:15,color:'var(--ink)',marginBottom:2}}>{m.name}</div>
                  <div style={{fontSize:11,color:'var(--g3)',fontWeight:600,marginBottom:10}}>{m.role}</div>
                  <div style={{fontSize:12,color:'var(--slate)',lineHeight:1.6}}>{m.note}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section" style={{background:'var(--bg)'}}>
        <div className="container" style={{maxWidth:700}}>
          <div style={{textAlign:'center',marginBottom:40}}>
            <span className="sec-tag tag-g" style={{display:'inline-flex',marginBottom:10}}>📈 Our Journey</span>
            <h2 className="sec-title">From Hyderabad to India</h2>
          </div>
          <div style={{position:'relative',paddingLeft:40}}>
            <div style={{position:'absolute',left:14,top:0,bottom:0,width:2,background:'var(--border)'}}/>
            {MILESTONES.map((m,i)=>(
              <div key={i} style={{position:'relative',marginBottom:32}}>
                <div style={{position:'absolute',left:-29,top:4,width:14,height:14,borderRadius:'50%',background:'var(--g)',border:'2px solid white',boxShadow:'0 0 0 3px rgba(0,204,142,.2)'}}/>
                <div style={{fontSize:11,fontWeight:700,color:'var(--g3)',marginBottom:4,textTransform:'uppercase',letterSpacing:.5}}>{m.year}</div>
                <div style={{fontSize:15,fontWeight:600,color:'var(--ink)'}}>{m.event}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{background:'var(--navy)',padding:'64px 0',textAlign:'center'}}>
        <div className="container">
          <h2 style={{fontSize:'clamp(22px,4vw,36px)',fontWeight:800,color:'white',marginBottom:12,letterSpacing:-.5}}>Join 50,000+ Indians who chose prevention</h2>
          <p style={{color:'rgba(255,255,255,.6)',fontSize:16,marginBottom:32}}>Book your health checkup today. Your future self will thank you.</p>
          <Link to="/services" style={{textDecoration:'none'}}><button className="btn-book" style={{padding:'14px 32px',fontSize:16}}>Book a Health Checkup →</button></Link>
        </div>
      </section>
    </>
  )
}
