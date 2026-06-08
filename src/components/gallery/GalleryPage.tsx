'use client'

import { useAppStore } from '@/lib/store'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Filter, X, ChevronLeft, ChevronRight, Tag, ArrowLeft, ImageOff } from 'lucide-react'
import { Navbar } from '@/components/landing/Navbar'
import { ActivityBar } from '@/components/landing/ActivityBar'
import { BackButton } from '@/components/ui/BackButton'
import { Footer } from '@/components/landing/Footer'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface GalleryImage {
  id: string
  url: string
  title: string
  alt: string
  category: string
  featured: boolean
  order: number
  active: boolean
}

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
}

export function GalleryPage() {
  const { navigate } = useAppStore()
  const [activeCategory, setActiveCategory] = useState<string>('All')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const { data: images = [], isLoading } = useQuery({
    queryKey: ['gallery-images'],
    queryFn: async () => {
      const res = await fetch('/api/gallery')
      if (!res.ok) throw new Error('Failed to fetch gallery')
      const data = await res.json()
      return data as GalleryImage[]
    },
  })

  const categories = useMemo(() => {
    const set = new Set<string>(['All'])
    images.forEach((img) => set.add(img.category))
    return Array.from(set)
  }, [images])

  const filteredImages = useMemo(() => {
    if (activeCategory === 'All') return images
    return images.filter((img) => img.category === activeCategory)
  }, [images, activeCategory])

  useEffect(() => {
    if (lightboxIndex === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIndex(null)
      if (e.key === 'ArrowRight') setLightboxIndex((i) => (i === null ? null : (i + 1) % filteredImages.length))
      if (e.key === 'ArrowLeft') setLightboxIndex((i) => (i === null ? null : (i - 1 + filteredImages.length) % filteredImages.length))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxIndex, filteredImages.length])

  useEffect(() => {
    if (lightboxIndex !== null) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [lightboxIndex])

  const getCategoryColor = (cat: string) => {
    const map: Record<string, string> = {
      Trekking: 'bg-brand-teal text-white',
      Camping: 'bg-brand-orange text-white',
      Adventure: 'bg-brand-gold text-white',
      Stay: 'bg-brand-dark text-white',
      Sightseeing: 'bg-pink-500 text-white',
      Spiritual: 'bg-purple-500 text-white',
      Travel: 'bg-brand-orange text-white',
    }
    return map[cat] || 'bg-gray-600 text-white'
  }

  return (
    <div className="min-h-screen flex flex-col bg-brand-cream">
      <Navbar />
      <ActivityBar />
      <div className="max-w-7xl mx-auto px-4 pt-3">
        <BackButton />
      </div>

      <section className="relative py-16 md:py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-dark via-brand-dark to-brand-teal opacity-95" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle at 25% 25%, #C8963E 0%, transparent 40%), radial-gradient(circle at 75% 75%, #E8740C 0%, transparent 40%)',
          }}
        />
        <div className="relative max-w-7xl mx-auto">
          <button
            onClick={() => navigate('landing')}
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
          <motion.div {...fadeInUp} className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-brand-orange/20 backdrop-blur-sm border border-brand-orange/30">
              <Camera className="w-8 h-8 text-brand-orange" />
            </div>
            <span className="text-brand-gold font-semibold tracking-wider uppercase text-sm">Captured Moments</span>
          </motion.div>
          <motion.h1
            {...fadeInUp}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold text-white mb-4"
          >
            Travel <span className="text-brand-orange">Gallery</span>
          </motion.h1>
          <motion.p
            {...fadeInUp}
            transition={{ delay: 0.2 }}
            className="text-white/80 text-lg max-w-2xl"
          >
            A visual journey through our travelers' most unforgettable adventures — from Himalayan treks
            to desert sunsets, campfire nights to luxury stays.
          </motion.p>
          <motion.div
            {...fadeInUp}
            transition={{ delay: 0.3 }}
            className="mt-6 flex items-center gap-4 text-white/70 text-sm"
          >
            <div className="flex items-center gap-2">
              <ImageOff className="w-4 h-4" />
              <span>{images.length} {images.length === 1 ? 'photo' : 'photos'}</span>
            </div>
            <div className="h-4 w-px bg-white/30" />
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              <span>{categories.length - 1} categories</span>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="sticky top-0 z-30 bg-brand-cream/95 backdrop-blur-md border-b border-brand-orange/10 py-4 px-4">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto scrollbar-thin">
          <Filter className="w-4 h-4 text-brand-dark/60 shrink-0 mr-2" />
          {categories.map((cat) => {
            const isActive = activeCategory === cat
            const count = cat === 'All' ? images.length : images.filter((i) => i.category === cat).length
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  'shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300',
                  'border-2',
                  isActive
                    ? 'bg-brand-orange border-brand-orange text-white shadow-md scale-105'
                    : 'bg-white border-brand-orange/20 text-brand-dark/70 hover:border-brand-orange hover:text-brand-dark opacity-60 hover:opacity-100'
                )}
              >
                {cat}
                <span className={cn('ml-2 text-xs', isActive ? 'text-white/80' : 'text-brand-dark/50')}>
                  ({count})
                </span>
              </button>
            )
          })}
        </div>
      </section>

      <section className="flex-1 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-brand-orange/10 to-brand-gold/10 animate-pulse"
                />
              ))}
            </div>
          ) : filteredImages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="inline-flex p-6 rounded-full bg-brand-orange/10 mb-4">
                <Camera className="w-12 h-12 text-brand-orange" />
              </div>
              <h3 className="text-2xl font-bold text-brand-dark mb-2">No photos yet</h3>
              <p className="text-brand-dark/60 mb-6">Check back soon for new adventures in {activeCategory}.</p>
              <Button onClick={() => setActiveCategory('All')} className="bg-brand-orange hover:bg-brand-orange/90 text-white">
                View All Photos
              </Button>
            </motion.div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 [column-fill:_balance]"
              >
                {filteredImages.map((img, idx) => {
                  const aspectRatios = ['aspect-[4/3]', 'aspect-square', 'aspect-[3/4]', 'aspect-[4/5]', 'aspect-[5/4]']
                  const aspect = aspectRatios[idx % aspectRatios.length]
                  return (
                    <motion.button
                      key={img.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(idx * 0.04, 0.4) }}
                      onClick={() => setLightboxIndex(idx)}
                      className="group relative w-full mb-4 break-inside-avoid rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer"
                    >
                      <div className={cn('w-full', aspect)}>
                        <img
                          src={img.url}
                          alt={img.alt}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/90 via-brand-dark/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                        <span
                          className={cn(
                            'inline-block self-start px-2.5 py-1 rounded-full text-xs font-semibold mb-2',
                            getCategoryColor(img.category)
                          )}
                        >
                          {img.category}
                        </span>
                        <h3 className="text-white font-bold text-base text-left">{img.title}</h3>
                      </div>
                      {img.featured && (
                        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-brand-orange text-white text-xs font-bold shadow-md">
                          Featured
                        </div>
                      )}
                    </motion.button>
                  )
                })}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </section>

      <Footer />

      <AnimatePresence>
        {lightboxIndex !== null && filteredImages[lightboxIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-brand-dark/95 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setLightboxIndex(null)}
          >
            <button
              onClick={() => setLightboxIndex(null)}
              className="absolute top-4 right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation()
                setLightboxIndex((i) => (i === null ? null : (i - 1 + filteredImages.length) % filteredImages.length))
              }}
              className="absolute left-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
              aria-label="Previous"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation()
                setLightboxIndex((i) => (i === null ? null : (i + 1) % filteredImages.length))
              }}
              className="absolute right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
              aria-label="Next"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            <motion.div
              key={filteredImages[lightboxIndex].id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-5xl max-h-[90vh] w-full"
            >
              <img
                src={filteredImages[lightboxIndex].url}
                alt={filteredImages[lightboxIndex].alt}
                className="w-full h-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
              />
              <div className="mt-4 text-center">
                <span
                  className={cn(
                    'inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2',
                    getCategoryColor(filteredImages[lightboxIndex].category)
                  )}
                >
                  {filteredImages[lightboxIndex].category}
                </span>
                <h3 className="text-white font-bold text-xl">{filteredImages[lightboxIndex].title}</h3>
                <p className="text-white/60 text-sm mt-1">
                  {lightboxIndex + 1} of {filteredImages.length}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
