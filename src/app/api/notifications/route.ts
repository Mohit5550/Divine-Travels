import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unread') === 'true'
    const where: Record<string, unknown> = { userId }
    if (unreadOnly) where.read = false
    const notifications = await db.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    const unreadCount = await db.notification.count({ where: { userId, read: false } })
    return NextResponse.json({ notifications, unreadCount })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, title, message, type, link } = body
    if (!userId || !title || !message) {
      return NextResponse.json({ error: 'userId, title, and message are required' }, { status: 400 })
    }
    const notification = await db.notification.create({
      data: { userId, title, message, type: type || 'info', link: link || null },
    })
    return NextResponse.json(notification, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 })
  }
}
