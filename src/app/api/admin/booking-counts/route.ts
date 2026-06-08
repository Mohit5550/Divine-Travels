import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const serviceCategories = [
  { key: 'taxi', label: 'Taxi Bookings' },
  { key: 'package-rafting', label: 'Rafting Bookings', category: 'rafting' },
  { key: 'package-trekking', label: 'Trekking Bookings', category: 'trekking' },
  { key: 'package-adventure', label: 'Adventure Bookings', category: 'adventure' },
  { key: 'package-bike-rental', label: 'Bike Rental Bookings', category: 'bike-rental' },
  { key: 'package-domestic-tours', label: 'Domestic Tour Bookings', category: 'domestic-tours' },
  { key: 'package-spiritual-tours', label: 'Spiritual Tour Bookings', category: 'spiritual-tours' },
  { key: 'package-international-tours', label: 'International Tour Bookings', category: 'international-tours' },
  { key: 'package-stay-hotel', label: 'Hotel Bookings', category: 'stay-hotel' },
  { key: 'package-stay-camping', label: 'Camping Bookings', category: 'stay-camping' },
  { key: 'tour', label: 'Day Tour Bookings' },
]

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

    // Fetch all package bookings with package category
    const packageBookings = await db.packageBooking.findMany({
      where: { status: 'pending' },
      include: {
        package: { select: { category: true } },
      },
    })

    // Count pending per package category
    const packageCounts: Record<string, number> = {}
    for (const pb of packageBookings) {
      const cat = pb.package.category || 'other'
      packageCounts[cat] = (packageCounts[cat] || 0) + 1
    }

    // Count pending taxi bookings (TourBooking with adminNotes containing taxi-booking)
    const allTourBookings = await db.tourBooking.findMany({
      where: { status: 'pending' },
      select: { adminNotes: true },
    })

    let taxiCount = 0
    let tourCount = 0
    for (const tb of allTourBookings) {
      try {
        const notes = JSON.parse(tb.adminNotes || '{}')
        if (notes.type === 'taxi-booking') {
          taxiCount++
        } else {
          tourCount++
        }
      } catch {
        tourCount++
      }
    }

    // Build counts object per display key
    const counts: Record<string, number> = {}
    for (const svc of serviceCategories) {
      if (svc.key === 'taxi') {
        counts[svc.key] = taxiCount
      } else if (svc.key === 'tour') {
        counts[svc.key] = tourCount
      } else if (svc.key.startsWith('package-') && svc.category) {
        counts[svc.key] = packageCounts[svc.category] || 0
      }
    }

    return NextResponse.json({ counts, services: serviceCategories })
  } catch (error) {
    console.error('Error fetching booking counts:', error)
    return NextResponse.json({ error: 'Failed to fetch booking counts' }, { status: 500 })
  }
}
