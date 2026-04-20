import { useState, useRef } from 'react'
import { useApp } from '../../context/AppContext'
import { supabase } from '../../lib/supabase'

export default function LoginModal() {
  const { modal, closeModal, login, addToast } = useApp()
  const [step, setStep] = useState('phone') // 'phone' | 'otp'
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState(['','','','','',''])
  const [loading, setLoading] = useState(false)
  const otpRefs = useRef([])

  if (modal !== 'login') return null

  const handleClose = () => { closeModal(); setStep('phone'); setPhone(''); setOtp(['','','','','','']) }

  const sendOTP = async () => {
    if (phone.length !== 10) { addToast('error', 'Enter a valid 10-digit number'); return }
    setLoading(true)
    try {
      // Try Supabase phone auth
      const { error } = await supabase.auth.signInWithOtp({ phone: `+91${phone}` })
      if (error) throw error
      addToast('success', `OTP sent to +91 ${phone} via WhatsApp & SMS`)
    } catch {
      // Demo mode - proceed anyway
      addToast('success', `OTP sent to +91 ${phone} (Demo: use 123456)`)
    } finally {
      setLoading(false)
      setStep('otp')
    }
  }

  const verifyOTP = async () => {
    const code = otp.join('')
    if (code.length !== 6) { addToast('error', 'Enter all 6 digits'); return }
    setLoading(true)
    try {
      let user = null
      try {
        const { data, error } = await supabase.auth.verifyOtp({ phone: `+91${phone}`, token: code, type: 'sms' })
        if (!error && data.user) user = data.user
      } catch {}

      // Demo fallback
      if (!user && code === '123456') {
        user = { id: 'demo_' + Date.now(), phone: `+91${phone}`, email: null }
      }

      if (user) {
        const token = 'ck_' + btoa(`${phone}:${Date.now()}`)
        const userData = { id: user.id, phone: `+91${phone}`, name: '', role: 'patient' }
        login(userData, token)
        addToast('success', '✅ Welcome to Checkupify!')
        handleClose()
      } else {
        addToast('error', 'Invalid OTP. Try 123456 in demo mode.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (val, idx) => {
    if (!/^\d*$/.test(val)) return
    const next = [...otp]
    next[idx] = val.slice(-1)
    setOtp(next)
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus()
    if (idx === 5 && next.every(d => d)) setTimeout(verifyOTP, 150)
  }

  const handleOtpKey = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) otpRefs.current[idx - 1]?.focus()
  }

  const resend = () => { setOtp(['','','','','','']); sendOTP() }

  return (
    <div className={`overlay${modal === 'login' ? ' open' : ''}`} onClick={e => e.target.classList.contains('overlay') && handleClose()}>
      <div className="modal">
        <button className="modal-close" onClick={handleClose}>✕</button>

        {step === 'phone' ? (
          <>
            <div className="modal-title">Sign in to Checkupify</div>
            <div className="modal-sub">Enter mobile number to get OTP on WhatsApp</div>
            <div className="fg">
              <label>Mobile Number</label>
              <div className="phone-row">
                <div className="phone-cc">+91</div>
                <input
                  type="tel" placeholder="98765 43210" maxLength={10}
                  value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g,''))}
                  onKeyDown={e => e.key === 'Enter' && sendOTP()}
                />
              </div>
            </div>
            <button className="modal-btn" onClick={sendOTP} disabled={loading || phone.length !== 10}>
              {loading ? <div className="spinner"/> : 'Send OTP on WhatsApp →'}
            </button>
            <div style={{ textAlign:'center', fontSize:11, color:'var(--muted)', marginTop:12 }}>
              By signing in you agree to our{' '}
              <span style={{ color:'var(--g3)', cursor:'pointer' }}>Terms</span> &{' '}
              <span style={{ color:'var(--g3)', cursor:'pointer' }}>Privacy Policy</span>
            </div>
          </>
        ) : (
          <>
            <div className="modal-title">Enter OTP</div>
            <div className="modal-sub">Sent to <strong>+91 {phone}</strong> via WhatsApp & SMS</div>
            <div className="otp-boxes">
              {otp.map((d, i) => (
                <input
                  key={i} className={`otp-box${d ? ' filled' : ''}`}
                  maxLength={1} value={d}
                  ref={el => otpRefs.current[i] = el}
                  onChange={e => handleOtpChange(e.target.value, i)}
                  onKeyDown={e => handleOtpKey(e, i)}
                />
              ))}
            </div>
            <button className="modal-btn" onClick={verifyOTP} disabled={loading}>
              {loading ? <div className="spinner"/> : 'Verify & Continue →'}
            </button>
            <div style={{ textAlign:'center', fontSize:12, color:'var(--slate)', marginTop:12 }}>
              Didn't receive?{' '}
              <span style={{ color:'var(--g3)', cursor:'pointer', fontWeight:600 }} onClick={resend}>Resend OTP</span>
              {' · '}
              <span style={{ color:'var(--g3)', cursor:'pointer', fontWeight:600 }} onClick={() => setStep('phone')}>Change number</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
