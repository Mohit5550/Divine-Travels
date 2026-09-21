import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserIdFromRequest } from '@/lib/get-user-id'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = getUserIdFromRequest(request)
    if (!userId) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

    const { id } = await params
    const destination = await db.tourDestination.findUnique({ where: { id } })
    if (!destination) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({
      ...destination,
      config: JSON.parse(destination.config),
      programs: JSON.parse(destination.programs),
      dayConfigs: JSON.parse(destination.dayConfigs),
    })
  } catch (error) {
    console.error('Admin tour destination get error:', error)
    return NextResponse.json({ error: 'Failed to fetch tour destination' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = getUserIdFromRequest(request)
    if (!userId) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

    const { id } = await params
    const body = await request.json()
    const { name, type, config, programs, dayConfigs, active } = body

    const data: Record<string, string | boolean> = {}
    if (name !== undefined) data.name = name
    if (type !== undefined) data.type = type
    if (config !== undefined) data.config = JSON.stringify(config)
    if (programs !== undefined) data.programs = JSON.stringify(programs)
    if (dayConfigs !== undefined) data.dayConfigs = JSON.stringify(dayConfigs)
    if (active !== undefined) data.active = active

    const destination = await db.tourDestination.update({ where: { id }, data })

    return NextResponse.json({
      ...destination,
      config: JSON.parse(destination.config),
      programs: JSON.parse(destination.programs),
      dayConfigs: JSON.parse(destination.dayConfigs),
    })
  } catch (error) {
    console.error('Admin tour destination update error:', error)
    return NextResponse.json({ error: 'Failed to update tour destination' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = getUserIdFromRequest(request)
    if (!userId) return NextResponse.json({ error: 'Authentication required' }, { status: 401 })

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

    const { id } = await params
    await db.tourDestination.update({ where: { id }, data: { active: false } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin tour destination delete error:', error)
    return NextResponse.json({ error: 'Failed to delete tour destination' }, { status: 500 })
  }
}
