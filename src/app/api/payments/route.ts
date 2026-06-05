import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    const payments = await db.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })
    return NextResponse.json(payments)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 })
  }
}
