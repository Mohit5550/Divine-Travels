'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { ArrowRight } from 'lucide-react'

const defaultDestinations = [
  {
    name: 'Rishikesh',
    state: 'Uttarakhand',
    tagline: 'Devbhoomi of Nature & Adventure',
    image: '',
    type: 'destination' as const,
    slug: 'rishikesh',
  },
  {
    name: 'Haridwar',
    state: 'Uttarakhand',
    tagline: 'Devbhoomi of Nature & Ganga Ghats',
    image: '',
    type: 'destination' as const,
    slug: 'haridwar',
  },
  {
    name: 'Mussoorie',
    state: 'Uttarakhand',
    tagline: 'Temple, Waterfalls & Hill Station',
    image: '',
    type: 'destination' as const,
    slug: 'mussoorie',
  },
  {
    name: 'Nainital',
    state: 'Uttarakhand',
    tagline: 'Beautiful Lake\'s & Hill Station',
    image: '',
    type: 'destination' as const,
    slug: 'nainital',
  },
  {
    name: 'Hill Stations',
    state: 'Uttarakhand',
    tagline: 'Explore the majestic peaks',
    image: '',
    type: 'category' as const,
    slug: 'hill-stations',
  },
  {
    name: 'Char Dham',
    state: 'Uttarakhand',
    tagline: 'चारधाम यात्रा — Sacred pilgrimage',
    image: '',
    type: 'destination' as const,
    slug: 'char-dham',
  },
]

export function TopDestinations() {
  const { navigate } = useAppStore()
  const [destinations, setDestinations] = useState(defaultDestinations)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const res = await fetch('/api/tour-destinations')
        if (!res.ok) throw new Error()
        const data = await res.json()
        if (!Array.isArray(data) || data.length === 0 || cancelled) return
        const apiImages: Record<string, string> = {}
        for (const d of data) {
          if (d.config?.heroImage) {
            apiImages[d.slug] = d.config.heroImage
          }
        }
        setDestinations(prev =>
          prev.map(d => ({
            ...d,
            image: apiImages[d.slug] || d.image,
          }))
        )
      } catch {
        // keep defaults
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const handleClick = (dest: typeof defaultDestinations[0]) => {
    const viewMap: Record<string, string> = {
      rishikesh: 'rishikesh-tour',
      haridwar: 'haridwar-tour',
      mussoorie: 'mussoorie-tour',
      nainital: 'nainital-tour',
      'hill-stations': 'hill-stations-tour',
      'char-dham': 'char-dham-tour',
    }
    const view = viewMap[dest.slug]
    if (view) {
      navigate(view)
    } else {
      navigate('destination-detail', dest.id)
    }
  }

  return (
    <section className="relative py-16 sm:py-20 overflow-hidden bg-brand-cream">
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 bg-brand-orange/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-brand-gold/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-14">
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-semibold text-base sm:text-lg mb-2 text-brand-gold"
          >
            Discover <span className="font-bold text-brand-dark">Rishikesh &amp; Haridwar:</span> Uttarakhand's Ultimate <span className="font-bold text-brand-dark">Spiritual &amp; Adventure Gems</span>
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-serif text-3xl sm:text-4xl lg:text-5xl text-brand-dark"
          >
            Explore{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(90deg, #E8740C 0%, #C8963E 100%)' }}
            >
              Top Destinations
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-sm sm:text-base mt-4 max-w-2xl mx-auto"
          >
            Discover Rishikesh &amp; Haridwar, Uttarakhand's top destinations for rafting, yoga, Ganga Aarti &amp; Himalayan vibes. Plan your spiritual adventure now!
          </motion.p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
          {destinations.map((dest, idx) => (
            <motion.div
              key={dest.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.07, duration: 0.4 }}
              onClick={() => handleClick(dest)}
              className="group cursor-pointer"
            >
              <div className="relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 h-full flex flex-col hover:-translate-y-2 hover:rotate-1">
                <div className="relative h-44 sm:h-52 overflow-hidden bg-gradient-to-br from-brand-orange/20 to-brand-gold/20">
                  {dest.image ? (
                    <motion.img
                      src={dest.image}
                      alt={dest.name}
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.15 }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-brand-orange/60 font-serif text-4xl font-bold">{dest.name[0]}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  <div className="absolute top-3 left-3 right-3">
                    <h3
                      className="text-white font-serif text-lg sm:text-xl drop-shadow-lg tracking-wide"
                      style={{ textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}
                    >
                      {dest.name}
                    </h3>
                    <p className="text-white/90 text-[10px] sm:text-xs drop-shadow-md mt-0.5 line-clamp-1" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.6)' }}>
                      {dest.tagline}
                    </p>
                  </div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    className="absolute inset-0 bg-gradient-to-t from-brand-orange/80 via-brand-orange/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4"
                  >
                    <span className="bg-white text-brand-orange rounded-full px-3 py-1.5 text-xs font-semibold flex items-center gap-1 shadow-lg">
                      Explore <ArrowRight className="w-3 h-3" />
                    </span>
                  </motion.div>
                </div>
                <div className="bg-white p-3 sm:p-4 text-center flex-1 flex flex-col justify-center relative">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-1 rounded-full bg-gradient-to-r from-brand-orange to-brand-gold opacity-0 group-hover:opacity-100 transition-opacity" />
                  <h4 className="font-serif font-bold text-base sm:text-lg text-brand-dark group-hover:text-brand-orange transition-colors">
                    {dest.name}
                  </h4>
                  <p className="text-xs sm:text-sm mt-0.5 text-brand-teal">
                    {dest.state}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
