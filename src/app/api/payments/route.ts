import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    const payments = await db.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })
    return NextResponse.json(payments)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const { pkgBookingId, amount, transactionId, status, method } = body

    if (!amount || !transactionId) {
      return NextResponse.json({ error: 'Amount and transaction ID are required' }, { status: 400 })
    }

    const payment = await db.payment.create({
      data: {
        userId,
        pkgBookingId: pkgBookingId || null,
        amount: Number(amount),
        method: method || 'online',
        transactionId: transactionId,
        status: status || 'completed',
      },
    })

    return NextResponse.json(payment, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 })
  }
}
