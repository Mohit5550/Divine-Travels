'use client'

import { ShieldCheck, Tag, CalendarSync, HeartHandshake } from 'lucide-react'

export function TrustGuarantee() {
  const guarantees = [
    {
      icon: ShieldCheck,
      title: 'Govt. Certified Guides',
      description: 'Tourism certified guides with 100% safety gear.',
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    },
    {
      icon: Tag,
      title: 'Best Price Guarantee',
      description: 'Direct camp & cab rates with zero hidden charges.',
      color: 'text-brand-orange bg-brand-orange/10 border-brand-orange/20',
    },
    {
      icon: CalendarSync,
      title: 'Free Date Change',
      description: 'Reschedule hassle-free up to 48 hrs prior.',
      color: 'text-blue-600 bg-blue-50 border-blue-100',
    },
    {
      icon: HeartHandshake,
      title: '100% Family Safe',
      description: 'Verified staff, family camps & 24/7 helpline.',
      color: 'text-teal-600 bg-teal-50 border-teal-100',
    },
  ]

  return (
    <section className="py-4 sm:py-5 bg-white border-y border-gray-100/90 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {guarantees.map((g, idx) => {
            const Icon = g.icon
            return (
              <div
                key={idx}
                className="flex items-center gap-2.5 sm:gap-3 p-2 sm:p-2.5 rounded-xl hover:bg-gray-50/80 transition-colors"
              >
                <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 border ${g.color}`}>
                  <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-brand-dark text-xs sm:text-[13px] leading-tight truncate">
                    {g.title}
                  </h4>
                  <p className="text-gray-500 text-[10px] sm:text-[11px] leading-tight mt-0.5 truncate sm:line-clamp-1">
                    {g.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

