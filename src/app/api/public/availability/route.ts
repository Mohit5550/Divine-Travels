import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { publicJson } from '@/lib/cache'

const SERVICE_ALIASES: Record<string, string[]> = {
  'bike-rental': ['bike-rental', 'bike'],
  'taxi-booking': ['taxi-booking', 'taxi'],
  'stay-hotel': ['stay-hotel', 'stay'],
  'stay-camping': ['stay-camping', 'stay'],
  'domestic-tours': ['domestic-tours', 'tour-packages'],
  'spiritual-tours': ['spiritual-tours', 'tour-packages'],
  'international-tours': ['international-tours', 'tour-packages'],
  adventure: ['adventure'],
  rafting: ['rafting'],
  trekking: ['trekking'],
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const service = searchParams.get('service')
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

    if (!service) {
      return NextResponse.json({ error: 'Service parameter is required' }, { status: 400 })
    }

    const serviceAliases = SERVICE_ALIASES[service] || [service]

    const records = await db.dateAvailability.findMany({
      where: { service: { in: serviceAliases } },
      orderBy: { date: 'asc' },
    })

    const parsed = records.map((r) => ({
      ...r,
      subOptions: JSON.parse(r.subOptions),
    }))

    const today = date

    const matching = parsed.filter((r) => {
      if (r.dateTo) {
        return today >= r.date && today <= r.dateTo
      }
      return r.date === today
    })

    return publicJson({ records: matching })
  } catch (error) {
    console.error('Public availability error:', error)
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}
