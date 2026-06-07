import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const featured = searchParams.get('featured')
    const category = searchParams.get('category')
    const limit = searchParams.get('limit')

    const where: Record<string, unknown> = { active: true }
    if (featured === 'true') where.featured = true
    if (category) where.category = category

    const images = await db.galleryImage.findMany({
      where,
      orderBy: { order: 'asc' },
      take: limit ? parseInt(limit, 10) : undefined,
    })

    return NextResponse.json(images)
  } catch (error) {
    console.error('Gallery fetch error:', error)
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: 'Internal server error', debug: message }, { status: 500 })
  }
}
