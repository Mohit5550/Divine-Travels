'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Car,
  MapPin,
  Calendar,
  Clock,
  FileText,
  Loader2,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

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
}

export function AdminTaxiBookings() {
  const [bookings, setBookings] = useState<TaxiBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/taxi-bookings?all=true')
      if (res.ok) {
        const data = await res.json()
        setBookings(data)
      }
    } catch {
      toast.error('Failed to fetch taxi bookings')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id)
    try {
      const res = await fetch(`/api/taxi-bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status } : b))
        )
        toast.success(`Booking ${status}`)
      } else {
        toast.error('Failed to update status')
      }
    } catch {
      toast.error('Failed to update status')
    } finally {
      setUpdatingId(null)
    }
  }

  const parseDetails = (booking: TaxiBooking) => {
    try {
      return JSON.parse(booking.adminNotes || '{}')
    } catch {
      return {}
    }
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    approved: 'bg-green-100 text-green-700 border-green-200',
    rejected: 'bg-red-100 text-red-700 border-red-200',
    completed: 'bg-blue-100 text-blue-700 border-blue-200',
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
            {bookings.length} total booking{bookings.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-20">
          <Car className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No taxi bookings yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
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
                          {details.vehicleType || booking.packageType} · {details.tripType === 'round-trip' ? 'Round Trip' : 'One Way'} · {booking.travelDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${statusColors[booking.status] || 'bg-gray-100 text-gray-600'}`}>
                        {booking.status}
                      </span>
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

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2 border-t border-gray-100">
                          {booking.status !== 'approved' && (
                            <Button
                              size="sm"
                              onClick={(e) => { e.stopPropagation(); updateStatus(booking.id, 'approved') }}
                              disabled={updatingId === booking.id}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                              Approve
                            </Button>
                          )}
                          {booking.status !== 'rejected' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => { e.stopPropagation(); updateStatus(booking.id, 'rejected') }}
                              disabled={updatingId === booking.id}
                              className="border-red-200 text-red-600 hover:bg-red-50"
                            >
                              <XCircle className="w-3.5 h-3.5 mr-1" />
                              Reject
                            </Button>
                          )}
                          {booking.status === 'approved' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => { e.stopPropagation(); updateStatus(booking.id, 'completed') }}
                              disabled={updatingId === booking.id}
                              className="border-blue-200 text-blue-600 hover:bg-blue-50"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                              Mark Completed
                            </Button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
