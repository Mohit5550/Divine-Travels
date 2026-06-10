import { NextRequest, NextResponse } from 'next/server'
import { createPayment, generateOrderId } from '@/lib/kwikupi'

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const { customer_name, customer_email, booking_id, service, amount } = body

    if (!amount || amount < 1) {
      return NextResponse.json({ error: 'Valid amount is required' }, { status: 400 })
    }

    const redirectUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3002'}/payment/return?booking_id=${booking_id}&service=${service || 'package'}`

    const orderId = generateOrderId()

    const payData = await createPayment({
      amount,
      order_id: orderId,
      customer_name,
      customer_email,
      redirect_url: redirectUrl,
    })

    return NextResponse.json({
      payment_id: payData.payment_id,
      payment_page: payData.payment_page,
      order_id: orderId,
      amount,
    })
  } catch (error: any) {
    console.error('Payment creation error:', error)
    return NextResponse.json({ error: error.message || 'Failed to create payment' }, { status: 500 })
  }
}
