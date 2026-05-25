'use client'

import { Landmark, Car, Bike, Compass, Waves, Mountain, Package, Building2, Plane, Flower2, Bed } from 'lucide-react'
import { motion } from 'framer-motion'

const activities = [
  { id: 'all', label: 'All', icon: Compass },
  { id: 'spiritual', label: 'Spiritual', icon: Landmark },
  { id: 'adventure', label: 'Adventure', icon: Waves },
  { id: 'trekking', label: 'Trekking', icon: Mountain },
  { id: 'hotel', label: 'Hotels', icon: Building2 },
  { id: 'bike', label: 'Bike Trip', icon: Bike },
  { id: 'rafting', label: 'Rafting', icon: Waves },
  { id: 'domestic', label: 'Domestic', icon: Car },
  { id: 'skiing', label: 'Skiing', icon: Mountain },
  { id: 'custom', label: 'Custom', icon: Package },
  { id: 'flights', label: 'Flights', icon: Plane },
  { id: 'yoga', label: 'Yoga', icon: Flower2 },
  { id: 'resort', label: 'Resorts', icon: Bed },
]

interface ActivityBarProps {
  activeCategory: string
  onCategoryChange: (category: string) => void
}

export function ActivityBar({ activeCategory, onCategoryChange }: ActivityBarProps) {
  return (
    <div className="py-6 bg-brand-cream/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-3 sm:gap-4 overflow-x-auto hide-scrollbar pb-2">
          {activities.map((activity, index) => {
            const Icon = activity.icon
            const isActive = activeCategory === activity.id
            return (
              <motion.button
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => onCategoryChange(activity.id)}
                className={`flex flex-col items-center gap-1.5 min-w-[72px] sm:min-w-[80px] px-3 py-3 rounded-xl transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/30'
                    : 'bg-white text-brand-dark hover:bg-brand-orange/10 hover:text-brand-orange'
                }`}
              >
                <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="text-[10px] sm:text-xs font-medium whitespace-nowrap">{activity.label}</span>
              </motion.button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
