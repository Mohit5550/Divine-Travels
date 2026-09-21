import { db } from '@/lib/db'
import { notifyUser, notifyAdmin } from '@/lib/notify'

export interface RefundCalculation {
  refundPct: number
  refundAmount: number
  amountPaid: number
  daysBefore: number
  label: string
}

const TOUR_TIERS = [
  { minDays: 30, pct: 90, label: '90% refund' },
  { minDays: 15, pct: 75, label: '75% refund' },
  { minDays: 7, pct: 50, label: '50% refund' },
  { minDays: 3, pct: 25, label: '25% refund' },
  { minDays: 0, pct: 0, label: 'No refund' },
]

const ADVENTURE_TIERS = [
  { minDays: 1, pct: 100, label: '100% refund' },
  { minDays: 0.5, pct: 50, label: '50% refund' },
  { minDays: 0, pct: 0, label: 'No refund' },
]

const RENTAL_TIERS = [
  { minDays: 1, pct: 100, label: '100% refund' },
  { minDays: 0.5, pct: 50, label: '50% refund' },
  { minDays: 0, pct: 0, label: 'No refund' },
]

function getTier(daysBefore: number, tiers: typeof TOUR_TIERS) {
  for (const t of tiers) {
    if (daysBefore >= t.minDays) return t
  }
  return tiers[tiers.length - 1]
}

export function calculateRefund(
  bookingType: string,
  category: string | null,
  travelDate: Date | string,
  amountPaid: number,
): RefundCalculation {
  const now = new Date()
  const travel = new Date(travelDate)
  const diffMs = travel.getTime() - now.getTime()
  const daysBefore = Math.max(0, diffMs / (1000 * 60 * 60 * 24))

  let tiers = TOUR_TIERS
  if (category === 'bike-rental' || bookingType === 'taxi') {
    tiers = RENTAL_TIERS
  } else if (category === 'adventure' || category === 'rafting') {
    tiers = ADVENTURE_TIERS
  }

  const tier = getTier(daysBefore, tiers)
  const refundAmount = Math.round(amountPaid * tier.pct / 100)

  return {
    refundPct: tier.pct,
    refundAmount,
    amountPaid,
    daysBefore: Math.floor(daysBefore),
    label: tier.label,
  }
}

export async function processCancellation(
  bookingType: 'tour' | 'package' | 'destination',
  bookingId: string,
  userId: string,
  reason?: string,
) {
  let booking: any = null
  let travelDate: Date | null = null
  let amountPaid = 0
  let totalAmount = 0
  let category: string | null = null
  let bookingTitle = ''

  if (bookingType === 'package') {
    booking = await db.packageBooking.findUnique({
      where: { id: bookingId },
      include: { package: { select: { name: true, category: true } } },
    })
    if (!booking) throw new Error('Booking not found')
    if (booking.userId !== userId) throw new Error('Unauthorized')
    if (booking.status === 'cancelled') throw new Error('Booking already cancelled')
    travelDate = booking.preferredDate
    totalAmount = booking.negotiatedPrice || booking.totalPrice || 0
    category = booking.package?.category || null
    bookingTitle = booking.package?.name || 'Package'

    const receipts = await db.paymentReceipt.findMany({
      where: { bookingType: 'package', bookingId, status: 'completed' },
    })
    amountPaid = receipts.reduce((sum: number, r: any) => sum + (r.amount || 0), 0)
    if (!amountPaid) amountPaid = booking.paymentAmount || 0

    await db.packageBooking.update({
      where: { id: bookingId },
      data: { status: 'cancelled' },
    })
  } else if (bookingType === 'destination') {
    booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: { destination: { select: { name: true } } },
    })
    if (!booking) throw new Error('Booking not found')
    if (booking.userId !== userId) throw new Error('Unauthorized')
    if (booking.status === 'cancelled') throw new Error('Booking already cancelled')
    travelDate = booking.checkIn
    totalAmount = booking.negotiatedPrice || booking.totalPrice || 0
    bookingTitle = booking.destination?.name || 'Destination'

    const receipts = await db.paymentReceipt.findMany({
      where: { bookingType: 'destination', bookingId, status: 'completed' },
    })
    amountPaid = receipts.reduce((sum: number, r: any) => sum + (r.amount || 0), 0)
    if (!amountPaid) amountPaid = booking.paymentAmount || 0

    await db.booking.update({
      where: { id: bookingId },
      data: { status: 'cancelled', paymentStatus: amountPaid > 0 ? 'refund_pending' : 'cancelled' },
    })
  } else if (bookingType === 'tour') {
    booking = await db.tourBooking.findUnique({ where: { id: bookingId } })
    if (!booking) throw new Error('Booking not found')
    if (booking.userId !== userId) throw new Error('Unauthorized')
    if (booking.status === 'cancelled') throw new Error('Booking already cancelled')
    travelDate = booking.travelDate ? new Date(booking.travelDate) : null
    totalAmount = booking.negotiatedPrice || booking.totalPrice || 0
    bookingTitle = booking.destination || 'Tour'

    const receipts = await db.paymentReceipt.findMany({
      where: { bookingType: 'tour', bookingId, status: 'completed' },
    })
    amountPaid = receipts.reduce((sum: number, r: any) => sum + (r.amount || 0), 0)
    if (!amountPaid) amountPaid = booking.paymentAmount || 0

    await db.tourBooking.update({
      where: { id: bookingId },
      data: { status: 'cancelled' },
    })
  }

  if (!booking) throw new Error('Booking not found')

  let refundInfo: RefundCalculation | null = null
  let refundId: string | null = null

  if (amountPaid > 0 && travelDate) {
    refundInfo = calculateRefund(bookingType, category, travelDate, amountPaid)

    const refund = await db.refund.create({
      data: {
        userId,
        bookingType,
        bookingId,
        bookingTitle,
        totalAmount,
        amountPaid,
        refundAmount: refundInfo.refundAmount,
        refundPct: refundInfo.refundPct,
        reason: reason || null,
        travelDate,
        daysBefore: refundInfo.daysBefore,
        status: 'pending',
      },
    })
    refundId = refund.id

    await db.notification.create({
      data: {
        userId,
        title: `Booking Cancelled: ${bookingTitle}`,
        message: `Your booking has been cancelled. Refund of ₹${refundInfo.refundAmount.toLocaleString('en-IN')} (${refundInfo.label}) will be processed. Please provide your UPI ID in your profile for refund.`,
        type: 'booking-cancelled',
        link: 'user-dashboard',
      },
    })
  } else {
    await db.notification.create({
      data: {
        userId,
        title: `Booking Cancelled: ${bookingTitle}`,
        message: `Your booking has been cancelled successfully.`,
        type: 'booking-cancelled',
        link: 'user-dashboard',
      },
    })
  }

  const user = await db.user.findUnique({ where: { id: userId }, select: { name: true, email: true, upiId: true } })
  await db.notification.create({
    data: {
      userId: (await db.user.findFirst({ where: { role: 'admin' } }))?.id || '',
      title: `Booking Cancelled by User`,
      message: `${user?.name || 'User'} cancelled "${bookingTitle}" (${bookingType}). ${refundInfo ? `Refund due: ₹${refundInfo.refundAmount} (${refundInfo.label}). UPI: ${user?.upiId || 'Not provided'}` : 'No payment to refund.'}`,
      type: 'booking-cancelled',
      link: 'admin-dashboard',
    },
  })

  return {
    cancelled: true,
    refund: refundInfo,
    refundId,
    bookingTitle,
  }
}
