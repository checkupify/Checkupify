import { useApp } from '../../context/AppContext'
export default function AppDownload() {
  const { addToast } = useApp()
  const soon = () => addToast('info','📱 App coming soon! Sign up to get early access.')
  return (
    <section className="section">
      <div className="container">
        <div className="app-inner">
          <div style={{position:'relative',zIndex:1}}>
            <span className="sec-tag tag-g" style={{display:'inline-flex',marginBottom:14}}>📱 Mobile App</span>
            <div className="sec-title" style={{color:'white',marginBottom:10}}>Checkupify in Your Pocket</div>
            <div className="sec-sub" style={{color:'rgba(255,255,255,.5)',marginBottom:24}}>Track reports, book tests, consult doctors — all on the app. 4.9★ rated.</div>
            <div className="app-feats">
              {['Book tests in under 60 seconds','Track phlebotomist live on map','Download & share reports','Video consult with doctors','Family health profiles','Fasting & appointment reminders'].map(f=><div key={f} className="app-feat">{f}</div>)}
            </div>
            <div className="app-btns">
              <button className="app-btn" onClick={soon}><div className="app-btn-icon">🤖</div><div><div className="app-btn-sub">Get it on</div><div className="app-btn-name">Google Play</div></div></button>
              <button className="app-btn" onClick={soon}><div className="app-btn-icon">🍎</div><div><div className="app-btn-sub">Download on the</div><div className="app-btn-name">App Store</div></div></button>
            </div>
          </div>
          <div className="app-visual">
            <div style={{fontSize:120}}>📱</div>
            <div className="app-rating">
              <div className="ar-badge"><div className="ar-val">4.9★</div><div className="ar-lbl">Play Store</div></div>
              <div className="ar-badge"><div className="ar-val">4.8★</div><div className="ar-lbl">App Store</div></div>
              <div className="ar-badge"><div className="ar-val">50K+</div><div className="ar-lbl">Downloads</div></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
