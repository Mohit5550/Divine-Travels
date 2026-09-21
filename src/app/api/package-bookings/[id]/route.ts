import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { notifyAdmin, notifyUser } from '@/lib/notify'
import { checkPaymentStatus } from '@/lib/kwikupi'
import { getUserIdFromRequest } from '@/lib/get-user-id'

// GET /api/package-bookings/[id] - Get booking details
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

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

    // Only allow booking owner or admin to view
    const user = await db.user.findUnique({ where: { id: userId }, select: { role: true } })
    if (user?.role !== 'admin' && booking.userId !== userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
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
    const userId = getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const { status, paymentId, paymentOrderId, paymentStatus, paymentAmount, paymentCompletedAt } = body

    const user = await db.user.findUnique({ where: { id: userId } })

    // If updating status, validate it
    if (status) {
      const VALID_STATUSES = [
        'pending',
        'confirmed',
        'approved',
        'ready',
        'assigned',
        'in_progress',
        'completed',
        'cancelled',
        'rejected',
      ]
      if (!VALID_STATUSES.includes(status)) {
        return NextResponse.json({ error: 'Valid status is required' }, { status: 400 })
      }

      // Only admin can confirm/cancel/complete bookings
      if (user?.role !== 'admin') {
        if (status !== 'cancelled') {
          return NextResponse.json({ error: 'Only admin can update booking status' }, { status: 403 })
        }
        const existing = await db.packageBooking.findUnique({ where: { id } })
        if (!existing || existing.userId !== userId) {
          return NextResponse.json({ error: 'You can only cancel your own bookings' }, { status: 403 })
        }
      }
    }

    // Server-side payment verification: a non-admin marking a booking as paid
    // must prove the payment actually succeeded at the gateway. This prevents a
    // user from marking their own booking "completed" without ever paying.
    if (paymentStatus === 'completed' && user?.role !== 'admin') {
      if (!paymentId) {
        return NextResponse.json(
          { error: 'Payment reference is required to mark this booking as paid' },
          { status: 400 }
        )
      }
      try {
        const gw = await checkPaymentStatus(String(paymentId))
        const paidStatuses = ['TXN_SUCCESS', 'SUCCESS', 'COMPLETED', 'CAPTURED']
        if (!paidStatuses.includes((gw.status || '').toUpperCase())) {
          return NextResponse.json(
            { error: 'Payment has not been completed at the gateway', paymentStatus: gw.status },
            { status: 402 }
          )
        }
      } catch {
        return NextResponse.json(
          { error: 'Could not verify payment with the gateway' },
          { status: 502 }
        )
      }
    }

    const updateData: Record<string, any> = {}
    if (status) updateData.status = status
    if (paymentId) updateData.paymentId = String(paymentId)
    if (paymentOrderId) updateData.paymentOrderId = String(paymentOrderId)
    if (paymentStatus) updateData.paymentStatus = String(paymentStatus)
    if (paymentAmount !== undefined) updateData.paymentAmount = Math.round(Number(paymentAmount))
    if (paymentCompletedAt) updateData.paymentCompletedAt = new Date(paymentCompletedAt)

    const booking = await db.packageBooking.update({
      where: { id },
      data: updateData,
      include: {
        package: {
          select: { name: true, category: true, subtitle: true, image: true },
        },
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    })

    // Create a Payment record when payment is completed
    if (paymentStatus === 'completed' && paymentId) {
      try {
        await db.payment.create({
          data: {
            userId: booking.user.id,
            pkgBookingId: booking.id,
            amount: paymentAmount || booking.totalPrice || 0,
            method: 'online',
            transactionId: paymentId,
            status: 'completed',
          },
        })
      } catch (err) {
        console.error('Failed to create payment record:', err)
      }
    }

    // Notify customer about status change
    if (status && user?.role === 'admin' && booking.user.id !== userId) {
      const statusMessages: Record<string, string> = {
        confirmed: `Your booking for "${booking.package.name}" has been confirmed! Click to view and pay.`,
        cancelled: `Your booking for "${booking.package.name}" has been cancelled.`,
        completed: `Your booking for "${booking.package.name}" has been marked as completed.`,
      }
      const msg = statusMessages[status]
      if (msg) {
        notifyUser(booking.user.id, 'Booking Update', msg, 'booking', 'dashboard')
      }
    }

    return NextResponse.json(booking)
  } catch (error: unknown) {
    console.error('Error updating package booking:', error)
    if (error && typeof error === 'object' && 'code' in error && (error as { code: string }).code === 'P2025') {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 })
  }
}
