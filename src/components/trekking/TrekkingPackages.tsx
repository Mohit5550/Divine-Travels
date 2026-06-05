'use client'

import { useAppStore } from '@/lib/store'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Mountain,
  Clock,
  Route,
  Star,
  ChevronRight,
  Shield,
  Users,
  MapPin,
  Eye,
  MessageCircle,
  Phone,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Navbar } from '@/components/landing/Navbar'
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

function getDifficultyIcon(subtitle: string) {
  if (subtitle.includes('Easy')) return Shield
  if (subtitle.includes('Moderate')) return Zap
  if (subtitle.includes('Difficult')) return Mountain
  return Mountain
}

export function TrekkingPackages() {
  const { navigate, isAuthenticated } = useAppStore()

  const { data: packages = [], isLoading } = useQuery({
    queryKey: ['trekking-packages'],
    queryFn: async () => {
      const res = await fetch('/api/packages?category=trekking')
      const data = await res.json()
      return data as PackageData[]
    },
  })

  const handleBookTrip = (pkg: PackageData) => {
    if (!isAuthenticated) {
      toast.error('Please login to book a trek')
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

      {/* Hero Section */}
      <section className="relative h-[50vh] sm:h-[60vh] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://www.enlivetrips.com/uploads/posts/kedarkantha%20trek.jpg"
            alt="Trekking in Uttarakhand"
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
              <Mountain className="w-4 h-4 text-brand-orange" />
              <span className="text-brand-orange text-sm font-semibold">Uttarakhand Treks</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-white leading-tight mb-3">
              Trekking in <span className="text-brand-orange">Uttarakhand</span>
            </h1>
            <p className="text-white/70 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
              From easy weekend treks to challenging Himalayan expeditions — discover the magic of Uttarakhand on foot.
            </p>

            <div className="flex items-center justify-center gap-6 sm:gap-10 mt-6">
              <div className="text-center">
                <div className="text-white font-bold text-xl sm:text-2xl">{packages.length || 10}</div>
                <div className="text-white/50 text-xs">Treks</div>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div className="text-center">
                <div className="text-white font-bold text-xl sm:text-2xl">Easy-Difficult</div>
                <div className="text-white/50 text-xs">Difficulty Levels</div>
              </div>
              <div className="w-px h-8 bg-white/20" />
              <div className="text-center">
                <div className="text-white font-bold text-xl sm:text-2xl">9K-16K ft</div>
                <div className="text-white/50 text-xs">Altitude Range</div>
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
            Choose Your Trek
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-brand-dark mt-2">
            Trekking Packages
          </h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            From gentle meadows to high-altitude passes — pick the trek that matches your adventure level
          </p>
        </motion.div>

        {/* Package Cards - 3 Column Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg animate-pulse">
                <div className="h-48 sm:h-56 bg-muted" />
                <div className="p-5 sm:p-6 space-y-4">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {packages.map((pkg, index) => {
              const DiffIcon = getDifficultyIcon(pkg.subtitle)
              const isModerate = pkg.badge === 'Moderate'
              const isDifficult = pkg.badge === 'Difficult'

              return (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15, duration: 0.5 }}
                  className={`relative group ${
                    isModerate ? 'md:-mt-4 md:mb-4' : ''
                  }`}
                >
                  {isModerate && (
                    <div className="absolute -inset-1 bg-gradient-to-r from-brand-orange/20 to-amber-500/20 rounded-3xl blur-lg group-hover:from-brand-orange/30 group-hover:to-amber-500/30 transition-all duration-500" />
                  )}

                  <div className={`relative bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer ${
                    isModerate ? 'ring-2 ring-brand-orange' : ''
                  }`}>
                    {/* Image Section */}
                    <div className="relative h-48 sm:h-56 overflow-hidden" onClick={() => handleViewDetails(pkg)}>
                      <img
                        src={pkg.image}
                        alt={pkg.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className={`absolute inset-0 bg-gradient-to-t ${pkg.gradient} to-transparent opacity-70`} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                      {/* Badge */}
                      <div className={`absolute top-4 left-4 ${pkg.badgeColor} text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5`}>
                        {isModerate && <Star className="w-3 h-3 fill-white" />}
                        {isDifficult && <Zap className="w-3 h-3" />}
                        {!isModerate && !isDifficult && <Shield className="w-3 h-3" />}
                        {pkg.badge}
                      </div>

                      {/* Price floating badge */}
                      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg">
                        {pkg.originalPrice != null && pkg.originalPrice > pkg.price ? (
                          <div className="flex flex-col items-end">
                            <span className="line-through text-white/60 text-xs">₹{pkg.originalPrice}</span>
                            <div className="text-brand-orange font-bold text-lg leading-none">₹{pkg.price}</div>
                            <span className="text-emerald-500 text-[10px] font-semibold">Save ₹{pkg.originalPrice - pkg.price}</span>
                          </div>
                        ) : (
                          <div className="text-brand-orange font-bold text-lg leading-none">₹{pkg.price}</div>
                        )}
                        <div className="text-muted-foreground text-[10px] mt-0.5">per person</div>
                      </div>

                      {/* Bottom content on image */}
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-white font-bold text-lg sm:text-xl leading-tight">{pkg.name}</h3>
                        <p className="text-white/80 text-sm mt-0.5">{pkg.subtitle}</p>
                      </div>
                    </div>

                    {/* Details Section */}
                    <div className="p-5 sm:p-6 space-y-4">
                      {/* Key Specs - Grid */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-brand-cream/70 rounded-xl p-3 flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                            <Clock className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">Duration</div>
                            <div className="text-sm font-semibold text-brand-dark">{pkg.duration}</div>
                          </div>
                        </div>
                        <div className="bg-brand-cream/70 rounded-xl p-3 flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                            <MapPin className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">Location</div>
                            <div className="text-sm font-semibold text-brand-dark">{pkg.location || 'Uttarakhand'}</div>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="flex items-center gap-2 text-sm">
                        <Mountain className="w-4 h-4 text-brand-orange shrink-0" />
                        <span className="text-muted-foreground">{pkg.tagline}</span>
                      </div>

                      {/* Target Demo */}
                      <div className="flex items-start gap-2.5 text-sm">
                        <DiffIcon className="w-4 h-4 text-brand-teal shrink-0 mt-0.5" />
                        <div>
                          <span className="font-medium text-brand-dark">Best for: </span>
                          <span className="text-muted-foreground">{pkg.targetDemo}</span>
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
                          <span className="text-xs text-muted-foreground">({pkg.reviewCount} reviews)</span>
                        </div>
                      )}

                      {/* Divider */}
                      <div className="border-t border-border/50" />

                      {/* Price, View Details & Book */}
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          {pkg.originalPrice != null && pkg.originalPrice > pkg.price ? (
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-lg line-through text-muted-foreground">₹{pkg.originalPrice}</span>
                              <span className="text-2xl font-bold text-brand-dark">₹{pkg.price}</span>
                              <span className="text-emerald-600 text-xs font-semibold">Save ₹{pkg.originalPrice - pkg.price}</span>
                            </div>
                          ) : (
                            <span className="text-2xl font-bold text-brand-dark">₹{pkg.price}</span>
                          )}
                          <span className="text-muted-foreground text-sm"> / Person</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            onClick={() => handleViewDetails(pkg)}
                            className="rounded-full px-4 h-10 text-sm border-brand-orange/30 text-brand-orange hover:bg-brand-orange/5"
                          >
                            <Eye className="w-4 h-4 mr-1.5" />
                            Details
                          </Button>
                          <Button
                            onClick={() => handleBookTrip(pkg)}
                            className={`text-white rounded-full px-4 h-10 text-sm font-semibold shadow-lg ${
                              isDifficult
                                ? 'bg-red-600 hover:bg-red-700 shadow-red-600/30'
                                : isModerate
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
            { icon: Shield, title: 'Safety First', desc: 'All treks include oxygen cylinders, first aid, and certified trek leaders.' },
            { icon: MapPin, title: 'Expert Guides', desc: 'Experienced local guides who know every trail in Uttarakhand.' },
            { icon: Users, title: 'Small Groups', desc: 'We keep group sizes small for personalized attention.' },
            { icon: Mountain, title: 'Best Routes', desc: 'Carefully curated routes for the best trekking experience.' },
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
            <Mountain className="w-10 h-10 text-brand-orange mx-auto mb-4" />
            <h3 className="font-serif text-2xl sm:text-3xl text-white mb-3">
              Not sure which trek to choose?
            </h3>
            <p className="text-white/60 max-w-lg mx-auto mb-6">
              Contact our trek experts for personalized recommendations based on your fitness level and interests.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a href="https://wa.me/916396919007?text=Hi%20I%20want%20to%20book%20a%20trek" target="_blank" rel="noopener noreferrer">
                <Button className="bg-green-600 hover:bg-green-700 text-white rounded-full px-8 h-12">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  WhatsApp Us
                </Button>
              </a>
              <a href="tel:+916396919007">
                <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 rounded-full px-8 h-12">
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
              <h4 className="font-semibold text-brand-dark text-sm">Safety Equipment</h4>
              <p className="text-xs text-muted-foreground mt-0.5">Oxygen cylinders, first aid kits, and walkie-talkies on every trek.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-white rounded-xl p-5 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-brand-dark text-sm">Certified Leaders</h4>
              <p className="text-xs text-muted-foreground mt-0.5">Experienced and certified trek leaders with wilderness training.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-white rounded-xl p-5 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <Star className="w-5 h-5 text-amber-600 fill-amber-600" />
            </div>
            <div>
              <h4 className="font-semibold text-brand-dark text-sm">1000+ Happy Trekkers</h4>
              <p className="text-xs text-muted-foreground mt-0.5">The most trusted trekking company in Uttarakhand.</p>
            </div>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  )
}
