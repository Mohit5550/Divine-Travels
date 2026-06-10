import { NextRequest, NextResponse } from 'next/server'
import { checkPaymentStatus } from '@/lib/kwikupi'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const paymentId = searchParams.get('payment_id')

    if (!paymentId) {
      return NextResponse.json({ error: 'payment_id is required' }, { status: 400 })
    }

    const status = await checkPaymentStatus(paymentId)

    return NextResponse.json({
      payment_id: status.payment_id,
      order_id: status.order_id,
      status: status.status,
      amount: status.amount,
    })
  } catch (error: any) {
    console.error('Payment verification error:', error)
    return NextResponse.json({ error: error.message || 'Failed to verify payment' }, { status: 500 })
  }
}
