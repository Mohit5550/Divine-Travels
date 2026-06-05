'use client'

import { Waves, Mountain, Compass, Bike, Car, Globe, Map, Landmark } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAppStore } from '@/lib/store'

const activities = [
  { id: 'rafting', label: 'Rafting', icon: Waves, color: 'bg-blue-500' },
  { id: 'trekking', label: 'Trekking', icon: Mountain, color: 'bg-emerald-500' },
  { id: 'adventure', label: 'Adventure', icon: Compass, color: 'bg-red-500' },
  { id: 'bike-rental', label: 'Bike Rental', icon: Bike, color: 'bg-orange-600' },
  { id: 'taxi-booking', label: 'Taxi Booking', icon: Car, color: 'bg-amber-500' },
  { id: 'international-tours', label: 'International', icon: Globe, color: 'bg-indigo-500' },
  { id: 'domestic-tours', label: 'Domestic', icon: Map, color: 'bg-teal-500' },
  { id: 'spiritual-tours', label: 'Spiritual', icon: Landmark, color: 'bg-amber-600' },
]

export function ActivityBar() {
  const { navigate } = useAppStore()

  const handleClick = (id: string) => {
    if (id === 'rafting') {
      navigate('rafting-packages')
    } else if (id === 'bike-rental') {
      navigate('bike-rental')
    } else if (id === 'taxi-booking') {
      navigate('taxi-booking')
    } else if (id === 'trekking') {
      navigate('trekking')
    } else if (id === 'adventure') {
      navigate('adventure')
    } else if (id === 'domestic-tours') {
      navigate('domestic-tours')
    } else if (id === 'spiritual-tours') {
      navigate('spiritual-tours')
    }
  }

  return (
    <section className="bg-white border-b border-gray-100 shadow-sm pt-16 sm:pt-[72px]">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-3 sm:py-5">
        <div className="flex gap-1 sm:gap-3 md:gap-4 overflow-x-auto hide-scrollbar pb-1 justify-start sm:justify-center">
          {activities.map((activity, index) => {
            const Icon = activity.icon
            return (
              <motion.button
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => handleClick(activity.id)}
                className="flex flex-col items-center gap-1 sm:gap-2 min-w-[56px] sm:min-w-[76px] md:min-w-[80px] px-1.5 sm:px-3 py-1.5 sm:py-3 rounded-xl transition-all duration-200 cursor-pointer group hover:scale-105 shrink-0"
              >
                <div className={`w-9 h-9 sm:w-12 sm:h-12 rounded-full ${activity.color} flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow`}>
                  <Icon className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
                <span className="text-[9px] sm:text-xs font-medium text-brand-dark whitespace-nowrap group-hover:text-brand-orange transition-colors text-center leading-tight">
                  {activity.label}
                </span>
              </motion.button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
