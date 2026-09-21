import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, verifyPassword } from '@/lib/password'
import { getUserIdFromRequest } from '@/lib/get-user-id'

export async function PUT(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    const body = await request.json()
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current password and new password are required' }, { status: 400 })
    }
    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 })
    }

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    if (!(await verifyPassword(currentPassword, user.password))) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
    }

    await db.user.update({
      where: { id: userId },
      data: { password: await hashPassword(newPassword) },
    })
    return NextResponse.json({ success: true, message: 'Password updated successfully' })
  } catch {
    return NextResponse.json({ error: 'Failed to update password' }, { status: 500 })
  }
}
