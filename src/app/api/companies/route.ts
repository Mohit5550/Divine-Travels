import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { publicJson } from '@/lib/cache'
import { cleanSlug } from '@/lib/resolve-slug'
import { getUserIdFromRequest } from '@/lib/get-user-id'

export async function GET() {
  try {
    const companies = await db.company.findMany({
      where: { active: true },
      include: {
        plans: { where: { active: true }, select: { packageSlug: true } },
        _count: { select: { plans: true } },
      },
      orderBy: { order: 'asc' },
    })
    return publicJson(companies)
  } catch (error) {
    console.error('Error fetching companies:', error)
    return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { name, slug, logo, photo, description, website } = body

    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 })
    }

    const existing = await db.company.findUnique({ where: { slug: cleanSlug(slug) } })
    if (existing) {
      return NextResponse.json({ error: 'A company with this slug already exists' }, { status: 409 })
    }

    const company = await db.company.create({
      data: { name, slug: cleanSlug(slug), logo, photo, description, website },
    })

    return NextResponse.json(company, { status: 201 })
  } catch (error) {
    console.error('Error creating company:', error)
    return NextResponse.json({ error: 'Failed to create company' }, { status: 500 })
  }
}
