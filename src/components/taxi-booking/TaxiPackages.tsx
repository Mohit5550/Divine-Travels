'use client'

import { useAppStore } from '@/lib/store'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Car,
  Clock,
  MapPin,
  Star,
  ChevronRight,
  Shield,
  Users,
  Fuel,
  Wrench,
  Eye,
  MessageCircle,
  Phone,
  Check,
  UsersRound,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Navbar } from '@/components/landing/Navbar'
import { BackButton } from '@/components/ui/BackButton'
import { ActivityBar } from '@/components/landing/ActivityBar'
import { Footer } from '@/components/landing/Footer'

interface PackageData {
  id: string
  name: string
  tagline: string
  subtitle: string
  price: number
  originalPrice: number | null
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
  location: string
}

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
}

function getTargetIcon(subtitle: string) {
  if (subtitle.includes('Sedan') || subtitle.includes('4')) return Car
  if (subtitle.includes('SUV') || subtitle.includes('7')) return Shield
  if (subtitle.includes('Traveller') || subtitle.includes('Bus')) return UsersRound
  return Users
}

const SUBOPTION_MAP: Record<string, string> = {
  sedan: 'Sedan',
  suv: 'SUV',
  'tempo traveller': 'Tempo Traveller',
  bus: 'Bus',
  hatchback: 'Hatchback',
  ertiga: 'Ertiga',
  innova: 'INNOVA',
}

function getSubOptionFromName(name: string): string | undefined {
  const lower = name.toLowerCase()
  for (const [key, sub] of Object.entries(SUBOPTION_MAP)) {
    if (lower.includes(key)) return sub
  }
  return undefined
}

export function TaxiPackages() {
  const { navigate, isAuthenticated, user } = useAppStore()

  const { data: packages = [], isLoading } = useQuery({
    queryKey: ['taxi-packages'],
    queryFn: async () => {
      const res = await fetch('/api/packages?category=taxi-booking')
      const data = await res.json()
      return data as PackageData[]
    },
  })

  const { data: availabilityRecords = [] } = useQuery({
    queryKey: ['availability', 'taxi-booking'],
    queryFn: async () => {
      const res = await fetch('/api/public/availability?service=taxi-booking')
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

  const handleBookTrip = (pkg: PackageData) => {
    navigate('taxi-booking-form')
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
            src="https://www.rajasthantourpackages.in/_next/image?url=https%3A%2F%2Fik.imagekit.io%2Fx7ulapdbp%2F8361a72a-edcb-4f94-9512-fe8bb70ab914-rajasthan-cab-rental.jpg&w=3840&q=75"
            alt="Taxi Booking in Rishikesh"
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
              <Car className="w-4 h-4 text-brand-orange" />
              <span className="text-brand-orange text-sm font-semibold">Taxi Booking Rishikesh</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-white leading-tight mb-3">
              Book a <span className="text-brand-orange">Taxi</span> in Rishikesh
            </h1>
            <p className="text-white/70 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
              All India pickup service with experienced, verified drivers. From sedans to buses — we have the right vehicle for every group size.
            </p>

            <div className="flex items-center justify-center gap-6 sm:gap-10 mt-6">
              <div className="text-center">
                <div className="text-white font-bold text-xl sm:text-2xl">{packages.length || 7}</div>
                <div className="text-white/50 text-xs">Vehicles</div>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div className="text-center">
                <div className="text-white font-bold text-xl sm:text-2xl">All India</div>
                <div className="text-white/50 text-xs">Pickup Service</div>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div className="text-center">
                <div className="text-white font-bold text-xl sm:text-2xl">4-49</div>
                <div className="text-white/50 text-xs">Seater Options</div>
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
            Choose Your Vehicle
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-brand-dark mt-2">
            Taxi Booking Options
          </h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            From budget sedans to luxury innovas and group travellers — pick the vehicle that suits your group
          </p>
          <Button
            onClick={() => navigate('taxi-booking-form')}
            className="mt-6 bg-brand-orange hover:bg-brand-orange/90 text-white px-8 py-3 rounded-xl font-semibold"
          >
            <Car className="w-4 h-4 mr-2" />
            Post a Booking
          </Button>
        </motion.div>

        {/* Package Cards - 3 Column Grid */}
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
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
            {packages.map((pkg, index) => {
              const TargetIcon = getTargetIcon(pkg.subtitle)
              const isSUV = pkg.badge === 'SUV'
              const isGroup = pkg.badge === 'Group Travel'

              return (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15, duration: 0.5 }}
                  className={`relative group ${
                    isSUV ? 'md:-mt-4 md:mb-4' : ''
                  }`}
                >
                  {isSUV && (
                    <div className="absolute -inset-1 bg-gradient-to-r from-brand-orange/20 to-amber-500/20 rounded-3xl blur-lg group-hover:from-brand-orange/30 group-hover:to-amber-500/30 transition-all duration-500" />
                  )}

                  <div className={`relative bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer ${
                    isSUV ? 'ring-2 ring-brand-orange' : ''
                  }`}>
                    {/* Image Section */}
                    <div className="relative h-36 sm:h-56 overflow-hidden" onClick={() => handleViewDetails(pkg)}>
                      <img
                        src={pkg.image}
                        alt={pkg.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className={`absolute inset-0 bg-gradient-to-t ${pkg.gradient} to-transparent opacity-70`} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                      {/* Badge */}
                      <div className={`absolute top-2 left-2 sm:top-4 sm:left-4 ${pkg.badgeColor} text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5`}>
                        {isSUV && <Star className="w-3 h-3 fill-white" />}
                        {isGroup && <UsersRound className="w-3 h-3" />}
                        {!isSUV && !isGroup && <Car className="w-3 h-3" />}
                        {pkg.badge}
                      </div>

                      {/* Price floating badge */}
                      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-white/95 backdrop-blur-sm rounded-lg sm:rounded-xl px-2 py-1.5 sm:px-3 sm:py-2 shadow-lg">
                        {(() => { const ep = getEffectivePrice(pkg); return pkg.originalPrice != null && pkg.originalPrice > ep ? (
                          <div className="flex flex-col items-end">
                            <span className="line-through text-white/60 text-xs">₹{pkg.originalPrice}</span>
                            <div className="text-brand-orange font-bold text-lg leading-none">₹{ep}</div>
                            <span className="text-emerald-500 text-[10px] font-semibold">Save ₹{pkg.originalPrice - ep}</span>
                          </div>
                        ) : (
                          <div className="text-brand-orange font-bold text-lg leading-none">₹{ep}</div>
                        ) })()}
                        <div className="text-muted-foreground text-[10px] mt-0.5">per day</div>
                      </div>

                      {/* Bottom content on image */}
                      <div className="absolute bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4">
                        <h3 className="text-white font-bold text-sm sm:text-xl leading-tight">{pkg.name}</h3>
                        <p className="text-white/80 text-sm mt-0.5">{pkg.subtitle}</p>
                      </div>
                    </div>

                    {/* Details Section */}
                    <div className="p-3 sm:p-6 space-y-2 sm:space-y-4">
                      <div className="hidden sm:block">
                      {/* Key Specs - Grid */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-brand-cream/70 rounded-xl p-3 flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                            <MapPin className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">Service</div>
                            <div className="text-sm font-semibold text-brand-dark">{pkg.location || 'All India'}</div>
                          </div>
                        </div>
                        <div className="bg-brand-cream/70 rounded-xl p-3 flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                            <Users className="w-4 h-4 text-amber-600" />
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">Capacity</div>
                            <div className="text-sm font-semibold text-brand-dark">{pkg.duration || '4-7 Seater'}</div>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="flex items-center gap-2 text-sm">
                        <Car className="w-4 h-4 text-brand-orange shrink-0" />
                        <span className="text-muted-foreground">{pkg.rapidsDescription || pkg.tagline}</span>
                      </div>

                      {/* Features */}
                      <div className="flex items-start gap-2.5 text-sm">
                        <TargetIcon className="w-4 h-4 text-brand-teal shrink-0 mt-0.5" />
                        <div>
                          <span className="font-medium text-brand-dark">Best for: </span>
                          <span className="text-muted-foreground">{pkg.targetDemo}</span>
                        </div>
                      </div>
                      </div>

                      {/* Rating */}
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

                      {/* Divider */}
                      <div className="border-t border-border/50" />

                      {/* Price, View Details & Book */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="hidden sm:block">
                          {(() => { const ep = getEffectivePrice(pkg); return pkg.originalPrice != null && pkg.originalPrice > ep ? (
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-lg line-through text-muted-foreground">₹{pkg.originalPrice}</span>
                              <span className="text-2xl font-bold text-brand-dark">₹{ep}</span>
                              <span className="text-emerald-600 text-xs font-semibold">Save ₹{pkg.originalPrice - ep}</span>
                            </div>
                          ) : (
                            <span className="text-2xl font-bold text-brand-dark">₹{ep}</span>
                          ) })()}
                          <span className="text-muted-foreground text-sm"> / Day</span>
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
                              isGroup
                                ? 'bg-red-600 hover:bg-red-700 shadow-red-600/30'
                                : isSUV
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

      {/* Why Choose Us */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div {...fadeInUp} className="text-center mb-10">
          <h2 className="font-serif text-3xl sm:text-4xl text-brand-dark">
            Why <span className="text-brand-orange">Choose Us</span>
          </h2>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Shield, title: 'Verified Drivers', desc: 'All our drivers are experienced and government verified.' },
            { icon: Wrench, title: 'Well Maintained', desc: 'Regular serviced vehicles for safe and comfortable rides.' },
            { icon: Fuel, title: 'Transparent Pricing', desc: 'No hidden charges. What you see is what you pay.' },
            { icon: Users, title: 'All India Service', desc: 'Pickup and drop anywhere in India. One-way and round-trip available.' },
          ].map((item, index) => {
            const Icon = item.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-sm text-center"
              >
                <div className="w-12 h-12 rounded-full bg-brand-orange/10 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-brand-orange" />
                </div>
                <h3 className="font-bold text-brand-dark mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            )
          })}
        </div>
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
            <Car className="w-10 h-10 text-brand-orange mx-auto mb-4" />
            <h3 className="font-serif text-2xl sm:text-3xl text-white mb-3">
              Need a Custom Package?
            </h3>
            <p className="text-white/60 max-w-lg mx-auto mb-6">
              Contact our team for custom taxi booking requirements, outstation trips, and corporate travel solutions.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a href="https://wa.me/916396919007?text=Hi%20I%20want%20to%20book%20a%20taxi" target="_blank" rel="noopener noreferrer">
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
              <h4 className="font-semibold text-brand-dark text-sm">Safe Travel</h4>
              <p className="text-xs text-muted-foreground mt-0.5">GPS tracked vehicles with verified and experienced drivers.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-white rounded-xl p-5 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-brand-dark text-sm">24/7 Availability</h4>
              <p className="text-xs text-muted-foreground mt-0.5">Book anytime. Airport transfers and late-night pickups available.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-white rounded-xl p-5 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <Star className="w-5 h-5 text-amber-600 fill-amber-600" />
            </div>
            <div>
              <h4 className="font-semibold text-brand-dark text-sm">Trusted by 500+</h4>
              <p className="text-xs text-muted-foreground mt-0.5">Highly rated taxi service in Rishikesh with verified reviews.</p>
            </div>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  )
}
