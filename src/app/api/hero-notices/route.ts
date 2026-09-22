import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { publicJson } from '@/lib/cache'
import { getUserIdFromRequest } from '@/lib/get-user-id'

export async function GET() {
  try {
    const notices = await db.heroNotice.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
    })
    return publicJson(notices)
  } catch (error) {
    console.error('Error fetching hero notices:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { image, heading, description, link, order } = body
    if (!heading) return NextResponse.json({ error: 'Heading required' }, { status: 400 })
    const notice = await db.heroNotice.create({
      data: { image, heading, description, link: link || null, order: order || 0 },
    })
    return NextResponse.json(notice, { status: 201 })
  } catch (error) {
    console.error('Error creating hero notice:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
