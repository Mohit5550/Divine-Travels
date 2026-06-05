import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/packages - List packages with optional filtering
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')

    const where: Record<string, unknown> = { active: true }

    if (category) {
      where.category = { contains: category }
    }
    if (featured === 'true') {
      where.featured = true
    }

    const packages = await db.package.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { reviews: true, bookings: true },
        },
      },
    })

    return NextResponse.json(packages)
  } catch (error) {
    console.error('Error fetching packages:', error)
    return NextResponse.json({ error: 'Failed to fetch packages' }, { status: 500 })
  }
}

// POST /api/packages - Create a new package (admin only)
export async function POST(request: Request) {
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
    const {
      name, slug, tagline, subtitle, description, price, originalPrice,
      image, images, category, distance, duration, rapidsLevel,
      rapidsDescription, targetDemo, timings, highlights,
      inclusions, exclusions, eligibility, location,
      cancellationPolicy, faqs, badge, badgeColor, gradient,
      featured,
    } = body

    if (!name || !slug || !description || !price) {
      return NextResponse.json({ error: 'Name, slug, description, and price are required' }, { status: 400 })
    }

    const pkg = await db.package.create({
      data: {
        name,
        slug,
        tagline: tagline || '',
        subtitle: subtitle || '',
        description,
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : null,
        image: image || '',
        images: images || '[]',
        category: category || 'rafting',
        distance: distance || '',
        duration: duration || '',
        rapidsLevel: rapidsLevel || '',
        rapidsDescription: rapidsDescription || '',
        targetDemo: targetDemo || '',
        timings: timings || '',
        highlights: highlights || '[]',
        inclusions: inclusions || '[]',
        exclusions: exclusions || '[]',
        eligibility: eligibility || '',
        location: location || '',
        cancellationPolicy: cancellationPolicy || '',
        faqs: faqs || '[]',
        badge: badge || null,
        badgeColor: badgeColor || 'bg-brand-orange',
        gradient: gradient || 'from-brand-orange/80 to-amber-600/80',
        featured: featured || false,
      },
    })

    return NextResponse.json(pkg, { status: 201 })
  } catch (error: unknown) {
    console.error('Error creating package:', error)
    if (error && typeof error === 'object' && 'code' in error && (error as { code: string }).code === 'P2002') {
      return NextResponse.json({ error: 'A package with this slug already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create package' }, { status: 500 })
  }
}
