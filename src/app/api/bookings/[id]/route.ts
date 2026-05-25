import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/bookings/[id] - Get booking detail
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const booking = await db.booking.findUnique({
      where: { id },
      include: {
        destination: true,
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    return NextResponse.json(booking)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/bookings/[id] - Update booking status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const user = await db.user.findUnique({ where: { id: userId } })
    const body = await request.json()
    const { status, paymentStatus } = body

    const booking = await db.booking.findUnique({ where: { id } })
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Admin can confirm/cancel/complete any booking
    // User can only cancel their own booking
    if (user?.role !== 'admin') {
      if (booking.userId !== userId) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
      if (status && status !== 'cancelled') {
        return NextResponse.json({ error: 'Users can only cancel bookings' }, { status: 403 })
      }
    }

    const updateData: Record<string, unknown> = {}
    if (status) updateData.status = status
    if (paymentStatus) updateData.paymentStatus = paymentStatus

    // If confirming, also set payment to paid
    if (status === 'confirmed') {
      updateData.paymentStatus = 'paid'
    }
    if (status === 'cancelled') {
      updateData.paymentStatus = 'refunded'
    }

    const updated = await db.booking.update({
      where: { id },
      data: updateData,
      include: { destination: true, user: { select: { id: true, name: true, email: true } } },
    })

    return NextResponse.json(updated)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
