'use client'

import { Landmark, Car, Bike, Compass, Waves, Mountain, Building2, Plane, Flower2, Bed, Tent, Flame, Zap, Anchor } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAppStore } from '@/lib/store'

const activities = [
  { id: 'rafting', label: 'Rafting', icon: Waves, color: 'bg-blue-500' },
  { id: 'bungee', label: 'Bungee', icon: Zap, color: 'bg-red-500' },
  { id: 'paragliding', label: 'Paragliding', icon: Compass, color: 'bg-sky-500' },
  { id: 'zipline', label: 'Zipline', icon: Anchor, color: 'bg-amber-500' },
  { id: 'camping', label: 'Camping', icon: Tent, color: 'bg-green-600' },
  { id: 'trekking', label: 'Trekking', icon: Mountain, color: 'bg-emerald-500' },
  { id: 'hotel', label: 'Hotels', icon: Building2, color: 'bg-purple-500' },
  { id: 'bike', label: 'Bike Trip', icon: Bike, color: 'bg-orange-600' },
  { id: 'spiritual', label: 'Spiritual', icon: Landmark, color: 'bg-amber-600' },
  { id: 'skiing', label: 'Skiing', icon: Mountain, color: 'bg-cyan-500' },
  { id: 'yoga', label: 'Yoga', icon: Flower2, color: 'bg-teal-500' },
  { id: 'resort', label: 'Resorts', icon: Bed, color: 'bg-rose-500' },
  { id: 'campfire', label: 'Campfire', icon: Flame, color: 'bg-orange-500' },
  { id: 'flights', label: 'Flights', icon: Plane, color: 'bg-indigo-500' },
]

export function ActivityBar() {
  const { navigate } = useAppStore()

  const handleClick = (id: string) => {
    if (id === 'rafting') {
      navigate('rafting-packages')
    }
    // Other categories can be handled later
  }

  return (
    <section className="bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        <div className="flex gap-2 sm:gap-3 md:gap-4 overflow-x-auto hide-scrollbar pb-1">
          {activities.map((activity, index) => {
            const Icon = activity.icon
            return (
              <motion.button
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => handleClick(activity.id)}
                className="flex flex-col items-center gap-2 min-w-[68px] sm:min-w-[76px] md:min-w-[80px] px-2 sm:px-3 py-2 sm:py-3 rounded-xl transition-all duration-200 cursor-pointer group hover:scale-105"
              >
                <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full ${activity.color} flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow`}>
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <span className="text-[10px] sm:text-xs font-medium text-brand-dark whitespace-nowrap group-hover:text-brand-orange transition-colors">
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
