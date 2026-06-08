'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { Building2, ChevronRight, Loader2 } from 'lucide-react'

interface Company {
  id: string
  name: string
  slug: string
  logo: string | null
  description: string | null
  _count: { plans: number }
}

export function CompanySection() {
  const { navigate } = useAppStore()

  const { data: companies = [], isLoading } = useQuery({
    queryKey: ['landing-companies'],
    queryFn: async () => {
      const res = await fetch('/api/companies')
      if (!res.ok) return []
      return res.json() as Promise<Company[]>
    },
  })

  if (isLoading) {
    return (
      <section className="py-16 sm:py-20 bg-brand-cream">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <Loader2 className="w-6 h-6 animate-spin text-brand-orange mx-auto" />
        </div>
      </section>
    )
  }

  if (companies.length === 0) return null

  const brandColors = [
    'from-brand-orange/20 to-brand-orange/5 border-brand-orange/20',
    'from-brand-teal/20 to-brand-teal/5 border-brand-teal/20',
    'from-brand-gold/20 to-brand-gold/5 border-brand-gold/20',
    'from-purple-500/20 to-purple-500/5 border-purple-500/20',
    'from-blue-500/20 to-blue-500/5 border-blue-500/20',
    'from-pink-500/20 to-pink-500/5 border-pink-500/20',
    'from-green-500/20 to-green-500/5 border-green-500/20',
  ]

  return (
    <section className="py-16 sm:py-20 bg-brand-cream">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-brand-orange text-sm font-semibold tracking-wider uppercase">
            Thrill & Fun
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-brand-dark mt-2">
            Choose Your Adventure
          </h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            From bungee jumping to water sports — pick your thrill now
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {companies.map((company, i) => (
            <motion.button
              key={company.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate('company-detail', null, company.slug)}
              className={`group relative bg-white rounded-2xl border-2 ${brandColors[i % brandColors.length]} p-5 sm:p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
            >
              <div className={`w-14 h-14 mx-auto rounded-xl bg-gradient-to-br ${brandColors[i % brandColors.length]} flex items-center justify-center mb-3`}>
                {company.logo ? (
                  <img src={company.logo} alt={company.name} className="w-10 h-10 object-contain" />
                ) : (
                  <Building2 className="w-6 h-6 text-brand-orange" />
                )}
              </div>
              <h3 className="font-semibold text-brand-dark text-sm sm:text-base leading-tight">{company.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">{company._count?.plans || 0} {company._count?.plans === 1 ? 'plan' : 'plans'}</p>
              <div className="mt-3 inline-flex items-center gap-1 text-brand-orange text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                View Plans <ChevronRight className="w-3 h-3" />
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  )
}
