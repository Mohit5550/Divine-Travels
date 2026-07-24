import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where: Record<string, string> = {}
    if (status && status !== 'all') where.status = status

    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const paginate = searchParams.has('page')
    const skip = (page - 1) * limit

    const [bookings, total] = await Promise.all([
      db.tourBooking.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        ...(paginate ? { take: limit, skip } : {}),
      }),
      paginate ? db.tourBooking.count({ where }) : Promise.resolve(0),
    ])

    const parsed = bookings.map((b) => {
      let programs: string[] = []
      if (Array.isArray(b.selectedPrograms)) {
        programs = b.selectedPrograms
      } else if (typeof b.selectedPrograms === 'string') {
        try {
          const parsed = JSON.parse(b.selectedPrograms)
          programs = Array.isArray(parsed) ? parsed : [parsed]
        } catch {
          programs = b.selectedPrograms ? [b.selectedPrograms] : []
        }
      }
      return { ...b, selectedPrograms: programs }
    })

    if (paginate) {
      return NextResponse.json({ data: parsed, total, page, totalPages: Math.ceil(total / limit) })
    }
    return NextResponse.json(parsed)
  } catch (error) {
    console.error('Admin tour bookings error:', error)
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
}
