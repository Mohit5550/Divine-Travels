'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAppStore } from '@/lib/store'
import { CheckCircle, XCircle, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function AdminBookings() {
  const { user, navigate } = useAppStore()
  const queryClient = useQueryClient()

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['admin-bookings', user?.id],
    queryFn: async () => {
      const res = await fetch('/api/bookings?all=true', {
        headers: { 'x-user-id': user?.id || '' },
      })
      return res.json()
    },
  })

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || '',
        },
        body: JSON.stringify({ status }),
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Failed to update booking')
        return
      }

      toast.success(`Booking ${status} successfully`)
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] })
    } catch {
      toast.error('Failed to update booking')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700'
      case 'pending': return 'bg-amber-100 text-amber-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      case 'completed': return 'bg-blue-100 text-blue-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div>
      <h2 className="font-serif text-2xl sm:text-3xl text-brand-dark mb-6">Manage Bookings</h2>

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
                  <tr key={booking.id} className="border-b border-border/50 hover:bg-brand-cream/30">
                    <td className="py-3 px-4 font-mono text-xs">{booking.id.slice(0, 8)}...</td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-brand-dark">{booking.user.name}</p>
                        <p className="text-xs text-muted-foreground">{booking.user.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">{booking.destination.name}</td>
                    <td className="py-3 px-4">
                      <div className="text-xs">
                        <div>{new Date(booking.checkIn).toLocaleDateString()}</div>
                        <div className="text-muted-foreground">→ {new Date(booking.checkOut).toLocaleDateString()}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium">₹{booking.totalPrice.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        booking.paymentStatus === 'paid' ? 'bg-green-50 text-green-600' :
                        booking.paymentStatus === 'refunded' ? 'bg-blue-50 text-blue-600' :
                        'bg-amber-50 text-amber-600'
                      }`}>
                        {booking.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
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
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Complete
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
    </div>
  )
}
