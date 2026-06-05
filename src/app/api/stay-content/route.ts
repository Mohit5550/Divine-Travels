import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const records = await db.stayContent.findMany({
      where: { active: true },
      orderBy: { section: 'asc' },
    })

    const parsed = records.map((r) => ({
      ...r,
      images: JSON.parse(r.images),
      features: JSON.parse(r.features),
      pricings: JSON.parse(r.pricings),
    }))

    return NextResponse.json({ records: parsed })
  } catch (error) {
    console.error('Stay content fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}
