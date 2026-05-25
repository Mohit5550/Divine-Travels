import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/package-bookings - List bookings (admin: all, user: own)
export async function GET(request: Request) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const all = searchParams.get('all')

    const user = await db.user.findUnique({ where: { id: userId } })

    const where: Record<string, unknown> = {}
    if (!user || user.role !== 'admin' || !all) {
      where.userId = userId
    }

    const bookings = await db.packageBooking.findMany({
      where,
      include: {
        package: {
          select: {
            id: true,
            name: true,
            subtitle: true,
            image: true,
            price: true,
            duration: true,
            distance: true,
          },
        },
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(bookings)
  } catch (error) {
    console.error('Error fetching package bookings:', error)
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
}

// POST /api/package-bookings - Create a new package booking
export async function POST(request: Request) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const {
      packageId, fullName, mobile, numberOfPeople,
      preferredDate, preferredTime, additionalNotes,
    } = body

    if (!packageId || !fullName || !mobile || !preferredDate) {
      return NextResponse.json(
        { error: 'Package, full name, mobile, and preferred date are required' },
        { status: 400 }
      )
    }

    // Verify package exists and is active
    const pkg = await db.package.findUnique({ where: { id: packageId } })
    if (!pkg || !pkg.active) {
      return NextResponse.json({ error: 'Package not found or inactive' }, { status: 404 })
    }

    const totalPrice = pkg.price * (numberOfPeople || 1)

    const booking = await db.packageBooking.create({
      data: {
        userId,
        packageId,
        fullName,
        mobile,
        numberOfPeople: Number(numberOfPeople) || 1,
        preferredDate: new Date(preferredDate),
        preferredTime: preferredTime || null,
        additionalNotes: additionalNotes || null,
        totalPrice,
        status: 'pending',
      },
      include: {
        package: {
          select: {
            name: true,
            subtitle: true,
            image: true,
            price: true,
          },
        },
      },
    })

    return NextResponse.json(booking, { status: 201 })
  } catch (error) {
    console.error('Error creating package booking:', error)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}
