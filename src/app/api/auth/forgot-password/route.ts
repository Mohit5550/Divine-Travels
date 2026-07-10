import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import crypto from 'crypto'
import { sendPasswordResetEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const user = await db.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ message: 'If that email is registered, a reset link has been sent.' })
    }

    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetCode = crypto.randomInt(100000, 999999).toString()

    await db.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetCode,
        resetTokenExpiry: new Date(Date.now() + 60 * 60 * 1000),
      },
    })

    try {
      await sendPasswordResetEmail(email, resetCode, resetToken)
    } catch {
      return NextResponse.json({ error: 'Failed to send email. Please try again later.' }, { status: 500 })
    }

    return NextResponse.json({ message: 'If that email is registered, a reset link has been sent.' })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
