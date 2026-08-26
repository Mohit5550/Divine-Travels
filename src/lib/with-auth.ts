import { NextResponse, type NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'
import { db } from '@/lib/db'

const JWT_SECRET = process.env.JWT_SECRET || 'divine-travels-secret-key-2026'

interface AuthUser {
  id: string
  email: string
  name: string
  role: string
}

// Helper: extract user ID from JWT or x-user-id header, then fetch full user from DB.
export async function getUserFromToken(request: NextRequest): Promise<AuthUser | null> {
  let userId: string | null = null

  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    try {
      const payload = jwt.verify(token, JWT_SECRET) as { userId: string }
      userId = payload.userId
    } catch {
      // fall through to x-user-id fallback below
    }
  }

  if (!userId) {
    userId = request.headers.get('x-user-id')
  }

  if (!userId) return null

  const user = await db.user.findUnique({ where: { id: userId }, select: { id: true, email: true, name: true, role: true } })
  return user || null
}

// Helper: generate JWT token
function generateToken(userId: string) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' })
}

// Middleware: require authenticated user
export function withAuth(handler: (request: NextRequest, user: AuthUser) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized - No token provided' }, { status: 401 })
    }
    return handler(request, user)
  }
}

// Middleware: optional authentication (user may or may not be logged in)
export function withOptionalAuth(handler: (request: NextRequest, user: AuthUser | null) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    const user = await getUserFromToken(request)
    return handler(request, user)
  }
}