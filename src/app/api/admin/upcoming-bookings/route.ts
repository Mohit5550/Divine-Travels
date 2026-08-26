import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const RANGE_DAYS: Record<string, number> = { today: 1, week: 7, '15': 15, '30': 30 }

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

    const range = request.nextUrl.searchParams.get('range') || 'today'
    const days = RANGE_DAYS[range] ?? 7

    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)
    const end = new Date(startOfToday.getTime() + days * 24 * 60 * 60 * 1000)
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

    const [dest, pkg, tour] = await Promise.all([
      db.booking.findMany({
        select: {
          id: true,
          totalPrice: true,
          status: true,
          createdAt: true,
          checkIn: true,
          destination: { select: { name: true } },
          user: { select: { name: true, email: true, phone: true } },
        },
        orderBy: { checkIn: 'asc' },
      }),
      db.packageBooking.findMany({
        select: {
          id: true,
          totalPrice: true,
          status: true,
          createdAt: true,
          preferredDate: true,
          fullName: true,
          mobile: true,
          package: { select: { name: true } },
          user: { select: { name: true, email: true, phone: true } },
        },
        orderBy: { preferredDate: 'asc' },
      }),
      db.tourBooking.findMany({
        select: {
          id: true,
          totalPrice: true,
          negotiatedPrice: true,
          status: true,
          createdAt: true,
          travelDate: true,
          name: true,
          phone: true,
          adminNotes: true,
          user: { select: { name: true, email: true, phone: true } },
        },
        orderBy: { travelDate: 'asc' },
      }),
    ])

    type Row = {
      id: string
      type: 'destination' | 'package' | 'tour'
      displayType: string
      guest: string
      email: string
      phone: string
      title: string
      date: string | null
      amount: number
      status: string
    }

    const merged: Row[] = [
      ...dest.map((b: any) => ({
        id: b.id,
        type: 'destination' as const,
        displayType: 'Destination',
        guest: b.user?.name || 'Guest',
        email: b.user?.email || '',
        phone: b.user?.phone || '',
        title: b.destination?.name || 'Destination',
        date: b.checkIn ? b.checkIn.toISOString() : null,
        amount: b.totalPrice || 0,
        status: b.status,
      })),
      ...pkg.map((b: any) => ({
        id: b.id,
        type: 'package' as const,
        displayType: 'Package',
        guest: b.user?.name || b.fullName || 'Guest',
        email: b.user?.email || '',
        phone: b.mobile || b.user?.phone || '',
        title: b.package?.name || 'Package',
        date: b.preferredDate ? b.preferredDate.toISOString() : null,
        amount: b.totalPrice || 0,
        status: b.status,
      })),
      ...tour.map((b: any) => {
        let title = b.destination || 'Tour'
        let displayType = 'Day Tour'
        try {
          const notes = JSON.parse(b.adminNotes || '{}')
          if (notes.type === 'taxi-booking') {
            title = `${notes.pickupLocation || '?'} → ${notes.dropLocation || '?'}`
            displayType = 'Taxi'
          }
        } catch {}
        return {
          id: b.id,
          type: 'tour' as const,
          displayType,
          guest: b.user?.name || b.name || 'Guest',
          email: b.user?.email || '',
          phone: b.phone || b.user?.phone || '',
          title,
          date: b.travelDate || null,
          amount: b.negotiatedPrice || b.totalPrice || 0,
          status: b.status,
        }
      }),
    ]

    const active = merged.filter((b) => {
      if (!activeStatuses.has(b.status)) return false
      if (!b.date) return false
      const d = new Date(b.date)
      return d >= startOfToday
    })

    const filtered = active.filter((b) => {
      const d = new Date(b.date!)
      return d >= startOfToday && d <= end
    })

    const counts = {
      today: active.filter((b) => {
        const d = new Date(b.date!)
        return d >= startOfToday && d.getTime() < startOfToday.getTime() + 24 * 60 * 60 * 1000
      }).length,
      week: active.filter((b) => {
        const d = new Date(b.date!)
        return d >= startOfToday && d.getTime() <= startOfToday.getTime() + 7 * 24 * 60 * 60 * 1000
      }).length,
      days15: active.filter((b) => {
        const d = new Date(b.date!)
        return d >= startOfToday && d.getTime() <= startOfToday.getTime() + 15 * 24 * 60 * 60 * 1000
      }).length,
      days30: active.filter((b) => {
        const d = new Date(b.date!)
        return d >= startOfToday && d.getTime() <= startOfToday.getTime() + 30 * 24 * 60 * 60 * 1000
      }).length,
    }

    return NextResponse.json({
      data: filtered,
      counts,
    })
  } catch (error) {
    console.error('Error fetching upcoming bookings:', error)
    return NextResponse.json({ error: 'Failed to fetch upcoming bookings' }, { status: 500 })
  }
}
