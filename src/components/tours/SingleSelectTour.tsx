'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Mountain } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Navbar } from '@/components/landing/Navbar'
import { ActivityBar } from '@/components/landing/ActivityBar'
import { Footer } from '@/components/landing/Footer'

interface TourItem {
  id: number
  title: string
  img: string
  itinerary: string[]
}

interface SingleSelectTourProps {
  heroImage: string
  heroTitle: string
  heroSubtitle: string
  heroTag: string
  sectionTitle: string
  destinationName: string
  packageTypeLabel: string
  tours: TourItem[]
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
  destinationName,
  packageTypeLabel,
  tours,
}: SingleSelectTourProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [showPanel, setShowPanel] = useState(false)

  const today = new Date().toISOString().split('T')[0]

  const handleSelect = (id: number) => {
    setSelectedId(id)
    setShowPanel(true)
  }

  const selectedTour = selectedId ? tours.find((t) => t.id === selectedId) : null

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
        phone: formData.get('Phone'),
        travelDate: formData.get('Date'),
        travelers: parseInt(formData.get('Travelers') as string) || 1,
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
          <span className="text-brand-orange text-sm font-semibold tracking-wider uppercase">
            {destinationName}
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-brand-dark mt-2">
            {sectionTitle}
          </h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            Select a tour package to view the detailed itinerary and booking form
          </p>
        </motion.div>

        {/* Tour Grid */}
        <motion.div {...fadeInUp} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {tours.map((tour) => {
            const isSelected = selectedId === tour.id
            return (
              <motion.div
                key={tour.id}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleSelect(tour.id)}
                className={`relative bg-white rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 border-2 ${
                  isSelected
                    ? 'border-brand-orange shadow-xl shadow-brand-orange/20'
                    : 'border-gray-100 hover:border-brand-orange/30 shadow-md hover:shadow-lg'
                }`}
              >
                <div className="relative h-32 sm:h-40 overflow-hidden">
                  <img
                    src={tour.img}
                    alt={tour.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-7 h-7 bg-brand-orange rounded-full flex items-center justify-center shadow-lg">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                <div className="p-3 sm:p-4">
                  <h3 className="text-xs sm:text-sm font-bold text-brand-dark text-center leading-tight">
                    {tour.title}
                  </h3>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Itinerary Panel */}
        <AnimatePresence>
          {showPanel && selectedTour && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-8 bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border border-border/50"
            >
              <div className="bg-gradient-to-r from-brand-orange/10 to-brand-gold/10 px-6 py-4 border-b border-border/50">
                <h3 className="font-bold text-lg sm:text-xl text-brand-dark">
                  {selectedTour.title}
                </h3>
              </div>

              <div className="p-4 sm:p-6 space-y-4">
                <div className="bg-brand-cream rounded-xl p-4 border-l-4 border-brand-orange">
                  <h4 className="font-bold text-brand-dark text-sm sm:text-base mb-2">Itinerary</h4>
                  <ul className="space-y-1.5">
                    {selectedTour.itinerary.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground">
                        <span className="text-brand-orange mt-0.5 shrink-0">&#9670;</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white rounded-xl border border-border/50 p-4 sm:p-5">
                  <h4 className="font-bold text-brand-dark text-base sm:text-lg mb-3 border-b-2 border-brand-orange inline-block">
                    Booking Inquiry
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
                        <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Phone</label>
                        <input
                          type="tel"
                          name="Phone"
                          required
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
