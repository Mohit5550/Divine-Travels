import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { publicJson } from '@/lib/cache'

export async function GET() {
  try {
    const now = new Date().toISOString()
    // Fetch only active, PUBLIC (non-private) coupons that are not expired
    let coupons: any[] = []
    try {
      coupons = await (db as any).$queryRawUnsafe(`
        SELECT * FROM "Coupon"
        WHERE ("active" = 1 OR "active" = true)
          AND ("isPrivate" = 0 OR "isPrivate" = false OR "isPrivate" IS NULL)
          AND ("type" != 'influencer' AND "type" != 'referral' OR "type" IS NULL)
          AND ("expiresAt" IS NULL OR "expiresAt" > ?)
        ORDER BY "createdAt" DESC
      `, now)
    } catch {
      coupons = await (db as any).coupon.findMany({
        where: { active: true },
        orderBy: { createdAt: 'desc' },
      }).catch(() => [])
    }

    // Filter out any coupon whose usage limit has been reached
    const availableCoupons = (coupons || []).filter(
      (c: any) => !c.maxUses || c.maxUses === 0 || (c.usedCount || 0) < c.maxUses
    )

    return publicJson(availableCoupons)
  } catch (error) {
    console.error('Error fetching active coupons:', error)
    return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 })
  }
}
