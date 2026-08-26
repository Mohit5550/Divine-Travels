import { NextRequest, NextResponse } from 'next/server'
import { createVendorItem, getVendorItems, updateVendorItem, deleteVendorItem } from '@/lib/vendors-db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const vendorId = searchParams.get('vendorId')

    if (!vendorId) {
      return NextResponse.json({ error: 'vendorId is required' }, { status: 400 })
    }

    const items = await getVendorItems(vendorId)
    return NextResponse.json({ success: true, items })
  } catch (error: any) {
    console.error('Error fetching vendor items:', error)
    return NextResponse.json({ error: error?.message || 'Failed to fetch items' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      vendorId,
      category,
      title,
      mrpPrice,
      sellingPrice,
      b2bBasePrice,
      advancePercentage,
      capacity,
      highlights,
      inclusions,
      exclusions,
      eligibility,
      timeSlots,
      pickupLocation,
      spotLocation,
      amenities,
      specifications,
      photos,
      description,
      status,
    } = body

    if (!vendorId || !title || !category) {
      return NextResponse.json(
        { error: 'vendorId, title, and category are required' },
        { status: 400 }
      )
    }

    const item = await createVendorItem({
      vendorId,
      category,
      title,
      mrpPrice: Number(mrpPrice) || 0,
      sellingPrice: Number(sellingPrice) || 0,
      b2bBasePrice: Number(b2bBasePrice) || 0,
      advancePercentage: Number(advancePercentage) || 20,
      capacity,
      highlights,
      inclusions,
      exclusions,
      eligibility,
      timeSlots,
      pickupLocation,
      spotLocation,
      amenities,
      specifications,
      photos,
      description,
      status: status || 'active',
    })

    return NextResponse.json({
      success: true,
      item,
      message: 'New listing item created successfully with pricing, inclusions and time slots!',
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating vendor item:', error)
    return NextResponse.json({ error: error?.message || 'Failed to add item' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      id,
      title,
      category,
      mrpPrice,
      sellingPrice,
      b2bBasePrice,
      advancePercentage,
      capacity,
      highlights,
      inclusions,
      exclusions,
      eligibility,
      timeSlots,
      pickupLocation,
      spotLocation,
      amenities,
      specifications,
      photos,
      description,
      status,
    } = body

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const updated = await updateVendorItem(id, {
      title,
      category,
      mrpPrice: mrpPrice !== undefined ? Number(mrpPrice) : undefined,
      sellingPrice: sellingPrice !== undefined ? Number(sellingPrice) : undefined,
      b2bBasePrice: b2bBasePrice !== undefined ? Number(b2bBasePrice) : undefined,
      advancePercentage: advancePercentage !== undefined ? Number(advancePercentage) : undefined,
      capacity,
      highlights,
      inclusions,
      exclusions,
      eligibility,
      timeSlots,
      pickupLocation,
      spotLocation,
      amenities,
      specifications,
      photos,
      description,
      status,
    })

    return NextResponse.json({
      success: true,
      item: updated,
      message: 'Listing updated successfully!',
    })
  } catch (error: any) {
    console.error('Error updating vendor item:', error)
    return NextResponse.json({ error: error?.message || 'Failed to update item' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    await deleteVendorItem(id)
    return NextResponse.json({
      success: true,
      message: 'Item removed successfully!',
    })
  } catch (error: any) {
    console.error('Error deleting vendor item:', error)
    return NextResponse.json({ error: error?.message || 'Failed to delete item' }, { status: 500 })
  }
}
