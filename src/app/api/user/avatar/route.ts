import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
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
