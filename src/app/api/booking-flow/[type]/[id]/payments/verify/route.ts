import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { checkPaymentStatus } from '@/lib/kwikupi'
import { getUserIdFromRequest } from '@/lib/get-user-id'
import {
  isValidBookingType,
  fetchBooking,
  computeSummary,
  bookingOwnerId,
  notifyUser,
  notifyAdmin,
} from '@/lib/booking-service'

async function getUser(req: Request) {
  const userId = getUserIdFromRequest(req)
  if (!userId) return null
  return db.user.findUnique({ where: { id: userId } })
}

export async function POST(req: Request, { params }: { params: Promise<{ type: string; id: string }> }) {
  try {
    const { type, id } = await params
    if (!isValidBookingType(type)) return NextResponse.json({ error: 'Invalid booking type' }, { status: 400 })

    const user = await getUser(req)
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

    const body = await req.json()
    const paymentId = body.paymentId
    const payType = body.payType || 'balance'
    if (!paymentId) return NextResponse.json({ error: 'paymentId required' }, { status: 400 })

    const ownerId = await bookingOwnerId(type as any, id)
    if (user.role !== 'admin' && ownerId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    let status = ''
    let amount = 0
    try {
      const info = await checkPaymentStatus(paymentId)
      status = info.status
      amount = info.amount
    } catch {
      return NextResponse.json({ error: 'Could not verify payment' }, { status: 502 })
    }

    const ok = ['TXN_SUCCESS', 'SUCCESS', 'COMPLETED', 'CAPTURED', 'PENDING'].includes(status.toUpperCase())
    if (!ok) return NextResponse.json({ error: 'Payment not successful', status }, { status: 400 })

    const booking = await fetchBooking(type as any, id)
    const summary = await computeSummary(type as any, booking)

    // Amount actually recorded: respect requested payType but never exceed balance/advance
    let recordAmount = amount
    if (payType === 'advance') recordAmount = Math.min(amount, summary.advanceDue)
    else if (payType === 'balance' || payType === 'full') recordAmount = Math.min(amount, summary.balanceDue || summary.total)

    const receipt = await db.paymentReceipt.create({
      data: {
        userId: ownerId || user.id,
        bookingType: type,
        bookingId: id,
        amount: recordAmount,
        method: 'gateway',
        type: payType,
        txnId: paymentId,
        addedBy: 'user',
        note: null,
        status: 'completed',
      },
    })

    const newSummary = await computeSummary(type as any, booking)
    await (await import('@/lib/booking-service')).getBookingDelegate(type as any).update({
      where: { id },
      data: {
        paymentStatus: newSummary.fullyPaid ? 'completed' : newSummary.advancePaid ? 'advance_paid' : 'partial',
        paymentAmount: newSummary.paid,
        paymentCompletedAt: newSummary.advancePaid ? new Date() : null,
      },
    })

    await notifyAdmin('Payment Received', `${booking.name} paid ₹${recordAmount} (${payType}) for a booking`, 'payment', '/admin')
    if (ownerId) {
      await notifyUser(ownerId, 'Payment Received', `We received your payment of ₹${recordAmount}. Balance due: ₹${newSummary.balanceDue}`, 'payment', '/?view=user-dashboard')
    }

    return NextResponse.json({ receipt, summary: newSummary, status })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Verification failed' }, { status: 500 })
  }
}
