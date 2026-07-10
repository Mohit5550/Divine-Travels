import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const serviceOptions: Record<string, string[]> = {
  rafting: ['Brahmpuri 9km', 'Shivpuri 16km', 'Marine Drive 26km'],
  trekking: ['Valley of Flowers', 'Nag Tibba', 'Kedarkantha', 'Har Ki Dun', 'Brahmatal', 'Dayara Bugyal', 'Tungnath', 'Chandrashila', 'Kauri Pass', 'Rupin Pass'],
  adventure: ['Bungy Jumping', 'Giant Swing', 'Paragliding', 'Zipline', 'Foxtail Flying', 'Sky Cycle', 'Cliff Jump', 'Speed Boat', 'Jet Ski', 'Banana Boat', 'Bumper Boat', 'Parasailing', 'Flyboard'],
  'bike-rental': ['Hunter 350', 'Activa', 'Splendor', 'Royal Enfield', 'Access 125', 'Himalayan 450'],
  'taxi-booking': ['Sedan', 'SUV', 'Tempo Traveller', 'Bus', 'Hatchback', 'Ertiga', 'INNOVA'],
  'stay-hotel': ['Deluxe', 'Suite', 'Standard', 'Premium', 'Cottage', 'Dormitory'],
  'stay-camping': ['Tent', 'Swiss Tent', 'Camping Double', 'Camping Triple', 'Camping Quad'],
  'domestic-tours': ['Rishikesh Tour', 'Haridwar Tour', 'Mussoorie Tour', 'Nainital Tour', 'Hill Stations', 'Char Dham', 'Kashmir', 'Kerala', 'Goa', 'Rajasthan'],
  'spiritual-tours': ['Char Dham', 'Jyotirlinga', 'Temple Tours', 'Pilgrimages', 'Yatra', 'Varanasi', 'Haridwar', 'Rishikesh'],
  'international-tours': ['Thailand', 'Bali', 'Vietnam', 'Singapore', 'Malaysia', 'Switzerland', 'France', 'UK', 'Italy', 'Dubai', 'Nepal', 'Bhutan', 'Maldives'],
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

    const { searchParams } = new URL(request.url)
    const service = searchParams.get('service')

    const records = await db.dateAvailability.findMany({
      where: service ? { service } : {},
      orderBy: [{ date: 'asc' }, { service: 'asc' }],
    })

    const parsed = records.map((r) => ({
      ...r,
      subOptions: JSON.parse(r.subOptions),
    }))

    return NextResponse.json({ records: parsed, serviceOptions })
  } catch (error) {
    console.error('Availability fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

    const body = await request.json()
    const { id, date, dateTo, service, subOptions, allDay, price, slots } = body

    if (!date || !service) {
      return NextResponse.json({ error: 'Date and service are required' }, { status: 400 })
    }

    let record
    if (id) {
      record = await db.dateAvailability.update({
        where: { id },
        data: {
          date,
          dateTo: dateTo || null,
          service,
          subOptions: JSON.stringify(subOptions || []),
          allDay: allDay || false,
          price: price ? parseInt(price) : null,
          slots: slots ? parseInt(slots) : null,
        },
      })
    } else {
      record = await db.dateAvailability.create({
        data: {
          date,
          dateTo: dateTo || null,
          service,
          subOptions: JSON.stringify(subOptions || []),
          allDay: allDay || false,
          price: price ? parseInt(price) : null,
          slots: slots ? parseInt(slots) : null,
        },
      })
    }

    return NextResponse.json({ ...record, subOptions: JSON.parse(record.subOptions) })
  } catch (error) {
    console.error('Availability save error:', error)
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Record ID required' }, { status: 400 })

    await db.dateAvailability.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Availability delete error:', error)
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}
