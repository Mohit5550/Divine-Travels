'use client'

import { useQuery } from '@tanstack/react-query'
import { useAppStore } from '@/lib/store'
import { motion } from 'framer-motion'
import { Calendar, CheckCircle, Clock, XCircle, ArrowRight, MapPin, Package } from 'lucide-react'

export function UserTimeline() {
  const { user, navigate } = useAppStore()

  const { data: destBookings = [], isLoading: destLoading } = useQuery({
    queryKey: ['user-bookings-timeline', user?.id],
    queryFn: async () => {
      const res = await fetch('/api/bookings', { headers: { 'x-user-id': user?.id || '' } })
      if (!res.ok) return []
      return res.json()
    },
  })

  const { data: pkgBookings = [], isLoading: pkgLoading } = useQuery({
    queryKey: ['user-package-bookings-timeline', user?.id],
    queryFn: async () => {
      const res = await fetch('/api/package-bookings', { headers: { 'x-user-id': user?.id || '' } })
      if (!res.ok) return []
      return res.json()
    },
  })

  if (destLoading || pkgLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center">
        <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
        <h3 className="font-semibold text-brand-dark mb-2">Loading timeline...</h3>
      </div>
    )
  }

  const allBookings = [
    ...destBookings.map((b: any) => ({
      ...b,
      type: 'destination' as const,
      title: b.destination?.name || 'Destination',
      subtitle: b.destination?.state || '',
      image: b.destination?.image || '',
      date: new Date(b.checkIn || b.createdAt),
    })),
    ...pkgBookings.map((b: any) => ({
      ...b,
      type: 'package' as const,
      title: b.package?.name || 'Package',
      subtitle: b.package?.category || '',
      image: b.package?.image || '',
      date: new Date(b.preferredDate || b.createdAt),
    })),
  ].sort((a: any, b: any) => b.date.getTime() - a.date.getTime())

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'completed': return <CheckCircle className="w-5 h-5 text-blue-600" />
      case 'pending': return <Clock className="w-5 h-5 text-amber-500" />
      case 'cancelled': return <XCircle className="w-5 h-5 text-red-500" />
      default: return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  const getDateLabel = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    return date.toLocaleDateString()
  }

  if (allBookings.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-12 text-center">
        <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-semibold text-brand-dark mb-2">No trip history yet</h3>
        <p className="text-muted-foreground text-sm">Your travel timeline will appear here after you make bookings.</p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="font-serif text-2xl sm:text-3xl text-brand-dark mb-6">Trip Timeline</h2>
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

        <div className="space-y-6">
          {allBookings.map((booking: any, idx: number) => (
            <motion.div
              key={`${booking.type}-${booking.id}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="relative pl-16"
            >
              {/* Timeline dot */}
              <div className="absolute left-4 top-1 w-5 h-5 rounded-full bg-white border-2 border-border flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-brand-orange" />
              </div>

              <div className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => booking.type === 'destination' ? navigate('destination-detail', booking.destinationId) : navigate('package-detail', null, booking.packageId)}>
                <div className="flex items-start gap-3">
                  <img src={booking.image || '/placeholder.svg'} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-brand-dark text-sm">{booking.title}</h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          {booking.type === 'destination' ? <MapPin className="w-3 h-3" /> : <Package className="w-3 h-3" />}
                          {booking.subtitle || booking.type}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(booking.status)}
                        <span className="text-xs text-muted-foreground">{getDateLabel(booking.date)}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-semibold text-brand-orange">₹{booking.totalPrice?.toLocaleString()}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                        booking.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                        booking.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
