import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserIdFromRequest } from '@/lib/get-user-id'

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const for_pkg = searchParams.get('for') || 'destination'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const paginate = searchParams.has('page')
    const skip = (page - 1) * limit

    if (for_pkg === 'package') {
      const [reviews, total] = await Promise.all([
        db.packageReview.findMany({
          include: { user: { select: { id: true, name: true, email: true } }, package: { select: { id: true, name: true, category: true } } },
          orderBy: { createdAt: 'desc' },
          ...(paginate ? { take: limit, skip } : {}),
        }),
        paginate ? db.packageReview.count() : Promise.resolve(0),
      ])
      if (paginate) return NextResponse.json({ data: reviews, total, page, totalPages: Math.ceil(total / limit) })
      return NextResponse.json(reviews)
    }

    const [reviews, total] = await Promise.all([
      db.review.findMany({
        include: { user: { select: { id: true, name: true, email: true } }, destination: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
        ...(paginate ? { take: limit, skip } : {}),
      }),
      paginate ? db.review.count() : Promise.resolve(0),
    ])
    if (paginate) return NextResponse.json({ data: reviews, total, page, totalPages: Math.ceil(total / limit) })
    return NextResponse.json(reviews)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
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
    const { reviewId, approved, for_pkg = 'destination' } = body

    if (!reviewId) {
      return NextResponse.json({ error: 'reviewId is required' }, { status: 400 })
    }

    if (for_pkg === 'package') {
      await db.packageReview.update({ where: { id: reviewId }, data: { approved } })
    } else {
      await db.review.update({ where: { id: reviewId }, data: { approved } })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const reviewId = searchParams.get('reviewId')
    const for_pkg = searchParams.get('for') || 'destination'

    if (!reviewId) {
      return NextResponse.json({ error: 'reviewId is required' }, { status: 400 })
    }

    if (for_pkg === 'package') {
      await db.packageReview.delete({ where: { id: reviewId } })
    } else {
      await db.review.delete({ where: { id: reviewId } })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
