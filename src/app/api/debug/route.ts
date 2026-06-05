import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const url = process.env.DATABASE_URL ? 'set' : 'unset'
    const token = process.env.TURSO_AUTH_TOKEN ? 'set' : 'unset'
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
