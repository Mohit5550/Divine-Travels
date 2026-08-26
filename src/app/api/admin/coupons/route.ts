import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const paginate = searchParams.has('page')
    const skip = (page - 1) * limit

    const [coupons, total] = await Promise.all([
      db.coupon.findMany({
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { bookings: true } } },
        ...(paginate ? { take: limit, skip } : {}),
      }),
      paginate ? db.coupon.count() : Promise.resolve(0),
    ])

    if (paginate) {
      return NextResponse.json({ data: coupons, total, page, totalPages: Math.ceil(total / limit) })
    }
    return NextResponse.json(coupons)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const {
      code,
      description,
      discountPct,
      maxDiscount,
      minAmount,
      maxUses,
      expiresAt,
      type = 'public',
      isPrivate = false,
      applicableCategory = 'all',
      userEligibility = 'all',
      creatorName,
    } = body

    if (!code || !discountPct) {
      return NextResponse.json({ error: 'Code and discountPct are required' }, { status: 400 })
    }

    const coupon = await (db as any).coupon.create({
      data: {
        code: code.trim().toUpperCase(),
        description,
        discountPct: Number(discountPct),
        maxDiscount: maxDiscount ? Number(maxDiscount) : null,
        minAmount: minAmount ? Number(minAmount) : null,
        maxUses: maxUses ? Number(maxUses) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        type: type || 'public',
        isPrivate: isPrivate || type === 'influencer' || type === 'referral',
        applicableCategory: applicableCategory || 'all',
        userEligibility: userEligibility || 'all',
        creatorName: creatorName || null,
      },
    })

    return NextResponse.json(coupon, { status: 201 })
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && (error as { code: string }).code === 'P2002') {
      return NextResponse.json({ error: 'A coupon with this code already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const {
      id,
      code,
      description,
      discountPct,
      maxDiscount,
      minAmount,
      maxUses,
      expiresAt,
      active,
      type,
      isPrivate,
      applicableCategory,
      userEligibility,
      creatorName,
    } = body

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const data: Record<string, unknown> = {}
    if (code !== undefined) data.code = code.trim().toUpperCase()
    if (description !== undefined) data.description = description
    if (discountPct !== undefined) data.discountPct = Number(discountPct)
    if (maxDiscount !== undefined) data.maxDiscount = maxDiscount ? Number(maxDiscount) : null
    if (minAmount !== undefined) data.minAmount = minAmount ? Number(minAmount) : null
    if (maxUses !== undefined) data.maxUses = maxUses ? Number(maxUses) : null
    if (expiresAt !== undefined) data.expiresAt = expiresAt ? new Date(expiresAt) : null
    if (active !== undefined) data.active = active
    if (type !== undefined) data.type = type
    if (isPrivate !== undefined) data.isPrivate = isPrivate
    if (applicableCategory !== undefined) data.applicableCategory = applicableCategory
    if (userEligibility !== undefined) data.userEligibility = userEligibility
    if (creatorName !== undefined) data.creatorName = creatorName

    const coupon = await (db as any).coupon.update({ where: { id }, data })
    return NextResponse.json(coupon)
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && (error as { code: string }).code === 'P2002') {
      return NextResponse.json({ error: 'A coupon with this code already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to update coupon' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    await db.coupon.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
