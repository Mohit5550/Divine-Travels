import { db } from '@/lib/db'
import { sendPushToUser, sendPushToAdmins } from '@/lib/push'

export async function notifyAdmin(title: string, message: string, type = 'info', link?: string) {
  try {
    const admins = await db.user.findMany({ where: { role: 'admin' }, select: { id: true } })
    if (!admins || admins.length === 0) return
    await db.notification.createMany({
      data: admins.map((a) => ({
        userId: a.id,
        title,
        message,
        type,
        link: link || null,
      })),
    })
    sendPushToAdmins({ title, body: message, url: link || '/admin-dashboard' }).catch(() => {})
  } catch (error) {
    console.error('Error notifying admins:', error)
  }
}

export async function notifyUser(userId: string, title: string, message: string, type = 'info', link?: string) {
  try {
    await db.notification.create({
      data: { userId, title, message, type, link: link || null },
    })
    sendPushToUser(userId, { title, body: message, url: link || '/user-dashboard' }).catch(() => {})
  } catch {
    // silently fail
  }
}
