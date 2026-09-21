import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserIdFromRequest } from '@/lib/get-user-id'

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request)
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
      recentDestBookings,
      recentPkgBookings,
      recentTourBookings,
    ] = await Promise.all([
      db.booking.count(),
      db.packageBooking.count(),
      db.tourBooking.count(),
      db.user.count(),
      db.destination.count({ where: { active: true } }),
      db.booking.findMany({ select: { totalPrice: true, status: true, createdAt: true, paymentStatus: true, checkIn: true } }),
      db.packageBooking.findMany({ select: { totalPrice: true, status: true, createdAt: true, preferredDate: true } }),
      db.tourBooking.findMany({ select: { createdAt: true, adminNotes: true, travelDate: true, status: true }, orderBy: { createdAt: 'desc' } }),
      db.booking.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          destination: { select: { name: true } },
          user: { select: { name: true, email: true } },
        },
      }),
      db.packageBooking.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          package: { select: { name: true } },
          user: { select: { name: true, email: true } },
        },
      }),
      db.tourBooking.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
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

    const confirmedBookings =
      allDestinationBookings.filter((b: { status: string }) => b.status === 'confirmed').length +
      allPackageBookings.filter((b: { status: string }) => b.status === 'confirmed').length +
      allTourBookings.filter((b: { status: string }) => b.status === 'confirmed').length
    const pendingBookings =
      allDestinationBookings.filter((b: { status: string }) => b.status === 'pending').length +
      allPackageBookings.filter((b: { status: string }) => b.status === 'pending').length +
      allTourBookings.filter((b: { status: string }) => b.status === 'pending').length

    // Merge all recent bookings into a unified shape
    const destRecent = recentDestBookings.map((b: any) => ({
      id: b.id,
      guest: b.user?.name || 'Guest',
      email: b.user?.email || '',
      title: b.destination?.name || 'Destination',
      amount: b.totalPrice,
      status: b.status,
      type: 'destination',
      createdAt: b.createdAt,
    }))
    const pkgRecent = recentPkgBookings.map((b: any) => ({
      id: b.id,
      guest: b.user?.name || b.fullName || 'Guest',
      email: b.user?.email || '',
      title: b.package?.name || 'Package',
      amount: b.totalPrice,
      status: b.status,
      type: 'package',
      createdAt: b.createdAt,
    }))
    const tourRecent = recentTourBookings.map((b: any) => {
      let label = b.destination || 'Tour'
      try {
        const notes = JSON.parse(b.adminNotes || '{}')
        if (notes.type === 'taxi-booking') {
          label = `${notes.pickupLocation || '?'} → ${notes.dropLocation || '?'}`
        }
      } catch {}
      return {
        id: b.id,
        guest: b.user?.name || b.name || 'Guest',
        email: b.user?.email || '',
        title: label,
        amount: b.totalPrice || 0,
        status: b.status,
        type: 'tour',
        createdAt: b.createdAt,
      }
    })

    const recentBookings = [...destRecent, ...pkgRecent, ...tourRecent]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5)

    // Upcoming bookings: travel date in the future and within 7/15/30 days
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)
    const dayMs = 24 * 60 * 60 * 1000
    const window7 = new Date(startOfToday.getTime() + 7 * dayMs)
    const window15 = new Date(startOfToday.getTime() + 15 * dayMs)
    const window30 = new Date(startOfToday.getTime() + 30 * dayMs)

    const activeStatuses = new Set([
      'pending',
      'confirmed',
      'approved',
      'ready',
      'assigned',
      'camp_ready',
      'driver_assigned',
      'in_progress',
      'started',
      'checked_in',
      'completed',
    ])
    const countUpcoming = (list: any[], dateField: string) => {
      let week = 0
      let days15 = 0
      let days30 = 0
      for (const b of list) {
        if (!activeStatuses.has(b.status)) continue
        const d = new Date(b[dateField])
        if (isNaN(d.getTime())) continue
        if (d < startOfToday) continue
        if (d <= window7) week++
        if (d <= window15) days15++
        if (d <= window30) days30++
      }
      return { week, days15, days30 }
    }

    const destUp = countUpcoming(allDestinationBookings, 'checkIn')
    const pkgUp = countUpcoming(allPackageBookings, 'preferredDate')
    const tourUp = countUpcoming(allTourBookings, 'travelDate')

    const upcoming = {
      week: destUp.week + pkgUp.week + tourUp.week,
      days15: destUp.days15 + pkgUp.days15 + tourUp.days15,
      days30: destUp.days30 + pkgUp.days30 + tourUp.days30,
    }

    return NextResponse.json({
      totalBookings,
      totalRevenue,
      totalUsers,
      totalDestinations,
      confirmedBookings,
      pendingBookings,
      recentBookings,
      monthlyData,
      upcoming,
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
