import { NextResponse } from 'next/server'

// Cached JSON for purely-public GET routes (Vercel edge, 60s + SWR 120s).
// Never use for user-specific, admin, or mutation responses.
export function publicJson(data: unknown, seconds = 60) {
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': `public, s-maxage=${seconds}, stale-while-revalidate=120`,
    },
  })
}
