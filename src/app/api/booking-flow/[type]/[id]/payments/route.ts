import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createPayment, generateOrderId } from '@/lib/kwikupi'
import { getUserIdFromRequest } from '@/lib/get-user-id'
import {
  isValidBookingType,
  fetchBooking,
  fetchReceipts,
  computeSummary,
  bookingOwnerId,
  getBookingDelegate,
  advanceDue,
  notifyUser,
  notifyAdmin,
} from '@/lib/booking-service'

const BASE = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3002'

async function getUser(req: Request) {
  const userId = getUserIdFromRequest(req)
  if (!userId) return null
  return db.user.findUnique({ where: { id: userId } })
}

export async function GET(req: Request, { params }: { params: Promise<{ type: string; id: string }> }) {
  try {
    const { type, id } = await params
    if (!isValidBookingType(type)) return NextResponse.json({ error: 'Invalid booking type' }, { status: 400 })
    const user = await getUser(req)
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    const ownerId = await bookingOwnerId(type as any, id)
    const isUnowned = !ownerId
    if (user.role !== 'admin' && !isUnowned && ownerId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    const booking = await fetchBooking(type as any, id)
    const receipts = await fetchReceipts(type as any, id)
    const summary = await computeSummary(type as any, booking)
    return NextResponse.json({ receipts, summary })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed' }, { status: 500 })
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ type: string; id: string }> }) {
  try {
    const { type, id } = await params
    if (!isValidBookingType(type)) return NextResponse.json({ error: 'Invalid booking type' }, { status: 400 })

    const user = await getUser(req)
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

    const body = await req.json()
    const method = body.method || 'online'
    const rawPayType = body.payType || body.type
    const payType = (rawPayType === 'advance' || rawPayType === 'balance' || rawPayType === 'full')
      ? rawPayType
      : 'balance'
    const ownerId = await bookingOwnerId(type as any, id)
    const isUnowned = !ownerId
    if (user.role !== 'admin' && !isUnowned && ownerId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const booking = await fetchBooking(type as any, id)

    // Claim an unowned (legacy public) inquiry to the user who is paying it
    if (isUnowned && user.role !== 'admin') {
      await getBookingDelegate(type as any).update({ where: { id }, data: { userId: user.id } })
    }
    const summary = await computeSummary(type as any, booking)

    if (summary.total <= 0) {
      return NextResponse.json({ error: 'Price not set yet. Wait for admin to send an offer.' }, { status: 400 })
    }

    // Admin-recorded cash / manual payments
    if (method === 'cash' || method === 'manual') {
      if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      const amount = Math.round(Number(body.amount))
      if (!amount || amount <= 0) return NextResponse.json({ error: 'Valid amount required' }, { status: 400 })

      const receipt = await db.paymentReceipt.create({
        data: {
          userId: ownerId || user.id,
          bookingType: type,
          bookingId: id,
          amount,
          method,
          type: payType,
          txnId: body.txnId || null,
          addedBy: 'admin',
          note: body.note || null,
          status: 'completed',
        },
      })

      const newSummary = await computeSummary(type as any, booking)
      await (await import('@/lib/booking-service')).getBookingDelegate(type as any).update({
        where: { id },
        data: { paymentStatus: newSummary.fullyPaid ? 'completed' : newSummary.advancePaid ? 'advance_paid' : 'partial' },
      })

      if (ownerId) {
        await notifyUser(ownerId, 'Payment Recorded', `Admin recorded a ₹${amount} ${method} payment. Balance due: ₹${newSummary.balanceDue}`, 'payment', '/?view=user-dashboard')
      }
      return NextResponse.json({ receipt, summary: newSummary }, { status: 201 })
    }

    // Online gateway payment initiated by the user
    let amount: number
    if (payType === 'advance') amount = summary.advanceDue
    else if (payType === 'full') amount = summary.total
    else amount = Math.min(summary.balanceDue, Math.round(Number(body.amount)) || summary.balanceDue)

    if (amount <= 0) return NextResponse.json({ error: 'Nothing to pay' }, { status: 400 })

    const orderId = generateOrderId()
    const payRes = await createPayment({
      amount,
      order_id: orderId,
      customer_name: booking.name || user.name,
      customer_email: user.email,
      redirect_url: `${BASE}/payment/return?service=unified&booking_type=${type}&booking_id=${id}&pay_type=${payType}`,
    })

    return NextResponse.json({
      payment_id: payRes.payment_id,
      payment_page: payRes.payment_page,
      order_id: orderId,
      amount,
    })
  } catch (error: any) {
    console.error('Payment create error:', error)
    return NextResponse.json({ error: error?.message || 'Failed to initiate payment' }, { status: 500 })
  }
}
