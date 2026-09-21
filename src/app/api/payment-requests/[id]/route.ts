import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromToken } from '@/lib/with-auth'

// PUT /api/payment-requests/[id] - User marks payment request as paid
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { id } = await params
    const paymentRequest = await db.paymentRequest.findUnique({ where: { id } })

    if (!paymentRequest) {
      return NextResponse.json({ error: 'Payment request not found' }, { status: 404 })
    }

    if (paymentRequest.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (paymentRequest.status !== 'pending') {
      return NextResponse.json({ error: 'Payment request already processed' }, { status: 400 })
    }

    const updated = await db.paymentRequest.update({
      where: { id },
      data: { status: 'paid', paidAmount: paymentRequest.balanceAmount, updatedAt: new Date() },
    })

    await db.notification.create({
      data: {
        userId: user.id,
        title: 'Payment Completed',
        message: `Payment of ₹${paymentRequest.balanceAmount} for ${paymentRequest.bookingType} has been completed.`,
        type: 'payment_completed',
        link: '/dashboard',
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Update payment request error:', error)
    return NextResponse.json({ error: 'Failed to update payment request' }, { status: 500 })
  }
}
