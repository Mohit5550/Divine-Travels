import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromToken } from '@/lib/with-auth'

const serviceOptions: Record<string, string[]> = {
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
    const user = await getUserFromToken(request)
    if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

    const { searchParams } = new URL(request.url)
    const service = searchParams.get('service')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const paginate = searchParams.has('page')
    const skip = (page - 1) * limit

    const [records, total] = await Promise.all([
      db.dateAvailability.findMany({
        where: service ? { service } : {},
        ...(paginate ? { take: limit, skip } : {}),
      }),
      paginate ? db.dateAvailability.count({ where: service ? { service } : {} }) : Promise.resolve(0),
    ])

    if (paginate) {
      return NextResponse.json({ data: records, total, page, totalPages: Math.ceil(total / limit) })
    }
    return NextResponse.json(records)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

    const body = await request.json()
    const { service, date, dateTo, subOptions, allDay, price, slots } = body

    const existing = await db.dateAvailability.findFirst({
      where: { service, date },
    })

    let record
    if (existing) {
      record = await db.dateAvailability.update({
        where: { id: existing.id },
        data: { dateTo, subOptions: subOptions || '[]', allDay, price, slots },
      })
    } else {
      record = await db.dateAvailability.create({
        data: { service, date, dateTo, subOptions: subOptions || '[]', allDay, price, slots },
      })
    }

    return NextResponse.json(record, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create availability' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (id) {
      await db.dateAvailability.delete({ where: { id } })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete availability' }, { status: 500 })
  }
}