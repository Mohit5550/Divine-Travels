import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserIdFromRequest } from '@/lib/get-user-id'

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    const body = await request.json()
    const { avatar } = body
    if (!avatar) {
      return NextResponse.json({ error: 'Avatar URL is required' }, { status: 400 })
    }
    const user = await db.user.update({
      where: { id: userId },
      data: { avatar },
      select: { id: true, name: true, email: true, avatar: true, role: true, phone: true },
    })
    return NextResponse.json(user)
  } catch {
    return NextResponse.json({ error: 'Failed to update avatar' }, { status: 500 })
  }
}
