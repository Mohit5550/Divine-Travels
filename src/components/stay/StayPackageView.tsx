'use client'

import { useAppStore } from '@/lib/store'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  ArrowLeft, Star, Eye, Phone, MessageCircle, Check, Clock, MapPin,
  UsersRound, Briefcase, Shield, ChevronRight, Sparkles, Waves,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Navbar } from '@/components/landing/Navbar'
import { ActivityBar } from '@/components/landing/ActivityBar'
import { BackButton } from '@/components/ui/BackButton'
import { Footer } from '@/components/landing/Footer'

interface PackageData {
  id: string
  name: string
  tagline: string
  subtitle: string
  price: number
  originalPrice: number | null
  duration: string
  location: string
  image: string
  images: string
  gradient: string
  badge: string | null
  badgeColor: string
  rating: number
  reviewCount: number
  featured: boolean
  description: string
}

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
}

interface StayPackageViewProps {
  category: string
  heroImage: string
  heroTitle: string
  heroSubtitle: string
  badge: string
  badgeIcon: React.ReactNode
  sectionTitle: string
  sectionSubtitle: string
  bookDescription: string
  stats: { label: string; value: string }[]
  inclusions: string[]
  inclusionsTitle: string
  faqs: { question: string; answer: string }[]
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

function getSubOptionFromName(name: string): string | undefined {
  const lower = name.toLowerCase()
  for (const [key, sub] of Object.entries(SUBOPTION_MAP)) {
    if (lower.includes(key)) return sub
  }
  return undefined
}

export function StayPackageView({
  category,
  heroImage,
  heroTitle,
  heroSubtitle,
  badge: badgeText,
  badgeIcon,
  sectionTitle,
  sectionSubtitle,
  bookDescription,
  stats,
  inclusions,
  inclusionsTitle,
  faqs,
}: StayPackageViewProps) {
  const { navigate, isAuthenticated } = useAppStore()

  const { data: packages = [], isLoading } = useQuery({
    queryKey: [category + '-packages'],
    queryFn: async () => {
      const res = await fetch(`/api/packages?category=${category}`)
      if (!res.ok) return []
      const data = await res.json()
      return data as PackageData[]
    },
  })

  const { data: availabilityRecords = [] } = useQuery({
    queryKey: ['availability', category],
    queryFn: async () => {
      const res = await fetch(`/api/public/availability?service=${category}`)
      const data = await res.json()
      return data.records || []
    },
  })

  const getEffectivePrice = (pkg: PackageData) => {
    const subOption = getSubOptionFromName(pkg.name)
    if (!subOption) return pkg.price
    const match = availabilityRecords.find((r: any) => {
      if (r.allDay) return true
      return (r.subOptions || []).includes(subOption)
    })
    return match?.price ?? pkg.price
  }

  const handleBook = (pkg: PackageData) => {
    if (!isAuthenticated) {
      toast.error('Please login to book')
      return
    }
    navigate('package-booking', null, pkg.id)
  }

  const handleViewDetails = (pkg: PackageData) => {
    navigate('hotel-detail', null, pkg.id)
  }

  return (
    <div className="min-h-screen bg-brand-cream">
      <Navbar />
      <ActivityBar />
      <div className="max-w-7xl mx-auto px-4 pt-3">
        <BackButton />
      </div>

      {/* Hero Section */}
      <section className="relative h-[50vh] sm:h-[60vh] overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt={badgeText} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/80 via-brand-dark/50 to-brand-cream" />
        </div>
        <div className="absolute top-8 left-8 w-32 h-32 border border-white/10 rounded-full pointer-events-none" />
        <div className="absolute bottom-20 right-12 w-48 h-48 border border-white/5 rounded-full pointer-events-none" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 sm:px-6 pt-20">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 bg-brand-orange/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
              {badgeIcon}
              <span className="text-brand-orange text-sm font-semibold">{badgeText}</span>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-white leading-tight mb-3" dangerouslySetInnerHTML={{ __html: heroTitle }} />
            <p className="text-white/70 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
              {heroSubtitle}
            </p>
            <div className="flex items-center justify-center gap-6 sm:gap-10 mt-6">
              {stats.map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-white font-bold text-xl sm:text-2xl">{stat.value}</div>
                  <div className="text-white/50 text-xs">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Package Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <motion.div {...fadeInUp} className="text-center mb-10 sm:mb-14">
          <span className="text-brand-orange text-sm font-semibold tracking-wider uppercase">Choose Your Stay</span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-brand-dark mt-2">{sectionTitle}</h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">{sectionSubtitle}</p>
        </motion.div>

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
                    <div className="h-16 bg-muted rounded-xl" /><div className="h-16 bg-muted rounded-xl" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
            {packages.map((pkg, index) => {
              const isPopular = pkg.badge === 'Most Popular'
              return (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                  className={`relative group ${isPopular ? 'md:-mt-4 md:mb-4' : ''}`}
                >
                  {isPopular && (
                    <div className="absolute -inset-1 bg-gradient-to-r from-brand-orange/20 to-amber-500/20 rounded-3xl blur-lg group-hover:from-brand-orange/30 group-hover:to-amber-500/30 transition-all duration-500" />
                  )}
                  <div className={`relative bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer ${isPopular ? 'ring-2 ring-brand-orange' : ''}`}>
                    <div className="relative h-36 sm:h-56 overflow-hidden" onClick={() => handleViewDetails(pkg)}>
                      <img src={pkg.image} alt={pkg.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      {pkg.badge && (
                        <div className={`absolute top-2 left-2 sm:top-4 sm:left-4 ${pkg.badgeColor} text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5`}>
                          {isPopular && <Star className="w-3 h-3 fill-white" />}{pkg.badge}
                        </div>
                      )}
                      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-white/95 backdrop-blur-sm rounded-lg sm:rounded-xl px-2 py-1.5 sm:px-3 sm:py-2 shadow-lg">
                        <div className="text-brand-orange font-bold text-lg leading-none">₹{getEffectivePrice(pkg)}</div>
                        <div className="text-muted-foreground text-[10px] mt-0.5">per night</div>
                      </div>
                      <div className="absolute bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4">
                        <h3 className="text-white font-bold text-sm sm:text-xl leading-tight">{pkg.name}</h3>
                        <p className="text-white/80 text-sm mt-0.5">{pkg.subtitle}</p>
                      </div>
                    </div>
                    <div className="p-3 sm:p-6 space-y-2 sm:space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-brand-cream/70 rounded-xl p-3 flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                            <Clock className="w-4 h-4 text-amber-600" />
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">Duration</div>
                            <div className="text-sm font-semibold text-brand-dark">{pkg.duration}</div>
                          </div>
                        </div>
                        <div className="bg-brand-cream/70 rounded-xl p-3 flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                            <MapPin className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">Location</div>
                            <div className="text-sm font-semibold text-brand-dark">{pkg.location}</div>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{pkg.description}</p>
                      {pkg.rating > 0 && (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-4 h-4 ${i < Math.round(pkg.rating) ? 'fill-brand-gold text-brand-gold' : 'text-gray-200'}`} />
                            ))}
                          </div>
                          <span className="text-sm font-semibold text-brand-dark">{pkg.rating}</span>
                          <span className="text-xs text-muted-foreground">({pkg.reviewCount} reviews)</span>
                        </div>
                      )}
                      <div className="border-t border-border/50" />
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <span className="text-2xl font-bold text-brand-dark">₹{getEffectivePrice(pkg)}</span>
                          <span className="text-muted-foreground text-sm"> / night</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" onClick={() => handleViewDetails(pkg)} className="rounded-full px-4 h-10 text-sm border-brand-orange/30 text-brand-orange hover:bg-brand-orange/5">
                            <Eye className="w-4 h-4 mr-1.5" /> Details
                          </Button>
                          <Button onClick={() => handleBook(pkg)} className="bg-brand-teal hover:bg-brand-teal/90 text-white rounded-full px-4 h-10 text-sm shadow-lg shadow-brand-teal/30">
                            Book <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Book Now Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div {...fadeInUp} className="text-center mb-10">
          <h2 className="font-serif text-3xl sm:text-4xl text-brand-dark">
            Book {badgeText} at <span className="text-brand-orange">Best Price</span>
          </h2>
          <p className="text-muted-foreground mt-3 max-w-3xl mx-auto">{bookDescription}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
            <a href={`https://wa.me/916396919007?text=Hi%20I%20want%20to%20book%20${encodeURIComponent(badgeText)}`} target="_blank" rel="noopener noreferrer">
              <Button className="bg-green-600 hover:bg-green-700 text-white rounded-full px-6 h-12">
                <MessageCircle className="w-5 h-5 mr-2" /> WhatsApp to Book
              </Button>
            </a>
            <a href="tel:+916396919007">
              <Button variant="outline" className="rounded-full px-6 h-12 border-brand-orange/30 text-brand-orange hover:bg-brand-orange/5">
                <Phone className="w-5 h-5 mr-2" /> Call Now
              </Button>
            </a>
          </div>
        </motion.div>
      </div>

      {/* Inclusions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <motion.div {...fadeInUp}>
          <h2 className="font-serif text-2xl sm:text-3xl text-brand-dark mb-6">{inclusionsTitle}</h2>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <ul className="space-y-3">
              {inclusions.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>

      {/* FAQs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <motion.div {...fadeInUp}>
          <h2 className="font-serif text-2xl sm:text-3xl text-brand-dark mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-bold text-brand-dark mb-2">{faq.question}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom CTA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="bg-gradient-to-r from-brand-dark via-brand-navy to-brand-dark rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-32 h-32 bg-brand-orange/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-brand-gold/10 rounded-full blur-3xl" />
          <div className="relative z-10">
            <Sparkles className="w-10 h-10 text-brand-orange mx-auto mb-4" />
            <h3 className="font-serif text-2xl sm:text-3xl text-white mb-3">Not sure which to choose?</h3>
            <p className="text-white/60 max-w-lg mx-auto mb-6">
              Contact our travel experts for personalized recommendations based on your preferences and group size.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a href={`https://wa.me/916396919007?text=Hi%20I%20need%20help%20with%20${encodeURIComponent(badgeText)}`} target="_blank" rel="noopener noreferrer">
                <Button className="bg-green-600 hover:bg-green-700 text-white rounded-full px-8 h-12">
                  <MessageCircle className="w-5 h-5 mr-2" /> WhatsApp Us
                </Button>
              </a>
              <a href="tel:+916396919007">
                <Button variant="outline" className="border-white/40 bg-white text-brand-dark hover:bg-white/90 rounded-full px-8 h-12">
                  <Phone className="w-5 h-5 mr-2" /> Call Now
                </Button>
              </a>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6"
        >
          <div className="flex items-start gap-3 bg-white rounded-xl p-5 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold text-brand-dark text-sm">Quality Assured</h4>
              <p className="text-xs text-muted-foreground mt-0.5">Verified properties with the best amenities and service.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-white rounded-xl p-5 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-brand-dark text-sm">Easy Booking</h4>
              <p className="text-xs text-muted-foreground mt-0.5">Book instantly online. Free cancellation up to 24 hours.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-white rounded-xl p-5 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <Star className="w-5 h-5 text-amber-600 fill-amber-600" />
            </div>
            <div>
              <h4 className="font-semibold text-brand-dark text-sm">Best Rates</h4>
              <p className="text-xs text-muted-foreground mt-0.5">Lowest price guaranteed. We match any genuine offer.</p>
            </div>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  )
}
