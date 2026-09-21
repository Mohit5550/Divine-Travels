'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'
import { CalendarCheck, DollarSign, MapPin, Users, TrendingUp, ArrowUpRight, Loader2, CalendarDays, MessageCircle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { getAuthHeaders } from '@/lib/auth-client'

export function AdminOverview({
  setActiveTab,
  setBookingsExpanded,
}: {
  setActiveTab?: (tab: string) => void
  setBookingsExpanded?: (v: boolean) => void
}) {
  const { user } = useAppStore()

  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats', user?.id],
    queryFn: async () => {
      const res = await fetch('/api/admin/stats', {
        headers: { ...getAuthHeaders() },
      })
      return res.json()
    },
    refetchInterval: 10000,
  })

  const { data: inqData } = useQuery({
    queryKey: ['admin-overview-inquiries', user?.id],
    queryFn: async () => {
      const res = await fetch('/api/admin/inquiries?limit=5', {
        headers: { ...getAuthHeaders() },
      })
      if (!res.ok) return []
      const data = await res.json()
      return (Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []) as any[]
    },
    refetchInterval: 5000,
  })

  const inquiries = inqData || []

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-white rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-80 bg-white rounded-xl animate-pulse" />
      </div>
    )
  }

  const statCards = [
    {
      label: 'Total Bookings',
      value: stats?.totalBookings || 0,
      icon: CalendarCheck,
      color: 'bg-brand-orange/10 text-brand-orange',
      trend: '+12%',
    },
    {
      label: 'Total Revenue',
      value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-green-500/10 text-green-600',
      trend: '+8%',
    },
    {
      label: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'bg-brand-teal/10 text-brand-teal',
      trend: '+5%',
    },
    {
      label: 'Destinations',
      value: stats?.totalDestinations || 0,
      icon: MapPin,
      color: 'bg-purple-500/10 text-purple-600',
      trend: '+2',
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h2 className="font-bold text-2xl sm:text-3xl text-brand-dark tracking-tight">Admin Operations & Dashboard</h2>
        <p className="text-muted-foreground text-sm mt-1">Live overview for {user?.name || 'Administrator'}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, i) => {
          const Icon = stat.icon
          return (
            <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{stat.label}</span>
                <div className={`w-9 h-9 rounded-xl ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-brand-dark">{stat.value}</p>
              <div className="flex items-center gap-1 text-xs text-green-600 mt-2 font-medium">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{stat.trend} active volume</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Today's & Upcoming Operations Scheduled */}
      <UpcomingBookingsBox setActiveTab={setActiveTab} setBookingsExpanded={setBookingsExpanded} />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-brand-dark mb-4">Monthly Revenue</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.monthlyData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }}
                />
                <Bar dataKey="revenue" fill="#E8740C" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bookings Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-brand-dark mb-4">Monthly Bookings</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.monthlyData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }}
                />
                <Bar dataKey="bookings" fill="#0D9488" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom 2-Column: Recent Bookings + Recent Contact Inquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-brand-dark text-base">Recent Bookings (Live)</h3>
              <p className="text-xs text-gray-500">Latest 5 confirmed & pending reservations</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setBookingsExpanded?.(true)
                setActiveTab?.('all-bookings')
              }}
              className="text-xs font-semibold text-brand-orange hover:text-brand-orange/80 flex items-center gap-1 cursor-pointer transition-colors"
            >
              View all <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-border text-[11px] uppercase text-muted-foreground">
                  <th className="text-left py-2.5 px-2 font-semibold">Guest</th>
                  <th className="text-left py-2.5 px-2 font-semibold">Service</th>
                  <th className="text-left py-2.5 px-2 font-semibold">Amount</th>
                  <th className="text-right py-2.5 px-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(stats?.recentBookings || []).map((booking: any) => (
                  <tr key={booking.id} className="hover:bg-brand-cream/30 transition-colors">
                    <td className="py-2.5 px-2">
                      <div>
                        <p className="font-semibold text-brand-dark text-xs sm:text-sm leading-tight">{booking.guest}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{booking.email || '—'}</p>
                      </div>
                    </td>
                    <td className="py-2.5 px-2">
                      <div>
                        <p className="text-brand-dark font-medium text-xs truncate max-w-[140px]">{booking.title}</p>
                        <p className="text-[10px] text-muted-foreground uppercase font-semibold">{booking.type}</p>
                      </div>
                    </td>
                    <td className="py-2.5 px-2 font-bold text-xs sm:text-sm text-brand-dark">
                      {booking.amount ? `₹${booking.amount.toLocaleString()}` : '—'}
                    </td>
                    <td className="py-2.5 px-2 text-right">
                      <span className={`text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full font-semibold capitalize ${
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                        booking.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        booking.status === 'cancelled' || booking.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {(!stats?.recentBookings || stats.recentBookings.length === 0) && (
                  <tr><td colSpan={4} className="py-8 text-center text-muted-foreground text-xs">No bookings yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Contact Inquiries */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-brand-dark text-base">Recent Leads & Inquiries</h3>
              <p className="text-xs text-gray-500">Contact form & custom package inquiries</p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab?.('inquiries')}
              className="text-xs font-semibold text-brand-orange hover:text-brand-orange/80 flex items-center gap-1 cursor-pointer transition-colors"
            >
              View all <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <div className="divide-y divide-gray-100">
              {inquiries.slice(0, 5).map((inq: any) => {
                const phoneClean = (inq.phone || '').replace(/[^\d]/g, '')
                const waText = encodeURIComponent(`Hi ${inq.name}, thank you for contacting Divine Travels regarding "${inq.subject || 'your inquiry'}". How can we assist you with your trip?`)
                const waUrl = phoneClean.length >= 10
                  ? `https://wa.me/${phoneClean.startsWith('91') ? phoneClean : `91${phoneClean}`}?text=${waText}`
                  : null

                return (
                  <div key={inq.id} className="py-3 px-1 hover:bg-brand-cream/30 rounded-xl transition-colors flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-brand-dark text-xs sm:text-sm">{inq.name}</p>
                        {!inq.read && (
                          <span className="w-2 h-2 rounded-full bg-brand-orange shrink-0 animate-ping" />
                        )}
                      </div>
                      <p className="text-xs text-gray-700 font-medium truncate mt-0.5">{inq.subject || 'General Inquiry'}</p>
                      <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">{inq.message}</p>
                      <span className="text-[10px] text-gray-400 mt-1 block">
                        {inq.phone ? `📞 ${inq.phone} · ` : ''}{new Date(inq.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {waUrl && (
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[11px] px-2 py-1 rounded-lg font-semibold transition-colors"
                          title="Reply on WhatsApp"
                        >
                          <MessageCircle className="w-3 h-3 text-emerald-600" />
                          <span>WhatsApp</span>
                        </a>
                      )}
                    </div>
                  </div>
                )
              })}
              {inquiries.length === 0 && (
                <div className="py-8 text-center text-muted-foreground text-xs">No inquiries yet</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function UpcomingBookingsBox({
  setActiveTab,
  setBookingsExpanded,
}: {
  setActiveTab?: (tab: string) => void
  setBookingsExpanded?: (v: boolean) => void
}) {
  const { user } = useAppStore()
  const queryClient = useQueryClient()
  const [range, setRange] = useState<'today' | 'week' | '15' | '30'>('today')

  const { data, isLoading } = useQuery({
    queryKey: ['upcoming-bookings', user?.id, range],
    queryFn: async () => {
      const res = await fetch(`/api/admin/upcoming-bookings?range=${range}`, {
        headers: { ...getAuthHeaders() },
      })
      return res.json()
    },
    refetchInterval: 10000,
  })

  const counts = data?.counts || { today: 0, week: 0, days15: 0, days30: 0 }

  const ranges = [
    { key: 'today' as const, label: "Today's Operations", count: counts.today, active: 'bg-emerald-600 text-white shadow-sm', idle: 'bg-white text-brand-dark border border-gray-200 hover:bg-brand-cream' },
    { key: 'week' as const, label: '7 Days', count: counts.week, active: 'bg-brand-orange text-white shadow-sm', idle: 'bg-white text-brand-dark border border-gray-200 hover:bg-brand-cream' },
    { key: '15' as const, label: '15 Days', count: counts.days15, active: 'bg-amber-500 text-white shadow-sm', idle: 'bg-white text-brand-dark border border-gray-200 hover:bg-brand-cream' },
    { key: '30' as const, label: '1 Month', count: counts.days30, active: 'bg-brand-teal text-white shadow-sm', idle: 'bg-white text-brand-dark border border-gray-200 hover:bg-brand-cream' },
  ]

  const bookings = data?.data || []

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm mb-8 border border-border/60">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-brand-orange/10 flex items-center justify-center text-brand-orange">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-brand-dark text-lg">Upcoming Trip Departures</h3>
            <p className="text-xs text-gray-500">Live operational schedule for travelers arriving in Rishikesh/Uttarakhand</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setBookingsExpanded?.(true)
            setActiveTab?.('all-bookings')
          }}
          className="text-xs font-semibold text-brand-orange hover:text-brand-orange/80 flex items-center gap-1 cursor-pointer transition-colors"
        >
          Manage all bookings <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Range filters */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        {ranges.map((r) => (
          <button
            key={r.key}
            type="button"
            onClick={() => setRange(r.key)}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
              range === r.key ? r.active : r.idle
            }`}
          >
            {r.key === 'today' && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            )}
            <span>{r.label}</span>
            <span className="text-[11px] opacity-80 font-mono">({r.count})</span>
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase text-muted-foreground tracking-wider bg-brand-cream/40">
              <th className="text-left py-3 px-3 font-semibold">Guest</th>
              <th className="text-left py-3 px-3 font-semibold">Service</th>
              <th className="text-left py-3 px-3 font-semibold">Travel Date</th>
              <th className="text-left py-3 px-3 font-semibold">Amount</th>
              <th className="text-left py-3 px-3 font-semibold">Status</th>
              <th className="text-right py-3 px-3 font-semibold">Quick Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {isLoading ? (
              <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">Loading operations schedule…</td></tr>
            ) : bookings.length === 0 ? (
              <tr><td colSpan={6} className="py-8 text-center text-muted-foreground">
                No trip departures scheduled for {range === 'today' ? 'today' : range === 'week' ? 'the next 7 days' : `${range} days`}.
              </td></tr>
            ) : (
              bookings.map((booking: {
                id: string
                type: string
                displayType: string
                guest: string
                email: string
                phone: string
                title: string
                date: string | null
                amount: number
                status: string
              }) => {
                const waText = encodeURIComponent(`Hi ${booking.guest || 'Traveler'}, Divine Travels here regarding your upcoming booking for "${booking.title}". Travel Date: ${booking.date ? new Date(booking.date).toLocaleDateString('en-IN') : 'Scheduled'}. Please let us know if you need reporting time or pickup assistance!`)
                const phoneClean = (booking.phone || '').replace(/[^\d]/g, '')
                const waUrl = phoneClean.length >= 10
                  ? `https://wa.me/${phoneClean.startsWith('91') ? phoneClean : `91${phoneClean}`}?text=${waText}`
                  : `https://wa.me/916396919007?text=${waText}`

                return (
                  <tr key={booking.id} className="hover:bg-brand-cream/30 transition-colors">
                    <td className="py-3 px-3">
                      <div>
                        <p className="font-semibold text-brand-dark text-xs sm:text-sm">{booking.guest}</p>
                        <p className="text-[11px] text-muted-foreground">{booking.phone || booking.email || '—'}</p>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div>
                        <p className="text-brand-dark text-xs sm:text-sm font-medium">{booking.title}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{booking.displayType}</p>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-xs text-gray-700 font-medium">
                      {booking.date
                        ? new Date(booking.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                        : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="py-3 px-3 font-bold text-xs sm:text-sm text-brand-dark">
                      {booking.amount ? `₹${booking.amount.toLocaleString()}` : '—'}
                    </td>
                    <td className="py-3 px-3">
                      <select
                        value={booking.status || 'pending'}
                        onChange={async (e) => {
                          const newStatus = e.target.value
                          try {
                            const res = await fetch('/api/admin/bookings/update-status', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json', ...getAuthHeaders(), },
                              body: JSON.stringify({
                                bookingId: booking.id,
                                type: booking.type || 'package',
                                status: newStatus,
                              }),
                            })
                            if (!res.ok) throw new Error()
                            const data = await res.json()
                            if (newStatus === 'confirmed' && data.whatsappUrl) {
                              window.open(data.whatsappUrl, '_blank')
                              toast.success('Booking Confirmed! WhatsApp opened to send 10% advance payment link.')
                            } else {
                              toast.success(`Operational status updated: ${newStatus.replace('_', ' ').toUpperCase()}`)
                            }
                            queryClient.invalidateQueries({ queryKey: ['upcoming-bookings'] })
                            queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
                            queryClient.invalidateQueries({ queryKey: ['admin-all-bookings'] })
                          } catch {
                            toast.error('Failed to update status')
                          }
                        }}
                        className={`text-[11px] font-semibold rounded-lg px-2 py-1 border cursor-pointer transition-colors focus:ring-2 focus:ring-brand-orange/20 outline-none ${
                          booking.status === 'confirmed' ? 'bg-green-50 text-green-700 border-green-200' :
                          booking.status === 'ready' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                          booking.status === 'in_progress' ? 'bg-blue-50 text-blue-700 border-blue-200 font-bold' :
                          booking.status === 'completed' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                          booking.status === 'cancelled' || booking.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        <option value="pending">🟡 Pending</option>
                        <option value="confirmed">🟢 Confirmed</option>
                        <option value="ready">🟠 Guide/Cab Ready</option>
                        <option value="in_progress">🔵 In-Progress</option>
                        <option value="completed">🟣 Completed</option>
                        <option value="cancelled">🔴 Cancelled</option>
                      </select>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs px-2.5 py-1 rounded-lg font-medium transition-colors"
                        title="Send WhatsApp update to traveler"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>WhatsApp</span>
                      </a>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

