'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Building2,
  ArrowLeft,
  Loader2,
  Clock,
  Tag,
  MapPin,
  Eye,
  ChevronRight,
} from 'lucide-react'
import { Navbar } from '@/components/landing/Navbar'
import { ActivityBar } from '@/components/landing/ActivityBar'
import { Footer } from '@/components/landing/Footer'
import { BackButton } from '@/components/ui/BackButton'
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd'
import { applyDetailSeo, SITE_URL } from '@/lib/seo'

interface PlanPackage {
  id: string
  name: string
  image: string
  price: number | null
  originalPrice: number | null
  slug: string
  location: string | null
}

interface Plan {
  id: string
  name: string
  description: string | null
  price: number | null
  image: string | null
  category: string | null
  duration: string | null
  highlights: string | null
  packageSlug: string | null
  package: PlanPackage | null
}

interface Company {
  id: string
  name: string
  slug: string
  logo: string | null
  photo: string | null
  description: string | null
  plans: Plan[]
}

const categoryIcons: Record<string, string> = {
  Bungee: '🪢',
  Swing: '🎯',
  'Water Sports': '🌊',
  Parasailing: '🪂',
  Paragliding: '🪂',
  'Flying Fox': '🦊',
  Roller: '🎢',
  Jump: '⬇️',
  Rope: '🧗',
  'Go Karting': '🏎️',
  Zipline: '🪢',
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

  const handlePlanClick = (plan: Plan) => {
    if (plan.package?.id) {
      navigate('package-detail', null, plan.package.slug || plan.package.id)
    }
  }

  const handleBookNow = (e: React.MouseEvent, plan: Plan) => {
    e.stopPropagation()
    if (plan.package?.id) {
      navigate('package-booking', null, plan.package.id)
    }
  }

  // Per-company SEO: unique title/description once data loads.
  useEffect(() => {
    if (!company) return
    applyDetailSeo({
      title: `${company.name} - Adventure Partner`,
      desc: (company.description || '').slice(0, 160),
      path: `/company/${company.slug}`,
    })
  }, [company])

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
            <button onClick={() => navigate('landing')} className="text-brand-orange hover:underline text-sm">Go Home</button>
          </div>
        </div>
      </div>
    )
  }

  const grouped: Record<string, Plan[]> = {}
  for (const plan of company.plans) {
    const cat = plan.category || 'Other'
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push(plan)
  }

  return (
    <div className="min-h-screen bg-brand-cream">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', url: SITE_URL },
          { name: company.name, url: `${SITE_URL}/company/${company.slug}` },
        ]}
      />
      <Navbar />
      <ActivityBar />

      <section className="relative bg-gradient-to-br from-brand-dark via-brand-dark/95 to-brand-dark/90 py-12 sm:py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-brand-orange blur-3xl" />
          <div className="absolute bottom-10 right-10 w-32 h-32 rounded-full bg-brand-gold blur-3xl" />
        </div>
        <div className="relative max-w-5xl mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <BackButton className="mb-4 text-white/50 hover:text-white" />
            <div className="flex items-center gap-4">
              {company.logo && (
                <img src={company.logo} alt="" className="w-12 h-12 rounded-xl bg-white/10 object-contain p-1" />
              )}
              <div>
                <h1 className="font-bold text-2xl sm:text-3xl md:text-4xl text-white tracking-tight">{company.name}</h1>
                {company.description && (
                  <p className="text-white/70 text-sm mt-1 max-w-xl">{company.description}</p>
                )}
              </div>
            </div>
            <div className="inline-flex items-center gap-2 mt-3 text-white/60 text-sm">
              <Tag className="w-4 h-4" />
              {company.plans.length} {company.plans.length === 1 ? 'Activity' : 'Activities'} Available
            </div>
          </motion.div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-10 sm:py-14">
        {Object.entries(grouped).map(([category, plans]) => (
          <div key={category} className="mb-10">
            <h2 className="font-bold text-xl sm:text-2xl text-brand-dark mb-5 flex items-center gap-2 tracking-tight">
              {categoryIcons[category] || '🎯'} {category}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {plans.map((plan, i) => {
                const pkg = plan.package
                const hasImage = pkg?.image
                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.04 }}
                    whileHover={{ y: -4 }}
                    className={`rounded-xl sm:rounded-2xl overflow-hidden shadow-md border border-gray-200 bg-white transition-all duration-300 ${
                      pkg ? 'cursor-pointer hover:shadow-xl hover:border-brand-orange/30' : ''
                    }`}
                    onClick={() => handlePlanClick(plan)}
                  >
                    {hasImage ? (
                      <div className="relative aspect-[16/9] overflow-hidden">
                        <img
                          src={pkg!.image}
                          alt={plan.name}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        {pkg?.price && (
                          <div className="absolute top-3 right-3 bg-brand-orange text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
                            ₹{pkg.price}
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <h3 className="text-white font-bold text-sm sm:text-base leading-tight">{plan.name}</h3>
                          {pkg?.location && (
                            <p className="text-white/70 text-xs mt-0.5 flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {pkg.location}
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 sm:p-5">
                        <h3 className="font-semibold text-brand-dark text-sm sm:text-base">{plan.name}</h3>
                        {plan.description && (
                          <p className="text-xs text-gray-500 mt-1">{plan.description}</p>
                        )}
                      </div>
                    )}

                    <div className="p-3 sm:p-4">
                      <div className="flex items-center gap-2 mb-2">
                        {plan.duration && (
                          <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                            <Clock className="w-3 h-3" /> {plan.duration}
                          </span>
                        )}
                      </div>
                      {pkg && (
                        <>
                          <div className="flex items-baseline gap-2 mb-1">
                            {pkg.originalPrice && pkg.originalPrice > (pkg.price ?? 0) && (
                              <span className="text-gray-400 line-through text-sm">₹{pkg.originalPrice}</span>
                            )}
                            <span className="text-lg font-bold text-brand-dark">₹{pkg.price ?? 0}</span>
                          </div>
                          {pkg.originalPrice && pkg.originalPrice > (pkg.price ?? 0) && (
                            <p className="text-green-600 text-xs font-medium mb-0.5">Save ₹{pkg.originalPrice - (pkg.price ?? 0)}</p>
                          )}
                          <p className="text-gray-400 text-xs mb-3">/ Person</p>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); handlePlanClick(plan) }}
                              className="flex-1 flex items-center justify-center gap-1.5 text-sm font-medium text-brand-orange border border-brand-orange/30 rounded-xl py-2 hover:bg-brand-orange/5 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                              Details
                            </button>
                            <button
                              onClick={(e) => handleBookNow(e, plan)}
                              className="flex-1 flex items-center justify-center gap-1.5 text-sm font-semibold text-white bg-brand-teal rounded-xl py-2 hover:bg-brand-teal/90 transition-colors"
                            >
                              Book
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>

                    {plan.highlights && (() => {
                      try {
                        const highlights = JSON.parse(plan.highlights)
                        if (Array.isArray(highlights) && highlights.length > 0) {
                          return (
                            <div className="px-4 pb-4 flex flex-wrap gap-1.5">
                              {highlights.slice(0, 3).map((h: string, j: number) => (
                                <span key={j} className="text-[11px] bg-brand-orange/10 text-brand-orange px-2 py-0.5 rounded-full">
                                  {h}
                                </span>
                              ))}
                            </div>
                          )
                        }
                      } catch {}
                      return null
                    })()}
                  </motion.div>
                )
              })}
            </div>
          </div>
        ))}

        {company.plans.length === 0 && (
          <div className="text-center py-16">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No activities available yet</p>
          </div>
        )}
      </section>

      <Footer />
    </div>
  )
}
