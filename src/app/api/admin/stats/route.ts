import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/admin/stats - Dashboard statistics
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

    const [
      totalBookings,
      totalUsers,
      totalDestinations,
      allBookings,
      recentBookings,
    ] = await Promise.all([
      db.booking.count(),
      db.user.count(),
      db.destination.count({ where: { active: true } }),
      db.booking.findMany({ select: { totalPrice: true, status: true, createdAt: true } }),
      db.booking.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          destination: { select: { name: true } },
          user: { select: { name: true, email: true } },
        },
      }),
    ])

    const totalRevenue = allBookings
      .filter((b) => b.paymentStatus === 'paid')
      .reduce((sum: number, b) => sum + b.totalPrice, 0)

    // Monthly data for chart (last 6 months)
    const monthlyData = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
      const monthBookings = allBookings.filter(
        (b) => b.createdAt >= month && b.createdAt < nextMonth
      )
      const revenue = monthBookings
        .filter((b) => b.paymentStatus === 'paid')
        .reduce((sum: number, b) => sum + b.totalPrice, 0)
      monthlyData.push({
        month: month.toLocaleString('default', { month: 'short' }),
        bookings: monthBookings.length,
        revenue,
      })
    }

    const confirmedBookings = allBookings.filter((b) => b.status === 'confirmed').length
    const pendingBookings = allBookings.filter((b) => b.status === 'pending').length

    return NextResponse.json({
      totalBookings,
      totalRevenue,
      totalUsers,
      totalDestinations,
      confirmedBookings,
      pendingBookings,
      recentBookings,
      monthlyData,
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
