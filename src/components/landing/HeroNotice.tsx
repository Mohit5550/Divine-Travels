'use client'

import { useState, useEffect, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface HeroNoticeItem {
  id: string
  image: string | null
  heading: string
  description: string | null
}

export function HeroNotice() {
  const [current, setCurrent] = useState(0)
  const [dismissed, setDismissed] = useState(false)

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

  return (
    <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 w-[280px] sm:w-[320px]">
      <AnimatePresence mode="wait">
        <motion.div
          key={notice.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-white/20"
        >
          {notice.image && (
            <div className="relative h-36 sm:h-40 overflow-hidden">
              <img
                src={notice.image}
                alt={notice.heading}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
          )}

          <div className="p-4">
            <h3 className="font-bold text-brand-dark text-sm sm:text-base leading-tight">{notice.heading}</h3>
            {notice.description && (
              <p className="text-gray-500 text-xs mt-1.5 line-clamp-2">{notice.description}</p>
            )}
          </div>

          <div className="flex items-center justify-between px-4 pb-3">
            <div className="flex items-center gap-1.5">
              {notices.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === current ? 'bg-brand-orange w-4' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center gap-1">
              <button onClick={prev} className="p-1 rounded-full hover:bg-gray-100 transition">
                <ChevronLeft className="w-4 h-4 text-gray-400" />
              </button>
              <button onClick={next} className="p-1 rounded-full hover:bg-gray-100 transition">
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <button
        onClick={() => setDismissed(true)}
        className="absolute -top-2 -right-2 w-7 h-7 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition"
      >
        <X className="w-4 h-4 text-gray-500" />
      </button>
    </div>
  )
}
