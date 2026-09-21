import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { notifyUser } from '@/lib/notify'
import { getUserIdFromRequest } from '@/lib/get-user-id'

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const now = new Date()
    let cancelledCount = 0

    const expiredPackages = await db.packageBooking.findMany({
      where: { status: 'confirmed', paymentStatus: 'pending' },
      include: { package: { select: { name: true } } },
    })

    for (const booking of expiredPackages) {
      try {
        let notes: any = null
        try {
          notes = JSON.parse(booking.additionalNotes || '{}')
        } catch {
          const m = (booking.additionalNotes || '').match(/\{[^{}]*"advanceRequired"[^{}]*\}/)
          if (m) notes = JSON.parse(m[0])
        }
        if (notes && notes.advanceDeadline && notes.advanceRequired) {
          const deadline = new Date(notes.advanceDeadline)
          if (deadline < now) {
            await db.packageBooking.update({
              where: { id: booking.id },
              data: { status: 'cancelled' },
            })

            const title = booking.package?.name || 'Adventure Package'
            notifyUser(
              booking.userId,
              `Booking Cancelled: ${title}`,
              `Your booking for "${title}" has been cancelled because the 10% advance payment was not received within 24 hours. Please contact us to rebook.`,
              'booking-cancelled'
            )
            cancelledCount++
          }
        }
      } catch {}
    }

    const expiredTours = await db.tourBooking.findMany({
      where: { status: 'confirmed', paymentStatus: 'pending' },
    })

    for (const booking of expiredTours) {
      try {
        const notes = JSON.parse(booking.adminNotes || '{}')
        if (notes.advanceDeadline && notes.advanceRequired) {
          const deadline = new Date(notes.advanceDeadline)
          if (deadline < now) {
            await db.tourBooking.update({
              where: { id: booking.id },
              data: { status: 'cancelled' },
            })

            const title = booking.destination || booking.packageType || 'Day Tour'
            if (booking.userId) {
              notifyUser(
                booking.userId,
                `Booking Cancelled: ${title}`,
                `Your booking for "${title}" has been cancelled because the 10% advance payment was not received within 24 hours. Please contact us to rebook.`,
                'booking-cancelled'
              )
            }
            cancelledCount++
          }
        }
      } catch {}
    }

    const expiredDestinations = await db.booking.findMany({
      where: { status: 'confirmed', paymentStatus: 'pending' },
      include: { destination: { select: { name: true } } },
    })

    for (const booking of expiredDestinations) {
      try {
        const specialReqs = booking.specialReqs || ''
        const deadlineMatch = specialReqs.match(/\[advanceDeadline:([^\]]+)\]/)
        const requiredMatch = specialReqs.match(/\[advanceRequired:([^\]]+)\]/)

        if (deadlineMatch && requiredMatch && requiredMatch[1] === 'true') {
          const deadline = new Date(deadlineMatch[1])
          if (deadline < now) {
            await db.booking.update({
              where: { id: booking.id },
              data: { status: 'cancelled' },
            })

            const title = booking.destination?.name || 'Stay / Destination'
            notifyUser(
              booking.userId,
              `Booking Cancelled: ${title}`,
              `Your booking for "${title}" has been cancelled because the 10% advance payment was not received within 24 hours. Please contact us to rebook.`,
              'booking-cancelled'
            )
            cancelledCount++
          }
        }
      } catch {}
    }

    return NextResponse.json({
      success: true,
      cancelledCount,
      message: `Cancelled ${cancelledCount} expired booking(s)`,
    })
  } catch (error) {
    console.error('Error cancelling expired advance bookings:', error)
    return NextResponse.json({ error: 'Failed to cancel expired bookings' }, { status: 500 })
  }
}
