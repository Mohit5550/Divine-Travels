import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/destinations - List all with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const featured = searchParams.get('featured')

    const where: Record<string, unknown> = { active: true }

    if (category && category !== 'all') {
      where.category = { contains: category }
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { tagline: { contains: search } },
        { state: { contains: search } },
      ]
    }

    if (featured === 'true') {
      where.featured = true
    }

    const destinations = await db.destination.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(destinations)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/destinations - Create (admin only)
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { name, tagline, description, state, category, price, rating, image, badge, badgeColor, tags, featured } = body

    if (!name || !tagline || !description || !state || !category || !price || !image) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 })
    }

    const destination = await db.destination.create({
      data: {
        name,
        tagline,
        description,
        state,
        category,
        price: Number(price),
        rating: Number(rating) || 0,
        image,
        badge: badge || null,
        badgeColor: badgeColor || null,
        tags: tags || '',
        featured: featured || false,
      },
    })

    return NextResponse.json(destination, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
