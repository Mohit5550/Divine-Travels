'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Waves, Tent, Hotel, Bike, Zap, Compass, Car, MapPin, Phone, ArrowLeft, Loader2, Check, X, Star, Clock, Users } from 'lucide-react'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'

const CAT_ICONS: Record<string, any> = {
  camping: Tent,
  rafting: Waves,
  hotel: Hotel,
  'bike-rental': Bike,
  adventure: Zap,
  trekking: Compass,
  taxi: Car,
}

export default function ExperienceDetailPage() {
  const params = useParams()
  const id = Array.isArray(params.id) ? params.id[0] : params.id
  const [item, setItem] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    fetch(`/api/vendors/public/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.item) setItem(d.item)
        else setNotFound(true)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-orange" />
      </div>
    )
  }

  if (notFound || !item) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-24 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Experience not available</h1>
          <p className="text-gray-500 mt-2">This listing may be pending approval or has been removed.</p>
          <Link href="/experiences" className="inline-block mt-6 bg-brand-orange text-white px-5 py-2.5 rounded-xl font-bold">
            Back to Experiences
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  const Icon = CAT_ICONS[item.category] || Compass
  const photos: string[] = Array.isArray(item.photos) ? item.photos : []
  const hero = photos[0] || null
  const gallery = photos.slice(1)

  const openWhatsApp = () => {
    const clean = (item.vendorPhone || '').replace(/[^0-9]/g, '')
    const target = clean.length === 10 ? `91${clean}` : clean
    const text = encodeURIComponent(
      `Hi ${item.vendorOwner || item.vendorName}, I'm interested in your experience "${item.title}" listed on Divine Travels. Can you share availability & booking details?`
    )
    window.open(`https://wa.me/${target}?text=${text}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/experiences" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-orange mb-5">
          <ArrowLeft className="w-4 h-4" /> All Experiences
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: gallery + details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl overflow-hidden bg-gray-100 aspect-[16/9]">
              {hero ? (
                <img src={hero} alt={item.title} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <Icon className="w-20 h-20" />
                </div>
              )}
            </div>

            {gallery.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {gallery.map((p: string, idx: number) => (
                  <img key={idx} src={p} alt="" referrerPolicy="no-referrer" className="w-full h-24 object-cover rounded-xl border border-gray-200" />
                ))}
              </div>
            )}

            <div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full uppercase bg-brand-teal/10 text-brand-teal">
                <Icon className="w-3 h-3" /> {item.category}
              </span>
              <h1 className="text-3xl font-bold text-gray-900 mt-3 font-serif">{item.title}</h1>
              <p className="text-gray-500 mt-1 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-red-500" /> {item.vendorLocation || item.vendorCity || 'Rishikesh'}
              </p>
              <p className="text-sm text-gray-400 mt-1">Offered by <strong className="text-gray-600">{item.vendorName}</strong></p>
            </div>

            {item.description && (
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h2 className="font-bold text-gray-900 mb-2">About this experience</h2>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{item.description}</p>
              </div>
            )}

            {Array.isArray(item.highlights) && item.highlights.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h2 className="font-bold text-gray-900 mb-3">Highlights</h2>
                <ul className="space-y-2">
                  {item.highlights.map((h: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <Star className="w-4 h-4 text-brand-orange mt-0.5 shrink-0" /> {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Array.isArray(item.inclusions) && item.inclusions.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 p-5">
                  <h2 className="font-bold text-gray-900 mb-3">What's Included</h2>
                  <ul className="space-y-2">
                    {item.inclusions.map((h: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /> {h}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {Array.isArray(item.exclusions) && item.exclusions.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-200 p-5">
                  <h2 className="font-bold text-gray-900 mb-3">Not Included</h2>
                  <ul className="space-y-2">
                    {item.exclusions.map((h: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <X className="w-4 h-4 text-red-400 mt-0.5 shrink-0" /> {h}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {Array.isArray(item.timeSlots) && item.timeSlots.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 p-5">
                <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-1.5"><Clock className="w-4 h-4 text-brand-teal" /> Available Time Slots</h2>
                <div className="flex flex-wrap gap-2">
                  {item.timeSlots.map((t: any, i: number) => (
                    <span key={i} className="bg-slate-100 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-lg">
                      {t.startTime} – {t.endTime} · Cap {t.capacity}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: booking card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sticky top-24">
              <div className="flex items-end gap-2">
                {item.mrpPrice && Number(item.mrpPrice) > Number(item.sellingPrice) && (
                  <span className="text-gray-400 line-through text-sm">₹{Number(item.mrpPrice).toLocaleString()}</span>
                )}
                <span className="text-3xl font-extrabold text-gray-900">₹{Number(item.sellingPrice).toLocaleString()}</span>
                <span className="text-gray-500 text-sm mb-1">/ person</span>
              </div>

              {item.capacity && (
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Capacity: {item.capacity}</p>
              )}
              {item.advancePercentage && (
                <p className="text-xs text-gray-500 mt-0.5">Advance to book: {item.advancePercentage}%</p>
              )}

              <button
                onClick={openWhatsApp}
                className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"
              >
                <Phone className="w-4 h-4" /> Book / Enquire on WhatsApp
              </button>

              <div className="mt-4 text-[11px] text-gray-400 border-t border-gray-100 pt-3 space-y-1">
                <p>Verified partner of Divine Travels.</p>
                <p>Payment &amp; scheduling handled directly with the vendor via WhatsApp.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
