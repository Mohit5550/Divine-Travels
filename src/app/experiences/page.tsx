'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Waves, Tent, Hotel, Bike, Zap, Compass, Car, MapPin, Phone, ArrowRight, Loader2, Star } from 'lucide-react'
import Link from 'next/link'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'

const CAT_ICONS: Record<string, any> = {
  camping: Tent,
  rafting: Waves,
  hotel: Hotel,
  'bike-rental': Bike,
  adventure: Zap,
  trekking: Compass,
  taxi: Car,
}

const CATS = [
  { id: 'all', label: 'All Experiences' },
  { id: 'camping', label: 'Camping' },
  { id: 'rafting', label: 'Rafting' },
  { id: 'hotel', label: 'Hotels' },
  { id: 'bike-rental', label: 'Bikes' },
  { id: 'adventure', label: 'Adventure' },
  { id: 'trekking', label: 'Trekking' },
  { id: 'taxi', label: 'Taxi' },
]

export default function ExperiencesPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [cat, setCat] = useState('all')

  useEffect(() => {
    setLoading(true)
    fetch(`/api/vendors/public?category=${cat}`)
      .then((r) => r.json())
      .then((d) => setItems(d.success ? d.items : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [cat])

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 font-serif">Curated Experiences by Local Partners</h1>
          <p className="text-gray-500 mt-2 text-sm max-w-2xl mx-auto">
            Handpicked stays, adventures and activities from verified local vendors across Rishikesh &amp; Uttarakhand — approved by Divine Travels.
          </p>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {CATS.map((c) => (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                cat === c.id ? 'bg-brand-orange text-white shadow' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center text-gray-400 py-20">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-brand-orange" />
            <p className="text-sm">Loading experiences...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center text-gray-500 py-20">
            <p className="text-lg font-bold">No experiences available right now</p>
            <p className="text-sm text-gray-400 mt-1">Check back soon — new partner activities are added daily.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((it, i) => {
              const Icon = CAT_ICONS[it.category] || Compass
              const photo = Array.isArray(it.photos) && it.photos.length ? it.photos[0] : null
              return (
                <motion.div
                  key={it.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.3) }}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-lg transition-all"
                >
                  <Link href={`/experiences/${it.id}`}>
                    <div className="relative h-44 bg-gray-100">
                      {photo ? (
                        <img src={photo} alt={it.title} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <Icon className="w-12 h-12" />
                        </div>
                      )}
                      <span className="absolute top-3 left-3 inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full uppercase bg-black/60 text-white">
                        <Icon className="w-3 h-3" /> {it.category}
                      </span>
                    </div>
                  </Link>
                  <div className="p-4 space-y-2">
                    <Link href={`/experiences/${it.id}`}>
                      <h3 className="font-bold text-gray-900 hover:text-brand-orange transition-colors line-clamp-1">{it.title}</h3>
                    </Link>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-red-500" />
                      {it.vendorLocation || it.vendorCity || 'Rishikesh'}
                    </p>
                    <p className="text-[11px] text-gray-400">by {it.vendorName}</p>
                    {it.description && (
                      <p className="text-xs text-gray-500 line-clamp-2">{it.description}</p>
                    )}
                    <div className="flex items-center justify-between pt-1">
                      <div>
                        {it.mrpPrice && Number(it.mrpPrice) > Number(it.sellingPrice) && (
                          <span className="text-xs text-gray-400 line-through mr-1.5">₹{Number(it.mrpPrice).toLocaleString()}</span>
                        )}
                        <span className="text-lg font-extrabold text-gray-900">₹{Number(it.sellingPrice).toLocaleString()}</span>
                        <span className="text-[11px] text-gray-500"> / person</span>
                      </div>
                      <Link
                        href={`/experiences/${it.id}`}
                        className="inline-flex items-center gap-1 bg-brand-orange hover:bg-brand-orange/90 text-white text-xs font-bold px-3 py-1.5 rounded-xl"
                      >
                        View <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
