import { NextRequest, NextResponse } from 'next/server'
import { updateCollaboration, deleteCollaboration } from '@/lib/collaborations-db'
import { db } from '@/lib/db'

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body = await req.json()
    const { status, assignedCoupon, commissionPct, selectedFreeActivity, expectedBudget, adminNotes } = body

    // If an assigned coupon code is provided, ensure private influencer coupon exists in db
    if (assignedCoupon && assignedCoupon.trim()) {
      const code = assignedCoupon.trim().toUpperCase()
      const existing = await (db as any).coupon.findUnique({ where: { code } }).catch(() => null)
      if (!existing) {
        await (db as any).coupon.create({
          data: {
            code,
            description: `Exclusive Creator Collab code for ${code}`,
            discountPct: 10,
            maxDiscount: 1000,
            minAmount: 999,
            maxUses: 500,
            usedCount: 0,
            active: true,
            type: 'influencer',
            isPrivate: true, // NEVER show in general user dashboard
            userEligibility: 'all',
            applicableCategory: 'all',
          },
        }).catch(() => null)
      } else {
        // Ensure existing coupon is marked private as an influencer code
        await (db as any).coupon.update({
          where: { code },
          data: {
            type: 'influencer',
            isPrivate: true,
          },
        }).catch(() => null)
      }
    }

    const updated = await updateCollaboration(id, {
      status,
      assignedCoupon: assignedCoupon !== undefined ? (assignedCoupon ? assignedCoupon.trim().toUpperCase() : null) : undefined,
      commissionPct: commissionPct !== undefined ? (Number(commissionPct) || 10) : undefined,
      selectedFreeActivity: selectedFreeActivity !== undefined ? selectedFreeActivity : undefined,
      expectedBudget: expectedBudget !== undefined ? expectedBudget : undefined,
      adminNotes,
    })

    return NextResponse.json({
      success: true,
      application: updated,
      message: 'Collaboration updated successfully',
    })
  } catch (error: any) {
    console.error('Admin update collaboration error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to update collaboration' },
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
    await deleteCollaboration(id)

    return NextResponse.json({
      success: true,
      message: 'Collaboration deleted successfully',
    })
  } catch (error: any) {
    console.error('Admin delete collaboration error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to delete collaboration' },
      { status: 500 }
    )
  }
}
