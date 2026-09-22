'use client'

import { useAppStore } from '@/lib/store'
import { PackageWishlistOverlay } from '@/components/cart/PackageWishlistOverlay'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Globe,
  Clock,
  MapPin,
  Star,
  ChevronRight,
  Eye,
  MessageCircle,
  Phone,
  Compass,
  Filter,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Navbar } from '@/components/landing/Navbar'
import { BackButton } from '@/components/ui/BackButton'
import { ActivityBar } from '@/components/landing/ActivityBar'
import { Footer } from '@/components/landing/Footer'
import { getSubOptionFromName } from '@/lib/subpackage-utils'

interface PackageData {
  slug?: string
  id: string
  name: string
  tagline: string
  subtitle: string
  price: number
  originalPrice: number | null
  duration: string
  image: string
  gradient: string
  badge: string | null
  badgeColor: string
  rating: number
  reviewCount: number
  featured: boolean
  location: string
}

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
}

const regions = [
  { name: 'Asia', value: 'Asia', color: 'bg-blue-500', states: 'Thailand, Bali, Vietnam, Singapore, Malaysia' },
  { name: 'Europe', value: 'Europe', color: 'bg-green-500', states: 'Switzerland, France, UK, Italy, Greece' },
  { name: 'Middle East', value: 'Middle East', color: 'bg-amber-500', states: 'Dubai, Egypt, Turkey, Oman, Saudi Arabia' },
  { name: 'South Asia', value: 'South Asia', color: 'bg-red-500', states: 'Sri Lanka, Nepal, Bhutan, Maldives' },
  { name: 'Islands', value: 'Island', color: 'bg-cyan-500', states: 'Maldives, Bali, Mauritius' },
]

const SUBOPTION_MAP: Record<string, string> = {
  thailand: 'Thailand',
  bali: 'Bali',
  vietnam: 'Vietnam',
  singapore: 'Singapore',
  malaysia: 'Malaysia',
  switzerland: 'Switzerland',
  france: 'France',
  uk: 'UK',
  italy: 'Italy',
  dubai: 'Dubai',
  nepal: 'Nepal',
  bhutan: 'Bhutan',
  maldives: 'Maldives',
}


export function InternationalPackages() {
  const { navigate, isAuthenticated } = useAppStore()
  const [activeRegion, setActiveRegion] = useState<string>('All')

  const { data: packages = [], isLoading } = useQuery({
    queryKey: ['international-packages'],
    queryFn: async () => {
      const res = await fetch('/api/packages/cards?category=international-tours')
      if (!res.ok) return []
      const data = await res.json()
      return data as PackageData[]
    },
  })

  const { data: availabilityRecords = [] } = useQuery({
    queryKey: ['availability', 'international-tours'],
    queryFn: async () => {
      const res = await fetch('/api/public/availability?service=international-tours')
      const data = await res.json()
      return data.records || []
    },
  })

  const getEffectivePrice = (pkg: PackageData) => {
    const subOption = getSubOptionFromName(pkg.name, SUBOPTION_MAP)
    const allDayMatch = availabilityRecords.find((r: any) => r.allDay)
    if (allDayMatch) return allDayMatch.price ?? pkg.price
    if (!subOption) return pkg.price
    const match = availabilityRecords.find((r: any) => {
      return (r.subOptions || []).includes(subOption)
    })
    return match?.price ?? pkg.price
  }

  const filteredPackages = useMemo(() => {
    if (activeRegion === 'All') return packages
    return packages.filter((pkg) => pkg.badge === activeRegion)
  }, [packages, activeRegion])

  const handleBookTrip = (pkg: PackageData) => {
    if (!isAuthenticated) {
      toast.error('Please login to book')
      return
    }
    navigate('package-booking', null, pkg.id)
  }

  const handleViewDetails = (pkg: PackageData) => {
    navigate('package-detail', null, pkg.slug || pkg.id)
  }

  return (
    <div className="min-h-screen bg-brand-cream">
      <Navbar />
      <ActivityBar />
      <div className="max-w-7xl mx-auto px-4 pt-3">
        <BackButton />
      </div>

      <section className="relative h-[50vh] sm:h-[60vh] overflow-hidden">
        <div className="absolute inset-0">
          <img loading="lazy" decoding="async"
            src="https://travelistaan.com/wp-content/uploads/2026/05/image-31.png"
            alt="International Tours"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/80 via-brand-dark/50 to-brand-cream" />
        </div>
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 sm:px-6 pt-20">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 bg-brand-orange/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
              <Globe className="w-4 h-4 text-brand-orange" />
              <span className="text-brand-orange text-sm font-semibold">Explore the World</span>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-white leading-tight mb-3">
              International <span className="text-brand-orange">Tour Packages</span>
            </h1>
            <p className="text-white/70 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
              From the tropical beaches of Thailand to the majestic Alps of Switzerland — explore the world with us.
            </p>
            <div className="flex items-center justify-center gap-6 sm:gap-10 mt-6">
              <div className="text-center">
                <div className="text-white font-bold text-xl sm:text-2xl">{packages.length || 15}</div>
                <div className="text-white/50 text-xs">Destinations</div>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div className="text-center">
                <div className="text-white font-bold text-xl sm:text-2xl">₹9,999</div>
                <div className="text-white/50 text-xs">Starting From</div>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div className="text-center">
                <div className="text-white font-bold text-xl sm:text-2xl">25</div>
                <div className="text-white/50 text-xs">Countries</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <motion.div {...fadeInUp} className="text-center mb-10 sm:mb-14">
          <span className="text-brand-orange text-sm font-semibold tracking-wider uppercase">Worldwide Travel</span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-brand-dark mt-2">International Tour Packages</h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">Curated tours across the world's most incredible destinations</p>
        </motion.div>

        <div className="flex flex-col items-center gap-4 mb-10">
          <div className="inline-flex items-center gap-2 text-muted-foreground text-sm">
            <Filter className="w-4 h-4" />
            <span>Filter by region</span>
          </div>
          <div className="flex flex-wrap justify-center gap-2.5">
            <motion.button
              type="button"
              onClick={() => setActiveRegion('All')}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0 }}
              className={`text-sm font-semibold px-4 py-2 rounded-full shadow-md transition-all duration-200 cursor-pointer ${
                activeRegion === 'All'
                  ? 'bg-brand-dark text-white ring-2 ring-brand-orange ring-offset-2 scale-105'
                  : 'bg-white text-brand-dark border border-border hover:border-brand-orange hover:text-brand-orange'
              }`}
            >
              All Destinations
              <span className={`ml-1.5 text-xs ${activeRegion === 'All' ? 'text-white/80' : 'text-muted-foreground'}`}>
                ({packages.length})
              </span>
            </motion.button>
            {regions.map((region, idx) => {
              const count = packages.filter((p) => p.badge === region.value).length
              return (
                <motion.button
                  key={region.value || `region-${idx}`}
                  type="button"
                  onClick={() => setActiveRegion(region.value)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (idx + 1) * 0.05 }}
                  className={`text-sm font-semibold px-4 py-2 rounded-full shadow-md transition-all duration-200 cursor-pointer ${
                    activeRegion === region.value
                      ? `${region.color} text-white ring-2 ring-brand-orange ring-offset-2 scale-105`
                      : `${region.color} text-white opacity-60 hover:opacity-100`
                  }`}
                >
                  {region.name}
                  <span className={`ml-1.5 text-xs ${activeRegion === region.value ? 'text-white/90' : 'text-white/70'}`}>
                    ({count})
                  </span>
                </motion.button>
              )
            })}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg animate-pulse">
                <div className="h-48 sm:h-56 bg-muted" />
                <div className="p-3 sm:p-6 space-y-2 sm:space-y-4">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-16 bg-muted rounded-xl" /><div className="h-16 bg-muted rounded-xl" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : packages.length === 0 ? (
          <div className="text-center py-16">
            <Globe className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-brand-dark mb-2">International Tours Coming Soon!</h3>
            <p className="text-muted-foreground">We are curating exciting international tour packages. Stay tuned!</p>
          </div>
        ) : filteredPackages.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-brand-orange/10 flex items-center justify-center mx-auto mb-4">
              <Globe className="w-8 h-8 text-brand-orange" />
            </div>
            <h3 className="text-xl font-semibold text-brand-dark mb-2">No packages in this region yet</h3>
            <p className="text-muted-foreground">We&apos;re adding new tours to this region soon. Check back later!</p>
            <Button
              onClick={() => setActiveRegion('All')}
              className="mt-6 bg-brand-orange hover:bg-brand-orange/90 text-white rounded-full px-6 h-11"
            >
              View All Packages
            </Button>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
            <AnimatePresence mode="popLayout">
              {filteredPackages.map((pkg, index) => (
              <motion.div
                key={pkg.id}
                layout
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
                className="relative group"
              >
                <div className="relative bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer">
                  <div className="relative h-36 sm:h-56 overflow-hidden" onClick={() => handleViewDetails(pkg)}>
                    <img loading="lazy" decoding="async" src={pkg.image} alt={pkg.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className={`absolute inset-0 bg-gradient-to-t ${pkg.gradient} to-transparent opacity-70`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <PackageWishlistOverlay packageId={pkg.id} />
                    <div className={`absolute top-2 left-2 sm:top-4 sm:left-4 ${pkg.badgeColor} text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5`}>
                      <Globe className="w-3 h-3" />
                      {pkg.badge}
                    </div>
                    <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-white/95 backdrop-blur-sm rounded-lg sm:rounded-xl px-2 py-1.5 sm:px-3 sm:py-2 shadow-lg">
                      {(() => { const ep = getEffectivePrice(pkg); return pkg.originalPrice != null && pkg.originalPrice > ep ? (
                        <div className="flex flex-col items-end">
                          <span className="line-through text-red-500 text-xs font-medium">₹{pkg.originalPrice}</span>
                          <div className="text-brand-orange font-bold text-lg leading-none">₹{ep}</div>
                          <span className="text-emerald-500 text-[10px] font-semibold">Save ₹{pkg.originalPrice - ep}</span>
                        </div>
                      ) : (
                        <div className="text-brand-orange font-bold text-lg leading-none">₹{ep}</div>
                      ) })()}
                      <div className="text-muted-foreground text-[10px] mt-0.5">per person</div>
                    </div>
                    <div className="absolute bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4">
                      <h3 className="text-white font-bold text-sm sm:text-xl leading-tight">{pkg.name}</h3>
                      <p className="text-white/80 text-sm mt-0.5">{pkg.subtitle}</p>
                    </div>
                  </div>
                  <div className="p-3 sm:p-6 space-y-2 sm:space-y-4">
                    <div className="hidden sm:block">
                      <div className="flex items-center gap-3 text-sm">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-blue-500" />
                          <span className="font-medium text-brand-dark">{pkg.location || 'International'}</span>
                        </div>
                        <div className="w-px h-4 bg-gray-300" />
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                          <span className="font-medium text-brand-dark">{pkg.duration || 'Flexible'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm mt-2">
                        <Compass className="w-4 h-4 text-brand-orange shrink-0" />
                        <span className="text-muted-foreground">{pkg.tagline}</span>
                      </div>
                    </div>
                    {pkg.rating > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < Math.round(pkg.rating) ? 'fill-brand-gold text-brand-gold' : 'text-gray-200'}`} />
                          ))}
                        </div>
                        <span className="text-sm font-semibold text-brand-dark">{pkg.rating}</span>
                        <span className="text-xs text-muted-foreground">({pkg.reviewCount} <span className="hidden sm:inline">reviews</span>)</span>
                      </div>
                    )}
                    <div className="border-t border-border/50" />
                    <div className="flex items-center justify-between gap-3">
                      <div className="hidden sm:block">
                        {(() => { const ep = getEffectivePrice(pkg); return pkg.originalPrice != null && pkg.originalPrice > ep ? (
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-lg line-through text-red-500 font-medium">₹{pkg.originalPrice}</span>
                            <span className="text-2xl font-bold text-brand-dark">₹{ep}</span>
                            <span className="text-emerald-600 text-xs font-semibold">Save ₹{pkg.originalPrice - ep}</span>
                          </div>
                        ) : (
                          <span className="text-2xl font-bold text-brand-dark">₹{ep}</span>
                        ) })()}
                        <span className="text-muted-foreground text-sm"> / Person</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={() => handleViewDetails(pkg)} className="rounded-full px-2.5 sm:px-4 h-8 sm:h-10 text-xs sm:text-sm border-brand-orange/30 text-brand-orange hover:bg-brand-orange/5">
                           <Eye className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1.5" /><span className="hidden sm:inline">Details</span>
                        </Button>
                        <Button onClick={() => handleBookTrip(pkg)} className="text-white rounded-full px-4 h-10 text-sm font-semibold shadow-lg bg-brand-orange hover:bg-brand-orange/90 shadow-brand-orange/30">
                          <span className="flex items-center gap-1">Book<ChevronRight className="w-4 h-4" /></span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div {...fadeInUp} className="text-center mb-10">
          <h2 className="font-serif text-3xl sm:text-4xl text-brand-dark">Why Travel <span className="text-brand-orange">International</span></h2>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Globe, title: 'Global Coverage', desc: 'Tours across Asia, Europe, Middle East and more.' },
            { icon: Compass, title: 'Expert Guides', desc: 'Local guides with deep knowledge of each destination.' },
            { icon: Star, title: 'Best Deals', desc: 'Competitive pricing with no hidden charges.' },
            { icon: MessageCircle, title: '24/7 Support', desc: 'Round-the-clock support throughout your journey.' },
          ].map((item, index) => {
            const Icon = item.icon
            return (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="bg-white rounded-xl p-6 shadow-sm text-center">
                <div className="w-12 h-12 rounded-full bg-brand-orange/10 flex items-center justify-center mx-auto mb-4"><Icon className="w-6 h-6 text-brand-orange" /></div>
                <h3 className="font-bold text-brand-dark mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            )
          })}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-gradient-to-r from-brand-dark via-brand-navy to-brand-dark rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-brand-orange/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-brand-gold/10 rounded-full blur-3xl" />
          <div className="relative z-10">
            <Globe className="w-10 h-10 text-brand-orange mx-auto mb-4" />
            <h3 className="font-serif text-2xl sm:text-3xl text-white mb-3">Ready to Explore the World?</h3>
            <p className="text-white/60 max-w-lg mx-auto mb-6">Book your international tour today! Custom itineraries and group discounts available.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a href="https://wa.me/916396919007?text=Hi%20I%20want%20to%20book%20an%20international%20tour" target="_blank" rel="noopener noreferrer"><Button className="bg-green-600 hover:bg-green-700 text-white rounded-full px-8 h-12"><MessageCircle className="w-5 h-5 mr-2" />WhatsApp Us</Button></a>
              <a href="tel:+916396919007"><Button variant="outline" className="border-white/40 bg-white text-brand-dark hover:bg-white/90 rounded-full px-8 h-12"><Phone className="w-5 h-5 mr-2" />Call Now</Button></a>
            </div>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  )
}
