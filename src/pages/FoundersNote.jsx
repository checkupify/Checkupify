import { useSEO } from '../hooks/useSEO'
import { Link } from 'react-router-dom'

export default function FoundersNote() {
  useSEO({
    title: "Founder's Note — Why We Built Checkupify | Surya Vamshi",
    description: "Read the authentic story behind Checkupify — why we started, what problem we're solving, and our mission to make preventive healthcare accessible to every Indian family.",
    canonical: 'https://checkupify.com/founders-note',
  })

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, var(--navy), var(--navy2))', padding: '80px 0 60px', textAlign: 'center' }}>
        <div className="container">
          <span className="sec-tag" style={{ background: 'rgba(0,204,142,.15)', color: 'var(--g)', display: 'inline-flex', marginBottom: 16 }}>📖 Founder's Note</span>
          <h1 style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 800, color: 'white', letterSpacing: '-1px', marginBottom: 16, lineHeight: 1.15 }}>
            We Built Checkupify Because<br/>Someone Had to.
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,.6)', maxWidth: 560, margin: '0 auto' }}>
            A personal letter from the founder — on healthcare, India, and why we refuse to accept the status quo.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container" style={{ maxWidth: 760, padding: '60px 20px' }}>
        <div style={{ background: 'white', borderRadius: 20, padding: '48px', boxShadow: 'var(--sh2)', border: '1px solid var(--border)' }}>

          {/* Author */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 40, paddingBottom: 32, borderBottom: '1px solid var(--border)' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, var(--g), var(--navy))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>👨‍💼</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--ink)' }}>Surya Vamshi</div>
              <div style={{ fontSize: 13, color: 'var(--slate)' }}>Founder & CEO, Checkupify · Unicribe Technologies</div>
            </div>
          </div>

          <div style={{ fontSize: 16, lineHeight: 1.85, color: 'var(--slate)' }}>

            <p style={{ marginBottom: 24 }}>
              <strong style={{ color: 'var(--ink)' }}>My grandfather was a strong man.</strong> He worked his farm for 50 years without a single sick day. Or so we thought.
            </p>
            <p style={{ marginBottom: 24 }}>
              In 2019, he collapsed. The doctors said his kidneys had been failing silently for years. A simple blood test — one that costs less than a restaurant meal — would have caught it. We never knew to get one. He never knew to ask.
            </p>
            <p style={{ marginBottom: 24 }}>
              That moment changed everything for me.
            </p>

            <div style={{ background: 'var(--gpale)', border: '2px solid rgba(0,204,142,.2)', borderRadius: 14, padding: 24, margin: '32px 0' }}>
              <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--g3)', margin: 0, lineHeight: 1.6 }}>
                "India has a healthcare problem. But it's not a shortage of hospitals or doctors. It's a shortage of <em>action</em> — the simple decision to get checked before it's too late."
              </p>
            </div>

            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)', margin: '36px 0 16px', letterSpacing: '-.5px' }}>The Real Problem We Saw</h2>
            <p style={{ marginBottom: 24 }}>
              Most Indians are reactive, not proactive, about their health. And honestly? The system doesn't make it easy to be proactive. Labs are confusing. Prices are opaque. Reports arrive in formats nobody understands. You need to physically visit three different places just to get a checkup done.
            </p>
            <p style={{ marginBottom: 24 }}>
              We surveyed 500 families across Hyderabad. <strong style={{ color: 'var(--ink)' }}>73% hadn't gotten a full body checkup in over 2 years.</strong> Not because they didn't care about their health — but because the process was too complicated, too time-consuming, and honestly, a little scary.
            </p>

            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)', margin: '36px 0 16px', letterSpacing: '-.5px' }}>What Checkupify Is Built to Do</h2>
            <p style={{ marginBottom: 24 }}>
              We built Checkupify to make preventive healthcare as easy as ordering food. Book in 3 clicks. Sample collected at your door. Report on WhatsApp in 6 hours. Doctor consultation included.
            </p>
            <p style={{ marginBottom: 24 }}>
              But it's more than convenience. It's about <strong style={{ color: 'var(--ink)' }}>trust</strong>. Every lab partner on our platform is NABL certified. Every price is shown upfront. Every report comes explained in plain language — not medical jargon that sends you spiralling into anxiety on Google.
            </p>

            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)', margin: '36px 0 16px', letterSpacing: '-.5px' }}>Our Promise to You</h2>
            <p style={{ marginBottom: 16 }}>We make four promises to every person who books with Checkupify:</p>
            {[
              ['🏅 Quality', 'Only NABL-certified labs. No compromises.'],
              ['💰 Transparency', 'The price you see is the price you pay. No hidden charges.'],
              ['⚡ Speed', 'Reports within 6 hours. Not next week.'],
              ['🤝 Care', 'We are your health partner — not just a booking platform.'],
            ].map(([icon, text]) => (
              <div key={icon} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12, padding: '12px 16px', background: 'var(--bg)', borderRadius: 10 }}>
                <span style={{ fontSize: 20 }}>{icon.split(' ')[0]}</span>
                <div><strong style={{ color: 'var(--ink)' }}>{icon.split(' ')[1]}</strong> — {text}</div>
              </div>
            ))}

            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)', margin: '36px 0 16px', letterSpacing: '-.5px' }}>The India We're Building For</h2>
            <p style={{ marginBottom: 24 }}>
              I grew up watching my parents skip health checkups because they were "too expensive" or "too much trouble." I see the same pattern in millions of Indian families. The father who hasn't had a checkup in 5 years. The mother who puts everyone's health before her own. The young professional who only sees a doctor when the fever won't break.
            </p>
            <p style={{ marginBottom: 24 }}>
              Checkupify is for all of them. We're not building another healthcare app. We're building India's <strong style={{ color: 'var(--ink)' }}>default health companion</strong> — the thing you do automatically, like booking a cab or paying a bill, because it's that simple.
            </p>

            <div style={{ background: 'var(--navy)', borderRadius: 16, padding: 28, margin: '36px 0', color: 'white' }}>
              <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>We're just getting started.</p>
              <p style={{ color: 'rgba(255,255,255,.65)', fontSize: 14, lineHeight: 1.7, marginBottom: 0 }}>
                We launched with 6 labs in Hyderabad. Today we serve thousands of families. Tomorrow, we aim to be in every city, every neighbourhood — making sure no Indian family ever says "I didn't know I needed to get checked."
              </p>
            </div>

            <p style={{ marginBottom: 8 }}>Thank you for trusting us with your health.</p>
            <p style={{ marginBottom: 32 }}>It's the biggest responsibility we've ever had, and we don't take it lightly.</p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, var(--g), var(--navy))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>👨‍💼</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--ink)' }}>Surya Vamshi</div>
                <div style={{ fontSize: 12, color: 'var(--g3)', fontWeight: 600 }}>Founder, Checkupify · Hyderabad</div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <p style={{ color: 'var(--slate)', marginBottom: 16 }}>Ready to take charge of your health?</p>
          <Link to="/services" style={{ display: 'inline-block', background: 'var(--g)', color: 'var(--ink)', fontWeight: 700, padding: '14px 32px', borderRadius: 12, fontSize: 15, textDecoration: 'none' }}>
            Book Your First Checkup →
          </Link>
        </div>
      </div>
    </div>
  )
}
