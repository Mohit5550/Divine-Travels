import { db } from '@/lib/db'

export async function notifyAdmin(title: string, message: string, type = 'info', link?: string) {
  try {
    const admin = await db.user.findFirst({ where: { role: 'admin' } })
    if (!admin) return
    await db.notification.create({
      data: { userId: admin.id, title, message, type, link: link || null },
    })
  } catch {
    // silently fail - notification is non-critical
  }
}
