import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { publicJson } from '@/lib/cache'

export async function GET() {
  try {
    const categories = await db.blogCategory.findMany({
      include: { _count: { select: { blogs: { where: { published: true } } } } },
      orderBy: { name: 'asc' },
    })
    return publicJson(categories)
  } catch (error) {
    console.error('Error fetching blog categories:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}
