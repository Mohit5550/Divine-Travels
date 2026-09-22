'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, useAnimation, type PanInfo } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { MapPin, Star, Loader2 } from 'lucide-react'
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
  const controls = useAnimation()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDragged, setIsDragged] = useState(false)
  const dragTimerRef = useRef<ReturnType<typeof setTimeout>>(null)

  const { data: packages = [], isLoading } = useQuery({
    queryKey: ['discover-destinations'],
    queryFn: async () => {
      const [domRes, spirRes] = await Promise.all([
        fetch('/api/packages/cards?category=domestic-tours').then(r => r.ok ? r.json() : []).catch(() => []),
        fetch('/api/packages/cards?category=spiritual-tours').then(r => r.ok ? r.json() : []).catch(() => []),
      ])
      const domestic = Array.isArray(domRes) ? domRes : []
      const spiritual = Array.isArray(spirRes) ? spirRes : []
      const all = [...domestic, ...spiritual]
      return all.slice(0, 12) as Pkg[]
    },
    staleTime: 60000,
  })

  const cardWidth = 280
  const gap = 24

  const pauseAutoScroll = useCallback(() => {
    setIsDragged(true)
    if (dragTimerRef.current) clearTimeout(dragTimerRef.current)
    dragTimerRef.current = setTimeout(() => setIsDragged(false), 4000)
  }, [])

  useEffect(() => {
    if (packages.length === 0 || isDragged) return
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return
      setCurrentIndex(prev => (prev + 1) % packages.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [packages.length, isDragged])

  const visibleItems = packages.length
  const maxX = visibleItems > 0 ? -(visibleItems - 1) * (cardWidth + gap) : 0

  const snapToIndex = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(index, packages.length - 1))
    setCurrentIndex(clamped)
  }, [packages.length])

  useEffect(() => {
    const offset = -currentIndex * (cardWidth + gap)
    controls.start({ x: offset, transition: { duration: 0.7, ease: 'easeInOut' } })
  }, [currentIndex, cardWidth, gap, controls, packages.length])

  const handleDragEnd = (_: any, info: PanInfo) => {
    pauseAutoScroll()
    const threshold = cardWidth * 0.25
    const dragOffset = -info.offset.x
    const velocity = info.velocity.x

    let newIndex = currentIndex
    if (velocity < -500) {
      newIndex = Math.min(currentIndex + 1, packages.length - 1)
    } else if (velocity > 500) {
      newIndex = Math.max(currentIndex - 1, 0)
    } else if (Math.abs(dragOffset) > threshold) {
      const steps = Math.round(dragOffset / (cardWidth + gap))
      newIndex = Math.max(0, Math.min(packages.length - 1, currentIndex + steps))
    }

    snapToIndex(newIndex)
  }

  return (
    <section id="destinations" className="py-14 sm:py-20 bg-brand-cream overflow-hidden">
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
          <div className="relative mx-auto" style={{ maxWidth: visibleItems * (cardWidth + gap) - gap }}>
            <div className="overflow-hidden" style={{ maskImage: 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)' }}>
              <motion.div
                className="flex cursor-grab active:cursor-grabbing select-none"
                style={{ gap: `${gap}px` }}
                animate={controls}
                drag="x"
                dragConstraints={{ left: maxX, right: 0 }}
                dragElastic={0.1}
                onDragEnd={handleDragEnd}
              >
                {packages.concat(packages).map((pkg, index) => (
                  <div
                    key={`${pkg.id}-${index}`}
                    className="shrink-0 pointer-events-auto"
                    style={{ width: `${cardWidth}px` }}
                  >
                    <div
                      onClick={() => navigate('package-detail', null, pkg.slug || pkg.id)}
                      className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full"
                    >
                      <div className="relative h-40 sm:h-44 overflow-hidden">
                        <img
                          src={pkg.image}
                          alt={pkg.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          draggable={false}
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
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
