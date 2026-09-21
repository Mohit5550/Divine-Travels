import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserIdFromRequest } from '@/lib/get-user-id'

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const admin = await db.user.findUnique({ where: { id: userId } })
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const setting = await db.siteSetting.findUnique({
      where: { key: 'home_faqs' },
    })

    if (setting?.value) {
      try {
        const parsed = JSON.parse(setting.value)
        return NextResponse.json(parsed)
      } catch {}
    }

    return NextResponse.json(null)
  } catch (error) {
    console.error('Error fetching admin FAQs:', error)
    return NextResponse.json({ error: 'Failed to fetch FAQs' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const admin = await db.user.findUnique({ where: { id: userId } })
    if (!admin || admin.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid FAQs data format' }, { status: 400 })
    }

    const updated = await db.siteSetting.upsert({
      where: { key: 'home_faqs' },
      update: { value: JSON.stringify(body) },
      create: { key: 'home_faqs', value: JSON.stringify(body) },
    })

    return NextResponse.json({ success: true, data: body })
  } catch (error) {
    console.error('Error saving admin FAQs:', error)
    return NextResponse.json({ error: 'Failed to save FAQs' }, { status: 500 })
  }
}
