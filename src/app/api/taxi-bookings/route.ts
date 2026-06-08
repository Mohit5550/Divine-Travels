import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { notifyAdmin } from '@/lib/notify'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      destination,
      packageType,
      selectedPrograms,
      travelDate,
    } = body

    if (!destination || !packageType || !travelDate) {
      return NextResponse.json(
        { error: 'Pickup location, drop location, vehicle type, and pick up date are required' },
        { status: 400 }
      )
    }

    const parsed = JSON.parse(selectedPrograms || '{}')

    const booking = await db.tourBooking.create({
      data: {
        destination,
        dayLabel: null,
        packageType,
        selectedPrograms: selectedPrograms || '{}',
        name: parsed.name || 'Guest',
        phone: parsed.phone || '',
        travelDate,
        travelers: 1,
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
      'booking'
    )

    return NextResponse.json({ success: true, id: booking.id }, { status: 201 })
  } catch (error) {
    console.error('Taxi booking error:', error)
    return NextResponse.json({ error: 'Failed to submit booking' }, { status: 500 })
  }
}
