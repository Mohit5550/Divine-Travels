'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronRight, Mail, Phone, MapPin, Calendar, Users, Mountain, FileText } from 'lucide-react'
import { PhoneInput } from '@/components/ui/PhoneInput'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Navbar } from '@/components/landing/Navbar'
import { ActivityBar } from '@/components/landing/ActivityBar'
import { BackButton } from '@/components/ui/BackButton'
import { SmartImage } from '@/components/ui/SmartImage'
import { Footer } from '@/components/landing/Footer'
import { LoginModal } from '@/components/landing/LoginModal'
import { useAppStore } from '@/lib/store'
import { getAuthHeaders } from '@/lib/auth-client'

interface Program {
  id: number
  title: string
  img: string
  itinerary: string[]
}

interface DayBasedTourProps {
  heroImage: string
  heroTitle: string
  heroSubtitle: string
  heroTag: string
  sectionTitle: string
  sectionSubtitle?: string
  programs: Record<number, Program>
  programList: { id: number; title: string; img: string }[]
  dayConfigs: { label: string; title: string; maxSelect: number }[]
  destinationName: string
}

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
}

export function DayBasedTour({
  heroImage,
  heroTitle,
  heroSubtitle,
  heroTag,
  sectionTitle,
  sectionSubtitle,
  programs,
  programList,
  destinationName,
}: DayBasedTourProps) {
  const { user, navigate, isAuthenticated } = useAppStore()
  const [selected, setSelected] = useState<number[]>([])
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [phone, setPhone] = useState('')
  const days = selected.length
  const [today, setToday] = useState('')

  useEffect(() => {
    setToday(new Date().toISOString().split('T')[0])
  }, [])

  const toggle = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user?.id) {
      toast.error('Please log in to send an enquiry')
      setLoginOpen(true)
      return
    }
    if (selected.length === 0) {
      toast.error('Please select at least one program')
      return
    }
    const form = e.currentTarget
    const fd = new FormData(form)
    const name = (fd.get('Name') as string)?.trim()
    const phoneRaw = phone.replace(/[^0-9]/g, '').slice(-10) || ''
    const travelDate = fd.get('Date') as string
    const travelers = parseInt(fd.get('Travelers') as string) || 1
    const note = (fd.get('Note') as string)?.trim() || ''

    if (!name || !phoneRaw || phoneRaw.length !== 10 || !travelDate) {
      toast.error('Please fill name, a valid 10-digit phone and travel date')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        destination: destinationName,
        packageType: `${destinationName} ${days}-Day Custom Tour`,
        selectedPrograms: selected.map((id) => programs[id]?.title).filter(Boolean),
        itinerary: selected.map((id, idx) => ({ day: idx + 1, programId: id, title: programs[id]?.title })),
        days,
        note,
        name,
        phone: phoneRaw,
        travelDate,
        travelers,
      }

      const res = await fetch('/api/tour-bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user?.id ? { ...getAuthHeaders() } : {}),
        },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        toast.success('Inquiry sent! Redirecting to your dashboard…')
        navigate('user-dashboard')
      } else {
        const d = await res.json().catch(() => ({}))
        toast.error(d.error || 'Submission failed')
      }
    } catch {
      toast.error('Connection error. Please try again.')
    } finally {
      setSubmitting(false)
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
          <SmartImage src={heroImage} alt={heroTitle} className="w-full h-full object-cover" priority sizes="100vw" />
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
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">{sectionSubtitle}</p>
        </motion.div>

        <motion.div {...fadeInUp} className="mb-12 bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg border border-border/50">
          <div className="bg-gradient-to-r from-brand-orange/10 to-brand-gold/10 px-6 py-4 border-b border-border/50">
            <h3 className="font-bold text-lg sm:text-xl text-brand-dark">Plan Your Tour</h3>
            <p className="text-xs text-muted-foreground mt-1">Each selected program counts as one day of your tour.</p>
          </div>

          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {programList.map((prog) => {
                const isSelected = selected.includes(prog.id)
                return (
                  <motion.div
                    key={prog.id}
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => toggle(prog.id)}
                    className={`relative bg-white rounded-xl overflow-hidden cursor-pointer transition-all duration-300 border-2 ${
                      isSelected
                        ? 'border-brand-orange shadow-lg shadow-brand-orange/20'
                        : 'border-gray-100 hover:border-brand-orange/30 shadow-sm hover:shadow-md'
                    }`}
                  >
                    <div className="relative h-24 sm:h-28 overflow-hidden">
                      <img loading="lazy" decoding="async"
                        src={prog.img}
                        alt={prog.title}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-brand-orange rounded-full flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="p-2.5 sm:p-3">
                      <h4 className="text-xs sm:text-sm font-semibold text-brand-dark leading-tight text-center">
                        {prog.title}
                      </h4>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            <div className="mt-4 px-3 py-2.5 bg-brand-cream rounded-xl border border-dashed border-brand-orange/30 text-center">
              <p className="text-sm text-muted-foreground">
                {selected.length === 0
                  ? 'Select any programs to build your tour'
                  : `Selected ${selected.length} program${selected.length > 1 ? 's' : ''} for a ${days}-day tour`}
              </p>
            </div>

            <AnimatePresence>
              {showForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-border/50 overflow-hidden"
                >
                  <div className="p-4 sm:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 mb-4">
                      {selected.map((id, idx) => {
                        const prog = programs[id]
                        if (!prog) return null
                        return (
                          <div key={id} className="bg-brand-cream rounded-lg p-3 border-l-4 border-brand-orange">
                            <h4 className="font-semibold text-brand-dark text-sm mb-1.5">
                              Day {idx + 1}: {prog.title}
                            </h4>
                            {prog.itinerary.length > 0 && (
                              <ul className="space-y-1">
                                {prog.itinerary.map((item, i) => (
                                  <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                                    <span className="text-brand-orange mt-0.5 shrink-0">&#9670;</span>
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )
                      })}
                    </div>

                    <div className="bg-white rounded-xl border border-border/50 p-4 sm:p-5">
                      <h4 className="font-bold text-brand-dark text-base sm:text-lg mb-3 border-b-2 border-brand-orange inline-block">
                        Send Booking Inquiry
                      </h4>
                      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-4 text-sm text-brand-dark">
                        Selected ({days} day tour): <strong>{selected.map((id) => programs[id]?.title).filter(Boolean).join(' + ')}</strong>
                      </div>

                      {done ? (
                        <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-4 text-center text-sm">
                          Inquiry sent! {user?.id ? 'Redirecting to your dashboard…' : 'We will contact you soon.'}
                        </div>
                      ) : (
                        <form onSubmit={handleSubmit}>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Name</label>
                              <input
                                type="text"
                                name="Name"
                                required
                                defaultValue={user?.name || ''}
                                className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Phone</label>
                              <PhoneInput
                                value={phone}
                                onChange={setPhone}
                                placeholder="Enter phone number"
                                required
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
                            <div className="sm:col-span-2">
                              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                                <FileText className="w-3.5 h-3.5 inline mr-1" /> Add a note (optional)
                              </label>
                              <textarea
                                name="Note"
                                rows={3}
                                placeholder="Any special requests, preferences, or questions…"
                                className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange bg-white"
                              />
                            </div>
                          </div>
                          <button
                            type="submit"
                            disabled={submitting}
                            className="w-full py-3.5 bg-brand-orange text-white font-bold rounded-xl hover:bg-brand-orange/90 transition-all duration-300 uppercase tracking-wider text-sm shadow-lg shadow-brand-orange/20 disabled:opacity-60"
                          >
                            {submitting ? 'Sending…' : 'Send Inquiry'}
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!showForm && !done && (
              <div className="mt-4">
                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      setLoginOpen(true)
                      return
                    }
                    setShowForm(true)
                  }}
                  disabled={selected.length === 0}
                  className="w-full py-3.5 bg-brand-teal text-white font-bold rounded-xl hover:bg-brand-teal/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAuthenticated
                    ? `Continue with ${selected.length} program${selected.length !== 1 ? 's' : ''}`
                    : 'Login to Continue'}
                </button>
              </div>
            )}
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
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  )
}
