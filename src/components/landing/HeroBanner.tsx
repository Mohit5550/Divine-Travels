'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'
import { HeroNotice } from './HeroNotice'

export function HeroBanner() {
  const { navigate } = useAppStore()

  return (
    <section className="relative h-[55vh] sm:h-[80vh] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://picsum.photos/seed/divine-river-nature/1600/900"
          alt="Divine Travel - Scenic River Landscape"
          className="w-full h-full object-cover"
        />
        {/* Teal overlay */}
        <div className="absolute inset-0 bg-brand-teal/55" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl"
        >
          {/* Tagline */}
          <p className="text-white/90 text-sm sm:text-base font-medium mb-3 sm:mb-4 tracking-wide">
            Handpicked experiences for tourists
          </p>

          {/* Main headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl text-white font-extrabold uppercase leading-tight mb-4 sm:mb-6">
            Pay Only 10% To Book,<br />
            Rest On Site
          </h1>

          {/* Sub-heading */}
          <p className="text-white/85 text-base sm:text-lg md:text-xl mb-6 sm:mb-8">
            Explore India&apos;s Best Destinations
          </p>

          <Button
            size="lg"
            className="bg-brand-teal hover:bg-brand-teal/90 text-white rounded-full px-8 sm:px-10 h-12 text-base sm:text-lg font-semibold shadow-lg"
            onClick={() => {
              const el = document.getElementById('destinations')
              el?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            Book Now
          </Button>
        </motion.div>
      </div>

      <HeroNotice />
    </section>
  )
}
