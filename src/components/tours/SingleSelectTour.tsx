'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Mountain, Star, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Navbar } from '@/components/landing/Navbar'
import { ActivityBar } from '@/components/landing/ActivityBar'
import { BackButton } from '@/components/ui/BackButton'
import { Footer } from '@/components/landing/Footer'

interface TourHighlight {
  icon: string
  label: string
}

interface TourDataItem {
  title: string
  description: string
  highlights: TourHighlight[]
  img: string
  itinerary: string[]
  price: string
  actualPrice: number
  discountedPrice: number
}

interface FAQ {
  q: string
  a: string
}

interface SingleSelectTourProps {
  heroImage: string
  heroTitle: string
  heroSubtitle: string
  heroTag: string
  sectionTitle: string
  destinationName?: string
  packageTypeLabel?: string
  tourData: TourDataItem[]
  inclusions: string[]
  exclusions: string[]
  faqs: FAQ[]
  bookingTitle: string
}

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
}

export function SingleSelectTour({
  heroImage,
  heroTitle,
  heroSubtitle,
  heroTag,
  sectionTitle,
  destinationName = heroTitle,
  packageTypeLabel = heroTag,
  tourData = [],
  inclusions = [],
  exclusions = [],
  faqs = [],
  bookingTitle = heroTitle,
}: SingleSelectTourProps) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)
  const [showPanel, setShowPanel] = useState(false)
  const [showFaqs, setShowFaqs] = useState(false)

  const today = new Date().toISOString().split('T')[0]

  const handleSelect = (idx: number) => {
    setSelectedIdx(idx)
    setShowPanel(true)
    setShowFaqs(false)
  }

  const selectedTour = selectedIdx != null ? tourData[selectedIdx] : null

  const handleBooking = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const btn = form.querySelector('button[type="submit"]') as HTMLButtonElement

    btn.disabled = true
    btn.textContent = 'Sending...'

    try {
      const payload = {
        destination: destinationName,
        packageType: formData.get('Package_Type') || packageTypeLabel,
        selectedPrograms: [formData.get('Selected_Tour') || ''],
        name: formData.get('Name'),
        phone: (formData.get('Phone') as string)?.replace(/[^0-9]/g, '').slice(-10) || '',
        travelDate: formData.get('Date'),
        travelers: parseInt(formData.get('Travelers') as string) || 1,
      }

      if (!payload.name || !payload.phone || payload.phone.length !== 10) {
        toast.error('Please fill all fields correctly. Phone must be 10 digits.')
        btn.disabled = false
        btn.textContent = 'Confirm Booking'
        return
      }

      const res = await fetch('/api/tour-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        form.style.display = 'none'
        const msg = form.parentElement?.querySelector('.success-msg') as HTMLElement
        if (msg) msg.style.display = 'block'
        toast.success('Booking request sent! Admin will review shortly.')
      } else {
        toast.error('Submission failed. Please try again.')
        btn.disabled = false
        btn.textContent = 'Send Booking Request'
      }
    } catch {
      toast.error('Connection error. Please try again.')
      btn.disabled = false
      btn.textContent = 'Send Booking Request'
    }
  }

  return (
    <div className="min-h-screen bg-brand-cream">
      <Navbar />
      <ActivityBar />
      <div className="max-w-7xl mx-auto px-4 pt-3">
        <BackButton />
      </div>

      {/* Hero */}
      <section className="relative h-[50vh] sm:h-[60vh] overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt={heroTitle} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/80 via-brand-dark/50 to-brand-cream" />
        </div>
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 sm:px-6 pt-20">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 bg-brand-orange/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
              <Mountain className="w-4 h-4 text-brand-orange" />
              <span className="text-brand-orange text-sm font-semibold">{heroTag}</span>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-white leading-tight mb-3">
              {heroTitle}
            </h1>
            <p className="text-white/70 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
              {heroSubtitle}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <motion.div {...fadeInUp} className="text-center mb-10 sm:mb-14">
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-brand-dark mt-2">
            {sectionTitle}
          </h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            Select a tour package to view the detailed itinerary and pricing
          </p>
        </motion.div>

        {/* Tour Grid */}
        {tourData.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No tour packages available.</div>
        ) : (
          <motion.div {...fadeInUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tourData.map((tour, idx) => {
              const isSelected = selectedIdx === idx
              return (
                <motion.div
                  key={idx}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleSelect(idx)}
                  className={`relative bg-white rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 border-2 ${
                    isSelected
                      ? 'border-brand-orange shadow-xl shadow-brand-orange/20'
                      : 'border-gray-100 hover:border-brand-orange/30 shadow-md hover:shadow-lg'
                  }`}
                >
                  <div className="relative h-40 sm:h-48 overflow-hidden">
                    <img
                      src={tour.img}
                      alt={tour.title}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-7 h-7 bg-brand-orange rounded-full flex items-center justify-center shadow-lg">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className="absolute bottom-3 left-3 right-3">
                      <div className="flex flex-wrap gap-1.5">
                        {tour.highlights?.slice(0, 3).map((h, i) => (
                          <span key={i} className="bg-white/90 text-brand-dark text-[10px] font-semibold px-2 py-0.5 rounded-full">
                            {h.icon} {h.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm sm:text-base font-bold text-brand-dark leading-tight mb-1">
                      {tour.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                      {tour.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        {tour.discountedPrice < tour.actualPrice ? (
                          <>
                            <span className="text-lg font-bold text-brand-orange">₹{tour.discountedPrice.toLocaleString()}</span>
                            <span className="text-xs text-red-500 font-medium line-through ml-2">₹{tour.actualPrice.toLocaleString()}</span>
                            <span className="text-emerald-500 text-[10px] font-semibold ml-1">Save ₹{(tour.actualPrice - tour.discountedPrice).toLocaleString()}</span>
                          </>
                        ) : (
                          <span className="text-lg font-bold text-brand-orange">{tour.price}</span>
                        )}
                      </div>
                      <span className="text-brand-orange text-xs font-medium flex items-center gap-1">
                        View <Star className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}

        {/* Detail Panel */}
        <AnimatePresence>
          {showPanel && selectedTour && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-10 bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border border-border/50"
            >
              <div className="bg-gradient-to-r from-brand-orange/10 to-brand-gold/10 px-6 py-4 border-b border-border/50 flex items-center justify-between">
                <h3 className="font-bold text-lg sm:text-xl text-brand-dark">
                  {selectedTour.title}
                </h3>
                <button
                  onClick={() => setShowPanel(false)}
                  className="w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center shadow-sm"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 sm:p-6 space-y-6">
                {/* Highlights */}
                {selectedTour.highlights && selectedTour.highlights.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedTour.highlights.map((h, i) => (
                      <span key={i} className="bg-brand-cream text-brand-dark text-xs font-medium px-3 py-1.5 rounded-full border border-border/50">
                        {h.icon} {h.label}
                      </span>
                    ))}
                  </div>
                )}

                {/* Pricing */}
                <div className="bg-brand-cream rounded-xl p-4 border-l-4 border-brand-orange">
                  <div className="flex items-baseline gap-3">
                    <span className="text-2xl font-bold text-brand-orange">{selectedTour.price}</span>
                    {selectedTour.discountedPrice < selectedTour.actualPrice && (
                      <>
                        <span className="text-sm text-red-500 font-medium line-through">₹{selectedTour.actualPrice.toLocaleString()}</span>
                        <span className="text-emerald-500 text-sm font-semibold">₹{selectedTour.discountedPrice.toLocaleString()} (Special Offer)</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Description */}
                {selectedTour.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed">{selectedTour.description}</p>
                )}

                {/* Itinerary */}
                {selectedTour.itinerary && selectedTour.itinerary.length > 0 && (
                  <div className="bg-brand-cream rounded-xl p-4 border-l-4 border-brand-orange">
                    <h4 className="font-bold text-brand-dark text-sm sm:text-base mb-3">Itinerary</h4>
                    <ul className="space-y-2">
                      {selectedTour.itinerary.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground">
                          <span className="text-brand-orange mt-0.5 shrink-0 font-bold text-sm">{i + 1}.</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Inclusions / Exclusions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {inclusions.length > 0 && (
                    <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                      <h4 className="font-bold text-green-700 text-sm sm:text-base mb-2">✓ Inclusions</h4>
                      <ul className="space-y-1">
                        {inclusions.map((item, i) => (
                          <li key={i} className="text-xs sm:text-sm text-green-800 flex items-start gap-1.5">
                            <span className="text-green-500 mt-0.5">✓</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {exclusions.length > 0 && (
                    <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                      <h4 className="font-bold text-red-700 text-sm sm:text-base mb-2">✗ Exclusions</h4>
                      <ul className="space-y-1">
                        {exclusions.map((item, i) => (
                          <li key={i} className="text-xs sm:text-sm text-red-800 flex items-start gap-1.5">
                            <span className="text-red-500 mt-0.5">✗</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* FAQs */}
                {faqs.length > 0 && (
                  <div>
                    <button
                      onClick={() => setShowFaqs(!showFaqs)}
                      className="flex items-center gap-2 text-brand-dark font-semibold text-sm mb-2"
                    >
                      <span className="text-brand-orange">?</span> Frequently Asked Questions
                      <span className={`transition-transform ${showFaqs ? 'rotate-180' : ''}`}>▼</span>
                    </button>
                    <AnimatePresence>
                      {showFaqs && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden space-y-2"
                        >
                          {faqs.map((faq, i) => (
                            <div key={i} className="bg-gray-50 rounded-lg p-3">
                              <p className="text-sm font-semibold text-brand-dark">Q: {faq.q}</p>
                              <p className="text-xs text-muted-foreground mt-1">A: {faq.a}</p>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Booking Form */}
                <div className="bg-white rounded-xl border border-border/50 p-4 sm:p-5">
                  <h4 className="font-bold text-brand-dark text-base sm:text-lg mb-3 border-b-2 border-brand-orange inline-block">
                    Book {bookingTitle}
                  </h4>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-4 text-sm text-brand-dark">
                    Selected Package: <strong>{selectedTour.title}</strong>
                  </div>

                  <form onSubmit={handleBooking}>
                    <input type="hidden" name="_cc" value="divinetravels.in.info@gmail.com" />
                    <input type="hidden" name="Destination" value={destinationName} />
                    <input type="hidden" name="Package_Type" value={packageTypeLabel} />
                    <input type="hidden" name="Selected_Tour" value={selectedTour.title} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Name</label>
                        <input
                          type="text"
                          name="Name"
                          required
                          className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Phone (10 digits)</label>
                        <input
                          type="tel"
                          name="Phone"
                          required
                          maxLength={10}
                          pattern="[0-9]{10}"
                          placeholder="9876543210"
                          title="Please enter a valid 10-digit phone number"
                          className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Travel Date</label>
                        <input
                          type="date"
                          name="Date"
                          required
                          min={today}
                          className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Travelers</label>
                        <input
                          type="number"
                          name="Travelers"
                          min={1}
                          defaultValue={1}
                          className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange bg-white"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-3.5 bg-brand-orange text-white font-bold rounded-xl hover:bg-brand-orange/90 transition-all duration-300 uppercase tracking-wider text-sm shadow-lg shadow-brand-orange/20"
                    >
                      Send Booking Request
                    </button>
                  </form>
                  <div className="success-msg hidden bg-green-50 border border-green-200 text-green-700 rounded-xl p-4 mt-3 text-center text-sm">
                    Thank you! Your request has been sent to Divine Travels. We will contact you soon.
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
            <h3 className="font-serif text-2xl sm:text-3xl text-white mb-3">
              Need help planning your {destinationName} tour?
            </h3>
            <p className="text-white/60 max-w-lg mx-auto mb-6">
              Contact our travel experts for personalized recommendations.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a href="https://wa.me/916396919007" target="_blank" rel="noopener noreferrer">
                <Button className="bg-green-600 hover:bg-green-700 text-white rounded-full px-8 h-12">
                  WhatsApp Us
                </Button>
              </a>
              <a href="tel:+916396919007">
                <Button variant="outline" className="border-white/40 bg-white text-brand-dark hover:bg-white/90 rounded-full px-8 h-12">
                  Call Now
                </Button>
              </a>
            </div>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  )
}
