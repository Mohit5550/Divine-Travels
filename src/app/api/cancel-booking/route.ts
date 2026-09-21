import { NextRequest, NextResponse } from 'next/server'
import { processCancellation } from '@/lib/refund'
import { getUserIdFromRequest } from '@/lib/get-user-id'

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const { bookingType, bookingId, reason } = body

    if (!bookingType || !bookingId) {
      return NextResponse.json({ error: 'bookingType and bookingId are required' }, { status: 400 })
    }

    if (!['tour', 'package', 'destination'].includes(bookingType)) {
      return NextResponse.json({ error: 'Invalid booking type' }, { status: 400 })
    }

    const result = await processCancellation(bookingType, bookingId, userId, reason)

    return NextResponse.json({
      success: true,
      message: result.refund
        ? `Booking cancelled. Refund of ₹${result.refund.refundAmount} (${result.refund.label}) will be processed.`
        : 'Booking cancelled successfully.',
      refund: result.refund,
      refundId: result.refundId,
    })
  } catch (error: any) {
    console.error('Cancel booking error:', error)
    const message = error.message || 'Failed to cancel booking'
    const status = message === 'Booking not found' ? 404
      : message === 'Unauthorized' ? 403
      : message === 'Booking already cancelled' ? 409
      : 500
    return NextResponse.json({ error: message }, { status })
  }
}
