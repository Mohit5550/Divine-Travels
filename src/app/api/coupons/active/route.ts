import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const now = new Date()
    const coupons = await db.coupon.findMany({
      where: {
        active: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gte: now } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(coupons)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 })
  }
}
