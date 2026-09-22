'use client'

import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Printer,
  CheckCircle2,
  Calendar,
  Users,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  QrCode,
  Download,
  CreditCard,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { getAuthHeaders } from '@/lib/auth-client'

export interface BookingVoucherData {
  bookingId: string
  bookingType?: string // 'package' | 'destination' | 'tour' | 'taxi'
  title: string
  subtitle?: string | null
  category?: string | null
  guestName: string
  guestPhone?: string | null
  guestEmail?: string | null
  travelDate: string
  travelers: number
  preferredTime?: string | null
  checkOut?: string | null
  pickupLocation?: string | null
  emergencyContact?: string | null
  whatsappConsent?: boolean | null
  totalPrice: number
  // Price breakdown snapshot (per-person for regular packages; null = derive from total)
  originalPrice?: number | null // admin's original/list price per person
  basePrice?: number | null // our standard discounted selling price per person
  unitPrice?: number | null // actual applied per-person price (availability override or basePrice)
  couponDiscount?: number // coupon discount applied
  isHotel?: boolean
  hotelBreakdown?: any | null
  isCamping?: boolean
  campingBreakdown?: any | null
  amountPaid?: number
  balanceDue?: number
  paymentStatus: string
  status: string
  specialReqs?: string | null
  createdAt?: string
}

interface BookingVoucherModalProps {
  isOpen: boolean
  onClose: () => void
  booking: BookingVoucherData | null
}

export function BookingVoucherModal({ isOpen, onClose, booking }: BookingVoucherModalProps) {
  const printRef = useRef<HTMLDivElement>(null)
  const [isPaying, setIsPaying] = useState(false)

  if (!isOpen || !booking) return null

  const formattedDate = booking.travelDate
    ? new Date(booking.travelDate).toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'To Be Confirmed'

  const bookingCode = `DT-${booking.bookingId.slice(-8).toUpperCase()}`

  const handlePrint = () => {
    window.print()
  }

  const handlePayDueBalance = async () => {
    if (!booking.bookingId) return
    setIsPaying(true)
    try {
      const bType = booking.bookingType || 'package'
      const uid = typeof window !== 'undefined' ? localStorage.getItem('dt_user_id') || '' : ''
      const res = await fetch(`/api/booking-flow/${bType}/${booking.bookingId}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders(), },
        body: JSON.stringify({ method: 'online', payType: 'balance' }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to initiate payment')
      }
      const data = await res.json()
      localStorage.setItem('dt_payment_id', data.payment_id)
      localStorage.setItem('dt_booking_id', booking.bookingId)
      localStorage.setItem('dt_user_id', uid)
      localStorage.setItem('dt_service', 'unified')
      localStorage.setItem('dt_booking_type', bType)
      localStorage.setItem('dt_pay_type', 'balance')
      window.location.href = data.payment_page
    } catch (e: any) {
      toast.error(e.message || 'Payment initiation failed')
    } finally {
      setIsPaying(false)
    }
  }

  const isConfirmed = booking.status === 'confirmed' || booking.status === 'completed'
  const isPaid = booking.paymentStatus === 'completed' || (booking.amountPaid && booking.amountPaid >= booking.totalPrice)

  // ----- Price breakdown computation -----
  const fmt = (n: number) => `₹${Math.round(n || 0).toLocaleString('en-IN')}`

  const original = booking.originalPrice ?? null
  const base = booking.basePrice ?? null
  const unit = booking.unitPrice ?? null
  const couponDiscount = booking.couponDiscount || 0
  const travelers = booking.travelers || 1

  // Per-person applied price: availability override (unit) if it differs from our base price
  const appliedUnit = unit ?? base ?? 0
  const hasPriceBreakdown = !!base || !!unit || !!original
  const hasAvailabilityOverride = !!base && !!unit && unit !== base
  const showOriginal = !!original && original > appliedUnit && hasPriceBreakdown

  const categoryLabel = (booking.category || '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase())

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-8"
        >
          {/* Top Modal Controls */}
          <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between print:hidden">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Official Travel Voucher
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handlePrint}
                size="sm"
                className="bg-brand-orange hover:bg-brand-orange/90 text-white rounded-xl text-xs gap-1.5 shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                Print / Save as PDF
              </Button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Printable Voucher Content */}
          <div id="printable-voucher" ref={printRef} className="p-6 sm:p-8 bg-white text-brand-dark">
            {/* Voucher Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b-2 border-brand-orange/20">
              <div className="flex items-center gap-3">
                {/* Company Logo */}
                <img
                  src="/logo.png"
                  alt="Divine Travels"
                  className="h-14 w-auto object-contain"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                />
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-serif text-2xl font-black text-brand-dark tracking-tight">
                      Divine Travels
                    </span>
                    <span className="bg-brand-orange/10 text-brand-orange text-[10px] font-bold px-2 py-0.5 rounded-full">
                      VERIFIED
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">Uttarakhand’s Premier Travel & Adventure Partner</p>
                  <p className="text-[11px] text-gray-400">Rishikesh | Haridwar | Dehradun | Char Dham</p>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <div className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Booking Voucher ID</div>
                <div className="font-mono font-bold text-base text-brand-orange">{bookingCode}</div>
                <div className="text-[11px] text-gray-500">
                  Issued: {new Date().toLocaleDateString('en-IN')}
                </div>
              </div>
            </div>

            {/* Status Banner */}
            <div className={`my-5 p-4 rounded-xl border flex items-center justify-between ${
              isPaid
                ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200/80'
                : 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200/80'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md ${
                  isPaid ? 'bg-emerald-500 text-white' : 'bg-brand-orange text-white'
                }`}>
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">
                    {isConfirmed ? 'Booking Confirmed' : 'Booking Received'}
                  </h4>
                  <p className="text-xs font-medium text-gray-600">
                    {isPaid ? (
                      <span className="text-emerald-700 font-bold">✓ Full Payment Completed (₹0 Due)</span>
                    ) : booking.amountPaid && booking.amountPaid > 0 ? (
                      <span className="text-amber-800 font-semibold">
                        10% Advance Paid ({fmt(booking.amountPaid)}) • Balance Due: <span className="text-brand-orange font-bold">{fmt(booking.balanceDue || 0)}</span>
                      </span>
                    ) : (
                      <span className="text-red-600 font-medium">10% Advance Payment Pending ({fmt(Math.ceil((booking.totalPrice || 0) * 0.1))})</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="text-right hidden sm:block">
                <span className={`inline-block px-3 py-1 text-xs font-bold rounded-lg uppercase tracking-wider shadow-sm ${
                  isPaid ? 'bg-emerald-600 text-white' : 'bg-brand-orange text-white'
                }`}>
                  {isPaid ? 'Fully Paid' : 'Advance Paid'}
                </span>
              </div>
            </div>

            {/* Trip & Service Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-3">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Package / Service Booked
                </p>
                <h3 className="font-bold text-lg text-brand-dark mb-1 leading-tight">{booking.title}</h3>
                {booking.subtitle && (
                  <p className="text-xs text-gray-500 mb-2">{booking.subtitle}</p>
                )}
                {categoryLabel && (
                  <span className="inline-block text-[10px] font-semibold uppercase tracking-wide bg-brand-teal/10 text-brand-teal px-2 py-0.5 rounded-full mb-2">
                    {categoryLabel}
                  </span>
                )}
                <div className="space-y-1.5 text-xs text-gray-600">
                  <p className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-brand-orange" />
                    <strong>{booking.checkOut ? 'Check-in:' : 'Travel Date:'}</strong> {formattedDate}
                  </p>
                  {booking.checkOut && (
                    <p className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-brand-orange" />
                      <strong>Check-out:</strong>{' '}
                      {new Date(booking.checkOut).toLocaleDateString('en-IN', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  )}
                  {!booking.checkOut && booking.preferredTime && (
                    <p className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-brand-orange" />
                      <strong>Preferred Time:</strong> {booking.preferredTime}
                    </p>
                  )}
                  <p className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-brand-orange" />
                    <strong>Travelers:</strong> {booking.travelers} Guest(s)
                  </p>
                  {booking.pickupLocation && (
                    <p className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-brand-orange" />
                      <strong>Pickup:</strong> {booking.pickupLocation}
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Primary Guest
                </p>
                <h3 className="font-bold text-base text-brand-dark mb-2">{booking.guestName}</h3>
                <div className="space-y-1.5 text-xs text-gray-600">
                  {booking.guestPhone && (
                    <p className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-brand-teal" />
                      <strong>Phone:</strong> {booking.guestPhone}
                    </p>
                  )}
                  {booking.guestEmail && (
                    <p className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-brand-teal" />
                      <strong>Email:</strong> {booking.guestEmail}
                    </p>
                  )}
                  {booking.emergencyContact && (
                    <p className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-brand-teal" />
                      <strong>Emergency Contact:</strong> {booking.emergencyContact}
                    </p>
                  )}
                  <p className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <strong>Verification:</strong> Govt. ID Required
                  </p>
                </div>
              </div>
            </div>

            {/* Price Breakdown Box */}
            <div className="my-3 p-4 bg-brand-cream/60 rounded-xl border border-amber-200/60">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                Price Details
              </p>

              {/* Hotel / Camping itemised breakdown */}
              {booking.isCamping && booking.campingBreakdown ? (
                (() => {
                  const c = booking.campingBreakdown
                  const split = c.campSplit?.length
                    ? c.campSplit
                    : [{ pax: c.tierPerCamp, pricePerPerson: c.pricePerPerson, cost: c.roomCost }]
                  return (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Camp: {c.campTypeName} × {c.nights} night(s) × {c.camps} camp(s)</span>
                        <span className="font-medium">{fmt(c.roomCost)}</span>
                      </div>
                      {split.map((s: any, i: number) => (
                        <div key={i} className="flex justify-between text-sm text-gray-600">
                          <span>{c.camps > 1 ? `Camp ${i + 1}: ` : 'Group rate: '}₹{s.pricePerPerson}/person/night ({s.pax}/camp)</span>
                          <span className="font-medium">× {s.pax} pax</span>
                        </div>
                      ))}
                      {c.mealCost > 0 && (
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Meal Plan: {c.mealPlanName}</span>
                          <span className="font-medium">{fmt(c.mealCost)}</span>
                        </div>
                      )}
                      {couponDiscount > 0 && (
                        <div className="flex justify-between text-sm text-emerald-700">
                          <span>Coupon Discount</span>
                          <span className="font-medium">−{fmt(couponDiscount)}</span>
                        </div>
                      )}
                    </div>
                  )
                })()
              ) : booking.isHotel && booking.hotelBreakdown ? (
                (() => {
                  const h = booking.hotelBreakdown
                  return (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Room: {h.roomTypeName} × {h.nights} night(s) × {h.rooms} room(s)</span>
                        <span className="font-medium">{fmt(h.roomCost)}</span>
                      </div>
                      {h.extraAdultCost > 0 && (
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Extra Adults</span>
                          <span className="font-medium">{fmt(h.extraAdultCost)}</span>
                        </div>
                      )}
                      {h.extraChildCost > 0 && (
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Extra Children</span>
                          <span className="font-medium">{fmt(h.extraChildCost)}</span>
                        </div>
                      )}
                      {h.mealCost > 0 && (
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Meal Plan: {h.mealPlanName}</span>
                          <span className="font-medium">{fmt(h.mealCost)}</span>
                        </div>
                      )}
                      {couponDiscount > 0 && (
                        <div className="flex justify-between text-sm text-emerald-700">
                          <span>Coupon Discount</span>
                          <span className="font-medium">−{fmt(couponDiscount)}</span>
                        </div>
                      )}
                    </div>
                  )
                })()
              ) : (
                !booking.isHotel && !booking.isCamping && hasPriceBreakdown && (
                /* Regular package per-person breakdown */
                <div className="space-y-1.5">
                  {showOriginal && (
                    <div className="flex justify-between items-center text-sm text-gray-400">
                      <span>Original Price (MRP)</span>
                      <span className="line-through">{fmt(original!)}</span>
                    </div>
                  )}
                  {hasAvailabilityOverride ? (
                    <>
                      <div className="flex justify-between items-center text-sm text-gray-600">
                        <span>Our Standard Price</span>
                        <span className="font-medium">{fmt(base!)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm py-1 px-2 rounded-md bg-brand-orange/10 border border-brand-orange/30">
                        <span className="font-semibold text-brand-orange">
                          Special Date Price (Availability)
                        </span>
                        <span className="font-bold text-brand-orange">{fmt(unit!)}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>{showOriginal ? 'Our Price (per person)' : 'Price (per person)'}</span>
                      <span className="font-medium">{fmt(appliedUnit)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>× {travelers} Traveler(s)</span>
                    <span className="font-medium">{fmt(appliedUnit * travelers)}</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between items-center text-sm text-emerald-700">
                      <span>Coupon Discount</span>
                      <span className="font-medium">−{fmt(couponDiscount)}</span>
                    </div>
                  )}
                </div>
              ))}

              <div className="flex justify-between items-center text-sm pt-2 mt-2 border-t border-amber-200/50 font-bold text-brand-dark">
                <span>Total Booking Amount</span>
                <span className="text-base">{fmt(booking.totalPrice)}</span>
              </div>
              {booking.amountPaid ? (
                <div className="flex justify-between items-center text-sm py-1 text-emerald-700">
                  <span>Amount Paid</span>
                  <span className="font-bold">{fmt(booking.amountPaid)}</span>
                </div>
              ) : null}
               {booking.balanceDue && booking.balanceDue > 0 ? (
                 <div className="flex justify-between items-center text-sm pt-1 text-brand-orange font-bold">
                   <span>Balance Payable at Location</span>
                   <span className="text-base">{fmt(booking.balanceDue)}</span>
                 </div>
               ) : null}
             </div>

             {/* Guest-submitted enquiry details */}
             {(booking.specialReqs || booking.whatsappConsent) && (
               <div className="my-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                 <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                   Your Enquiry Details
                 </p>
                 {booking.specialReqs && (
                   <p className="text-xs text-gray-600 whitespace-pre-wrap">
                     <strong>Special Requests / Notes:</strong> {booking.specialReqs}
                   </p>
                 )}
                 {booking.whatsappConsent && (
                   <p className="text-xs text-gray-600 mt-1.5 flex items-center gap-1.5">
                     <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                     WhatsApp updates &amp; coordination opted-in.
                   </p>
                 )}
               </div>
             )}

             {/* Guidelines & Support Footer */}
            <div className="mt-5 pt-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs text-gray-500">
              <div>
                <p className="font-semibold text-gray-700 mb-1">Important Instructions:</p>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-gray-500">
                  <li>Please carry a valid photo ID proof for all travelers.</li>
                  <li>Report at the activity base / pickup point 30 mins prior to schedule.</li>
                </ul>
              </div>

              <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100 text-left sm:text-right shrink-0">
                <p className="text-[10px] text-gray-400 uppercase font-bold">24/7 Helpline</p>
                <p className="font-bold text-brand-dark text-xs">+91 63969 19007</p>
                <p className="text-[10px] text-gray-500">connect@divinetravels.in</p>
              </div>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 print:hidden">
            <div className="flex items-center gap-2">
              {booking.balanceDue && booking.balanceDue > 0 ? (
                <Button
                  onClick={handlePayDueBalance}
                  disabled={isPaying}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2 font-semibold shadow-md text-xs sm:text-sm"
                >
                  <CreditCard className="w-4 h-4" />
                  {isPaying ? 'Connecting Payment...' : `Pay Due Balance (${fmt(booking.balanceDue)})`}
                </Button>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onClose} className="rounded-xl">
                Close
              </Button>
              <Button
                onClick={handlePrint}
                className="bg-brand-orange hover:bg-brand-orange/90 text-white rounded-xl gap-2 font-semibold shadow-md"
              >
                <Download className="w-4 h-4" />
                Download Voucher
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
