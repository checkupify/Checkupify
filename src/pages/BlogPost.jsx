import { useParams, Link } from 'react-router-dom'
import SEOHead from '../components/seo/SEOHead'
import { BLOG_POSTS } from './BlogPage'
import { useApp } from '../context/AppContext'

const FULL_CONTENT = {
  'why-indians-ignore-health-checkups': {
    sections: [
      { h2:'The Uncomfortable Truth', p:`Most Indians visit a doctor only when something hurts. This isn't negligence — it's a cultural pattern reinforced by decades of a healthcare system designed around treatment, not prevention.\n\nThe data is stark: Only 8% of Indians get an annual health checkup, compared to 70%+ in developed countries. This gap isn't about awareness alone — it's about access, trust, and the sheer friction involved in getting tested.` },
      { h2:'Five Reasons Indians Skip Health Checkups', p:`1. The "I Feel Fine" Fallacy — Most serious conditions like diabetes, hypertension, and early-stage cancer have zero symptoms until they're advanced. By the time you feel unwell, the disease has often been developing for years.\n\n2. Cost Anxiety — Many Indians assume health checkups are expensive. But a full body checkup at Checkupify costs ₹2,499 — less than a dinner for two at a restaurant. Prevention is dramatically cheaper than cure.\n\n3. Logistical Barriers — Finding a good lab, booking a slot, taking time off work — these frictions add up. Most people simply postpone indefinitely.\n\n4. Fear of Bad News — Paradoxically, many avoid testing because they're afraid of what they might find. This is understandable but dangerous.\n\n5. No Family Culture of Prevention — If your parents didn't get annual checkups, chances are you won't either, unless someone changes the pattern.` },
      { h2:'How to Build a Prevention Habit', p:`The solution isn't just willpower — it's making prevention as easy as possible. Here's what works:\n\n✓ Schedule your annual checkup on your birthday — it's easy to remember and creates a positive ritual.\n✓ Book as a family — when it becomes a group activity, accountability increases dramatically.\n✓ Use home collection — remove the need to travel to a lab entirely.\n✓ Choose a platform that delivers reports on WhatsApp — so the results are impossible to ignore.` },
      { h2:'The Financial Case for Prevention', p:`Consider this: A Full Body Checkup costs ₹2,499. Treating Type 2 Diabetes once diagnosed costs ₹50,000–₹2,00,000 per year for the rest of your life.\n\nA Lipid Profile (₹349) can catch high cholesterol years before a heart attack. Angioplasty costs ₹3–5 lakhs.\n\nPrevention is not just the healthy choice. It's the financially rational choice.` },
    ]
  },
}

export default function BlogPost() {
  const { slug } = useParams()
  const { startBooking } = useApp()
  const post = BLOG_POSTS.find(p => p.slug === slug)

  if (!post) return (
    <div style={{textAlign:'center',padding:'120px 20px'}}>
      <div style={{fontSize:64,marginBottom:20}}>📝</div>
      <h2 style={{fontSize:28,fontWeight:800,marginBottom:12}}>Article not found</h2>
      <Link to="/blog"><button className="btn-book" style={{padding:'12px 24px'}}>Back to Blog</button></Link>
    </div>
  )

  const content = FULL_CONTENT[slug]

  return (
    <>
      <SEOHead
        title={`${post.title} | Checkupify Health Blog`}
        description={post.excerpt}
        canonical={`https://checkupify.com/blog/${slug}`}
        keywords={post.tags.join(', ')}
      />

      {/* Hero */}
      <div style={{background:'linear-gradient(160deg,#f0fdf9,#fff)',padding:'48px 0'}}>
        <div className="container" style={{maxWidth:820}}>
          <Link to="/blog" style={{textDecoration:'none',display:'inline-flex',alignItems:'center',gap:6,fontSize:13,color:'var(--g3)',fontWeight:600,marginBottom:24}}>← Back to Blog</Link>
          <span style={{background:'var(--glt)',color:'var(--g3)',fontSize:10,fontWeight:700,padding:'3px 10px',borderRadius:20,textTransform:'uppercase',letterSpacing:.5,display:'inline-block',marginBottom:16}}>{post.category}</span>
          <h1 style={{fontSize:'clamp(22px,4vw,40px)',fontWeight:800,color:'var(--ink)',letterSpacing:-.8,lineHeight:1.2,marginBottom:20}}>{post.title}</h1>
          <div style={{display:'flex',alignItems:'center',gap:16,fontSize:13,color:'var(--slate)',marginBottom:24,flexWrap:'wrap'}}>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <div style={{width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,var(--g),var(--navy))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14}}>👩‍⚕️</div>
              <div><div style={{fontWeight:700,fontSize:13,color:'var(--ink)'}}>{post.author}</div><div style={{fontSize:11,color:'var(--muted)'}}>{post.authorRole}</div></div>
            </div>
            <span style={{color:'var(--border)'}}>·</span>
            <span>{post.date}</span>
            <span style={{color:'var(--border)'}}>·</span>
            <span>{post.readTime}</span>
          </div>
          <p style={{fontSize:17,color:'var(--slate)',lineHeight:1.8,borderLeft:'3px solid var(--g)',paddingLeft:20,fontStyle:'italic'}}>{post.excerpt}</p>
        </div>
      </div>

      {/* Content */}
      <div style={{padding:'48px 0 80px'}}>
        <div className="container" style={{maxWidth:820,display:'grid',gridTemplateColumns:'1fr 280px',gap:48,alignItems:'start'}}>
          <article style={{fontSize:16,lineHeight:1.85,color:'#334155'}}>
            {content ? content.sections.map((s,i)=>(
              <div key={i} style={{marginBottom:36}}>
                <h2 style={{fontSize:22,fontWeight:800,color:'var(--ink)',marginBottom:16,letterSpacing:-.3}}>{s.h2}</h2>
                {s.p.split('\n\n').map((para,j)=><p key={j} style={{marginBottom:16,lineHeight:1.85}}>{para}</p>)}
              </div>
            )) : (
              <div>
                <p style={{marginBottom:24}}>{post.content}</p>
                <div style={{background:'var(--gpale)',border:'1.5px solid rgba(0,204,142,.2)',borderRadius:14,padding:24,marginTop:32}}>
                  <div style={{fontWeight:700,fontSize:15,color:'var(--ink)',marginBottom:8}}>📝 Full article coming soon</div>
                  <p style={{fontSize:13,color:'var(--slate)'}}>Our medical team is reviewing this article for clinical accuracy. Check back soon for the complete guide.</p>
                </div>
              </div>
            )}

            {/* Tags */}
            <div style={{marginTop:40,paddingTop:24,borderTop:'1px solid var(--border)',display:'flex',gap:8,flexWrap:'wrap'}}>
              {post.tags.map(t=><span key={t} style={{background:'var(--bg)',border:'1px solid var(--border)',borderRadius:20,padding:'4px 12px',fontSize:12,color:'var(--slate)'}}>{t}</span>)}
            </div>
          </article>

          {/* Sidebar */}
          <div style={{position:'sticky',top:84}}>
            <div style={{background:'var(--gpale)',border:'1.5px solid rgba(0,204,142,.2)',borderRadius:16,padding:24,marginBottom:20}}>
              <div style={{fontWeight:800,fontSize:16,color:'var(--ink)',marginBottom:8}}>📊 Related Test</div>
              <p style={{fontSize:13,color:'var(--slate)',lineHeight:1.6,marginBottom:16}}>Book the relevant health test discussed in this article. NABL certified. Results in 6 hours.</p>
              <Link to="/services" style={{textDecoration:'none'}}><button className="btn-book" style={{width:'100%',padding:12,fontSize:13}}>Book Health Test →</button></Link>
            </div>
            <div style={{background:'white',border:'1.5px solid var(--border)',borderRadius:16,padding:24}}>
              <div style={{fontWeight:700,fontSize:15,color:'var(--ink)',marginBottom:12}}>More Articles</div>
              {BLOG_POSTS.filter(p=>p.slug!==slug).slice(0,3).map(p=>(
                <Link key={p.slug} to={`/blog/${p.slug}`} style={{textDecoration:'none'}}>
                  <div style={{display:'flex',gap:10,marginBottom:14,paddingBottom:14,borderBottom:'1px solid var(--border)',cursor:'pointer'}}>
                    <div style={{fontSize:24,flexShrink:0}}>{p.image}</div>
                    <div style={{fontSize:12,fontWeight:600,color:'var(--ink)',lineHeight:1.4}}>{p.title}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
