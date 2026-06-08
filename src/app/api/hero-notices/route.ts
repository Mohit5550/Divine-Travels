import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const notices = await db.heroNotice.findMany({
      where: { active: true },
      orderBy: { order: 'asc' },
    })
    return NextResponse.json(notices)
  } catch (error) {
    console.error('Error fetching hero notices:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { image, heading, description, order } = body
    if (!heading) return NextResponse.json({ error: 'Heading required' }, { status: 400 })
    const notice = await db.heroNotice.create({
      data: { image, heading, description, order: order || 0 },
    })
    return NextResponse.json(notice, { status: 201 })
  } catch (error) {
    console.error('Error creating hero notice:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
