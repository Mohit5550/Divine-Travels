import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const notice = await db.heroNotice.update({
      where: { id },
      data: {
        image: body.image,
        heading: body.heading,
        description: body.description,
        order: body.order,
        active: body.active,
      },
    })
    return NextResponse.json(notice)
  } catch (error) {
    console.error('Error updating hero notice:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await db.heroNotice.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting hero notice:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
