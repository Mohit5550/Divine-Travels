'use client'

import { useAppStore } from '@/lib/store'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Waves,
  Clock,
  Route,
  Calendar,
  Shield,
  Star,
  Zap,
  ChevronRight,
  Timer,
  UsersRound,
  Briefcase,
  Rocket,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useState } from 'react'

interface RaftingPackage {
  id: string
  name: string
  subtitle: string
  price: number
  distance: string
  duration: string
  rapidsLevel: string
  rapidsDescription: string
  targetDemo: string
  targetIcon: React.ElementType
  highlights?: string
  timings: string
  popular?: boolean
  extreme?: boolean
  image: string
  gradient: string
  badgeText?: string
  badgeColor: string
}

const raftingPackages: RaftingPackage[] = [
  {
    id: 'brahmpuri',
    name: 'Brahmpuri To Rishikesh',
    subtitle: 'Beginner & Family',
    price: 399,
    distance: '9km to 12km route',
    duration: '1.5 to 2+ Hours',
    rapidsLevel: 'Grade I & II',
    rapidsDescription: 'Easy waves — perfect introduction to rafting',
    targetDemo: 'School groups, families, and first-timers. Safe for children above 14.',
    targetIcon: UsersRound,
    timings: '07:00 AM to 04:00 PM',
    image: 'https://picsum.photos/seed/brahmpuri-rafting-rishikesh/800/500',
    gradient: 'from-emerald-500/80 to-teal-600/80',
    badgeText: 'Family Friendly',
    badgeColor: 'bg-emerald-500',
  },
  {
    id: 'shivpuri',
    name: 'Shivpuri To Rishikesh',
    subtitle: 'Most Popular',
    price: 499,
    distance: '16km Route',
    duration: '3 to 4+ Hours',
    rapidsLevel: 'Grade II & III',
    rapidsDescription: 'Moderate rapids with exciting waves',
    targetDemo: 'College groups, friends, and corporate trips.',
    targetIcon: Briefcase,
    highlights: 'Includes body surfing and cliff jumping',
    timings: '07:00 AM to 04:00 PM',
    popular: true,
    image: 'https://picsum.photos/seed/shivpuri-rafting-adventure/800/500',
    gradient: 'from-brand-orange/80 to-amber-600/80',
    badgeText: 'Most Popular',
    badgeColor: 'bg-brand-orange',
  },
  {
    id: 'marine-drive',
    name: 'Marine Drive To Rishikesh',
    subtitle: 'Extreme Adventure',
    price: 599,
    distance: '24km to 26km Route',
    duration: '4 to 6 Hours',
    rapidsLevel: 'Grade III & IV',
    rapidsDescription: 'High thrill — for the adrenaline seekers',
    targetDemo: 'Highly energetic individuals and adventure junkies.',
    targetIcon: Rocket,
    timings: '07:00 AM to 04:00 PM',
    extreme: true,
    image: 'https://picsum.photos/seed/marine-drive-extreme-rafting/800/500',
    gradient: 'from-red-600/80 to-rose-700/80',
    badgeText: 'Extreme',
    badgeColor: 'bg-red-600',
  },
]

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
}

export function RaftingPackages() {
  const { navigate, isAuthenticated, user } = useAppStore()
  const [bookingPkg, setBookingPkg] = useState<string | null>(null)

  const handleBookTrip = (pkg: RaftingPackage) => {
    if (!isAuthenticated) {
      toast.error('Please login to book a rafting trip')
      return
    }

    setBookingPkg(pkg.id)

    // Create a booking via the API - use the Rishikesh destination
    const createBooking = async () => {
      try {
        // First find the Rishikesh destination
        const destRes = await fetch('/api/destinations?search=Rishikesh')
        const destinations = await destRes.json()
        const rishikesh = destinations.find((d: { name: string }) => d.name === 'Rishikesh')

        if (!rishikesh) {
          toast.error('Rishikesh destination not found')
          setBookingPkg(null)
          return
        }

        // Calculate dates (next weekend)
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        const dayAfter = new Date()
        dayAfter.setDate(dayAfter.getDate() + 2)

        const res = await fetch('/api/bookings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': user?.id || '',
          },
          body: JSON.stringify({
            destinationId: rishikesh.id,
            checkIn: tomorrow.toISOString().split('T')[0],
            checkOut: dayAfter.toISOString().split('T')[0],
            guests: 1,
            totalPrice: pkg.price,
            phone: user?.phone || '',
            specialReqs: `Rafting Package: ${pkg.name} (${pkg.subtitle})`,
          }),
        })

        if (!res.ok) {
          const data = await res.json()
          toast.error(data.error || 'Failed to create booking')
          return
        }

        toast.success(`${pkg.name} booked successfully! Get ready for an adventure!`)
        navigate('booking-success', rishikesh.id)
      } catch {
        toast.error('Failed to book trip. Please try again.')
      } finally {
        setBookingPkg(null)
      }
    }

    createBooking()
  }

  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Hero Section */}
      <section className="relative h-[50vh] sm:h-[60vh] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://picsum.photos/seed/rishikesh-ganga-rafting/1600/900"
            alt="White Water Rafting in Rishikesh"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/80 via-brand-dark/50 to-brand-cream" />
        </div>

        {/* Ornaments */}
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

            {/* Quick Stats */}
            <div className="flex items-center justify-center gap-6 sm:gap-10 mt-6">
              <div className="text-center">
                <div className="text-white font-bold text-xl sm:text-2xl">3</div>
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

      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Button
          variant="ghost"
          className="text-brand-dark hover:text-brand-orange"
          onClick={() => navigate('landing')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Destinations
        </Button>
      </div>

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {raftingPackages.map((pkg, index) => {
            const TargetIcon = pkg.targetIcon
            const isBooking = bookingPkg === pkg.id

            return (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
                className={`relative group ${
                  pkg.popular ? 'md:-mt-4 md:mb-4' : ''
                }`}
              >
                {/* Popular glow */}
                {pkg.popular && (
                  <div className="absolute -inset-1 bg-gradient-to-r from-brand-orange/20 to-amber-500/20 rounded-3xl blur-lg group-hover:from-brand-orange/30 group-hover:to-amber-500/30 transition-all duration-500" />
                )}

                <div className={`relative bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 ${
                  pkg.popular ? 'ring-2 ring-brand-orange' : ''
                }`}>
                  {/* Image Section */}
                  <div className="relative h-48 sm:h-56 overflow-hidden">
                    <img
                      src={pkg.image}
                      alt={pkg.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${pkg.gradient} to-transparent opacity-70`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Badge */}
                    <div className={`absolute top-4 left-4 ${pkg.badgeColor} text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5`}>
                      {pkg.popular && <Star className="w-3 h-3 fill-white" />}
                      {pkg.extreme && <Zap className="w-3 h-3" />}
                      {!pkg.popular && !pkg.extreme && <Shield className="w-3 h-3" />}
                      {pkg.badgeText}
                    </div>

                    {/* Price floating badge */}
                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg">
                      <div className="text-brand-orange font-bold text-lg leading-none">₹{pkg.price}</div>
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

                    {/* Rapids Description */}
                    <div className="flex items-center gap-2 text-sm">
                      <Waves className="w-4 h-4 text-brand-orange shrink-0" />
                      <span className="text-muted-foreground">{pkg.rapidsDescription}</span>
                    </div>

                    {/* Highlights */}
                    {pkg.highlights && (
                      <div className="bg-brand-orange/5 border border-brand-orange/10 rounded-xl p-3">
                        <div className="flex items-center gap-2 text-sm font-semibold text-brand-orange mb-1">
                          <Star className="w-4 h-4 fill-brand-orange" />
                          Key Highlights
                        </div>
                        <p className="text-sm text-brand-dark">{pkg.highlights}</p>
                      </div>
                    )}

                    {/* Target Demo */}
                    <div className="flex items-start gap-2.5 text-sm">
                      <TargetIcon className="w-4 h-4 text-brand-teal shrink-0 mt-0.5" />
                      <div>
                        <span className="font-medium text-brand-dark">Best for: </span>
                        <span className="text-muted-foreground">{pkg.targetDemo}</span>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-border/50" />

                    {/* Price & Book */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-brand-dark">₹{pkg.price}</span>
                        <span className="text-muted-foreground text-sm"> / Per Person</span>
                      </div>
                      <Button
                        onClick={() => handleBookTrip(pkg)}
                        disabled={isBooking}
                        className={`text-white rounded-full px-5 sm:px-6 h-11 text-sm font-semibold shadow-lg ${
                          pkg.extreme
                            ? 'bg-red-600 hover:bg-red-700 shadow-red-600/30'
                            : pkg.popular
                            ? 'bg-brand-orange hover:bg-brand-orange/90 shadow-brand-orange/30'
                            : 'bg-brand-teal hover:bg-brand-teal/90 shadow-brand-teal/30'
                        }`}
                      >
                        {isBooking ? (
                          <span className="flex items-center gap-2">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                              className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                            />
                            Booking...
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5">
                            Book {pkg.name.split(' ')[0]} Trip
                            <ChevronRight className="w-4 h-4" />
                          </span>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 sm:mt-20 bg-gradient-to-r from-brand-dark via-brand-navy to-brand-dark rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden"
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
              <Button
                onClick={() => {
                  if (!isAuthenticated) {
                    toast.error('Please login to contact us')
                  } else {
                    navigate('user-dashboard')
                  }
                }}
                className="bg-brand-orange hover:bg-brand-orange/90 text-white rounded-full px-8 h-12"
              >
                Contact Us
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('landing')}
                className="border-white/30 text-white hover:bg-white/10 rounded-full px-8 h-12"
              >
                View All Destinations
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Safety Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 pb-16"
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
              <Calendar className="w-5 h-5 text-blue-600" />
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
    </div>
  )
}
