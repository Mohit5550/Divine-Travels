import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')
    const where: Record<string, unknown> = { active: true }
    if (companyId) where.companyId = companyId

    const plans = await db.companyPlan.findMany({
      where,
      include: { company: { select: { name: true, slug: true } } },
      orderBy: { order: 'asc' },
    })
    return NextResponse.json(plans)
  } catch (error) {
    console.error('Error fetching company plans:', error)
    return NextResponse.json({ error: 'Failed to fetch plans' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { companyId, name, description, price, image, category, duration, highlights, packageSlug } = body

    if (!companyId || !name) {
      return NextResponse.json({ error: 'Company ID and name are required' }, { status: 400 })
    }

    const plan = await db.companyPlan.create({
      data: {
        companyId,
        name,
        description,
        price: price ? Number(price) : null,
        image,
        category,
        duration,
        highlights: highlights ? JSON.stringify(highlights) : null,
        packageSlug: packageSlug || null,
      },
    })

    return NextResponse.json(plan, { status: 201 })
  } catch (error) {
    console.error('Error creating plan:', error)
    return NextResponse.json({ error: 'Failed to create plan' }, { status: 500 })
  }
}
