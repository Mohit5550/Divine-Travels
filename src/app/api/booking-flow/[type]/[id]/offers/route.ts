import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserIdFromRequest } from '@/lib/get-user-id'
import {
  isValidBookingType,
  fetchBooking,
  fetchOffers,
  bookingOwnerId,
  notifyUser,
  notifyAdmin,
} from '@/lib/booking-service'

async function getUser(req: Request) {
  const userId = getUserIdFromRequest(req)
  if (!userId) return null
  return db.user.findUnique({ where: { id: userId } })
}

export async function GET(req: Request, { params }: { params: Promise<{ type: string; id: string }> }) {
  try {
    const { type, id } = await params
    if (!isValidBookingType(type)) return NextResponse.json({ error: 'Invalid booking type' }, { status: 400 })
    const user = await getUser(req)
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    const ownerId = await bookingOwnerId(type as any, id)
    const isUnowned = !ownerId
    if (user.role !== 'admin' && !isUnowned && ownerId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const offers = await fetchOffers(type as any, id)
    return NextResponse.json(offers)
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed' }, { status: 500 })
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ type: string; id: string }> }) {
  try {
    const { type, id } = await params
    if (!isValidBookingType(type)) return NextResponse.json({ error: 'Invalid booking type' }, { status: 400 })

    const user = await getUser(req)
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

    const body = await req.json()
    const amount = Math.round(Number(body.amount))
    if (!amount || amount <= 0) return NextResponse.json({ error: 'Valid amount required' }, { status: 400 })

    const ownerId = await bookingOwnerId(type as any, id)
    if (user.role !== 'admin' && ownerId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const offeredBy = body.offeredBy === 'admin' ? 'admin' : 'user'
    if (offeredBy === 'admin' && user.role !== 'admin') {
      return NextResponse.json({ error: 'Only admin can send admin offers' }, { status: 403 })
    }
    if (offeredBy === 'user' && user.role !== 'admin' && ownerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const booking = await fetchBooking(type as any, id)

    // Counter-offer: mark the other party's still-pending offers as countered
    await db.bookingOffer.updateMany({
      where: { bookingType: type, bookingId: id, offeredBy: offeredBy === 'admin' ? 'user' : 'admin', status: 'pending' },
      data: { status: 'countered' },
    })

    const offer = await db.bookingOffer.create({
      data: {
        bookingType: type,
        bookingId: id,
        offeredBy,
        amount,
        note: body.note || null,
        status: 'pending',
      },
    })

    if (offeredBy === 'admin') {
      if (ownerId) await notifyUser(ownerId, 'New Price Offer', `Admin offered ₹${amount} for your booking. Accept or counter it.`, 'offer', '/?view=user-dashboard')
    } else {
      await notifyAdmin('Counter Offer from User', `${booking.name} offered ₹${amount} for a booking`, 'offer', '/admin')
    }

    return NextResponse.json(offer, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to create offer' }, { status: 500 })
  }
}
