import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const url = process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 40) + '...' : 'unset'
    const token = process.env.TURSO_AUTH_TOKEN ? process.env.TURSO_AUTH_TOKEN.substring(0, 30) + '...' : 'unset'
    let dbOk = false
    let dbError = ''
    try {
      const count = await db.user.count()
      dbOk = true
    } catch (e: unknown) {
      dbError = e instanceof Error ? e.message : String(e)
    }
    return NextResponse.json({ env: { DATABASE_URL: url, TURSO_AUTH_TOKEN: token }, dbOk, dbError })
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 })
  }
}
