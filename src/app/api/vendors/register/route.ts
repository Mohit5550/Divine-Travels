import { NextRequest, NextResponse } from 'next/server'
import { createVendorPartner } from '@/lib/vendors-db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      businessName,
      ownerName,
      phone,
      email,
      password,
      city,
      businessCategory,
      gstNumber,
      panNumber,
      gstDocUrl,
      panDocUrl,
      agreementDocUrl,
      advancePercentage,
      experienceYears,
      bankUpi,
      listingTitle,
      location,
      b2bBasePrice,
      sellingPrice,
      capacity,
      amenities,
      photos,
      description,
      specifications,
    } = body

    if (!businessName || !ownerName || !phone || !email) {
      return NextResponse.json(
        { error: 'Please fill in all mandatory profile fields (Company Name, Owner Name, WhatsApp Phone, and Email).' },
        { status: 400 }
      )
    }

    const vendor = await createVendorPartner({
      businessName,
      ownerName,
      phone,
      email,
      password,
      city: city || 'Rishikesh',
      businessCategory: businessCategory || 'camping',
      gstNumber,
      panNumber,
      gstDocUrl,
      panDocUrl,
      agreementDocUrl,
      advancePercentage: Number(advancePercentage) || 20,
      experienceYears,
      bankUpi,
      listingTitle: listingTitle || null,
      location: location || null,
      b2bBasePrice: Number(b2bBasePrice) || 0,
      sellingPrice: Number(sellingPrice) || 0,
      capacity,
      amenities,
      photos,
      description,
      specifications,
    })

    return NextResponse.json({
      success: true,
      vendor,
      message: 'Company account created successfully! You can now manage your services and time slots.',
    }, { status: 201 })
  } catch (error: any) {
    console.error('Vendor registration error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to submit vendor registration' },
      { status: 500 }
    )
  }
}
