'use client'

import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'
import { Loader2 } from 'lucide-react'

const companyMap: Record<string, string> = {
  'indias-highest-bungy': 'Himalayan Bungy',
  'free-style-bungy': 'Himalayan Bungy',
  'giant-swing-113': 'Hikers Adventure Park',
  'premium-giant-swing-140': 'Hikers Adventure Park',
  'bungee-180-feet': 'Thrill Factory',
  'splash-bungee-180': 'Thrill Factory',
  'free-style-bungee-160': 'Thrill Factory',
  'couple-bungee-jump': 'Thrill Factory',
  'rope-bungee-160': 'Thrill Factory',
  'quick-jump-rishikesh': 'Thrill Factory',
  'reverse-bungee-india': 'Thrill Factory',
  'zipline-across-ganga': 'Thrill Factory',
  'rope-course-rishikesh': 'Thrill Factory',
  'go-kart-rishikesh': 'Hikers Adventure Park',
  'sky-roller-rishikesh': 'Hikers Adventure Park',
  'roller-coaster-zipline': 'Hikers Adventure Park',
  'flyboard-jetovator-tehri': 'Tehri Lake Adventure Sports',
  'speed-boat-tehri': 'Tehri Lake Adventure Sports',
  'bumper-ride-tehri': 'Tehri Lake Adventure Sports',
  'banana-ride-tehri': 'Tehri Lake Adventure Sports',
  'water-surfing-tehri': 'Tehri Lake Adventure Sports',
  'jet-ski-tehri': 'Tehri Lake Adventure Sports',
  'parasailing-tehri': 'Tehri Lake Adventure Sports',
  'lake-view-paragliding': 'Tehri Lake Paragliding',
  'rishikesh-paragliding': 'Why Not Fly',
  'flying-fox-rishikesh': 'Jumping Heights',
}

export function AdventureGrid() {
  const { navigate } = useAppStore()

  const { data: adventurePkgs = [], isLoading } = useQuery({
    queryKey: ['adventure-packages-home'],
    queryFn: async () => {
      const res = await fetch('/api/packages?category=adventure')
      const data = await res.json()
      return data.slice(0, 12)
    },
    staleTime: 60000,
  })

  const handleCardClick = (pkg: any) => {
    if (pkg.id) {
      navigate('package-detail', null, pkg.id)
    } else if (pkg.action) {
      navigate(pkg.action)
    }
  }

  const displayItems = adventurePkgs.map((p: any) => ({
    id: p.id,
    name: p.name,
    company: companyMap[p.slug] || '',
    image: p.image,
    price: p.price,
    originalPrice: p.originalPrice,
    location: p.location,
    tagline: p.tagline,
  }))

  return (
    <section className="py-12 sm:py-16 bg-brand-teal/90 relative overflow-hidden">
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
          <span className="text-white/80 text-sm font-semibold tracking-wider uppercase">Thrill & Fun</span>
          <h2 className="font-bold text-2xl sm:text-3xl md:text-4xl text-white mt-1">
            Choose Your Adventure
          </h2>
          <p className="text-white/60 mt-2 max-w-xl mx-auto">From bungee jumping to water sports — pick your thrill</p>
        </motion.div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {displayItems.map((item: any, index: number) => (
              <motion.div
                key={item.id || index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4 }}
                className="cursor-pointer group"
                onClick={() => handleCardClick(item)}
              >
                <div className="relative aspect-square rounded-xl sm:rounded-2xl overflow-hidden shadow-md">
                  <img
                    src={item.image}
                    alt={item.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                    <h3 className="text-white font-bold text-sm sm:text-base">
                      {item.name}
                      {item.company && (
                        <span className="block text-red-400 text-[11px] sm:text-xs mt-0.5 font-semibold">
                          ({item.company})
                        </span>
                      )}
                    </h3>
                    {item.tagline && (
                      <p className="text-white/60 text-xs mt-0.5 hidden sm:block truncate">{item.tagline}</p>
                    )}
                    {item.price && (
                      <p className="text-brand-orange font-bold text-xs sm:text-sm mt-1">
                        {item.originalPrice != null && item.originalPrice > item.price ? (
                          <>
                            <span className="line-through text-white/60 text-[10px]">₹{item.originalPrice}</span>
                            {' '}₹{item.price}
                            <span className="text-emerald-300 text-[10px] font-semibold ml-1">Save ₹{item.originalPrice - item.price}</span>
                          </>
                        ) : (
                          <>₹{item.price}</>
                        )}
                      </p>
                    )}
                    {item.location && (
                      <p className="text-white/50 text-[10px] mt-0.5">{item.location}</p>
                    )}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button
                      size="sm"
                      className="bg-brand-orange hover:bg-brand-orange/90 text-white rounded-full px-4 sm:px-6 text-xs sm:text-sm font-medium shadow-lg"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCardClick(item)
                      }}
                    >
                      Book Now
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
