import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserIdFromRequest } from '@/lib/get-user-id'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const paginate = searchParams.has('page')
    const skip = (page - 1) * limit

    const [images, total] = await Promise.all([
      db.galleryImage.findMany({
        orderBy: { order: 'asc' },
        ...(paginate ? { take: limit, skip } : {}),
      }),
      paginate ? db.galleryImage.count() : Promise.resolve(0),
    ])

    if (paginate) {
      return NextResponse.json({ data: images, total, page, totalPages: Math.ceil(total / limit) })
    }
    return NextResponse.json(images)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { url, title, alt, category, featured, order, active } = body

    if (!url) {
      return NextResponse.json({ error: 'url is required' }, { status: 400 })
    }

    // Count currently featured images
    if (featured) {
      const featuredCount = await db.galleryImage.count({ where: { featured: true, active: true } })
      if (featuredCount >= 5) {
        return NextResponse.json(
          { error: 'You can only have 5 featured images on the homepage. Unfeature one first.' },
          { status: 400 },
        )
      }
    }

    const image = await db.galleryImage.create({
      data: {
        url,
        title: title || null,
        alt: alt || title || null,
        category: category || null,
        featured: !!featured,
        order: typeof order === 'number' ? order : 0,
        active: active !== false,
      },
    })

    return NextResponse.json(image, { status: 201 })
  } catch (error) {
    console.error('Create gallery image error:', error)
    return NextResponse.json({ error: 'Failed to create gallery image' }, { status: 500 })
  }
}
