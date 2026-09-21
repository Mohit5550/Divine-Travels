import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, verifyPassword, isHashed } from '@/lib/password'
import { generateToken, getUserFromToken } from '@/lib/with-auth'

// Rate limiter for auth endpoints
const authAttempts = new Map()

const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes
const MAX_ATTEMPTS = 5 // max 5 attempts per window

function checkAuthRateLimit(email: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const attempts = authAttempts.get(email) || []

  // Remove attempts outside the window
  const recentAttempts = attempts.filter((time: number) => now - time < RATE_LIMIT_WINDOW)

  if (recentAttempts.length >= MAX_ATTEMPTS) {
    return { allowed: false, remaining: 0 }
  }

  // Add current attempt
  recentAttempts.push(now)
  authAttempts.set(email, recentAttempts)

  return { allowed: true, remaining: MAX_ATTEMPTS - recentAttempts.length - 1 }
}

// POST /api/auth - Login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    // Rate limiting
    const rateLimit = checkAuthRateLimit(email)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: `Too many attempts. Try again in ${Math.ceil((RATE_LIMIT_WINDOW - (Date.now() - authAttempts.get(email)?.at(0) || 0) / 1000 / 60))} minutes` },
        { status: 429 }
      )
    }

    const user = await db.user.findUnique({ where: { email } })

    if (!user || !(await verifyPassword(password, user.password))) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    if (!isHashed(user.password)) {
      await db.user.update({ where: { id: user.id }, data: { password: await hashPassword(password) } })
    }

    // Generate JWT token
    const token = generateToken(user.id)

    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({ user: userWithoutPassword, token, message: 'Login successful' })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/auth/me - Get current user (protected)
export async function GET(request: NextRequest) {
  const authUser = await getUserFromToken(request)

  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await db.user.findUnique({ where: { id: authUser.id }, select: { id: true, email: true, name: true, phone: true, avatar: true, role: true, createdAt: true } })
  return NextResponse.json({ user })
}

// PUT /api/auth - Register
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password } = body

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 })
    }

    // Rate limiting on registration
    const rateLimit = checkAuthRateLimit(email)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many attempts. Try again later' },
        { status: 429 }
      )
    }

    const existing = await db.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    const user = await db.user.create({
      data: { name, email, password: await hashPassword(password), phone: null, role: 'user' },
    })

    const token = generateToken(user.id)

    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({ user: userWithoutPassword, token, message: 'Registration successful' }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}