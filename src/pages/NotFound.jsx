import { Link } from 'react-router-dom'
export default function NotFound() {
  return (
    <div style={{ textAlign:'center', padding:'120px 20px', background:'var(--bg)', minHeight:'60vh' }}>
      <div style={{ fontSize:80, marginBottom:20 }}>🏥</div>
      <h1 style={{ fontSize:48, fontWeight:800, color:'var(--ink)', marginBottom:12, letterSpacing:'-1px' }}>404</h1>
      <p style={{ fontSize:20, fontWeight:600, color:'var(--slate)', marginBottom:8 }}>This page has left the building.</p>
      <p style={{ fontSize:14, color:'var(--muted)', marginBottom:32 }}>But your health is still our priority. Let's get you back on track.</p>
      <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
        <Link to="/" style={{ background:'var(--g)', color:'var(--ink)', padding:'12px 28px', borderRadius:10, textDecoration:'none', fontWeight:700, fontSize:14 }}>← Go Home</Link>
        <Link to="/services" style={{ background:'var(--bg)', color:'var(--ink)', padding:'12px 28px', borderRadius:10, textDecoration:'none', fontWeight:700, fontSize:14, border:'1.5px solid var(--border)' }}>Book a Test</Link>
      </div>
    </div>
  )
}
