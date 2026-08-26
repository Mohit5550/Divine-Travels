import { NextRequest, NextResponse } from 'next/server'
import { getPublicVendorItems, getPublicVendorItemById } from '@/lib/vendors-db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category') || 'all'
    const items = await getPublicVendorItems(category === 'all' ? undefined : category)
    return NextResponse.json({ success: true, items })
  } catch (error: any) {
    console.error('Public vendor items error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to load experiences' },
      { status: 500 }
    )
  }
}
