import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/password'

const resetAttempts = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(key: string): boolean {
  const now = Date.now()
  const entry = resetAttempts.get(key)
  if (!entry || now - entry.resetAt > 60 * 60 * 1000) {
    resetAttempts.set(key, { count: 1, resetAt: now })
    return false
  }
  entry.count++
  return entry.count > 5
}

export async function POST(request: NextRequest) {
  try {
    const { token, code, password } = await request.json()

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    if (!token && !code) {
      return NextResponse.json({ error: 'Reset token or code is required' }, { status: 400 })
    }

    const rateKey = token || code
    if (isRateLimited(rateKey)) {
      return NextResponse.json({ error: 'Too many attempts. Please request a new reset link.' }, { status: 429 })
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
        password: await hashPassword(password),
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
