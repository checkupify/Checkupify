import { Link } from 'react-router-dom'
import SEOHead from '../../components/seo/SEOHead'
import { useApp } from '../../context/AppContext'
import { TESTS, PACKAGES } from '../../data'

const CITY_DATA = {
  Hyderabad:{areas:['Jubilee Hills','Banjara Hills','Madhapur','Kondapur','Ameerpet','Secunderabad','HITEC City','Gachibowli'],labs:6,icon:'🏙️',tagline:'Hyderabad\'s Most Trusted Health Checkup Service'},
  Bangalore:{areas:['Koramangala','Indiranagar','Whitefield','Electronic City','HSR Layout','BTM Layout','Jayanagar','Rajajinagar'],labs:4,icon:'🌳',tagline:'Bangalore\'s Most Reliable Lab Test Booking Platform'},
  Mumbai:{areas:['Andheri','Bandra','Powai','Lower Parel','Thane','Navi Mumbai','Borivali','Mulund'],labs:5,icon:'🌊',tagline:'Mumbai\'s Fastest Home Collection Health Service'},
  Delhi:{areas:['Connaught Place','Dwarka','Rohini','Lajpat Nagar','Noida','Gurgaon','Faridabad','Greater Noida'],labs:4,icon:'🏛️',tagline:'Delhi NCR\'s #1 Preventive Health Checkup Platform'},
  Chennai:{areas:['Anna Nagar','Adyar','Velachery','T. Nagar','Tambaram','Porur','Chromepet','Perambur'],labs:3,icon:'🌴',tagline:'Chennai\'s Trusted Lab Test & Health Checkup Service'},
}

export default function CityPage({ city }) {
  const { startBooking } = useApp()
  const d = CITY_DATA[city] || CITY_DATA.Hyderabad
  const slug = `/health-checkup-in-${city.toLowerCase()}`

  const schema = {
    '@context':'https://schema.org',
    '@type':'MedicalOrganization',
    name:`Checkupify ${city}`,
    url:`https://checkupify.com${slug}`,
    address:{
      '@type':'PostalAddress',
      addressLocality:city,
      addressCountry:'IN'
    },
    areaServed:d.areas.map(a=>({'@type':'City',name:`${a}, ${city}`})),
    aggregateRating:{'@type':'AggregateRating',ratingValue:'4.9',reviewCount:'5000',bestRating:'5'}
  }

  return (
    <>
      <SEOHead
        title={`Health Checkup in ${city} | Book Lab Tests at Home | Checkupify`}
        description={`Book NABL-certified health checkups and lab tests in ${city}. Home collection available across ${d.areas.slice(0,4).join(', ')} and more. Reports in 6 hours on WhatsApp. Trusted by thousands in ${city}.`}
        keywords={`health checkup ${city}, lab test ${city}, blood test home collection ${city}, full body checkup ${city}, NABL certified lab ${city}`}
        canonical={`https://checkupify.com${slug}`}
        schema={schema}
      />

      {/* Hero */}
      <section style={{background:'linear-gradient(160deg,#f0fdf9,#fff)',padding:'64px 0'}}>
        <div className="container">
          <div style={{display:'grid',gridTemplateColumns:'1fr auto',gap:32,alignItems:'center'}}>
            <div>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:16}}>
                <span style={{fontSize:32}}>{d.icon}</span>
                <span className="sec-tag tag-g">📍 {city}</span>
              </div>
              <h1 style={{fontSize:'clamp(26px,4.5vw,48px)',fontWeight:800,color:'var(--ink)',letterSpacing:-1,lineHeight:1.15,marginBottom:16}}>
                Health Checkups in {city}<br/>
                <span style={{color:'var(--g)'}}>At Your Doorstep.</span>
              </h1>
              <p style={{fontSize:16,color:'var(--slate)',lineHeight:1.7,maxWidth:560,marginBottom:24}}>
                Book NABL-certified lab tests, full body health checkups, and doctor consultations in {city}. 
                Phlebotomist visits your home. Reports in 6 hours on WhatsApp.
              </p>
              <div style={{display:'flex',gap:12,flexWrap:'wrap',marginBottom:28}}>
                <Link to="/services" style={{textDecoration:'none'}}><button className="btn-book" style={{padding:'13px 26px',fontSize:15}}>Book Test in {city} →</button></Link>
                <button className="btn-signin" style={{padding:'13px 26px',fontSize:15}} onClick={()=>window.open('https://wa.me/919999999999','_blank')}>💬 Chat with Us</button>
              </div>
              <div style={{display:'flex',gap:20,flexWrap:'wrap'}}>
                {[`${d.labs}+ Partner Labs`,`6 hr Reports`,'Home Collection','NABL Certified'].map(t=>(
                  <span key={t} style={{fontSize:12,fontWeight:600,color:'var(--g3)',display:'flex',alignItems:'center',gap:4}}>✓ {t}</span>
                ))}
              </div>
            </div>
            <div style={{fontSize:120,opacity:.6,display:'flex',alignItems:'center',justifyContent:'center'}}>{d.icon}</div>
          </div>
        </div>
      </section>

      {/* Areas */}
      <section style={{background:'var(--navy)',padding:'32px 0'}}>
        <div className="container">
          <div style={{textAlign:'center',marginBottom:20}}>
            <span style={{fontSize:13,fontWeight:600,color:'rgba(255,255,255,.5)',textTransform:'uppercase',letterSpacing:.5}}>We cover {d.areas.length}+ areas in {city}</span>
          </div>
          <div style={{display:'flex',flexWrap:'wrap',gap:10,justifyContent:'center'}}>
            {d.areas.map(a=>(
              <span key={a} style={{background:'rgba(255,255,255,.08)',border:'1px solid rgba(255,255,255,.1)',borderRadius:20,padding:'6px 14px',fontSize:12,fontWeight:600,color:'rgba(255,255,255,.7)'}}>📍 {a}</span>
            ))}
            <span style={{background:'rgba(0,204,142,.15)',border:'1px solid rgba(0,204,142,.3)',borderRadius:20,padding:'6px 14px',fontSize:12,fontWeight:600,color:'var(--g)'}}>+ more areas</span>
          </div>
        </div>
      </section>

      {/* Tests */}
      <section className="section" style={{background:'var(--bg)'}}>
        <div className="container">
          <div className="sec-head">
            <div>
              <span className="sec-tag tag-n" style={{marginBottom:8,display:'inline-flex'}}>Popular in {city}</span>
              <h2 className="sec-title">Most Booked Tests in {city}</h2>
              <p className="sec-sub">NABL-certified · Home collection · Reports in 6 hrs</p>
            </div>
          </div>
          <div className="tests-grid">
            {TESTS.slice(0,4).map(t=>(
              <div key={t.id} className="test-card" onClick={()=>startBooking('test',t)}>
                <div className="tc-top">
                  <div className="tc-icon">{t.icon}</div>
                  <div className="tc-name">{t.name}</div>
                  <div className="tc-params">{t.params}</div>
                  <div className="tc-tags">{t.tags.map(tag=><span key={tag} className="tc-tag">{tag}</span>)}</div>
                  <div className="tc-price"><span className="p-new">₹{t.price}</span><span className="p-old">₹{t.mrp}</span><span className="p-disc">{t.disc} OFF</span></div>
                </div>
                <div className="tc-bot">
                  <div className="tat">⏱ {t.tat}</div>
                  <button className="btn-book-sm" onClick={e=>{e.stopPropagation();startBooking('test',t)}}>Book Now</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Checkupify in this city */}
      <section className="section">
        <div className="container" style={{maxWidth:820}}>
          <div style={{textAlign:'center',marginBottom:40}}>
            <span className="sec-tag tag-g" style={{display:'inline-flex',marginBottom:10}}>Why Choose Us</span>
            <h2 className="sec-title">Why {city} trusts Checkupify</h2>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:20}}>
            {[
              {icon:'🏅',t:`${d.labs}+ NABL Labs in ${city}`,d:`Every partner lab in ${city} is NABL accredited and audited quarterly for quality and hygiene standards.`},
              {icon:'🏠',t:'Home Collection',d:`Certified phlebotomist reaches your home in ${city} between 6 AM – 8 PM, 7 days a week.`},
              {icon:'⚡',t:'6-Hour Reports',d:`Get your test results in 6 hours or less, delivered directly as a PDF to your WhatsApp.`},
              {icon:'💰',t:'Best Price Guaranteed',d:`We compare prices across all partner labs in ${city} and give you the lowest verified price.`},
            ].map(w=>(
              <div key={w.t} style={{background:'white',border:'1.5px solid var(--border)',borderRadius:14,padding:22}}>
                <div style={{fontSize:28,marginBottom:10}}>{w.icon}</div>
                <div style={{fontWeight:700,fontSize:14,color:'var(--ink)',marginBottom:6}}>{w.t}</div>
                <div style={{fontSize:12,color:'var(--slate)',lineHeight:1.6}}>{w.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Other cities */}
      <section style={{background:'var(--bg)',padding:'40px 0'}}>
        <div className="container">
          <div style={{textAlign:'center',marginBottom:24}}>
            <h3 style={{fontSize:18,fontWeight:700,color:'var(--ink)'}}>We also serve</h3>
          </div>
          <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
            {Object.entries(CITY_DATA).filter(([c])=>c!==city).map(([c,data])=>(
              <Link key={c} to={`/health-checkup-in-${c.toLowerCase()}`} style={{textDecoration:'none'}}>
                <button style={{display:'flex',alignItems:'center',gap:8,background:'white',border:'1.5px solid var(--border)',borderRadius:11,padding:'10px 18px',fontSize:13,fontWeight:600,cursor:'pointer',transition:'all .15s',color:'var(--ink)'}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--g)';e.currentTarget.style.color='var(--g3)'}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.color='var(--ink)'}}>
                  {data.icon} {c}
                </button>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
