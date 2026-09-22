import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { publicJson } from '@/lib/cache'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')

    const where: Record<string, string | boolean> = { active: true }
    if (slug) where.slug = slug

    const destinations = await db.tourDestination.findMany({ where })

    const parsed = destinations.map((d) => ({
      ...d,
      config: JSON.parse(d.config),
      programs: JSON.parse(d.programs),
      dayConfigs: JSON.parse(d.dayConfigs),
    }))

    return publicJson(slug ? parsed[0] || null : parsed)
  } catch (error) {
    console.error('Tour destinations error:', error)
    return NextResponse.json({ error: 'Failed to fetch tour destinations' }, { status: 500 })
  }
}
