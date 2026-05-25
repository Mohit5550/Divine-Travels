'use client'

import { motion } from 'framer-motion'
import { Shield, Clock, Headphones, Star } from 'lucide-react'

const features = [
  {
    icon: Shield,
    title: 'Safe & Secure Travel',
    description: 'Your safety is our priority. Verified destinations, secure bookings, and 24/7 travel assistance.',
    color: 'bg-brand-orange/10 text-brand-orange',
  },
  {
    icon: Clock,
    title: 'Instant Booking',
    description: 'Book your dream destination in minutes. Instant confirmation and hassle-free travel planning.',
    color: 'bg-brand-teal/10 text-brand-teal',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'Our dedicated support team is always ready to assist you throughout your journey.',
    color: 'bg-brand-gold/10 text-brand-gold',
  },
  {
    icon: Star,
    title: 'Best Price Guarantee',
    description: 'Get the best deals on travel packages. We guarantee the most competitive prices.',
    color: 'bg-purple-500/10 text-purple-600',
  },
]

export function WhyChooseUs() {
  return (
    <section id="why-us" className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-14"
        >
          <span className="text-brand-orange text-sm font-semibold tracking-wider uppercase">
            Why Choose Us
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-brand-dark mt-2">
            Your Journey, Our Commitment
          </h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            We ensure every trip is memorable with our dedicated services and attention to detail
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="text-center p-6 sm:p-8 rounded-2xl bg-brand-cream/50 hover:shadow-lg transition-shadow duration-300"
              >
                <div className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center mx-auto mb-4`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-semibold text-brand-dark mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
