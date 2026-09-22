import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { publicJson } from '@/lib/cache'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const company = await db.company.findUnique({
      where: { slug },
      include: {
        plans: { where: { active: true }, orderBy: { order: 'asc' } },
      },
    })
    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    const plansWithPackages = await Promise.all(
      company.plans.map(async (plan) => {
        let pkg: {
          id: string
          name: string
          image: string
          price: number
          originalPrice: number | null
          slug: string
          location: string
        } | null = null
        if (plan.packageSlug) {
          pkg = await db.package.findUnique({
            where: { slug: plan.packageSlug },
            select: { id: true, name: true, image: true, price: true, originalPrice: true, slug: true, location: true },
          }).catch(() => null)
        }
        return { ...plan, package: pkg }
      })
    )

    return publicJson({ ...company, plans: plansWithPackages })
  } catch (error) {
    console.error('Error fetching company by slug:', error)
    return NextResponse.json({ error: 'Failed to fetch company' }, { status: 500 })
  }
}
