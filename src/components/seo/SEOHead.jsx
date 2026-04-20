import { useEffect } from 'react'

export default function SEOHead({
  title = 'Checkupify — Book Lab Tests, Health Checkups & Doctor Consultation',
  description = 'Book NABL-certified lab tests, full body health checkups & doctor consultations online. Home collection available. Reports in 6 hours on WhatsApp. Trusted by 50,000+ patients across India.',
  keywords = 'health checkup, lab test booking, blood test home collection, full body checkup Hyderabad, NABL certified lab, doctor consultation online',
  canonical = 'https://checkupify.com',
  ogImage = 'https://checkupify.com/og-image.jpg',
  schema = null,
}) {
  useEffect(() => {
    // Title
    document.title = title

    const setMeta = (name, content, prop = false) => {
      const attr = prop ? 'property' : 'name'
      let el = document.querySelector(`meta[${attr}="${name}"]`)
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, name); document.head.appendChild(el) }
      el.setAttribute('content', content)
    }

    setMeta('description', description)
    setMeta('keywords', keywords)
    setMeta('robots', 'index, follow')
    setMeta('author', 'Checkupify — Unicribe Technologies')

    // Open Graph
    setMeta('og:title', title, true)
    setMeta('og:description', description, true)
    setMeta('og:image', ogImage, true)
    setMeta('og:url', canonical, true)
    setMeta('og:type', 'website', true)
    setMeta('og:site_name', 'Checkupify', true)

    // Twitter
    setMeta('twitter:card', 'summary_large_image')
    setMeta('twitter:title', title)
    setMeta('twitter:description', description)
    setMeta('twitter:image', ogImage)

    // Canonical
    let canon = document.querySelector('link[rel="canonical"]')
    if (!canon) { canon = document.createElement('link'); canon.rel = 'canonical'; document.head.appendChild(canon) }
    canon.href = canonical

    // Schema
    let schemaEl = document.getElementById('schema-markup')
    if (schema) {
      if (!schemaEl) { schemaEl = document.createElement('script'); schemaEl.id = 'schema-markup'; schemaEl.type = 'application/ld+json'; document.head.appendChild(schemaEl) }
      schemaEl.textContent = JSON.stringify(schema)
    } else if (schemaEl) {
      schemaEl.remove()
    }
  }, [title, description, keywords, canonical, ogImage, schema])

  return null
}

// Common schemas
export const orgSchema = {
  '@context': 'https://schema.org',
  '@type': ['MedicalOrganization', 'LocalBusiness'],
  name: 'Checkupify',
  url: 'https://checkupify.com',
  logo: 'https://checkupify.com/logo.svg',
  description: 'India\'s trusted preventive healthcare platform — NABL certified lab tests, health checkups & doctor consultations.',
  telephone: '+91-9999999999',
  email: 'support@checkupify.com',
  address: { '@type': 'PostalAddress', streetAddress: 'Jubilee Hills', addressLocality: 'Hyderabad', addressRegion: 'Telangana', postalCode: '500033', addressCountry: 'IN' },
  sameAs: ['https://twitter.com/checkupify', 'https://linkedin.com/company/checkupify'],
  openingHours: 'Mo-Su 07:00-22:00',
  priceRange: '₹₹',
  aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.9', reviewCount: '50000', bestRating: '5' }
}

export const faqSchema = (faqs) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(f => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a }
  }))
})
