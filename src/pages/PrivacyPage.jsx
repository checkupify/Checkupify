import SEOHead from '../components/seo/SEOHead'
const S = ({h,children})=>(<div style={{marginBottom:32}}><h2 style={{fontSize:20,fontWeight:800,color:'var(--ink)',marginBottom:12}}>{h}</h2><div style={{fontSize:15,color:'#475569',lineHeight:1.85}}>{children}</div></div>)
export default function PrivacyPage() {
  return (<>
    <SEOHead title="Privacy Policy | Checkupify" description="Checkupify's privacy policy — how we collect, use, and protect your health data in compliance with India's DPDP Act." canonical="https://checkupify.com/privacy-policy"/>
    <div style={{background:'linear-gradient(160deg,#f0fdf9,#fff)',padding:'64px 0 32px',textAlign:'center'}}>
      <div className="container" style={{maxWidth:700}}>
        <span className="sec-tag tag-g" style={{display:'inline-flex',marginBottom:16}}>🔒 Legal</span>
        <h1 style={{fontSize:'clamp(26px,4vw,40px)',fontWeight:800,color:'var(--ink)',letterSpacing:-.8,marginBottom:16}}>Privacy Policy</h1>
        <p style={{color:'var(--slate)',fontSize:14}}>Last updated: April 20, 2026 · Effective date: April 20, 2026</p>
      </div>
    </div>
    <div style={{padding:'48px 0 80px'}}><div className="container" style={{maxWidth:820}}>
      <S h="1. Introduction"><p>Checkupify ("we", "our", or "us"), operated by Unicribe Technologies Pvt. Ltd., is committed to protecting your personal and health information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform at checkupify.com and our mobile application.</p><br/><p>By using Checkupify, you consent to the practices described in this policy. This policy is compliant with India's Digital Personal Data Protection (DPDP) Act, 2023.</p></S>
      <S h="2. Information We Collect"><p><strong>Personal Information:</strong> Name, phone number, email address, date of birth, gender, and address (for home collection).</p><br/><p><strong>Health Information:</strong> Lab test bookings, health reports, medical history you voluntarily share, and consultation records.</p><br/><p><strong>Payment Information:</strong> We do not store your credit/debit card numbers. Payments are processed by Razorpay, a PCI-DSS compliant payment gateway.</p><br/><p><strong>Usage Data:</strong> IP address, browser type, pages visited, and time spent on pages — used to improve our service.</p></S>
      <S h="3. How We Use Your Information"><p>We use your information to: process and confirm health test bookings; coordinate home collection with phlebotomists; deliver your reports securely; provide doctor consultations; send appointment reminders; improve our platform; comply with legal obligations.</p><br/><p>We do NOT sell your personal or health data to any third party. We do NOT use your health data for advertising purposes.</p></S>
      <S h="4. Data Security"><p>All data is encrypted at rest using AES-256 encryption and in transit using TLS 1.3. Health reports are password-protected PDFs. We use Supabase (SOC 2 compliant) as our database provider. Access to health data is strictly role-based — only you and the specific healthcare provider involved in your booking can access your reports.</p></S>
      <S h="5. Data Retention"><p>We retain your account data for as long as your account is active. Health reports are retained for 7 years in compliance with Indian medical record-keeping requirements. You can request deletion of your account and non-essential data at any time by contacting support@checkupify.com.</p></S>
      <S h="6. Your Rights (DPDP Act 2023)"><p>Under India's DPDP Act, you have the right to: access the personal data we hold about you; correct inaccurate data; erase your data (subject to legal obligations); withdraw consent for data processing; nominate a person to exercise rights on your behalf; file a complaint with the Data Protection Board of India.</p></S>
      <S h="7. Contact Us"><p>Data Protection Officer: privacy@checkupify.com<br/>Unicribe Technologies Pvt. Ltd., Jubilee Hills, Hyderabad, Telangana 500033, India</p></S>
    </div></div>
  </>)
}
