import { NextResponse, type NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'
import { db } from '@/lib/db'

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is not set')
}

interface AuthUser {
  id: string
  email: string
  name: string
  role: string
}

// Helper: extract user ID from JWT token only (x-user-id fallback removed for security)
export async function getUserFromToken(request: NextRequest): Promise<AuthUser | null> {
  let userId: string | null = null

  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    try {
      if (!JWT_SECRET) return null
      const payload = jwt.verify(token, JWT_SECRET) as { userId: string }
      userId = payload.userId
    } catch {
      return null
    }
  }

  if (!userId) return null

  const user = await db.user.findUnique({ where: { id: userId }, select: { id: true, email: true, name: true, role: true } })
  return user || null
}

// Helper: generate JWT token
export function generateToken(userId: string) {
  if (!JWT_SECRET) throw new Error('JWT_SECRET not configured')
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