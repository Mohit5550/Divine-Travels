import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isValidBookingType, fetchBooking, bookingOwnerId, computeSummary, notifyUser } from '@/lib/booking-service'
import { getUserIdFromRequest } from '@/lib/get-user-id'

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
    if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const ownerId = await bookingOwnerId(type as any, id)
    if (!ownerId) return NextResponse.json({ error: 'No user associated with this booking' }, { status: 400 })

    const body = await req.json().catch(() => ({}))
    const customNote = body.customNote?.trim()

    const booking = await fetchBooking(type as any, id)
    const summary = await computeSummary(type as any, booking)
    const label = summary.advancePaid ? `balance of ₹${summary.balanceDue.toLocaleString('en-IN')}` : `10% advance of ₹${summary.advanceDue.toLocaleString('en-IN')}`
    
    const notifTitle = summary.advancePaid ? 'Payment Notice: Pending Balance' : 'Payment Notice: Advance Due'
    const notifMessage = customNote || `Dear ${booking.name || booking.fullName || 'Customer'}, please clear your remaining ${label} for your Divine Travels booking.`

    await notifyUser(ownerId, notifTitle, notifMessage, 'payment', '/?view=user-dashboard')

    // Generate WhatsApp reminder link
    const phone = (booking.mobile || booking.phone || '').replace(/\D/g, '')
    const bookingCode = `DT-${id.slice(-6).toUpperCase()}`
    const waText = encodeURIComponent(
      `*Divine Travels — Payment Reminder*\n\n` +
      `Namaste ${booking.name || booking.fullName || 'Valued Guest'},\n` +
      `Your booking ref *${bookingCode}* has a pending ${label}.\n` +
      (customNote ? `Note: ${customNote}\n` : '') +
      `\nYou can easily pay online via UPI/Cards from your user dashboard or upon arrival.\n` +
      `Thank you!\n📞 Support: +91 63969 19007`
    )
    const whatsappUrl = phone ? `https://wa.me/91${phone.slice(-10)}?text=${waText}` : null

    return NextResponse.json({
      success: true,
      message: `Due payment notice of ₹${summary.balanceDue} sent to customer`,
      whatsappUrl,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to send payment notice' }, { status: 500 })
  }
}
