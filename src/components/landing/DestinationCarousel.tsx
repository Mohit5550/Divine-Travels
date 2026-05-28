'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useAppStore } from '@/lib/store'

const destinations = [
  {
    id: 'rishikesh',
    name: 'Rishikesh',
    image: 'https://picsum.photos/seed/rishikesh-fire/600/400',
    destinationId: '1',
  },
  {
    id: 'tehri',
    name: 'Tehri',
    image: 'https://picsum.photos/seed/tehri-paraglider/600/400',
    destinationId: '2',
  },
  {
    id: 'mussoorie',
    name: 'Mussoorie',
    image: 'https://picsum.photos/seed/mussoorie-valley/600/400',
    destinationId: '3',
  },
  {
    id: 'manali',
    name: 'Manali',
    image: 'https://picsum.photos/seed/manali-snow/600/400',
    destinationId: '4',
  },
]

export function DestinationCarousel() {
  const { navigate } = useAppStore()
  const [activeIndex, setActiveIndex] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  const scrollToIndex = (index: number) => {
    const newIndex = Math.max(0, Math.min(index, destinations.length - 1))
    setActiveIndex(newIndex)
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.children[0]?.clientWidth || 300
      const gap = 16
      scrollRef.current.scrollTo({
        left: newIndex * (cardWidth + gap),
        behavior: 'smooth',
      })
    }
  }

  const handlePrev = () => scrollToIndex(activeIndex - 1)
  const handleNext = () => scrollToIndex(activeIndex + 1)

  const handleScroll = () => {
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.children[0]?.clientWidth || 300
      const gap = 16
      const scrollPos = scrollRef.current.scrollLeft
      const newIndex = Math.round(scrollPos / (cardWidth + gap))
      setActiveIndex(Math.max(0, Math.min(newIndex, destinations.length - 1)))
    }
  }

  return (
    <section id="destinations" className="py-12 sm:py-16 bg-brand-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-10"
        >
          <h2 className="font-bold text-2xl sm:text-3xl md:text-4xl text-brand-dark">
            Explore India&apos;s Best Destinations
          </h2>
        </motion.div>

        {/* Carousel */}
        <div className="relative">
          {/* Left arrow */}
          <button
            onClick={handlePrev}
            disabled={activeIndex === 0}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5 text-brand-dark" />
          </button>

          {/* Cards */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex gap-4 overflow-x-auto hide-scrollbar scroll-smooth snap-x snap-mandatory px-6"
          >
            {destinations.map((dest, index) => (
              <motion.div
                key={dest.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="shrink-0 w-[calc(50%-8px)] sm:w-[calc(33.333%-11px)] lg:w-[calc(25%-12px)] snap-start cursor-pointer group"
                onClick={() => navigate('destination-detail', dest.destinationId)}
              >
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-md">
                  <img
                    src={dest.image}
                    alt={dest.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  {/* Name */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-bold text-lg sm:text-xl">{dest.name}</h3>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Right arrow */}
          <button
            onClick={handleNext}
            disabled={activeIndex >= destinations.length - 1}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5 text-brand-dark" />
          </button>
        </div>

        {/* Dots */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {destinations.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToIndex(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                activeIndex === index
                  ? 'bg-brand-orange w-6'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
