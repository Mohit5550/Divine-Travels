'use client'

import { useQuery } from '@tanstack/react-query'
import { useAppStore } from '@/lib/store'
import { LoginModal } from '@/components/landing/LoginModal'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  MapPin,
  Star,
  Check,
  Wifi,
  UtensilsCrossed,
  Car,
  Dumbbell,
  Waves,
  Sparkles,
  Phone,
  MessageCircle,
  Camera,
  Users,
  Bed,
  Maximize,
  ChevronLeft,
  ChevronRight,
  Share2,
  Clock,
  Info,
  Map,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Footer } from '@/components/landing/Footer'
import { PackageJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd'
import { applyDetailSeo, SITE_URL } from '@/lib/seo'
import { useState, useEffect } from 'react'
import { getSubOptionFromName } from '@/lib/subpackage-utils'

interface RoomType {
  name: string
  price: number
  plan: string
  guests: number
  maxAdults?: number
  maxChildren?: number
  bed?: string
  size?: string
}

interface MealPlan {
  name: string
  description: string
  price: number
}

interface Amenity {
  icon: string
  name: string
}

interface PackageData {
  slug?: string
  id: string
  name: string
  tagline: string
  subtitle: string
  description: string
  price: number
  originalPrice: number | null
  image: string
  images: string
  category: string
  duration: string
  highlights: string
  inclusions: string
  exclusions: string
  location: string
  cancellationPolicy: string
  howToReach: string
  rating: number
  reviewCount: number
  badge: string | null
  badgeColor: string
  propertyType: string
  amenities: string
  roomTypes: string
  mealPlans: string
}

const amenityIcons: Record<string, React.ElementType> = {
  wifi: Wifi, parking: Car, gym: Dumbbell, pool: Waves, spa: Sparkles,
  restaurant: UtensilsCrossed, bar: UtensilsCrossed, roomservice: Clock,
  traveldesk: MapPin, conference: Users, bonfire: Sparkles, default: Check,
}

function getAmenityIcon(icon: string) {
  const key = icon?.toLowerCase().replace(/[_\-\s]/g, '') || 'default'
  return amenityIcons[key] || amenityIcons.default
}

const SUBOPTION_MAP: Record<string, string> = {
  deluxe: 'Deluxe',
  suite: 'Suite',
  standard: 'Standard',
  premium: 'Premium',
  cottage: 'Cottage',
  tent: 'Tent',
  dormitory: 'Dormitory',
  'swiss tent': 'Swiss Tent',
}


export function HotelDetail() {
  const { selectedPackageId, navigate, goBack, isAuthenticated } = useAppStore()
  const [selectedImage, setSelectedImage] = useState(0)
  const [showAllImages, setShowAllImages] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)

  const { data: pkg, isLoading } = useQuery({
    queryKey: ['package-detail', selectedPackageId],
    queryFn: async () => {
      const res = await fetch(`/api/packages/${selectedPackageId}`)
      if (!res.ok) throw new Error('Package not found')
      return res.json() as Promise<PackageData>
    },
    enabled: !!selectedPackageId,
  })

  const { data: availabilityRecords = [] } = useQuery({
    queryKey: ['availability', pkg?.category || 'stay-hotel'],
    queryFn: async () => {
      const service = pkg?.category || 'stay-hotel'
      const res = await fetch(`/api/public/availability?service=${service}`)
      const data = await res.json()
      return data.records || []
    },
    enabled: !!pkg,
  })

  const getEffectivePrice = (roomName: string, originalPrice: number) => {
    const subOption = getSubOptionFromName(roomName, SUBOPTION_MAP)
    const allDayMatch = availabilityRecords.find((r: any) => r.allDay)
    if (allDayMatch) return allDayMatch.price ?? originalPrice
    if (!subOption) return originalPrice
    const match = availabilityRecords.find((r: any) => {
      return (r.subOptions || []).includes(subOption)
    })
    return match?.price ?? originalPrice
  }

  const parsed = pkg ? {
    images: JSON.parse(pkg.images || '[]') as string[],
    highlights: JSON.parse(pkg.highlights || '[]') as string[],
    inclusions: JSON.parse(pkg.inclusions || '[]') as string[],
    exclusions: JSON.parse(pkg.exclusions || '[]') as string[],
    howToReach: JSON.parse(pkg.howToReach || '[]') as string[],
    amenities: JSON.parse(pkg.amenities || '[]') as Amenity[],
    roomTypes: JSON.parse(pkg.roomTypes || '[]') as RoomType[],
    mealPlans: JSON.parse(pkg.mealPlans || '[]') as MealPlan[],
  } : null

  const lowestRoomPrice = parsed?.roomTypes?.length
    ? Math.min(...parsed.roomTypes.map(r => getEffectivePrice(r.name, r.price)))
    : pkg?.price || 0

  const handleWhatsApp = () => {
    const msg = `Hi, I'm interested in the ${pkg?.name} property. Please share details.`
    window.open(`https://wa.me/916396919007?text=${encodeURIComponent(msg)}`, '_blank')
  }

  // Per-hotel SEO: unique title/description once data loads.
  useEffect(() => {
    if (!pkg) return
    applyDetailSeo({
      title: `${pkg.name} - Book at ₹${pkg.price.toLocaleString('en-IN')}/night`,
      desc: (pkg.tagline || pkg.subtitle || pkg.description || '').slice(0, 160),
      path: `/hotel/${pkg.slug || pkg.id}`,
    })
  }, [pkg])

  if (isLoading || !pkg || !parsed) {
    return (
      <div className="min-h-screen bg-brand-cream">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="h-96 bg-muted rounded-2xl animate-pulse" />
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-cream">
      <PackageJsonLd
        pkg={{
          name: pkg.name,
          description: pkg.tagline || pkg.subtitle || pkg.description,
          price: pkg.price,
          image: pkg.image,
          rating: pkg.rating,
          reviewCount: pkg.reviewCount,
        }}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: SITE_URL },
          { name: pkg.name, url: `${SITE_URL}/hotel/${pkg.slug || pkg.id}` },
        ]}
      />
      {/* Hero */}
      <div className="relative h-64 sm:h-80 md:h-[420px] overflow-hidden">
        <img src={pkg.image} alt={pkg.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <div className="max-w-7xl mx-auto flex items-end justify-between">
            <div>
              {pkg.badge && <span className={`text-xs font-bold px-3 py-1 rounded-full text-white ${pkg.badgeColor} mb-2 inline-block`}>{pkg.badge}</span>}
              <h1 className="text-white font-serif text-3xl sm:text-4xl font-bold">{pkg.name}</h1>
              <p className="text-white/70 text-sm mt-1 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {pkg.location || 'Rishikesh'}</p>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/40 transition-colors"><Share2 className="w-4 h-4 text-white" /></button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <button onClick={() => goBack()}
          className="inline-flex items-center gap-1 text-brand-dark bg-white shadow-sm border border-gray-200 rounded-full px-3 py-1.5 text-sm hover:bg-brand-cream transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 sm:gap-8">

          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">

            {/* About */}
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="font-serif text-xl sm:text-2xl text-brand-dark font-bold mb-3 border-l-4 border-brand-orange pl-3">About This Property</h2>
              <p className="text-gray-600 leading-relaxed">{pkg.description || pkg.subtitle || pkg.tagline}</p>
            </motion.section>

            {/* Highlights */}
            {parsed.highlights.length > 0 && (
              <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                <h2 className="font-serif text-xl sm:text-2xl text-brand-dark font-bold mb-3 border-l-4 border-brand-orange pl-3">Highlights</h2>
                <ul className="space-y-2">
                  {parsed.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-600">
                      <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </motion.section>
            )}

            {/* Amenities */}
            {parsed.amenities.length > 0 && (
              <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <h2 className="font-serif text-xl sm:text-2xl text-brand-dark font-bold mb-4 border-l-4 border-brand-orange pl-3">Amenities</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {parsed.amenities.map((a, i) => {
                    const Icon = getAmenityIcon(a.icon)
                    return (
                      <div key={i} className="flex items-center gap-2.5 bg-brand-cream/60 rounded-xl px-4 py-3">
                        <div className="w-8 h-8 rounded-lg bg-brand-orange/10 flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-brand-orange" />
                        </div>
                        <span className="text-sm font-medium text-brand-dark">{a.name}</span>
                      </div>
                    )
                  })}
                </div>
              </motion.section>
            )}

            {/* Room Types */}
            {parsed.roomTypes.length > 0 && (
              <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <h2 className="font-serif text-xl sm:text-2xl text-brand-dark font-bold mb-4 border-l-4 border-brand-orange pl-3">Room Types</h2>
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-brand-dark text-white">
                          <th className="text-left py-3 px-4 font-medium">Room Type</th>
                          <th className="text-left py-3 px-4 font-medium">Price/Night</th>
                          <th className="text-left py-3 px-4 font-medium hidden sm:table-cell">Plan</th>
                          <th className="text-center py-3 px-4 font-medium hidden md:table-cell">Guests</th>
                          <th className="text-left py-3 px-4 font-medium hidden md:table-cell">Bed</th>
                          <th className="text-left py-3 px-4 font-medium hidden lg:table-cell">Size</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsed.roomTypes.map((room, i) => (
                          <tr key={i} className="border-b border-gray-100 hover:bg-brand-cream/30 transition-colors">
                            <td className="py-3 px-4 font-medium text-brand-dark">{room.name}</td>
                            <td className="py-3 px-4 text-brand-orange font-bold">₹{getEffectivePrice(room.name, room.price).toLocaleString()}</td>
                            <td className="py-3 px-4 text-gray-500 hidden sm:table-cell">{room.plan}</td>
                            <td className="py-3 px-4 text-center hidden md:table-cell">
                              <span className="inline-flex items-center gap-1 text-gray-500"><Users className="w-3.5 h-3.5" /> {room.guests}</span>
                            </td>
                            <td className="py-3 px-4 hidden md:table-cell">
                              <span className="inline-flex items-center gap-1 text-gray-500"><Bed className="w-3.5 h-3.5" /> {room.bed}</span>
                            </td>
                            <td className="py-3 px-4 hidden lg:table-cell">
                              <span className="inline-flex items-center gap-1 text-gray-500"><Maximize className="w-3.5 h-3.5" /> {room.size}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.section>
            )}

            {/* Meal Plans */}
            {parsed.mealPlans.length > 0 && (
              <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <h2 className="font-serif text-xl sm:text-2xl text-brand-dark font-bold mb-4 border-l-4 border-brand-orange pl-3">Meal Plans</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {parsed.mealPlans.map((plan, i) => (
                    <div key={i} className="bg-brand-cream/60 rounded-xl p-4 border border-brand-orange/10">
                      <div className="font-bold text-brand-dark text-lg">{plan.name}</div>
                      <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                      {plan.price > 0 && <p className="text-brand-orange font-semibold text-sm mt-2">+₹{plan.price.toLocaleString()}/night</p>}
                    </div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Gallery */}
            {parsed.images.length > 0 && (
              <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                <h2 className="font-serif text-xl sm:text-2xl text-brand-dark font-bold mb-4 border-l-4 border-brand-orange pl-3">Gallery</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {parsed.images.slice(0, showAllImages ? parsed.images.length : 6).map((img, i) => (
                    <button key={i} onClick={() => { setSelectedImage(i); setShowAllImages(true) }} className="relative h-32 sm:h-40 rounded-xl overflow-hidden group">
                      <img src={img} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    </button>
                  ))}
                </div>
                {parsed.images.length > 6 && !showAllImages && (
                  <button onClick={() => setShowAllImages(true)} className="mt-3 text-brand-orange text-sm font-medium hover:underline flex items-center gap-1">
                    <Camera className="w-3.5 h-3.5" /> View all {parsed.images.length} photos
                  </button>
                )}
              </motion.section>
            )}

            {/* Inclusions */}
            {parsed.inclusions.length > 0 && (
              <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <h2 className="font-serif text-xl sm:text-2xl text-brand-dark font-bold mb-3 border-l-4 border-emerald-500 pl-3">Inclusions</h2>
                <ul className="space-y-2">
                  {parsed.inclusions.map((inc, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-600">
                      <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      <span>{inc}</span>
                    </li>
                  ))}
                </ul>
              </motion.section>
            )}

            {/* Exclusions */}
            {parsed.exclusions.length > 0 && (
              <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}>
                <h2 className="font-serif text-xl sm:text-2xl text-brand-dark font-bold mb-3 border-l-4 border-red-400 pl-3">Exclusions</h2>
                <ul className="space-y-2">
                  {parsed.exclusions.map((exc, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-600">
                      <span className="w-4 h-4 text-red-400 mt-0.5 shrink-0 flex items-center justify-center text-xs font-bold">✕</span>
                      <span>{exc}</span>
                    </li>
                  ))}
                </ul>
              </motion.section>
            )}

            {/* Hotel Policies */}
            {pkg.cancellationPolicy && (
              <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                <h2 className="font-serif text-xl sm:text-2xl text-brand-dark font-bold mb-3 border-l-4 border-brand-orange pl-3">Hotel Policies</h2>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">{pkg.cancellationPolicy}</p>
                </div>
              </motion.section>
            )}

            {/* How to Reach */}
            {parsed.howToReach.length > 0 && (
              <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}>
                <h2 className="font-serif text-xl sm:text-2xl text-brand-dark font-bold mb-3 border-l-4 border-brand-orange pl-3">How to Reach</h2>
                <div className="bg-white rounded-xl p-4 shadow-sm space-y-2">
                  {parsed.howToReach.map((item, i) => (
                    <div key={i} className="flex items-start gap-2 text-gray-600 text-sm">
                      <Map className="w-4 h-4 text-brand-orange mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Location Map */}
            {pkg.location && (
              <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <h2 className="font-serif text-xl sm:text-2xl text-brand-dark font-bold mb-3 border-l-4 border-brand-orange pl-3">Location</h2>
                <div className="bg-white rounded-xl overflow-hidden shadow-sm h-48 sm:h-64 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <MapPin className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">{pkg.location || 'Rishikesh, Uttarakhand'}</p>
                  </div>
                </div>
              </motion.section>
            )}
          </div>

          {/* Right Sidebar - Sticky */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="mb-4">
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Starting from</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    {pkg.originalPrice && pkg.originalPrice > lowestRoomPrice && (
                      <span className="text-lg line-through text-red-500 font-medium">₹{pkg.originalPrice.toLocaleString()}</span>
                    )}
                    <span className="text-3xl font-bold text-brand-dark">₹{lowestRoomPrice.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">per night</p>
                </div>

                {pkg.rating > 0 && (
                  <div className="flex items-center gap-1.5 mb-4 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(pkg.rating) ? 'fill-brand-gold text-brand-gold' : 'text-gray-200'}`} />
                      ))}
                    </div>
                    <span className="text-sm font-semibold text-brand-dark">{pkg.rating}</span>
                    <span className="text-xs text-gray-400">({pkg.reviewCount} reviews)</span>
                  </div>
                )}

                <Button onClick={() => {
                  if (!isAuthenticated) { setLoginOpen(true); return }
                  navigate('package-booking', null, pkg.id)
                }} className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white rounded-xl h-12 text-base font-semibold mb-3">
                  Book Now
                </Button>

                <Button onClick={handleWhatsApp} variant="outline" className="w-full border-green-500 text-green-600 hover:bg-green-50 rounded-xl h-11 text-sm font-medium mb-3">
                  <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp Enquiry
                </Button>

                <div className="text-center pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-400">Need help? Call us</p>
                  <a href="tel:+916396919007" className="text-brand-dark font-bold text-lg hover:text-brand-orange transition-colors flex items-center justify-center gap-1 mt-0.5">
                    <Phone className="w-4 h-4" /> +91 63969 19007
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {showAllImages && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4" onClick={() => setShowAllImages(false)}>
          <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 text-white z-10" onClick={() => setShowAllImages(false)}>✕</button>
          {parsed.images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setSelectedImage((selectedImage - 1 + parsed.images.length) % parsed.images.length) }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 text-white z-10 transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setSelectedImage((selectedImage + 1) % parsed.images.length) }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 text-white z-10 transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
          <img src={parsed.images[selectedImage] || pkg.image} alt="" className="max-w-full max-h-[80vh] object-contain rounded-xl" onClick={e => e.stopPropagation()} />
          <div className="flex items-center justify-center gap-2 mt-4 absolute bottom-6 left-0 right-0">
            {parsed.images.map((_, i) => (
              <button key={i} onClick={e => { e.stopPropagation(); setSelectedImage(i) }} className={`w-2.5 h-2.5 rounded-full transition-colors ${i === selectedImage ? 'bg-brand-orange' : 'bg-white/40'}`} />
            ))}
          </div>
        </div>
      )}

      <Footer />
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  )
}
