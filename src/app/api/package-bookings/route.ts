import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { notifyAdmin } from '@/lib/notify'

// GET /api/package-bookings - List bookings (admin: all, user: own)
export async function GET(request: Request) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const all = searchParams.get('all')
    const category = searchParams.get('category')

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
            category: true,
          },
        },
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    let result = bookings
    if (category && user?.role === 'admin') {
      result = bookings.filter((b) => b.package.category === category)
    }

    // Auto-fix: if a booking is "confirmed" but unpaid, check if there's a Payment record
    // This handles the case where the PUT to update paymentStatus failed
    for (const booking of result) {
      if (booking.status === 'confirmed' && booking.paymentStatus !== 'completed' && booking.paymentId) {
        const payment = await db.payment.findFirst({
          where: { pkgBookingId: booking.id, status: 'completed' },
        })
        if (payment) {
          try {
            await db.packageBooking.update({
              where: { id: booking.id },
              data: {
                paymentStatus: 'completed',
                paymentAmount: payment.amount,
                paymentCompletedAt: payment.createdAt,
              },
            })
            booking.paymentStatus = 'completed'
            booking.paymentAmount = payment.amount
            booking.paymentCompletedAt = payment.createdAt
          } catch {}
        }
      }
    }

    return NextResponse.json(result)
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
      preferredDate, preferredTime, additionalNotes, couponCode,
      paymentId, paymentOrderId, paymentStatus, paymentAmount,
      pricePerPerson,
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

    let unitPrice = pricePerPerson ? Number(pricePerPerson) : pkg.price
    let baseTotal = unitPrice * (numberOfPeople || 1)
    let discountAmount = 0
    let couponId: string | null = null

    // Validate and apply coupon if provided
    if (couponCode) {
      const coupon = await db.coupon.findUnique({ where: { code: couponCode.toUpperCase() } })
      if (!coupon) {
        return NextResponse.json({ error: 'Invalid coupon code' }, { status: 400 })
      }
      if (!coupon.active) {
        return NextResponse.json({ error: 'Coupon is no longer active' }, { status: 400 })
      }
      if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
        return NextResponse.json({ error: 'Coupon has expired' }, { status: 400 })
      }
      if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
        return NextResponse.json({ error: 'Coupon usage limit reached' }, { status: 400 })
      }
      if (coupon.minAmount && baseTotal < coupon.minAmount) {
        return NextResponse.json({ error: `Minimum order amount of ₹${coupon.minAmount} required` }, { status: 400 })
      }

      discountAmount = Math.round(baseTotal * (coupon.discountPct / 100))
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount
      }
      couponId = coupon.id

      await db.coupon.update({
        where: { id: coupon.id },
        data: { usedCount: { increment: 1 } },
      })
    }

    const totalPrice = baseTotal - discountAmount

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
        couponId,
        discountAmount,
        status: paymentStatus === 'completed' ? 'confirmed' : 'pending',
        paymentId: paymentId || null,
        paymentOrderId: paymentOrderId || null,
        paymentStatus: paymentStatus || 'pending',
        paymentAmount: paymentAmount ? Number(paymentAmount) : null,
        paymentCompletedAt: paymentStatus === 'completed' ? new Date() : null,
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

    const serviceLabel = (pkg.category || 'Package').replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
    notifyAdmin('New Package Booking', `${serviceLabel}: ${fullName} booked "${pkg.name}" for ${numberOfPeople} person(s) on ${preferredDate}`, 'booking', `/admin?tab=${pkg.category || 'package-bookings'}`)

    // Create Payment record if booking was created with completed payment
    if (paymentStatus === 'completed' && paymentId) {
      try {
        await db.payment.create({
          data: {
            userId,
            pkgBookingId: booking.id,
            amount: paymentAmount ? Number(paymentAmount) : totalPrice,
            method: 'online',
            transactionId: paymentId,
            status: 'completed',
          },
        })
      } catch (err) {
        console.error('Failed to create payment record:', err)
      }
    }

    return NextResponse.json(booking, { status: 201 })
  } catch (error) {
    console.error('Error creating package booking:', error)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}
