'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, MapPin, Star, Loader2 } from 'lucide-react'
import { useAppStore } from '@/lib/store'

interface Pkg {
  id: string
  name: string
  tagline: string
  image: string
  price: number
  rating: number
  reviewCount: number
  duration: string
  location: string
  category: string
  slug: string
}

export function DestinationCarousel() {
  const { navigate } = useAppStore()
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [activeIndex, _setActiveIndex] = useState(0)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  const { data: packages = [], isLoading } = useQuery({
    queryKey: ['discover-destinations'],
    queryFn: async () => {
      const [domestic, spiritual] = await Promise.all([
        fetch('/api/packages?category=domestic-tours').then(r => r.json()),
        fetch('/api/packages?category=spiritual-tours').then(r => r.json()),
      ])
      const all = [...(domestic || []), ...(spiritual || [])]
      return all.slice(0, 12) as Pkg[]
    },
    staleTime: 60000,
  })

  const updateScrollButtons = () => {
    if (!scrollRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10)
  }

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.addEventListener('scroll', updateScrollButtons)
    updateScrollButtons()
    return () => el.removeEventListener('scroll', updateScrollButtons)
  }, [packages])

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return
    const amount = scrollRef.current.clientWidth * 0.8
    scrollRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  return (
    <section id="destinations" className="py-14 sm:py-20 bg-brand-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-14"
        >
          <span className="text-brand-orange text-sm font-semibold tracking-wider uppercase">Discover</span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-brand-dark mt-2">
            Explore India&apos;s Best Destinations
          </h2>
          <p className="text-muted-foreground mt-3 text-sm sm:text-base">
            Handpicked destinations for your perfect getaway
          </p>
        </motion.div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-brand-orange" />
          </div>
        ) : packages.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No packages available.</div>
        ) : (
          <div className="relative">
            {canScrollLeft && (
              <button onClick={() => scroll('left')} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition hidden sm:flex">
                <ChevronLeft className="w-5 h-5 text-brand-dark" />
              </button>
            )}

            <div
              ref={scrollRef}
              className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory -mx-4 px-4"
              onScroll={updateScrollButtons}
            >
              {packages.map((pkg, index) => (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="min-w-[240px] sm:min-w-[280px] w-[240px] sm:w-[280px] snap-start"
                >
                  <div
                    onClick={() => navigate('package-detail', null, pkg.id)}
                    className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="relative h-40 sm:h-44 overflow-hidden">
                      <img
                        src={pkg.image}
                        alt={pkg.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute top-3 left-3 bg-brand-orange text-white text-[10px] font-bold px-2 py-1 rounded-full">
                        {pkg.category === 'domestic-tours' ? 'Domestic' : 'Spiritual'}
                      </div>
                      <div className="absolute bottom-2 left-3 right-3">
                        <h3 className="text-white font-bold text-base leading-tight">{pkg.name}</h3>
                        {pkg.location && (
                          <p className="text-white/70 text-xs mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />{pkg.location}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="p-3 sm:p-4">
                      {pkg.tagline && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{pkg.tagline}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-lg font-bold text-brand-dark">₹{pkg.price}</span>
                          <span className="text-xs text-muted-foreground">/person</span>
                        </div>
                        {pkg.rating > 0 && (
                          <div className="flex items-center gap-1 text-xs">
                            <Star className="w-3.5 h-3.5 fill-brand-gold text-brand-gold" />
                            <span className="font-semibold">{pkg.rating}</span>
                            <span className="text-muted-foreground">({pkg.reviewCount})</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {canScrollRight && (
              <button onClick={() => scroll('right')} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition hidden sm:flex">
                <ChevronRight className="w-5 h-5 text-brand-dark" />
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
