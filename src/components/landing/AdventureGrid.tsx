'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'

const adventures = [
  { id: 'campfire', name: 'Fire Performance', image: 'https://picsum.photos/seed/campfire-night/400/400', action: 'landing' },
  { id: 'rafting', name: 'River Rafting', image: 'https://picsum.photos/seed/river-rafting/400/400', action: 'rafting-packages' },
  { id: 'hotels', name: 'Hotels / Stays', image: 'https://picsum.photos/seed/hotel-stay/400/400', action: 'landing' },
  { id: 'balloon', name: 'Hot Air Balloon', image: 'https://picsum.photos/seed/hot-air-balloon/400/400', action: 'landing' },
  { id: 'paragliding', name: 'Paragliding', image: 'https://picsum.photos/seed/paragliding-sky/400/400', action: 'landing' },
  { id: 'beach', name: 'Beach Camping', image: 'https://picsum.photos/seed/beach-camp/400/400', action: 'landing' },
  { id: 'kayaking', name: 'Kayaking', image: 'https://picsum.photos/seed/kayaking-water/400/400', action: 'landing' },
  { id: 'camping', name: 'Camping', image: 'https://picsum.photos/seed/camping-tents/400/400', action: 'landing' },
  { id: 'biking', name: 'Mountain Biking', image: 'https://picsum.photos/seed/mountain-biking/400/400', action: 'landing' },
  { id: 'bungee', name: 'Bungee Jumping', image: 'https://picsum.photos/seed/bungee-jump/400/400', action: 'landing' },
  { id: 'climbing', name: 'Rock Climbing', image: 'https://picsum.photos/seed/rock-climbing/400/400', action: 'landing' },
  { id: 'zipline', name: 'Zip Line', image: 'https://picsum.photos/seed/zipline-adventure/400/400', action: 'landing' },
]

export function AdventureGrid() {
  const { navigate } = useAppStore()

  const handleCardClick = (action: string) => {
    if (action === 'rafting-packages') {
      navigate('rafting-packages')
    } else {
      navigate(action)
    }
  }

  return (
    <section className="py-12 sm:py-16 bg-brand-teal/90 relative overflow-hidden">
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full" style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-10"
        >
          <h2 className="font-bold text-2xl sm:text-3xl md:text-4xl text-white">
            Choose Your Adventure
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {adventures.map((adventure, index) => (
            <motion.div
              key={adventure.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -4 }}
              className="cursor-pointer group"
              onClick={() => handleCardClick(adventure.action)}
            >
              <div className="relative aspect-square rounded-xl sm:rounded-2xl overflow-hidden shadow-md">
                <img
                  src={adventure.image}
                  alt={adventure.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Name at bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                  <h3 className="text-white font-bold text-sm sm:text-base">{adventure.name}</h3>
                </div>

                {/* Book Now button - appears on hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button
                    size="sm"
                    className="bg-brand-orange hover:bg-brand-orange/90 text-white rounded-full px-4 sm:px-6 text-xs sm:text-sm font-medium shadow-lg"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCardClick(adventure.action)
                    }}
                  >
                    Book Now
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
