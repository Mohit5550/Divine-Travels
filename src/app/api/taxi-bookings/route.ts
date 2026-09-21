import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { notifyAdmin } from '@/lib/notify'
import { getUserIdFromRequest } from '@/lib/get-user-id'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const all = searchParams.get('all') === 'true'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const paginate = searchParams.has('page')
    const skip = (page - 1) * limit

    const userId = getUserIdFromRequest(request)
    const where: any = {
      adminNotes: { contains: 'taxi-booking' },
    }
    if (userId) {
      // Show the user's own inquiries plus any unowned inquiries (created before login)
      // so they remain visible and can be claimed by accepting an offer.
      where.OR = [{ userId }, { userId: null }]
    } else if (!all) {
      where.status = 'pending'
    }

    const [bookings, total] = await Promise.all([
      db.tourBooking.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        ...(paginate ? { take: limit, skip } : {}),
      }),
      paginate ? db.tourBooking.count({ where }) : Promise.resolve(0),
    ])

    if (paginate) {
      return NextResponse.json({ data: bookings, total, page, totalPages: Math.ceil(total / limit) })
    }
    return NextResponse.json(bookings)
  } catch (error) {
    console.error('Error fetching taxi bookings:', error)
    return NextResponse.json({ error: 'Failed to fetch taxi bookings' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      destination,
      packageType,
      selectedPrograms,
      travelDate,
      name,
      phone,
    } = body

    if (!destination || !packageType || !travelDate) {
      return NextResponse.json(
        { error: 'Pickup location, drop location, vehicle type, and pick up date are required' },
        { status: 400 }
      )
    }

    const parsed = JSON.parse(selectedPrograms || '{}')

    const userId = getUserIdFromRequest(request) || null

    const booking = await db.tourBooking.create({
      data: {
        userId,
        destination,
        dayLabel: null,
        packageType,
        selectedPrograms: selectedPrograms || '{}',
        name: name || parsed.name || 'Guest',
        phone: phone || parsed.phone || '',
        travelDate,
        travelers: parsed.numberOfPassengers || 1,
        status: 'pending',
        adminNotes: JSON.stringify({
          type: 'taxi-booking',
          tripType: parsed.tripType,
          vehicleType: parsed.vehicleType,
          pickupDate: parsed.pickupDate,
          pickupTime: parsed.pickupTime,
          pickupLocation: parsed.pickupLocation,
          dropLocation: parsed.dropLocation,
          numberOfDays: parsed.numberOfDays,
          numberOfPassengers: parsed.numberOfPassengers,
          tourDescription: parsed.tourDescription,
          quoteBestPrice: parsed.quoteBestPrice,
          bookingAmount: parsed.bookingAmount,
        }),
      },
    })

    const vehicleLabel = parsed.vehicleType || 'Any'
    const route = `${parsed.pickupLocation || '?'} → ${parsed.dropLocation || '?'}`
    notifyAdmin(
      'New Taxi Booking',
      `Taxi ${parsed.tripType === 'round-trip' ? '(Round Trip)' : '(One Way)'}: ${vehicleLabel} | ${route} | ${parsed.pickupDate} ${parsed.pickupTime}`,
      'booking',
      '/admin?tab=bkg-taxi'
    )

    return NextResponse.json({ success: true, id: booking.id }, { status: 201 })
  } catch (error) {
    console.error('Taxi booking error:', error)
    return NextResponse.json({ error: 'Failed to submit booking' }, { status: 500 })
  }
}
