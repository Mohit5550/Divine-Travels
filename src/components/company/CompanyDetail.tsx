'use client'

import { useAppStore } from '@/lib/store'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Building2,
  ChevronLeft,
  Clock,
  Tag,
  Check,
  Loader2,
  ArrowLeft,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/landing/Navbar'
import { ActivityBar } from '@/components/landing/ActivityBar'
import { Footer } from '@/components/landing/Footer'

interface CompanyPlan {
  id: string
  name: string
  description: string | null
  price: number | null
  image: string | null
  category: string | null
  duration: string | null
  highlights: string | null
}

interface Company {
  id: string
  name: string
  slug: string
  logo: string | null
  description: string | null
  website: string | null
  plans: CompanyPlan[]
}

const categoryIcons: Record<string, string> = {
  Bungee: '🪢',
  Swing: '🎯',
  'Go Karting': '🏎️',
  Zipline: '🪢',
  'Water Sports': '🌊',
  Parasailing: '🪂',
  Paragliding: '🪂',
  'Flying Fox': '🦊',
  Roller: '🎢',
  Jump: '⬇️',
  Rope: '🧗',
}

export function CompanyDetail() {
  const { navigate, selectedPackageId } = useAppStore()
  const slug = selectedPackageId || ''

  const { data: company, isLoading } = useQuery({
    queryKey: ['company-detail', slug],
    queryFn: async () => {
      const res = await fetch(`/api/companies/by-slug/${slug}`)
      if (!res.ok) throw new Error('Company not found')
      return res.json() as Promise<Company>
    },
    enabled: !!slug,
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-cream">
        <Navbar />
        <ActivityBar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-6 h-6 animate-spin text-brand-orange" />
        </div>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-brand-cream">
        <Navbar />
        <ActivityBar />
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <div className="text-center">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h2 className="font-serif text-2xl text-brand-dark mb-2">Company not found</h2>
            <Button onClick={() => navigate('landing')} variant="outline">Go Home</Button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const groupedPlans: Record<string, CompanyPlan[]> = {}
  for (const plan of company.plans) {
    const cat = plan.category || 'Other'
    if (!groupedPlans[cat]) groupedPlans[cat] = []
    groupedPlans[cat].push(plan)
  }

  return (
    <div className="min-h-screen bg-brand-cream">
      <Navbar />
      <ActivityBar />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-brand-dark via-brand-dark/95 to-brand-dark/90 py-16 sm:py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-brand-orange blur-3xl" />
          <div className="absolute bottom-10 right-10 w-32 h-32 rounded-full bg-brand-gold blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <button
              onClick={() => navigate('landing')}
              className="inline-flex items-center gap-1 text-white/50 hover:text-white text-sm mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </button>
            <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-orange/20 flex items-center justify-center mb-4">
              {company.logo ? (
                <img src={company.logo} alt={company.name} className="w-10 h-10 object-contain" />
              ) : (
                <Building2 className="w-8 h-8 text-brand-orange" />
              )}
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-white mb-3">{company.name}</h1>
            {company.description && (
              <p className="text-white/60 text-base max-w-xl mx-auto">{company.description}</p>
            )}
            <div className="inline-flex items-center gap-2 mt-4 text-white/40 text-sm">
              <Tag className="w-4 h-4" />
              {company.plans.length} {company.plans.length === 1 ? 'Plan' : 'Plans'} Available
            </div>
          </motion.div>
        </div>
      </section>

      {/* Plans by Category */}
      <section className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
        {Object.entries(groupedPlans).map(([category, plans]) => (
          <div key={category} className="mb-10">
            <h2 className="font-serif text-xl sm:text-2xl text-brand-dark mb-4 flex items-center gap-2">
              {categoryIcons[category] || '🎯'} {category}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {plans.map((plan, i) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-brand-orange/30 transition-all duration-300"
                >
                  {plan.image && (
                    <img src={plan.image} alt={plan.name} className="w-full h-36 object-cover rounded-lg mb-3" />
                  )}
                  <h3 className="font-semibold text-brand-dark">{plan.name}</h3>
                  {plan.description && (
                    <p className="text-xs text-gray-500 mt-1">{plan.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    {plan.duration && (
                      <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        <Clock className="w-3 h-3" /> {plan.duration}
                      </span>
                    )}
                    {plan.price && (
                      <span className="inline-flex items-center gap-1 text-xs bg-brand-orange/10 text-brand-orange font-medium px-2 py-1 rounded-full">
                        ₹{plan.price}
                      </span>
                    )}
                  </div>
                  {plan.highlights && (() => {
                    try {
                      const highlights = JSON.parse(plan.highlights)
                      if (Array.isArray(highlights) && highlights.length > 0) {
                        return (
                          <div className="mt-3 pt-3 border-t border-gray-100 space-y-1">
                            {highlights.slice(0, 3).map((h: string, j: number) => (
                              <p key={j} className="flex items-center gap-1.5 text-xs text-gray-500">
                                <Check className="w-3 h-3 text-green-500 flex-shrink-0" /> {h}
                              </p>
                            ))}
                          </div>
                        )
                      }
                    } catch {}
                    return null
                  })()}
                </motion.div>
              ))}
            </div>
          </div>
        ))}

        {company.plans.length === 0 && (
          <div className="text-center py-16">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No plans available for this company yet</p>
          </div>
        )}
      </section>

      <Footer />
    </div>
  )
}
