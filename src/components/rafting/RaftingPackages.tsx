'use client'

import { useAppStore } from '@/lib/store'
import { PackageWishlistOverlay } from '@/components/cart/PackageWishlistOverlay'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Waves,
  Clock,
  Route,
  Shield,
  Star,
  Zap,
  ChevronRight,
  Timer,
  UsersRound,
  Briefcase,
  Rocket,
  Eye,
  Check,
  Phone,
  MessageCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Navbar } from '@/components/landing/Navbar'
import { BackButton } from '@/components/ui/BackButton'
import { ActivityBar } from '@/components/landing/ActivityBar'
import { Footer } from '@/components/landing/Footer'
import { getSubOptionFromName } from '@/lib/subpackage-utils'

interface PackageData {
  id: string
  name: string
  tagline: string
  subtitle: string
  price: number
  distance: string
  duration: string
  rapidsLevel: string
  rapidsDescription: string
  targetDemo: string
  timings: string
  image: string
  gradient: string
  badge: string | null
  badgeColor: string
  rating: number
  reviewCount: number
  featured: boolean
}

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
}

function getTargetIcon(subtitle: string) {
  if (subtitle.includes('Family') || subtitle.includes('Beginner')) return UsersRound
  if (subtitle.includes('Popular')) return Briefcase
  if (subtitle.includes('Extreme')) return Rocket
  return UsersRound
}

const inclusions = [
  'Certified and Experienced River Guides',
  'High-Quality Life Jackets & Helmets',
  'Paddles and Safety Rescue Bags',
  'Body Surfing & Cliff Jumping (Depending on water level)',
  'Transport from our office to the starting point (if selected)',
]

const faqs = [
  {
    question: 'Can non-swimmers do river rafting in Rishikesh?',
    answer: 'Yes, non-swimmers can easily do river rafting in Rishikesh. A high-quality life jacket is provided to everyone, which keeps you floating in the water even if you fall. Our expert guides are always there to help you.',
  },
  {
    question: 'What is the best time for river rafting in Rishikesh?',
    answer: 'The best time for rafting is from September to June. The water level is perfect during these months. Rafting is officially closed by the government during the monsoon season (July and August) due to heavy water flow.',
  },
  {
    question: 'Is river rafting safe for children?',
    answer: 'Yes, for children above 14 years of age, Brahmpuri rafting (9km) is safe. However, children below 14 years and pregnant women are strictly not allowed to do rafting for safety reasons.',
  },
  {
    question: 'Is there any locker facility available at the rafting point?',
    answer: 'Yes, paid locker facilities are available at the Shivpuri and Marine Drive starting points. You can keep your mobile phones, wallets, and extra clothes safely there before starting the rafting.',
  },
  {
    question: 'How to reach the rafting starting point from Rishikesh?',
    answer: 'If you book with Divine Travels, we provide a complimentary pickup from our office in Tapovan/Rishikesh to the Shivpuri or Marine Drive starting point. You can also drive your own car; parking is available.',
  },
]

const SUBOPTION_MAP: Record<string, string> = {
  brahmpuri: 'Brahmpuri 9km',
  shivpuri: 'Shivpuri 16km',
  'marine drive': 'Marine Drive 26km',
}


export function RaftingPackages() {
  const { navigate, isAuthenticated, user } = useAppStore()

  const { data: packages = [], isLoading } = useQuery({
    queryKey: ['rafting-packages'],
    queryFn: async () => {
      const res = await fetch('/api/packages?category=rafting')
      if (!res.ok) return []
      const data = await res.json()
      return data as PackageData[]
    },
  })

  const { data: availabilityRecords = [] } = useQuery({
    queryKey: ['availability', 'rafting'],
    queryFn: async () => {
      const res = await fetch('/api/public/availability?service=rafting')
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

  const handleBookTrip = (pkg: PackageData) => {
    if (!isAuthenticated) {
      toast.error('Please login to book a rafting trip')
      return
    }
    navigate('package-booking', null, pkg.id)
  }

  const handleViewDetails = (pkg: PackageData) => {
    navigate('package-detail', null, pkg.id)
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
          <img
            src="https://www.justahotels.com/wp-content/uploads/2024/01/stock-photo-rafting-stunt-while-whitewater-rafting-rishikesh-india-1372981319-transformed.jpeg"
            alt="White Water Rafting in Rishikesh"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/80 via-brand-dark/50 to-brand-cream" />
        </div>

        <div className="absolute top-8 left-8 w-32 h-32 border border-white/10 rounded-full pointer-events-none" />
        <div className="absolute bottom-20 right-12 w-48 h-48 border border-white/5 rounded-full pointer-events-none" />

        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 sm:px-6 pt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-brand-orange/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
              <Waves className="w-4 h-4 text-brand-orange" />
              <span className="text-brand-orange text-sm font-semibold">Rishikesh Rafting</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-white leading-tight mb-3">
              White Water <span className="text-brand-orange">Rafting</span>
            </h1>
            <p className="text-white/70 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
              Conquer the sacred Ganges with 3 thrilling rafting packages — from
              beginner-friendly to extreme adventure
            </p>

            <div className="flex items-center justify-center gap-6 sm:gap-10 mt-6">
              <div className="text-center">
                <div className="text-white font-bold text-xl sm:text-2xl">{packages.length || 3}</div>
                <div className="text-white/50 text-xs">Packages</div>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div className="text-center">
                <div className="text-white font-bold text-xl sm:text-2xl">9-26km</div>
                <div className="text-white/50 text-xs">Routes</div>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div className="text-center">
                <div className="text-white font-bold text-xl sm:text-2xl">I-IV</div>
                <div className="text-white/50 text-xs">Grade Rapids</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <motion.div
          {...fadeInUp}
          className="text-center mb-10 sm:mb-14"
        >
          <span className="text-brand-orange text-sm font-semibold tracking-wider uppercase">
            Choose Your Adventure
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-brand-dark mt-2">
            Rafting Packages
          </h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            From gentle family floats to heart-pounding rapids — pick the experience that matches your spirit
          </p>
        </motion.div>

        {/* Package Cards */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg animate-pulse">
                <div className="h-48 sm:h-56 bg-muted" />
                <div className="p-3 sm:p-6 space-y-2 sm:space-y-4">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-16 bg-muted rounded-xl" />
                    <div className="h-16 bg-muted rounded-xl" />
                    <div className="h-16 bg-muted rounded-xl" />
                    <div className="h-16 bg-muted rounded-xl" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
            {packages.length === 0 && (
              <div className="text-center py-16">
                <Waves className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg">No rafting packages available yet.</p>
                <p className="text-sm text-muted-foreground mt-1">Check back soon for exciting rafting adventures.</p>
              </div>
            )}
            {packages.map((pkg, index) => {
              const TargetIcon = getTargetIcon(pkg.subtitle)
              const isPopular = pkg.badge === 'Most Popular'
              const isExtreme = pkg.badge === 'Extreme'

              return (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15, duration: 0.5 }}
                  className={`relative group ${
                    isPopular ? 'md:-mt-4 md:mb-4' : ''
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -inset-1 bg-gradient-to-r from-brand-orange/20 to-amber-500/20 rounded-3xl blur-lg group-hover:from-brand-orange/30 group-hover:to-amber-500/30 transition-all duration-500" />
                  )}

                  <div className={`relative bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer ${
                    isPopular ? 'ring-2 ring-brand-orange' : ''
                  }`}>
                    <div className="relative h-36 sm:h-56 overflow-hidden" onClick={() => handleViewDetails(pkg)}>
                      <img
                        src={pkg.image}
                        alt={pkg.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                      />
                      <div className={`absolute inset-0 bg-gradient-to-t ${pkg.gradient} to-transparent opacity-70`} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <PackageWishlistOverlay packageId={pkg.id} />

                      <div className={`absolute top-2 left-2 sm:top-4 sm:left-4 ${pkg.badgeColor} text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5`}>
                        {isPopular && <Star className="w-3 h-3 fill-white" />}
                        {isExtreme && <Zap className="w-3 h-3" />}
                        {!isPopular && !isExtreme && <Shield className="w-3 h-3" />}
                        {pkg.badge}
                      </div>

                      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-white/95 backdrop-blur-sm rounded-lg sm:rounded-xl px-2 py-1.5 sm:px-3 sm:py-2 shadow-lg">
                        <div className="text-brand-orange font-bold text-lg leading-none">₹{getEffectivePrice(pkg)}</div>
                        <div className="text-muted-foreground text-[10px] mt-0.5">per person</div>
                      </div>

                      <div className="absolute bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4">
                        <h3 className="text-white font-bold text-sm sm:text-xl leading-tight">{pkg.name}</h3>
                        <p className="text-white/80 text-sm mt-0.5">{pkg.subtitle}</p>
                      </div>
                    </div>

                    <div className="p-3 sm:p-6 space-y-2 sm:space-y-4">
                      {/* Mobile: hide specs, rapids description, best for */}
                      <div className="hidden sm:block">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-brand-cream/70 rounded-xl p-3 flex items-start gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                              <Route className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">Distance</div>
                              <div className="text-sm font-semibold text-brand-dark">{pkg.distance}</div>
                            </div>
                          </div>
                          <div className="bg-brand-cream/70 rounded-xl p-3 flex items-start gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                              <Timer className="w-4 h-4 text-amber-600" />
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">Duration</div>
                              <div className="text-sm font-semibold text-brand-dark">{pkg.duration}</div>
                            </div>
                          </div>
                          <div className="bg-brand-cream/70 rounded-xl p-3 flex items-start gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                              <Waves className="w-4 h-4 text-red-600" />
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">Rapids Level</div>
                              <div className="text-sm font-semibold text-brand-dark">{pkg.rapidsLevel}</div>
                            </div>
                          </div>
                          <div className="bg-brand-cream/70 rounded-xl p-3 flex items-start gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                              <Clock className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">Timings</div>
                              <div className="text-sm font-semibold text-brand-dark">{pkg.timings}</div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <Waves className="w-4 h-4 text-brand-orange shrink-0" />
                          <span className="text-muted-foreground">{pkg.rapidsDescription}</span>
                        </div>

                        <div className="flex items-start gap-2.5 text-sm">
                          <TargetIcon className="w-4 h-4 text-brand-teal shrink-0 mt-0.5" />
                          <div>
                            <span className="font-medium text-brand-dark">Best for: </span>
                            <span className="text-muted-foreground">{pkg.targetDemo}</span>
                          </div>
                        </div>
                      </div>

                      {pkg.rating > 0 && (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < Math.round(pkg.rating)
                                    ? 'fill-brand-gold text-brand-gold'
                                    : 'text-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-semibold text-brand-dark">{pkg.rating}</span>
                          <span className="text-xs text-muted-foreground">({pkg.reviewCount} <span className="hidden sm:inline">reviews</span>)</span>
                        </div>
                      )}

                      <div className="border-t border-border/50" />

                      <div className="flex items-center justify-between gap-3">
                        <div className="hidden sm:block">
                          <span className="text-2xl font-bold text-brand-dark">₹{getEffectivePrice(pkg)}</span>
                          <span className="text-muted-foreground text-sm"> / Person</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            onClick={() => handleViewDetails(pkg)}
                            className="rounded-full px-2.5 sm:px-4 h-8 sm:h-10 text-xs sm:text-sm border-brand-orange/30 text-brand-orange hover:bg-brand-orange/5"
                          >
                            <Eye className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1.5" />
                            <span className="hidden sm:inline">Details</span>
                          </Button>
                          <Button
                            onClick={() => handleBookTrip(pkg)}
                            className={`text-white rounded-full px-4 h-10 text-sm font-semibold shadow-lg ${
                              isExtreme
                                ? 'bg-red-600 hover:bg-red-700 shadow-red-600/30'
                                : isPopular
                                ? 'bg-brand-orange hover:bg-brand-orange/90 shadow-brand-orange/30'
                                : 'bg-brand-teal hover:bg-brand-teal/90 shadow-brand-teal/30'
                            }`}
                          >
                            <span className="flex items-center gap-1">
                              Book
                              <ChevronRight className="w-4 h-4" />
                            </span>
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

      {/* Book River Rafting Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div {...fadeInUp} className="text-center mb-10">
          <h2 className="font-serif text-3xl sm:text-4xl text-brand-dark">
            Book River Rafting in Rishikesh at <span className="text-brand-orange">Lowest Price</span>
          </h2>
          <p className="text-muted-foreground mt-3 max-w-3xl mx-auto">
            Experience the thrill of Ganga River with Divine Travels! We are a locally based travel agency in Rishikesh offering the best and safest river rafting packages. Whether you are a beginner or an adventure lover, we have the perfect rafting stretch for you — from 9km Brahmpuri to the famous 16km Shivpuri and 26km Marine Drive rafting.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
            <a href="https://wa.me/916396919007?text=Hi%20I%20want%20to%20book%20Rafting%20in%20Rishikesh" target="_blank" rel="noopener noreferrer">
              <Button className="bg-green-600 hover:bg-green-700 text-white rounded-full px-6 h-12">
                <MessageCircle className="w-5 h-5 mr-2" />
                WhatsApp to Book Rafting
              </Button>
            </a>
            <a href="tel:+916396919007">
              <Button variant="outline" className="rounded-full px-6 h-12 border-brand-orange/30 text-brand-orange hover:bg-brand-orange/5">
                <Phone className="w-5 h-5 mr-2" />
                Call Now for Details
              </Button>
            </a>
          </div>
        </motion.div>
      </div>

      {/* Pricing Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <motion.div {...fadeInUp}>
          <h2 className="font-serif text-2xl sm:text-3xl text-brand-dark mb-6">
            Rishikesh Rafting Packages & Pricing 2026
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-blue-500">
              <h3 className="font-bold text-lg text-brand-dark mb-2">1. Brahmpuri Rafting (9 Km)</h3>
              <p className="text-brand-orange font-bold text-xl mb-2">₹399/- Per Person</p>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                <li><span className="font-medium text-brand-dark">Rapids:</span> Grade I & II (Easy waves)</li>
                <li><span className="font-medium text-brand-dark">Duration:</span> 1.5 to 2 Hours</li>
                <li><span className="font-medium text-brand-dark">Best for:</span> School groups, families, and first-timers</li>
              </ul>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-brand-orange ring-2 ring-brand-orange/20">
              <h3 className="font-bold text-lg text-brand-dark mb-2">2. Shivpuri Rafting (16 Km)</h3>
              <p className="text-brand-orange font-bold text-xl mb-2">₹499/- Per Person</p>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                <li><span className="font-medium text-brand-dark">Rapids:</span> Grade II & III (Body surfing & cliff jumping included)</li>
                <li><span className="font-medium text-brand-dark">Duration:</span> 3 to 4 Hours</li>
                <li><span className="font-medium text-brand-dark">Best for:</span> College groups, friends, and corporate trips</li>
              </ul>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-red-500">
              <h3 className="font-bold text-lg text-brand-dark mb-2">3. Marine Drive Rafting (26 Km)</h3>
              <p className="text-brand-orange font-bold text-xl mb-2">₹599/- Per Person</p>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                <li><span className="font-medium text-brand-dark">Rapids:</span> Grade III & IV (High thrill)</li>
                <li><span className="font-medium text-brand-dark">Duration:</span> 5 to 6 Hours</li>
                <li><span className="font-medium text-brand-dark">Best for:</span> Highly energetic people and adventure junkies</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>

      {/* What's Included */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <motion.div {...fadeInUp}>
          <h2 className="font-serif text-2xl sm:text-3xl text-brand-dark mb-6">
            What is Included in Your Rafting Package?
          </h2>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <ul className="space-y-3">
              {inclusions.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
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

      {/* What to Wear */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <motion.div {...fadeInUp}>
          <h2 className="font-serif text-2xl sm:text-3xl text-brand-dark mb-6">
            What to Wear & Carry for Rafting?
          </h2>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-muted-foreground leading-relaxed">
              To make your rafting experience safe and comfortable, wear comfortable clothes like quick-dry t-shirts and shorts. Avoid heavy jeans, sarees, or leather shoes. Wear comfortable sports shoes or sandals that grip well. Do not carry expensive mobile phones, wallets, or car keys while rafting. Lockers are available at the starting point to keep your valuables safe.
            </p>
          </div>
        </motion.div>
      </div>

      {/* FAQs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <motion.div {...fadeInUp}>
          <h2 className="font-serif text-2xl sm:text-3xl text-brand-dark mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="font-bold text-brand-dark mb-2">{faq.question}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Bottom CTA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-brand-dark via-brand-navy to-brand-dark rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-32 h-32 bg-brand-orange/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-brand-gold/10 rounded-full blur-3xl" />

          <div className="relative z-10">
            <Waves className="w-10 h-10 text-brand-orange mx-auto mb-4" />
            <h3 className="font-serif text-2xl sm:text-3xl text-white mb-3">
              Not sure which package to choose?
            </h3>
            <p className="text-white/60 max-w-lg mx-auto mb-6">
              Contact our travel experts for personalized recommendations based on your group size and adventure level.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a href="https://wa.me/916396919007?text=Hi%20I%20need%20help%20choosing%20a%20rafting%20package" target="_blank" rel="noopener noreferrer">
                <Button className="bg-green-600 hover:bg-green-700 text-white rounded-full px-8 h-12">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  WhatsApp Us
                </Button>
              </a>
              <a href="tel:+916396919007">
                <Button variant="outline" className="border-white/40 bg-white text-brand-dark hover:bg-white/90 rounded-full px-8 h-12">
                  <Phone className="w-5 h-5 mr-2" />
                  Call Now
                </Button>
              </a>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Safety Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6"
        >
          <div className="flex items-start gap-3 bg-white rounded-xl p-5 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold text-brand-dark text-sm">Safety First</h4>
              <p className="text-xs text-muted-foreground mt-0.5">All trips include certified instructors, life jackets, and safety briefings.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-white rounded-xl p-5 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-brand-dark text-sm">Easy Booking</h4>
              <p className="text-xs text-muted-foreground mt-0.5">Book instantly online. Free cancellation up to 24 hours before the trip.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-white rounded-xl p-5 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <Star className="w-5 h-5 text-amber-600 fill-amber-600" />
            </div>
            <div>
              <h4 className="font-semibold text-brand-dark text-sm">4.9 Rated</h4>
              <p className="text-xs text-muted-foreground mt-0.5">Rated by 500+ rafters. The most trusted rafting operator in Rishikesh.</p>
            </div>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  )
}
