import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const packageIds = searchParams.get('packageIds')
    const destinationIds = searchParams.get('destinationIds')

    const result: { packages: any[]; destinations: any[] } = { packages: [], destinations: [] }

    if (packageIds) {
      const ids = packageIds.split(',').filter(Boolean)
      if (ids.length > 0) {
        const pkgs = await db.package.findMany({
          where: { id: { in: ids }, active: true },
          include: {
            reviews: { where: { approved: true }, select: { rating: true } },
          },
        })
        result.packages = pkgs.map((p) => {
          const ratings = p.reviews.map((r) => r.rating)
          const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0
          return {
            id: p.id,
            name: p.name,
            tagline: p.tagline,
            subtitle: p.subtitle,
            description: p.description,
            price: p.price,
            originalPrice: p.originalPrice,
            image: p.image,
            category: p.category,
            duration: p.duration,
            distance: p.distance,
            rating: Math.round(avgRating * 10) / 10,
            reviewCount: ratings.length,
            badge: p.badge,
          }
        })
      }
    }

    if (destinationIds) {
      const ids = destinationIds.split(',').filter(Boolean)
      if (ids.length > 0) {
        result.destinations = await db.destination.findMany({
          where: { id: { in: ids }, active: true },
          select: {
            id: true,
            name: true,
            tagline: true,
            description: true,
            price: true,
            image: true,
            category: true,
            state: true,
            rating: true,
            reviewCount: true,
          },
        })
      }
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching cart items:', error)
    return NextResponse.json({ error: 'Failed to fetch cart items' }, { status: 500 })
  }
}
