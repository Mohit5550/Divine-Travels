'use client'

import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { useAppStore } from '@/lib/store'
import { Loader2, Building2 } from 'lucide-react'

interface Company {
  id: string
  name: string
  slug: string
  logo: string | null
  photo: string | null
  _count?: { plans: number }
}

export function CompanySection() {
  const { navigate } = useAppStore()

  const { data: companies = [], isLoading } = useQuery({
    queryKey: ['landing-companies'],
    queryFn: async () => {
      const res = await fetch('/api/companies')
      if (!res.ok) return []
      const data = await res.json()
      return data as Company[]
    },
    staleTime: 60000,
  })

  const handleClick = (slug: string) => {
    navigate('company-detail', null, slug)
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
        ) : companies.length === 0 ? null : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 max-w-5xl mx-auto">
            {companies.map((company, index) => {
              const isLast = index === companies.length - 1
              const isOdd = companies.length % 2 === 1
              return (
                <motion.div
                  key={company.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -4 }}
                  className={`cursor-pointer group ${isLast && isOdd ? 'sm:col-span-2 lg:col-span-1 sm:max-w-[50%] sm:mx-auto lg:max-w-none lg:mx-0' : ''}`}
                  onClick={() => handleClick(company.slug)}
                >
                  <div className="relative aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden shadow-md">
                    {company.photo ? (
                      <img
                        src={company.photo}
                        alt={company.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-brand-dark/60 flex items-center justify-center">
                        <Building2 className="w-12 h-12 text-white/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                      <div className="flex items-center gap-3">
                        {company.logo && (
                          <img src={company.logo} alt="" className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-white/10 object-contain p-1" />
                        )}
                        <div>
                          <h3 className="text-white font-bold text-base sm:text-lg leading-tight">{company.name}</h3>
                          {company._count?.plans != null && (
                            <p className="text-white/50 text-xs">{company._count.plans} {company._count.plans === 1 ? 'activity' : 'activities'}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="bg-white/90 text-brand-dark rounded-full px-5 py-2 text-xs sm:text-sm font-semibold shadow-lg">
                        Explore Plans
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
