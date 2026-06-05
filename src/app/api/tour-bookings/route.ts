import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { destination, dayLabel, packageType, selectedPrograms, name, phone, travelDate, travelers } = body

    if (!destination || !name || !phone || !travelDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const booking = await db.tourBooking.create({
      data: {
        destination,
        dayLabel: dayLabel || null,
        packageType: packageType || '',
        selectedPrograms: JSON.stringify(selectedPrograms || []),
        name,
        phone,
        travelDate,
        travelers: travelers || 1,
        status: 'pending',
      },
    })

    return NextResponse.json({ success: true, id: booking.id }, { status: 201 })
  } catch (error) {
    console.error('Tour booking error:', error)
    return NextResponse.json({ error: 'Failed to submit booking' }, { status: 500 })
  }
}
