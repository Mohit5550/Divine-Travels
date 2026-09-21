import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromToken } from '@/lib/with-auth'

// POST /api/admin/payment-requests - Admin creates a payment request
export async function POST(request: NextRequest) {
  try {
    const admin = await getUserFromToken(request)
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { bookingType, bookingId, userId, amount, balanceAmount, message } = body

    if (!userId || !bookingType || !bookingId || !amount || !balanceAmount) {
      return NextResponse.json({ error: 'userId, bookingType, bookingId, amount, and balanceAmount are required' }, { status: 400 })
    }

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const paymentRequest = await db.paymentRequest.create({
      data: {
        bookingType,
        bookingId,
        userId,
        amount,
        paidAmount: 0,
        balanceAmount,
        message: message || null,
        status: 'pending',
      },
    })

    // Send notification to user
    await db.notification.create({
      data: {
        userId,
        title: 'Payment Request',
        message: `You have a payment request of ₹${balanceAmount} for ${bookingType}. Please complete the payment.`,
        type: 'payment_request',
        link: `/dashboard`,
      },
    })

    return NextResponse.json(paymentRequest, { status: 201 })
  } catch (error) {
    console.error('Create payment request error:', error)
    return NextResponse.json({ error: 'Failed to create payment request' }, { status: 500 })
  }
}

// GET /api/admin/payment-requests - Admin lists all payment requests
export async function GET(request: NextRequest) {
  try {
    const admin = await getUserFromToken(request)
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || ''
    const where: Record<string, unknown> = {}
    if (status) where.status = status

    const paymentRequests = await db.paymentRequest.findMany({
      where,
      include: {
        user: { select: { name: true, email: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(paymentRequests)
  } catch (error) {
    console.error('Get payment requests error:', error)
    return NextResponse.json({ error: 'Failed to fetch payment requests' }, { status: 500 })
  }
}
