import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserIdFromRequest } from '@/lib/get-user-id'
import {
  isValidBookingType,
  fetchBooking,
  bookingOwnerId,
  getBookingDelegate,
  notifyUser,
} from '@/lib/booking-service'

async function getUser(req: Request) {
  const userId = getUserIdFromRequest(req)
  if (!userId) return null
  return db.user.findUnique({ where: { id: userId } })
}

export async function POST(req: Request, { params }: { params: Promise<{ type: string; id: string }> }) {
  try {
    const { type, id } = await params
    if (!isValidBookingType(type)) return NextResponse.json({ error: 'Invalid booking type' }, { status: 400 })

    const user = await getUser(req)
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    if (user.role !== 'admin') return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

    const booking = await fetchBooking(type as any, id)

    // Extract user's proposed amount from adminNotes
    let adminNotes: any = {}
    try { adminNotes = JSON.parse(booking.adminNotes || '{}') } catch { /* ignore */ }
    const userAmount = Number(adminNotes.bookingAmount)
    if (!userAmount || userAmount <= 0) {
      return NextResponse.json({ error: 'No user-proposed amount found on this booking' }, { status: 400 })
    }

    // Only allow if no agreement exists yet
    if (booking.negotiatedPrice != null || booking.priceLocked) {
      return NextResponse.json({ error: 'Price already agreed on this booking' }, { status: 400 })
    }

    // Create an accepted offer record and update the booking in a transaction.
    // Cast: delegate update returns Promise<any>, not PrismaPromise (runtime is identical).
    await db.$transaction([
      db.bookingOffer.create({
        data: {
          bookingType: type,
          bookingId: id,
          offeredBy: 'admin',
          amount: userAmount,
          note: 'Accepted user\'s proposed amount',
          status: 'accepted',
        },
      }),
      // Reject any other pending offers
      db.bookingOffer.updateMany({
        where: { bookingType: type, bookingId: id, status: 'pending' },
        data: { status: 'rejected' },
      }),
      getBookingDelegate(type as any).update({
        where: { id },
        data: {
          negotiatedPrice: userAmount,
          priceLocked: true,
          status: 'confirmed',
        },
      }),
    ] as any)

    const ownerId = await bookingOwnerId(type as any, id)
    if (ownerId) {
      await notifyUser(
        ownerId,
        'Booking Confirmed',
        `Your booking is confirmed at ₹${userAmount}. Pay 10% advance to lock it.`,
        'booking',
        '/?view=user-dashboard'
      )
    }

    return NextResponse.json({
      success: true,
      booking: { negotiatedPrice: userAmount, priceLocked: true, status: 'confirmed' },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to accept amount' }, { status: 500 })
  }
}
