'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAppStore } from '@/lib/store'
import { CheckCircle, XCircle, Eye, Users, Calendar, Phone, MessageSquare, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useState } from 'react'
import { Pagination } from '@/components/ui/Pagination'
import { motion, AnimatePresence } from 'framer-motion'
import { BookingCardActions } from '../booking/BookingCardActions'
import { parseHotelNotes } from '@/lib/hotelBooking'
import { getAuthHeaders } from '@/lib/auth-client'

interface PackageBookingData {
  id: string
  userId: string
  packageId: string
  fullName: string
  mobile: string
  numberOfPeople: number
  preferredDate: string
  preferredTime: string | null
  additionalNotes: string | null
  totalPrice: number
  status: string
  paymentStatus: string
  createdAt: string
  package: {
    id: string
    name: string
    subtitle: string
    image: string
    price: number
    category: string
  }
  user: {
    id: string
    name: string
    email: string
    phone: string | null
  }
}

interface Props {
  categoryFilter?: string
}

const serviceLabels: Record<string, string> = {
  rafting: 'Rafting',
  trekking: 'Trekking',
  adventure: 'Adventure',
  'bike-rental': 'Bike Rental',
  'domestic-tours': 'Domestic Tours',
  'spiritual-tours': 'Spiritual Tours',
  'international-tours': 'International Tours',
  'stay-hotel': 'Hotel',
  'stay-camping': 'Camping',
}

export function AdminPackageBookings({ categoryFilter }: Props) {
  const { user } = useAppStore()
  const queryClient = useQueryClient()
  const [selectedBooking, setSelectedBooking] = useState<PackageBookingData | null>(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-package-bookings', user?.id, statusFilter, categoryFilter, page],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: '20', all: 'true' })
      if (statusFilter !== 'all') params.set('status', statusFilter)
      if (categoryFilter) params.set('category', categoryFilter)
      const res = await fetch(`/api/package-bookings?${params}`, {
        headers: { ...getAuthHeaders() },
      })
      return res.json()
    },
  })

  const allBookings: PackageBookingData[] = Array.isArray(data) ? data : (data?.data || [])
  const totalPages = Array.isArray(data) ? 1 : (data?.totalPages || 1)

  const displayBookings = allBookings

  const pendingCount = allBookings.filter((b) => b.status === 'pending').length

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/admin/bookings/update-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(), },
        body: JSON.stringify({ bookingId: id, type: 'package', status }),
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Failed to update booking')
        return
      }

      if (status === 'confirmed' && data.whatsappUrl) {
        window.open(data.whatsappUrl, '_blank')
        toast.success('Booking Confirmed! WhatsApp opened to send 10% advance payment link.')
      } else {
        toast.success(`Booking status updated to ${status.replace('_', ' ').toUpperCase()}`)
      }

      queryClient.invalidateQueries({ queryKey: ['admin-package-bookings'] })
      queryClient.invalidateQueries({ queryKey: ['upcoming-bookings'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
      queryClient.invalidateQueries({ queryKey: ['admin-all-bookings'] })
      if (selectedBooking && selectedBooking.id === id) {
        setSelectedBooking((prev) => prev ? { ...prev, status } : null)
      }
    } catch {
      toast.error('Failed to update booking')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700'
      case 'pending': return 'bg-amber-100 text-amber-700'
      case 'ready': return 'bg-orange-100 text-orange-700'
      case 'in_progress': return 'bg-blue-100 text-blue-700 font-bold'
      case 'cancelled':
      case 'rejected': return 'bg-red-100 text-red-700'
      case 'completed': return 'bg-purple-100 text-purple-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const statuses = ['all', 'pending', 'confirmed', 'ready', 'in_progress', 'completed', 'cancelled']
  const label = categoryFilter ? serviceLabels[categoryFilter] || categoryFilter : 'Package'

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-xl sm:text-2xl text-brand-dark">
          {label} Bookings
          {pendingCount > 0 && (
            <span className="ml-2 text-sm font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
              {pendingCount} pending
            </span>
          )}
        </h2>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-4 overflow-x-auto">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              statusFilter === s
                ? 'bg-white text-brand-dark shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            {s !== 'all' && ` (${allBookings.filter((b) => b.status === s).length})`}
          </button>
        ))}
      </div>

      {/* Booking Detail Modal */}
      <AnimatePresence>
        {selectedBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto"
            onClick={() => setSelectedBooking(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h3 className="font-semibold text-lg text-brand-dark">Booking Details</h3>
                <button onClick={() => setSelectedBooking(null)} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Service Badge */}
                <div className="inline-flex items-center gap-1.5 bg-brand-orange/10 text-brand-orange text-xs font-medium px-2.5 py-1 rounded-full">
                  {serviceLabels[selectedBooking.package.category] || selectedBooking.package.category}
                </div>

                {/* Package Info */}
                <div className="flex items-center gap-3 p-3 bg-brand-cream/70 rounded-xl">
                  <img loading="lazy" decoding="async"
                    src={selectedBooking.package.image}
                    alt={selectedBooking.package.name}
                    className="w-14 h-14 rounded-lg object-cover"
                  />
                  <div>
                    <p className="font-semibold text-brand-dark">{selectedBooking.package.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedBooking.package.subtitle}</p>
                    <p className="text-sm font-medium text-brand-orange">₹{selectedBooking.package.price}/person</p>
                  </div>
                </div>

                {/* Booking Form Data */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-brand-dark flex items-center gap-2">
                    <Users className="w-4 h-4" /> Customer Information
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-muted/30 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">Full Name</p>
                      <p className="font-medium text-brand-dark">{selectedBooking.fullName}</p>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">Mobile</p>
                      <p className="font-medium text-brand-dark">{selectedBooking.mobile}</p>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">Account Name</p>
                      <p className="font-medium text-brand-dark">{selectedBooking.user.name}</p>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">Account Email</p>
                      <p className="font-medium text-brand-dark text-xs">{selectedBooking.user.email}</p>
                    </div>
                  </div>

                  <h4 className="font-medium text-sm text-brand-dark flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Trip Details
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-muted/30 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">Preferred Date</p>
                      <p className="font-medium text-brand-dark">{new Date(selectedBooking.preferredDate).toLocaleDateString()}</p>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">Preferred Time</p>
                      <p className="font-medium text-brand-dark">{selectedBooking.preferredTime || 'No preference'}</p>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">Number of People</p>
                      <p className="font-medium text-brand-dark">{selectedBooking.numberOfPeople}</p>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground">Total Price</p>
                      <p className="font-medium text-brand-orange">₹{selectedBooking.totalPrice.toLocaleString()}</p>
                    </div>
                  </div>

                  {selectedBooking.additionalNotes && (() => {
                    const hotel = parseHotelNotes(selectedBooking.additionalNotes)
                    const notes = hotel ? (hotel.specialRequests || null) : selectedBooking.additionalNotes
                    return notes ? (
                      <div className="bg-muted/30 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" /> Additional Notes
                        </p>
                        <p className="font-medium text-brand-dark text-sm mt-1">{notes}</p>
                      </div>
                    ) : null
                  })()}
                </div>

                {/* Status */}
                <div className="flex items-center justify-between pt-3 border-t border-border flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium ${getStatusColor(selectedBooking.status)}">
                      {selectedBooking.status}
                    </span>
                    {selectedBooking.paymentStatus === 'completed' && (
                      <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-green-100 text-green-700">
                        ✅ Payment Done
                      </span>
                    )}
                    {selectedBooking.paymentStatus === 'pending' && selectedBooking.status === 'confirmed' && (
                      <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-amber-100 text-amber-700">
                        Payment Pending
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
{selectedBooking.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => confirm('Confirm this booking?') && updateStatus(selectedBooking.id, 'confirmed')}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Confirm
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => confirm('Cancel this booking?') && updateStatus(selectedBooking.id, 'cancelled')}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
{selectedBooking.status === 'confirmed' && (
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => confirm('Mark this booking as completed?') && updateStatus(selectedBooking.id, 'completed') }
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Completed
                      </Button>
                    )}
                  </div>
                </div>
                {/* Negotiation & Payments */}
                <BookingCardActions type="package" id={selectedBooking.id} isAdmin={true} userId={user?.id} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bookings Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading bookings...</div>
        ) : displayBookings.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No {label.toLowerCase()} bookings found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-brand-cream/50 border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Booking ID</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Customer</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Package</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">People</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Service</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayBookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-border/50 hover:bg-brand-cream/30">
                    <td className="py-3 px-4 font-mono text-xs">{booking.id.slice(0, 8)}...</td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-brand-dark">{booking.fullName}</p>
                        <p className="text-xs text-muted-foreground">{booking.mobile}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <img loading="lazy" decoding="async" src={booking.package.image} alt="" className="w-8 h-8 rounded object-cover" />
                        <span className="text-sm">{booking.package.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-xs">
                        <div>{new Date(booking.preferredDate).toLocaleDateString()}</div>
                        <div className="text-muted-foreground">{booking.preferredTime || 'No time pref'}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">{booking.numberOfPeople}</td>
                    <td className="py-3 px-4 font-medium">₹{booking.totalPrice.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span className="text-xs bg-brand-orange/10 text-brand-orange px-2 py-0.5 rounded-full font-medium">
                        {serviceLabels[booking.package.category] || booking.package.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <select
                          value={booking.status || 'pending'}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => updateStatus(booking.id, e.target.value)}
                          className={`text-xs font-semibold rounded-lg px-2 py-1 border cursor-pointer transition-colors focus:ring-2 focus:ring-brand-orange/20 outline-none ${
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
                          <option value="ready">🟠 Guide/Camp Ready</option>
                          <option value="in_progress">🔵 In-Progress</option>
                          <option value="completed">🟣 Completed</option>
                          <option value="cancelled">🔴 Cancelled</option>
                        </select>
                        {booking.paymentStatus === 'completed' && (
                          <span className="text-[11px] px-1.5 py-0.5 rounded bg-green-100 text-green-700 font-bold">Paid</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedBooking(booking)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {booking.status === 'pending' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-green-600 hover:bg-green-50"
                              onClick={() => updateStatus(booking.id, 'confirmed')}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:bg-red-50"
                              onClick={() => updateStatus(booking.id, 'cancelled')}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        {booking.status === 'confirmed' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:bg-blue-50"
                            onClick={() => updateStatus(booking.id, 'completed')}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {totalPages > 1 && (
        <div className="mt-4 border-t border-border p-4">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  )
}
