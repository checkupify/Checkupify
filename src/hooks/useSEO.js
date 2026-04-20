import { useEffect } from 'react'

export function useSEO({ title, description, canonical, schema }) {
  useEffect(() => {
    // Title
    document.title = title || 'Checkupify — Healthcare in 3 Clicks'

    // Meta description
    let desc = document.querySelector('meta[name="description"]')
    if (!desc) { desc = document.createElement('meta'); desc.name = 'description'; document.head.appendChild(desc) }
    desc.content = description || 'Book lab tests from NABL-certified labs, consult top doctors, and get WhatsApp reports in 6 hours.'

    // OG tags
    const ogTags = {
      'og:title': title,
      'og:description': description,
      'og:url': canonical || window.location.href,
      'og:type': 'website',
      'og:image': 'https://checkupify.com/og-image.jpg',
      'og:site_name': 'Checkupify',
      'twitter:card': 'summary_large_image',
      'twitter:title': title,
      'twitter:description': description,
    }
    Object.entries(ogTags).forEach(([prop, content]) => {
      if (!content) return
      let el = document.querySelector(`meta[property="${prop}"]`) || document.querySelector(`meta[name="${prop}"]`)
      if (!el) {
        el = document.createElement('meta')
        if (prop.startsWith('og:')) el.setAttribute('property', prop)
        else el.setAttribute('name', prop)
        document.head.appendChild(el)
      }
      el.content = content
    })

    // Canonical
    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]')
      if (!link) { link = document.createElement('link'); link.rel = 'canonical'; document.head.appendChild(link) }
      link.href = canonical
    }

    // Schema JSON-LD
    if (schema) {
      let existing = document.getElementById('schema-jsonld')
      if (existing) existing.remove()
      const script = document.createElement('script')
      script.id = 'schema-jsonld'
      script.type = 'application/ld+json'
      script.text = JSON.stringify(schema)
      document.head.appendChild(script)
    }

    return () => {
      if (schema) {
        const el = document.getElementById('schema-jsonld')
        if (el) el.remove()
      }
    }
  }, [title, description, canonical, schema])
}

// Base schema for organization
export const ORG_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': ['MedicalOrganization', 'LocalBusiness'],
  name: 'Checkupify',
  url: 'https://checkupify.com',
  logo: 'https://checkupify.com/logo.png',
  description: 'Book lab tests, consult doctors, get reports in 6 hours. NABL certified labs across India.',
  telephone: '+91-XXXXXXXXXX',
  email: 'support@checkupify.com',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Hyderabad',
    addressRegion: 'Telangana',
    addressCountry: 'IN',
  },
  sameAs: [
    'https://www.facebook.com/checkupify',
    'https://www.linkedin.com/company/checkupify',
    'https://twitter.com/checkupify',
  ],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Health Checkup Services',
    itemListElement: [
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Full Body Checkup' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Doctor Consultation' } },
    ]
  }
}
