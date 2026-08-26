import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  isValidBookingType,
  fetchBooking,
  fetchOffers,
  fetchReceipts,
  computeSummary,
  bookingOwnerId,
} from '@/lib/booking-service'

async function getUser(req: Request) {
  const userId = req.headers.get('x-user-id')
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
    if (user.role !== 'admin' && !isUnowned && ownerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const booking = await fetchBooking(type as any, id)
    const offers = await fetchOffers(type as any, id)
    const receipts = await fetchReceipts(type as any, id)
    const summary = await computeSummary(type as any, booking)

    return NextResponse.json({ booking, offers, receipts, summary })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to fetch booking' }, { status: 500 })
  }
}
