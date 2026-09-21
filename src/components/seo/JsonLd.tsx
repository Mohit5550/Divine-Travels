interface JsonLdProps {
  type: 'Organization' | 'TravelAction' | 'Product' | 'BreadcrumbList' | 'FAQPage'
  data: Record<string, unknown>
}

export function JsonLd({ type, data }: JsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

export function OrganizationJsonLd() {
  return (
    <JsonLd
      type="Organization"
      data={{
        name: 'Divine Travels',
        url: 'https://divinetravels.in',
        logo: 'https://divinetravels.in/logo.png',
        description: 'India\'s Premium Travel & Adventure Booking. Sacred destinations, adventure tours, and pilgrimage packages across India.',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Rishikesh',
          addressRegion: 'Uttarakhand',
          addressCountry: 'IN',
        },
        contactPoint: {
          '@type': 'ContactPoint',
          contactType: 'customer service',
          availableLanguage: ['English', 'Hindi'],
        },
        sameAs: [],
        areaServed: {
          '@type': 'Country',
          name: 'India',
        },
      }}
    />
  )
}

export function PackageJsonLd({ pkg }: { pkg: { name: string; description?: string; price: number; image?: string; rating?: number; reviewCount?: number; category?: string } }) {
  return (
    <JsonLd
      type="Product"
      data={{
        name: pkg.name,
        description: pkg.description || pkg.name,
        image: pkg.image,
        brand: { '@type': 'Brand', name: 'Divine Travels' },
        offers: {
          '@type': 'Offer',
          priceCurrency: 'INR',
          price: pkg.price,
          availability: 'https://schema.org/InStock',
          url: 'https://divinetravels.in',
        },
        ...(pkg.rating ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: pkg.rating,
            reviewCount: pkg.reviewCount || 1,
          },
        } : {}),
      }}
    />
  )
}

export function BreadcrumbJsonLd({ items }: { items: { name: string; url: string }[] }) {
  return (
    <JsonLd
      type="BreadcrumbList"
      data={{
        itemListElement: items.map((item, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: item.name,
          item: item.url,
        })),
      }}
    />
  )
}
