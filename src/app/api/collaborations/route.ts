import { NextRequest, NextResponse } from 'next/server'
import { createCollaboration } from '@/lib/collaborations-db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const creatorName = body.name?.trim() || body.fullName?.trim() || ''
    const creatorEmail = body.email?.trim()?.toLowerCase() || ''
    const creatorPhone = body.phone?.trim() || ''
    const creatorInstagram = body.instagram?.trim() || body.instagramUrl?.trim() || null
    const creatorYoutube = body.youtube?.trim() || body.youtubeUrl?.trim() || null
    const creatorFollowers = body.followersCount || body.followerCount || '10K - 50K'
    const creatorNiche = body.niche || body.contentType || 'Adventure & Ganga Rafting'
    const creatorCollabType = body.collaborationType || body.collabType || 'barter'
    const creatorFreeActivity = body.selectedFreeActivity || body.primaryOfferWish || null

    if (!creatorName || !creatorEmail || !creatorPhone) {
      return NextResponse.json(
        { error: 'Name, Email, and Phone number are required' },
        { status: 400 }
      )
    }

    const newCollab = await createCollaboration({
      name: creatorName,
      email: creatorEmail,
      phone: creatorPhone,
      instagram: creatorInstagram,
      youtube: creatorYoutube,
      followersCount: creatorFollowers,
      niche: creatorNiche,
      collaborationType: creatorCollabType,
      selectedFreeActivity: creatorFreeActivity,
      expectedBudget: body.expectedBudget?.trim() || null,
      proposedCoupon: body.proposedCoupon?.trim() || null,
      deliverables: body.deliverables?.trim() || null,
      travelDates: body.travelDates?.trim() || body.preferredDates?.trim() || null,
      message: body.message?.trim() || body.whyCollaborate?.trim() || null,
    })

    return NextResponse.json({
      success: true,
      id: newCollab.id,
      message: 'Your creator collaboration application has been submitted successfully!',
    })
  } catch (error: any) {
    console.error('Creator application submission error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to submit creator application' },
      { status: 500 }
    )
  }
}
