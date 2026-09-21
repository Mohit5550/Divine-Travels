import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUserFromToken } from '@/lib/with-auth'

export async function POST(req: NextRequest) {
  const user = await getUserFromToken(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { subscription } = await req.json()
    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 })
    }

    const userAgent = req.headers.get('user-agent') || ''

    await db.pushSubscription.upsert({
      where: {
        userId_endpoint: {
          userId: user.id,
          endpoint: subscription.endpoint,
        },
      },
      update: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        userAgent,
      },
      create: {
        userId: user.id,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        userAgent,
      },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Push subscribe error:', err)
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const user = await getUserFromToken(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { endpoint } = await req.json()
    if (endpoint) {
      await db.pushSubscription.deleteMany({
        where: { userId: user.id, endpoint },
      })
    } else {
      await db.pushSubscription.deleteMany({
        where: { userId: user.id },
      })
    }
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Push unsubscribe error:', err)
    return NextResponse.json({ error: 'Failed to unsubscribe' }, { status: 500 })
  }
}
