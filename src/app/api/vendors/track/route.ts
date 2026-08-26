import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getVendorItems } from '@/lib/vendors-db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('query')?.trim()

    if (!query) {
      return NextResponse.json(
        { error: 'Please enter your registered Phone number, Email, or Business Name' },
        { status: 400 }
      )
    }

    const cleanPhone = query.replace(/[^0-9]/g, '')

    const rows: any[] = await (db as any).$queryRawUnsafe(`
      SELECT * FROM "VendorPartner"
      WHERE "id" = ?
         OR "email" = ?
         OR "phone" LIKE ?
         OR LOWER("businessName") LIKE ?
      ORDER BY "createdAt" DESC
      LIMIT 1
    `, query, query.toLowerCase(), `%${cleanPhone || query}%`, `%${query.toLowerCase()}%`).catch(() => [])

    const vendor = rows[0]

    if (!vendor) {
      return NextResponse.json(
        { error: 'No partner account found with these details.' },
        { status: 404 }
      )
    }

    // Safely parse JSON arrays/objects
    let amenities = []
    let photos = []
    let specifications = {}

    try { amenities = JSON.parse(vendor.amenities || '[]') } catch {}
    try { photos = JSON.parse(vendor.photos || '[]') } catch {}
    try { specifications = JSON.parse(vendor.specifications || '{}') } catch {}

    // Fetch all linked inventory items
    const items = await getVendorItems(vendor.id).catch(() => [])

    return NextResponse.json({
      success: true,
      vendor: {
        ...vendor,
        amenities,
        photos,
        specifications,
        items,
      },
    })
  } catch (error: any) {
    console.error('Vendor track error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to track vendor status' },
      { status: 500 }
    )
  }
}
