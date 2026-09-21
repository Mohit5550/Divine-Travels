import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserIdFromRequest } from '@/lib/get-user-id'

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const [destinationReviews, packageReviews] = await Promise.all([
      db.review.findMany({
        where: { userId },
        include: {
          destination: { select: { id: true, name: true, image: true, state: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      db.packageReview.findMany({
        where: { userId },
        include: {
          package: { select: { id: true, name: true, image: true, category: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ])
    return NextResponse.json({ destinationReviews, packageReviews })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}
