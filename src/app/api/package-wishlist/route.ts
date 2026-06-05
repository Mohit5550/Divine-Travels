import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    const wishlist = await db.packageWishlist.findMany({
      where: { userId },
      include: {
        package: {
          select: { id: true, name: true, tagline: true, image: true, price: true, originalPrice: true, category: true, rating: true, reviewCount: true, location: true, duration: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(wishlist)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    const body = await request.json()
    const { packageId } = body
    if (!packageId) {
      return NextResponse.json({ error: 'packageId is required' }, { status: 400 })
    }
    const existing = await db.packageWishlist.findUnique({
      where: { userId_packageId: { userId, packageId } },
    })
    if (existing) {
      return NextResponse.json({ message: 'Already in wishlist' }, { status: 200 })
    }
    const item = await db.packageWishlist.create({
      data: { userId, packageId },
      include: {
        package: {
          select: { id: true, name: true, image: true, price: true, category: true },
        },
      },
    })
    return NextResponse.json(item, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to add to wishlist' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    const body = await request.json()
    const { packageId } = body
    if (packageId) {
      await db.packageWishlist.deleteMany({ where: { userId, packageId } })
    } else {
      const { searchParams } = new URL(request.url)
      const id = searchParams.get('id')
      if (id) {
        await db.packageWishlist.deleteMany({ where: { id, userId } })
      }
    }
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to remove from wishlist' }, { status: 500 })
  }
}
