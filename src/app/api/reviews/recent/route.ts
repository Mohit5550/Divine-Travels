import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const reviews = await db.packageReview.findMany({
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        package: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 9,
    })

    const mapped = reviews.map((r) => ({
      name: r.user?.name || 'Anonymous',
      date: r.createdAt.toISOString(),
      rating: r.rating,
      text: r.comment,
      packageName: r.package?.name || '',
    }))

    return NextResponse.json(mapped)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}
