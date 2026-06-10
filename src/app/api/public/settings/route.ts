import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const all = await db.siteSetting.findMany()
    const settings: Record<string, string> = {}
    for (const s of all) {
      settings[s.key] = s.value
    }
    return NextResponse.json(settings)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}
