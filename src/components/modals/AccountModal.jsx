import { useApp } from '../../context/AppContext'

export default function AccountModal() {
  const { modal, closeModal, user, logout } = useApp()
  if (modal !== 'account') return null

  const handleLogout = () => { logout(); closeModal() }

  return (
    <div className={`overlay${modal === 'account' ? ' open' : ''}`} onClick={e => e.target.classList.contains('overlay') && closeModal()}>
      <div className="modal">
        <button className="modal-close" onClick={closeModal}>✕</button>
        <div className="modal-title">My Account</div>
        <div style={{ display:'flex', alignItems:'center', gap:14, background:'var(--gpale)', borderRadius:14, padding:16, marginBottom:20 }}>
          <div style={{ width:52, height:52, borderRadius:'50%', background:'var(--g)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, fontWeight:800, color:'var(--ink)' }}>
            {user?.name?.charAt(0) || '👤'}
          </div>
          <div>
            <div style={{ fontWeight:800, fontSize:16 }}>{user?.name || 'Patient'}</div>
            <div style={{ fontSize:12, color:'var(--slate)' }}>{user?.phone}</div>
          </div>
        </div>

        <div className="acct-section">
          <div style={{ fontSize:12, fontWeight:700, color:'var(--slate)', marginBottom:8, textTransform:'uppercase', letterSpacing:'.5px' }}>Health Summary</div>
          {[['Bookings', '0'],['Reports Available','0'],['Consults Done','0']].map(([k,v]) => (
            <div key={k} className="acct-row"><span className="acct-label">{k}</span><span className="acct-val">{v}</span></div>
          ))}
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:16 }}>
          {[
            { icon:'📊', label:'My Reports', action:() => {} },
            { icon:'📅', label:'My Bookings', action:() => {} },
            { icon:'👥', label:'Family Profiles', action:() => {} },
            { icon:'💳', label:'Payment History', action:() => {} },
          ].map(item => (
            <button key={item.label} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', background:'var(--bg)', border:'1.5px solid var(--border)', borderRadius:11, cursor:'pointer', textAlign:'left', fontSize:13, fontWeight:600, transition:'all .15s' }}
              onClick={item.action} onMouseEnter={e => e.currentTarget.style.borderColor='var(--g)'} onMouseLeave={e => e.currentTarget.style.borderColor='var(--border)'}>
              <span style={{ fontSize:18 }}>{item.icon}</span> {item.label}
              <span style={{ marginLeft:'auto', color:'var(--muted)' }}>→</span>
            </button>
          ))}
        </div>

        <button style={{ width:'100%', padding:12, borderRadius:11, border:'1.5px solid #fee2e2', background:'#fff1f2', color:'var(--red)', fontSize:13, fontWeight:700, cursor:'pointer' }} onClick={handleLogout}>
          Sign Out
        </button>
      </div>
    </div>
  )
}
