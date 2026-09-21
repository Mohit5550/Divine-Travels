import webPush from 'web-push'
import { db } from '@/lib/db'

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY
const vapidEmail = process.env.VAPID_EMAIL || 'mailto:admin@divinetravels.in'

if (vapidPublicKey && vapidPrivateKey) {
  webPush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey)
}

export function getVapidPublicKey() {
  return vapidPublicKey || null
}

interface PushPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  url?: string
  tag?: string
}

export async function sendPushToUser(userId: string, payload: PushPayload) {
  if (!vapidPublicKey || !vapidPrivateKey) return

  try {
    const subscriptions = await db.pushSubscription.findMany({
      where: { userId },
    })

    if (subscriptions.length === 0) return

    const notificationPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || '/icon-192x192.png',
      badge: payload.badge || '/badge-72x72.png',
      url: payload.url || '/',
      tag: payload.tag || 'divine-travels',
    })

    const failedIds: string[] = []

    await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await webPush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth },
            },
            notificationPayload
          )
        } catch (err: any) {
          if (err.statusCode === 404 || err.statusCode === 410) {
            failedIds.push(sub.id)
          }
        }
      })
    )

    if (failedIds.length > 0) {
      await db.pushSubscription.deleteMany({
        where: { id: { in: failedIds } },
      })
    }
  } catch (err) {
    console.error('Push notification error:', err)
  }
}

export async function sendPushToAdmins(payload: PushPayload) {
  if (!vapidPublicKey || !vapidPrivateKey) return

  try {
    const admins = await db.user.findMany({
      where: { role: 'admin' },
      select: { id: true },
    })

    for (const admin of admins) {
      await sendPushToUser(admin.id, payload)
    }
  } catch (err) {
    console.error('Push to admins error:', err)
  }
}
