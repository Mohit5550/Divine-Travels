import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserIdFromRequest } from '@/lib/get-user-id'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = getUserIdFromRequest(request)
    if (!userId) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

    const { id } = await params
    const body = await request.json()
    const { status, adminNotes } = body

    const VALID_STATUSES = [
      'pending',
      'confirmed',
      'approved',
      'ready',
      'assigned',
      'in_progress',
      'completed',
      'cancelled',
      'rejected',
    ]

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const booking = await db.tourBooking.update({
      where: { id },
      data: { status, adminNotes: adminNotes || null },
    })

    let programs: string[] = []
    const sp = booking.selectedPrograms
    if (Array.isArray(sp)) {
      programs = sp
    } else if (typeof sp === 'string') {
      try {
        const parsed = JSON.parse(sp)
        programs = Array.isArray(parsed) ? parsed : [parsed]
      } catch {
        programs = sp ? [sp] : []
      }
    }
    return NextResponse.json({ ...booking, selectedPrograms: programs })
  } catch (error) {
    console.error('Admin tour booking update error:', error)
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 })
  }
}
