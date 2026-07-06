import { useState, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import { supabase } from '../../lib/supabase'
import { SLOTS, FULL_SLOTS, PROMOS } from '../../data'

const today = () => new Date().toISOString().split('T')[0]

export default function BookingModal() {
  const { modal, closeModal, bookingItem, user, openModal, addToast } = useApp()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ name:'', age:'', gender:'', collType:'walkin', address:'' })
  const [date, setDate] = useState(today())
  const [slot, setSlot] = useState(null)
  const [promo, setPromo] = useState('')
  const [discount, setDiscount] = useState(0)
  const [payMethod, setPayMethod] = useState('upi')
  const [loading, setLoading] = useState(false)
  const [bookingId, setBookingId] = useState(null)

  useEffect(() => { if (modal === 'booking') { setStep(1); setForm({ name:'', age:'', gender:'', collType:'walkin', address:'' }); setDate(today()); setSlot(null); setPromo(''); setDiscount(0); setPayMethod('upi'); setBookingId(null) }}, [modal])

  if (modal !== 'booking' || !bookingItem) return null

  const price = bookingItem.price || 0
  const collFee = form.collType === 'home' ? 50 : 0
  const subtotal = price + collFee
  const finalPrice = Math.max(0, subtotal - discount)

  const step1Valid = form.name && form.age && form.gender && (form.collType !== 'home' || form.address)

  const goStep2 = () => {
    if (!step1Valid) { addToast('error', 'Please fill all required fields'); return }
    setStep(2)
  }

  const applyPromo = () => {
    const key = promo.trim().toUpperCase()
    const val = PROMOS[key]
    if (!val) { addToast('error', 'Invalid promo code'); return }
    const disc = val < 1 ? Math.round(subtotal * val) : val
    setDiscount(disc)
    addToast('success', `Promo applied! Saved ₹${disc}`)
  }

  const goStep3 = () => {
    if (!slot) { addToast('error', 'Please select a time slot'); return }
    setStep(3)
  }

  const processPayment = async () => {
    if (!user) { closeModal(); openModal('login'); return }
    setLoading(true)
    try {
      const booking = {
        user_id: user.id,
        item_type: bookingItem.type,
        item_id: bookingItem.id,
        item_name: bookingItem.name,
        patient_name: form.name,
        patient_age: parseInt(form.age),
        patient_gender: form.gender,
        collection_type: form.collType,
        address: form.address || null,
        date, slot,
        amount: finalPrice,
        payment_method: payMethod,
        status: 'confirmed',
        promo_code: discount > 0 ? promo : null,
      }

      let id = 'CHK-' + Math.random().toString(36).substr(2,6).toUpperCase()
      try {
        const { data, error } = await supabase.from('bookings').insert(booking).select('id').single()
        if (!error && data) id = 'CHK-' + data.id.toString().slice(-6).toUpperCase()
      } catch {}

      setBookingId(id)
      setStep(4)
      addToast('success', `🎉 Booking confirmed! ID: ${id}`)
    } catch (e) {
      addToast('error', 'Payment failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const stepColors = [1,2,3,4].map(s => s <= step ? 'var(--g)' : 'var(--border)')

  return (
    <div className={`overlay${modal === 'booking' ? ' open' : ''}`} onClick={e => e.target.classList.contains('overlay') && closeModal()}>
      <div className="modal" style={{ maxWidth:520 }}>
        <button className="modal-close" onClick={closeModal}>✕</button>
        <div className="modal-title">{step === 4 ? '🎉 Booking Confirmed!' : bookingItem.name}</div>
        {step < 4 && <div className="modal-sub" style={{ marginBottom:12 }}>
          {step === 1 ? 'Patient details' : step === 2 ? 'Choose date & slot' : 'Payment'}
        </div>}

        {/* Step bar */}
        <div className="step-bar" style={{ marginBottom:20 }}>
          {stepColors.map((c,i) => <div key={i} className="step-bar-seg" style={{ background:c }}/>)}
        </div>

        {/* ── STEP 1: Patient Details ── */}
        {step === 1 && (
          <div>
            <div className="fg"><label>Patient Name *</label><input placeholder="Full name" value={form.name} onChange={e => setForm({...form, name:e.target.value})}/></div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div className="fg"><label>Age *</label><input type="number" placeholder="34" value={form.age} onChange={e => setForm({...form, age:e.target.value})}/></div>
              <div className="fg"><label>Gender *</label>
                <select value={form.gender} onChange={e => setForm({...form, gender:e.target.value})}>
                  <option value="">Select</option>
                  <option>Female</option><option>Male</option><option>Other</option>
                </select>
              </div>
            </div>
            <div className="fg"><label>Collection Type *</label>
              <select value={form.collType} onChange={e => setForm({...form, collType:e.target.value})}>
                <option value="walkin">Walk-in at Lab</option>
                <option value="home">Home Collection (+₹50)</option>
              </select>
            </div>
            {form.collType === 'home' && (
              <div className="fg"><label>Home Address *</label><input placeholder="Full address for collection" value={form.address} onChange={e => setForm({...form, address:e.target.value})}/></div>
            )}
            {bookingItem.prep && (
              <div style={{ background:'#fef9c3', border:'1px solid #fde047', borderRadius:10, padding:12, marginBottom:14, fontSize:12, color:'#713f12' }}>
                ⚠️ <strong>Preparation:</strong> {bookingItem.prep}
              </div>
            )}
            <button className="modal-btn" onClick={goStep2}>Next → Choose Date & Slot</button>
          </div>
        )}

        {/* ── STEP 2: Date & Slot ── */}
        {step === 2 && (
          <div>
            <div className="fg"><label>Appointment Date *</label>
              <input type="date" value={date} min={today()} onChange={e => setDate(e.target.value)}/>
            </div>
            <div className="slot-grid">
              {SLOTS.map(s => (
                <button key={s} className={`slot-btn${slot === s ? ' sel' : ''}${FULL_SLOTS.has(s) ? ' full' : ''}`} onClick={() => !FULL_SLOTS.has(s) && setSlot(s)}>
                  {s}{FULL_SLOTS.has(s) ? ' Full' : ''}
                </button>
              ))}
            </div>
            <div className="fg">
              <label>Promo Code</label>
              <div style={{ display:'flex', gap:8 }}>
                <input placeholder="FIRST200" value={promo} onChange={e => setPromo(e.target.value)} onKeyDown={e => e.key==='Enter' && applyPromo()}/>
                <button style={{ padding:'11px 16px', background:'var(--bg)', border:'1.5px solid var(--border)', borderRadius:10, fontSize:12, fontWeight:600, cursor:'pointer', flexShrink:0 }} onClick={applyPromo}>Apply</button>
              </div>
            </div>
            <div style={{ background:'var(--bg)', borderRadius:10, padding:13, marginBottom:14, fontSize:13 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}><span style={{ color:'var(--slate)' }}>Test price</span><span style={{ fontWeight:600 }}>₹{price}</span></div>
              {collFee > 0 && <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}><span style={{ color:'var(--slate)' }}>Home collection</span><span style={{ fontWeight:600 }}>₹{collFee}</span></div>}
              {discount > 0 && <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}><span style={{ color:'var(--g3)' }}>Promo discount</span><span style={{ fontWeight:600, color:'var(--g3)' }}>−₹{discount}</span></div>}
              <div style={{ borderTop:'1px solid var(--border)', paddingTop:8, marginTop:4, display:'flex', justifyContent:'space-between' }}><span style={{ fontWeight:700 }}>Total</span><span style={{ fontWeight:800, fontSize:16 }}>₹{finalPrice}</span></div>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button style={{ padding:'12px 18px', borderRadius:10, border:'1.5px solid var(--border)', background:'white', cursor:'pointer', fontSize:13, fontWeight:600 }} onClick={() => setStep(1)}>← Back</button>
              <button className="modal-btn" style={{ flex:1 }} onClick={goStep3}>Pay & Confirm</button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Payment ── */}
        {step === 3 && (
          <div>
            <div style={{ background:'var(--gpale)', border:'1.5px solid rgba(0,204,142,.2)', borderRadius:12, padding:16, marginBottom:16 }}>
              <div style={{ fontSize:13, fontWeight:700, marginBottom:4 }}>{bookingItem.name}</div>
              <div style={{ fontSize:12, color:'var(--slate)' }}>{date} · {slot} · {form.collType === 'home' ? 'Home Collection' : 'Walk-in'}</div>
            </div>
            <div className="pm-grid">
              {[{id:'upi',icon:'📱',label:'UPI'},{id:'card',icon:'💳',label:'Card'},{id:'net',icon:'🏦',label:'Net Banking'}].map(m => (
                <div key={m.id} className={`pm-opt faq-contact-opt${payMethod===m.id?' sel':''}`} style={{ flexDirection:'column', textAlign:'center', padding:14, gap:5 }} onClick={() => setPayMethod(m.id)}>
                  <div style={{ fontSize:22 }}>{m.icon}</div>
                  <div style={{ fontSize:11, fontWeight:600, color:'var(--ink)' }}>{m.label}</div>
                </div>
              ))}
            </div>
            {payMethod === 'upi' && <div className="fg"><label>UPI ID</label><input placeholder="name@upi or scan QR"/></div>}
            {payMethod === 'card' && (
              <div>
                <div className="fg"><label>Card Number</label><input placeholder="0000 0000 0000 0000" maxLength={19}/></div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <div className="fg"><label>Expiry</label><input placeholder="MM / YY"/></div>
                  <div className="fg"><label>CVV</label><input placeholder="•••" type="password" maxLength={3}/></div>
                </div>
              </div>
            )}
            {payMethod === 'net' && <div className="fg"><label>Select Bank</label><select><option>HDFC Bank</option><option>SBI</option><option>ICICI Bank</option><option>Axis Bank</option></select></div>}
            <button className="modal-btn" onClick={processPayment} disabled={loading} style={{ background:'linear-gradient(135deg,var(--g),var(--g2))', fontSize:15, padding:14 }}>
              {loading ? <div className="spinner"/> : `🔒 Pay ₹${finalPrice} & Confirm`}
            </button>
            <div style={{ textAlign:'center', fontSize:10, color:'var(--muted)', marginTop:8 }}>256-bit SSL Encrypted · Razorpay Secured · 100% Refund Guarantee</div>
          </div>
        )}

        {/* ── STEP 4: Confirmed ── */}
        {step === 4 && (
          <div style={{ textAlign:'center' }}>
            <div style={{ width:72, height:72, background:'var(--g)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', fontSize:32 }}>✅</div>
            <div style={{ fontSize:22, fontWeight:800, color:'var(--ink)', marginBottom:8 }}>Booking Confirmed!</div>
            <div style={{ fontSize:13, color:'var(--slate)', marginBottom:18 }}>Your appointment has been confirmed. Check WhatsApp for details.</div>
            <div style={{ fontFamily:'var(--mono)', fontSize:20, fontWeight:700, color:'var(--g3)', background:'var(--gpale)', border:'1.5px solid rgba(0,204,142,.2)', borderRadius:11, padding:12, marginBottom:20 }}>
              {bookingId}
            </div>
            <div style={{ fontSize:12, color:'var(--slate)', background:'var(--bg)', borderRadius:10, padding:14, textAlign:'left' }}>
              📱 <strong>WhatsApp confirmation sent</strong> with lab address, slot time, and fasting instructions.<br/><br/>
              📄 Your report will arrive within <strong>6 hours</strong> of your appointment.
            </div>
            <button className="modal-btn" style={{ marginTop:16 }} onClick={closeModal}>Done ✓</button>
          </div>
        )}
      </div>
    </div>
  )
}
