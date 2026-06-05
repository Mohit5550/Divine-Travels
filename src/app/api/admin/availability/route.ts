import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const serviceOptions: Record<string, string[]> = {
  rafting: ['Brahmpuri 9km', 'Shivpuri 16km', 'Marine Drive 26km'],
  trekking: ['Valley of Flowers', 'Nag Tibba', 'Kedarkantha', 'Har Ki Dun'],
  taxi: ['Sedan', 'SUV', 'Tempo Traveller', 'Bus'],
  bike: ['Hunter 350', 'Activa', 'Splendor', 'Royal Enfield', 'Access 125'],
  stay: ['Hotel Holy Ganga Non-AC', 'Hotel Holy Ganga AC', 'Camping Double', 'Camping Triple', 'Camping Quad'],
  'tour-packages': ['Rishikesh Tour', 'Haridwar Tour', 'Mussoorie Tour', 'Nainital Tour', 'Hill Stations', 'Char Dham'],
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    const where: Record<string, string> = {}
    if (date) where.date = date

    const records = await db.dateAvailability.findMany({ where, orderBy: { service: 'asc' } })

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
    const { date, service, subOptions, allDay } = body

    if (!date || !service) {
      return NextResponse.json({ error: 'Date and service are required' }, { status: 400 })
    }

    const record = await db.dateAvailability.upsert({
      where: { date_service: { date, service } },
      update: {
        subOptions: JSON.stringify(subOptions || []),
        allDay: allDay || false,
      },
      create: {
        date,
        service,
        subOptions: JSON.stringify(subOptions || []),
        allDay: allDay || false,
      },
    })

    return NextResponse.json({ ...record, subOptions: JSON.parse(record.subOptions) })
  } catch (error) {
    console.error('Availability save error:', error)
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }
}
