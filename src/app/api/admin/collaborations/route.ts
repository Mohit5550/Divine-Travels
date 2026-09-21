import { NextRequest, NextResponse } from 'next/server'
import { getCollaborations, getCollaborationStats } from '@/lib/collaborations-db'
import { db } from '@/lib/db'
import { getUserIdFromRequest } from '@/lib/get-user-id'

export async function GET(req: NextRequest) {
  try {
    const userId = getUserIdFromRequest(req)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || undefined
    const type = searchParams.get('type') || undefined

    const [rawApplications, stats] = await Promise.all([
      getCollaborations({ status, type }),
      getCollaborationStats(),
    ])

    // For every application with an assigned coupon, fetch live usage stats from db.coupon and db.packageBooking
    const applications = await Promise.all(
      rawApplications.map(async (app) => {
        const code = app.assignedCoupon?.trim().toUpperCase()
        if (!code) {
          return {
            ...app,
            tracking: {
              usedCount: 0,
              completedCount: 0,
              pendingCount: 0,
              completedSales: 0,
              pendingSales: 0,
              payableCommission: 0,
              pendingCommission: 0,
              bookings: [],
            },
          }
        }

        try {
          const couponRecord = await db.coupon.findUnique({
            where: { code },
            include: {
              bookings: {
                select: {
                  id: true,
                  fullName: true,
                  mobile: true,
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
                take: 20,
              },
            },
          })

          if (!couponRecord) {
            return {
              ...app,
              tracking: {
                usedCount: 0,
                completedCount: 0,
                pendingCount: 0,
                completedSales: 0,
                pendingSales: 0,
                payableCommission: 0,
                pendingCommission: 0,
                bookings: [],
              },
            }
          }

          const allBookings = couponRecord.bookings || []
          
          // Separate Completed vs Pending/Upcoming vs Cancelled
          const completedBookings = allBookings.filter((b) => b.status === 'completed')
          const pendingBookings = allBookings.filter((b) => b.status === 'pending' || b.status === 'confirmed')
          
          const completedSales = completedBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0)
          const pendingSales = pendingBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0)
          
          const commissionPct = app.commissionPct || 10
          // ONLY completed bookings earn confirmed payable commission!
          const payableCommission = Math.round((completedSales * commissionPct) / 100)
          const pendingCommission = Math.round((pendingSales * commissionPct) / 100)

          return {
            ...app,
            tracking: {
              usedCount: couponRecord.usedCount || allBookings.length,
              completedCount: completedBookings.length,
              pendingCount: pendingBookings.length,
              completedSales,
              pendingSales,
              payableCommission,
              pendingCommission,
              bookings: allBookings.map((b) => ({
                id: b.id,
                customerName: b.fullName,
                customerPhone: b.mobile,
                packageName: b.package?.name || 'Tour Package',
                totalPrice: b.totalPrice,
                discount: b.discountAmount,
                status: b.status,
                bookedAt: b.createdAt,
              })),
            },
          }
        } catch (err) {
          console.error('Error fetching coupon tracking for code:', code, err)
          return {
            ...app,
            tracking: {
              usedCount: 0,
              completedCount: 0,
              pendingCount: 0,
              completedSales: 0,
              pendingSales: 0,
              payableCommission: 0,
              pendingCommission: 0,
              bookings: [],
            },
          }
        }
      })
    )

    return NextResponse.json({
      success: true,
      applications,
      stats,
    })
  } catch (error: any) {
    console.error('Admin fetch collaborations error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch collaboration applications' },
      { status: 500 }
    )
  }
}
