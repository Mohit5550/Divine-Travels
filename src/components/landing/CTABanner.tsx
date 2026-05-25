'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'

export function CTABanner() {
  const { navigate, isAuthenticated } = useAppStore()

  return (
    <section className="py-16 sm:py-20 bg-gradient-to-r from-brand-dark via-brand-navy to-brand-dark relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-brand-orange blur-3xl" />
        <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-brand-gold blur-3xl" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 bg-brand-orange/20 rounded-full px-4 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-brand-orange" />
            <span className="text-brand-orange text-sm font-medium">Limited Time Offer</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-white mb-4">
            Start Your Divine Journey <span className="text-brand-orange">Today</span>
          </h2>
          <p className="text-white/70 text-base sm:text-lg max-w-2xl mx-auto mb-8">
            Book now and get up to 20% off on your first trip. Experience the magic of
            Uttarakhand with our exclusive travel packages.
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
              Book Now <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            {!isAuthenticated && (
              <Button
                variant="outline"
                size="lg"
                className="border-white/30 text-white hover:bg-white/10 rounded-full px-8 h-12 text-base"
                onClick={() => navigate('login')}
              >
                Create Account
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
