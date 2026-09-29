'use client'

import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { useAppStore } from '@/lib/store'
import { Loader2, Building2, Sparkles, ShieldCheck, ArrowRight, Compass, Flame } from 'lucide-react'
import { toDirectImageUrl } from '@/lib/utils'

interface Company {
  id: string
  name: string
  slug: string
  logo: string | null
  photo: string | null
  description?: string | null
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

  if (isLoading) {
    return (
      <section className="py-16 bg-gradient-to-b from-brand-dark via-slate-900 to-brand-dark">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <Loader2 className="w-8 h-8 text-brand-orange animate-spin mx-auto" />
        </div>
      </section>
    )
  }

  if (companies.length === 0) return null

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-slate-950 via-brand-dark to-slate-950 text-white relative overflow-hidden">
      {/* Background ambient lighting effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-orange/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-teal/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 sm:mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-brand-orange/15 border border-brand-orange/30 rounded-full px-4 py-1.5 mb-3.5 backdrop-blur-md">
            <Flame className="w-4 h-4 text-brand-orange animate-pulse" />
            <span className="text-brand-orange text-xs font-bold tracking-wider uppercase">
              Top Adventure Companies & Hubs
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Explore Certified{' '}
            <span className="bg-gradient-to-r from-brand-orange via-amber-400 to-brand-gold bg-clip-text text-transparent">
              Adventure Operators
            </span>
          </h2>

          <p className="text-gray-400 mt-3 max-w-2xl mx-auto text-xs sm:text-base leading-relaxed">
            Directly book Bungy Jumping, River Expeditions, Giant Swing & Luxury Riverside Camps from licensed Uttarakhand organizers.
          </p>
        </motion.div>

        {/* Companies Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
          {companies.map((company, index) => {
            const planCount = company._count?.plans || 0
            return (
              <motion.div
                key={company.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.4 }}
                whileHover={{ y: -6 }}
                className="cursor-pointer group relative"
                onClick={() => handleClick(company.slug)}
              >
                <div className="relative aspect-[4/5] sm:aspect-[3/4] rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-900 border border-white/10 group-hover:border-brand-orange/60 shadow-xl group-hover:shadow-2xl group-hover:shadow-brand-orange/20 transition-all duration-500">
                  {/* Company Photo */}
                  {company.photo ? (
                    <img
                      src={toDirectImageUrl(company.photo)}
                      alt={company.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-brand-dark flex items-center justify-center">
                      <Building2 className="w-16 h-16 text-white/20" />
                    </div>
                  )}

                  {/* Gradient Overlay for Readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/10 transition-opacity duration-300" />

                  {/* Top Floating Badges */}
                  <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10">
                    <span className="inline-flex items-center gap-1 bg-black/60 backdrop-blur-md text-emerald-400 text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-full border border-emerald-500/30">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Verified</span>
                    </span>

                    {planCount > 0 && (
                      <span className="bg-brand-orange/90 backdrop-blur-md text-white text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md">
                        {planCount} {planCount === 1 ? 'Activity' : 'Activities'}
                      </span>
                    )}
                  </div>

                  {/* Bottom Content Card */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 lg:p-5 z-10">
                    {company.logo && (
                      <div className="w-10 h-10 rounded-xl bg-white/90 p-1 mb-2.5 backdrop-blur-sm shadow-md overflow-hidden flex items-center justify-center">
                        <img loading="lazy" decoding="async"
                          src={toDirectImageUrl(company.logo)}
                          alt=""
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}

                    <h3 className="text-white font-bold text-sm sm:text-base lg:text-lg leading-tight group-hover:text-amber-300 transition-colors">
                      {company.name}
                    </h3>

                    {company.description && (
                      <p className="hidden sm:block text-gray-300 text-xs mt-1.5 line-clamp-2 leading-relaxed opacity-90">
                        {company.description}
                      </p>
                    )}

                    {/* Action Bar on Hover */}
                    <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-brand-orange group-hover:text-white transition-colors">
                      <span>View All Packages</span>
                      <div className="w-6 h-6 rounded-full bg-white/10 group-hover:bg-brand-orange flex items-center justify-center transition-all group-hover:translate-x-1">
                        <ArrowRight className="w-3.5 h-3.5 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
