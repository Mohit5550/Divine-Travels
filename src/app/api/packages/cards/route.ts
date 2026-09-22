import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { publicJson } from '@/lib/cache'

// GET /api/packages/cards - Lightweight listing payload for cards/grids/search.
// Same filters as /api/packages but selects only card-sized fields (drops
// itinerary/faqs/inclusions/roomTypes/mealPlans and other heavy blobs).
// Returns a plain array (or { data, total, page, totalPages } with ?page=).
const CARD_SELECT = {
  id: true,
  slug: true,
  name: true,
  tagline: true,
  subtitle: true,
  description: true,
  price: true,
  originalPrice: true,
  image: true,
  images: true,
  category: true,
  distance: true,
  duration: true,
  rapidsLevel: true,
  rapidsDescription: true,
  targetDemo: true,
  timings: true,
  eligibility: true,
  location: true,
  pickupLocationUrl: true,
  cancellationPolicy: true,
  badge: true,
  badgeColor: true,
  gradient: true,
  featured: true,
  active: true,
  rating: true,
  reviewCount: true,
  routeLength: true,
  maxAltitude: true,
  baseCamp: true,
  pickupPoint: true,
  suitableFor: true,
  experience: true,
  fitness: true,
  bestSeason: true,
  gstRate: true,
  propertyType: true,
  amenities: true,
  createdAt: true,
  updatedAt: true,
} as const

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(200, Math.max(1, parseInt(searchParams.get('limit') || '100')))
    const paginate = searchParams.has('page')
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = { active: true }

    if (category) {
      where.category = { contains: category }
    }
    if (featured === 'true') {
      where.featured = true
    }
    if (search) {
      const q = search.trim()
      if (q) {
        where.OR = [
          { name: { contains: q } },
          { tagline: { contains: q } },
          { subtitle: { contains: q } },
        ]
      }
    }

    const [packages, total] = await Promise.all([
      db.package.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        select: { ...CARD_SELECT },
        ...(paginate ? { take: limit, skip } : { take: limit }),
      }),
      paginate ? db.package.count({ where }) : Promise.resolve(0),
    ])

    if (paginate) {
      return publicJson({ data: packages, total, page, totalPages: Math.ceil(total / limit) })
    }
    return publicJson(packages)
  } catch (error) {
    console.error('Error fetching package cards:', error)
    return NextResponse.json({ error: 'Failed to fetch packages' }, { status: 500 })
  }
}
