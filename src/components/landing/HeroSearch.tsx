'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { motion } from 'framer-motion'
import { Waves, Car, Compass, Tent, Calendar, Users, ArrowRight, Search, MapPin, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

type SearchTab = 'rafting' | 'taxi' | 'tours' | 'stays'

export function HeroSearch() {
  const { navigate } = useAppStore()
  const [tab, setTab] = useState<SearchTab>('rafting')
  const [activity, setActivity] = useState('shivpuri')
  const [tourDest, setTourDest] = useState('char-dham-tour')
  const [taxiType, setTaxiType] = useState('sedan')
  const [travelDate, setTravelDate] = useState('')
  const [travelers, setTravelers] = useState(2)

  const today = new Date().toISOString().split('T')[0]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (tab === 'rafting') {
      navigate('rafting-packages')
    } else if (tab === 'taxi') {
      navigate('taxi-booking-form')
    } else if (tab === 'tours') {
      navigate(tourDest)
    } else if (tab === 'stays') {
      navigate('camping-packages')
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto -mt-8 sm:-mt-12 relative z-20 px-4">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100/80 p-3 sm:p-5">
        {/* Tabs */}
        <div className="flex items-center gap-1 sm:gap-2 border-b border-gray-100 pb-3 overflow-x-auto no-scrollbar">
          {[
            { id: 'rafting' as SearchTab, label: 'Rafting & Sports', icon: Waves, color: 'text-blue-600' },
            { id: 'taxi' as SearchTab, label: 'Taxi & Cabs', icon: Car, color: 'text-amber-600' },
            { id: 'tours' as SearchTab, label: 'Char Dham & Tours', icon: Compass, color: 'text-teal-600' },
            { id: 'stays' as SearchTab, label: 'Camps & Hotels', icon: Tent, color: 'text-emerald-600' },
          ].map((t) => {
            const Icon = t.icon
            const active = tab === t.id
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all whitespace-nowrap ${
                  active
                    ? 'bg-brand-dark text-white shadow-md'
                    : 'text-gray-600 hover:text-brand-dark hover:bg-gray-100/70'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-brand-orange' : t.color}`} />
                <span>{t.label}</span>
              </button>
            )
          })}
        </div>

        {/* Search Inputs Form */}
        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-3 sm:pt-4 items-center">
          {/* Main Dropdown based on Tab */}
          <div className="sm:col-span-4">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
              {tab === 'rafting' && 'Select Stretch / Activity'}
              {tab === 'taxi' && 'Select Vehicle Category'}
              {tab === 'tours' && 'Destination / Yatra'}
              {tab === 'stays' && 'Stay Category'}
            </label>
            <div className="relative">
              {tab === 'rafting' && (
                <>
                  <Waves className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <select
                    value={activity}
                    onChange={(e) => setActivity(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-brand-dark focus:ring-2 focus:ring-brand-orange/30 outline-none"
                  >
                    <option value="shivpuri">Shivpuri Rafting (16 km) - Most Popular</option>
                    <option value="marine-drive">Marine Drive Rafting (26 km) - Thrill</option>
                    <option value="brahmpuri">Brahmpuri Rafting (9 km) - Family</option>
                    <option value="kaudiyala">Kaudiyala Rafting (36 km) - Extreme</option>
                    <option value="bungee">Bungy Jumping & Flying Fox</option>
                  </select>
                </>
              )}

              {tab === 'taxi' && (
                <>
                  <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <select
                    value={taxiType}
                    onChange={(e) => setTaxiType(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-brand-dark focus:ring-2 focus:ring-brand-orange/30 outline-none"
                  >
                    <option value="sedan">Dzire / Etios (4+1 Seater)</option>
                    <option value="suv">Innova / Ertiga (6+1 Seater)</option>
                    <option value="innova-crysta">Innova Crysta Deluxe (6+1)</option>
                    <option value="tempo">Tempo Traveller (12-20 Seater)</option>
                  </select>
                </>
              )}

              {tab === 'tours' && (
                <>
                  <Compass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <select
                    value={tourDest}
                    onChange={(e) => setTourDest(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-brand-dark focus:ring-2 focus:ring-brand-orange/30 outline-none"
                  >
                    <option value="char-dham-tour">Char Dham Yatra (10-12 Days)</option>
                    <option value="rishikesh-tour">Rishikesh Sightseeing & Ganga Aarti</option>
                    <option value="haridwar-tour">Haridwar Spiritual Tour</option>
                    <option value="mussoorie-tour">Mussoorie & Queen of Hills Tour</option>
                    <option value="nainital-tour">Nainital Lake City Tour</option>
                    <option value="hill-stations-tour">Uttarakhand Complete Hill Station</option>
                  </select>
                </>
              )}

              {tab === 'stays' && (
                <>
                  <Tent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <select
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-brand-dark focus:ring-2 focus:ring-brand-orange/30 outline-none"
                  >
                    <option value="camping">Riverside Luxury Camping (Swimming Pool & DJ)</option>
                    <option value="hotel">Boutique Hotel & River View Resort</option>
                    <option value="jungle-camp">Jungle Wilderness Camp</option>
                  </select>
                </>
              )}
            </div>
          </div>

          {/* Travel Date */}
          <div className="sm:col-span-3">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
              Travel Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="date"
                min={today}
                value={travelDate}
                onChange={(e) => setTravelDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-brand-dark focus:ring-2 focus:ring-brand-orange/30 outline-none"
              />
            </div>
          </div>

          {/* Travelers Count */}
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-1">
              Travelers
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <select
                value={travelers}
                onChange={(e) => setTravelers(Number(e.target.value))}
                className="w-full pl-9 pr-2 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm text-brand-dark focus:ring-2 focus:ring-brand-orange/30 outline-none"
              >
                {[1, 2, 3, 4, 5, 6, 8, 10, 15, 20, 30].map(n => (
                  <option key={n} value={n}>{n} {n === 1 ? 'Guest' : 'Guests'}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Search Button */}
          <div className="sm:col-span-3 pt-1 sm:pt-4">
            <Button
              type="submit"
              className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold py-3 h-auto rounded-xl shadow-lg shadow-brand-orange/20 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm"
            >
              <Search className="w-4 h-4" />
              <span>Explore Deals</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
