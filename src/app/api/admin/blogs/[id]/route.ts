import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cleanSlug } from '@/lib/resolve-slug'
import { getUserIdFromRequest } from '@/lib/get-user-id'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const blog = await db.blog.findUnique({
      where: { id },
      include: { category: { select: { id: true, name: true, slug: true } } },
    })
    if (!blog) return NextResponse.json({ error: 'Blog not found' }, { status: 404 })
    return NextResponse.json(blog)
  } catch (error) {
    console.error('Error fetching blog:', error)
    return NextResponse.json({ error: 'Failed to fetch blog' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userId = getUserIdFromRequest(request)
    if (!userId) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 })

    const body = await request.json()
    const { title, slug, content, excerpt, featuredImage, tags, categoryId, author, published, metaTitle, metaDescription } = body

    const data: Record<string, unknown> = {}
    if (title !== undefined) data.title = title
    if (slug !== undefined) data.slug = cleanSlug(slug)
    if (content !== undefined) data.content = content
    if (excerpt !== undefined) data.excerpt = excerpt
    if (featuredImage !== undefined) data.featuredImage = featuredImage
    if (tags !== undefined) data.tags = JSON.stringify(tags)
    if (categoryId !== undefined) data.categoryId = categoryId
    if (author !== undefined) data.author = author
    if (metaTitle !== undefined) data.metaTitle = metaTitle
    if (metaDescription !== undefined) data.metaDescription = metaDescription
    if (published !== undefined) {
      data.published = published
      data.publishedAt = published ? new Date() : null
    }

    const blog = await db.blog.update({ where: { id }, data })
    return NextResponse.json(blog)
  } catch (error) {
    console.error('Error updating blog:', error)
    return NextResponse.json({ error: 'Failed to update blog' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await db.blog.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting blog:', error)
    return NextResponse.json({ error: 'Failed to delete blog' }, { status: 500 })
  }
}
