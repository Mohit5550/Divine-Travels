'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'

export function CTABanner() {
  const { navigate } = useAppStore()

  return (
    <section className="relative h-[50vh] sm:h-[60vh] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img loading="lazy" decoding="async"
          src="https://images.unsplash.com/photo-1472745942893-4b9f730c7668?w=1600&h=900&fit=crop"
          alt="Kayaking adventure on water"
          className="w-full h-full object-cover"
        />
        {/* Teal overlay */}
        <div className="absolute inset-0 bg-brand-teal/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl"
        >
          <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl text-white font-extrabold uppercase leading-tight mb-6 sm:mb-8">
            100% Refund If Cancelled Before 24 Hours
          </h2>

          <Button
            size="lg"
            className="bg-brand-teal hover:bg-brand-teal/90 text-white rounded-full px-8 sm:px-10 h-12 text-base sm:text-lg font-semibold shadow-lg border-2 border-white/20"
            onClick={() => {
              const el = document.getElementById('destinations')
              el?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            Book Now
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
