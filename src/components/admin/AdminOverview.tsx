'use client'

import { useQuery } from '@tanstack/react-query'
import { useAppStore } from '@/lib/store'
import { CalendarCheck, DollarSign, MapPin, Users, TrendingUp, ArrowUpRight, Car, Bike, Mountain, Waves, Compass, Globe, Map, Landmark, Bed, Tent, Loader2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const serviceIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  rafting: Waves,
  trekking: Mountain,
  adventure: Compass,
  'bike-rental': Bike,
  taxi: Car,
  'domestic-tours': Map,
  'spiritual-tours': Landmark,
  'international-tours': Globe,
  'stay-hotel': Bed,
  'stay-camping': Tent,
  tour: CalendarCheck,
}

const serviceLabels: Record<string, string> = {
  rafting: 'Rafting',
  trekking: 'Trekking',
  adventure: 'Adventure',
  'bike-rental': 'Bike Rental',
  taxi: 'Taxi',
  'domestic-tours': 'Domestic Tours',
  'spiritual-tours': 'Spiritual Tours',
  'international-tours': 'International Tours',
  'stay-hotel': 'Hotel',
  'stay-camping': 'Camping',
  tour: 'Day Tours',
}

const serviceColors: Record<string, string> = {
  rafting: 'text-blue-600 bg-blue-100',
  trekking: 'text-emerald-600 bg-emerald-100',
  adventure: 'text-red-600 bg-red-100',
  'bike-rental': 'text-orange-600 bg-orange-100',
  taxi: 'text-amber-600 bg-amber-100',
  'domestic-tours': 'text-teal-600 bg-teal-100',
  'spiritual-tours': 'text-amber-700 bg-amber-100',
  'international-tours': 'text-indigo-600 bg-indigo-100',
  'stay-hotel': 'text-amber-600 bg-amber-100',
  'stay-camping': 'text-emerald-600 bg-emerald-100',
  tour: 'text-brand-orange bg-brand-orange/10',
}

export function AdminOverview() {
  const { user } = useAppStore()

  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats', user?.id],
    queryFn: async () => {
      const res = await fetch('/api/admin/stats', {
        headers: { 'x-user-id': user?.id || '' },
      })
      return res.json()
    },
  })

  const { data: countsData } = useQuery({
    queryKey: ['admin-booking-counts', user?.id],
    queryFn: async () => {
      const res = await fetch('/api/admin/booking-counts', {
        headers: { 'x-user-id': user?.id || '' },
      })
      return res.json() as Promise<{ counts: Record<string, number>; services: { key: string; label: string }[] }>
    },
    refetchInterval: 15000,
  })

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

  const counts = countsData?.counts || {}

  return (
    <div>
      <div className="mb-8">
        <h2 className="font-serif text-2xl sm:text-3xl text-brand-dark">Admin Dashboard</h2>
        <p className="text-muted-foreground text-sm mt-1">Welcome back, {user?.name}!</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="flex items-center gap-0.5 text-xs text-green-600 font-medium">
                  <TrendingUp className="w-3 h-3" />
                  {stat.trend}
                </span>
              </div>
              <p className="text-2xl font-bold text-brand-dark">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </div>
          )
        })}
      </div>

      {/* Service Booking Counts - iPhone-style notification badges */}
      <div className="mb-8">
        <h3 className="font-semibold text-brand-dark mb-3 text-sm">Pending Bookings by Service</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {Object.entries(serviceLabels).map(([key, label]) => {
            const Icon = serviceIcons[key] || CalendarCheck
            const count = counts[key] || 0
            const colorClasses = serviceColors[key] || 'text-gray-600 bg-gray-100'
            return (
              <div
                key={key}
                className="relative bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-lg ${colorClasses} flex items-center justify-center`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  {count > 0 && (
                    <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
                      {count}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">{label}</p>
                <p className="text-lg font-bold text-brand-dark">{count}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-brand-dark mb-4">Monthly Revenue</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.monthlyData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                />
                <Bar dataKey="revenue" fill="#E8740C" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bookings Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="font-semibold text-brand-dark mb-4">Monthly Bookings</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.monthlyData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                />
                <Bar dataKey="bookings" fill="#0D9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-brand-dark">Recent Bookings</h3>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            View all <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Guest</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Destination</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Amount</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {(stats?.recentBookings || []).map((booking: {
                id: string
                user: { name: string; email: string }
                destination: { name: string }
                totalPrice: number
                status: string
              }) => (
                <tr key={booking.id} className="border-b border-border/50 hover:bg-brand-cream/30">
                  <td className="py-3 px-2">
                    <div>
                      <p className="font-medium text-brand-dark">{booking.user.name}</p>
                      <p className="text-xs text-muted-foreground">{booking.user.email}</p>
                    </div>
                  </td>
                  <td className="py-3 px-2">{booking.destination.name}</td>
                  <td className="py-3 px-2 font-medium">₹{booking.totalPrice.toLocaleString()}</td>
                  <td className="py-3 px-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                      booking.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
