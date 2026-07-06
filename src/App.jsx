import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { AppProvider } from './context/AppContext'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import AnnounceBanner from './components/layout/AnnounceBanner'
import LoginModal from './components/modals/LoginModal'
import BookingModal from './components/modals/BookingModal'
import CityModal from './components/modals/CityModal'
import AccountModal from './components/modals/AccountModal'
import { MobileDrawer, WhatsAppFloat, Toast } from './components/ui/Toast'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import FounderPage from './pages/FounderPage'
import ServicesPage from './pages/ServicesPage'
import ContactPage from './pages/ContactPage'
import FAQPage from './pages/FAQPage'
import PrivacyPage from './pages/PrivacyPage'
import TermsPage from './pages/TermsPage'
import BlogPage from './pages/BlogPage'
import BlogPost from './pages/BlogPost'
import CityPage from './pages/city/CityPage'
import NotFoundPage from './pages/NotFoundPage'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function AppLayout() {
  return (
    <div>
      <AnnounceBanner />
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/founder" element={<FounderPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/privacy-policy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/health-checkup-in-hyderabad" element={<CityPage city="Hyderabad" />} />
        <Route path="/health-checkup-in-bangalore" element={<CityPage city="Bangalore" />} />
        <Route path="/health-checkup-in-mumbai" element={<CityPage city="Mumbai" />} />
        <Route path="/health-checkup-in-delhi" element={<CityPage city="Delhi" />} />
        <Route path="/health-checkup-in-chennai" element={<CityPage city="Chennai" />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Footer />
      <LoginModal /><BookingModal /><CityModal /><AccountModal />
      <MobileDrawer /><WhatsAppFloat /><Toast />
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <ScrollToTop />
        <AppLayout />
      </BrowserRouter>
    </AppProvider>
  )
}
