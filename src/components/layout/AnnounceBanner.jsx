import { useState } from 'react'

export default function AnnounceBanner() {
  const [visible, setVisible] = useState(true)
  if (!visible) return null
  return (
    <div className="announce">
      <div className="container">
        <div className="announce-inner">
          <span className="announce-badge">NEW</span>
          <span className="announce-text">
            <strong>Free Home Collection</strong> on orders above ₹999 · Reports in 6 hrs · NABL Certified Labs
          </span>
          <button className="announce-x" onClick={() => setVisible(false)}>×</button>
        </div>
      </div>
    </div>
  )
}
