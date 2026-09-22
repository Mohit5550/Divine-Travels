import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserIdFromRequest } from '@/lib/get-user-id'
import { resolvePackage } from '@/lib/resolve-slug'

// GET /api/packages/[id] - Get package details with reviews (accepts cuid id or slug)
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const pkg = await (async () => {
      const base = await resolvePackage(id)
      if (!base) return null
      return db.package.findUnique({
        where: { id: base.id },
        include: {
          reviews: {
            include: {
              user: {
                select: { id: true, name: true, avatar: true },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
          _count: {
            select: { bookings: true },
          },
        },
      })
    })()

    if (!pkg) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    }

    return NextResponse.json(pkg)
  } catch (error) {
    console.error('Error fetching package:', error)
    return NextResponse.json({ error: 'Failed to fetch package' }, { status: 500 })
  }
}

// PUT /api/packages/[id] - Update package (admin only)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
      locationUrls, cancellationPolicy, faqs, badge, badgeColor, gradient,
      featured, active, routeLength, maxAltitude, baseCamp, pickupPoint,
      suitableFor, experience, fitness, bestSeason, gstRate,
      itinerary, thingsToCarry, howToReach, importantInfo, fixedDepartures,
      propertyType, amenities, roomTypes, mealPlans,
    } = body

    const pkg = await db.package.update({
      where: { id },
      data: {
        name, slug, tagline, subtitle, description,
        price: price !== undefined ? Number(price) : undefined,
        originalPrice: originalPrice !== undefined ? (originalPrice ? Number(originalPrice) : null) : undefined,
        image, images, category, distance, duration, rapidsLevel,
        rapidsDescription, targetDemo, timings, highlights,
        inclusions, exclusions, eligibility, location, pickupLocationUrl,
        locationUrls, cancellationPolicy, faqs, badge, badgeColor, gradient,
        featured, active, routeLength, maxAltitude, baseCamp, pickupPoint,
        suitableFor, experience, fitness, bestSeason,
        gstRate: gstRate !== undefined ? Number(gstRate) : undefined,
        itinerary, thingsToCarry, howToReach, importantInfo, fixedDepartures,
        propertyType, amenities, roomTypes, mealPlans,
      },
    })

    return NextResponse.json(pkg)
  } catch (error: unknown) {
    console.error('Error updating package:', error)
    if (error && typeof error === 'object' && 'code' in error && (error as { code: string }).code === 'P2025') {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update package' }, { status: 500 })
  }
}

// DELETE /api/packages/[id] - Delete package (admin only)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userId = getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Soft delete - set active to false
    await db.package.update({
      where: { id },
      data: { active: false },
    })

    return NextResponse.json({ message: 'Package deleted successfully' })
  } catch (error: unknown) {
    console.error('Error deleting package:', error)
    if (error && typeof error === 'object' && 'code' in error && (error as { code: string }).code === 'P2025') {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete package' }, { status: 500 })
  }
}
