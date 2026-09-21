import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET

export function getUserIdFromRequest(request: Request): string | null {
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7)
    try {
      if (!JWT_SECRET) return null
      const payload = jwt.verify(token, JWT_SECRET) as { userId: string }
      return payload.userId || null
    } catch {
      return null
    }
  }
  // Fallback: check x-user-id header (for backwards compatibility during migration)
  return request.headers.get('x-user-id')
}
