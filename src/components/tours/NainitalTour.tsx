'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Mountain } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Navbar } from '@/components/landing/Navbar'
import { ActivityBar } from '@/components/landing/ActivityBar'
import { Footer } from '@/components/landing/Footer'

const standardPrograms = [
  { id: 1, title: 'The Classic Nainital City Tour', img: 'https://i0.wp.com/oneday.tours/wp-content/uploads/one-day-nainital-local-sightseeing-tour-package-thandi-sadak-3.jpg?resize=750%2C400&ssl=1', itinerary: ['Naini Lake', 'Naina Devi Temple', 'Snow View Point', 'Eco Cave Gardens', 'Tiffin Top', 'Tibetan Market', 'Chitai Golu Devta Temple', 'Tiffin Top (Dorothy\'s Seat)'] },
  { id: 2, title: 'Lake District & Spiritual Trail', img: 'https://nainitaltaxi.in/wp-content/uploads/2015/10/sariya-tal-Nainital.jpg', itinerary: ['Kainchi Dham', 'Bhimtal Lake', 'Naukuchiatal', 'Sattal (Seven Lakes)', 'Hanuman Garhi', 'Nainital Mall Road'] },
  { id: 3, title: 'Kainchi Dham & Almora', img: 'https://www.epicyatra.com/wp-content/uploads/2025/01/1680354261299-1024x683.webp', itinerary: ['Kainchi Dham', 'Almora', 'Kasar Devi Temple', 'Katarmal Sun Temple'] },
  { id: 4, title: 'Nainital City Sights', img: 'https://www.bontravelindia.com/wp-content/uploads/2022/08/Best-Places-to-Visit-in-Nainital.jpg', itinerary: ['Naini Lake', 'Naina Devi Temple', 'Hanuman Garhi temple', 'Snow View Point'] },
  { id: 5, title: 'Ashram & Lake District', img: 'https://media-cdn.tripadvisor.com/media/photo-m/1280/14/3f/82/5d/bhimtal-island-aquarium.jpg', itinerary: ['Kainchi Dham (Neem Karoli Baba Ashram)', 'Chitai Golu Devta Temple', 'Bhimtal (Island Aquarium)', 'Forest lakes of Sattal'] },
  { id: 6, title: 'Wildlife Adventure & Spiritual', img: 'https://content.jdmagicbox.com/comp/corbett/a3/9999p5942.5942.191214120957.u3a3/catalogue/jim-corbett-national-park-ramnagar-corbett-wildlife-sanctuary-1loxvqyg6i.jpg', itinerary: ['Jungle Safari', 'Garjiya Devi Temple', 'Shri Hanuman Dham', 'Corbett Fall'] },
  { id: 7, title: 'Ranikhet Military & Orchards', img: 'https://hblimg.mmtcdn.com/content/hubble/img/ranikhet/mmt/activities/m_activities_ranikhet_kumaon_regimental_centre_l_405_640.jpg', itinerary: ['Kumaon Regimental Centre', 'Upat Golf Course', 'Haidakhan Babaji Temple'] },
  { id: 8, title: 'Jageshwar, Bageshwar & Almora', img: 'https://www.chirpinghillsresort.com/wp-content/uploads/2025/05/jageshwar-dham-structures-500x445.jpg', itinerary: ['Almora', 'Jageshwar Dham', 'Kasar Devi Temple', 'Bageshwar Dham'] },
  { id: 9, title: 'Almora & Kausani', img: 'https://www.tourmyindia.com/socialimg/best-of-kaumoan-hills.jpg', itinerary: ['Almora', 'Kasar Devi', 'Sun Temple', 'Someshwar Temple', 'Kausani', 'Baijnath'] },
]

const masterPrograms = [
  { id: 10, title: 'Master Program 01', img: 'https://www.bontravelindia.com/wp-content/uploads/2022/08/Best-Places-to-Visit-in-Nainital.jpg', itinerary: ['Rishikesh', 'Devprayag', 'Rudrprayag', 'Karnprayag', 'Baijnath', 'Ksusani', 'Someshwar', 'Sun Temple', 'Almora', 'Kasar Devi', 'Jageshwar', 'Kainchi Dham', 'Nainital', 'Jim Corbett', 'Haridwar/ Rishikesh'] },
  { id: 11, title: 'Master Program 02', img: 'https://www.chirpinghillsresort.com/wp-content/uploads/2025/05/jageshwar-dham-structures-500x445.jpg', itinerary: ['Rishikesh', 'Devprayag', 'Rudrprayag', 'Karnprayag', 'Baijnath', 'Bageshwar', 'Almora', 'Kasar Devi', 'Jageshwar', 'Kainchi Dham', 'Nainital', 'Jim Corbett', 'Haridwar/ Rishikesh'] },
  { id: 12, title: 'Master Program 03', img: 'https://hblimg.mmtcdn.com/content/hubble/img/ranikhet/mmt/activities/m_activities_ranikhet_kumaon_regimental_centre_l_405_640.jpg', itinerary: ['Rishikesh', 'Devprayag', 'Rudrprayag', 'Karnprayag', 'Baijnath', 'Ksusani', 'Someshwar', 'RaniKhet (Haidakhan Babaji)', 'Kainchi Dham', 'Nainital', 'Jim Corbett', 'Haridwar/ Rishikesh'] },
]

interface NainitalProgram { id: number; title: string; img: string; itinerary: string[] }

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
}

function DaySection({
  label,
  title,
  maxSelect,
  programs,
  selectedIds,
  onToggle,
}: {
  label: string
  title: string
  maxSelect: number
  programs: NainitalProgram[]
  selectedIds: number[]
  onToggle: (id: number) => void
}) {
  const [showPanel, setShowPanel] = useState(false)

  const handleToggle = (id: number) => {
    onToggle(id)
    const willBeSelected = !selectedIds.includes(id)
    const newCount = willBeSelected ? selectedIds.length + 1 : selectedIds.length - 1
    if (willBeSelected && selectedIds.length + 1 === maxSelect) {
      setTimeout(() => setShowPanel(true), 50)
    } else if (!willBeSelected && newCount < maxSelect) {
      setShowPanel(false)
    }
  }

  const selectedPrograms = programs.filter((p) => selectedIds.includes(p.id))
  const isComplete = selectedIds.length === maxSelect

  return (
    <motion.div {...fadeInUp} className="mb-12 bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg border border-border/50">
      <div className="bg-gradient-to-r from-brand-orange/10 to-brand-gold/10 px-6 py-4 border-b border-border/50">
        <h3 className="font-bold text-lg sm:text-xl text-brand-dark">{title}</h3>
      </div>
      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {programs.map((prog) => {
            const isSelected = selectedIds.includes(prog.id)
            return (
              <motion.div
                key={prog.id}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleToggle(prog.id)}
                className={`relative bg-white rounded-xl overflow-hidden cursor-pointer transition-all duration-300 border-2 ${
                  isSelected ? 'border-brand-orange shadow-lg shadow-brand-orange/20' : 'border-gray-100 hover:border-brand-orange/30 shadow-sm hover:shadow-md'
                }`}
              >
                <div className="relative h-24 sm:h-28 overflow-hidden">
                  <img src={prog.img} alt={prog.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-brand-orange rounded-full flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                </div>
                <div className="p-2.5 sm:p-3">
                  <h4 className="text-xs sm:text-sm font-semibold text-brand-dark leading-tight text-center">{prog.title}</h4>
                </div>
              </motion.div>
            )
          })}
        </div>
        <div className="mt-4 px-3 py-2.5 bg-brand-cream rounded-xl border border-dashed border-brand-orange/30 text-center">
          <p className="text-sm text-muted-foreground">
            {selectedIds.length === 0
              ? `Select ${maxSelect} program${maxSelect > 1 ? 's' : ''}`
              : selectedIds.length < maxSelect
              ? `Selected ${selectedIds.length}/${maxSelect}`
              : `Selected: ${selectedPrograms.map((p) => p.title).join(' + ')}`}
          </p>
        </div>
      </div>

      <AnimatePresence>
        {showPanel && isComplete && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="border-t border-border/50">
            <div className="p-4 sm:p-6 space-y-4">
              {selectedPrograms.map((prog, idx) => (
                <div key={prog.id} className="bg-brand-cream rounded-xl p-4 border-l-4 border-brand-orange">
                  <h4 className="font-bold text-brand-dark text-sm sm:text-base mb-2">{String.fromCharCode(65 + idx)}: {prog.title}</h4>
                  <ul className="space-y-1.5">
                    {prog.itinerary.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground">
                        <span className="text-brand-orange mt-0.5 shrink-0">&#9670;</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <BookingForm label={label} destination="Nainital" selectedText={selectedPrograms.map((p) => p.title).join(' + ')} packageType={`Nainital ${label}`} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function MasterSection({
  programs,
  selectedId,
  onSelect,
}: {
  programs: NainitalProgram[]
  selectedId: number | null
  onSelect: (id: number) => void
}) {
  const selectedProgram = selectedId ? programs.find((p) => p.id === selectedId) : null

  return (
    <motion.div {...fadeInUp} className="mb-12 bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg border border-border/50 ring-2 ring-brand-gold/30">
      <div className="bg-gradient-to-r from-brand-gold/20 to-amber-100 px-6 py-4 border-b border-border/50">
        <h3 className="font-bold text-lg sm:text-xl text-brand-dark">Master Programs (Select 1 Only)</h3>
      </div>
      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4">
          {programs.map((prog) => {
            const isSelected = selectedId === prog.id
            return (
              <motion.div
                key={prog.id}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onSelect(prog.id)}
                className={`relative bg-white rounded-xl overflow-hidden cursor-pointer transition-all duration-300 border-2 ${
                  isSelected ? 'border-brand-gold shadow-lg shadow-brand-gold/20' : 'border-gray-100 hover:border-brand-gold/30 shadow-sm hover:shadow-md'
                }`}
              >
                <div className="relative h-24 sm:h-28 overflow-hidden">
                  <img src={prog.img} alt={prog.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-brand-gold rounded-full flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                </div>
                <div className="p-2.5 sm:p-3">
                  <h4 className="text-xs sm:text-sm font-semibold text-brand-dark leading-tight text-center">{prog.title}</h4>
                </div>
              </motion.div>
            )
          })}
        </div>

        <AnimatePresence>
          {selectedProgram && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-6 border-t border-border/50 pt-6">
              <div className="bg-brand-cream rounded-xl p-4 border-l-4 border-brand-gold">
                <h4 className="font-bold text-brand-dark text-sm sm:text-base mb-2">Master Itinerary: {selectedProgram.title}</h4>
                <ul className="space-y-1.5">
                  {selectedProgram.itinerary.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground">
                      <span className="text-brand-gold mt-0.5 shrink-0">&#9670;</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-4">
                <BookingForm label="Master" destination="Nainital" selectedText={selectedProgram.title} packageType="Nainital Master Program" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

function BookingForm({ label, destination, selectedText, packageType }: { label: string; destination: string; selectedText: string; packageType: string }) {
  const today = new Date().toISOString().split('T')[0]

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const btn = form.querySelector('button[type="submit"]') as HTMLButtonElement
    btn.disabled = true
    btn.textContent = 'Sending...'

    try {
      const payload = {
        destination,
        dayLabel: label,
        packageType: formData.get('Package_Type') || packageType,
        selectedPrograms: [formData.get('Selected_Programs') || ''],
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
        toast.success(`${label} booking request sent! Admin will review shortly.`)
      } else {
        toast.error('Submission failed. Please try again.')
        btn.disabled = false
        btn.textContent = `Confirm ${label} Booking`
      }
    } catch {
      toast.error('Connection error. Please try again.')
      btn.disabled = false
      btn.textContent = `Confirm ${label} Booking`
    }
  }

  return (
    <div className="bg-white rounded-xl border border-border/50 p-4 sm:p-5">
      <h4 className="font-bold text-brand-dark text-base sm:text-lg mb-3 border-b-2 border-brand-orange inline-block">
        Book {label}
      </h4>
      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-4 text-sm text-brand-dark">
        Selected: <strong>{selectedText}</strong>
      </div>
      <form onSubmit={handleSubmit}>
        <input type="hidden" name="_cc" value="divinetravels.in.info@gmail.com" />
        <input type="hidden" name="Destination" value={destination} />
        <input type="hidden" name="Package_Type" value={packageType} />
        <input type="hidden" name="Selected_Programs" value={selectedText} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Name</label>
            <input type="text" name="Name" required className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange bg-white" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Phone</label>
            <input type="tel" name="Phone" required className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange bg-white" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Travel Date</label>
            <input type="date" name="Date" required min={today} className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange bg-white" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Travelers</label>
            <input type="number" name="Travelers" min={1} defaultValue={1} className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange bg-white" />
          </div>
        </div>
        <button type="submit" className="w-full py-3.5 bg-brand-orange text-white font-bold rounded-xl hover:bg-brand-orange/90 transition-all duration-300 uppercase tracking-wider text-sm shadow-lg shadow-brand-orange/20">
          Confirm {label} Booking
        </button>
      </form>
      <div className="success-msg hidden bg-green-50 border border-green-200 text-green-700 rounded-xl p-4 mt-3 text-center text-sm">
        Booking request sent! We will contact you soon.
      </div>
    </div>
  )
}

export function NainitalTour() {
  const [day1Sel, setDay1Sel] = useState<number[]>([])
  const [day2Sel, setDay2Sel] = useState<number[]>([])
  const [day3Sel, setDay3Sel] = useState<number[]>([])
  const [masterSel, setMasterSel] = useState<number | null>(null)

  const handleDayToggle = (daySetter: React.Dispatch<React.SetStateAction<number[]>>, current: number[], id: number, max: number) => {
    if (current.includes(id)) {
      daySetter(current.filter((i) => i !== id))
    } else if (current.length < max) {
      daySetter([...current, id])
    }
  }

  return (
    <div className="min-h-screen bg-brand-cream">
      <Navbar />
      <ActivityBar />
      <section className="relative h-[50vh] sm:h-[60vh] overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=1200&q=80" alt="Nainital Tour" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/80 via-brand-dark/50 to-brand-cream" />
        </div>
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 sm:px-6 pt-20">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 bg-brand-orange/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
              <Mountain className="w-4 h-4 text-brand-orange" />
              <span className="text-brand-orange text-sm font-semibold">Nainital Tours</span>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-white leading-tight mb-3">Nainital Tour Packages</h1>
            <p className="text-white/70 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">Discover the Lake District of India with flexible day-wise programs and master circuits</p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <motion.div {...fadeInUp} className="text-center mb-10 sm:mb-14">
          <span className="text-brand-orange text-sm font-semibold tracking-wider uppercase">Nainital</span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-brand-dark mt-2">Choose Your Nainital Experience</h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">Mix and match programs across 3 days, or choose a master circuit for a complete journey</p>
        </motion.div>

        <DaySection label="Day 1" title="Section 1: Day 1 Selection (Select 1)" maxSelect={1} programs={standardPrograms} selectedIds={day1Sel} onToggle={(id) => handleDayToggle(setDay1Sel, day1Sel, id, 1)} />
        <DaySection label="Day 2" title="Section 2: Day 2 Selection (Select any 2)" maxSelect={2} programs={standardPrograms} selectedIds={day2Sel} onToggle={(id) => handleDayToggle(setDay2Sel, day2Sel, id, 2)} />
        <DaySection label="Day 3" title="Section 3: Day 3 Selection (Select any 3)" maxSelect={3} programs={standardPrograms} selectedIds={day3Sel} onToggle={(id) => handleDayToggle(setDay3Sel, day3Sel, id, 3)} />

        <MasterSection programs={masterPrograms} selectedId={masterSel} onSelect={(id) => setMasterSel(masterSel === id ? null : id)} />
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
            <h3 className="font-serif text-2xl sm:text-3xl text-white mb-3">Need help planning your Nainital tour?</h3>
            <p className="text-white/60 max-w-lg mx-auto mb-6">Contact our travel experts for personalized recommendations.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a href="https://wa.me/916396919007" target="_blank" rel="noopener noreferrer">
                <Button className="bg-green-600 hover:bg-green-700 text-white rounded-full px-8 h-12">WhatsApp Us</Button>
              </a>
              <a href="tel:+916396919007">
                <Button variant="outline" className="border-white/40 bg-white text-brand-dark hover:bg-white/90 rounded-full px-8 h-12">Call Now</Button>
              </a>
            </div>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  )
}
