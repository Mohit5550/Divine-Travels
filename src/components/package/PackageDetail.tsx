'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAppStore } from '@/lib/store'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  MapPin,
  Star,
  Clock,
  Route,
  Waves,
  Shield,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  Send,
  Heart,
  Share2,
  Camera,
  UsersRound,
  Timer,
  Phone,
  Calendar,
  Info,
  Map,
  Car,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import { BackButton } from '@/components/ui/BackButton'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { useState } from 'react'

interface PackageImage {
  url: string
}

interface FAQ {
  question: string
  answer: string
}

interface ItineraryDay {
  day: number
  title: string
  startTime: string
  endTime: string
  altitude: string
  altitudeGain: string
  distance: string
  hours: string
  description: string
}

interface FixedDeparture {
  date: string
  status: 'available' | 'few-seats' | 'sold-out'
  notes: string
}

interface Review {
  id: string
  rating: number
  comment: string
  createdAt: string
  user: { id: string; name: string; avatar: string | null }
}

interface PackageData {
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
  distance: string
  duration: string
  rapidsLevel: string
  rapidsDescription: string
  targetDemo: string
  timings: string
  highlights: string
  inclusions: string
  exclusions: string
  eligibility: string
  location: string
  cancellationPolicy: string
  faqs: string
  badge: string | null
  badgeColor: string
  gradient: string
  rating: number
  reviewCount: number
  reviews: Review[]
  routeLength: string
  maxAltitude: string
  baseCamp: string
  pickupPoint: string
  suitableFor: string
  experience: string
  fitness: string
  bestSeason: string
  gstRate: number
  itinerary: string
  thingsToCarry: string
  howToReach: string
  importantInfo: string
  fixedDepartures: string
  pickupLocationUrl: string
}

type DetailSection = 'about' | 'highlights' | 'inclusions' | 'exclusions' | 'eligibility' | 'location' | 'cancellation' | 'reviews' | 'faqs' | 'howToReach' | 'thingsToCarry' | 'importantInfo'

export function PackageDetail() {
  const { selectedPackageId, navigate, isAuthenticated, user } = useAppStore()
  const queryClient = useQueryClient()
  const [activeSection, setActiveSection] = useState<DetailSection>('about')
  const [showGallery, setShowGallery] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })
  const [submittingReview, setSubmittingReview] = useState(false)

  const { data: pkg, isLoading } = useQuery({
    queryKey: ['package-detail', selectedPackageId],
    queryFn: async () => {
      const res = await fetch(`/api/packages/${selectedPackageId}`)
      if (!res.ok) throw new Error('Package not found')
      return res.json() as Promise<PackageData>
    },
    enabled: !!selectedPackageId,
  })

  const parsedData = pkg ? {
    images: JSON.parse(pkg.images || '[]') as string[],
    highlights: JSON.parse(pkg.highlights || '[]') as string[],
    inclusions: JSON.parse(pkg.inclusions || '[]') as string[],
    exclusions: JSON.parse(pkg.exclusions || '[]') as string[],
    faqs: JSON.parse(pkg.faqs || '[]') as FAQ[],
    itinerary: JSON.parse(pkg.itinerary || '[]') as ItineraryDay[],
    thingsToCarry: JSON.parse(pkg.thingsToCarry || '[]') as string[],
    howToReach: JSON.parse(pkg.howToReach || '[]') as string[],
    fixedDepartures: JSON.parse(pkg.fixedDepartures || '[]') as FixedDeparture[],
  } : null

  const handleBookNow = () => {
    if (!isAuthenticated) {
      toast.error('Please login to book this package')
      return
    }
    navigate('package-booking', null, pkg?.id)
  }

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated) {
      toast.error('Please login to write a review')
      return
    }

    setSubmittingReview(true)
    try {
      const res = await fetch(`/api/packages/${selectedPackageId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || '',
        },
        body: JSON.stringify({
          rating: reviewForm.rating,
          comment: reviewForm.comment,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Failed to submit review')
        return
      }

      toast.success('Review submitted!')
      setReviewForm({ rating: 5, comment: '' })
      queryClient.invalidateQueries({ queryKey: ['package-detail', selectedPackageId] })
    } catch {
      toast.error('Failed to submit review')
    } finally {
      setSubmittingReview(false)
    }
  }

  const sections: { id: DetailSection; label: string }[] = [
    { id: 'about', label: 'About' },
    { id: 'highlights', label: 'Highlights' },
    { id: 'inclusions', label: 'Inclusions' },
    { id: 'exclusions', label: 'Exclusions' },
    { id: 'thingsToCarry', label: 'Things To Carry' },
    { id: 'howToReach', label: 'How To Reach' },
    { id: 'importantInfo', label: 'Important Info' },
    { id: 'eligibility', label: 'Eligibility' },
    { id: 'location', label: 'Location' },
    { id: 'cancellation', label: 'Cancellation Policy' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'faqs', label: 'FAQs' },
  ]

  if (isLoading || !pkg || !parsedData) {
    return (
      <div className="min-h-screen bg-brand-cream">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <BackButton className="mb-4" />
          <div className="h-96 bg-muted rounded-2xl animate-pulse" />
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-cream">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 pt-4">
        <BackButton className="mb-2" />
      </div>
      {/* Image Gallery Modal */}
      <AnimatePresence>
        {showGallery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
            onClick={() => setShowGallery(false)}
          >
            <button
              onClick={() => setShowGallery(false)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 text-white z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
              <img
                src={parsedData.images[selectedImage] || pkg.image}
                alt={pkg.name}
                className="w-full max-h-[80vh] object-contain rounded-xl"
              />
              <div className="flex items-center justify-center gap-2 mt-4">
                {parsedData.images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${
                      i === selectedImage ? 'bg-brand-orange' : 'bg-white/40'
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Button
          variant="ghost"
          className="text-brand-dark hover:text-brand-orange"
          onClick={() => {
            const viewMap: Record<string, string> = {
              rafting: 'rafting-packages', trekking: 'trekking', adventure: 'adventure',
              'bike-rental': 'bike-rental', 'taxi-booking': 'taxi-booking',
              'domestic-tours': 'domestic-tours', international: 'international',
              'international-tours': 'international', 'spiritual-tours': 'spiritual',
              stay: 'stay',
            }
            navigate(viewMap[pkg.category] || 'rafting-packages')
          }}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to {pkg.category ? pkg.category.charAt(0).toUpperCase() + pkg.category.slice(1).replace(/-/g, ' ') : 'Packages'}
        </Button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Column: Hero + Safety + Mobile Booking + Tabs + Sections */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Image Gallery */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl overflow-hidden"
            >
              <div className="relative h-64 sm:h-[400px]">
                <img
                  src={pkg.image}
                  alt={pkg.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

                {/* Thumbnails */}
                {parsedData.images.length > 0 && (
                  <div className="absolute top-4 right-4 flex gap-2">
                    {parsedData.images.slice(0, 3).map((img, i) => (
                      <button
                        key={i}
                        onClick={() => { setSelectedImage(i); setShowGallery(true) }}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 border-white/50 hover:border-white transition-colors"
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                    {parsedData.images.length > 3 && (
                      <button
                        onClick={() => setShowGallery(true)}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-black/50 backdrop-blur-sm flex items-center justify-center border-2 border-white/50 hover:border-white transition-colors"
                      >
                        <div className="text-center text-white">
                          <Camera className="w-4 h-4 mx-auto" />
                          <span className="text-[10px]">+{parsedData.images.length - 3}</span>
                        </div>
                      </button>
                    )}
                  </div>
                )}

                {/* Bottom overlay info */}
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full text-white ${pkg.badgeColor}`}>
                        {pkg.badge}
                      </span>
                    </div>
                    <h1 className="text-white font-bold text-2xl sm:text-3xl font-serif">{pkg.name}</h1>
                    <p className="text-white/80 text-sm mt-0.5">{pkg.tagline}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/40 transition-colors">
                      <Share2 className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Info Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-wrap gap-3"
            >
              <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm">
                <Star className="w-4 h-4 fill-brand-gold text-brand-gold" />
                <span className="font-semibold text-sm text-brand-dark">{pkg.rating}</span>
                <span className="text-xs text-muted-foreground">({pkg.reviewCount} reviews)</span>
              </div>
              <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm">
                <MapPin className="w-4 h-4 text-brand-teal" />
                <span className="text-sm text-brand-dark">Rishikesh, India</span>
              </div>
              <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm">
                <Route className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-brand-dark">{pkg.distance}</span>
              </div>
              <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-sm">
                <Timer className="w-4 h-4 text-amber-500" />
                <span className="text-sm text-brand-dark">{pkg.duration}</span>
              </div>
            </motion.div>

            {/* Trekking Specs Strip */}
            {(pkg.routeLength || pkg.maxAltitude) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 }}
                className="bg-white rounded-xl p-4 shadow-sm grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
              >
                {pkg.routeLength && (
                  <div className="text-center">
                    <Route className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                    <div className="text-xs font-semibold text-brand-dark">{pkg.routeLength}</div>
                    <div className="text-[10px] text-muted-foreground">Route Length</div>
                  </div>
                )}
                {pkg.maxAltitude && (
                  <div className="text-center">
                    <Map className="w-4 h-4 text-purple-500 mx-auto mb-1" />
                    <div className="text-xs font-semibold text-brand-dark">{pkg.maxAltitude}</div>
                    <div className="text-[10px] text-muted-foreground">Max Altitude</div>
                  </div>
                )}
                {pkg.baseCamp && (
                  <div className="text-center">
                    <MapPin className="w-4 h-4 text-brand-teal mx-auto mb-1" />
                    <div className="text-xs font-semibold text-brand-dark">{pkg.baseCamp}</div>
                    <div className="text-[10px] text-muted-foreground">Base Camp</div>
                  </div>
                )}
                {pkg.pickupPoint && (
                  <div className="text-center">
                    <Car className="w-4 h-4 text-amber-500 mx-auto mb-1" />
                    <div className="text-xs font-semibold text-brand-dark">{pkg.pickupPoint}</div>
                    <div className="text-[10px] text-muted-foreground">Pickup Point</div>
                  </div>
                )}
                {pkg.suitableFor && (
                  <div className="text-center">
                    <UsersRound className="w-4 h-4 text-green-500 mx-auto mb-1" />
                    <div className="text-xs font-semibold text-brand-dark">{pkg.suitableFor}</div>
                    <div className="text-[10px] text-muted-foreground">Suitable For</div>
                  </div>
                )}
                {pkg.bestSeason && (
                  <div className="text-center">
                    <Calendar className="w-4 h-4 text-red-500 mx-auto mb-1" />
                    <div className="text-xs font-semibold text-brand-dark">{pkg.bestSeason}</div>
                    <div className="text-[10px] text-muted-foreground">Best Season</div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="flex flex-wrap gap-4 sm:gap-6 bg-white rounded-xl p-4 shadow-sm"
            >
              <div className="flex items-center gap-2 text-sm text-brand-dark">
                <Shield className="w-5 h-5 text-brand-teal" />
                <span>Safety First</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-brand-dark">
                <Clock className="w-5 h-5 text-brand-orange" />
                <span>Free Cancellation</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-brand-dark">
                <Phone className="w-5 h-5 text-green-500" />
                <span>Instant Confirmation</span>
              </div>
            </motion.div>

            {/* Booking Panel - mobile only */}
            <div className="lg:hidden order-2 bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-brand-dark to-brand-navy p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-bold text-lg">{pkg.name}</h3>
                    <p className="text-white/60 text-sm">{pkg.subtitle}</p>
                  </div>
                  <div className="text-right">
                    {pkg.originalPrice && pkg.originalPrice > pkg.price ? (
                      <>
                        <div className="text-white/50 text-sm line-through">₹{pkg.originalPrice}</div>
                        <div className="text-white font-bold text-2xl">₹{pkg.price}</div>
                        <div className="text-emerald-400 text-xs font-semibold">Save ₹{pkg.originalPrice - pkg.price}</div>
                      </>
                    ) : (
                      <div className="text-white font-bold text-2xl">₹{pkg.price}</div>
                    )}
                    <div className="text-white/60 text-xs">per person</div>
                  </div>
                </div>
              </div>
              <div className="p-5 space-y-3 border-b border-border/50">
                <div className="flex items-center gap-3 text-sm">
                  <Route className="w-4 h-4 text-blue-500" />
                  <span className="text-muted-foreground">{pkg.distance}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Timer className="w-4 h-4 text-amber-500" />
                  <span className="text-muted-foreground">{pkg.duration}</span>
                </div>
                {pkg.routeLength ? (
                  <>
                    <div className="flex items-center gap-3 text-sm">
                      <Map className="w-4 h-4 text-purple-500" />
                      <span className="text-muted-foreground">{pkg.routeLength}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="w-4 h-4 text-brand-teal" />
                      <span className="text-muted-foreground">{pkg.baseCamp || '—'}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3 text-sm">
                      <Waves className="w-4 h-4 text-red-500" />
                      <span className="text-muted-foreground">{pkg.rapidsLevel}{pkg.rapidsDescription ? ` — ${pkg.rapidsDescription}` : ''}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Clock className="w-4 h-4 text-green-500" />
                      <span className="text-muted-foreground">{pkg.timings}</span>
                    </div>
                  </>
                )}
              </div>
              <div className="p-5">
                <Button onClick={handleBookNow} className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white h-12 text-base font-semibold rounded-xl">
                  Book This Activity
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              <div className="p-5 bg-brand-cream/50 space-y-3">
                <h4 className="font-semibold text-sm text-brand-dark">Why Divine Travel?</h4>
                {[
                  { text: '500+ happy adventurers', icon: '🎉' },
                  { text: 'Pay 10% to reserve — balance at location', icon: '💳' },
                  { text: 'Lowest prices with last-minute availability', icon: '🏷️' },
                  { text: 'Instant booking confirmation', icon: '⚡' },
                  { text: '24/7 expert support', icon: '📞' },
                  { text: 'No hidden charges. Ever.', icon: '✅' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <span className="text-base">{item.icon}</span>
                    {item.text}
                  </div>
                ))}
              </div>
              <div className="p-5 border-t border-border/50">
                <p className="text-xs text-muted-foreground mb-2">Still have questions?</p>
                <Button variant="outline" className="w-full border-brand-teal text-brand-teal hover:bg-brand-teal/5 rounded-xl h-10"
                  onClick={() => {
                    if (!isAuthenticated) { toast.error('Please login to contact us') }
                    else { toast.info('Our team will contact you shortly!') }
                  }}>
                  <Phone className="w-4 h-4 mr-2" />
                  Connect with Team
                </Button>
              </div>
            </div>

            {/* Section Navigation - Sticky */}
            <div className="sticky top-0 z-20 bg-brand-cream/95 backdrop-blur-sm -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 py-3 border-b border-border/50">
              <div className="flex gap-1 overflow-x-auto hide-scrollbar">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => {
                      setActiveSection(section.id)
                      const el = document.getElementById(section.id)
                      if (el) {
                        const offset = 120
                        const y = el.getBoundingClientRect().top + window.scrollY - offset
                        window.scrollTo({ top: y, behavior: 'smooth' })
                      }
                    }}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                      activeSection === section.id
                        ? 'bg-brand-orange text-white'
                        : 'text-muted-foreground hover:text-brand-dark hover:bg-white'
                    }`}
                  >
                    {section.label}
                  </button>
                ))}
              </div>
            </div>

            {/* About Section */}
            <motion.div
              id="about"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <h2 className="font-serif text-xl text-brand-dark mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-brand-orange rounded-full" />
                About
              </h2>
              {pkg.description.split('\n\n').map((paragraph, i) => (
                <p key={i} className="text-muted-foreground leading-relaxed mb-4 last:mb-0">
                  {paragraph}
                </p>
              ))}

              {/* Quick specs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                <div className="bg-brand-cream/70 rounded-xl p-3 text-center">
                  <Route className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                  <div className="text-sm font-semibold text-brand-dark">{pkg.distance}</div>
                  <div className="text-xs text-muted-foreground">Distance</div>
                </div>
                <div className="bg-brand-cream/70 rounded-xl p-3 text-center">
                  <Timer className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                  <div className="text-sm font-semibold text-brand-dark">{pkg.duration}</div>
                  <div className="text-xs text-muted-foreground">Duration</div>
                </div>
                {pkg.routeLength ? (
                  <>
                    <div className="bg-brand-cream/70 rounded-xl p-3 text-center">
                      <Map className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                      <div className="text-sm font-semibold text-brand-dark">{pkg.maxAltitude}</div>
                      <div className="text-xs text-muted-foreground">Max Altitude</div>
                    </div>
                    <div className="bg-brand-cream/70 rounded-xl p-3 text-center">
                      <Calendar className="w-5 h-5 text-red-500 mx-auto mb-1" />
                      <div className="text-sm font-semibold text-brand-dark">{pkg.bestSeason}</div>
                      <div className="text-xs text-muted-foreground">Best Season</div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-brand-cream/70 rounded-xl p-3 text-center">
                      <Waves className="w-5 h-5 text-red-500 mx-auto mb-1" />
                      <div className="text-sm font-semibold text-brand-dark">{pkg.rapidsLevel}</div>
                      <div className="text-xs text-muted-foreground">Rapids</div>
                    </div>
                    <div className="bg-brand-cream/70 rounded-xl p-3 text-center">
                      <Clock className="w-5 h-5 text-green-500 mx-auto mb-1" />
                      <div className="text-sm font-semibold text-brand-dark">{pkg.timings}</div>
                      <div className="text-xs text-muted-foreground">Timings</div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>

            {/* Highlights Section */}
            <motion.div
              id="highlights"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <h2 className="font-serif text-xl text-brand-dark mb-1 flex items-center gap-2">
                <div className="w-1 h-6 bg-brand-orange rounded-full" />
                Highlights
              </h2>
              <p className="text-muted-foreground text-sm mb-4">What makes this experience special</p>

              <div className="space-y-3">
                {parsedData.highlights.map((highlight: string, i: number) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-brand-orange/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 text-brand-orange" />
                    </div>
                    <p className="text-sm text-brand-dark">{highlight}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Inclusions & Exclusions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <motion.div
                id="inclusions"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-6 shadow-sm"
              >
                <h2 className="font-serif text-lg text-brand-dark mb-4 flex items-center gap-2">
                  <div className="w-1 h-5 bg-green-500 rounded-full" />
                  Inclusions
                </h2>
                <div className="space-y-2.5">
                  {parsedData.inclusions.map((item: string, i: number) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-muted-foreground">{item}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                id="exclusions"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl p-6 shadow-sm"
              >
                <h2 className="font-serif text-lg text-brand-dark mb-4 flex items-center gap-2">
                  <div className="w-1 h-5 bg-red-500 rounded-full" />
                  Exclusions
                </h2>
                <div className="space-y-2.5">
                  {parsedData.exclusions.map((item: string, i: number) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <p className="text-sm text-muted-foreground">{item}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Things To Carry */}
            <motion.div
              id="thingsToCarry"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <h2 className="font-serif text-xl text-brand-dark mb-1 flex items-center gap-2">
                <div className="w-1 h-6 bg-brand-orange rounded-full" />
                Things To Carry
              </h2>
              <p className="text-muted-foreground text-sm mb-4">Pack these essentials</p>

              {parsedData.thingsToCarry.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {parsedData.thingsToCarry.map((item: string, i: number) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-brand-teal shrink-0 mt-0.5" />
                      <p className="text-sm text-muted-foreground">{item}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">Packing list coming soon.</p>
              )}
            </motion.div>

            {/* How To Reach */}
            <motion.div
              id="howToReach"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <h2 className="font-serif text-xl text-brand-dark mb-1 flex items-center gap-2">
                <div className="w-1 h-6 bg-brand-orange rounded-full" />
                How To Reach
              </h2>
              <p className="text-muted-foreground text-sm mb-4">Getting to the start point</p>

              {parsedData.howToReach.length > 0 ? (
                <div className="space-y-3">
                  {parsedData.howToReach.map((item: string, i: number) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-brand-cream/50 rounded-xl">
                      <Car className="w-5 h-5 text-brand-teal shrink-0 mt-0.5" />
                      <p className="text-sm text-muted-foreground leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">Travel details coming soon.</p>
              )}
            </motion.div>

            {/* Important Info */}
            <motion.div
              id="importantInfo"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <h2 className="font-serif text-xl text-brand-dark mb-1 flex items-center gap-2">
                <div className="w-1 h-6 bg-brand-orange rounded-full" />
                Important Info
              </h2>
              <p className="text-muted-foreground text-sm mb-4">What you need to know</p>

              {pkg.importantInfo ? (
                <div className="text-sm text-muted-foreground leading-relaxed space-y-3">
                  {pkg.importantInfo.split('\n\n').map((para: string, i: number) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">Important information coming soon.</p>
              )}
            </motion.div>

            {/* Eligibility */}
            <motion.div
              id="eligibility"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <h2 className="font-serif text-xl text-brand-dark mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-brand-orange rounded-full" />
                Eligibility
              </h2>
              <div className="flex items-start gap-3">
                <UsersRound className="w-5 h-5 text-brand-teal shrink-0 mt-0.5" />
                <p className="text-muted-foreground leading-relaxed">{pkg.eligibility}</p>
              </div>
            </motion.div>

            {/* Location */}
            <motion.div
              id="location"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <h2 className="font-serif text-xl text-brand-dark mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-brand-orange rounded-full" />
                Location
              </h2>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-brand-teal shrink-0 mt-0.5" />
                <p className="text-muted-foreground leading-relaxed">{pkg.location}</p>
              </div>
              {pkg.pickupLocationUrl ? (
                <a
                  href={pkg.pickupLocationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex items-center gap-2 bg-brand-teal text-white rounded-xl px-5 py-3 hover:bg-brand-teal/90 transition-colors w-fit"
                >
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm font-semibold">Open Pickup Location in Google Maps</span>
                </a>
              ) : (
                <div className="mt-4 bg-brand-cream rounded-xl h-48 flex items-center justify-center border border-border/50">
                  <div className="text-center">
                    <MapPin className="w-8 h-8 text-brand-orange mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">{pkg.name} — Rishikesh, Uttarakhand</p>
                    <p className="text-xs text-muted-foreground mt-1">Map integration coming soon</p>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Cancellation Policy */}
            <motion.div
              id="cancellation"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <h2 className="font-serif text-xl text-brand-dark mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-brand-orange rounded-full" />
                Cancellation Policy
              </h2>
              {pkg.cancellationPolicy.split('. ').filter(s => s.trim()).map((point, i) => (
                <div key={i} className="flex items-start gap-2.5 mb-2">
                  <div className="w-2 h-2 rounded-full bg-brand-orange shrink-0 mt-1.5" />
                  <p className="text-sm text-muted-foreground">{point.trim().endsWith('.') ? point : point + '.'}</p>
                </div>
              ))}
            </motion.div>

            {/* Reviews Section */}
            <motion.div
              id="reviews"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <h2 className="font-serif text-xl text-brand-dark mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-brand-orange rounded-full" />
                Reviews
                <span className="text-sm font-normal text-muted-foreground">({pkg.reviews?.length || 0})</span>
              </h2>

              {/* Rating summary */}
              <div className="flex items-center gap-4 mb-6 p-4 bg-brand-cream/70 rounded-xl">
                <div className="text-center">
                  <div className="text-4xl font-bold text-brand-dark">{pkg.rating}</div>
                  <div className="flex items-center gap-0.5 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.round(pkg.rating) ? 'fill-brand-gold text-brand-gold' : 'text-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{pkg.reviewCount} reviews</p>
                </div>
              </div>

              {/* Review Cards */}
              {pkg.reviews?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {pkg.reviews.slice(0, 4).map((review) => (
                    <div key={review.id} className="bg-brand-cream/50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-brand-orange/10 flex items-center justify-center">
                          <span className="text-brand-orange font-semibold text-xs">
                            {review.user.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-sm text-brand-dark">{review.user.name}</p>
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < review.rating ? 'fill-brand-gold text-brand-gold' : 'text-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="ml-auto text-xs text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-3">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm mb-6">No reviews yet. Be the first to review!</p>
              )}

              {/* Write Review */}
              {isAuthenticated && (
                <form onSubmit={handleReview} className="border-t border-border pt-4">
                  <h3 className="font-medium text-sm text-brand-dark mb-3">Write a Review</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm text-muted-foreground">Rating:</span>
                    {[...Array(5)].map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setReviewForm({ ...reviewForm, rating: i + 1 })}
                      >
                        <Star className={`w-5 h-5 ${
                          i < reviewForm.rating ? 'fill-brand-gold text-brand-gold' : 'text-gray-200'
                        }`} />
                      </button>
                    ))}
                  </div>
                  <Textarea
                    placeholder="Share your experience..."
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    rows={3}
                    className="mb-3"
                    required
                  />
                  <Button
                    type="submit"
                    disabled={submittingReview}
                    size="sm"
                    className="bg-brand-orange hover:bg-brand-orange/90 text-white"
                  >
                    <Send className="w-3 h-3 mr-1" />
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </Button>
                </form>
              )}
            </motion.div>

            {/* FAQs Section */}
            <motion.div
              id="faqs"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <h2 className="font-serif text-xl text-brand-dark mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-brand-orange rounded-full" />
                FAQs
              </h2>

              <div className="space-y-2">
                {parsedData.faqs.map((faq: FAQ, i: number) => (
                  <div key={i} className="border border-border/50 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-brand-cream/30 transition-colors"
                    >
                      <span className="font-medium text-sm text-brand-dark pr-4">{faq.question}</span>
                      <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform ${
                        openFaq === i ? 'rotate-180' : ''
                      }`} />
                    </button>
                    <AnimatePresence>
                      {openFaq === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Desktop Booking Panel - right column */}
          <div className="hidden lg:block lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm sticky top-4 overflow-hidden"
            >
              <div className="bg-gradient-to-r from-brand-dark to-brand-navy p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-bold text-lg">{pkg.name}</h3>
                    <p className="text-white/60 text-sm">{pkg.subtitle}</p>
                  </div>
                  <div className="text-right">
                    {pkg.originalPrice && pkg.originalPrice > pkg.price ? (
                      <>
                        <div className="text-white/50 text-sm line-through">₹{pkg.originalPrice}</div>
                        <div className="text-white font-bold text-2xl">₹{pkg.price}</div>
                        <div className="text-emerald-400 text-xs font-semibold">Save ₹{pkg.originalPrice - pkg.price}</div>
                      </>
                    ) : (
                      <div className="text-white font-bold text-2xl">₹{pkg.price}</div>
                    )}
                    <div className="text-white/60 text-xs">per person</div>
                  </div>
                </div>
              </div>
              <div className="p-5 space-y-3 border-b border-border/50">
                <div className="flex items-center gap-3 text-sm">
                  <Route className="w-4 h-4 text-blue-500" />
                  <span className="text-muted-foreground">{pkg.distance}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Timer className="w-4 h-4 text-amber-500" />
                  <span className="text-muted-foreground">{pkg.duration}</span>
                </div>
                {pkg.routeLength ? (
                  <>
                    <div className="flex items-center gap-3 text-sm">
                      <Map className="w-4 h-4 text-purple-500" />
                      <span className="text-muted-foreground">{pkg.routeLength}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <MapPin className="w-4 h-4 text-brand-teal" />
                      <span className="text-muted-foreground">{pkg.baseCamp || '—'}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3 text-sm">
                      <Waves className="w-4 h-4 text-red-500" />
                      <span className="text-muted-foreground">{pkg.rapidsLevel}{pkg.rapidsDescription ? ` — ${pkg.rapidsDescription}` : ''}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Clock className="w-4 h-4 text-green-500" />
                      <span className="text-muted-foreground">{pkg.timings}</span>
                    </div>
                  </>
                )}
              </div>
              <div className="p-5">
                <Button onClick={handleBookNow} className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white h-12 text-base font-semibold rounded-xl">
                  Book This Activity
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              <div className="p-5 bg-brand-cream/50 space-y-3">
                <h4 className="font-semibold text-sm text-brand-dark">Why Divine Travel?</h4>
                {[
                  { text: '500+ happy adventurers', icon: '🎉' },
                  { text: 'Pay 10% to reserve — balance at location', icon: '💳' },
                  { text: 'Lowest prices with last-minute availability', icon: '🏷️' },
                  { text: 'Instant booking confirmation', icon: '⚡' },
                  { text: '24/7 expert support', icon: '📞' },
                  { text: 'No hidden charges. Ever.', icon: '✅' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <span className="text-base">{item.icon}</span>
                    {item.text}
                  </div>
                ))}
              </div>
              <div className="p-5 border-t border-border/50">
                <p className="text-xs text-muted-foreground mb-2">Still have questions?</p>
                <Button variant="outline" className="w-full border-brand-teal text-brand-teal hover:bg-brand-teal/5 rounded-xl h-10"
                  onClick={() => {
                    if (!isAuthenticated) { toast.error('Please login to contact us') }
                    else { toast.info('Our team will contact you shortly!') }
                  }}>
                  <Phone className="w-4 h-4 mr-2" />
                  Connect with Team
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
