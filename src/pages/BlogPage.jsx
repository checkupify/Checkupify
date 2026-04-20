import { Link } from 'react-router-dom'
import SEOHead from '../components/seo/SEOHead'

export const BLOG_POSTS = [
  {
    slug:'why-indians-ignore-health-checkups',
    title:'Why 92% of Indians Skip Their Annual Health Checkup (And How to Change That)',
    excerpt:'The reasons Indian families delay preventive care — and a practical guide to making health checkups a non-negotiable family habit.',
    category:'Preventive Health', readTime:'6 min read', date:'April 10, 2026',
    author:'Dr. Meera Krishnan', authorRole:'Chief Medical Officer',
    image:'🧬',
    tags:['Preventive Health','Annual Checkup','Indian Healthcare'],
    content: `Most Indians visit a doctor only when something hurts. This isn't negligence — it's a cultural pattern reinforced by decades of a healthcare system designed around treatment, not prevention. But the data is alarming...`
  },
  {
    slug:'full-body-checkup-what-to-expect',
    title:'What Happens During a Full Body Checkup? A Complete Guide (2026)',
    excerpt:'Everything you need to know before booking a full body health checkup — what tests are included, how to prepare, and how to read your results.',
    category:'Health Guide', readTime:'8 min read', date:'April 5, 2026',
    author:'Dr. Meera Krishnan', authorRole:'Chief Medical Officer',
    image:'📊',
    tags:['Full Body Checkup','Lab Tests','Health Guide'],
    content: `A full body checkup is one of the smartest investments you can make in your health. Here's exactly what to expect...`
  },
  {
    slug:'diabetes-prevention-india',
    title:'India\'s Silent Epidemic: How to Prevent Diabetes Before It Starts',
    excerpt:'India has 101 million diabetics — the highest in the world. Learn the warning signs, risk factors, and the one test that could save your life.',
    category:'Disease Prevention', readTime:'7 min read', date:'March 28, 2026',
    author:'Dr. Arjun Mehta', authorRole:'Endocrinologist',
    image:'🍬',
    tags:['Diabetes','Prevention','HbA1c','India Health'],
    content: `India is the diabetes capital of the world. But 70% of Type 2 diabetes cases are preventable with early detection and lifestyle changes...`
  },
  {
    slug:'vitamin-d-deficiency-india',
    title:'Why Almost Every Indian is Vitamin D Deficient (Despite Living in a Sunny Country)',
    excerpt:"Paradoxically, India has one of the highest rates of Vitamin D deficiency globally. Here's why — and what you can do about it.",
    category:'Nutrition', readTime:'5 min read', date:'March 20, 2026',
    author:'Dr. Priya Rao', authorRole:'Internal Medicine',
    image:'☀️',
    tags:['Vitamin D','Deficiency','Nutrition','India'],
    content: `Despite receiving abundant sunlight, over 70% of Indians are Vitamin D deficient. The reasons might surprise you...`
  },
  {
    slug:'thyroid-problems-women-india',
    title:"Women and Thyroid: The Hidden Health Crisis Affecting 1 in 5 Indian Women",
    excerpt:"Thyroid disorders are 8x more common in women than men — yet most go undiagnosed for years. Know the signs, get tested, take control.",
    category:'Women\'s Health', readTime:'6 min read', date:'March 15, 2026',
    author:'Dr. Kavitha Nair', authorRole:'Gynaecologist',
    image:'🦋',
    tags:['Thyroid','Women Health','Hormones'],
    content: `Fatigue, weight gain, hair loss, mood swings — these symptoms are often dismissed as stress or "just getting older." But for 1 in 5 Indian women, they point to something more specific: thyroid disorder...`
  },
  {
    slug:'heart-health-checkup-guide',
    title:'Heart Attack at 35? Why Young Indians Need Cardiac Screening Now',
    excerpt:'Cardiovascular disease is striking younger Indians at alarming rates. A simple cardiac screening could be the most important health decision you make.',
    category:'Cardiac Health', readTime:'7 min read', date:'March 8, 2026',
    author:'Dr. Suresh Reddy', authorRole:'Cardiologist',
    image:'❤️',
    tags:['Heart Health','Cardiac Screening','Young Indians'],
    content: `India has one of the youngest cardiac patient populations in the world. A 40-year-old Indian is 4x more likely to have a heart attack than their Western counterpart at the same age...`
  },
]

export default function BlogPage() {
  return (
    <>
      <SEOHead
        title="Checkupify Health Blog — Expert Health Tips, Test Guides & Wellness Advice"
        description="Read expert health articles written by certified doctors. Learn about lab tests, preventive health checkups, disease prevention, and wellness for Indian families."
        canonical="https://checkupify.com/blog"
        keywords="health blog India, lab test guide, preventive health tips, doctor advice, health checkup guide"
      />

      <section style={{background:'linear-gradient(160deg,#f0fdf9,#fff)',padding:'64px 0 48px'}}>
        <div className="container" style={{textAlign:'center',maxWidth:700}}>
          <span className="sec-tag tag-g" style={{display:'inline-flex',marginBottom:16}}>📝 Health Blog</span>
          <h1 style={{fontSize:'clamp(26px,4vw,42px)',fontWeight:800,color:'var(--ink)',letterSpacing:-.8,marginBottom:16}}>
            Health Insights by Expert Doctors
          </h1>
          <p style={{fontSize:16,color:'var(--slate)',lineHeight:1.7}}>
            Evidence-based articles written by our panel of certified doctors — helping you make smarter health decisions for yourself and your family.
          </p>
        </div>
      </section>

      <section className="section" style={{paddingTop:0}}>
        <div className="container">
          {/* Featured */}
          <div style={{marginBottom:48}}>
            <Link to={`/blog/${BLOG_POSTS[0].slug}`} style={{textDecoration:'none'}}>
              <div style={{background:'var(--navy)',borderRadius:20,padding:48,display:'grid',gridTemplateColumns:'1fr auto',gap:32,alignItems:'center',cursor:'pointer',transition:'all .2s'}}
                onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'}
                onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}>
                <div>
                  <span style={{background:'rgba(0,204,142,.2)',color:'var(--g)',fontSize:10,fontWeight:700,padding:'3px 10px',borderRadius:20,textTransform:'uppercase',letterSpacing:.5,display:'inline-block',marginBottom:16}}>{BLOG_POSTS[0].category}</span>
                  <h2 style={{fontSize:'clamp(18px,3vw,28px)',fontWeight:800,color:'white',lineHeight:1.3,marginBottom:12,letterSpacing:-.5}}>{BLOG_POSTS[0].title}</h2>
                  <p style={{fontSize:14,color:'rgba(255,255,255,.6)',lineHeight:1.7,marginBottom:20}}>{BLOG_POSTS[0].excerpt}</p>
                  <div style={{display:'flex',alignItems:'center',gap:16,fontSize:12,color:'rgba(255,255,255,.4)'}}>
                    <span>{BLOG_POSTS[0].author}</span><span>·</span><span>{BLOG_POSTS[0].date}</span><span>·</span><span>{BLOG_POSTS[0].readTime}</span>
                  </div>
                </div>
                <div style={{fontSize:100,opacity:.8}}>{BLOG_POSTS[0].image}</div>
              </div>
            </Link>
          </div>

          {/* Grid */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:24}}>
            {BLOG_POSTS.slice(1).map(post=>(
              <Link key={post.slug} to={`/blog/${post.slug}`} style={{textDecoration:'none'}}>
                <div style={{background:'white',border:'1.5px solid var(--border)',borderRadius:16,overflow:'hidden',height:'100%',transition:'all .2s',display:'flex',flexDirection:'column'}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--g)';e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='var(--sh2)'}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none'}}>
                  <div style={{background:'linear-gradient(135deg,#f0fdf9,#dcfce7)',height:100,display:'flex',alignItems:'center',justifyContent:'center',fontSize:52}}>{post.image}</div>
                  <div style={{padding:20,flex:1,display:'flex',flexDirection:'column'}}>
                    <span style={{background:'var(--glt)',color:'var(--g3)',fontSize:9,fontWeight:700,padding:'2px 9px',borderRadius:20,display:'inline-block',marginBottom:10,textTransform:'uppercase',letterSpacing:.5}}>{post.category}</span>
                    <h3 style={{fontSize:15,fontWeight:700,color:'var(--ink)',lineHeight:1.4,marginBottom:10,flex:1}}>{post.title}</h3>
                    <p style={{fontSize:12,color:'var(--slate)',lineHeight:1.6,marginBottom:14}}>{post.excerpt}</p>
                    <div style={{display:'flex',alignItems:'center',gap:8,fontSize:11,color:'var(--muted)'}}>
                      <span>{post.author}</span><span>·</span><span>{post.readTime}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
