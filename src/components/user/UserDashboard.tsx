'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, CalendarCheck, Heart, User, LogOut, Compass, ChevronLeft, Package, Star, Gift, CreditCard, Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UserBookings } from './UserBookings'
import { UserPackageBookings } from './UserPackageBookings'
import { UserProfile } from './UserProfile'
import { UserWishlist } from './UserWishlist'
import { UserReviews } from './UserReviews'
import { UserNotifications } from './UserNotifications'
import { UserCoupons } from './UserCoupons'
import { UserPayments } from './UserPayments'
import { UserTimeline } from './UserTimeline'
import { useQuery } from '@tanstack/react-query'

type UserTab = 'overview' | 'bookings' | 'package-bookings' | 'wishlist' | 'reviews' | 'payments' | 'coupons' | 'timeline' | 'profile'

export function UserDashboard() {
  const { user, logout, navigate } = useAppStore()
  const [activeTab, setActiveTab] = useState<UserTab>('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const { data: bookings = [] } = useQuery({
    queryKey: ['user-bookings', user?.id],
    queryFn: async () => {
      const res = await fetch('/api/bookings', { headers: { 'x-user-id': user?.id || '' } })
      return res.json()
    },
  })

  const { data: pkgBookings = [] } = useQuery({
    queryKey: ['user-package-bookings-stats', user?.id],
    queryFn: async () => {
      const res = await fetch('/api/package-bookings', { headers: { 'x-user-id': user?.id || '' } })
      return res.json()
    },
  })

  const { data: wishlist = [] } = useQuery({
    queryKey: ['wishlist', user?.id],
    queryFn: async () => {
      const res = await fetch('/api/wishlist', { headers: { 'x-user-id': user?.id || '' } })
      return res.json()
    },
  })

  const { data: pkgWishlist = [] } = useQuery({
    queryKey: ['package-wishlist-stats', user?.id],
    queryFn: async () => {
      const res = await fetch('/api/package-wishlist', { headers: { 'x-user-id': user?.id || '' } })
      return res.json()
    },
  })

  const { data: notifData } = useQuery({
    queryKey: ['notifications-count', user?.id],
    queryFn: async () => {
      const res = await fetch('/api/notifications', { headers: { 'x-user-id': user?.id || '' } })
      const d = await res.json()
      return d
    },
    refetchInterval: 30000,
  })

  const unreadNotifs = notifData?.unreadCount || 0

  const confirmedBookings = bookings.filter((b: { status: string }) => b.status === 'confirmed').length
  const pendingBookings = bookings.filter((b: { status: string }) => b.status === 'pending').length
  const completedPkg = pkgBookings.filter((b: { status: string }) => b.status === 'completed').length
  const totalSpent = [...bookings, ...pkgBookings]
    .filter((b: { paymentStatus?: string }) => b.paymentStatus === 'paid' || !b.paymentStatus)
    .reduce((sum: number, b: { totalPrice: number }) => sum + (b.totalPrice || 0), 0)
  const totalBookings = bookings.length + pkgBookings.length

  const tabs = [
    { id: 'overview' as UserTab, label: 'Overview', icon: LayoutDashboard },
    { id: 'bookings' as UserTab, label: 'Destinations', icon: CalendarCheck },
    { id: 'package-bookings' as UserTab, label: 'Packages', icon: Package },
    { id: 'wishlist' as UserTab, label: 'Wishlist', icon: Heart },
    { id: 'reviews' as UserTab, label: 'Reviews', icon: Star },
    { id: 'payments' as UserTab, label: 'Payments', icon: CreditCard },
    { id: 'coupons' as UserTab, label: 'Coupons', icon: Gift },
    { id: 'timeline' as UserTab, label: 'Timeline', icon: Clock },
    { id: 'profile' as UserTab, label: 'Profile', icon: User },
  ]

  return (
    <div className="min-h-screen bg-brand-cream pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Sidebar - Desktop */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm p-4 sticky top-24">
              <div className="text-center mb-6 pt-2">
                <div className="w-16 h-16 rounded-full bg-brand-orange/10 flex items-center justify-center mx-auto mb-3 overflow-hidden">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-brand-orange" />
                  )}
                </div>
                <h3 className="font-semibold text-brand-dark">{user?.name}</h3>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>

              <div className="max-h-[400px] overflow-y-auto space-y-0.5 custom-scrollbar">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'bg-brand-orange text-white'
                          : 'text-brand-dark hover:bg-brand-cream'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  )
                })}
              </div>

              <div className="mt-4 pt-4 border-t border-border space-y-2">
                <Button variant="ghost" size="sm" className="w-full justify-start text-brand-teal" onClick={() => navigate('landing')}>
                  <Compass className="w-4 h-4 mr-2" /> Explore
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start text-red-500" onClick={logout}>
                  <LogOut className="w-4 h-4 mr-2" /> Logout
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile Sidebar Toggle */}
          <div className="lg:hidden fixed bottom-4 left-4 right-4 z-50 flex gap-2">
            <Button onClick={() => setSidebarOpen(!sidebarOpen)} className="flex-1 bg-brand-dark text-white rounded-xl h-12">
              {sidebarOpen ? <ChevronLeft className="w-4 h-4 mr-2" /> : <LayoutDashboard className="w-4 h-4 mr-2" />}
              {sidebarOpen ? 'Close Menu' : 'Dashboard Menu'}
            </Button>
          </div>

          {/* Mobile Sidebar Overlay */}
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0, x: -300 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -300 }}
                className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)}
              >
                <motion.div className="w-72 h-full bg-white p-4 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                  <div className="text-center mb-6 pt-2">
                    <div className="w-16 h-16 rounded-full bg-brand-orange/10 flex items-center justify-center mx-auto mb-3 overflow-hidden">
                      {user?.avatar ? (
                        <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-8 h-8 text-brand-orange" />
                      )}
                    </div>
                    <h3 className="font-semibold text-brand-dark">{user?.name}</h3>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <nav className="space-y-0.5">
                    {tabs.map((tab) => {
                      const Icon = tab.icon
                      return (
                        <button
                          key={tab.id}
                          onClick={() => { setActiveTab(tab.id); setSidebarOpen(false) }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                            activeTab === tab.id ? 'bg-brand-orange text-white' : 'text-brand-dark hover:bg-brand-cream'
                          }`}
                        >
                          <Icon className="w-4 h-4" />{tab.label}
                        </button>
                      )
                    })}
                  </nav>
                  <div className="mt-6 pt-4 border-t border-border space-y-2">
                    <Button variant="ghost" size="sm" className="w-full justify-start text-brand-teal" onClick={() => { navigate('landing'); setSidebarOpen(false) }}>
                      <Compass className="w-4 h-4 mr-2" /> Explore
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start text-red-500" onClick={logout}>
                      <LogOut className="w-4 h-4 mr-2" /> Logout
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <div className="flex-1 min-w-0 pb-20 lg:pb-0">
            {/* Header with Notifications */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="font-serif text-2xl text-brand-dark hidden sm:block">
                {tabs.find((t) => t.id === activeTab)?.label || 'Dashboard'}
              </h1>
              <div className="flex items-center gap-3 ml-auto">
                <UserNotifications />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <h2 className="font-serif text-2xl sm:text-3xl text-brand-dark mb-6">Welcome, {user?.name?.split(' ')[0]}!</h2>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                    {[
                      { label: 'Total Bookings', value: totalBookings, color: 'bg-brand-orange/10 text-brand-orange', icon: CalendarCheck },
                      { label: 'Confirmed', value: confirmedBookings + completedPkg, color: 'bg-green-500/10 text-green-600', icon: Star },
                      { label: 'Wishlist Items', value: wishlist.length + pkgWishlist.length, color: 'bg-red-500/10 text-red-500', icon: Heart },
                      { label: 'Total Spent', value: `₹${totalSpent.toLocaleString()}`, color: 'bg-brand-teal/10 text-brand-teal', icon: CreditCard },
                    ].map((stat) => {
                      const Icon = stat.icon
                      return (
                        <div key={stat.label} className="bg-white rounded-xl p-4 shadow-sm">
                          <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-2`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <p className="text-xs text-muted-foreground">{stat.label}</p>
                          <p className="text-lg font-bold text-brand-dark">{typeof stat.value === 'number' ? stat.value : stat.value}</p>
                        </div>
                      )
                    })}
                  </div>

                  {/* Unread Notifications Alert */}
                  {unreadNotifs > 0 && (
                    <div className="bg-brand-orange/10 border border-brand-orange/20 rounded-xl p-4 mb-6 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-orange/20 flex items-center justify-center">
                          <LayoutDashboard className="w-5 h-5 text-brand-orange" />
                        </div>
                        <div>
                          <p className="font-medium text-brand-dark text-sm">You have {unreadNotifs} unread notification{unreadNotifs > 1 ? 's' : ''}</p>
                          <p className="text-xs text-muted-foreground">Check your notifications for updates on bookings and offers</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => setActiveTab('overview')} className="text-brand-orange border-brand-orange/30">View</Button>
                    </div>
                  )}

                  {/* Recent Bookings */}
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="font-semibold text-brand-dark mb-4">Recent Bookings</h3>
                    {bookings.length === 0 && pkgBookings.length === 0 ? (
                      <p className="text-muted-foreground text-sm">No bookings yet. Start exploring!</p>
                    ) : (
                      <div className="space-y-3">
                        {[...bookings.slice(0, 3), ...pkgBookings.slice(0, 3)].slice(0, 5).map((booking: any) => {
                          const isDest = booking.destination
                          return (
                            <div key={booking.id} className="flex items-center gap-4 p-3 rounded-lg bg-brand-cream/50 cursor-pointer hover:bg-brand-cream transition-colors" onClick={() => isDest ? navigate('destination-detail', booking.destinationId) : navigate('package-detail', null, booking.packageId)}>
                              <img src={isDest ? booking.destination?.image : booking.package?.image || '/placeholder.svg'} alt="" className="w-12 h-12 rounded-lg object-cover" />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm text-brand-dark truncate">
                                  {isDest ? booking.destination?.name : booking.package?.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {isDest ? new Date(booking.checkIn).toLocaleDateString() : new Date(booking.preferredDate).toLocaleDateString()}
                                  {isDest ? ` • ${booking.status}` : ` • ${booking.status}`}
                                </p>
                              </div>
                              <p className="font-semibold text-sm">₹{booking.totalPrice?.toLocaleString()}</p>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button onClick={() => navigate('landing')} className="bg-gradient-to-r from-brand-orange to-brand-gold text-white rounded-xl p-5 text-left hover:shadow-lg transition-shadow">
                      <Compass className="w-6 h-6 mb-2" />
                      <h4 className="font-semibold">Explore Destinations</h4>
                      <p className="text-white/80 text-sm mt-1">Find your next adventure</p>
                    </button>
                    <button onClick={() => setActiveTab('wishlist')} className="bg-gradient-to-r from-brand-teal to-emerald-600 text-white rounded-xl p-5 text-left hover:shadow-lg transition-shadow">
                      <Heart className="w-6 h-6 mb-2" />
                      <h4 className="font-semibold">My Wishlist</h4>
                      <p className="text-white/80 text-sm mt-1">{wishlist.length + pkgWishlist.length} saved items</p>
                    </button>
                    <button onClick={() => setActiveTab('coupons')} className="bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl p-5 text-left hover:shadow-lg transition-shadow">
                      <Gift className="w-6 h-6 mb-2" />
                      <h4 className="font-semibold">Special Offers</h4>
                      <p className="text-white/80 text-sm mt-1">Grab discount coupons</p>
                    </button>
                  </div>
                </motion.div>
              )}

              {activeTab === 'bookings' && (
                <motion.div key="bookings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <UserBookings />
                </motion.div>
              )}

              {activeTab === 'package-bookings' && (
                <motion.div key="package-bookings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <UserPackageBookings />
                </motion.div>
              )}

              {activeTab === 'wishlist' && (
                <motion.div key="wishlist" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <UserWishlist />
                </motion.div>
              )}

              {activeTab === 'reviews' && (
                <motion.div key="reviews" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <UserReviews />
                </motion.div>
              )}

              {activeTab === 'payments' && (
                <motion.div key="payments" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <UserPayments />
                </motion.div>
              )}

              {activeTab === 'coupons' && (
                <motion.div key="coupons" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <UserCoupons />
                </motion.div>
              )}

              {activeTab === 'timeline' && (
                <motion.div key="timeline" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <UserTimeline />
                </motion.div>
              )}

              {activeTab === 'profile' && (
                <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <UserProfile />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
