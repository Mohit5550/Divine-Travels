import { NextRequest, NextResponse } from 'next/server'
import { getVendorPartners, getVendorStats } from '@/lib/vendors-db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || undefined
    const category = searchParams.get('category') || undefined
    const search = searchParams.get('search') || undefined

    const [vendors, stats] = await Promise.all([
      getVendorPartners({ status, category, search }),
      getVendorStats(),
    ])

    // Parse JSON fields for admin UI
    const formatted = vendors.map((v) => {
      let amenities = []
      let photos = []
      let specifications = {}

      try { amenities = JSON.parse(v.amenities || '[]') } catch {}
      try { photos = JSON.parse(v.photos || '[]') } catch {}
      try { specifications = JSON.parse(v.specifications || '{}') } catch {}

      return {
        ...v,
        amenities,
        photos,
        specifications,
      }
    })

    return NextResponse.json({
      success: true,
      vendors: formatted,
      stats,
    })
  } catch (error: any) {
    console.error('Admin fetch vendors error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch vendor applications' },
      { status: 500 }
    )
  }
}
