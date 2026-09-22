import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { publicJson } from '@/lib/cache'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = { published: true }
    if (category) where.categoryId = category

    const [blogs, total] = await Promise.all([
      db.blog.findMany({
        where,
        include: { category: { select: { id: true, name: true, slug: true } } },
        orderBy: { publishedAt: 'desc' },
        take: limit,
        skip,
      }),
      db.blog.count({ where }),
    ])

    return publicJson({ blogs, total, page, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    console.error('Error fetching blogs:', error)
    return NextResponse.json({ blogs: [], total: 0, page: 1, totalPages: 0 })
  }
}
