import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { publicJson } from '@/lib/cache'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const blog = await db.blog.findUnique({
      where: { slug },
      include: { category: { select: { id: true, name: true, slug: true } } },
    })
    if (!blog || !blog.published) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 })
    }
    return publicJson(blog)
  } catch (error) {
    console.error('Error fetching blog:', error)
    return NextResponse.json({ error: 'Failed to fetch blog' }, { status: 500 })
  }
}
