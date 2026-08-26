'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, CheckCheck, Loader2, Trash2, X, Sparkles, MessageCircle, ArrowRight } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface Notification {
  id: string
  title: string
  message: string
  type: string
  read: boolean
  link: string | null
  createdAt: string
}

function playNotificationChime() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const now = ctx.currentTime
    const osc1 = ctx.createOscillator()
    const osc2 = ctx.createOscillator()
    const gain = ctx.createGain()

    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(587.33, now) // D5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15) // A5

    osc2.type = 'triangle'
    osc2.frequency.setValueAtTime(880, now + 0.1)
    osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.3) // D6

    gain.gain.setValueAtTime(0.15, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4)

    osc1.connect(gain)
    osc2.connect(gain)
    gain.connect(ctx.destination)

    osc1.start(now)
    osc2.start(now + 0.1)
    osc1.stop(now + 0.25)
    osc2.stop(now + 0.4)
  } catch {}
}

export function AdminNotificationBell({ onSelectTab }: { onSelectTab?: (tab: string) => void }) {
  const { user } = useAppStore()
  const queryClient = useQueryClient()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const initialLoadDone = useRef(false)
  const seenIds = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!user?.id) return
    fetchNotifications()
    // Poll every 5 seconds for real-time live booking & inquiry alerts
    const interval = setInterval(fetchNotifications, 5000)
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
      if (!res.ok) return
      const data = await res.json()
      const list: Notification[] = data.notifications || []
      const count: number = data.unreadCount || 0

      // Check for brand new notifications to trigger live audio chime and toast popup
      if (initialLoadDone.current) {
        const brandNew = list.filter((n) => !seenIds.current.has(n.id))
        if (brandNew.length > 0) {
          playNotificationChime()
          brandNew.forEach((n) => {
            seenIds.current.add(n.id)
            toast.custom(
              (t) => (
                <div className="bg-slate-950 text-white p-4 rounded-2xl shadow-2xl border border-brand-orange/60 flex items-start gap-3 w-full max-w-sm ring-2 ring-brand-orange/20 animate-in fade-in slide-in-from-top-2">
                  <div className="w-10 h-10 rounded-xl bg-brand-orange flex items-center justify-center shrink-0 shadow-md">
                    <Bell className="w-5 h-5 text-white animate-bounce" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                        New Booking / Lead
                      </span>
                      <button
                        onClick={() => toast.dismiss(t)}
                        className="text-gray-400 hover:text-white p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="font-bold text-white text-sm mt-1 leading-snug">{n.title}</p>
                    <p className="text-gray-300 text-xs mt-1 line-clamp-2 leading-relaxed">{n.message}</p>
                    <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between">
                      <span className="text-[10px] text-gray-400">Just now</span>
                      <button
                        onClick={() => {
                          toast.dismiss(t)
                          if (onSelectTab) {
                            if (n.title.toLowerCase().includes('inquiry')) onSelectTab('inquiries')
                            else onSelectTab('all-bookings')
                          }
                        }}
                        className="text-xs font-semibold text-brand-orange hover:text-amber-300 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        View in Admin <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ),
              { duration: 8000, position: 'top-right' }
            )
          })

          // Invalidate admin statistics and inquiry tables for instant live updates
          queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
          queryClient.invalidateQueries({ queryKey: ['upcoming-bookings'] })
          queryClient.invalidateQueries({ queryKey: ['admin-inquiries'] })
          queryClient.invalidateQueries({ queryKey: ['admin-booking-counts'] })
          queryClient.invalidateQueries({ queryKey: ['admin-all-bookings'] })
        }
      } else {
        list.forEach((n) => seenIds.current.add(n.id))
        initialLoadDone.current = true
      }

      setNotifications(list)
      setUnreadCount(count)
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

  async function clearAll() {
    if (!user?.id) return
    if (!window.confirm('Clear all notifications? This cannot be undone.')) return
    try {
      await fetch('/api/notifications', {
        method: 'DELETE',
        headers: { 'x-user-id': user.id },
      })
      setNotifications([])
      setUnreadCount(0)
    } catch {}
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative p-2.5 rounded-xl bg-gray-50 hover:bg-brand-cream/80 text-gray-700 hover:text-brand-orange border border-gray-200/90 transition-all duration-200 cursor-pointer shadow-2xs group"
        title="Admin Notifications"
      >
        <Bell className="w-5 h-5 transition-transform group-hover:rotate-12 group-hover:text-brand-orange" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] px-1 bg-red-600 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center border-2 border-white shadow-md animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-84 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in-50 zoom-in-95">
          {/* Header */}
          <div className="p-4 bg-brand-dark text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-brand-orange" />
              <span className="font-bold text-sm">Live Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-brand-orange text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  disabled={loading}
                  className="text-white/70 hover:text-white px-2 py-1 rounded hover:bg-white/10 transition flex items-center gap-1 cursor-pointer"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Read all</span>
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-white/50 hover:text-red-400 p-1 rounded hover:bg-white/10 transition cursor-pointer"
                  title="Clear All"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-gray-100">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm font-medium">No new notifications</p>
                <p className="text-xs text-gray-400 mt-0.5">You're all caught up with bookings & inquiries!</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className="p-3.5 hover:bg-brand-cream/40 transition-colors flex items-start justify-between gap-3 group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-brand-orange shrink-0" />
                      <h4 className="font-bold text-brand-dark text-xs sm:text-sm leading-tight truncate">
                        {n.title}
                      </h4>
                    </div>
                    <p className="text-gray-600 text-xs mt-1 leading-relaxed pl-4">
                      {n.message}
                    </p>
                    <span className="text-[10px] text-gray-400 mt-1 block pl-4">
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <button
                    onClick={() => markRead(n.id)}
                    className="text-gray-300 hover:text-emerald-600 p-1 rounded transition opacity-0 group-hover:opacity-100 cursor-pointer"
                    title="Mark as read"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
