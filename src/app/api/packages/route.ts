import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { publicJson } from '@/lib/cache'
import { cleanSlug } from '@/lib/resolve-slug'
import { getUserIdFromRequest } from '@/lib/get-user-id'

// GET /api/packages - List packages with optional filtering
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const paginate = searchParams.has('page')
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = { active: true }

    if (category) {
      where.category = { contains: category }
    }
    if (featured === 'true') {
      where.featured = true
    }

    const [packages, total] = await Promise.all([
      db.package.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { reviews: true, bookings: true },
          },
        },
        ...(paginate ? { take: limit, skip } : {}),
      }),
      paginate ? db.package.count({ where }) : Promise.resolve(0),
    ])

    if (paginate) {
      return publicJson({ data: packages, total, page, totalPages: Math.ceil(total / limit) })
    }
    return publicJson(packages)
  } catch (error) {
    console.error('Error fetching packages:', error)
    return NextResponse.json({ error: 'Failed to fetch packages' }, { status: 500 })
  }
}

// POST /api/packages - Create a new package (admin only)
export async function POST(request: Request) {
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
    const {
      name, slug, tagline, subtitle, description, price, originalPrice,
      image, images, category, distance, duration, rapidsLevel,
      rapidsDescription, targetDemo, timings, highlights,
      inclusions, exclusions, eligibility, location, pickupLocationUrl,
      locationUrls,
      cancellationPolicy, faqs, badge, badgeColor, gradient,
      featured, active,
      routeLength, maxAltitude, baseCamp, pickupPoint,
      suitableFor, experience, fitness, bestSeason, gstRate,
      itinerary, thingsToCarry, howToReach, importantInfo, fixedDepartures,
      propertyType, amenities, roomTypes, mealPlans,
    } = body

    if (!name || !slug || !description || !price) {
      return NextResponse.json({ error: 'Name, slug, description, and price are required' }, { status: 400 })
    }

    const priceNum = Number(price)
    if (isNaN(priceNum)) {
      return NextResponse.json({ error: 'Price must be a valid number' }, { status: 400 })
    }

    const gstRateNum = typeof gstRate === 'number' && !isNaN(gstRate) ? gstRate : 5
    const originalPriceNum = originalPrice ? Number(originalPrice) : null

    const pkg = await db.package.create({
      data: {
        name,
        slug: cleanSlug(slug),
        tagline: tagline || '',
        subtitle: subtitle || '',
        description,
        price: priceNum,
        originalPrice: originalPriceNum !== null && !isNaN(originalPriceNum) ? originalPriceNum : null,
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
        pickupLocationUrl: pickupLocationUrl || '',
        locationUrls: locationUrls || '[]',
        cancellationPolicy: cancellationPolicy || '',
        faqs: faqs || '[]',
        badge: badge || null,
        badgeColor: badgeColor || 'bg-brand-orange',
        gradient: gradient || 'from-brand-orange/80 to-amber-600/80',
        featured: featured || false,
        active: active !== undefined ? active : true,
        routeLength: routeLength || '',
        maxAltitude: maxAltitude || '',
        baseCamp: baseCamp || '',
        pickupPoint: pickupPoint || '',
        suitableFor: suitableFor || '',
        experience: experience || '',
        fitness: fitness || '',
        bestSeason: bestSeason || '',
        gstRate: gstRateNum,
        itinerary: itinerary || '[]',
        thingsToCarry: thingsToCarry || '[]',
        howToReach: howToReach || '[]',
        importantInfo: importantInfo || '',
        fixedDepartures: fixedDepartures || '[]',
        propertyType: propertyType || '',
        amenities: amenities || '[]',
        roomTypes: roomTypes || '[]',
        mealPlans: mealPlans || '[]',
      },
    })

    return NextResponse.json(pkg, { status: 201 })
  } catch (error: unknown) {
    console.error('Error creating package:', error)
    if (error && typeof error === 'object' && 'code' in error && (error as { code: string }).code === 'P2002') {
      return NextResponse.json({ error: 'A package with this slug already exists' }, { status: 409 })
    }
    const message = error instanceof Error ? error.message : 'Failed to create package'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
