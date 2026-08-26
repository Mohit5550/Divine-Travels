import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isValidBookingType, fetchBooking, bookingOwnerId, computeSummary, notifyUser } from '@/lib/booking-service'

async function getUser(req: Request) {
  const userId = req.headers.get('x-user-id')
  if (!userId) return null
  return db.user.findUnique({ where: { id: userId } })
}

export async function POST(req: Request, { params }: { params: Promise<{ type: string; id: string }> }) {
  try {
    const { type, id } = await params
    if (!isValidBookingType(type)) return NextResponse.json({ error: 'Invalid booking type' }, { status: 400 })
    const user = await getUser(req)
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const ownerId = await bookingOwnerId(type as any, id)
    if (!ownerId) return NextResponse.json({ error: 'No user on this booking' }, { status: 400 })

    const booking = await fetchBooking(type as any, id)
    const summary = await computeSummary(type as any, booking)
    const label = summary.advancePaid ? `balance of ₹${summary.balanceDue}` : `10% advance of ₹${summary.advanceDue}`
    await notifyUser(ownerId, 'Payment Requested', `Please pay the ${label} for your booking.`, 'payment', '/?view=user-dashboard')

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed' }, { status: 500 })
  }
}
