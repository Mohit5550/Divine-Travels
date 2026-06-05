import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

    const { id } = await params
    const body = await request.json()
    const { status, adminNotes } = body

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const booking = await db.tourBooking.update({
      where: { id },
      data: { status, adminNotes: adminNotes || null },
    })

    return NextResponse.json({ ...booking, selectedPrograms: JSON.parse(booking.selectedPrograms) })
  } catch (error) {
    console.error('Admin tour booking update error:', error)
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 })
  }
}
