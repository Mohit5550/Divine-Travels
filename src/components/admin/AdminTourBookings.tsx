'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { Calendar, Phone, User, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import { toast } from 'sonner'
import { Pagination } from '@/components/ui/Pagination'
import { BookingCardActions } from '../booking/BookingCardActions'

interface TourBooking {
  id: string
  destination: string
  dayLabel: string | null
  packageType: string
  selectedPrograms: string[]
  name: string
  phone: string
  travelDate: string
  travelers: number
  status: string
  adminNotes: string | null
  createdAt: string
}

export function AdminTourBookings() {
  const { user } = useAppStore()
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-tour-bookings', statusFilter, page],
    queryFn: async () => {
      const res = await fetch(`/api/admin/tour-bookings?status=${statusFilter}&page=${page}&limit=20`, {
        headers: { 'x-user-id': user?.id || '' },
      })
      if (!res.ok) throw new Error('Failed to fetch')
      const json = await res.json()
      if (json.data && Array.isArray(json.data)) {
        return { bookings: json.data, totalPages: json.totalPages || 1 }
      }
      return { bookings: json as TourBooking[], totalPages: 1 }
    },
  })

  const bookings = data?.bookings ?? []
  const totalPages = data?.totalPages ?? 1

  const handleFilterChange = (s: string) => {
    setStatusFilter(s)
    setPage(1)
  }

  const pendingCount = bookings.filter((b) => b.status === 'pending').length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">Tour Bookings</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage customer tour booking inquiries</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Filter:</span>
          {['all', 'pending', 'confirmed', 'ready', 'in_progress', 'completed', 'cancelled'].map((s) => (
            <button
              key={s}
              onClick={() => handleFilterChange(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === s ? 'bg-brand-orange text-white' : 'bg-white text-muted-foreground border border-border hover:bg-brand-cream'
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')}
              {s === 'pending' && pendingCount > 0 && (
                <span className="ml-1.5 bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingCount}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
              <div className="h-4 bg-muted rounded w-1/3 mb-3" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center">
          <p className="text-muted-foreground">No tour bookings found</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {bookings.map((booking) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white rounded-xl overflow-hidden border-l-4 ${
                  booking.status === 'confirmed' ? 'border-l-green-500' :
                  booking.status === 'ready' ? 'border-l-orange-500' :
                  booking.status === 'in_progress' ? 'border-l-blue-500' :
                  booking.status === 'completed' ? 'border-l-purple-500' :
                  booking.status === 'cancelled' || booking.status === 'rejected' ? 'border-l-red-500' :
                  'border-l-amber-500'
                }`}
              >
                <div
                  className="p-4 sm:p-5 cursor-pointer"
                  onClick={() => setExpandedId(expandedId === booking.id ? null : booking.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs text-muted-foreground bg-brand-cream px-2 py-0.5 rounded-full font-semibold">
                          {booking.destination}
                        </span>
                        {booking.dayLabel && (
                          <span className="text-xs text-muted-foreground bg-brand-cream px-2 py-0.5 rounded-full">
                            {booking.dayLabel}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        <span className="font-semibold text-brand-dark flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-muted-foreground" />
                          {booking.name}
                        </span>
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5" />
                          {booking.phone}
                        </span>
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {booking.travelDate}
                        </span>
                        <span className="text-muted-foreground">{booking.travelers} traveler{booking.travelers > 1 ? 's' : ''}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={booking.status || 'pending'}
                        onClick={(e) => e.stopPropagation()}
                        onChange={async (e) => {
                          const newStatus = e.target.value
                          try {
                            const res = await fetch('/api/admin/bookings/update-status', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json', 'x-user-id': user?.id || '' },
                              body: JSON.stringify({
                                bookingId: booking.id,
                                type: 'tour',
                                status: newStatus,
                              }),
                            })
                            if (!res.ok) throw new Error()
                            toast.success(`Tour status updated: ${newStatus.replace('_', ' ').toUpperCase()}`)
                            queryClient.invalidateQueries({ queryKey: ['admin-tour-bookings'] })
                            queryClient.invalidateQueries({ queryKey: ['upcoming-bookings'] })
                            queryClient.invalidateQueries({ queryKey: ['admin-all-bookings'] })
                          } catch {
                            toast.error('Failed to update status')
                          }
                        }}
                        className={`text-xs font-semibold rounded-lg px-2.5 py-1 border cursor-pointer transition-colors focus:ring-2 focus:ring-brand-orange/20 outline-none ${
                          booking.status === 'confirmed' ? 'bg-green-50 text-green-700 border-green-200' :
                          booking.status === 'ready' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                          booking.status === 'in_progress' ? 'bg-blue-50 text-blue-700 border-blue-200 font-bold' :
                          booking.status === 'completed' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                          booking.status === 'cancelled' || booking.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        <option value="pending">🟡 Pending</option>
                        <option value="confirmed">🟢 Confirmed</option>
                        <option value="ready">🟠 Guide & Cab Ready</option>
                        <option value="in_progress">🔵 Tour In-Progress</option>
                        <option value="completed">🟣 Completed</option>
                        <option value="cancelled">🔴 Cancelled</option>
                      </select>

                      <button className="w-8 h-8 rounded-lg bg-gray-100 text-muted-foreground hover:bg-gray-200 flex items-center justify-center transition-colors">
                        {expandedId === booking.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(booking.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                {expandedId === booking.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="border-t border-border/50 px-4 sm:px-5 py-4 bg-brand-cream/50"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Selected Programs</h4>
                        <div className="space-y-1">
                          {booking.selectedPrograms && booking.selectedPrograms.length > 0 ? (
                            booking.selectedPrograms.map((prog: string, i: number) => (
                              <p key={i} className="text-sm text-brand-dark flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-brand-orange" />
                                {typeof prog === 'string' ? prog : JSON.stringify(prog)}
                              </p>
                            ))
                          ) : (
                            <p className="text-xs text-muted-foreground">Standard Sightseeing Itinerary</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Booking Actions & Payment</h4>
                        <BookingCardActions type="tour" id={booking.id} isAdmin={true} userId={user?.id} />
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </>
      )}
    </div>
  )
}
