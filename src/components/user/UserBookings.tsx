'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAppStore } from '@/lib/store'
import { MapPin, Calendar, Users, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function UserBookings() {
  const { user } = useAppStore()
  const queryClient = useQueryClient()

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['user-bookings', user?.id],
    queryFn: async () => {
      const res = await fetch('/api/bookings', {
        headers: { 'x-user-id': user?.id || '' },
      })
      return res.json()
    },
  })

  const cancelBooking = async (id: string) => {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || '',
        },
        body: JSON.stringify({ status: 'cancelled' }),
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Failed to cancel booking')
        return
      }

      toast.success('Booking cancelled successfully')
      queryClient.invalidateQueries({ queryKey: ['user-bookings'] })
    } catch {
      toast.error('Failed to cancel booking')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700 border-green-200'
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200'
      case 'completed': return 'bg-blue-100 text-blue-700 border-blue-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div>
      <h2 className="font-serif text-2xl sm:text-3xl text-brand-dark mb-6">My Bookings</h2>

      {bookings.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-brand-dark mb-2">No bookings yet</h3>
          <p className="text-muted-foreground text-sm">Start exploring destinations and book your next adventure!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking: {
            id: string
            destination: { name: string; image: string; state: string }
            checkIn: string
            checkOut: string
            guests: number
            totalPrice: number
            status: string
            paymentStatus: string
            createdAt: string
          }) => (
            <div key={booking.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="flex flex-col sm:flex-row">
                <img
                  src={booking.destination.image}
                  alt={booking.destination.name}
                  className="w-full sm:w-40 h-32 sm:h-auto object-cover"
                />
                <div className="flex-1 p-4 sm:p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-brand-dark">{booking.destination.name}</h3>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <MapPin className="w-3 h-3" />
                        {booking.destination.state}
                      </div>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium border ${getStatusColor(booking.status)}`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground text-xs">Check-in</span>
                      <p className="font-medium flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(booking.checkIn).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs">Check-out</span>
                      <p className="font-medium flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(booking.checkOut).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs">Guests</span>
                      <p className="font-medium flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {booking.guests}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                    <div>
                      <span className="text-muted-foreground text-xs">Total Price</span>
                      <p className="text-lg font-bold text-brand-orange">₹{booking.totalPrice.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        booking.paymentStatus === 'paid' ? 'bg-green-50 text-green-600' :
                        booking.paymentStatus === 'refunded' ? 'bg-blue-50 text-blue-600' :
                        'bg-amber-50 text-amber-600'
                      }`}>
                        {booking.paymentStatus === 'paid' ? 'Paid' :
                         booking.paymentStatus === 'refunded' ? 'Refunded' : 'Payment Pending'}
                      </span>
                      {(booking.status === 'pending' || booking.status === 'confirmed') && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 hover:bg-red-50"
                          onClick={() => cancelBooking(booking.id)}
                        >
                          <X className="w-3 h-3 mr-1" />
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
