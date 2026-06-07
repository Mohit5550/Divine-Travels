'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, MapPin, Loader2 } from 'lucide-react'
import { useAppStore } from '@/lib/store'

interface Destination {
  id: string
  name: string
  tagline: string
  state: string
  image: string
  price: number
  rating: number
}

interface DomesticPkg {
  id: string
  name: string
}

const destPkgMap: Record<string, string> = {
  'rishikesh': 'Uttarakhand Tour',
  'haridwar': 'Uttarakhand Tour',
  'mussoorie': 'Uttarakhand Tour',
  'nainital': 'Uttarakhand Tour',
  'auli': 'Uttarakhand Tour',
  'char dham': 'Uttarakhand Tour',
  'manali': 'Himachal Pradesh Tour',
  'jaipur': 'Rajasthan Tour',
  'varanasi': 'UP Religious Tour',
  'kerala': 'Karnataka Tour',
  'sikkim': 'Assam Tour',
  'darjeeling': 'West Bengal Tour',
}

function findMatchingPkg(destName: string, destState: string, packages: DomesticPkg[]): DomesticPkg | undefined {
  const lower = destName.toLowerCase()
  const fromMap = destPkgMap[lower]
  if (fromMap) {
    const match = packages.find((p) => p.name.toLowerCase() === fromMap.toLowerCase())
    if (match) return match
  }
  return packages.find((p) => {
    const pName = p.name.toLowerCase().replace(' tour', '').trim()
    return pName === lower || pName.startsWith(lower) || pName.includes(lower) || lower.includes(pName.replace(' tour', ''))
  })
}

export function DestinationCarousel() {
  const { navigate } = useAppStore()
  const [activeIndex, setActiveIndex] = useState(0)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [isPaused, setIsPaused] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const autoScrollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const { data: destinations = [], isLoading } = useQuery({
    queryKey: ['destinations-carousel'],
    queryFn: async () => {
      const res = await fetch('/api/destinations')
      return res.json() as Promise<Destination[]>
    },
    staleTime: 60000,
  })

  const { data: domesticPkgs = [] } = useQuery({
    queryKey: ['domestic-pkgs-map'],
    queryFn: async () => {
      const res = await fetch('/api/packages?category=domestic-tours')
      return res.json() as Promise<DomesticPkg[]>
    },
    staleTime: 60000,
  })

  const handleDestClick = (dest: Destination) => {
    const match = findMatchingPkg(dest.name, dest.state, domesticPkgs)
    if (match) {
      navigate('package-detail', null, match.id)
    } else {
      navigate('domestic-tours')
    }
  }

  const updateScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 10)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  useEffect(() => {
    updateScrollButtons()
  }, [destinations])

  useEffect(() => {
    if (destinations.length === 0) return
    autoScrollRef.current = setInterval(() => {
      if (isPaused) return
      if (!scrollRef.current) return
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      const cardWidth = scrollRef.current.children[0]?.clientWidth || 280
      const gap = 16
      const maxScroll = scrollWidth - clientWidth
      if (scrollLeft + cardWidth + gap >= maxScroll - 5) {
        scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        scrollRef.current.scrollBy({ left: cardWidth + gap, behavior: 'smooth' })
      }
    }, 3000)
    return () => { if (autoScrollRef.current) clearInterval(autoScrollRef.current) }
  }, [destinations.length, isPaused])

  const scrollBy = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.children[0]?.clientWidth || 280
      const gap = 16
      const scrollAmount = (cardWidth + gap) * 2
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
      setTimeout(updateScrollButtons, 400)
    }
  }

  const handleScroll = () => {
    updateScrollButtons()
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.children[0]?.clientWidth || 280
      const gap = 16
      const scrollPos = scrollRef.current.scrollLeft
      const newIndex = Math.round(scrollPos / (cardWidth + gap))
      setActiveIndex(Math.max(0, Math.min(newIndex, destinations.length - 1)))
    }
  }

  const scrollToIndex = (index: number) => {
    const newIndex = Math.max(0, Math.min(index, destinations.length - 1))
    setActiveIndex(newIndex)
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.children[0]?.clientWidth || 280
      const gap = 16
      scrollRef.current.scrollTo({
        left: newIndex * (cardWidth + gap),
        behavior: 'smooth',
      })
      setTimeout(updateScrollButtons, 400)
    }
  }

  return (
    <section id="destinations" className="py-12 sm:py-16 bg-brand-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-10"
        >
          <span className="text-brand-orange text-sm font-semibold tracking-wider uppercase">Discover</span>
          <h2 className="font-bold text-2xl sm:text-3xl md:text-4xl text-brand-dark mt-1">
            Explore India&apos;s Best Destinations
          </h2>
          <p className="text-muted-foreground mt-2 max-w-xl mx-auto">Handpicked destinations for your perfect getaway</p>
        </motion.div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-brand-orange animate-spin" />
          </div>
        ) : destinations.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No destinations available yet.</p>
        ) : (
          <div className="relative">
            {canScrollLeft && (
              <button
                onClick={() => scrollBy('left')}
                className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-brand-dark" />
              </button>
            )}

            <div
              ref={scrollRef}
              onScroll={handleScroll}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              className="flex gap-4 overflow-x-auto overflow-y-hidden hide-scrollbar scroll-smooth snap-x snap-mandatory px-2"
            >
              {destinations.map((dest, index) => (
                <motion.div
                  key={dest.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="shrink-0 w-[70vw] sm:w-[45vw] md:w-[30vw] lg:w-[calc(25%-12px)] snap-start cursor-pointer group"
                  onClick={() => handleDestClick(dest)}
                >
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-md">
                    <img
                      src={dest.image}
                      alt={dest.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-white font-bold text-lg sm:text-xl">{dest.name}</h3>
                      <p className="text-white/80 text-xs mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {dest.state}
                      </p>
                      <p className="text-white/60 text-xs mt-0.5">{dest.tagline}</p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-brand-orange font-bold text-sm">₹{dest.price}</span>
                        <span className="text-white/60 text-xs">★ {dest.rating}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {canScrollRight && (
              <button
                onClick={() => scrollBy('right')}
                className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-brand-dark" />
              </button>
            )}

            <div className="flex items-center justify-center gap-2 mt-6">
              {destinations.map((dest, index) => (
                <button
                  key={dest.id}
                  onClick={() => scrollToIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    activeIndex === index
                      ? 'bg-brand-orange w-5'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to ${dest.name}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
