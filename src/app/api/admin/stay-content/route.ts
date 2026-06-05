import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

    const records = await db.stayContent.findMany({ orderBy: { section: 'asc' } })
    const parsed = records.map((r) => ({
      ...r,
      images: JSON.parse(r.images),
      features: JSON.parse(r.features),
      pricings: JSON.parse(r.pricings),
    }))

    return NextResponse.json({ records: parsed })
  } catch (error) {
    console.error('Admin stay content fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

    const body = await request.json()
    const { section, name, description, tag, rating, images, features, pricings, active } = body

    if (!section || !name) {
      return NextResponse.json({ error: 'Section and name are required' }, { status: 400 })
    }

    const record = await db.stayContent.upsert({
      where: { section },
      update: {
        name,
        description: description || '',
        tag: tag || null,
        rating: rating ?? 0,
        images: JSON.stringify(images || []),
        features: JSON.stringify(features || []),
        pricings: JSON.stringify(pricings || []),
        active: active ?? true,
      },
      create: {
        section,
        name,
        description: description || '',
        tag: tag || null,
        rating: rating ?? 0,
        images: JSON.stringify(images || []),
        features: JSON.stringify(features || []),
        pricings: JSON.stringify(pricings || []),
        active: active ?? true,
      },
    })

    return NextResponse.json({
      ...record,
      images: JSON.parse(record.images),
      features: JSON.parse(record.features),
      pricings: JSON.parse(record.pricings),
    })
  } catch (error) {
    console.error('Admin stay content save error:', error)
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }
}
