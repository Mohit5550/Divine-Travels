import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { notifyAdmin } from '@/lib/notify'
import { sendBookingConfirmationEmail } from '@/lib/email'
import { resolveCampingTier } from '@/lib/hotelBooking'

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
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const paginate = searchParams.has('page')
    const skip = (page - 1) * limit

    const user = await db.user.findUnique({ where: { id: userId } })

    const where: Record<string, unknown> = {}
    if (!user || user.role !== 'admin') {
      where.userId = userId
    }

    // Apply status filter at DB level
    if (status && status !== 'all') {
      where.status = status
    }

    // Apply category filter at DB level (via relation)
    if (category && user?.role === 'admin') {
      where.package = { category }
    }

    const [bookings, total] = await Promise.all([
      db.packageBooking.findMany({
        where,
        include: {
          package: {
            select: {
              id: true,
              name: true,
              subtitle: true,
              image: true,
              price: true,
              originalPrice: true,
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
        ...(paginate ? { take: limit, skip } : {}),
      }),
      paginate ? db.packageBooking.count({ where }) : Promise.resolve(0),
    ])

    let result = bookings

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

    if (paginate) {
      return NextResponse.json({ data: result, total, page, totalPages: Math.ceil(total / limit) })
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

    // Detect hotel / camping breakdown stored in additionalNotes.
    let isHotelBooking = false
    let isCampingBooking = false
    if (additionalNotes) {
      try {
        const parsed = JSON.parse(additionalNotes)
        if (parsed && parsed.isHotel === true) isHotelBooking = true
        if (parsed && parsed.isCamping === true) isCampingBooking = true
      } catch {
        // not a stay breakdown; ignore
      }
    }

    // Server-side re-derivation of the camping total from the package's tier
    // table + the actual headcount. This is the security guard: a client can
    // never be charged a larger-group rate for a smaller group (or vice versa)
    // because the per-person rate is recomputed from the headcount, never
    // trusted from the request body.
    let stayBreakdownJson: string | null = null
    let stayBaseTotal = 0
    const isStayBooking = isHotelBooking || isCampingBooking

    if (isCampingBooking && additionalNotes) {
      try {
        const parsed = JSON.parse(additionalNotes)
        const roomTypes = JSON.parse(pkg.roomTypes || '[]') as any[]
        const rt = roomTypes.find((r) => r.name === parsed.campTypeName)
        const headcount = (Number(parsed.adults) || 0) + (Number(parsed.children) || 0)
        const camps = Math.max(1, Number(parsed.camps) || 1)
        const nights = Math.max(1, Number(parsed.nights) || 1)
        const headcountPerCamp = Math.ceil(headcount / camps)
        const tier = rt ? resolveCampingTier(rt as any, headcountPerCamp) : null
        const pricePerPerson = tier ? tier.pricePerPerson : (rt?.price || pkg.price)
        const campCost = pricePerPerson * headcount * nights
        const mealPlanPrice = Number(parsed.mealPlanPrice) || 0
        const mealCost = mealPlanPrice * headcount * nights
        const preDiscount = campCost + mealCost
        const corrected = {
          ...parsed,
          tierPerCamp: headcountPerCamp,
          pricePerPerson,
          roomCost: campCost,
          mealCost,
          total: preDiscount,
        }
        stayBreakdownJson = JSON.stringify(corrected)
        stayBaseTotal = preDiscount
      } catch {
        stayBaseTotal = pkg.price * (numberOfPeople || 1)
      }
    } else if (isHotelBooking && additionalNotes) {
      try {
        const parsed = JSON.parse(additionalNotes)
        stayBaseTotal = typeof parsed.total === 'number' ? parsed.total : pkg.price * (numberOfPeople || 1)
        stayBreakdownJson = additionalNotes
      } catch {
        stayBaseTotal = pkg.price * (numberOfPeople || 1)
      }
    }

    // The form sends `pricePerPerson` which already reflects any date-based
    // availability override (effectivePrice) for the chosen travel date.
    // Fall back to the package's standard price when not provided.
    const incomingUnitPrice =
      typeof pricePerPerson === 'number' && pricePerPerson > 0 ? pricePerPerson : pkg.price

    let unitPrice = isStayBooking ? pkg.price : incomingUnitPrice
    let baseTotal = isStayBooking ? stayBaseTotal : unitPrice * (numberOfPeople || 1)
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
        return NextResponse.json({ error: `Minimum order amount of ₹${coupon.minAmount.toLocaleString()} required` }, { status: 400 })
      }

      // Check category match
      const c = coupon as any
      if (c.applicableCategory && c.applicableCategory !== 'all' && pkg.category) {
        if (c.applicableCategory.toLowerCase() !== pkg.category.toLowerCase()) {
          return NextResponse.json({ error: `This coupon code is valid only on ${c.applicableCategory.toUpperCase()} packages` }, { status: 400 })
        }
      }

      // Check user eligibility (New user / First-time booking only)
      if (c.userEligibility === 'new_users_only' && userId) {
        const [pastPkgBookings, pastBookings, pastTours] = await Promise.all([
          db.packageBooking.count({ where: { userId } }),
          db.booking.count({ where: { userId } }),
          (db as any).tourBooking?.count({ where: { userId } }) || 0,
        ])
        if (pastPkgBookings + pastBookings + pastTours > 0) {
          return NextResponse.json({ error: 'This referral code is valid only for first-time bookings by new users' }, { status: 400 })
        }
      }

      discountAmount = Math.round(baseTotal * (coupon.discountPct / 100))
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount
      }
      couponId = coupon.id

      const updatedCoupon = await db.coupon.update({
        where: { id: coupon.id, usedCount: { lt: coupon.maxUses || 999999 } },
        data: { usedCount: { increment: 1 } },
      }).catch(() => null)
      if (!updatedCoupon) {
        return NextResponse.json({ error: 'Coupon usage limit reached' }, { status: 400 })
      }
    }

    let totalPrice = body.totalPrice != null ? Number(body.totalPrice) : baseTotal - discountAmount

    // Camping: always trust the server-derived total + discount (tamper-proof).
    if (isCampingBooking) {
      totalPrice = Math.max(0, Math.round(stayBaseTotal - discountAmount))
      if (stayBreakdownJson) {
        try {
          const cb = JSON.parse(stayBreakdownJson)
          cb.discount = discountAmount
          cb.total = totalPrice
          stayBreakdownJson = JSON.stringify(cb)
        } catch {}
      }
    }

    const booking = await db.packageBooking.create({
      data: {
        userId,
        packageId,
        fullName,
        mobile,
        numberOfPeople: Number(numberOfPeople) || 1,
        preferredDate: new Date(preferredDate),
        preferredTime: preferredTime || null,
        additionalNotes: stayBreakdownJson || additionalNotes || null,
        totalPrice,
        originalPrice: pkg.originalPrice ?? null,
        basePrice: pkg.price,
        unitPrice: isStayBooking ? totalPrice : unitPrice,
        couponId,
        discountAmount,
        status: 'pending',
        paymentId: paymentId || null,
        paymentOrderId: paymentOrderId || null,
        paymentStatus: 'pending',
        paymentAmount: paymentAmount ? Number(paymentAmount) : null,
        paymentCompletedAt: null,
      },
      include: {
        package: {
          select: {
            name: true,
            subtitle: true,
            image: true,
            price: true,
            originalPrice: true,
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

    // Send confirmation email
    try {
      const user = await db.user.findUnique({ where: { id: userId }, select: { email: true } })
      if (user?.email) {
        const firstPackage = booking.package
        await sendBookingConfirmationEmail(user.email, {
          id: booking.id,
          packageName: firstPackage?.name || 'Package',
          date: new Date(preferredDate).toLocaleDateString('en-IN'),
          people: Number(numberOfPeople) || 1,
          totalPrice,
        }).catch(() => {})
      }
    } catch {}

    return NextResponse.json(booking, { status: 201 })
  } catch (error) {
    console.error('Error creating package booking:', error)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}
