'use client'

import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'

const testimonials = [
  {
    name: 'Priya Sharma',
    location: 'Delhi, India',
    avatar: '👩',
    rating: 5,
    comment: 'Divine Travel made our Char Dham Yatra absolutely seamless! The arrangements were perfect, and the spiritual experience was beyond words. Highly recommended for anyone seeking a divine journey.',
    destination: 'Char Dham Yatra',
  },
  {
    name: 'Amit Verma',
    location: 'Mumbai, India',
    avatar: '👨',
    rating: 5,
    comment: 'The rafting experience in Rishikesh was incredible! Divine Travel ensured everything was safe and thrilling at the same time. The team was professional and the pricing was very reasonable.',
    destination: 'Rishikesh Adventure',
  },
  {
    name: 'Sneha Gupta',
    location: 'Bangalore, India',
    avatar: '👩‍💼',
    rating: 4,
    comment: 'Our family trip to Mussoorie was magical! The hotel was beautiful, the views were breathtaking, and the entire trip was well-organized. Will definitely book again with Divine Travel.',
    destination: 'Mussoorie Retreat',
  },
]

export function Testimonials() {
  return (
    <section className="py-16 sm:py-20 bg-brand-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-14"
        >
          <span className="text-brand-orange text-sm font-semibold tracking-wider uppercase">
            Testimonials
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-brand-dark mt-2">
            What Our Travelers Say
          </h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            Real experiences from real travelers who explored with us
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-lg transition-shadow duration-300 relative"
            >
              <Quote className="absolute top-4 right-4 w-8 h-8 text-brand-orange/10" />

              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < testimonial.rating
                        ? 'fill-brand-gold text-brand-gold'
                        : 'text-gray-200'
                    }`}
                  />
                ))}
              </div>

              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                &ldquo;{testimonial.comment}&rdquo;
              </p>

              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <div className="w-10 h-10 rounded-full bg-brand-orange/10 flex items-center justify-center text-lg">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-sm text-brand-dark">{testimonial.name}</div>
                  <div className="text-xs text-muted-foreground">{testimonial.location}</div>
                </div>
              </div>

              <div className="mt-3 inline-flex items-center bg-brand-orange/10 text-brand-orange text-xs px-2 py-1 rounded-full">
                {testimonial.destination}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
