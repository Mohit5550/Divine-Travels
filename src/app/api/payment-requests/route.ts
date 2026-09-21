import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromToken } from '@/lib/with-auth'

// GET /api/payment-requests - Get user's payment requests
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || ''
    const where: Record<string, unknown> = { userId: user.id }
    if (status) where.status = status

    const paymentRequests = await db.paymentRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(paymentRequests)
  } catch (error) {
    console.error('Get user payment requests error:', error)
    return NextResponse.json({ error: 'Failed to fetch payment requests' }, { status: 500 })
  }
}


