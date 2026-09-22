// Central SEO helper for the SPA. Every client-side navigation flows through
// syncURL() in the store, which calls applyPageSeo() — so document title,
// meta description, canonical and robots always match the visible view.

export const SITE_URL = 'https://divinetravels.in'

interface ViewMeta {
  title: string
  desc: string
  noindex?: boolean
}

const DEFAULT_DESC =
  'Discover sacred destinations, adventure tours, and pilgrimage packages across India. Book taxis, tours, and holidays with verified drivers and transparent pricing.'

const VIEW_META: Record<string, ViewMeta> = {
  landing: {
    title: "Divine Travels - India's Premium Travel & Adventure Booking",
    desc: DEFAULT_DESC,
  },
  'rishikesh-tour': {
    title: 'Rishikesh Tour Packages | Rafting, Camping & Sightseeing - Divine Travels',
    desc: 'Book Rishikesh tour packages with river rafting, riverside camping, Ganga Aarti and sightseeing. Verified operators, transparent pricing.',
  },
  'haridwar-tour': {
    title: 'Haridwar Tour Packages | Ganga Aarti & Temple Tours - Divine Travels',
    desc: 'Book Haridwar tour packages with Ganga Aarti at Har Ki Pauri, Mansa Devi and Chandi Devi temples. Verified drivers, best prices.',
  },
  'mussoorie-tour': {
    title: 'Mussoorie Tour Packages | Queen of Hills Trips - Divine Travels',
    desc: 'Book Mussoorie tour packages with Kempty Falls, Mall Road, Gun Hill and Dhanaulti excursions. Comfortable stays, transparent pricing.',
  },
  'nainital-tour': {
    title: 'Nainital Tour Packages | Naini Lake & Hill Stations - Divine Travels',
    desc: 'Book Nainital tour packages with Naini Lake boating, Naina Devi Temple, Snow View Point and Bhimtal. Family-friendly itineraries.',
  },
  'hill-stations-tour': {
    title: 'Hill Station Tours Uttarakhand | Mussoorie, Nainital & More - Divine Travels',
    desc: 'Explore Uttarakhand hill stations with curated tour packages covering Mussoorie, Nainital, Dhanaulti, Kanatal and Lansdowne.',
  },
  'char-dham-tour': {
    title: 'Char Dham Yatra Packages 2026 | Kedarnath, Badrinath, Gangotri, Yamunotri',
    desc: 'Book Char Dham Yatra packages with helicopter options, VIP darshan, stays and transport. Yamunotri, Gangotri, Kedarnath, Badrinath.',
  },
  'rafting-packages': {
    title: 'River Rafting in Rishikesh | 9km, 16km, 26km Rapids Booking',
    desc: 'Book white water rafting in Rishikesh — Brahmpuri 9km, Shivpuri 16km and Marine Drive 26km stretches with certified guides and gear.',
  },
  'bike-rental': {
    title: 'Bike Rental in Rishikesh | Royal Enfield, Activa & Scooty on Rent',
    desc: 'Rent bikes in Rishikesh — Royal Enfield Himalayan, Classic 350, Activa and scooty at daily rates with helmets included.',
  },
  'taxi-booking': {
    title: 'Taxi Booking in Rishikesh | Sedan, SUV, Tempo Traveller Cabs',
    desc: 'Book private taxis in Rishikesh for Char Dham, airport transfers and sightseeing. Sedan, SUV and Tempo Traveller with verified drivers.',
  },
  'taxi-booking-form': {
    title: 'Book Your Taxi - Divine Travels',
    desc: 'Complete your taxi booking with Divine Travels.',
    noindex: true,
  },
  trekking: {
    title: 'Trekking in Uttarakhand | Kedarkantha, Nag Tibba & Valley of Flowers',
    desc: 'Book guided treks in Uttarakhand — Kedarkantha, Nag Tibba, Har Ki Dun and Valley of Flowers with gear, meals and certified trek leaders.',
  },
  adventure: {
    title: 'Adventure Activities in Rishikesh | Bungee, Swing, Zipline & More',
    desc: 'Book adventure activities in Rishikesh — bungee jumping, giant swing, flying fox, zipline and kayaking with safety-certified operators.',
  },
  'domestic-tours': {
    title: 'Domestic Tour Packages India | Kashmir, Kerala, Goa & More',
    desc: 'Book domestic holiday packages across India — Kashmir, Kerala, Goa, Himachal and Rajasthan with flights, stays and sightseeing.',
  },
  'spiritual-tours': {
    title: 'Spiritual & Pilgrimage Tours India | Char Dham, Ayodhya, Ujjain',
    desc: 'Book spiritual tour packages — Char Dham Yatra, Ayodhya, Ujjain Mahakal, Varanasi with VIP darshan arrangements and satvik stays.',
  },
  'international-tours': {
    title: 'International Tour Packages | Thailand, Dubai, Bali, Singapore',
    desc: 'Book international holiday packages — Thailand, Dubai, Bali, Singapore and Malaysia with visa assistance, flights and hotels.',
  },
  'hotel-packages': {
    title: 'Hotels in Rishikesh & Jim Corbett | Riverside Resorts Booking',
    desc: 'Book handpicked hotels and riverside resorts in Rishikesh, Haridwar and Jim Corbett at transparent per-night prices.',
  },
  'camping-packages': {
    title: 'Camping in Rishikesh | Riverside Camps with Meals & Bonfire',
    desc: 'Book riverside camping in Rishikesh with Swiss tents, all meals, bonfire and adventure activities. Group-size pricing available.',
  },
  gallery: {
    title: 'Travel Photo Gallery | Rishikesh, Treks & Tours - Divine Travels',
    desc: 'Browse photos from our tours, treks, rafting trips and camps across Uttarakhand and India.',
  },
  collaborate: {
    title: 'Creator Collaboration Program | Travel With Divine Travels',
    desc: 'Travel creators: collaborate with Divine Travels on barter, affiliate and paid partnerships across adventures and destinations.',
  },
  'about-us': {
    title: 'About Us | Divine Travels Rishikesh',
    desc: 'Divine Travels is a Rishikesh-based travel company offering verified tours, adventures, stays and taxi services across India.',
  },
  contact: {
    title: 'Contact Us | Divine Travels Rishikesh',
    desc: 'Contact Divine Travels for bookings and enquiries — call, WhatsApp or send us a message. Based in Muni Ki Reti, Rishikesh.',
  },
  'user-dashboard': {
    title: 'My Dashboard - Divine Travels',
    desc: 'Manage your bookings, wishlist and profile.',
    noindex: true,
  },
  'admin-dashboard': {
    title: 'Admin Panel - Divine Travels',
    desc: 'Admin panel.',
    noindex: true,
  },
  'privacy-policy': {
    title: 'Privacy Policy - Divine Travels',
    desc: 'How Divine Travels collects, uses and protects your personal information.',
  },
  'terms-of-service': {
    title: 'Terms of Service - Divine Travels',
    desc: 'Terms and conditions for using Divine Travels booking services.',
  },
  'refund-policy': {
    title: 'Refund Policy - Divine Travels',
    desc: 'Divine Travels refund policy for tour, hotel and activity bookings.',
  },
  'cancellation-policy': {
    title: 'Cancellation Policy - Divine Travels',
    desc: 'Divine Travels booking cancellation terms and charges.',
  },
  'cookie-policy': {
    title: 'Cookie Policy - Divine Travels',
    desc: 'How Divine Travels uses cookies on this website.',
  },
  'blog-archive': {
    title: 'Travel Blog | Guides for Rishikesh, Treks & Yatras - Divine Travels',
    desc: 'Travel guides, rafting tips, trek checklists and yatra updates from the Divine Travels blog.',
  },
  'destination-detail': {
    title: 'Destination - Divine Travels',
    desc: DEFAULT_DESC,
  },
  'booking-success': {
    title: 'Booking Confirmed - Divine Travels',
    desc: 'Your booking request has been received.',
    noindex: true,
  },
  'package-detail': {
    title: 'Tour Package - Divine Travels',
    desc: DEFAULT_DESC,
  },
  'package-booking': {
    title: 'Complete Your Booking - Divine Travels',
    desc: 'Complete your booking with Divine Travels.',
    noindex: true,
  },
  'company-detail': {
    title: 'Partner - Divine Travels',
    desc: DEFAULT_DESC,
  },
  'blog-single': {
    title: 'Blog - Divine Travels',
    desc: DEFAULT_DESC,
  },
  'hotel-detail': {
    title: 'Hotel - Divine Travels',
    desc: DEFAULT_DESC,
  },
}

function setMeta(attr: 'name' | 'property', key: string, value: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', value)
}

function setCanonical(path: string) {
  let el = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', SITE_URL + path)
}

// Apply view-level SEO (generic title/desc; detail pages refine it once data loads).
export function applyPageSeo(view: string) {
  if (typeof document === 'undefined' || typeof window === 'undefined') return
  const m = VIEW_META[view] || VIEW_META.landing
  document.title = m.title
  setMeta('name', 'description', m.desc)
  setMeta('name', 'robots', m.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large')
  setMeta('property', 'og:title', m.title)
  setMeta('property', 'og:description', m.desc)
  setCanonical(window.location.pathname)
}

// Refine SEO once detail data (package/hotel/destination/blog/company) loads.
export function applyDetailSeo(opts: { title: string; desc?: string; path?: string; noindex?: boolean }) {
  if (typeof document === 'undefined' || typeof window === 'undefined') return
  const title = `${opts.title} | Divine Travels`
  const desc = opts.desc || DEFAULT_DESC
  document.title = title
  setMeta('name', 'description', desc)
  setMeta('name', 'robots', opts.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large')
  setMeta('property', 'og:title', title)
  setMeta('property', 'og:description', desc)
  setCanonical(opts.path || window.location.pathname)
}
