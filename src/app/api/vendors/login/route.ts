import { NextRequest, NextResponse } from 'next/server'
import { authenticateVendor } from '@/lib/vendors-db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { loginId, password } = body

    if (!loginId) {
      return NextResponse.json(
        { error: 'Please enter your registered Phone/Email' },
        { status: 400 }
      )
    }

    const vendor = await authenticateVendor(loginId, password)

    if (!vendor) {
      return NextResponse.json(
        { error: 'Invalid Phone/Email or Password. Please check your credentials.' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      vendor,
      message: 'Login successful!',
    })
  } catch (error: any) {
    console.error('Vendor login error:', error)
    return NextResponse.json(
      { error: error?.message || 'Login failed' },
      { status: 500 }
    )
  }
}
