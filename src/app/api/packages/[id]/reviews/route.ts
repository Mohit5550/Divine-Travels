import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { notifyAdmin } from '@/lib/notify'

// GET /api/packages/[id]/reviews - Get reviews for a package
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const reviews = await db.packageReview.findMany({
      where: { packageId: id },
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
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const { rating, comment } = body

    if (!rating || !comment) {
      return NextResponse.json({ error: 'Rating and comment are required' }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    // Verify package exists
    const pkg = await db.package.findUnique({ where: { id } })
    if (!pkg) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    }

    const review = await db.packageReview.create({
      data: {
        userId,
        packageId: id,
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
      where: { packageId: id },
      _avg: { rating: true },
      _count: { rating: true },
    })

    await db.package.update({
      where: { id },
      data: {
        rating: stats._avg.rating || 0,
        reviewCount: stats._count.rating || 0,
      },
    })

    const user = await db.user.findUnique({ where: { id: userId }, select: { name: true } })
    notifyAdmin('New Package Review', `${user?.name || 'Someone'} left a ${rating}-star review on "${pkg.name}"`, 'review')

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error('Error creating package review:', error)
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 })
  }
}
