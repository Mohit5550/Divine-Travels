import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const query = (searchParams.get('query') || searchParams.get('code') || searchParams.get('phone'))?.trim()

    if (!query) {
      return NextResponse.json(
        { error: 'Please enter your Promo Code, Registered Phone Number, or Email' },
        { status: 400 }
      )
    }

    const cleanQuery = query.toUpperCase()
    const cleanPhone = query.replace(/[^0-9]/g, '')

    // Search for creator collaboration by assignedCoupon, proposedCoupon, phone, or email
    const rows = await (db as any).$queryRawUnsafe(`
      SELECT * FROM "CreatorCollaboration"
      WHERE UPPER("assignedCoupon") = ?
         OR UPPER("proposedCoupon") = ?
         OR "email" = ?
         OR "phone" LIKE ?
      ORDER BY "createdAt" DESC
      LIMIT 1
    `, cleanQuery, cleanQuery, query.toLowerCase(), `%${cleanPhone || query}%`).catch(() => [])

    const creator = rows[0]

    if (!creator) {
      return NextResponse.json(
        { error: 'No creator account found with this Promo Code or Phone number.' },
        { status: 404 }
      )
    }

    const code = creator.assignedCoupon?.trim().toUpperCase()
    let couponRecord: any = null

    if (code) {
      couponRecord = await db.coupon.findUnique({
        where: { code },
        include: {
          bookings: {
            select: {
              id: true,
              fullName: true,
              totalPrice: true,
              discountAmount: true,
              status: true,
              createdAt: true,
              package: {
                select: {
                  name: true,
                  category: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      }).catch(() => null)
    }

    const allBookings = couponRecord?.bookings || []

    // Only bookings with status 'completed' qualify for payable commission!
    const completedBookings = allBookings.filter((b: any) => b.status === 'completed')
    const pendingBookings = allBookings.filter((b: any) => b.status === 'pending' || b.status === 'confirmed')
    const cancelledBookings = allBookings.filter((b: any) => b.status === 'cancelled' || b.status === 'rejected')

    const completedSales = completedBookings.reduce((sum: number, b: any) => sum + (b.totalPrice || 0), 0)
    const pendingSales = pendingBookings.reduce((sum: number, b: any) => sum + (b.totalPrice || 0), 0)

    const commissionPct = creator.commissionPct || 10
    const payableCommission = Math.round((completedSales * commissionPct) / 100)
    const pendingCommission = Math.round((pendingSales * commissionPct) / 100)

    // Mask customer name for privacy e.g. "Rahul V."
    const maskName = (name: string) => {
      if (!name) return 'Customer'
      const parts = name.trim().split(' ')
      if (parts.length === 1) return parts[0].slice(0, 3) + '***'
      return `${parts[0]} ${parts[parts.length - 1].charAt(0)}.`
    }

    return NextResponse.json({
      success: true,
      creator: {
        id: creator.id,
        name: creator.name,
        instagram: creator.instagram,
        status: creator.status,
        collaborationType: creator.collaborationType,
        assignedCoupon: creator.assignedCoupon || creator.proposedCoupon,
        commissionPct,
      },
      stats: {
        totalBookings: couponRecord?.usedCount || allBookings.length,
        completedBookingsCount: completedBookings.length,
        pendingBookingsCount: pendingBookings.length,
        cancelledBookingsCount: cancelledBookings.length,
        completedSales,
        pendingSales,
        payableCommission, // EXACT EARNED COMMISSION (Trip Completed & Paid)
        pendingCommission, // PENDING (Trip yet to be completed)
      },
      bookings: allBookings.map((b: any) => {
        const isCompleted = b.status === 'completed'
        const itemCommission = isCompleted ? Math.round(((b.totalPrice || 0) * commissionPct) / 100) : 0

        return {
          id: b.id,
          customerName: maskName(b.fullName),
          packageName: b.package?.name || 'Tour Package',
          totalPrice: b.totalPrice,
          status: b.status,
          bookedAt: b.createdAt,
          commission: itemCommission,
        }
      }),
    })
  } catch (error: any) {
    console.error('Creator track error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to track creator statistics' },
      { status: 500 }
    )
  }
}
