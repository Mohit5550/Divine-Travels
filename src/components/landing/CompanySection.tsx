'use client'

import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { useAppStore } from '@/lib/store'
import { Loader2 } from 'lucide-react'

const companyMap: Record<string, { name: string; slug: string }> = {
  'indias-highest-bungy': { name: 'Himalayan Bungy', slug: 'himalayan-bungy' },
  'free-style-bungy': { name: 'Himalayan Bungy', slug: 'himalayan-bungy' },
  'giant-swing-113': { name: 'Hikers Adventure Park', slug: 'hikers-adventure-park' },
  'premium-giant-swing-140': { name: 'Hikers Adventure Park', slug: 'hikers-adventure-park' },
  'bungee-180-feet': { name: 'Thrill Factory', slug: 'thrill-factory' },
  'splash-bungee-180': { name: 'Thrill Factory', slug: 'thrill-factory' },
  'free-style-bungee-160': { name: 'Thrill Factory', slug: 'thrill-factory' },
  'couple-bungee-jump': { name: 'Thrill Factory', slug: 'thrill-factory' },
  'rope-bungee-160': { name: 'Thrill Factory', slug: 'thrill-factory' },
  'quick-jump-rishikesh': { name: 'Thrill Factory', slug: 'thrill-factory' },
  'reverse-bungee-india': { name: 'Thrill Factory', slug: 'thrill-factory' },
  'zipline-across-ganga': { name: 'Thrill Factory', slug: 'thrill-factory' },
  'rope-course-rishikesh': { name: 'Thrill Factory', slug: 'thrill-factory' },
  'go-kart-rishikesh': { name: 'Hikers Adventure Park', slug: 'hikers-adventure-park' },
  'sky-roller-rishikesh': { name: 'Hikers Adventure Park', slug: 'hikers-adventure-park' },
  'roller-coaster-zipline': { name: 'Hikers Adventure Park', slug: 'hikers-adventure-park' },
  'flyboard-jetovator-tehri': { name: 'Tehri Lake Adventure Sports', slug: 'tehri-lake-adventure-sports' },
  'speed-boat-tehri': { name: 'Tehri Lake Adventure Sports', slug: 'tehri-lake-adventure-sports' },
  'bumper-ride-tehri': { name: 'Tehri Lake Adventure Sports', slug: 'tehri-lake-adventure-sports' },
  'banana-ride-tehri': { name: 'Tehri Lake Adventure Sports', slug: 'tehri-lake-adventure-sports' },
  'water-surfing-tehri': { name: 'Tehri Lake Adventure Sports', slug: 'tehri-lake-adventure-sports' },
  'jet-ski-tehri': { name: 'Tehri Lake Adventure Sports', slug: 'tehri-lake-adventure-sports' },
  'parasailing-tehri': { name: 'Tehri Lake Adventure Sports', slug: 'tehri-lake-adventure-sports' },
  'lake-view-paragliding': { name: 'Tehri Lake Paragliding', slug: 'tehri-lake-paragliding' },
  'rishikesh-paragliding': { name: 'Why Not Fly', slug: 'why-not-fly' },
  'flying-fox-rishikesh': { name: 'Jumping Heights', slug: 'jumping-heights' },
}

export function CompanySection() {
  const { navigate } = useAppStore()

  const { data: packages = [], isLoading } = useQuery({
    queryKey: ['adventure-packages-home'],
    queryFn: async () => {
      const res = await fetch('/api/packages?category=adventure')
      if (!res.ok) return []
      const data = await res.json()
      return data.slice(0, 20)
    },
    staleTime: 60000,
  })

  const handleCardClick = (pkg: any) => {
    const company = companyMap[pkg.slug]
    if (company?.slug) {
      navigate('company-detail', null, company.slug)
    }
  }

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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {packages.map((pkg: any, index: number) => {
              const company = companyMap[pkg.slug]
              return (
                <motion.div
                  key={pkg.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.03 }}
                  whileHover={{ y: -4 }}
                  className="cursor-pointer group"
                  onClick={() => handleCardClick(pkg)}
                >
                  <div className="relative aspect-[4/5] rounded-xl sm:rounded-2xl overflow-hidden shadow-md">
                    <img
                      src={pkg.image}
                      alt={pkg.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                      <h3 className="text-white font-bold text-sm sm:text-base leading-tight">
                        {pkg.name}
                      </h3>
                      {company && (
                        <span className="text-brand-orange text-[11px] sm:text-xs font-semibold">
                          {company.name}
                        </span>
                      )}
                      {pkg.location && (
                        <p className="text-white/50 text-[10px] sm:text-xs mt-0.5">{pkg.location}</p>
                      )}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="bg-white/90 text-brand-dark rounded-full px-5 py-2 text-xs sm:text-sm font-semibold shadow-lg">
                        View Details
                      </span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
