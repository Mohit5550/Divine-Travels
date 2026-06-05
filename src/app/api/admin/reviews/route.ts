import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const for_pkg = searchParams.get('for') || 'destination'

    if (for_pkg === 'package') {
      const reviews = await db.packageReview.findMany({
        include: { user: { select: { id: true, name: true, email: true } }, package: { select: { id: true, name: true, category: true } } },
        orderBy: { createdAt: 'desc' },
      })
      return NextResponse.json(reviews)
    }

    const reviews = await db.review.findMany({
      include: { user: { select: { id: true, name: true, email: true } }, destination: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(reviews)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
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
    const userId = request.headers.get('x-user-id')
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
