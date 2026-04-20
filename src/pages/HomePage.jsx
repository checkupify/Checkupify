import SEOHead, { orgSchema } from '../components/seo/SEOHead'
import HeroSection from '../components/sections/HeroSection'
import { TrustBar, QuickActions, OffersSection } from '../components/sections/TrustBar'
import TestsSection from '../components/sections/TestsSection'
import PackagesSection from '../components/sections/PackagesSection'
import HowItWorks from '../components/sections/HowItWorks'
import LabsSection from '../components/sections/LabsSection'
import DoctorsSection from '../components/sections/DoctorsSection'
import { TestimonialsSection, PlansSection } from '../components/sections/TestimonialsSection'
import FAQSection from '../components/sections/FAQSection'
import AppDownload from '../components/sections/AppDownload'

export default function HomePage() {
  return (
    <>
      <SEOHead
        title="Checkupify — Book Lab Tests & Health Checkups Online | NABL Certified Labs India"
        description="Book lab tests, full body health checkups & doctor consultations online. NABL-certified labs. Home collection available. Reports in 6 hours on WhatsApp. Trusted by 50,000+ patients in Hyderabad, Bangalore & across India."
        keywords="health checkup online, book lab test, full body checkup, blood test home collection, NABL certified lab, doctor consultation online, preventive health checkup India"
        canonical="https://checkupify.com"
        schema={orgSchema}
      />
      <HeroSection />
      <TrustBar />
      <QuickActions />
      <OffersSection />
      <TestsSection />
      <PackagesSection />
      <HowItWorks />
      <LabsSection />
      <DoctorsSection />
      <TestimonialsSection />
      <PlansSection />
      <FAQSection />
      <AppDownload />
    </>
  )
}
