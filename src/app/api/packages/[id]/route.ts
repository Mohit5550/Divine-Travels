import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/packages/[id] - Get package details with reviews
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const pkg = await db.package.findUnique({
      where: { id },
      include: {
        reviews: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { bookings: true },
        },
      },
    })

    if (!pkg) {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    }

    return NextResponse.json(pkg)
  } catch (error) {
    console.error('Error fetching package:', error)
    return NextResponse.json({ error: 'Failed to fetch package' }, { status: 500 })
  }
}

// PUT /api/packages/[id] - Update package (admin only)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const pkg = await db.package.update({
      where: { id },
      data: body,
    })

    return NextResponse.json(pkg)
  } catch (error: unknown) {
    console.error('Error updating package:', error)
    if (error && typeof error === 'object' && 'code' in error && (error as { code: string }).code === 'P2025') {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update package' }, { status: 500 })
  }
}

// DELETE /api/packages/[id] - Delete package (admin only)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Soft delete - set active to false
    await db.package.update({
      where: { id },
      data: { active: false },
    })

    return NextResponse.json({ message: 'Package deleted successfully' })
  } catch (error: unknown) {
    console.error('Error deleting package:', error)
    if (error && typeof error === 'object' && 'code' in error && (error as { code: string }).code === 'P2025') {
      return NextResponse.json({ error: 'Package not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete package' }, { status: 500 })
  }
}
