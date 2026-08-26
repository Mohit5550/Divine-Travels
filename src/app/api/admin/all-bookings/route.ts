import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit
    const search = (searchParams.get('search') || '').trim().toLowerCase()
    const typeFilter = (searchParams.get('type') || '').trim().toLowerCase()
    const statusFilter = (searchParams.get('status') || '').trim().toLowerCase()

    const [dest, pkg, tour] = await Promise.all([
      db.booking.findMany({
        select: {
          id: true,
          totalPrice: true,
          status: true,
          createdAt: true,
          checkIn: true,
          destination: { select: { name: true } },
          user: { select: { name: true, email: true } },
        },
        orderBy: { checkIn: 'desc' },
      }),
      db.packageBooking.findMany({
        select: {
          id: true,
          totalPrice: true,
          status: true,
          createdAt: true,
          preferredDate: true,
          fullName: true,
          package: { select: { name: true, category: true } },
          user: { select: { name: true, email: true } },
        },
        orderBy: { preferredDate: 'desc' },
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
          adminNotes: true,
          user: { select: { name: true, email: true } },
        },
        orderBy: { travelDate: 'desc' },
      }),
    ])

    type Row = {
      id: string
      type: 'destination' | 'package' | 'tour' | 'taxi'
      category: string | null
      displayType: string
      guest: string
      email: string
      title: string
      date: string | null
      amount: number
      status: string
      createdAt: Date
    }

    const packageDisplayType = (category?: string | null) => {
      if (category === 'bike-rental') return 'Bike Rental'
      if (category === 'stay-hotel') return 'Hotel'
      if (category === 'stay-camping') return 'Camping'
      return 'Package'
    }

    const merged: Row[] = [
      ...dest.map((b: any) => ({
        id: b.id,
        type: 'destination' as const,
        category: null,
        displayType: 'Destination',
        guest: b.user?.name || 'Guest',
        email: b.user?.email || '',
        title: b.destination?.name || 'Destination',
        date: b.checkIn ? b.checkIn.toISOString() : null,
        amount: b.totalPrice || 0,
        status: b.status,
        createdAt: b.createdAt,
      })),
      ...pkg.map((b: any) => ({
        id: b.id,
        type: 'package' as const,
        category: b.package?.category || null,
        displayType: packageDisplayType(b.package?.category),
        guest: b.user?.name || b.fullName || 'Guest',
        email: b.user?.email || '',
        title: b.package?.name || 'Package',
        date: b.preferredDate ? b.preferredDate.toISOString() : null,
        amount: b.totalPrice || 0,
        status: b.status,
        createdAt: b.createdAt,
      })),
      ...tour.map((b: any) => {
        let title = b.destination || 'Tour'
        let displayType = 'Day Tour'
        let type: 'tour' | 'taxi' = 'tour'
        try {
          const notes = JSON.parse(b.adminNotes || '{}')
          if (notes.type === 'taxi-booking') {
            title = `${notes.pickupLocation || '?'} → ${notes.dropLocation || '?'}`
            displayType = 'Taxi'
            type = 'taxi'
          }
        } catch {}
        return {
          id: b.id,
          type,
          category: null,
          displayType,
          guest: b.user?.name || b.name || 'Guest',
          email: b.user?.email || '',
          title,
          date: b.travelDate || null,
          amount: b.negotiatedPrice || b.totalPrice || 0,
          status: b.status,
          createdAt: b.createdAt,
        }
      }),
    ]

    merged.sort((a, b) => {
      const da = new Date(a.date || a.createdAt).getTime()
      const db2 = new Date(b.date || b.createdAt).getTime()
      return db2 - da
    })

    const categoryFilters = ['bike-rental', 'stay-hotel', 'stay-camping']
    const filtered = merged.filter((b) => {
      if (search && !(b.guest.toLowerCase().includes(search) || b.email.toLowerCase().includes(search))) return false
      if (typeFilter) {
        if (categoryFilters.includes(typeFilter)) {
          if (b.category !== typeFilter) return false
        } else if (b.type !== typeFilter) {
          return false
        }
      }
      if (statusFilter && b.status.toLowerCase() !== statusFilter) return false
      return true
    })

    const total = filtered.length
    const data = filtered.slice(skip, skip + limit)

    return NextResponse.json({ data, total, page, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    console.error('All bookings error:', error)
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
}
