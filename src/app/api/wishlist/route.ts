import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/wishlist - Get user's wishlist
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const wishlist = await db.wishlist.findMany({
      where: { userId },
      include: { destination: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(wishlist)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/wishlist - Add to wishlist
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const { destinationId } = body

    if (!destinationId) {
      return NextResponse.json({ error: 'destinationId is required' }, { status: 400 })
    }

    // Check if already in wishlist
    const existing = await db.wishlist.findFirst({
      where: { userId, destinationId },
    })

    if (existing) {
      return NextResponse.json({ error: 'Already in wishlist' }, { status: 409 })
    }

    const item = await db.wishlist.create({
      data: { userId, destinationId },
      include: { destination: true },
    })

    return NextResponse.json(item, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/wishlist - Remove from wishlist
export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const { destinationId } = body

    if (!destinationId) {
      return NextResponse.json({ error: 'destinationId is required' }, { status: 400 })
    }

    await db.wishlist.deleteMany({
      where: { userId, destinationId },
    })

    return NextResponse.json({ message: 'Removed from wishlist' })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
