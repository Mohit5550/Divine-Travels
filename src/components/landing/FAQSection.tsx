'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, HelpCircle, Waves, Car, Tent, Compass, CreditCard, MessageCircle } from 'lucide-react'
import { DEFAULT_FAQS_DATA, FAQItem, FAQCategoryData } from '@/lib/faqs-data'

const CATEGORY_ICONS: Record<string, any> = {
  rafting: Waves,
  camping: Tent,
  taxi: Car,
  chardham: Compass,
  booking: CreditCard,
}

export function FAQSection() {
  const [activeTab, setActiveTab] = useState<string>('rafting')
  const [openIdx, setOpenIdx] = useState<number | null>(0)

  const { data: serverFaqs } = useQuery<Record<string, FAQCategoryData>>({
    queryKey: ['home-faqs'],
    queryFn: async () => {
      const res = await fetch('/api/faqs')
      if (!res.ok) return DEFAULT_FAQS_DATA
      return res.json()
    },
    staleTime: 60000,
  })

  const faqsData = serverFaqs && Object.keys(serverFaqs).length > 0 ? serverFaqs : DEFAULT_FAQS_DATA
  const categoryKeys = Object.keys(faqsData)
  const currentCategory = faqsData[activeTab] || faqsData[categoryKeys[0]] || { label: 'FAQs', items: [] }

  return (
    <section className="py-16 sm:py-20 bg-brand-cream/40 relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-brand-orange/10 px-3.5 py-1.5 rounded-full text-brand-orange text-xs font-semibold uppercase tracking-wider mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Got Questions?</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-brand-dark">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-600 text-sm sm:text-base max-w-xl mx-auto mt-2">
            Everything you need to know about rafting, camping, taxi rentals and temple tours in Uttarakhand.
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex items-center justify-center gap-2 mb-8 overflow-x-auto no-scrollbar pb-2">
          {categoryKeys.map((catKey) => {
            const data = faqsData[catKey]
            const Icon = CATEGORY_ICONS[catKey] || HelpCircle
            const active = (activeTab === catKey) || (!faqsData[activeTab] && catKey === categoryKeys[0])
            return (
              <button
                key={catKey}
                type="button"
                onClick={() => {
                  setActiveTab(catKey)
                  setOpenIdx(0)
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer ${
                  active
                    ? 'bg-brand-teal text-white shadow-md'
                    : 'bg-white text-gray-600 hover:text-brand-dark hover:bg-gray-100/80 border border-gray-200/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-brand-teal'}`} />
                <span>{data?.label || catKey}</span>
              </button>
            )
          })}
        </div>

        {/* Accordion Questions */}
        <div className="space-y-3">
          {currentCategory.items.map((item, idx) => {
            const isOpen = openIdx === idx
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-gray-200/70 shadow-xs overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-left gap-4 hover:bg-gray-50/50 transition-colors"
                >
                  <span className="font-semibold text-brand-dark text-sm sm:text-base">
                    {item.q}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform ${
                      isOpen ? 'bg-brand-orange text-white rotate-180' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100/80">
                        {item.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>

        {/* Still Have Questions Box */}
        <div className="mt-10 bg-white rounded-2xl p-6 border border-brand-orange/20 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <h4 className="font-bold text-brand-dark text-sm sm:text-base">
              Still have a specific question about your trip?
            </h4>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Talk directly with our local Uttarakhand travel experts on WhatsApp.
            </p>
          </div>
          <a
            href="https://wa.me/916396919007?text=Hi%20Divine%20Travels,%20I%20have%20a%20question%20about%20my%20upcoming%20trip."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-md transition-all shrink-0"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>
      </div>
    </section>
  )
}
