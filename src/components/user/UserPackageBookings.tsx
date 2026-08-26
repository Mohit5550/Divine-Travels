'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAppStore } from '@/lib/store'
import { motion } from 'framer-motion'
import { Package, MapPin, Calendar, Users, X, Eye, ArrowRight, CreditCard, Receipt } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useState } from 'react'
import { BookingCardActions } from '../booking/BookingCardActions'
import { parseHotelNotes, parseCampingNotes } from '@/lib/hotelBooking'
import { BookingVoucherModal } from '@/components/booking/BookingVoucherModal'

export function UserPackageBookings() {
  const { user, navigate } = useAppStore()
  const queryClient = useQueryClient()
  const [receiptBooking, setReceiptBooking] = useState<any | null>(null)

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['user-package-bookings', user?.id],
    queryFn: async () => {
      const res = await fetch('/api/package-bookings', {
        headers: { 'x-user-id': user?.id || '' },
      })
      if (!res.ok) return []
      return res.json()
    },
    refetchInterval: 12000,
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
      localStorage.setItem('dt_payment_id', payData.payment_id)
      localStorage.setItem('dt_booking_id', booking.id)
      localStorage.setItem('dt_user_id', user?.id || '')
      localStorage.setItem('dt_service', 'package')
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
          {bookings.map((booking: any) => {
            const hotel = parseHotelNotes(booking.additionalNotes)
            const camping = parseCampingNotes(booking.additionalNotes)
            return (
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
                    {camping ? (
                      <div>
                        <span className="text-muted-foreground text-xs">Camping</span>
                        <p className="font-medium">{new Date(camping.checkIn).toLocaleDateString()} → {new Date(camping.checkOut).toLocaleDateString()}</p>
                      </div>
                    ) : hotel ? (
                      <div>
                        <span className="text-muted-foreground text-xs">Stay</span>
                        <p className="font-medium">{new Date(hotel.checkIn).toLocaleDateString()} → {new Date(hotel.checkOut).toLocaleDateString()}</p>
                      </div>
                    ) : (
                      <div>
                        <span className="text-muted-foreground text-xs">Date</span>
                        <p className="font-medium">{new Date(booking.preferredDate).toLocaleDateString()}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-muted-foreground text-xs">{hotel ? 'Rooms / Guests' : 'People'}</span>
                      <p className="font-medium flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {hotel ? `${hotel.rooms} rm · ${hotel.adults}A${hotel.children ? `/${hotel.children}C` : ''}` : booking.numberOfPeople}
                      </p>
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
                      {booking.paymentStatus === 'completed' && (
                        <Button size="sm" className="bg-brand-teal hover:bg-brand-teal/90 text-white" onClick={() => setReceiptBooking(booking)}>
                          <Receipt className="w-3 h-3 mr-1" /> Receipt
                        </Button>
                      )}
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
                <div className="border-t border-border/50 pt-3 mt-3">
                  <BookingCardActions type="package" id={booking.id} isAdmin={false} userId={user?.id} />
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      <BookingVoucherModal
        isOpen={!!receiptBooking}
        onClose={() => setReceiptBooking(null)}
        booking={
          receiptBooking
            ? {
                bookingId: receiptBooking.id,
                bookingType: 'package',
                title: receiptBooking.package?.name || 'Package Booking',
                subtitle: receiptBooking.package?.subtitle || null,
                category: receiptBooking.package?.category || null,
                guestName: receiptBooking.fullName || user?.name || 'Valued Traveler',
                guestPhone: receiptBooking.mobile || user?.phone,
                guestEmail: user?.email,
                travelDate: receiptBooking.preferredDate || new Date().toISOString(),
                travelers: receiptBooking.numberOfPeople || 1,
                pickupLocation: receiptBooking.package?.location || null,
                totalPrice: receiptBooking.totalPrice || 0,
                originalPrice: receiptBooking.originalPrice ?? receiptBooking.package?.originalPrice ?? null,
                basePrice: receiptBooking.basePrice ?? receiptBooking.package?.price ?? null,
                unitPrice: receiptBooking.unitPrice ?? null,
                couponDiscount: receiptBooking.discountAmount || 0,
                isHotel: (() => {
                  const h = parseHotelNotes(receiptBooking.additionalNotes)
                  return !!h
                })(),
                hotelBreakdown: (() => {
                  const h = parseHotelNotes(receiptBooking.additionalNotes)
                  return h
                })(),
                isCamping: (() => {
                  const c = parseCampingNotes(receiptBooking.additionalNotes)
                  return !!c
                })(),
                campingBreakdown: (() => {
                  const c = parseCampingNotes(receiptBooking.additionalNotes)
                  return c
                })(),
                amountPaid:
                  receiptBooking.paymentStatus === 'completed'
                    ? (receiptBooking.paymentAmount || receiptBooking.totalPrice)
                    : (receiptBooking.paymentAmount || 0),
                balanceDue:
                  receiptBooking.paymentStatus === 'completed'
                    ? 0
                    : Math.max(
                        0,
                        (receiptBooking.totalPrice || 0) - (receiptBooking.paymentAmount || 0)
                      ),
                paymentStatus: receiptBooking.paymentStatus || 'pending',
                status: receiptBooking.status || 'pending',
                specialReqs: (() => {
                  const h = parseHotelNotes(receiptBooking.additionalNotes)
                  if (h) return h.specialRequests || null
                  const c = parseCampingNotes(receiptBooking.additionalNotes)
                  if (c) return c.specialRequests || null
                  return receiptBooking.additionalNotes || null
                })(),
                createdAt: receiptBooking.createdAt,
              }
            : null
        }
      />
    </div>
  )
}
