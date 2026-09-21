import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserIdFromRequest } from '@/lib/get-user-id'

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request)
    if (!userId) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

    const admin = await db.user.findUnique({ where: { id: userId } })
    if (!admin || admin.role !== 'admin') return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || ''

    const where: Record<string, unknown> = {}
    if (status) where.status = status

    const refunds = await db.refund.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, upiId: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(refunds)
  } catch (error) {
    console.error('Refunds fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch refunds' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request)
    if (!userId) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

    const admin = await db.user.findUnique({ where: { id: userId } })
    if (!admin || admin.role !== 'admin') return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

    const body = await request.json()
    const { refundId, status, paidMethod, adminNote } = body

    if (!refundId || !status) {
      return NextResponse.json({ error: 'refundId and status required' }, { status: 400 })
    }

    if (!['paid', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const refund = await db.refund.findUnique({
      where: { id: refundId },
      include: { user: { select: { name: true, upiId: true } } },
    })
    if (!refund) return NextResponse.json({ error: 'Refund not found' }, { status: 404 })

    const updateData: Record<string, unknown> = { status, adminNote: adminNote || null }
    if (status === 'paid') {
      updateData.paidAt = new Date()
      updateData.paidMethod = paidMethod || 'upi'
    }

    await db.refund.update({ where: { id: refundId }, data: updateData })

    await db.notification.create({
      data: {
        userId: refund.userId,
        title: status === 'paid' ? 'Refund Processed' : 'Refund Rejected',
        message: status === 'paid'
          ? `Your refund of ₹${refund.refundAmount.toLocaleString('en-IN')} for "${refund.bookingTitle}" has been processed via ${paidMethod || 'UPI'}.`
          : `Your refund request for "${refund.bookingTitle}" has been rejected. ${adminNote || ''}`,
        type: status === 'paid' ? 'refund-paid' : 'refund-rejected',
        link: 'user-dashboard',
      },
    })

    return NextResponse.json({ success: true, message: `Refund marked as ${status}` })
  } catch (error) {
    console.error('Refund update error:', error)
    return NextResponse.json({ error: 'Failed to update refund' }, { status: 500 })
  }
}
