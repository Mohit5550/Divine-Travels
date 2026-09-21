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

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'bookings'
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    const dateFilter: Record<string, unknown> = {}
    if (from || to) {
      const createdAt: Record<string, Date> = {}
      if (from) createdAt.gte = new Date(from)
      if (to) createdAt.lte = new Date(to + 'T23:59:59.999Z')
      dateFilter.createdAt = createdAt
    }

    if (type === 'revenue') {
      const packages = await db.package.findMany({
        select: { name: true, category: true, price: true, _count: { select: { bookings: true } } },
      })

      let csv = 'Package,Category,Price,Total Bookings,Estimated Revenue\n'
      for (const p of packages) {
        const rev = p.price * p._count.bookings
        csv += `"${p.name}","${p.category}",${p.price},${p._count.bookings},${rev}\n`
      }

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="revenue-report.csv"',
        },
      })
    }

    if (type === 'package-bookings') {
      const bookings = await db.packageBooking.findMany({
        where: dateFilter,
        orderBy: { createdAt: 'desc' },
        include: { package: { select: { name: true, category: true } }, user: { select: { name: true, email: true } } },
      })

      let csv = 'ID,Customer Name,Email,Phone,Package,Category,People,Date,Total,Discount,Status,Booked At\n'
      for (const b of bookings) {
        csv += `"${b.id.slice(0, 8)}","${b.fullName}","${b.user?.email || ''}","${b.mobile}","${b.package.name}","${b.package.category}",${b.numberOfPeople},"${b.preferredDate.toISOString().split('T')[0]}",${b.totalPrice},${b.discountAmount},"${b.status}","${b.createdAt.toISOString()}"\n`
      }

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="package-bookings.csv"',
        },
      })
    }

    const bookings = await db.booking.findMany({
      where: dateFilter,
      orderBy: { createdAt: 'desc' },
      include: { destination: { select: { name: true } }, user: { select: { name: true, email: true } } },
    })

    let csv = 'ID,Guest Name,Email,Destination,Check In,Check Out,Guests,Total,Status,Payment,Booked At\n'
    for (const b of bookings) {
      csv += `"${b.id.slice(0, 8)}","${b.user.name}","${b.user.email}","${b.destination.name}","${b.checkIn.toISOString().split('T')[0]}","${b.checkOut.toISOString().split('T')[0]}",${b.guests},${b.totalPrice},"${b.status}","${b.paymentStatus}","${b.createdAt.toISOString()}"\n`
    }

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="bookings.csv"',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
