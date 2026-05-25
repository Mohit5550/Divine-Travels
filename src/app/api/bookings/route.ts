import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/bookings - List bookings
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const all = searchParams.get('all')

    const user = await db.user.findUnique({ where: { id: userId } })

    let where: Record<string, unknown> = {}
    if (all === 'true' && user?.role === 'admin') {
      // Admin sees all
    } else {
      where.userId = userId
    }

    const bookings = await db.booking.findMany({
      where,
      include: {
        destination: true,
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(bookings)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/bookings - Create booking
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const { destinationId, checkIn, checkOut, guests, totalPrice, phone, specialReqs } = body

    if (!destinationId || !checkIn || !checkOut || !guests || !totalPrice) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 })
    }

    const booking = await db.booking.create({
      data: {
        userId,
        destinationId,
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        guests: Number(guests),
        totalPrice: Number(totalPrice),
        phone: phone || null,
        specialReqs: specialReqs || null,
        status: 'pending',
        paymentStatus: 'pending',
      },
      include: { destination: true },
    })

    return NextResponse.json(booking, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
