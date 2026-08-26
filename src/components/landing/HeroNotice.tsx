'use client'

import { useState, useEffect, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, ExternalLink, Sparkles, ArrowUpRight } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { toDirectImageUrl } from '@/lib/utils'

interface HeroNoticeItem {
  id: string
  image: string | null
  heading: string
  description: string | null
  link: string | null
}

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600&q=80',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
  'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600&q=80',
]

export function HeroNotice() {
  const [current, setCurrent] = useState(0)
  const [dismissed, setDismissed] = useState(false)
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({})
  const { navigate } = useAppStore()

  const { data: notices = [] } = useQuery({
    queryKey: ['hero-notices'],
    queryFn: async () => {
      const res = await fetch('/api/hero-notices')
      if (!res.ok) return []
      const data = await res.json()
      return (Array.isArray(data) ? data : []) as HeroNoticeItem[]
    },
    staleTime: 30000,
  })

  const next = useCallback(() => {
    if (notices.length > 0) setCurrent((c) => (c + 1) % notices.length)
  }, [notices.length])

  const prev = useCallback(() => {
    if (notices.length > 0) setCurrent((c) => (c - 1 + notices.length) % notices.length)
  }, [notices.length])

  useEffect(() => {
    if (notices.length <= 1) return
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [notices.length, next])

  if (notices.length === 0 || dismissed) return null

  const notice = notices[current] || notices[0]

  const handleClick = () => {
    if (!notice?.link) return
    let raw = notice.link.trim()
    const lower = raw.toLowerCase()

    // External link to a different domain -> open in a new tab
    if (raw.startsWith('http') && !lower.includes(window.location.hostname)) {
      window.open(raw, '_blank')
      return
    }

    // Normalise to an internal path (strip origin if an absolute URL was given)
    if (raw.startsWith('http')) raw = raw.replace(/^https?:\/\/[^/]+/, '')
    if (!raw.startsWith('/')) raw = '/' + raw
    const path = raw.toLowerCase()

    // Detail pages carry an id -> open the detail view directly
    const pkg = path.match(/\/package\/([^/]+)/)
    if (pkg) { navigate('package-detail', null, pkg[1]); return }
    const hotel = path.match(/\/hotel\/([^/]+)/)
    if (hotel) { navigate('hotel-detail', null, hotel[1]); return }
    const dest = path.match(/\/\/?destination\/([^/]+)/)
    if (dest) { navigate('destination-detail', dest[1], null); return }

    // Listing / view pages -> map the path to the matching SPA view
    const PATH_VIEW: Record<string, string> = {
      '/rafting': 'rafting-packages',
      '/trekking': 'trekking',
      '/adventure': 'adventure',
      '/bike-rental': 'bike-rental',
      '/taxi': 'taxi-booking',
      '/domestic': 'domestic-tours',
      '/spiritual': 'spiritual-tours',
      '/international': 'international-tours',
      '/hotels': 'hotel-packages',
      '/camping': 'camping-packages',
      '/rishikesh': 'rishikesh-tour',
      '/haridwar': 'haridwar-tour',
      '/mussoorie': 'mussoorie-tour',
      '/nainital': 'nainital-tour',
      '/hill-stations': 'hill-stations-tour',
      '/char-dham': 'char-dham-tour',
      '/gallery': 'gallery',
      '/blog': 'blog-archive',
      '/about': 'about-us',
      '/contact': 'contact',
      '/dashboard': 'user-dashboard',
      '/admin': 'admin-dashboard',
      '/privacy': 'privacy-policy',
      '/terms': 'terms-of-service',
      '/refund': 'refund-policy',
      '/cancellation': 'cancellation-policy',
    }
    for (const p of Object.keys(PATH_VIEW)) {
      if (path === p || path.startsWith(p + '/') || path.startsWith(p)) {
        navigate(PATH_VIEW[p])
        return
      }
    }

    // Generic booking/package/deal links -> go to the stays listing as the booking entry point
    if (path.includes('booking') || path.includes('package') || path.includes('hotel') || path.includes('camp') || path.includes('stay')) {
      navigate('hotel-packages')
      return
    }
    navigate('landing')
  }

  const imgSrc = notice.image && !imgErrors[notice.id]
    ? toDirectImageUrl(notice.image)
    : FALLBACK_IMAGES[current % FALLBACK_IMAGES.length]

  return (
    <div className="absolute bottom-4 right-4 sm:top-6 sm:right-6 sm:bottom-auto z-30 w-64 sm:w-76 lg:w-80">
      <AnimatePresence mode="wait">
        <motion.div
          key={notice.id || current}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.25 }}
          onClick={handleClick}
          className={`bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-white/50 ring-1 ring-black/5 ${
            notice.link ? 'cursor-pointer hover:bg-white hover:shadow-brand-orange/20 transition-all duration-300' : ''
          }`}
        >
          {/* Card Header & Media */}
          <div className="relative h-24 sm:h-32 w-full overflow-hidden bg-slate-900">
            <img
              src={imgSrc}
              alt={notice.heading}
              onError={() => setImgErrors((prev) => ({ ...prev, [notice.id]: true }))}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Live Special Deal Tag */}
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-brand-orange/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
              <Sparkles className="w-3 h-3" />
              <span>Special Deal</span>
            </div>

            {/* Bottom Headline inside banner image */}
            <div className="absolute bottom-2 left-3 right-3">
              <h4 className="font-bold text-white text-xs sm:text-sm leading-tight drop-shadow-sm line-clamp-1">
                {notice.heading}
              </h4>
            </div>
          </div>

          {/* Description & Action */}
          <div className="p-2.5 sm:p-3 bg-white">
            {notice.description && (
              <p className="text-gray-600 text-[11px] sm:text-xs leading-relaxed line-clamp-2">
                {notice.description}
              </p>
            )}

            {/* Footer Navigation & Indicator */}
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 text-xs">
              <div className="flex items-center gap-1">
                {notices.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation()
                      setCurrent(i)
                    }}
                    className={`h-1.5 rounded-full transition-all ${
                      i === current ? 'bg-brand-orange w-4' : 'bg-gray-200 hover:bg-gray-300 w-1.5'
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-1.5">
                {notice.link && (
                  <span className="text-[11px] font-bold text-brand-orange flex items-center gap-0.5">
                    Explore <ArrowUpRight className="w-3 h-3" />
                  </span>
                )}
                <div className="flex items-center gap-0.5 ml-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      prev()
                    }}
                    className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      next()
                    }}
                    className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Dismiss Button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          setDismissed(true)
        }}
        title="Close Notice"
        className="absolute -top-2 -right-2 w-6 h-6 bg-white text-gray-600 rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-colors z-40"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
