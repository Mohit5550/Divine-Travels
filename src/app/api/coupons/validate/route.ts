import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

async function validateCouponLogic(code: string | null, amount: number | null, userId: string | null, category: string | null) {
  if (!code) {
    return { status: 400, data: { valid: false, error: 'Coupon code is required' } }
  }

  const coupon = await (db as any).coupon.findFirst({
    where: {
      code: code.trim().toUpperCase(),
      active: true,
    },
  })

  if (!coupon) {
    return { status: 400, data: { valid: false, error: 'Invalid or inactive coupon code' } }
  }

  // Check expiry
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    return { status: 400, data: { valid: false, error: 'This coupon code has expired' } }
  }

  // Check max usage
  if (coupon.maxUses && coupon.maxUses > 0 && (coupon.usedCount || 0) >= coupon.maxUses) {
    return { status: 400, data: { valid: false, error: 'Coupon usage limit has been reached' } }
  }

  // Check minimum order amount
  if (coupon.minAmount && amount && amount < coupon.minAmount) {
    return {
      status: 400,
      data: {
        valid: false,
        error: `Minimum order amount for this coupon is ₹${coupon.minAmount.toLocaleString()}`,
      },
    }
  }

  // Check category restriction
  if (coupon.applicableCategory && coupon.applicableCategory !== 'all' && category) {
    const cleanCat = category.toLowerCase().trim()
    const allowedCat = coupon.applicableCategory.toLowerCase().trim()
    if (cleanCat !== allowedCat && !cleanCat.includes(allowedCat) && !allowedCat.includes(cleanCat)) {
      return {
        status: 400,
        data: {
          valid: false,
          error: `This coupon code is valid only on ${coupon.applicableCategory.toUpperCase()} bookings`,
        },
      }
    }
  }

  // Check user eligibility (New Users / First Booking Only)
  if (coupon.userEligibility === 'new_users_only' && userId) {
    const [packageCount, tourCount, destBookingCount] = await Promise.all([
      db.packageBooking.count({ where: { userId } }).catch(() => 0),
      (db as any).tourBooking?.count({ where: { userId } }).catch(() => 0) || 0,
      db.booking.count({ where: { userId } }).catch(() => 0),
    ])
    const totalBookings = packageCount + tourCount + destBookingCount
    if (totalBookings > 0) {
      return {
        status: 400,
        data: {
          valid: false,
          error: 'This referral code is valid only on first-time bookings for new users',
        },
      }
    }
  }

  return {
    status: 200,
    data: {
      valid: true,
      code: coupon.code,
      discountPct: coupon.discountPct,
      maxDiscount: coupon.maxDiscount,
      minAmount: coupon.minAmount,
      type: coupon.type || 'public',
      userEligibility: coupon.userEligibility || 'all',
      applicableCategory: coupon.applicableCategory || 'all',
    },
  }
}

// GET /api/coupons/validate?code=COUPONCODE&amount=1000&userId=xxx&category=rafting
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const amount = searchParams.get('amount') ? Number(searchParams.get('amount')) : null
    const userId = searchParams.get('userId')
    const category = searchParams.get('category')

    const result = await validateCouponLogic(code, amount, userId, category)
    return NextResponse.json(result.data, { status: result.status })
  } catch (error) {
    console.error('Error validating coupon:', error)
    return NextResponse.json({ valid: false, error: 'Failed to validate coupon' }, { status: 500 })
  }
}

// POST /api/coupons/validate
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const code = body.code
    const amount = body.totalAmount ? Number(body.totalAmount) : body.amount ? Number(body.amount) : null
    const userId = body.userId || null
    const category = body.category || null

    const result = await validateCouponLogic(code, amount, userId, category)
    return NextResponse.json(result.data, { status: result.status })
  } catch (error) {
    console.error('Error validating coupon POST:', error)
    return NextResponse.json({ valid: false, error: 'Failed to validate coupon' }, { status: 500 })
  }
}