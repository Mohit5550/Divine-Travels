'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useAppStore } from '@/lib/store'
import { Calendar, Phone, User, Check, X, Clock, Eye, ChevronDown, ChevronUp } from 'lucide-react'
import { toast } from 'sonner'
import { Pagination } from '@/components/ui/Pagination'

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

  const updateMutation = useMutation({
    mutationFn: async ({ id, status, adminNotes }: { id: string; status: string; adminNotes?: string }) => {
      const res = await fetch(`/api/admin/tour-bookings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user?.id || '' },
        body: JSON.stringify({ status, adminNotes }),
      })
      if (!res.ok) throw new Error('Failed to update')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tour-bookings'] })
      toast.success('Booking updated')
    },
    onError: () => toast.error('Failed to update booking'),
  })

  const handleFilterChange = (s: string) => {
    setStatusFilter(s)
    setPage(1)
  }

  const pendingCount = bookings.filter((b) => b.status === 'pending').length

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <span className="inline-flex items-center gap-1 text-xs font-semibold bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full"><Clock className="w-3 h-3" />Pending</span>
      case 'approved': return <span className="inline-flex items-center gap-1 text-xs font-semibold bg-green-100 text-green-700 px-2.5 py-1 rounded-full"><Check className="w-3 h-3" />Approved</span>
      case 'rejected': return <span className="inline-flex items-center gap-1 text-xs font-semibold bg-red-100 text-red-700 px-2.5 py-1 rounded-full"><X className="w-3 h-3" />Rejected</span>
      default: return <span className="text-xs font-semibold bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">{status}</span>
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark">Tour Bookings</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage customer tour booking inquiries</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Filter:</span>
          {['all', 'pending', 'approved', 'rejected'].map((s) => (
            <button
              key={s}
              onClick={() => handleFilterChange(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === s ? 'bg-brand-orange text-white' : 'bg-white text-muted-foreground border border-border hover:bg-brand-cream'
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
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
                  booking.status === 'pending' ? 'border-l-amber-500' : booking.status === 'approved' ? 'border-l-green-500' : 'border-l-red-500'
                }`}
              >
                <div
                  className="p-4 sm:p-5 cursor-pointer"
                  onClick={() => setExpandedId(expandedId === booking.id ? null : booking.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        {getStatusBadge(booking.status)}
                        <span className="text-xs text-muted-foreground bg-brand-cream px-2 py-0.5 rounded-full">
                          {booking.destination}
                        </span>
                        {booking.dayLabel && (
                          <span className="text-xs text-muted-foreground bg-brand-cream px-2 py-0.5 rounded-full">
                            {booking.dayLabel}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm">
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
                      {booking.status === 'pending' && (
                        <>
                          <button
                            onClick={(e) => { e.stopPropagation(); updateMutation.mutate({ id: booking.id, status: 'approved' }) }}
                            className="w-8 h-8 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 flex items-center justify-center transition-colors"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); updateMutation.mutate({ id: booking.id, status: 'rejected' }) }}
                            className="w-8 h-8 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 flex items-center justify-center transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
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
                          {booking.selectedPrograms.map((prog: string, i: number) => (
                            <p key={i} className="text-sm text-brand-dark flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-brand-orange" />
                              {prog}
                            </p>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Package Details</h4>
                        <p className="text-sm text-brand-dark">Type: {booking.packageType}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  )
}
