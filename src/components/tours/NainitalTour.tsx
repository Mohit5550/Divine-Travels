'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

const defaultPrograms = [
  {
    id: 1,
    title: 'Nainital Lake & Mall Road',
    img: 'https://images.unsplash.com/photo-1571746102880-59490970f3c8?w=1200&q=80',
    description: 'Take a boat ride on the iconic Naini Lake and enjoy a leisurely stroll on Mall Road.',
    itinerary: ['09:00 AM | Boat Ride on Naini Lake', '11:30 AM | Naina Devi Temple', '01:00 PM | Lunch at Mall Road', '03:00 PM | Tibetan Market Shopping', '05:00 PM | Snow View Point Ropeway']
  },
  {
    id: 2,
    title: 'Pangot & Kilbury Bird Sanctuary',
    img: 'https://images.unsplash.com/photo-1580747927932-3a6d8ab0dc1e?w=1200&q=80',
    description: 'Explore the lush bird sanctuary and enjoy panoramic views of the Kumaon Himalayas.',
    itinerary: ['08:00 AM | Drive to Pangot', '10:00 AM | Bird Watching Walk', '12:00 PM | Picnic Lunch', '02:00 PM | Kilbury Nature Trail', '04:00 PM | Return to Nainital']
  },
  {
    id: 3,
    title: 'Bhimtal & Sattal Lake Tour',
    img: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1200&q=80',
    description: 'Visit the serene lakes of Bhimtal and Sattal, away from the tourist crowds.',
    itinerary: ['09:00 AM | Bhimtal Lake Boating', '11:30 AM | Island Aquarium Visit', '01:00 PM | Lunch at Bhimtal', '03:00 PM | Sattal Lake Exploration', '05:00 PM | Return to Nainital']
  },
  {
    id: 4,
    title: 'Nainital Heritage Walk',
    img: 'https://images.unsplash.com/photo-1571746102880-59490970f3c8?w=1200&q=80',
    description: 'Discover colonial architecture, historic churches, and the rich history of Nainital.',
    itinerary: ['09:30 AM | St. John in the Wilderness Church', '11:00 AM | Nainital Museum', '12:30 PM | Lunch at a Heritage Cafe', '02:30 PM | Raj Bhavan Garden Visit', '04:30 PM | Library Point Stroll']
  },
  {
    id: 5,
    title: 'Adventure & Eco Cave Park',
    img: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1200&q=80',
    description: 'A day of adventure with rope ways, cave exploration, and horse riding around the lake.',
    itinerary: ['09:00 AM | Rope Way to Snow View Point', '11:30 AM | Eco Cave Park', '01:00 PM | Lunch at a Cafe', '03:00 PM | Horse Riding at Flats', '05:00 PM | Naina Peak Trek (optional)']
  }
]

const defaultInclusions = [
  'Clean Hotels/Guest Houses',
  'Daily Breakfast & Dinner',
  'Sightseeing in Private Vehicle',
  'Driver Allowance',
  'All Parking & Toll Taxes',
  'Boat Ride on Naini Lake',
  'Ropeway Tickets'
]

const defaultExclusions = [
  'Train/Flight Tickets',
  'Personal Expenses',
  'Any Optional Activities',
  'Lunch',
  'Insurance',
  'Camera Fees',
  'Anything Not Mentioned'
]

export function NainitalTour() {
  const [programs, setPrograms] = useState(defaultPrograms)
  const [inclusions, setInclusions] = useState(defaultInclusions)
  const [exclusions, setExclusions] = useState(defaultExclusions)

  useEffect(() => {
    fetch('/api/tour-destinations?slug=nainital')
      .then(r => r.json())
      .then(data => {
        if (data && data.config) {
          setPrograms(data.programs?.length ? data.programs : defaultPrograms)
          setInclusions(data.inclusions?.length ? data.inclusions : defaultInclusions)
          setExclusions(data.exclusions?.length ? data.exclusions : defaultExclusions)
        }
      })
      .catch(() => {})
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative h-[60vh] min-h-[400px] w-full overflow-hidden">
        <Image
          src={programs[0]?.img || 'https://images.unsplash.com/photo-1571746102880-59490970f3c8?w=1200&q=80'}
          alt="Nainital"
          fill
          className="object-cover"
          sizes="100vw"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex items-end pb-16 pt-40 px-4 sm:px-8">
          <div className="max-w-4xl mx-auto w-full text-white">
            <p className="text-xs sm:text-sm font-semibold mb-2 uppercase tracking-widest text-white/80">Nainital</p>
            <h1 className="text-3xl sm:text-5xl font-extrabold mb-3">Nainital Tour Packages</h1>
            <p className="text-sm sm:text-lg text-white/90 max-w-2xl">Explore the Lake District of India with flexible day-wise programs.</p>
          </div>
        </div>
      </div>

      {/* Section Title */}
      <div className="text-center py-16 px-4 bg-gradient-to-b from-brand-cream to-white">
        <h2 className="text-3xl font-extrabold text-brand-dark">Choose Your Nainital Experience</h2>
        <p className="text-gray-500 mt-2">Pick any program you like — we will customize your trip accordingly.</p>
      </div>

      {/* Programs */}
      <div className="max-w-6xl mx-auto px-4 space-y-12 pb-20">
        {programs.map((p: any, idx: number) => (
          <div key={p.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden flex flex-col md:flex-row">
            <div className="w-full md:w-[40%] relative min-h-[250px]">
              <Image src={p.img} alt={p.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 40vw" unoptimized />
            </div>
            <div className="w-full md:w-[60%] p-6 md:p-8 space-y-4">
              <h3 className="text-xl font-bold text-brand-dark">{p.title}</h3>
              <p className="text-gray-600">{p.description}</p>
              <div className="space-y-2">
                {p.itinerary.map((item: string, i: number) => (
                  <div key={i} className="flex items-start text-sm text-gray-700">
                    <div className="w-2 h-2 rounded-full bg-brand-teal mt-2 mr-3 flex-shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Inclusions / Exclusions */}
      <div className="bg-brand-dark text-white py-20 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16">
          <div>
            <h3 className="text-2xl font-bold mb-6 text-brand-gold">Inclusions</h3>
            <ul className="space-y-3">
              {inclusions.map((item: string, i: number) => (
                <li key={i} className="flex items-center text-white/90">
                  <span className="text-green-400 mr-3">✔</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-6 text-red-400">Exclusions</h3>
            <ul className="space-y-3">
              {exclusions.map((item: string, i: number) => (
                <li key={i} className="flex items-center text-white/90">
                  <span className="text-red-400 mr-3">✘</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
