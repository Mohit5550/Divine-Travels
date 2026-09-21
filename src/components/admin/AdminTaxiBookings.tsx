'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Car,
  MapPin,
  Calendar,
  Clock,
  FileText,
  Loader2,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Users,
  Check,
  XCircle,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { Pagination } from '@/components/ui/Pagination'
import { BookingCardActions } from '../booking/BookingCardActions'
import { useAppStore } from '@/lib/store'
import { getAuthHeaders } from '@/lib/auth-client'

interface TaxiBooking {
  id: string
  destination: string
  packageType: string
  selectedPrograms: string
  name: string
  phone: string
  travelDate: string
  travelers: number
  status: string
  adminNotes: string | null
  createdAt: string
  negotiatedPrice: number | null
  priceLocked: boolean
}

export function AdminTaxiBookings() {
  const [bookings, setBookings] = useState<TaxiBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const { user } = useAppStore()
  const [acceptingId, setAcceptingId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const fetchBookings = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/taxi-bookings?all=true&page=${page}&limit=20`)
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) {
          setBookings(data)
          setTotalPages(1)
        } else {
          setBookings(data.data || [])
          setTotalPages(data.totalPages || 1)
        }
      }
    } catch {
      toast.error('Failed to fetch taxi bookings')
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    fetchBookings()
  }, [fetchBookings])

  const acceptUserAmount = useCallback(async (bookingId: string) => {
    setAcceptingId(bookingId)
    try {
      const res = await fetch(`/api/booking-flow/tour/${bookingId}/accept-user-amount`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders(), },
      })
      if (res.ok) {
        toast.success('User amount accepted — booking confirmed')
        fetchBookings()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to accept amount')
      }
    } catch {
      toast.error('Connection error')
    } finally {
      setAcceptingId(null)
    }
  }, [user?.id, fetchBookings])

  const updateStatus = useCallback(async (id: string, status: string) => {
    setUpdatingId(id)
    try {
      const res = await fetch('/api/admin/bookings/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders(), },
        body: JSON.stringify({ bookingId: id, type: 'taxi', status }),
      })
      const data = await res.json()
      if (res.ok) {
        if (status === 'confirmed' && data.whatsappUrl) {
          window.open(data.whatsappUrl, '_blank')
          toast.success('Taxi Booking Confirmed! WhatsApp opened to send 10% advance payment link.')
        } else {
          toast.success(`Taxi status updated to ${status.replace('_', ' ').toUpperCase()}`)
        }
        fetchBookings()
      } else {
        toast.error(data.error || 'Failed to update')
      }
    } catch {
      toast.error('Connection error')
    } finally {
      setUpdatingId(null)
    }
  }, [user?.id, fetchBookings])

  const filteredBookings = statusFilter === 'all' ? bookings : bookings.filter((b) => b.status === statusFilter)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <span className="inline-flex items-center gap-1 text-xs font-semibold bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full"><Clock className="w-3 h-3" />Pending</span>
      case 'confirmed': return <span className="inline-flex items-center gap-1 text-xs font-semibold bg-green-100 text-green-700 px-2.5 py-1 rounded-full"><Check className="w-3 h-3" />Confirmed</span>
      case 'ready': return <span className="inline-flex items-center gap-1 text-xs font-semibold bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full">Driver Assigned</span>
      case 'in_progress': return <span className="inline-flex items-center gap-1 text-xs font-semibold bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-bold">Ride In-Progress</span>
      case 'rejected':
      case 'cancelled': return <span className="inline-flex items-center gap-1 text-xs font-semibold bg-red-100 text-red-700 px-2.5 py-1 rounded-full"><X className="w-3 h-3" />Cancelled</span>
      case 'completed': return <span className="inline-flex items-center gap-1 text-xs font-semibold bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full"><Check className="w-3 h-3" />Completed</span>
      default: return <span className="text-xs font-semibold bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">{status}</span>
    }
  }

  const parseDetails = (booking: TaxiBooking) => {
    try {
      const admin = JSON.parse(booking.adminNotes || '{}')
      const programs = JSON.parse(booking.selectedPrograms || '{}')
      return {
        ...programs,
        ...admin,
        numberOfPassengers: admin.numberOfPassengers || programs.numberOfPassengers || booking.travelers || 1,
      }
    } catch {
      return {}
    }
  }

  const getBookingRef = (createdAt: string) => {
    return `DT${new Date(createdAt).getTime().toString().slice(-8)}`
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    confirmed: 'bg-green-100 text-green-700 border-green-200',
    ready: 'bg-orange-100 text-orange-700 border-orange-200',
    in_progress: 'bg-blue-100 text-blue-700 border-blue-200',
    approved: 'bg-green-100 text-green-700 border-green-200',
    rejected: 'bg-red-100 text-red-700 border-red-200',
    cancelled: 'bg-red-100 text-red-700 border-red-200',
    completed: 'bg-purple-100 text-purple-700 border-purple-200',
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-brand-orange" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-bold text-brand-dark">Taxi Bookings</h2>
          <p className="text-sm text-gray-500 mt-1">
            {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''} {statusFilter !== 'all' ? `(${statusFilter})` : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Filter:</span>
          {['all', 'pending', 'confirmed', 'ready', 'in_progress', 'completed', 'cancelled'].map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1) }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === s ? 'bg-brand-orange text-white' : 'bg-white text-muted-foreground border border-border hover:bg-brand-cream'
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {filteredBookings.length === 0 ? (
        <div className="text-center py-20">
          <Car className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No taxi bookings {statusFilter !== 'all' ? `with status "${statusFilter}"` : 'yet'}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const details = parseDetails(booking)
            const isExpanded = expandedId === booking.id

            return (
              <motion.div
                key={booking.id}
                layout
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                {/* Summary Row */}
                <div
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : booking.id)}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-brand-orange/10 flex items-center justify-center flex-shrink-0">
                        <Car className="w-5 h-5 text-brand-orange" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-brand-dark text-sm truncate">
                          {details.pickupLocation || '?'} → {details.dropLocation || '?'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          Ref: <span className="font-mono">{getBookingRef(booking.createdAt)}</span> · {details.vehicleType || booking.packageType} · {details.tripType === 'round-trip' ? 'Round Trip' : 'One Way'} · {booking.travelDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <select
                        value={booking.status || 'pending'}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => updateStatus(booking.id, e.target.value)}
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
                        <option value="ready">🟠 Driver Assigned</option>
                        <option value="in_progress">🔵 In-Progress</option>
                        <option value="completed">🟣 Completed</option>
                        <option value="cancelled">🔴 Cancelled</option>
                      </select>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-gray-100"
                    >
                      <div className="p-4 space-y-4">
                        {/* Details Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-brand-orange" />
                            <span className="text-gray-600">Ref:</span>
                            <span className="font-mono font-medium">{getBookingRef(booking.createdAt)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-600">Name:</span>
                            <span className="font-medium">{booking.name || '-'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-600">Phone:</span>
                            <span className="font-medium">{booking.phone || '-'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-brand-orange" />
                            <span className="text-gray-600">From:</span>
                            <span className="font-medium">{details.pickupLocation || '-'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-orange-500" />
                            <span className="text-gray-600">To:</span>
                            <span className="font-medium">{details.dropLocation || '-'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Car className="w-4 h-4 text-brand-orange" />
                            <span className="text-gray-600">Vehicle:</span>
                            <span className="font-medium">{details.vehicleType || '-'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-brand-orange" />
                            <span className="text-gray-600">Date:</span>
                            <span className="font-medium">{details.pickupDate || booking.travelDate}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-brand-orange" />
                            <span className="text-gray-600">Time:</span>
                            <span className="font-medium">{details.pickupTime || '-'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-600">Trip:</span>
                            <span className="font-medium">{details.tripType === 'round-trip' ? 'Round Trip' : 'One Way'}</span>
                          </div>
                          {details.numberOfDays > 1 && (
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="w-4 h-4 text-brand-orange" />
                              <span className="text-gray-600">Days:</span>
                              <span className="font-medium">{details.numberOfDays}</span>
                            </div>
                          )}
                          {details.numberOfPassengers && (
                            <div className="flex items-center gap-2 text-sm">
                              <Users className="w-4 h-4 text-brand-orange" />
                              <span className="text-gray-600">Passengers:</span>
                              <span className="font-medium">{details.numberOfPassengers}</span>
                            </div>
                          )}
                          {details.bookingAmount && (
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-gray-600">Amount:</span>
                              <span className="font-bold text-brand-orange">₹{Number(details.bookingAmount).toLocaleString('en-IN')}</span>
                            </div>
                          )}
                          {details.quoteBestPrice && (
                            <div className="flex items-center gap-2 text-sm">
                              <span className="px-2 py-0.5 bg-brand-orange/10 text-brand-orange rounded-full text-xs font-medium">Quote Best Price</span>
                            </div>
                          )}
                        </div>

                        {details.tourDescription && (
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-500 mb-1">Tour Description:</p>
                            <p className="text-sm text-gray-700">{details.tourDescription}</p>
                          </div>
                        )}

                        <div className="text-xs text-gray-400">
                          Submitted: {new Date(booking.createdAt).toLocaleString('en-IN')}
                        </div>

                        {/* Accept User's Proposed Amount */}
                        {details.bookingAmount && !booking.negotiatedPrice && !booking.priceLocked && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-green-800">User proposed amount</p>
                              <p className="text-lg font-bold text-green-700">₹{Number(details.bookingAmount).toLocaleString('en-IN')}</p>
                            </div>
                            <button
                              onClick={() => acceptUserAmount(booking.id)}
                              disabled={acceptingId === booking.id}
                              className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                            >
                              {acceptingId === booking.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Check className="w-4 h-4" />
                              )}
                              Accept ₹{Number(details.bookingAmount).toLocaleString('en-IN')}
                            </button>
                          </div>
                        )}

                        {/* Show agreed price if already locked */}
                        {booking.negotiatedPrice != null && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-sm font-medium text-blue-800">Agreed price</p>
                            <p className="text-lg font-bold text-blue-700">₹{booking.negotiatedPrice.toLocaleString('en-IN')}</p>
                          </div>
                        )}

                        {/* Negotiation & Payment (admin sends price → user accepts → advance pay) */}
                        <div className="pt-3 border-t border-gray-100">
                          <BookingCardActions type="tour" id={booking.id} isAdmin={true} userId={user?.id} />
                        </div>

                        {/* Reject / Cancel */}
                        {booking.status === 'pending' && (
                          <div className="pt-3 border-t border-gray-100">
                            <button
                              onClick={() => {
                                if (confirm('Reject this taxi booking? This cannot be undone.')) {
                                  updateStatus(booking.id, 'rejected')
                                }
                              }}
                              disabled={updatingId === booking.id}
                              className="flex items-center gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
                            >
                              {updatingId === booking.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <XCircle className="w-4 h-4" />
                              )}
                              Reject Booking
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      )}
      {totalPages > 1 && (
        <div className="border-t border-gray-100 p-4">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => { setPage(p); }} />
        </div>
      )}
    </div>
  )
}
