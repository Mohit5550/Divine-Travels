import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Public, non-personalized GET endpoints (must match publicJson() usage).
// Everything else under /api/ is forced no-store (user data, admin, mutations).
const PUBLIC_GETS: RegExp[] = [
  /^\/api\/packages(\/|$)/,
  /^\/api\/destinations(\/|$)/,
  /^\/api\/public\//,
  /^\/api\/blogs(\/|$)/,
  /^\/api\/gallery(\/|$)/,
  /^\/api\/faqs(\/|$)/,
  /^\/api\/reviews(\/|$)/,
  /^\/api\/coupons\/active/,
  /^\/api\/companies(\/|$)/,
  /^\/api\/hero-notices(\/|$)/,
  /^\/api\/tour-destinations(\/|$)/,
]

export function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const { pathname } = request.nextUrl
  if (request.method === 'GET' && PUBLIC_GETS.some((rx) => rx.test(pathname))) {
    res.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120')
  } else {
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
  }
  return res
}

export const config = {
  matcher: '/api/:path*',
}
