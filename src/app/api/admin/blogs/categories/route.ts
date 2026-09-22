import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cleanSlug } from '@/lib/resolve-slug'
import { getUserIdFromRequest } from '@/lib/get-user-id'

export async function GET(request: Request) {
  try {
    const userId = getUserIdFromRequest(request)
    if (!userId) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 })

    const categories = await db.blogCategory.findMany({
      include: { _count: { select: { blogs: true } } },
      orderBy: { name: 'asc' },
    })
    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching blog categories:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const userId = getUserIdFromRequest(request)
    if (!userId) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 })

    const body = await request.json()
    const { name, slug, description } = body

    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 })
    }

    const category = await db.blogCategory.create({ data: { name, slug: cleanSlug(slug), description: description || null } })
    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Error creating blog category:', error)
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const userId = getUserIdFromRequest(request)
    if (!userId) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 })

    const body = await request.json()
    const { id, name, slug, description } = body

    if (!id) return NextResponse.json({ error: 'Category ID is required' }, { status: 400 })

    const data: Record<string, unknown> = {}
    if (name !== undefined) data.name = name
    if (slug !== undefined) data.slug = cleanSlug(slug)
    if (description !== undefined) data.description = description

    const category = await db.blogCategory.update({ where: { id }, data })
    return NextResponse.json(category)
  } catch (error) {
    console.error('Error updating blog category:', error)
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const userId = getUserIdFromRequest(request)
    if (!userId) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Admin only' }, { status: 403 })

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Category ID is required' }, { status: 400 })

    await db.blogCategory.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting blog category:', error)
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
}
