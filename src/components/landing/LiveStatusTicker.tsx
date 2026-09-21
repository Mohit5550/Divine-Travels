'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Waves, Compass, Car, Sparkles } from 'lucide-react'

export function LiveStatusTicker() {
  const { data: settings } = useQuery({
    queryKey: ['public-settings'],
    queryFn: async () => {
      const res = await fetch('/api/public/settings')
      if (!res.ok) return {}
      return res.json() as Promise<Record<string, string>>
    },
    staleTime: 60000,
  })

  const customAdvisory = settings?.seasonAdvisory

  // Rotating status messages for mobile & compact view
  const statusItems = [
    {
      icon: Sun,
      text: 'Rishikesh: 24°C · Sunny Weather',
      highlight: 'Clear Skies',
      color: 'text-amber-300',
    },
    {
      icon: Waves,
      text: 'Ganga River Rafting Season',
      highlight: 'Open & Active 🟢',
      color: 'text-emerald-300',
    },
    {
      icon: Compass,
      text: 'Char Dham Yatra 2026',
      highlight: 'Registrations Open',
      color: 'text-sky-300',
    },
    {
      icon: Car,
      text: 'Dehradun Airport Taxis',
      highlight: 'Available 24x7',
      color: 'text-orange-300',
    },
  ]

  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return
      setActiveIndex((prev) => (prev + 1) % statusItems.length)
    }, 3500)
    return () => clearInterval(interval)
  }, [statusItems.length])

  const current = statusItems[activeIndex]
  const CurrentIcon = current.icon

  return (
    <div className="inline-flex items-center justify-center max-w-full mb-3 sm:mb-4 px-2">
      {/* Floating Frosted Glass Pill */}
      <div className="inline-flex items-center gap-2 sm:gap-3 bg-black/40 backdrop-blur-md border border-white/25 shadow-xl text-white rounded-full px-3 sm:px-4 py-1.5 transition-all hover:bg-black/50 hover:border-white/35">
        {/* Pulsing Live Dot */}
        <div className="flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-400/40 px-2 py-0.5 rounded-full shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          </span>
          <span className="font-bold text-emerald-400 uppercase text-[9px] sm:text-[10px] tracking-wider">
            Live
          </span>
        </div>

        {/* Custom Advisory (if set) */}
        {customAdvisory ? (
          <span className="text-xs sm:text-sm font-medium text-white/95 truncate">
            {customAdvisory}
          </span>
        ) : (
          <>
            {/* Mobile View: Rotating Smooth Transition */}
            <div className="sm:hidden overflow-hidden h-5 flex items-center min-w-[200px] max-w-[240px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="flex items-center gap-1.5 text-[11px] text-white/95 font-medium whitespace-nowrap truncate"
                >
                  <CurrentIcon className={`w-3.5 h-3.5 shrink-0 ${current.color}`} />
                  <span className="truncate">{current.text}</span>
                  <span className="font-semibold text-emerald-300">({current.highlight})</span>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Desktop View: Multi-badge strip */}
            <div className="hidden sm:flex items-center gap-2.5 text-xs text-white/90 font-medium">
              <span className="flex items-center gap-1">
                <Sun className="w-3.5 h-3.5 text-amber-300" />
                <span>Rishikesh 24°C · Sunny</span>
              </span>
              <span className="text-white/30">•</span>
              <span className="flex items-center gap-1 text-emerald-300 font-semibold">
                <Waves className="w-3.5 h-3.5" />
                <span>Rafting Open 🟢</span>
              </span>
              <span className="text-white/30">•</span>
              <span className="flex items-center gap-1 text-sky-200">
                <Compass className="w-3.5 h-3.5 text-sky-300" />
                <span>Char Dham 2026 Open</span>
              </span>
              <span className="text-white/30 hidden md:inline">•</span>
              <span className="hidden md:flex items-center gap-1 text-orange-200">
                <Car className="w-3.5 h-3.5 text-orange-300" />
                <span>Taxis 24x7</span>
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
