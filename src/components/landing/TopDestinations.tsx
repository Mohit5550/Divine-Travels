'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { ArrowRight, Loader2 } from 'lucide-react'

interface Dest {
  id: string
  name: string
  tagline: string
  state: string
  image: string
  slug: string
}

const fallbackDestinations: Dest[] = [
  { name: 'Rishikesh', state: 'Uttarakhand', tagline: 'Devbhoomi of Nature & Adventure', image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600&q=80', slug: 'rishikesh', id: '' },
  { name: 'Haridwar', state: 'Uttarakhand', tagline: 'Devbhoomi of Nature & Ganga Ghats', image: 'https://images.unsplash.com/photo-1598091383021-15ddea10925d?w=600&q=80', slug: 'haridwar', id: '' },
  { name: 'Mussoorie', state: 'Uttarakhand', tagline: 'Temple, Waterfalls & Hill Station', image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600&q=80', slug: 'mussoorie', id: '' },
  { name: 'Nainital', state: 'Uttarakhand', tagline: "Beautiful Lake's & Hill Station", image: 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=600&q=80', slug: 'nainital', id: '' },
  { name: 'Hill Stations', state: 'Uttarakhand', tagline: 'Explore the majestic peaks', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80', slug: 'hill-stations', id: '' },
  { name: 'Char Dham', state: 'Uttarakhand', tagline: 'चारधाम यात्रा — Sacred pilgrimage', image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=600&q=80', slug: 'char-dham', id: '' },
]

function toSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-')
}

export function TopDestinations() {
  const { navigate } = useAppStore()
  const [destinations, setDestinations] = useState<Dest[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        let res = await fetch('/api/destinations?featured=true')
        if (!res.ok) throw new Error('API error')
        let data = await res.json()
        if (!Array.isArray(data) || data.length === 0) {
          res = await fetch('/api/destinations')
          if (res.ok) data = await res.json()
        }
        if (Array.isArray(data) && data.length > 0) {
          const mapped: Dest[] = data.slice(0, 6).map((d: any) => ({
            id: d.id,
            name: d.name,
            tagline: d.tagline,
            state: d.state,
            image: d.image,
            slug: toSlug(d.name),
          }))
          if (!cancelled) setDestinations(mapped)
        } else {
          if (!cancelled) setDestinations(fallbackDestinations)
        }
      } catch {
        if (!cancelled) setDestinations(fallbackDestinations)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const handleClick = (dest: Dest) => {
    const viewMap: Record<string, string> = {
      rishikesh: 'rishikesh-tour',
      haridwar: 'haridwar-tour',
      mussoorie: 'mussoorie-tour',
      nainital: 'nainital-tour',
      'hill-stations': 'hill-stations-tour',
      'char-dham': 'char-dham-tour',
    }
    const view = viewMap[dest.slug]
    if (view) navigate(view)
    else navigate('destination-detail', null)
  }

  const items = destinations || fallbackDestinations

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

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-brand-orange" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
            {items.map((dest, idx) => (
              <motion.div
                key={dest.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.07, duration: 0.4 }}
                onClick={() => handleClick(dest)}
                className="group cursor-pointer"
              >
                <div className="relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 h-full flex flex-col hover:-translate-y-2 hover:rotate-1">
                  <div className="relative h-44 sm:h-52 overflow-hidden">
                    <motion.img
                      src={dest.image}
                      alt={dest.name}
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.15 }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
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
        )}
      </div>
    </section>
  )
}
