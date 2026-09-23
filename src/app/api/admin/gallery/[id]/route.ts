import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { toDirectImageUrl } from '@/lib/utils'
import { getUserIdFromRequest } from '@/lib/get-user-id'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { url, title, alt, category, featured, order, active } = body

    const existing = await db.galleryImage.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }

    // If marking as featured, ensure we don't exceed 5
    if (featured && !existing.featured) {
      const featuredCount = await db.galleryImage.count({ where: { featured: true, active: true } })
      if (featuredCount >= 5) {
        return NextResponse.json(
          { error: 'You can only have 5 featured images on the homepage. Unfeature one first.' },
          { status: 400 },
        )
      }
    }

    const image = await db.galleryImage.update({
      where: { id },
      data: {
        url: url !== undefined ? toDirectImageUrl(url) : existing.url,
        title: title !== undefined ? title : existing.title,
        alt: alt !== undefined ? alt : existing.alt,
        category: category !== undefined ? category : existing.category,
        featured: featured !== undefined ? !!featured : existing.featured,
        order: typeof order === 'number' ? order : existing.order,
        active: active !== undefined ? !!active : existing.active,
      },
    })

    return NextResponse.json(image)
  } catch (error) {
    console.error('Update gallery image error:', error)
    return NextResponse.json({ error: 'Failed to update gallery image' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { id } = await params
    await db.galleryImage.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
