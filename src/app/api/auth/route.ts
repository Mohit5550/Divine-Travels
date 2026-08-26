import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, verifyPassword, isHashed } from '@/lib/password'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'divine-travels-secret-key-2026'
const JWT_EXPIRES_IN = '7d'

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

// Helper: generate JWT token
function generateToken(userId: string) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

// Helper: verify JWT token from request
function getUserFromToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return null

  const token = authHeader.substring(7)

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string }
    return db.user.findUnique({ where: { id: payload.userId } })
  } catch {
    return null
  }
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
  const user = await getUserFromToken(request)

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { password: _, ...userWithoutPassword } = user
  return NextResponse.json({ user: userWithoutPassword })
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