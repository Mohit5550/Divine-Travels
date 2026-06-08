import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

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
    return NextResponse.json(company)
  } catch (error) {
    console.error('Error fetching company by slug:', error)
    return NextResponse.json({ error: 'Failed to fetch company' }, { status: 500 })
  }
}
