import { useState, useRef } from 'react'
import { useApp } from '../../context/AppContext'
import { supabase } from '../../lib/supabase'

// Call an Edge Function and surface its JSON error messages cleanly
async function callFn(name, body) {
  const { data, error } = await supabase.functions.invoke(name, { body })
  if (error) {
    let msg = 'Something went wrong. Please try again.'
    try { const j = await error.context.json(); if (j?.error) msg = j.error } catch {}
    return { error: msg }
  }
  return { data }
}

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
    const { data, error } = await callFn('otp-request', { phone })
    setLoading(false)
    if (error) { addToast('error', error); return }
    setStep('otp')
    if (data?.debug_code) addToast('info', `Test code: ${data.debug_code}`)
    else if (data?.delivered) addToast('success', `OTP sent to +91 ${phone} on WhatsApp`)
    else addToast('info', 'Code generated. If it doesn’t arrive on WhatsApp, tap Resend.')
  }

  const verifyOTP = async () => {
    const code = otp.join('')
    if (code.length !== 6) { addToast('error', 'Enter all 6 digits'); return }
    setLoading(true)
    const { data, error } = await callFn('otp-verify', { phone, code })
    if (error) {
      setLoading(false)
      setOtp(['','','','','',''])
      otpRefs.current[0]?.focus()
      addToast('error', error)
      return
    }
    // Establish the real Supabase session so the user is authenticated (RLS-scoped)
    if (data?.session?.access_token) {
      try {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        })
      } catch {}
    }
    setLoading(false)
    login({ id: data?.user_id || null, phone: `+91${phone}`, name: '', role: 'patient' }, data?.session?.access_token || 'ck_session')
    addToast('success', '✅ Welcome to Checkupify!')
    handleClose()
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
            <div className="modal-sub">Sent to <strong>+91 {phone}</strong> on WhatsApp</div>
            <div className="otp-boxes">
              {otp.map((d, i) => (
                <input
                  key={i} className={`otp-box${d ? ' filled' : ''}`}
                  maxLength={1} value={d} inputMode="numeric"
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
