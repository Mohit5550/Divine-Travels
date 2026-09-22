import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { notifyAdmin } from '@/lib/notify'
import { getUserFromToken } from '@/lib/with-auth'
import { resolvePackageId } from '@/lib/resolve-slug'

// GET /api/packages/[id]/reviews - Get reviews for a package (accepts cuid id or slug)
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const packageId = (await resolvePackageId(id)) || id

    const reviews = await db.packageReview.findMany({
      where: { packageId, approved: true },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(reviews)
  } catch (error) {
    console.error('Error fetching package reviews:', error)
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}

// POST /api/packages/[id]/reviews - Create a review for a package
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { rating, comment } = body

    if (!rating || !comment) {
      return NextResponse.json({ error: 'Rating and comment are required' }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    // Verify package exists (accepts cuid id or slug)
    const resolvedId = await resolvePackageId(id)
    if (!resolvedId) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    }
    const pkg = await db.package.findUnique({ where: { id: resolvedId } })
    if (!pkg) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    }

    const review = await db.packageReview.create({
      data: {
        userId: user.id,
        packageId: resolvedId,
        rating: Number(rating),
        comment,
      },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
    })

    // Update package rating and review count
    const stats = await db.packageReview.aggregate({
      where: { packageId: resolvedId },
      _avg: { rating: true },
      _count: { rating: true },
    })

    await db.package.update({
      where: { id: resolvedId },
      data: {
        rating: Math.round((stats._avg.rating || 0) * 10) / 10,
        reviewCount: stats._count.rating || 0,
      },
    })

    notifyAdmin('New Package Review', `${user.name} left a ${rating}-star review on "${pkg.name}"`, 'review')

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error('Error creating package review:', error)
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 })
  }
}