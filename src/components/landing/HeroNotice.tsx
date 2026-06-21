'use client'

import { useState, useEffect, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { toDirectImageUrl } from '@/lib/utils'

interface HeroNoticeItem {
  id: string
  image: string | null
  heading: string
  description: string | null
  link: string | null
}

export function HeroNotice() {
  const [current, setCurrent] = useState(0)
  const [dismissed, setDismissed] = useState(false)
  const { navigate } = useAppStore()

  const { data: notices = [] } = useQuery({
    queryKey: ['hero-notices'],
    queryFn: async () => {
      const res = await fetch('/api/hero-notices')
      if (!res.ok) return []
      return res.json() as Promise<HeroNoticeItem[]>
    },
    staleTime: 60000,
  })

  const next = useCallback(() => {
    if (notices.length > 0) setCurrent((c) => (c + 1) % notices.length)
  }, [notices.length])

  const prev = useCallback(() => {
    if (notices.length > 0) setCurrent((c) => (c - 1 + notices.length) % notices.length)
  }, [notices.length])

  useEffect(() => {
    if (notices.length <= 1) return
    const timer = setInterval(next, 4000)
    return () => clearInterval(timer)
  }, [notices.length, next])

  if (notices.length === 0 || dismissed) return null

  const notice = notices[current]

  const handleClick = () => {
    if (notice.link) {
      if (notice.link.startsWith('http')) {
        window.open(notice.link, '_blank')
      } else {
        navigate(notice.link)
      }
    }
  }

  return (
    <div className="absolute bottom-2 right-2 sm:top-6 sm:right-6 z-20 w-[200px] sm:w-[300px]">
      <AnimatePresence mode="wait">
        <motion.div
          key={notice.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          onClick={handleClick}
          className={`bg-white/95 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-xl overflow-hidden border border-white/20 ${notice.link ? 'cursor-pointer hover:bg-white transition-colors' : ''}`}
        >
          {notice.image && (
            <div className="relative h-20 sm:h-36 overflow-hidden">
              <img src={toDirectImageUrl(notice.image)} alt={notice.heading} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>
          )}

          <div className="p-2 sm:p-4">
            <div className="flex items-center gap-1">
              <h3 className="font-bold text-brand-dark text-xs sm:text-sm leading-tight">{notice.heading}</h3>
              {notice.link && <ExternalLink className="w-3 h-3 text-brand-orange shrink-0" />}
            </div>
            {notice.description && (
              <p className="text-gray-500 text-[10px] sm:text-xs mt-0.5 sm:mt-1 line-clamp-2">{notice.description}</p>
            )}
          </div>

          <div className="flex items-center justify-between px-2 sm:px-4 pb-1.5 sm:pb-3">
            <div className="flex items-center gap-1">
              {notices.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setCurrent(i) }}
                  className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all ${
                    i === current ? 'bg-brand-orange w-3 sm:w-4' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center gap-0.5">
              <button onClick={(e) => { e.stopPropagation(); prev() }} className="p-0.5 sm:p-1 rounded-full hover:bg-gray-100 transition">
                <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); next() }} className="p-0.5 sm:p-1 rounded-full hover:bg-gray-100 transition">
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <button
        onClick={(e) => { e.stopPropagation(); setDismissed(true) }}
        className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-7 sm:h-7 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition"
      >
        <X className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
      </button>
    </div>
  )
}
