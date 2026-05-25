import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/reviews?destinationId=
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const destinationId = searchParams.get('destinationId')

    if (!destinationId) {
      return NextResponse.json({ error: 'destinationId is required' }, { status: 400 })
    }

    const reviews = await db.review.findMany({
      where: { destinationId },
      include: { user: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(reviews)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/reviews - Create review
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const { destinationId, rating, comment } = body

    if (!destinationId || !rating || !comment) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 })
    }

    const review = await db.review.create({
      data: {
        userId,
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

    return NextResponse.json(review, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
