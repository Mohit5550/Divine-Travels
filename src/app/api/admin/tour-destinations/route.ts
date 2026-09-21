import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserIdFromRequest } from '@/lib/get-user-id'

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request)
    if (!userId) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

    const destinations = await db.tourDestination.findMany({
      orderBy: { createdAt: 'asc' },
    })

    const parsed = destinations.map((d) => ({
      ...d,
      config: JSON.parse(d.config),
      programs: JSON.parse(d.programs),
      dayConfigs: JSON.parse(d.dayConfigs),
    }))

    return NextResponse.json(parsed)
  } catch (error) {
    console.error('Admin tour destinations error:', error)
    return NextResponse.json({ error: 'Failed to fetch tour destinations' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request)
    if (!userId) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

    const body = await request.json()
    const { slug, name, type, config, programs, dayConfigs } = body

    if (!slug || !name) {
      return NextResponse.json({ error: 'Slug and name are required' }, { status: 400 })
    }

    const existing = await db.tourDestination.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
    }

    const destination = await db.tourDestination.create({
      data: {
        slug,
        name,
        type: type || 'day-based',
        config: JSON.stringify(config || {}),
        programs: JSON.stringify(programs || []),
        dayConfigs: JSON.stringify(dayConfigs || []),
      },
    })

    return NextResponse.json({
      ...destination,
      config: JSON.parse(destination.config),
      programs: JSON.parse(destination.programs),
      dayConfigs: JSON.parse(destination.dayConfigs),
    }, { status: 201 })
  } catch (error) {
    console.error('Admin tour destination create error:', error)
    return NextResponse.json({ error: 'Failed to create tour destination' }, { status: 500 })
  }
}
