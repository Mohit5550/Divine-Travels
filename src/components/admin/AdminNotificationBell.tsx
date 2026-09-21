'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Bell, CheckCheck, Trash2, X, ArrowRight,
  Bike, Waves, Mountain, Package, Car, Map,
  Landmark, Globe, Bed, Tent, CalendarCheck,
  MessageCircle, Star, CreditCard, Send, AlertCircle,
} from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getAuthHeaders } from '@/lib/auth-client'

interface Notification {
  id: string
  title: string
  message: string
  type: string
  read: boolean
  link: string | null
  createdAt: string
}

const CATEGORY_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: any }> = {
  'bike-rental':    { label: 'Bike Rental',    color: 'text-orange-400', bg: 'bg-orange-600',  border: 'border-orange-500/40', icon: Bike },
  'rafting':        { label: 'Rafting',        color: 'text-blue-400',   bg: 'bg-blue-500',   border: 'border-blue-500/40',   icon: Waves },
  'trekking':       { label: 'Trekking',       color: 'text-emerald-400',bg: 'bg-emerald-500',border: 'border-emerald-500/40',icon: Mountain },
  'adventure':      { label: 'Adventure',      color: 'text-red-400',    bg: 'bg-red-500',    border: 'border-red-500/40',    icon: Package },
  'bkg-taxi':       { label: 'Taxi',           color: 'text-amber-400',  bg: 'bg-amber-500',  border: 'border-amber-500/40',  icon: Car },
  'taxi':           { label: 'Taxi',           color: 'text-amber-400',  bg: 'bg-amber-500',  border: 'border-amber-500/40',  icon: Car },
  'domestic-tours': { label: 'Domestic Tours', color: 'text-teal-400',   bg: 'bg-teal-500',   border: 'border-teal-500/40',   icon: Map },
  'spiritual-tours':{ label: 'Spiritual Tours',color: 'text-yellow-400', bg: 'bg-amber-600',  border: 'border-amber-600/40',  icon: Landmark },
  'international-tours':{ label: 'International', color: 'text-indigo-400', bg: 'bg-indigo-500', border: 'border-indigo-500/40', icon: Globe },
  'stay-hotel':     { label: 'Hotel',          color: 'text-amber-400',  bg: 'bg-amber-600',  border: 'border-amber-600/40',  icon: Bed },
  'stay-camping':   { label: 'Camping',        color: 'text-emerald-400',bg: 'bg-emerald-600',border: 'border-emerald-600/40',icon: Tent },
  'bkg-tour':       { label: 'Day Tours',      color: 'text-brand-orange',bg: 'bg-brand-orange',border: 'border-brand-orange/40',icon: CalendarCheck },
  'tour':           { label: 'Day Tours',      color: 'text-brand-orange',bg: 'bg-brand-orange',border: 'border-brand-orange/40',icon: CalendarCheck },
  'bookings':       { label: 'Destinations',   color: 'text-sky-400',    bg: 'bg-sky-500',    border: 'border-sky-500/40',    icon: Map },
  'inquiry':        { label: 'Inquiry',        color: 'text-purple-400', bg: 'bg-purple-500', border: 'border-purple-500/40', icon: MessageCircle },
  'review':         { label: 'Review',         color: 'text-yellow-400', bg: 'bg-yellow-500', border: 'border-yellow-500/40', icon: Star },
  'payment':        { label: 'Payment',        color: 'text-green-400',  bg: 'bg-green-500',  border: 'border-green-500/40',  icon: CreditCard },
  'offer':          { label: 'Counter Offer',  color: 'text-cyan-400',   bg: 'bg-cyan-500',   border: 'border-cyan-500/40',   icon: Send },
}

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: any }> = {
  'booking': { label: 'New Booking',   color: 'text-emerald-400', bg: 'bg-emerald-600', border: 'border-emerald-500/40', icon: CalendarCheck },
  'inquiry': { label: 'New Inquiry',   color: 'text-purple-400',  bg: 'bg-purple-500',  border: 'border-purple-500/40',  icon: MessageCircle },
  'review':  { label: 'New Review',    color: 'text-yellow-400',  bg: 'bg-yellow-500',  border: 'border-yellow-500/40',  icon: Star },
  'payment': { label: 'Payment',       color: 'text-green-400',   bg: 'bg-green-500',   border: 'border-green-500/40',   icon: CreditCard },
  'offer':   { label: 'Counter Offer', color: 'text-cyan-400',    bg: 'bg-cyan-500',    border: 'border-cyan-500/40',    icon: Send },
}

function parseTabFromLink(link: string | null): string | null {
  if (!link) return null
  try {
    const url = new URL(link, window.location.origin)
    return url.searchParams.get('tab')
  } catch {
    const match = link.match(/[?&]tab=([^&]+)/)
    return match ? match[1] : null
  }
}

function getNotificationConfig(n: Notification) {
  const tab = parseTabFromLink(n.link)
  if (tab && CATEGORY_CONFIG[tab]) return CATEGORY_CONFIG[tab]
  if (n.type && TYPE_CONFIG[n.type]) return TYPE_CONFIG[n.type]
  return { label: 'Notification', color: 'text-brand-orange', bg: 'bg-brand-orange', border: 'border-brand-orange/40', icon: Bell }
}

function resolveTabFromNotification(n: Notification): string {
  const tab = parseTabFromLink(n.link)
  if (tab) {
    if (tab.startsWith('bkg-')) return tab
    if (CATEGORY_CONFIG[tab]) {
      if (tab === 'bkg-taxi' || tab === 'taxi') return 'bkg-taxi'
      if (tab === 'tour' || tab === 'bkg-tour') return 'bkg-tour'
      if (tab === 'bookings') return 'all-bookings'
      return 'bkg-' + tab
    }
  }
  if (n.type === 'inquiry') return 'inquiries'
  if (n.type === 'review') return 'reviews'
  if (n.type === 'payment') return 'all-bookings'
  if (n.type === 'offer') return 'all-bookings'
  if (n.title.toLowerCase().includes('inquiry')) return 'inquiries'
  return 'all-bookings'
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
    osc1.frequency.setValueAtTime(587.33, now)
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15)

    osc2.type = 'triangle'
    osc2.frequency.setValueAtTime(880, now + 0.1)
    osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.3)

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
        headers: { ...getAuthHeaders() },
      })
      if (!res.ok) return
      const data = await res.json()
      const list: Notification[] = data.notifications || []
      const count: number = data.unreadCount || 0

      if (initialLoadDone.current) {
        const brandNew = list.filter((n) => !seenIds.current.has(n.id))
        if (brandNew.length > 0) {
          playNotificationChime()
          brandNew.forEach((n) => {
            seenIds.current.add(n.id)
            const config = getNotificationConfig(n)
            const CategoryIcon = config.icon
            const targetTab = resolveTabFromNotification(n)

            toast.custom(
              (t) => (
                <div className={`bg-slate-950 text-white p-4 rounded-2xl shadow-2xl ${config.border} flex items-start gap-3 w-full max-w-sm ring-2 ring-white/10 animate-in fade-in slide-in-from-top-2`}>
                  <div className={`w-11 h-11 rounded-xl ${config.bg} flex items-center justify-center shrink-0 shadow-lg`}>
                    <CategoryIcon className="w-5 h-5 text-white animate-bounce" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${config.color} bg-white/5 px-2 py-0.5 rounded-full border ${config.border}`}>
                        {config.label}
                      </span>
                      <button onClick={() => toast.dismiss(t)} className="text-gray-400 hover:text-white p-1 cursor-pointer">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="font-bold text-white text-sm mt-1.5 leading-snug">{n.title}</p>
                    <p className="text-gray-300 text-xs mt-1 line-clamp-2 leading-relaxed">{n.message}</p>
                    <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between">
                      <span className="text-[10px] text-gray-400 flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${config.bg} animate-pulse`} />
                        Just now
                      </span>
                      <button
                        onClick={() => {
                          toast.dismiss(t)
                          if (onSelectTab && targetTab) onSelectTab(targetTab)
                        }}
                        className={`text-xs font-semibold ${config.color} hover:text-white flex items-center gap-1 transition-colors cursor-pointer`}
                      >
                        View {config.label} <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ),
              { duration: 10000, position: 'top-right' }
            )
          })

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
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders(), },
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
            headers: { 'Content-Type': 'application/json', ...getAuthHeaders(), },
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
        headers: { ...getAuthHeaders() },
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

          <div className="max-h-[380px] overflow-y-auto divide-y divide-gray-100">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm font-medium">No new notifications</p>
                <p className="text-xs text-gray-400 mt-0.5">You're all caught up with bookings & inquiries!</p>
              </div>
            ) : (
              notifications.map((n) => {
                const config = getNotificationConfig(n)
                const ItemIcon = config.icon
                const targetTab = resolveTabFromNotification(n)

                return (
                  <div
                    key={n.id}
                    className="p-3.5 hover:bg-brand-cream/40 transition-colors flex items-start justify-between gap-3 group"
                  >
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      <div className={`w-8 h-8 rounded-lg ${config.bg}/15 flex items-center justify-center shrink-0 mt-0.5`}>
                        <ItemIcon className={`w-4 h-4 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-bold uppercase tracking-wider ${config.color} bg-white/5 px-1.5 py-0.5 rounded-full border ${config.border}`}>
                            {config.label}
                          </span>
                        </div>
                        <h4 className="font-bold text-brand-dark text-xs sm:text-sm leading-tight mt-1 truncate">
                          {n.title}
                        </h4>
                        <p className="text-gray-600 text-xs mt-0.5 leading-relaxed line-clamp-2">
                          {n.message}
                        </p>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-[10px] text-gray-400">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {new Date(n.createdAt).toLocaleDateString()}
                          </span>
                          <button
                            onClick={() => {
                              if (onSelectTab && targetTab) onSelectTab(targetTab)
                              markRead(n.id)
                            }}
                            className={`text-[10px] font-semibold ${config.color} hover:text-white flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all cursor-pointer`}
                          >
                            View <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => markRead(n.id)}
                      className="text-gray-300 hover:text-emerald-600 p-1 rounded transition opacity-0 group-hover:opacity-100 cursor-pointer"
                      title="Mark as read"
                    >
                      <CheckCheck className="w-4 h-4" />
                    </button>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
