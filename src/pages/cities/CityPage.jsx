import { useParams, Link } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { useSEO } from '../../hooks/useSEO'

const CITY_DATA = {
  hyderabad:{ name:'Hyderabad', state:'Telangana', emoji:'🏙️', labs:18, areas:['Jubilee Hills','Banjara Hills','HITEC City','Ameerpet','Kondapur','Madhapur','Gachibowli','Secunderabad'], color:'#0A2747' },
  bangalore:{ name:'Bangalore', state:'Karnataka', emoji:'🌳', labs:12, areas:['Indiranagar','Koramangala','Whitefield','HSR Layout','JP Nagar','Jayanagar','Electronic City','Marathahalli'], color:'#065f46' },
  mumbai:{ name:'Mumbai', state:'Maharashtra', emoji:'🌊', labs:15, areas:['Andheri','Bandra','Worli','Powai','Dadar','Thane','Navi Mumbai','Borivali'], color:'#1e3a5f' },
  delhi:{ name:'Delhi NCR', state:'Delhi', emoji:'🏛️', labs:10, areas:['Connaught Place','Dwarka','Noida','Gurgaon','Faridabad','Greater Noida','Lajpat Nagar','Rohini'], color:'#44403c' },
  pune:{ name:'Pune', state:'Maharashtra', emoji:'🏔️', labs:8, areas:['Koregaon Park','Baner','Viman Nagar','Kothrud','Hadapsar','Aundh','Wakad','Pimpri'], color:'#374151' },
  chennai:{ name:'Chennai', state:'Tamil Nadu', emoji:'🌴', labs:9, areas:['Anna Nagar','T Nagar','Adyar','Velachery','OMR','Perambur','Egmore','Mylapore'], color:'#7c2d12' },
}
const VALID_CITIES = Object.keys(CITY_DATA)

export default function CityPage() {
  const { city } = useParams()
  const { startBooking } = useApp()
  const cityKey = city?.toLowerCase()
  const data = CITY_DATA[cityKey]

  useSEO({
    title: data ? `Health Checkup in ${data.name} | NABL Labs | Home Collection | Checkupify` : 'Page Not Found | Checkupify',
    description: data ? `Book lab tests in ${data.name}. ${data.labs}+ NABL certified labs, home collection available, reports in 6 hours. Starting ₹299.` : '',
    canonical: data ? `https://checkupify.com/${cityKey}` : undefined,
  })

  if (!data) return (
    <div style={{ textAlign:'center', padding:'120px 20px' }}>
      <div style={{ fontSize:72, marginBottom:20 }}>🔍</div>
      <h1 style={{ fontSize:32, fontWeight:800, color:'var(--ink)', marginBottom:12 }}>Page Not Found</h1>
      <p style={{ color:'var(--slate)', marginBottom:24 }}>We serve these cities:</p>
      <div style={{ display:'flex', gap:10, justifyContent:'center', flexWrap:'wrap', marginBottom:28 }}>
        {VALID_CITIES.map(c=><Link key={c} to={`/${c}`} style={{ background:'var(--g)', color:'var(--ink)', padding:'8px 18px', borderRadius:20, textDecoration:'none', fontSize:13, fontWeight:600 }}>{CITY_DATA[c].name}</Link>)}
      </div>
      <Link to="/" style={{ color:'var(--g3)', fontWeight:600 }}>← Go Home</Link>
    </div>
  )

  const tests=[{icon:'🧪',name:'Full Body Checkup',price:2499,desc:'61 tests · Most popular'},{icon:'🦋',name:'Thyroid Panel',price:399,desc:'TSH, T3, T4 · 6 hr reports'},{icon:'🍬',name:'Diabetes Panel',price:449,desc:'HbA1c + Fasting Sugar'},{icon:'❤️',name:'Cardiac Screening',price:3199,desc:'Heart health · ECG included'}]

  return (
    <div>
      <div style={{ background:`linear-gradient(135deg,${data.color},${data.color}dd)`, padding:'72px 0 56px', textAlign:'center' }}>
        <div className="container">
          <div style={{ fontSize:48, marginBottom:12 }}>{data.emoji}</div>
          <span className="sec-tag" style={{ background:'rgba(0,204,142,.2)', color:'var(--g)', display:'inline-flex', marginBottom:16 }}>📍 {data.name}, {data.state}</span>
          <h1 style={{ fontSize:'clamp(26px,4vw,46px)', fontWeight:800, color:'white', letterSpacing:'-1px', marginBottom:14, lineHeight:1.15 }}>
            Health Checkups in {data.name}<br/><span style={{ color:'var(--g)' }}>Delivered to Your Home</span>
          </h1>
          <p style={{ color:'rgba(255,255,255,.65)', maxWidth:520, margin:'0 auto 32px', fontSize:15, lineHeight:1.7 }}>
            Book from {data.labs}+ NABL-certified labs across {data.name}. Home collection in 30 minutes. Reports on WhatsApp in 6 hours.
          </p>
          <button onClick={()=>document.getElementById('city-tests').scrollIntoView({behavior:'smooth'})} style={{ background:'var(--g)', color:'var(--ink)', border:'none', borderRadius:10, padding:'13px 28px', fontWeight:700, fontSize:14, cursor:'pointer', fontFamily:'var(--font)' }}>Book in {data.name} →</button>
        </div>
      </div>

      <div style={{ background:'white', padding:'28px 0', borderBottom:'1px solid var(--border)' }}>
        <div className="container">
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(120px,1fr))', gap:16, textAlign:'center' }}>
            {[[`${data.labs}+`,'Partner Labs'],['6 hrs','Report Time'],['30 min','Pickup Time'],['₹299','Starting Price'],['100%','NABL Certified']].map(([n,l])=>(
              <div key={l}><div style={{ fontSize:24, fontWeight:800, color:'var(--g3)' }}>{n}</div><div style={{ fontSize:11, color:'var(--slate)', marginTop:2 }}>{l}</div></div>
            ))}
          </div>
        </div>
      </div>

      <div id="city-tests" className="section" style={{ background:'var(--bg)' }}>
        <div className="container">
          <h2 className="sec-title" style={{ marginBottom:6 }}>Popular Tests in {data.name}</h2>
          <p className="sec-sub" style={{ marginBottom:24 }}>Home collection across all areas</p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:14 }}>
            {tests.map(t=>(
              <div key={t.name} style={{ background:'white', border:'1.5px solid var(--border)', borderRadius:14, padding:20, cursor:'pointer', transition:'all .18s' }}
                onClick={()=>startBooking('test',{id:t.name,name:t.name,icon:t.icon,price:t.price,mrp:Math.round(t.price*1.4),disc:'28%',tat:'6 hrs',prep:'',params:'',tags:[]})}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--g)';e.currentTarget.style.transform='translateY(-2px)'}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.transform='none'}}>
                <div style={{ fontSize:28, marginBottom:10 }}>{t.icon}</div>
                <div style={{ fontWeight:700, fontSize:14, color:'var(--ink)', marginBottom:4 }}>{t.name}</div>
                <div style={{ fontSize:11, color:'var(--slate)', marginBottom:12 }}>{t.desc}</div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontWeight:800, fontSize:18, color:'var(--ink)' }}>₹{t.price.toLocaleString()}</span>
                  <button style={{ background:'var(--g)', color:'var(--ink)', border:'none', borderRadius:7, padding:'7px 14px', fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'var(--font)' }}>Book</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="section">
        <div className="container">
          <h2 className="sec-title" style={{ marginBottom:8 }}>We Cover All Areas in {data.name}</h2>
          <div style={{ display:'flex', flexWrap:'wrap', gap:10, marginTop:16 }}>
            {data.areas.map(a=><span key={a} style={{ background:'var(--bg)', border:'1.5px solid var(--border)', borderRadius:20, padding:'6px 16px', fontSize:13, color:'var(--slate)' }}>📍 {a}</span>)}
          </div>
        </div>
      </div>
    </div>
  )
}
