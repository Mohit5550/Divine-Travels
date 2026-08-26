import { NextRequest, NextResponse } from 'next/server'
import { getPublicVendorItemById } from '@/lib/vendors-db'

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const item = await getPublicVendorItemById(id)
    if (!item) {
      return NextResponse.json(
        { error: 'This experience is not available or is pending approval.' },
        { status: 404 }
      )
    }
    return NextResponse.json({ success: true, item })
  } catch (error: any) {
    console.error('Public vendor item error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to load experience' },
      { status: 500 }
    )
  }
}
