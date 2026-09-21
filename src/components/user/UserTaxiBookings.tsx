'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAppStore } from '@/lib/store'
import { CalendarDays, Users, FileText, Tag, Clock, Car, MapPin, CreditCard, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BookingCardActions } from '../booking/BookingCardActions'
import { toast } from 'sonner'
import { getAuthHeaders } from '@/lib/auth-client'

export function UserTaxiBookings() {
  const { user } = useAppStore()
  const qc = useQueryClient()
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['user-taxi-bookings', user?.id],
    queryFn: async () => {
      const res = await fetch('/api/taxi-bookings', { headers: { ...getAuthHeaders() } })
      if (!res.ok) return []
      return res.json()
    },
  })

  if (isLoading) return <p className="text-muted-foreground text-sm">Loading…</p>
  if (bookings.length === 0) return <p className="text-muted-foreground text-sm">No taxi bookings yet.</p>

  const cancelBooking = async (b: any) => {
    const total = b.negotiatedPrice || b.totalPrice || 0
    const paid = b.paymentAmount || 0
    const msg = paid > 0
      ? `Cancel this taxi booking?\n\nTotal: ₹${total.toLocaleString('en-IN')}\nPaid: ₹${paid.toLocaleString('en-IN')}\n\nRefund will be calculated based on cancellation policy.`
      : `Cancel this taxi booking?\n\nThis action cannot be undone.`
    if (!confirm(msg)) return
    try {
      const res = await fetch('/api/cancel-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders(), },
        body: JSON.stringify({ bookingType: 'tour', bookingId: b.id }),
      })
      if (!res.ok) { const d = await res.json(); toast.error(d.error || 'Failed to cancel'); return }
      const data = await res.json()
      if (data.refund) {
        toast.success(`Refund: ₹${data.refund.refundAmount.toLocaleString('en-IN')} (${data.refund.refundPct}% of ₹${data.refund.amountPaid.toLocaleString('en-IN')} paid)`)
      } else {
        toast.success('Booking cancelled')
      }
      qc.invalidateQueries({ queryKey: ['user-taxi-bookings'] })
    } catch { toast.error('Failed to cancel booking') }
  }

  return (
    <div className="space-y-4">
      {bookings.map((b: any) => {
        let notes: any = {}
        try {
          notes = JSON.parse(b.adminNotes || '{}')
        } catch {
          notes = {}
        }
        const route = notes.pickupLocation && notes.dropLocation
          ? `${notes.pickupLocation} → ${notes.dropLocation}`
          : b.destination

        const advanceInfo = (() => {
          if (b.status !== 'confirmed' || b.paymentStatus === 'completed') return null
          if (notes.advanceRequired && notes.advanceAmount) {
            const deadline = notes.advanceDeadline ? new Date(notes.advanceDeadline) : null
            const isExpired = deadline ? deadline < new Date() : false
            const timeLeft = deadline ? Math.max(0, Math.floor((deadline.getTime() - Date.now()) / (1000 * 60 * 60))) : 0
            return { amount: notes.advanceAmount, deadline, isExpired, timeLeft }
          }
          return null
        })()

        return (
          <div key={b.id} className="bg-white rounded-2xl shadow-sm border border-border/50 p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
              <div>
                <h3 className="font-bold text-brand-dark text-base flex items-center gap-1.5">
                  <Car className="w-4 h-4 text-brand-orange" /> {b.packageType || 'Taxi Booking'}
                </h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {route}
                  {notes.tripType ? ` · ${notes.tripType === 'round-trip' ? 'Round Trip' : 'One Way'}` : ''}
                </p>
              </div>
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  b.status === 'confirmed'
                    ? 'bg-green-100 text-green-700'
                    : b.status === 'rejected'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {b.status}
              </span>
            </div>

            {advanceInfo && (
              <div className={`mb-3 p-3 rounded-xl border-2 ${advanceInfo.isExpired ? 'bg-red-50 border-red-300' : 'bg-amber-50 border-amber-300 animate-pulse'}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${advanceInfo.isExpired ? 'bg-red-100' : 'bg-amber-100'}`}>
                    <CreditCard className={`w-5 h-5 ${advanceInfo.isExpired ? 'text-red-600' : 'text-amber-600'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold ${advanceInfo.isExpired ? 'text-red-700' : 'text-amber-700'}`}>
                      {advanceInfo.isExpired ? 'Advance Deadline Expired!' : `Pay 10% Advance: ₹${advanceInfo.amount.toLocaleString('en-IN')}`}
                    </p>
                    <p className={`text-xs mt-0.5 ${advanceInfo.isExpired ? 'text-red-600' : 'text-amber-600'}`}>
                      {advanceInfo.isExpired
                        ? 'Your booking may be cancelled. Contact support immediately.'
                        : advanceInfo.timeLeft > 0
                          ? `Time left: ~${advanceInfo.timeLeft} hours. Pay now to lock your spot.`
                          : 'Pay now to confirm your booking.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mb-2">
              {b.travelDate && (
                <span className="flex items-center gap-1">
                  <CalendarDays className="w-3.5 h-3.5" /> {b.travelDate}{notes.pickupTime ? ` @ ${notes.pickupTime}` : ''}
                </span>
              )}
              {b.travelers && (
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" /> {b.travelers} passenger(s)
                </span>
              )}
              {b.negotiatedPrice != null && (
                <span className="flex items-center gap-1 text-brand-orange">
                  <Tag className="w-3.5 h-3.5" /> Agreed ₹{b.negotiatedPrice}
                </span>
              )}
              {!b.priceLocked && <span className="flex items-center gap-1 text-amber-600"><Clock className="w-3.5 h-3.5" /> Price pending</span>}
            </div>

            {notes.vehicleType && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                <span className="text-[11px] bg-brand-orange/10 text-brand-orange px-2 py-0.5 rounded-full">{notes.vehicleType}</span>
              </div>
            )}

            {notes.tourDescription && (
              <p className="text-xs text-muted-foreground bg-brand-cream rounded-lg p-2 mb-2 flex items-start gap-1">
                <FileText className="w-3.5 h-3.5 mt-0.5 shrink-0" /> {notes.tourDescription}
              </p>
            )}

            <div className="border-t border-border/50 pt-3 mt-1 flex items-center justify-between">
              <BookingCardActions type="tour" id={b.id} isAdmin={false} userId={user?.id} />
              {(b.status === 'pending' || b.status === 'confirmed') && (
                <Button variant="outline" size="sm" className="text-red-500 hover:bg-red-50 text-xs" onClick={() => cancelBooking(b)}>
                  <X className="w-3 h-3 mr-1" /> Cancel
                </Button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
