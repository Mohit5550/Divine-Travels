import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserIdFromRequest } from '@/lib/get-user-id'

export async function PUT(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request)
    if (!userId) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

    const body = await request.json()
    const { upiId } = body

    if (!upiId || typeof upiId !== 'string') {
      return NextResponse.json({ error: 'Valid UPI ID required' }, { status: 400 })
    }

    await db.user.update({
      where: { id: userId },
      data: { upiId: upiId.trim() },
    })

    return NextResponse.json({ success: true, message: 'UPI ID updated' })
  } catch (error) {
    console.error('UPI update error:', error)
    return NextResponse.json({ error: 'Failed to update UPI ID' }, { status: 500 })
  }
}
