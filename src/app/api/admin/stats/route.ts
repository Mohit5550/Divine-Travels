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
      totalDestinationBookings,
      totalPackageBookings,
      totalTourBookings,
      totalUsers,
      totalDestinations,
      allDestinationBookings,
      allPackageBookings,
      allTourBookings,
      recentDestinationBookings,
    ] = await Promise.all([
      db.booking.count(),
      db.packageBooking.count(),
      db.tourBooking.count(),
      db.user.count(),
      db.destination.count({ where: { active: true } }),
      db.booking.findMany({ select: { totalPrice: true, status: true, createdAt: true, paymentStatus: true } }),
      db.packageBooking.findMany({ select: { totalPrice: true, status: true, createdAt: true } }),
      db.tourBooking.findMany({ select: { createdAt: true }, orderBy: { createdAt: 'desc' } }),
      db.booking.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          destination: { select: { name: true } },
          user: { select: { name: true, email: true } },
        },
      }),
    ])

    const totalBookings = totalDestinationBookings + totalPackageBookings + totalTourBookings

    const totalRevenue = allDestinationBookings
      .filter((b: { paymentStatus: string }) => b.paymentStatus === 'paid')
      .reduce((sum: number, b: { totalPrice: number }) => sum + b.totalPrice, 0) +
      allPackageBookings
        .filter((b: { status: string }) => b.status === 'confirmed')
        .reduce((sum: number, b: { totalPrice: number }) => sum + b.totalPrice, 0)

    // Monthly data for chart (last 6 months)
    const monthlyData: { month: string; bookings: number; revenue: number }[] = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
      const destMonth = allDestinationBookings.filter(
        (b: { createdAt: Date }) => b.createdAt >= month && b.createdAt < nextMonth
      )
      const pkgMonth = allPackageBookings.filter(
        (b: { createdAt: Date }) => b.createdAt >= month && b.createdAt < nextMonth
      )
      const tourMonth = allTourBookings.filter(
        (b: { createdAt: Date }) => b.createdAt >= month && b.createdAt < nextMonth
      )
      const revenue = destMonth
        .filter((b: { paymentStatus: string }) => b.paymentStatus === 'paid')
        .reduce((sum: number, b: { totalPrice: number }) => sum + b.totalPrice, 0) +
        pkgMonth
          .filter((b: { status: string }) => b.status === 'confirmed')
          .reduce((sum: number, b: { totalPrice: number }) => sum + b.totalPrice, 0)
      monthlyData.push({
        month: month.toLocaleString('default', { month: 'short' }),
        bookings: destMonth.length + pkgMonth.length + tourMonth.length,
        revenue,
      })
    }

    const confirmedBookings = allDestinationBookings.filter((b: { status: string }) => b.status === 'confirmed').length
    const pendingBookings = allDestinationBookings.filter((b: { status: string }) => b.status === 'pending').length

    return NextResponse.json({
      totalBookings,
      totalRevenue,
      totalUsers,
      totalDestinations,
      confirmedBookings,
      pendingBookings,
      recentBookings: recentDestinationBookings,
      monthlyData,
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
