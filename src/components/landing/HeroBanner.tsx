'use client'

import { motion } from 'framer-motion'
import { Play, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function HeroBanner() {
  return (
    <section className="relative h-[85vh] sm:h-[90vh] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://picsum.photos/seed/divine-mountain-paraglide/1600/900"
          alt="Divine Travel - Explore Sacred Destinations"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/70 via-brand-dark/40 to-brand-cream" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
            <MapPin className="w-4 h-4 text-brand-orange" />
            <span className="text-white/90 text-sm font-medium">Uttarakhand, India</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl text-white mb-4 sm:mb-6 leading-tight">
            Discover the <span className="text-brand-orange">Divine</span><br />
            Beauty of Uttarakhand
          </h1>

          <p className="text-white/80 text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed">
            From sacred pilgrimages to thrilling adventures, explore the land of gods
            with curated travel experiences that touch your soul.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="bg-brand-orange hover:bg-brand-orange/90 text-white rounded-full px-8 h-12 text-base"
              onClick={() => {
                const el = document.getElementById('destinations')
                el?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              Explore Destinations
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 rounded-full px-8 h-12 text-base"
            >
              <Play className="w-4 h-4 mr-2" />
              Watch Video
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="absolute bottom-8 sm:bottom-12 left-0 right-0"
        >
          <div className="max-w-4xl mx-auto px-4 grid grid-cols-3 gap-4 sm:gap-8">
            {[
              { value: '50+', label: 'Destinations' },
              { value: '10K+', label: 'Happy Travelers' },
              { value: '4.9', label: 'Avg. Rating' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-serif text-2xl sm:text-4xl text-white">{stat.value}</div>
                <div className="text-white/60 text-xs sm:text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
