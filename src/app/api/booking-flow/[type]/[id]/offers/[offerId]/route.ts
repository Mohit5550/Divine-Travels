import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  isValidBookingType,
  fetchBooking,
  bookingOwnerId,
  notifyUser,
  notifyAdmin,
} from '@/lib/booking-service'

async function getUser(req: Request) {
  const userId = req.headers.get('x-user-id')
  if (!userId) return null
  return db.user.findUnique({ where: { id: userId } })
}

export async function POST(req: Request, { params }: { params: Promise<{ type: string; id: string; offerId: string }> }) {
  try {
    const { type, id, offerId } = await params
    if (!isValidBookingType(type)) return NextResponse.json({ error: 'Invalid booking type' }, { status: 400 })

    const user = await getUser(req)
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

    const offer = await db.bookingOffer.findUnique({ where: { id: offerId } })
    if (!offer || offer.bookingType !== type || offer.bookingId !== id) {
      return NextResponse.json({ error: 'Offer not found' }, { status: 404 })
    }
    if (offer.status !== 'pending') return NextResponse.json({ error: 'Offer already resolved' }, { status: 400 })

    const ownerId = await bookingOwnerId(type as any, id)
    const isUnowned = !ownerId
    if (user.role !== 'admin' && !isUnowned && ownerId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    // Only the opposite party can accept: admin offers accepted by owner, user offers by admin.
    // An unowned inquiry (userId not set) can be claimed by the authenticated user accepting it.
    const canAccept =
      (offer.offeredBy === 'admin' && (ownerId === user.id || isUnowned)) ||
      (offer.offeredBy === 'user' && user.role === 'admin')
    if (!canAccept) {
      return NextResponse.json({ error: 'You cannot accept this offer' }, { status: 403 })
    }

    const booking = await fetchBooking(type as any, id)

    await db.$transaction([
      db.bookingOffer.update({ where: { id: offerId }, data: { status: 'accepted' } }),
      db.bookingOffer.updateMany({
        where: { bookingType: type, bookingId: id, id: { not: offerId }, status: { in: ['pending', 'countered'] } },
        data: { status: 'rejected' },
      }),
      (await import('@/lib/booking-service')).getBookingDelegate(type as any).update({
        where: { id },
        data: {
          negotiatedPrice: offer.amount,
          priceLocked: true,
          status: 'confirmed',
          ...(isUnowned ? { userId: user.id } : {}),
        },
      }),
    ])

    if (offer.offeredBy === 'admin') {
      if (ownerId) await notifyUser(ownerId, 'Offer Accepted', `Your booking is confirmed at ₹${offer.amount}. Pay 10% advance to lock it.`, 'booking', '/?view=user-dashboard')
    } else {
      await notifyAdmin('User Accepted Your Offer', `Booking confirmed at ₹${offer.amount}`, 'booking', '/admin')
    }

    return NextResponse.json({ success: true, offer, booking: { negotiatedPrice: offer.amount, priceLocked: true, status: 'confirmed' } })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to accept offer' }, { status: 500 })
  }
}
