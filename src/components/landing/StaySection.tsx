'use client'

import { motion } from 'framer-motion'
import { Hotel, Tent, ArrowRight, Mountain, TreePine, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'

const fadeIn = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' },
}

const HOTEL_IMG = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1600'
const CAMP_IMG = 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?q=80&w=1600'

export function StaySection() {
  const { navigate } = useAppStore()

  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-cream via-white to-brand-cream" />
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 left-1/4 w-72 h-72 bg-brand-orange/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-brand-teal/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1.5s' }} />
      </div>

      {/* Decorative blurs */}
      <div className="absolute top-20 left-[8%] text-brand-orange/10"><Mountain className="w-14 h-14" /></div>
      <div className="absolute bottom-20 right-[10%] text-brand-teal/10"><TreePine className="w-12 h-12" /></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div {...fadeIn} className="text-center mb-14 sm:mb-16">
          <span className="inline-flex items-center gap-2 text-brand-orange text-sm font-semibold tracking-widest uppercase bg-brand-orange/5 px-5 py-1.5 rounded-full border border-brand-orange/10 mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Comfort & Adventure
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl text-brand-dark mt-2">
            Where to <span className="text-brand-orange">Stay</span>
          </h2>
        </motion.div>

        {/* Two cards side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10">
          {/* Hotel card */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            className="group cursor-pointer"
            onClick={() => navigate('hotel-packages')}
          >
            <div className="relative h-80 sm:h-96 rounded-[28px] overflow-hidden bg-brand-dark shadow-xl">
              {/* Background image - img tag loads Google Drive reliably */}
              <img
                src={HOTEL_IMG}
                alt="Hotels in Rishikesh"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="eager"
              />
              {/* Gradient overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />
              <div className="absolute inset-0 bg-gradient-to-br from-brand-orange/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-8 sm:p-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <Hotel className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-white/80 text-xs font-semibold tracking-wider uppercase">Hotel</span>
                </div>
                <h3 className="text-white font-bold text-3xl sm:text-4xl mb-2 drop-shadow-lg">Hotels & Resorts</h3>
                <p className="text-white/80 text-sm sm:text-base mb-6 max-w-xs drop-shadow-md">
                  Comfortable riverside stays with premium amenities and breathtaking views
                </p>
                <Button className="w-fit bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border border-white/20 rounded-full px-6 h-11 transition-all group-hover:scale-105 group-hover:bg-white/30">
                  Explore Hotels <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Camping card */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            className="group cursor-pointer"
            onClick={() => navigate('camping-packages')}
          >
            <div className="relative h-80 sm:h-96 rounded-[28px] overflow-hidden bg-brand-dark shadow-xl">
              <img
                src={CAMP_IMG}
                alt="Camping in Rishikesh"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />
              <div className="absolute inset-0 bg-gradient-to-br from-brand-teal/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="absolute inset-0 flex flex-col justify-end p-8 sm:p-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <Tent className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-white/80 text-xs font-semibold tracking-wider uppercase">Camping</span>
                </div>
                <h3 className="text-white font-bold text-3xl sm:text-4xl mb-2 drop-shadow-lg">Camping</h3>
                <p className="text-white/80 text-sm sm:text-base mb-6 max-w-xs drop-shadow-md">
                  Bonfire, river views, starry nights — an unforgettable outdoor experience
                </p>
                <Button className="w-fit bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border border-white/20 rounded-full px-6 h-11 transition-all group-hover:scale-105 group-hover:bg-white/30">
                  Explore Camping <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
