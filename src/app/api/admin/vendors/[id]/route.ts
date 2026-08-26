import { NextRequest, NextResponse } from 'next/server'
import { updateVendorPartner, deleteVendorPartner } from '@/lib/vendors-db'

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body = await req.json()
    const {
      status, commissionPct, adminNotes, b2bBasePrice, sellingPrice,
      businessName, ownerName, phone, email, city, listingTitle, location,
      description, bankUpi, gstNumber, panNumber,
    } = body

    const updated = await updateVendorPartner(id, {
      status,
      commissionPct: commissionPct !== undefined ? Number(commissionPct) : undefined,
      adminNotes,
      b2bBasePrice: b2bBasePrice !== undefined ? Number(b2bBasePrice) : undefined,
      sellingPrice: sellingPrice !== undefined ? Number(sellingPrice) : undefined,
      businessName,
      ownerName,
      phone,
      email,
      city,
      listingTitle,
      location,
      description,
      bankUpi,
      gstNumber,
      panNumber,
    })

    return NextResponse.json({
      success: true,
      vendor: updated,
      message: 'Vendor partner updated successfully',
    })
  } catch (error: any) {
    console.error('Admin update vendor error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to update vendor partner' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    await deleteVendorPartner(id)

    return NextResponse.json({
      success: true,
      message: 'Vendor partner deleted successfully',
    })
  } catch (error: any) {
    console.error('Admin delete vendor error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to delete vendor partner' },
      { status: 500 }
    )
  }
}
