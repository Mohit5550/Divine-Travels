import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const service = searchParams.get('service')
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0]

    if (!service) {
      return NextResponse.json({ error: 'Service parameter is required' }, { status: 400 })
    }

    const records = await db.dateAvailability.findMany({
      where: { service },
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

    return NextResponse.json({ records: matching })
  } catch (error) {
    console.error('Public availability error:', error)
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}
