'use client'

import { useState, Fragment } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAppStore } from '@/lib/store'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/ui/Pagination'
import { toast } from 'sonner'
import { BookingCardActions } from '../booking/BookingCardActions'
import { getAuthHeaders } from '@/lib/auth-client'

export function AdminBookings() {
  const { user, navigate } = useAppStore()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-bookings', user?.id, page],
    queryFn: async () => {
      const res = await fetch(`/api/bookings?page=${page}&limit=20`, {
        headers: { ...getAuthHeaders() },
      })
      return res.json()
    },
  })

  const bookings = Array.isArray(data) ? data : (data?.data || [])
  const totalPages = Array.isArray(data) ? 1 : (data?.totalPages || 1)

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/admin/bookings/update-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(), },
        body: JSON.stringify({ bookingId: id, type: 'destination', status }),
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
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] })
      queryClient.invalidateQueries({ queryKey: ['upcoming-bookings'] })
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
      queryClient.invalidateQueries({ queryKey: ['admin-all-bookings'] })
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

  return (
    <div>
      <h2 className="font-serif text-2xl sm:text-3xl text-brand-dark mb-6">Manage Destination Bookings</h2>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading bookings...</div>
        ) : bookings.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No bookings found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-brand-cream/50 border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Booking ID</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Guest</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Destination</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Dates</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Payment</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking: {
                  id: string
                  user: { name: string; email: string }
                  destination: { name: string }
                  checkIn: string
                  checkOut: string
                  guests: number
                  totalPrice: number
                  status: string
                  paymentStatus: string
                }) => (
                  <Fragment key={booking.id}>
                    <tr className="border-b border-border/50 hover:bg-brand-cream/30">
                      <td className="py-3 px-4 font-mono text-xs">{booking.id.slice(0, 8)}...</td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-brand-dark">{booking.user?.name || 'Traveler'}</p>
                          <p className="text-xs text-muted-foreground">{booking.user?.email || '—'}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">{booking.destination?.name || 'Destination'}</td>
                      <td className="py-3 px-4">
                        <div className="text-xs">
                          <div>{booking.checkIn ? new Date(booking.checkIn).toLocaleDateString() : 'N/A'}</div>
                          {booking.checkOut && (
                            <div className="text-muted-foreground">→ {new Date(booking.checkOut).toLocaleDateString()}</div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium">₹{(booking.totalPrice || 0).toLocaleString()}</td>
                      <td className="py-3 px-4">
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
                          <option value="ready">🟠 Stay Ready</option>
                          <option value="in_progress">🔵 In-Progress</option>
                          <option value="completed">🟣 Completed</option>
                          <option value="cancelled">🔴 Cancelled</option>
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          booking.paymentStatus === 'paid' || booking.paymentStatus === 'completed' ? 'bg-green-50 text-green-600 font-semibold' :
                          booking.paymentStatus === 'refunded' ? 'bg-blue-50 text-blue-600' :
                          'bg-amber-50 text-amber-600'
                        }`}>
                          {booking.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedId(expandedId === booking.id ? null : booking.id)}
                        >
                          {expandedId === booking.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </Button>
                      </td>
                    </tr>
                    {expandedId === booking.id && (
                      <tr key={`${booking.id}-expanded`}>
                        <td colSpan={8} className="bg-brand-cream/30 px-4 py-4">
                          <BookingCardActions type="destination" id={booking.id} isAdmin={true} userId={user?.id} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
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
