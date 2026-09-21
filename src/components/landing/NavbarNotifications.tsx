'use client'

import { useState, useRef, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAppStore } from '@/lib/store'
import { Bell, CheckCheck, CalendarCheck, CreditCard, Gift, AlertCircle, Info, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { getAuthHeaders } from '@/lib/auth-client'

export function NavbarNotifications({ inline = false, onNavigate }: { inline?: boolean; onNavigate?: () => void }) {
  const { user, isAdmin, navigate, setDashboardTab } = useAppStore()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['navbar-notifications', user?.id],
    queryFn: async () => {
      const res = await fetch('/api/notifications', { headers: { ...getAuthHeaders() } })
      return res.json()
    },
    enabled: !!user?.id,
    refetchInterval: 10000,
  })

  const notifications: any[] = data?.notifications || []
  const unreadCount: number = data?.unreadCount || 0

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const markAsRead = async (id: string) => {
    await fetch(`/api/notifications/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders(), },
      body: JSON.stringify({ read: true }),
    })
    queryClient.invalidateQueries({ queryKey: ['navbar-notifications'] })
  }

  const handleNotificationClick = async (n: any) => {
    await markAsRead(n.id)
    if (isAdmin) {
      navigate('admin-dashboard')
    } else {
      if (n.link === 'dashboard') setDashboardTab('package-bookings')
      navigate('user-dashboard')
    }
    setOpen(false)
    onNavigate?.()
  }

  const markAllRead = async () => {
    const unread = notifications.filter((n) => !n.read)
    for (const n of unread) {
      await fetch(`/api/notifications/${n.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders(), },
        body: JSON.stringify({ read: true }),
      })
    }
    toast.success('All marked as read')
    queryClient.invalidateQueries({ queryKey: ['navbar-notifications'] })
  }

  const clearAll = async () => {
    if (!window.confirm('Clear all notifications? This cannot be undone.')) return
    await fetch('/api/notifications', {
      method: 'DELETE',
      headers: { ...getAuthHeaders() },
    })
    toast.success('All notifications cleared')
    queryClient.invalidateQueries({ queryKey: ['navbar-notifications'] })
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'booking': return <CalendarCheck className="w-4 h-4 text-brand-orange" />
      case 'payment': return <CreditCard className="w-4 h-4 text-green-600" />
      case 'promo': return <Gift className="w-4 h-4 text-brand-gold" />
      case 'alert': return <AlertCircle className="w-4 h-4 text-red-500" />
      default: return <Info className="w-4 h-4 text-blue-500" />
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-full hover:bg-brand-cream transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-brand-dark" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className={inline
          ? "mt-2 w-full bg-white rounded-2xl shadow-xl border border-border max-h-[60vh] flex flex-col overflow-hidden"
          : "absolute right-0 top-12 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-border z-50 max-h-[500px] flex flex-col"}>
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="font-semibold text-brand-dark">Notifications</h3>
            {notifications.length > 0 && (
              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs text-brand-orange hover:underline flex items-center gap-1">
                    <CheckCheck className="w-3 h-3" /> Mark all read
                  </button>
                )}
                <button onClick={clearAll} className="text-xs text-red-500 hover:underline flex items-center gap-1">
                  <Trash2 className="w-3 h-3" /> Clear all
                </button>
              </div>
            )}
          </div>

          <div className="overflow-y-auto flex-1">
            {isLoading ? (
              <div className="p-4 space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />)}</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n: any) => (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 p-4 border-b border-border/50 hover:bg-brand-cream/50 cursor-pointer transition-colors ${!n.read ? 'bg-brand-orange/5' : ''}`}
                  onClick={() => handleNotificationClick(n)}
                >
                  <div className="mt-0.5">{getIcon(n.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!n.read ? 'font-semibold text-brand-dark' : 'text-brand-dark'}`}>{n.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-brand-orange flex-shrink-0 mt-2" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
