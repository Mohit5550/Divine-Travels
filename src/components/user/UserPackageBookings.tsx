'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAppStore } from '@/lib/store'
import { motion } from 'framer-motion'
import { Package, MapPin, Calendar, Users, X, Eye, ArrowRight, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export function UserPackageBookings() {
  const { user, navigate } = useAppStore()
  const queryClient = useQueryClient()

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['user-package-bookings', user?.id],
    queryFn: async () => {
      const res = await fetch('/api/package-bookings', {
        headers: { 'x-user-id': user?.id || '' },
      })
      if (!res.ok) return []
      return res.json()
    },
  })

  const cancelBooking = async (id: string) => {
    try {
      const res = await fetch(`/api/package-bookings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user?.id || '' },
        body: JSON.stringify({ status: 'cancelled' }),
      })
      if (!res.ok) { const d = await res.json(); toast.error(d.error || 'Failed to cancel'); return }
      toast.success('Booking cancelled')
      queryClient.invalidateQueries({ queryKey: ['user-package-bookings'] })
    } catch { toast.error('Failed to cancel booking') }
  }

  const handlePayNow = async (booking: any) => {
    try {
      const res = await fetch('/api/kwikupi/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user?.id || '' },
        body: JSON.stringify({
          customer_name: booking.fullName || user?.name,
          customer_email: user?.email,
          booking_id: booking.id,
          service: 'package',
          amount: booking.totalPrice || 500,
        }),
      })
      if (!res.ok) { const d = await res.json(); toast.error(d.error || 'Failed to create payment'); return }
      const payData = await res.json()
      sessionStorage.setItem('dt_payment_id', payData.payment_id)
      sessionStorage.setItem('dt_booking_id', booking.id)
      sessionStorage.setItem('dt_user_id', user?.id || '')
      sessionStorage.setItem('dt_service', 'package')
      window.location.href = payData.payment_page
    } catch {
      toast.error('Failed to initiate payment')
    }
  }

  const getCategoryIcon = (cat: string) => {
    const icons: Record<string, string> = { rafting: '🛶', trekking: '🥾', adventure: '🧗', bike: '🏍️', taxi: '🚕', domestic: '🏛️', spiritual: '🕉️' }
    return icons[cat] || '📦'
  }

  if (isLoading) {
    return <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />)}</div>
  }

  return (
    <div>
      <h2 className="font-serif text-2xl sm:text-3xl text-brand-dark mb-6">My Package Bookings</h2>
      {bookings.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-brand-dark mb-2">No package bookings yet</h3>
          <p className="text-muted-foreground text-sm mb-4">Book adventure activities, treks, tours and more!</p>
          <Button onClick={() => navigate('landing')} className="bg-brand-orange hover:bg-brand-orange/90 text-white">Explore Packages</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking: any) => (
            <motion.div key={booking.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="flex flex-col sm:flex-row">
                <img src={booking.package?.image || '/placeholder.svg'} alt={booking.package?.name} className="w-full sm:w-40 h-32 sm:h-auto object-cover" />
                <div className="flex-1 p-4 sm:p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-brand-dark">{booking.package?.name}</h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <span>{getCategoryIcon(booking.package?.category)} {booking.package?.category}</span>
                        {booking.package?.duration && <><span>•</span><Calendar className="w-3 h-3" />{booking.package.duration}</>}
                      </div>
                    </div>
                    <Badge className={`${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : booking.status === 'pending' ? 'bg-amber-100 text-amber-700' : booking.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground text-xs">Date</span>
                      <p className="font-medium">{new Date(booking.preferredDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs">People</span>
                      <p className="font-medium flex items-center gap-1"><Users className="w-3 h-3" />{booking.numberOfPeople}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs">Total</span>
                      <p className="font-bold text-brand-orange">₹{booking.totalPrice?.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                    <div className="flex items-center gap-2">
                      {booking.discountAmount > 0 && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Saved ₹{booking.discountAmount}</span>
                      )}
                      {booking.status === 'confirmed' && booking.paymentStatus !== 'completed' && (
                        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">Unpaid</span>
                      )}
                      {booking.paymentStatus === 'completed' && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Paid</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => navigate('package-detail', null, booking.packageId)}>
                        <Eye className="w-3 h-3 mr-1" /> View
                      </Button>
                      {booking.status === 'confirmed' && booking.paymentStatus !== 'completed' && (
                        <Button size="sm" className="bg-brand-orange hover:bg-brand-orange/90 text-white" onClick={() => handlePayNow(booking)}>
                          <CreditCard className="w-3 h-3 mr-1" /> Pay ₹{booking.totalPrice?.toLocaleString()}
                        </Button>
                      )}
                      {(booking.status === 'pending' || booking.status === 'confirmed') && (
                        <Button variant="outline" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => cancelBooking(booking.id)}>
                          <X className="w-3 h-3 mr-1" /> Cancel
                        </Button>
                      )}
                      {booking.status === 'completed' && (
                        <Button variant="outline" size="sm" className="text-brand-teal" onClick={() => navigate('package-detail', null, booking.packageId)}>
                          <ArrowRight className="w-3 h-3 mr-1" /> Book Again
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
