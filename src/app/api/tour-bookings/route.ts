import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { notifyAdmin } from '@/lib/notify'
import { computeSummary, fetchReceipts, fetchOffers } from '@/lib/booking-service'
import { getUserIdFromRequest } from '@/lib/get-user-id'

// GET /api/tour-bookings - list (admin: all, user: own)
export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request)
    if (!userId) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    const user = await db.user.findUnique({ where: { id: userId } })
    const where: Record<string, unknown> = {}
    if (!user || user.role !== 'admin') where.userId = userId

    const { searchParams } = new URL(request.url)
    const excludeTaxi = searchParams.get('excludeTaxi') === 'true'
    if (excludeTaxi) {
      where.NOT = [
        { packageType: { startsWith: 'Taxi' } },
        { adminNotes: { contains: 'taxi-booking' } },
      ]
    }

    const bookings = await db.tourBooking.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(bookings)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      packageId, destination, dayLabel, packageType, selectedPrograms, itinerary, days, note,
      name, phone, travelDate, travelers,
    } = body

    if (!name || !phone || !travelDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const userId = getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Please log in to send an enquiry' }, { status: 401 })
    }
    const authUser = await db.user.findUnique({ where: { id: userId } })
    if (!authUser) {
      return NextResponse.json({ error: 'Please log in to send an enquiry' }, { status: 401 })
    }
    const pax = Number(travelers) || 1

    let pkg: { price: number; gstRate: number; name: string } | null = null
    if (packageId) {
      pkg = await db.package.findUnique({
        where: { id: packageId },
        select: { price: true, gstRate: true, name: true },
      })
    }

    const resolvedDestination = destination || pkg?.name || ''
    const resolvedPackageType = packageType || pkg?.name || ''
    let totalPrice: number | null = null
    if (pkg) {
      const base = pkg.price * pax
      const gst = Math.round((base * (pkg.gstRate || 0)) / 100)
      totalPrice = base + gst
    }

    const booking = await db.tourBooking.create({
      data: {
        userId,
        destination: resolvedDestination,
        dayLabel: dayLabel || null,
        packageType: resolvedPackageType,
        selectedPrograms: typeof selectedPrograms === 'string'
          ? selectedPrograms
          : JSON.stringify(selectedPrograms || []),
        itinerary: itinerary ? JSON.stringify(itinerary) : null,
        days: days ? Number(days) : null,
        note: note || null,
        name,
        phone,
        travelDate,
        travelers: pax,
        totalPrice,
        status: 'pending',
      },
    })

    notifyAdmin('New Tour Booking', `${name} booked ${resolvedDestination} for ${pax} traveler(s)`, 'booking', '/admin?tab=bkg-tour')

    return NextResponse.json({ success: true, id: booking.id }, { status: 201 })
  } catch (error) {
    console.error('Tour booking error:', error)
    return NextResponse.json({ error: 'Failed to submit booking' }, { status: 500 })
  }
}
