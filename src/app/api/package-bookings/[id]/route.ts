import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/package-bookings/[id] - Get booking details
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const booking = await db.packageBooking.findUnique({
      where: { id },
      include: {
        package: true,
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    return NextResponse.json(booking)
  } catch (error) {
    console.error('Error fetching package booking:', error)
    return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 })
  }
}

// PUT /api/package-bookings/[id] - Update booking status
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const { status } = body

    if (!status || !['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      return NextResponse.json({ error: 'Valid status is required (pending, confirmed, cancelled, completed)' }, { status: 400 })
    }

    const user = await db.user.findUnique({ where: { id: userId } })

    // Only admin can confirm/cancel/complete bookings
    if (user?.role !== 'admin') {
      // Regular users can only cancel their own bookings
      if (status !== 'cancelled') {
        return NextResponse.json({ error: 'Only admin can update booking status' }, { status: 403 })
      }
      const existing = await db.packageBooking.findUnique({ where: { id } })
      if (!existing || existing.userId !== userId) {
        return NextResponse.json({ error: 'You can only cancel your own bookings' }, { status: 403 })
      }
    }

    const booking = await db.packageBooking.update({
      where: { id },
      data: { status },
      include: {
        package: {
          select: { name: true, subtitle: true, image: true },
        },
        user: {
          select: { name: true, email: true },
        },
      },
    })

    return NextResponse.json(booking)
  } catch (error: unknown) {
    console.error('Error updating package booking:', error)
    if (error && typeof error === 'object' && 'code' in error && (error as { code: string }).code === 'P2025') {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 })
  }
}
