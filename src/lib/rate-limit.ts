// Rate limiter for auth endpoints
// Simple in-memory store; for production use Redis
const authAttempts = new Map()

const RATE_LIMIT_WINDOW = 15 * 60 * 1000 // 15 minutes
const MAX_ATTEMPTS = 5 // max 5 attempts per window

export function checkAuthRateLimit(email: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const attempts = authAttempts.get(email) || []

  // Remove attempts outside the window
  const recentAttempts = attempts.filter((time: number) => now - time < RATE_LIMIT_WINDOW)

  if (recentAttempts.length >= MAX_ATTEMPTS) {
    return { allowed: false, remaining: MAX_ATTEMPTS - recentAttempts.length }
  }

  // Add current attempt
  recentAttempts.push(now)
  authAttempts.set(email, recentAttempts)

  return { allowed: true, remaining: MAX_ATTEMPTS - recentAttempts.length - 1 }
}