'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, CheckCheck, Loader2 } from 'lucide-react'
import { useAppStore } from '@/lib/store'

interface Notification {
  id: string
  title: string
  message: string
  type: string
  read: boolean
  link: string | null
  createdAt: string
}

export function AdminNotificationBell() {
  const { user } = useAppStore()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user?.id) return
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 15000)
    return () => clearInterval(interval)
  }, [user?.id])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function fetchNotifications() {
    if (!user?.id) return
    try {
      const res = await fetch('/api/notifications?unread=true', {
        headers: { 'x-user-id': user.id },
      })
      const data = await res.json()
      setNotifications(data.notifications || [])
      setUnreadCount(data.unreadCount || 0)
    } catch {}
  }

  async function markRead(id: string) {
    if (!user?.id) return
    try {
      await fetch(`/api/notifications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user.id },
        body: JSON.stringify({ read: true }),
      })
      setNotifications((prev) => prev.filter((n) => n.id !== id))
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch {}
  }

  async function markAllRead() {
    if (!user?.id) return
    setLoading(true)
    try {
      await Promise.all(
        notifications.map((n) =>
          fetch(`/api/notifications/${n.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'x-user-id': user.id },
            body: JSON.stringify({ read: true }),
          })
        )
      )
      setNotifications([])
      setUnreadCount(0)
    } catch {}
    setLoading(false)
  }

  const typeIcon = (type: string) => {
    switch (type) {
      case 'booking': return '📋'
      case 'review': return '⭐'
      case 'inquiry': return '✉️'
      default: return '🔔'
    }
  }

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    return `${days}d ago`
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
      >
        <Bell className="w-5 h-5 text-brand-dark" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] min-h-[18px] px-1 leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-[70vh] flex flex-col">
          <div className="flex items-center justify-between p-3 border-b border-gray-100">
            <h3 className="font-semibold text-sm text-brand-dark">Notifications</h3>
            {notifications.length > 0 && (
              <button
                onClick={markAllRead}
                disabled={loading}
                className="flex items-center gap-1 text-[11px] text-brand-orange hover:underline"
              >
                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCheck className="w-3 h-3" />}
                Mark all read
              </button>
            )}
          </div>

          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">No new notifications</p>
            ) : (
              notifications.slice(0, 20).map((n) => (
                <div
                  key={n.id}
                  className="flex items-start gap-3 p-3 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-50 last:border-0"
                  onClick={() => markRead(n.id)}
                >
                  <span className="text-lg mt-0.5">{typeIcon(n.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-brand-dark truncate">{n.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{n.message}</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-brand-orange mt-1.5 shrink-0" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
