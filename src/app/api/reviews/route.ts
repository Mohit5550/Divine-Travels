import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { notifyAdmin } from '@/lib/notify'
import { getUserFromToken } from '@/lib/with-auth'

// GET /api/reviews?destinationId=
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)

    const { searchParams } = new URL(request.url)
    const destinationId = searchParams.get('destinationId')

    const where: Record<string, unknown> = { approved: true }
    if (destinationId) {
      where.destinationId = destinationId
    }

    const reviews = await db.review.findMany({
      where,
      include: { user: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
      take: destinationId ? undefined : 20,
    })

    return NextResponse.json(reviews)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/reviews - Create review
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const { destinationId, rating, comment } = body

    if (!destinationId || !rating || !comment) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    const review = await db.review.create({
      data: {
        userId: user.id,
        destinationId,
        rating: Number(rating),
        comment,
      },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    })

    // Update destination rating and review count
    const reviews = await db.review.findMany({ where: { destinationId } })
    const avgRating = reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviews.length
    await db.destination.update({
      where: { id: destinationId },
      data: { rating: Math.round(avgRating * 10) / 10, reviewCount: reviews.length },
    })

    notifyAdmin('New Review', `${user.name} left a ${rating}-star review`, 'review')

    return NextResponse.json(review, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}