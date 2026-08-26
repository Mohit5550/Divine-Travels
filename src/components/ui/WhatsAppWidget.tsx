'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { MessageCircle, X, Send, Sparkles, Phone, Compass, Car, Waves, MapPin } from 'lucide-react'

const DEFAULT_WHATSAPP = '916396919007'

const quickOptions = [
  { label: 'Rafting & Adventure', icon: Waves, msg: 'Hi Divine Travels, I want to inquire about Rafting and Adventure packages in Rishikesh.' },
  { label: 'Taxi & Outstation Quote', icon: Car, msg: 'Hi Divine Travels, I need a taxi quote for my trip.' },
  { label: 'Char Dham / Temple Tour', icon: MapPin, msg: 'Hi Divine Travels, I am planning a Char Dham / Spiritual Yatra. Please share package details.' },
  { label: 'Hotel & Luxury Camping', icon: Compass, msg: 'Hi Divine Travels, I want to book a hotel / riverside camping stay.' },
]

function WhatsAppIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}

export function WhatsAppWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [customMsg, setCustomMsg] = useState('')

  const { data: settings } = useQuery({
    queryKey: ['public-settings'],
    queryFn: async () => {
      const res = await fetch('/api/public/settings')
      if (!res.ok) return {}
      return res.json() as Promise<Record<string, string>>
    },
    staleTime: 60000,
  })

  const rawPhone = settings?.whatsapp || DEFAULT_WHATSAPP
  const cleanPhone = rawPhone.replace(/\D/g, '')

  const handleSend = (text: string) => {
    const message = encodeURIComponent(text || 'Hi Divine Travels, I want to know more about your travel packages.')
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank')
    setIsOpen(false)
    setCustomMsg('')
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mb-4 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-[#075E54] p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center text-white shadow-inner">
                    <WhatsAppIcon className="w-6 h-6 text-white" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#075E54] rounded-full" />
                </div>
                <div>
                  <h4 className="font-bold text-sm leading-tight flex items-center gap-1.5">
                    Divine Travels WhatsApp
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  </h4>
                  <p className="text-[11px] text-emerald-200">Online | Instant Reply</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="p-4 bg-gray-50/70 max-h-80 overflow-y-auto space-y-3">
              <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 text-xs text-gray-700 leading-relaxed">
                👋 <strong>Namaste!</strong> Welcome to Divine Travels. How can our travel experts assist you on WhatsApp?
              </div>

              {/* Quick Suggestion Chips */}
              <div className="space-y-1.5 pt-1">
                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-1">Quick Inquiries</p>
                {quickOptions.map((opt, i) => {
                  const Icon = opt.icon
                  return (
                    <button
                      key={i}
                      onClick={() => handleSend(opt.msg)}
                      className="w-full text-left bg-white hover:bg-emerald-50 hover:border-emerald-200 border border-gray-200/80 p-2.5 rounded-xl text-xs font-medium text-gray-800 transition-all flex items-center gap-2.5 shadow-sm group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover:bg-[#25D366] group-hover:text-white transition-colors">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="flex-1 truncate">{opt.label}</span>
                      <Send className="w-3 h-3 text-gray-400 group-hover:text-emerald-600 transition-colors shrink-0" />
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Input Footer */}
            <div className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
              <input
                type="text"
                placeholder="Type your WhatsApp message..."
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSend(customMsg)
                }}
                className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:border-[#25D366] focus:ring-1 focus:ring-[#25D366]"
              />
              <button
                onClick={() => handleSend(customMsg)}
                className="p-2 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-xl transition-colors shadow-md disabled:opacity-50"
                disabled={!customMsg.trim()}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating WhatsApp Action Button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative group bg-[#25D366] hover:bg-[#20bd5a] text-white p-3.5 sm:p-4 rounded-full shadow-2xl hover:shadow-[#25D366]/40 transition-all flex items-center justify-center border-2 border-white ring-4 ring-[#25D366]/20"
        aria-label="Chat on WhatsApp"
      >
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-white border-2 border-[#25D366] rounded-full animate-ping" />
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-white border-2 border-[#25D366] rounded-full" />
        
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <WhatsAppIcon className="w-7 h-7 text-white drop-shadow-sm" />
        )}
      </motion.button>
    </div>
  )
}
