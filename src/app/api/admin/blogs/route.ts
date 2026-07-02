import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 })

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 20
    const skip = (page - 1) * limit

    const [blogs, total] = await Promise.all([
      db.blog.findMany({
        include: { category: { select: { id: true, name: true, slug: true } } },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
      db.blog.count(),
    ])

    return NextResponse.json({ blogs, total, page, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    console.error('Error fetching admin blogs:', error)
    return NextResponse.json({ error: 'Failed to fetch blogs' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 })

    const body = await request.json()
    const { title, slug, content, excerpt, featuredImage, tags, categoryId, author, published, metaTitle, metaDescription } = body

    if (!title || !slug || !content) {
      return NextResponse.json({ error: 'Title, slug, and content are required' }, { status: 400 })
    }

    const blog = await db.blog.create({
      data: {
        title,
        slug,
        content,
        excerpt: excerpt || '',
        featuredImage: featuredImage || null,
        tags: JSON.stringify(tags || []),
        categoryId: categoryId || null,
        author: author || 'Divine Travels',
        published: published || false,
        publishedAt: published ? new Date() : null,
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || excerpt || '',
      },
    })

    return NextResponse.json(blog, { status: 201 })
  } catch (error) {
    console.error('Error creating blog:', error)
    return NextResponse.json({ error: 'Failed to create blog' }, { status: 500 })
  }
}
