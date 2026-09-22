import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserIdFromRequest } from '@/lib/get-user-id'
import { resolveDestination, slugify } from '@/lib/resolve-slug'
import { publicJson } from '@/lib/cache'

// GET /api/destinations/[id] - Get one with reviews (accepts cuid id or slug)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const found = await resolveDestination(id)
    const destination = found
      ? await db.destination.findUnique({
          where: { id: found.id },
          include: {
            reviews: {
              include: { user: { select: { id: true, name: true, avatar: true } } },
              orderBy: { createdAt: 'desc' },
            },
          },
        })
      : null

    if (!destination) {
      return NextResponse.json({ error: 'Destination not found' }, { status: 404 })
    }

    return publicJson(destination)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/destinations/[id] - Update (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userId = getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    if (body.slug !== undefined) body.slug = slugify(body.slug)
    // Backfill slug on update when the record has none yet
    if (!body.slug) {
      const existing = await db.destination.findUnique({ where: { id } })
      if (existing && !(existing as any).slug) {
        body.slug = slugify(body.name || existing.name)
      }
    }
    const destination = await db.destination.update({
      where: { id },
      data: body,
    })

    return NextResponse.json(destination)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/destinations/[id] - Delete (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userId = getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    await db.destination.delete({ where: { id } })
    return NextResponse.json({ message: 'Destination deleted' })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
