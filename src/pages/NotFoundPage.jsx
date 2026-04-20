import { Link } from 'react-router-dom'
export default function NotFoundPage() {
  return (
    <div style={{textAlign:'center',padding:'120px 20px',minHeight:'60vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
      <div style={{fontSize:80,marginBottom:24}}>🔬</div>
      <h1 style={{fontSize:40,fontWeight:800,color:'var(--ink)',marginBottom:12}}>Page Not Found</h1>
      <p style={{fontSize:16,color:'var(--slate)',maxWidth:400,lineHeight:1.7,marginBottom:32}}>
        We couldn't find that page. But we can definitely find the right health test for you!
      </p>
      <div style={{display:'flex',gap:12,flexWrap:'wrap',justifyContent:'center'}}>
        <Link to="/" style={{textDecoration:'none'}}><button className="btn-book" style={{padding:'12px 24px'}}>Go to Homepage</button></Link>
        <Link to="/services" style={{textDecoration:'none'}}><button className="btn-signin" style={{padding:'12px 24px'}}>Browse Tests</button></Link>
      </div>
    </div>
  )
}
