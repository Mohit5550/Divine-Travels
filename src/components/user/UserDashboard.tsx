'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  CalendarCheck,
  Heart,
  User,
  LogOut,
  Compass,
  ChevronLeft,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UserBookings } from './UserBookings'
import { UserProfile } from './UserProfile'
import { UserWishlist } from './UserWishlist'
import { useQuery } from '@tanstack/react-query'

type UserTab = 'overview' | 'bookings' | 'wishlist' | 'profile'

export function UserDashboard() {
  const { user, logout, navigate } = useAppStore()
  const [activeTab, setActiveTab] = useState<UserTab>('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const { data: bookings = [] } = useQuery({
    queryKey: ['user-bookings', user?.id],
    queryFn: async () => {
      const res = await fetch('/api/bookings', {
        headers: { 'x-user-id': user?.id || '' },
      })
      return res.json()
    },
  })

  const { data: wishlist = [] } = useQuery({
    queryKey: ['wishlist', user?.id],
    queryFn: async () => {
      const res = await fetch('/api/wishlist', {
        headers: { 'x-user-id': user?.id || '' },
      })
      return res.json()
    },
  })

  const confirmedBookings = bookings.filter((b: { status: string }) => b.status === 'confirmed').length
  const pendingBookings = bookings.filter((b: { status: string }) => b.status === 'pending').length
  const totalSpent = bookings
    .filter((b: { paymentStatus: string }) => b.paymentStatus === 'paid')
    .reduce((sum: number, b: { totalPrice: number }) => sum + b.totalPrice, 0)

  const tabs = [
    { id: 'overview' as UserTab, label: 'Overview', icon: LayoutDashboard },
    { id: 'bookings' as UserTab, label: 'My Bookings', icon: CalendarCheck },
    { id: 'wishlist' as UserTab, label: 'Wishlist', icon: Heart },
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
                <div className="w-16 h-16 rounded-full bg-brand-orange/10 flex items-center justify-center mx-auto mb-3">
                  <User className="w-8 h-8 text-brand-orange" />
                </div>
                <h3 className="font-semibold text-brand-dark">{user?.name}</h3>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>

              <nav className="space-y-1">
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
              </nav>

              <div className="mt-6 pt-4 border-t border-border space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-brand-teal"
                  onClick={() => navigate('landing')}
                >
                  <Compass className="w-4 h-4 mr-2" />
                  Explore
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-red-500"
                  onClick={logout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>

          {/* Mobile Sidebar Toggle */}
          <div className="lg:hidden fixed bottom-4 left-4 right-4 z-50">
            <Button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-full bg-brand-dark text-white rounded-xl h-12"
            >
              {sidebarOpen ? <ChevronLeft className="w-4 h-4 mr-2" /> : <LayoutDashboard className="w-4 h-4 mr-2" />}
              {sidebarOpen ? 'Close Menu' : 'Dashboard Menu'}
            </Button>
          </div>

          {/* Mobile Sidebar Overlay */}
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0, x: -300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -300 }}
                className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              >
                <motion.div
                  className="w-72 h-full bg-white p-4 overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="text-center mb-6 pt-2">
                    <div className="w-16 h-16 rounded-full bg-brand-orange/10 flex items-center justify-center mx-auto mb-3">
                      <User className="w-8 h-8 text-brand-orange" />
                    </div>
                    <h3 className="font-semibold text-brand-dark">{user?.name}</h3>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>

                  <nav className="space-y-1">
                    {tabs.map((tab) => {
                      const Icon = tab.icon
                      return (
                        <button
                          key={tab.id}
                          onClick={() => { setActiveTab(tab.id); setSidebarOpen(false) }}
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
                  </nav>

                  <div className="mt-6 pt-4 border-t border-border space-y-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-brand-teal"
                      onClick={() => { navigate('landing'); setSidebarOpen(false) }}
                    >
                      <Compass className="w-4 h-4 mr-2" />
                      Explore
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-red-500"
                      onClick={logout}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <div className="flex-1 min-w-0 pb-20 lg:pb-0">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <h2 className="font-serif text-2xl sm:text-3xl text-brand-dark mb-6">
                    Welcome, {user?.name?.split(' ')[0]}!
                  </h2>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                    {[
                      { label: 'Total Bookings', value: bookings.length, color: 'bg-brand-orange/10 text-brand-orange' },
                      { label: 'Confirmed', value: confirmedBookings, color: 'bg-green-500/10 text-green-600' },
                      { label: 'Pending', value: pendingBookings, color: 'bg-amber-500/10 text-amber-600' },
                      { label: 'Total Spent', value: `₹${totalSpent.toLocaleString()}`, color: 'bg-brand-teal/10 text-brand-teal' },
                    ].map((stat) => (
                      <div key={stat.label} className="bg-white rounded-xl p-4 shadow-sm">
                        <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-2`}>
                          <span className="text-lg font-bold">{typeof stat.value === 'number' ? stat.value : ''}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                        {typeof stat.value === 'string' && (
                          <p className="text-lg font-bold text-brand-dark">{stat.value}</p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Recent Bookings */}
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h3 className="font-semibold text-brand-dark mb-4">Recent Bookings</h3>
                    {bookings.length === 0 ? (
                      <p className="text-muted-foreground text-sm">No bookings yet. Start exploring!</p>
                    ) : (
                      <div className="space-y-3">
                        {bookings.slice(0, 3).map((booking: {
                          id: string
                          destination: { name: string; image: string }
                          checkIn: string
                          status: string
                          totalPrice: number
                        }) => (
                          <div key={booking.id} className="flex items-center gap-4 p-3 rounded-lg bg-brand-cream/50">
                            <img
                              src={booking.destination.image}
                              alt={booking.destination.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-brand-dark truncate">{booking.destination.name}</p>
                              <p className="text-xs text-muted-foreground">{new Date(booking.checkIn).toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-sm">₹{booking.totalPrice.toLocaleString()}</p>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                booking.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {booking.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      onClick={() => navigate('landing')}
                      className="bg-gradient-to-r from-brand-orange to-brand-gold text-white rounded-xl p-5 text-left hover:shadow-lg transition-shadow"
                    >
                      <Compass className="w-6 h-6 mb-2" />
                      <h4 className="font-semibold">Explore Destinations</h4>
                      <p className="text-white/80 text-sm mt-1">Find your next adventure</p>
                    </button>
                    <button
                      onClick={() => setActiveTab('wishlist')}
                      className="bg-gradient-to-r from-brand-teal to-emerald-600 text-white rounded-xl p-5 text-left hover:shadow-lg transition-shadow"
                    >
                      <Heart className="w-6 h-6 mb-2" />
                      <h4 className="font-semibold">My Wishlist</h4>
                      <p className="text-white/80 text-sm mt-1">{wishlist.length} saved destinations</p>
                    </button>
                  </div>
                </motion.div>
              )}

              {activeTab === 'bookings' && (
                <motion.div
                  key="bookings"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <UserBookings />
                </motion.div>
              )}

              {activeTab === 'wishlist' && (
                <motion.div
                  key="wishlist"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <UserWishlist />
                </motion.div>
              )}

              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
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
