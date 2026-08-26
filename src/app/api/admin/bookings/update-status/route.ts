import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { notifyUser } from '@/lib/notify'

const VALID_STATUSES = [
  'pending',
  'confirmed',
  'ready',
  'in_progress',
  'completed',
  'cancelled',
  'rejected',
]

const STATUS_LABELS: Record<string, string> = {
  pending: 'Received / Pending Verification',
  confirmed: 'Confirmed & Slot Reserved',
  ready: 'Guide / Cab / Camp Ready',
  in_progress: 'Activity / Ride In-Progress',
  completed: 'Trip Completed Successfully',
  cancelled: 'Booking Cancelled',
  rejected: 'Booking Rejected',
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const admin = await db.user.findUnique({ where: { id: userId } })
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { bookingId, type, status, note } = body

    if (!bookingId || !type || !status) {
      return NextResponse.json({ error: 'bookingId, type, and status are required' }, { status: 400 })
    }

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: `Invalid status: ${status}` }, { status: 400 })
    }

    let customerUserId: string | null = null
    let tripTitle = 'Trip'
    let updatedBooking: any = null

    if (type === 'package') {
      const existing = await db.packageBooking.findUnique({
        where: { id: bookingId },
        include: { package: { select: { name: true } } },
      })
      if (!existing) {
        return NextResponse.json({ error: 'Package booking not found' }, { status: 404 })
      }
      customerUserId = existing.userId
      tripTitle = existing.package?.name || 'Adventure Package'

      let newNotes = existing.additionalNotes || ''
      if (note) {
        newNotes = `${newNotes ? `${newNotes}\n` : ''}[Admin Update]: ${note}`
      }

      updatedBooking = await db.packageBooking.update({
        where: { id: bookingId },
        data: {
          status,
          ...(note ? { additionalNotes: newNotes } : {}),
        },
      })
    } else if (type === 'tour' || type === 'taxi') {
      const existing = await db.tourBooking.findUnique({
        where: { id: bookingId },
      })
      if (!existing) {
        return NextResponse.json({ error: 'Tour/Taxi booking not found' }, { status: 404 })
      }
      customerUserId = existing.userId
      tripTitle = existing.destination || existing.packageType || (type === 'taxi' ? 'Taxi Service' : 'Day Tour')

      let parsedNotes: Record<string, any> = {}
      try {
        parsedNotes = JSON.parse(existing.adminNotes || '{}')
      } catch {}

      if (note) {
        parsedNotes.operationalUpdate = note
        parsedNotes.updatedAt = new Date().toISOString()
      }

      updatedBooking = await db.tourBooking.update({
        where: { id: bookingId },
        data: {
          status,
          adminNotes: Object.keys(parsedNotes).length > 0 ? JSON.stringify(parsedNotes) : existing.adminNotes,
        },
      })
    } else if (type === 'destination') {
      const existing = await db.booking.findUnique({
        where: { id: bookingId },
        include: { destination: { select: { name: true } } },
      })
      if (!existing) {
        return NextResponse.json({ error: 'Destination booking not found' }, { status: 404 })
      }
      customerUserId = existing.userId
      tripTitle = existing.destination?.name || 'Stay / Destination'

      updatedBooking = await db.booking.update({
        where: { id: bookingId },
        data: {
          status,
          ...(note ? { specialReqs: `${existing.specialReqs ? `${existing.specialReqs} | ` : ''}[Admin Note: ${note}]` } : {}),
        },
      })
    } else {
      return NextResponse.json({ error: 'Unsupported booking type' }, { status: 400 })
    }

    // Notify customer in real-time
    if (customerUserId) {
      const statusText = STATUS_LABELS[status] || status
      const msg = note
        ? `Your booking for "${tripTitle}" is now marked: ${statusText}. Note: ${note}`
        : `Your booking for "${tripTitle}" has been updated to: ${statusText}.`
      notifyUser(customerUserId, `Trip Update: ${tripTitle}`, msg, 'status')
    }

    return NextResponse.json({
      success: true,
      status,
      booking: updatedBooking,
    })
  } catch (error) {
    console.error('Error updating booking status:', error)
    return NextResponse.json({ error: 'Failed to update booking status' }, { status: 500 })
  }
}
