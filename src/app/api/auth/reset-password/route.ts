import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { token, code, password } = await request.json()

    if (!password || password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    if (!token && !code) {
      return NextResponse.json({ error: 'Reset token or code is required' }, { status: 400 })
    }

    const user = await db.user.findFirst({
      where: {
        OR: [
          token ? { resetToken: token } : {},
          code ? { resetCode: code } : {},
        ].filter((c) => Object.keys(c).length > 0),
        resetTokenExpiry: { gt: new Date() },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired reset code. Please request a new one.' }, { status: 400 })
    }

    await db.user.update({
      where: { id: user.id },
      data: {
        password,
        resetToken: null,
        resetCode: null,
        resetTokenExpiry: null,
      },
    })

    return NextResponse.json({ message: 'Password reset successful. You can now login with your new password.' })
  } catch {
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 })
  }
}
