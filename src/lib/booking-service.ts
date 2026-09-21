import { db } from '@/lib/db'
import { notifyUser, notifyAdmin } from '@/lib/notify'

export const BOOKING_TYPES = ['tour', 'package', 'destination'] as const
export type BookingType = (typeof BOOKING_TYPES)[number]

const ADVANCE_RATE = 0.1

// Structural delegate type: the three booking delegates have incompatible
// generated `update` signatures, so callers use this uniform `any`-args shape.
export interface AnyBookingDelegate {
  findUnique: (args: any) => Promise<any>
  findFirst?: (args: any) => Promise<any>
  findMany?: (args: any) => Promise<any[]>
  create?: (args: any) => Promise<any>
  update: (args: any) => Promise<any>
  updateMany?: (args: any) => Promise<any>
  delete?: (args: any) => Promise<any>
  count?: (args: any) => Promise<number>
}

function delegate(type: BookingType): AnyBookingDelegate {
  switch (type) {
    case 'tour':
      return db.tourBooking
    case 'package':
      return db.packageBooking
    case 'destination':
      return db.booking
    default:
      throw new Error('Invalid booking type')
  }
}

export function getBookingDelegate(type: BookingType) {
  return delegate(type)
}

export function isValidBookingType(t: string): t is BookingType {
  return (BOOKING_TYPES as readonly string[]).includes(t)
}

export async function fetchBooking(type: BookingType, id: string) {
  const row = await delegate(type).findUnique({ where: { id } })
  if (!row) throw new Error('Booking not found')
  return row as any
}

export function effectivePrice(booking: any): number {
  const base =
    booking.negotiatedPrice != null
      ? booking.negotiatedPrice
      : booking.totalPrice != null
      ? booking.totalPrice
      : 0
  return Math.max(0, Math.round(base))
}

export function advanceDue(total: number): number {
  return Math.ceil(total * ADVANCE_RATE)
}

export interface PriceSummary {
  total: number
  advanceDue: number
  paid: number
  balanceDue: number
  advancePaid: boolean
  fullyPaid: boolean
  priceLocked: boolean
  isConfirmed: boolean
  paymentStatus: string
}

export async function computeSummary(type: BookingType, booking: any): Promise<PriceSummary> {
  const total = effectivePrice(booking)
  const receipts = await db.paymentReceipt.findMany({
    where: { bookingType: type, bookingId: booking.id, status: 'completed' },
  })
  const paid = receipts.reduce((sum: number, r: any) => sum + (r.amount || 0), 0)
  const adv = advanceDue(total)
  const balanceDue = Math.max(0, total - paid)
  const advancePaid = paid >= adv && total > 0
  const fullyPaid = paid >= total && total > 0
  const priceLocked = !!booking.priceLocked
  const isConfirmed = booking.status === 'confirmed'
  let paymentStatus = 'payment_pending'
  if (fullyPaid) paymentStatus = 'completed'
  else if (advancePaid) paymentStatus = 'advance_paid'
  else if (paid > 0) paymentStatus = 'partial'
  return {
    total,
    advanceDue: adv,
    paid,
    balanceDue,
    advancePaid,
    fullyPaid,
    priceLocked,
    isConfirmed,
    paymentStatus,
  }
}

export async function fetchOffers(type: BookingType, id: string) {
  return db.bookingOffer.findMany({
    where: { bookingType: type, bookingId: id },
    orderBy: { createdAt: 'desc' },
  })
}

export async function fetchReceipts(type: BookingType, id: string) {
  return db.paymentReceipt.findMany({
    where: { bookingType: type, bookingId: id, status: 'completed' },
    orderBy: { createdAt: 'asc' },
  })
}

// Resolve the owning user of a booking (for notifications / authz)
export async function bookingOwnerId(type: BookingType, id: string): Promise<string | null> {
  const row = (await delegate(type).findUnique({ where: { id }, select: { userId: true } })) as any
  return row?.userId || null
}

export { notifyUser, notifyAdmin }
