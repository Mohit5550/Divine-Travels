import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { notifyUser } from '@/lib/notify'
import { getUserIdFromRequest } from '@/lib/get-user-id'

const VALID_STATUSES = [
  'pending',
  'confirmed',
  'ready',
  'in_progress',
  'completed',
  'cancelled',
  'rejected',
]

const STATUS_LABELS: Record<string, string> = {
  pending: 'Received / Pending Verification',
  confirmed: 'Confirmed & Slot Reserved',
  ready: 'Guide / Cab / Camp Ready',
  in_progress: 'Activity / Ride In-Progress',
  completed: 'Trip Completed Successfully',
  cancelled: 'Booking Cancelled',
  rejected: 'Booking Rejected',
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const admin = await db.user.findUnique({ where: { id: userId } })
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { bookingId, type, status, note } = body

    if (!bookingId || !type || !status) {
      return NextResponse.json({ error: 'bookingId, type, and status are required' }, { status: 400 })
    }

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: `Invalid status: ${status}` }, { status: 400 })
    }

    let customerUserId: string | null = null
    let customerPhone = ''
    let customerName = ''
    let travelDateStr = ''
    let tripTitle = 'Trip'
    let updatedBooking: any = null
    let totalPrice = 0

    if (type === 'package') {
      const existing = await db.packageBooking.findUnique({
        where: { id: bookingId },
        include: { package: { select: { name: true } }, user: { select: { name: true, phone: true } } },
      })
      if (!existing) {
        return NextResponse.json({ error: 'Package booking not found' }, { status: 404 })
      }
      customerUserId = existing.userId
      customerPhone = existing.mobile || existing.user?.phone || ''
      customerName = existing.fullName || existing.user?.name || 'Valued Guest'
      travelDateStr = existing.preferredDate ? new Date(existing.preferredDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''
      tripTitle = existing.package?.name || 'Adventure Package'
      totalPrice = existing.totalPrice || 0

      let newNotes = existing.additionalNotes || ''
      if (note) {
        newNotes = `${newNotes ? `${newNotes}\n` : ''}[Admin Update]: ${note}`
      }

      const updateData: any = {
        status,
        ...(note ? { additionalNotes: newNotes } : {}),
      }

      if (status === 'confirmed' && totalPrice > 0) {
        const advanceDeadline = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        const advanceObj = {
          advanceDeadline,
          advanceRequired: true,
          advanceAmount: Math.ceil(totalPrice * 0.1),
        }
        // Merge into existing JSON when possible (keeps camping/hotel breakdown valid);
        // otherwise append as a standalone JSON line.
        let mergedNotes: string
        try {
          const parsed = existing.additionalNotes ? JSON.parse(existing.additionalNotes) : {}
          mergedNotes = JSON.stringify({ ...parsed, ...advanceObj })
        } catch {
          mergedNotes = `${newNotes ? `${newNotes}\n` : ''}${JSON.stringify(advanceObj)}`
        }
        updateData.additionalNotes = mergedNotes
      }

      updatedBooking = await db.packageBooking.update({
        where: { id: bookingId },
        data: updateData,
      })
    } else if (type === 'tour' || type === 'taxi') {
      const existing = await db.tourBooking.findUnique({
        where: { id: bookingId },
        include: { user: { select: { name: true, phone: true } } },
      })
      if (!existing) {
        return NextResponse.json({ error: 'Tour/Taxi booking not found' }, { status: 404 })
      }
      customerUserId = existing.userId
      customerPhone = existing.phone || existing.user?.phone || ''
      customerName = existing.name || existing.user?.name || 'Valued Guest'
      travelDateStr = existing.travelDate || ''
      tripTitle = existing.destination || existing.packageType || (type === 'taxi' ? 'Taxi Service' : 'Day Tour')
      totalPrice = existing.totalPrice || 0

      let parsedNotes: Record<string, any> = {}
      try {
        parsedNotes = JSON.parse(existing.adminNotes || '{}')
      } catch {}

      if (note) {
        parsedNotes.operationalUpdate = note
        parsedNotes.updatedAt = new Date().toISOString()
      }

      if (status === 'confirmed' && totalPrice > 0) {
        parsedNotes.advanceDeadline = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        parsedNotes.advanceRequired = true
        parsedNotes.advanceAmount = Math.ceil(totalPrice * 0.1)
      }

      updatedBooking = await db.tourBooking.update({
        where: { id: bookingId },
        data: {
          status,
          adminNotes: JSON.stringify(parsedNotes),
        },
      })
    } else if (type === 'destination') {
      const existing = await db.booking.findUnique({
        where: { id: bookingId },
        include: { destination: { select: { name: true } }, user: { select: { name: true, phone: true } } },
      })
      if (!existing) {
        return NextResponse.json({ error: 'Destination booking not found' }, { status: 404 })
      }
      customerUserId = existing.userId
      customerPhone = existing.phone || existing.user?.phone || ''
      customerName = existing.user?.name || 'Valued Guest'
      travelDateStr = existing.checkIn ? new Date(existing.checkIn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''
      tripTitle = existing.destination?.name || 'Stay / Destination'
      totalPrice = existing.totalPrice || 0

      const updateData: any = {
        status,
      }

      if (note) {
        updateData.specialReqs = `${existing.specialReqs ? `${existing.specialReqs} | ` : ''}[Admin Note: ${note}]`
      }

      if (status === 'confirmed' && totalPrice > 0) {
        const advanceDeadline = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        updateData.specialReqs = `${updateData.specialReqs || existing.specialReqs || ''} | [advanceDeadline:${advanceDeadline}] [advanceRequired:true] [advanceAmount:${Math.ceil(totalPrice * 0.1)}]`
      }

      updatedBooking = await db.booking.update({
        where: { id: bookingId },
        data: updateData,
      })
    } else {
      return NextResponse.json({ error: 'Unsupported booking type' }, { status: 400 })
    }

    let whatsappUrl: string | null = null
    const advanceAmount = Math.ceil(totalPrice * 0.1)

    if (customerUserId) {
      if (status === 'confirmed' && totalPrice > 0) {
        const deadline = new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        const msg = `Your booking for "${tripTitle}" has been confirmed! Pay 10% advance (₹${advanceAmount.toLocaleString('en-IN')}) within 24 hours (before ${deadline}) to lock your spot. Go to Dashboard → My Bookings to pay.`
        notifyUser(customerUserId, `Booking Confirmed: ${tripTitle}`, msg, 'booking-confirmed')
      } else {
        const statusText = STATUS_LABELS[status] || status
        const msg = note
          ? `Your booking for "${tripTitle}" is now marked: ${statusText}. Note: ${note}`
          : `Your booking for "${tripTitle}" has been updated to: ${statusText}.`
        notifyUser(customerUserId, `Trip Update: ${tripTitle}`, msg, 'status')
      }
    }

    // Generate WhatsApp payment message link if confirmed
    if (status === 'confirmed') {
      const rawPhone = customerPhone.replace(/\D/g, '')
      const bookingCode = `DT-${bookingId.slice(-6).toUpperCase()}`
      const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://divinetravels.in'
      const waText = encodeURIComponent(
        `*Divine Travels — Booking Confirmed! 🎉*\n\n` +
        `Namaste *${customerName}*,\n` +
        `Great news! Your booking enquiry for *${tripTitle}* has been *CONFIRMED*.\n\n` +
        `📋 *Booking Details:*\n` +
        `• Booking Ref: *${bookingCode}*\n` +
        (travelDateStr ? `• Travel Date: *${travelDateStr}*\n` : '') +
        `• Total Package: *₹${totalPrice.toLocaleString('en-IN')}*\n` +
        `• *10% Advance Due:* *₹${advanceAmount.toLocaleString('en-IN')}*\n\n` +
        `💳 *Pay 10% Advance Online:*\n` +
        `Please pay 10% advance (₹${advanceAmount.toLocaleString('en-IN')}) to lock your spot & dates:\n` +
        `👉 ${siteUrl}/?view=user-dashboard\n\n` +
        `📞 Support & Assistance: +91 63969 19007\n` +
        `Thank you for choosing Divine Travels!`
      )

      if (rawPhone && rawPhone.length >= 10) {
        whatsappUrl = `https://wa.me/91${rawPhone.slice(-10)}?text=${waText}`
      }
    }

    return NextResponse.json({
      success: true,
      status,
      booking: updatedBooking,
      whatsappUrl,
    })
  } catch (error) {
    console.error('Error updating booking status:', error)
    return NextResponse.json({ error: 'Failed to update booking status' }, { status: 500 })
  }
}
