'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { useCart } from '@/lib/cart'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, CalendarCheck, Heart, User, LogOut, Compass, ChevronLeft, Package, Star, Gift, CreditCard, Clock, Receipt, MapPin, Car, ShoppingCart, ShoppingBag, Trash2, ArrowRight, RefreshCw, Sparkles, MessageCircle, FileText, CheckCircle2, AlertCircle, Info, Calendar, ShieldCheck
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
import { UserTourBookings } from './UserTourBookings'
import { UserTaxiBookings } from './UserTaxiBookings'
import { UserCartPanel } from './UserCartPanel'
import { BookingVoucherModal, type BookingVoucherData } from '@/components/booking/BookingVoucherModal'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getAuthHeaders } from '@/lib/auth-client'

  type UserTab = 'overview' | 'bookings' | 'package-bookings' | 'tours' | 'taxi' | 'wishlist' | 'cart' | 'reviews' | 'payments' | 'coupons' | 'timeline' | 'profile' | 'payment-requests'

export function UserDashboard() {
  const { user, logout, navigate, dashboardTab, setDashboardTab, setVoucherModalOpen } = useAppStore()
  const queryClient = useQueryClient()
  const cartItems = useCart((s) => s.items)
  const [activeTab, setActiveTab] = useState<UserTab>('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [voucherData, setVoucherData] = useState<BookingVoucherData | null>(null)
  const [selectedTripIndex, setSelectedTripIndex] = useState(0)

  useEffect(() => {
    const validTabs: UserTab[] = ['overview', 'bookings', 'package-bookings', 'tours', 'taxi', 'wishlist', 'cart', 'reviews', 'payments', 'coupons', 'timeline', 'profile', 'payment-requests']
    if (dashboardTab && validTabs.includes(dashboardTab as UserTab)) {
      setActiveTab(dashboardTab as UserTab)
      setDashboardTab('')
    }
  }, [dashboardTab, setDashboardTab])

  useEffect(() => {
    const tab = sessionStorage.getItem('dt_dashboard_tab')
      if (tab && ['overview', 'bookings', 'package-bookings', 'tours', 'taxi', 'wishlist', 'cart', 'reviews', 'payments', 'coupons', 'timeline', 'profile', 'payment-requests'].includes(tab)) {
      setActiveTab(tab as UserTab)
      sessionStorage.removeItem('dt_dashboard_tab')
    }
  }, [])

  useEffect(() => {
    if (!user?.id) return
    fetch('/api/admin/cancel-expired-advance', {
      method: 'POST',
      headers: { ...getAuthHeaders() },
    }).catch(() => {})
  }, [user?.id])

  const handlePayNow = async (booking: any) => {
    try {
      const isDest = booking._bookingType === 'dest'
      const isTour = booking._bookingType === 'tour' || booking._bookingType === 'taxi'
      const bType = isDest ? 'destination' : isTour ? 'tour' : 'package'
      const res = await fetch(`/api/booking-flow/${bType}/${booking.id}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders(), },
        body: JSON.stringify({ method: 'online', payType: 'advance' }),
      })
      if (!res.ok) { const d = await res.json(); toast.error(d.error || 'Failed to create payment'); return }
      const payData = await res.json()
      localStorage.setItem('dt_payment_id', payData.payment_id)
      localStorage.setItem('dt_booking_id', booking.id)
      localStorage.setItem('dt_user_id', user?.id || '')
      localStorage.setItem('dt_service', 'unified')
      localStorage.setItem('dt_booking_type', bType)
      localStorage.setItem('dt_pay_type', 'advance')
      window.location.href = payData.payment_page
    } catch {
      toast.error('Failed to initiate payment')
    }
  }

  const handlePayBalance = async (booking: any, bType: string) => {
    try {
      const res = await fetch(`/api/booking-flow/${bType}/${booking.id}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders(), },
        body: JSON.stringify({ method: 'online', payType: 'balance' }),
      })
      if (!res.ok) { const d = await res.json(); toast.error(d.error || 'Failed to create payment'); return }
      const payData = await res.json()
      localStorage.setItem('dt_payment_id', payData.payment_id)
      localStorage.setItem('dt_booking_id', booking.id)
      localStorage.setItem('dt_user_id', user?.id || '')
      localStorage.setItem('dt_service', 'unified')
      localStorage.setItem('dt_booking_type', bType)
      localStorage.setItem('dt_pay_type', 'balance')
      window.location.href = payData.payment_page
    } catch {
      toast.error('Failed to initiate payment')
    }
  }

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ['user-bookings', user?.id],
    queryFn: async () => {
      const res = await fetch('/api/bookings', { headers: { ...getAuthHeaders() } })
      if (!res.ok) return []
      return res.json()
    },
    refetchInterval: 12000,
  })

  const { data: pkgBookings = [], isLoading: pkgLoading } = useQuery({
    queryKey: ['user-package-bookings-stats', user?.id],
    queryFn: async () => {
      const res = await fetch('/api/package-bookings', { headers: { ...getAuthHeaders() } })
      if (!res.ok) return []
      return res.json()
    },
    refetchInterval: 12000,
  })

  const { data: wishlist = [] } = useQuery({
    queryKey: ['wishlist', user?.id],
    queryFn: async () => {
      const res = await fetch('/api/wishlist', { headers: { ...getAuthHeaders() } })
      if (!res.ok) return []
      return res.json()
    },
  })

  const { data: pkgWishlist = [] } = useQuery({
    queryKey: ['package-wishlist-stats', user?.id],
    queryFn: async () => {
      const res = await fetch('/api/package-wishlist', { headers: { ...getAuthHeaders() } })
      if (!res.ok) return []
      return res.json()
    },
  })

  const { data: notifData } = useQuery({
    queryKey: ['notifications-count', user?.id],
    queryFn: async () => {
      const res = await fetch('/api/notifications', { headers: { ...getAuthHeaders() } })
      if (!res.ok) return { unreadCount: 0 }
      const d = await res.json()
      return d
    },
    refetchInterval: 30000,
  })

  const { data: paymentRequests = [] } = useQuery({
    queryKey: ['payment-requests', user?.id],
    queryFn: async () => {
      const res = await fetch('/api/payment-requests', { headers: { ...getAuthHeaders() } })
      if (!res.ok) return []
      return res.json()
    },
    refetchInterval: 15000,
  })

  const { data: tourBookings = [], isLoading: tourLoading } = useQuery({
    queryKey: ['user-tour-bookings-stats', user?.id],
    queryFn: async () => {
      const res = await fetch('/api/tour-bookings?excludeTaxi=true', { headers: { ...getAuthHeaders() } })
      if (!res.ok) return []
      return res.json()
    },
  })

  const { data: taxiBookings = [], isLoading: taxiLoading } = useQuery({
    queryKey: ['user-taxi-bookings-stats', user?.id],
    queryFn: async () => {
      const res = await fetch('/api/taxi-bookings', { headers: { ...getAuthHeaders() } })
      if (!res.ok) return []
      return res.json()
    },
  })

  const unreadNotifs = notifData?.unreadCount || 0

  const isLoading = bookingsLoading || pkgLoading || tourLoading || taxiLoading

  const distinctTourBookings = (tourBookings || []).filter(
    (tb: any) => !(tb.packageType?.startsWith('Taxi') || (typeof tb.adminNotes === 'string' && tb.adminNotes.includes('taxi-booking')))
  )
  const taggedBookings = [
    ...(bookings || []).map((b: any) => ({ ...b, _bookingType: 'dest' })),
    ...(pkgBookings || []).map((b: any) => ({ ...b, _bookingType: 'pkg' })),
    ...distinctTourBookings.map((b: any) => ({ ...b, _bookingType: 'tour' })),
    ...(taxiBookings || []).map((b: any) => ({ ...b, _bookingType: 'taxi' })),
  ]
  const allBookings = isLoading ? [] : taggedBookings
  const confirmedBookings = isLoading ? 0 : allBookings.filter((b: { status: string }) => b.status === 'confirmed').length
  const pendingBookings = isLoading ? 0 : allBookings.filter((b: { status: string }) => b.status === 'pending').length
  const completedPkg = isLoading ? 0 : allBookings.filter((b: { status: string }) => b.status === 'completed').length
  const totalSpent = isLoading ? 0 : allBookings
    .filter((b: { paymentStatus?: string }) => b.paymentStatus === 'completed')
    .reduce((sum: number, b: { totalPrice: number }) => sum + (b.totalPrice || 0), 0)
  const totalBookings = isLoading ? 0 : allBookings.length

  // Upcoming Trips Array calculation (all upcoming active trips for current user)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const startOfYesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  const upcomingTrips = allBookings
    .filter((b: any) => {
      const d = b.checkIn || b.preferredDate || b.travelDate
      if (!d) return false
      const tripDate = new Date(d)
      return !isNaN(tripDate.getTime()) && tripDate >= startOfYesterday && b.status !== 'cancelled' && b.status !== 'rejected'
    })
    .sort((a: any, b: any) => {
      const dateA = new Date(a.checkIn || a.preferredDate || a.travelDate).getTime()
      const dateB = new Date(b.checkIn || b.preferredDate || b.travelDate).getTime()
      return dateA - dateB
    })

  const safeTripIndex = Math.min(selectedTripIndex, Math.max(0, upcomingTrips.length - 1))
  const currentTrip = upcomingTrips[safeTripIndex]

  let daysLeft = 0
  let isToday = false
  let tripTitle = 'Your Upcoming Adventure'
  let tripDateStr = ''
  let tripLocation = 'Rishikesh, Uttarakhand'
  let tripGuests = 1
  let tripAmount = 0
  let tripPaid = 0
  let tripBalance = 0
  let tripStatus = 'confirmed'
  let tripType = 'package'
  let tripProgress = {
    steps: [
      { label: 'Booked', desc: 'Order Received' },
      { label: 'Confirmed', desc: 'Slot Locked' },
      { label: 'Guide & Gear Ready', desc: 'Briefing Point' },
      { label: 'Activity Started', desc: 'In Progress' },
      { label: 'Completed', desc: 'Safe Finish' },
    ],
    currentStep: 1,
  }

  if (currentTrip) {
    const isDest = currentTrip.destination && typeof currentTrip.destination === 'object'
    const isPkg = currentTrip.package && typeof currentTrip.package === 'object'
    tripTitle = isDest
      ? currentTrip.destination.name
      : isPkg
      ? currentTrip.package.name
      : currentTrip.destination || currentTrip.packageType || 'Uttarakhand Trip'
    const dVal = currentTrip.checkIn || currentTrip.preferredDate || currentTrip.travelDate
    if (dVal) {
      const tDate = new Date(dVal)
      const diffMs = tDate.getTime() - now.getTime()
      daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))
      isToday = daysLeft === 0
      tripDateStr = tDate.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
    }
    tripGuests = currentTrip.numberOfPeople || currentTrip.guests || currentTrip.passengers || currentTrip.travelers || 1
    tripAmount = currentTrip.totalPrice || currentTrip.negotiatedPrice || 0

    // Accurate payment calculation - NO fake 10% assumption
    if (currentTrip.paymentStatus === 'completed') {
      tripPaid = currentTrip.paymentAmount || tripAmount
      tripBalance = 0
    } else {
      tripPaid = currentTrip.paymentAmount || 0
      tripBalance = Math.max(0, tripAmount - tripPaid)
    }

    tripStatus = currentTrip.status || 'pending'
    tripLocation = currentTrip.reportingLocation || currentTrip.pickupLocation || currentTrip.package?.location || 'Rishikesh / Reporting Point'
    tripType = currentTrip._bookingType === 'taxi' ? 'taxi' : currentTrip._bookingType === 'tour' ? 'tour' : currentTrip._bookingType === 'dest' ? 'destination' : 'package'

    // Operational Progress Stepper & Checklist Calculation
    const category = (currentTrip.package?.category || currentTrip.packageType || currentTrip._bookingType || '').toLowerCase()
    const rawStatus = (currentTrip.status || 'pending').toLowerCase()

    let isTaxi = category.includes('taxi') || currentTrip._bookingType === 'taxi'
    let isStay = category.includes('hotel') || category.includes('camping') || category.includes('stay') || currentTrip._bookingType === 'dest'
    let isTour = category.includes('tour') || category.includes('spiritual') || category.includes('domestic') || category.includes('international') || currentTrip._bookingType === 'tour'

    let steps = [
      { label: 'Booked', desc: 'Order Received' },
      { label: 'Confirmed', desc: 'Guide & Slot Locked' },
      { label: 'Camp / Gear Ready', desc: 'Reporting Allocated' },
      { label: 'Activity Started', desc: 'On Adventure' },
      { label: 'Trip Complete', desc: 'Safely Finished' },
    ]

    let checklist = [
      '🪪 Valid Govt ID',
      '👟 Quick-Dry Footwear',
      '📱 Waterproof Pouch',
      '⏰ Reach 15m Early',
    ]

    if (isTour) {
      steps = [
        { label: 'Tour Booked', desc: 'Itinerary Shared' },
        { label: 'Tour Confirmed', desc: 'Hotels & Permits Locked' },
        { label: 'Driver & Guide Ready', desc: 'Vehicle & Guide Assigned' },
        { label: 'Tour In-Progress', desc: 'Sightseeing & Darshan' },
        { label: 'Tour Completed', desc: 'Safe Yatra Finish' },
      ]
      checklist = [
        '🪪 Govt ID / Yatra Registration',
        '🧥 Warm Clothing & Shawl',
        '💊 Personal First Aid & Meds',
        '⏰ Be Ready 30m Prior',
      ]
    } else if (isTaxi) {
      steps = [
        { label: 'Cab Requested', desc: 'Order Placed' },
        { label: 'Vehicle Confirmed', desc: 'Cab Model Locked' },
        { label: 'Driver Assigned', desc: 'Driver & Vehicle Shared' },
        { label: 'Ride In-Progress', desc: 'En Route' },
        { label: 'Trip Complete', desc: 'Destination Reached' },
      ]
      checklist = [
        '🪪 Valid Govt ID',
        '📍 Pickup Location Pin Ready',
        '🎒 Luggage Capacity Check',
        '⏰ Be Ready at Pickup Time',
      ]
    } else if (isStay) {
      steps = [
        { label: 'Booked', desc: 'Request Sent' },
        { label: 'Stay Confirmed', desc: 'Dates Blocked' },
        { label: 'Check-in Ready', desc: 'Tent/Room Clean' },
        { label: 'Checked In', desc: 'On-Site Stay' },
        { label: 'Checked Out', desc: 'Completed' },
      ]
      checklist = [
        '🪪 Govt ID for All Guests',
        '⏰ Check-in Standard 12:00 PM',
        '📋 Booking Voucher Copy',
      ]
    }

    let currentStep = 0
    if (rawStatus === 'pending') currentStep = 0
    else if (rawStatus === 'confirmed' || rawStatus === 'approved') currentStep = 1
    else if (rawStatus === 'ready' || rawStatus === 'assigned' || rawStatus === 'camp_ready' || rawStatus === 'driver_assigned') currentStep = 2
    else if (rawStatus === 'in_progress' || rawStatus === 'started' || rawStatus === 'checked_in') currentStep = 3
    else if (rawStatus === 'completed') currentStep = 4

    tripProgress = { steps, currentStep }
    ;(currentTrip as any)._checklist = checklist
  }

  const tabs = [
    { id: 'overview' as UserTab, label: 'Overview', icon: LayoutDashboard },
    { id: 'bookings' as UserTab, label: 'Destinations', icon: CalendarCheck },
    { id: 'package-bookings' as UserTab, label: 'Packages', icon: Package },
    { id: 'tours' as UserTab, label: 'Tours', icon: MapPin },
    { id: 'taxi' as UserTab, label: 'Taxi', icon: Car },
    { id: 'wishlist' as UserTab, label: 'Wishlist', icon: Heart },
    { id: 'cart' as UserTab, label: 'My Cart', icon: ShoppingCart },
    { id: 'reviews' as UserTab, label: 'Reviews', icon: Star },
    { id: 'payments' as UserTab, label: 'Payments', icon: CreditCard },
    { id: 'payment-requests' as UserTab, label: 'Payment Requests', icon: Clock },
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
                  const cartCount = tab.id === 'cart' ? cartItems.length : 0
                  const wishCount = tab.id === 'wishlist' ? (wishlist.length + pkgWishlist.length) : 0
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
                      {(cartCount > 0 || wishCount > 0) && (
                        <span className="ml-auto bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                          {tab.id === 'cart' ? cartCount : wishCount}
                        </span>
                      )}
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
                      const cartCount = tab.id === 'cart' ? cartItems.length : 0
                      const wishCount = tab.id === 'wishlist' ? (wishlist.length + pkgWishlist.length) : 0
                      return (
                        <button
                          key={tab.id}
                          onClick={() => { setActiveTab(tab.id); setSidebarOpen(false) }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                            activeTab === tab.id ? 'bg-brand-orange text-white' : 'text-brand-dark hover:bg-brand-cream'
                          }`}
                        >
                          <Icon className="w-4 h-4" />{tab.label}
                          {(cartCount > 0 || wishCount > 0) && (
                            <span className="ml-auto bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                              {tab.id === 'cart' ? cartCount : wishCount}
                            </span>
                          )}
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
            {/* Header with Notifications & Live Sync */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="font-serif text-2xl text-brand-dark hidden sm:block">
                {tabs.find((t) => t.id === activeTab)?.label || 'Dashboard'}
              </h1>
              <div className="flex items-center gap-3 ml-auto">
                <div className="flex items-center gap-2 bg-white/70 px-2.5 py-1 rounded-full border border-border/40 shadow-2xs">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[11px] font-medium text-gray-500 hidden sm:inline">Live Auto-Sync</span>
                  <button
                    onClick={() => {
                      queryClient.invalidateQueries()
                      toast.success('Live data refreshed')
                    }}
                    className="p-1 rounded-md text-gray-400 hover:text-brand-orange hover:bg-gray-100 transition-colors"
                    title="Refresh data"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
                <UserNotifications />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                    <div>
                      <h2 className="font-serif text-2xl sm:text-3xl text-brand-dark">Welcome, {user?.name?.split(' ')[0]}!</h2>
                      <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Manage your Uttarakhand adventures, bookings, and vouchers in one place.</p>
                    </div>
                  </div>

                  {/* Upcoming Trips Multi-Booking Live Hub */}
                  {upcomingTrips.length > 0 && currentTrip && (
                    <div className="bg-gradient-to-br from-brand-dark via-slate-900 to-brand-dark rounded-3xl p-5 sm:p-7 text-white shadow-xl mb-8 relative overflow-hidden border border-white/10">
                      {/* Background ambient glow */}
                      <div className="absolute top-0 right-0 w-80 h-80 bg-brand-orange/15 rounded-full blur-3xl pointer-events-none" />
                      <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-brand-teal/15 rounded-full blur-3xl pointer-events-none" />

                      {/* Multi-Trip Tabs Switcher (Shown when user has 2 or more active upcoming trips) */}
                      {upcomingTrips.length > 1 && (
                        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-white/10">
                          <div className="flex items-center gap-2">
                            <span className="bg-brand-orange text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                              {upcomingTrips.length} Active Trips
                            </span>
                            <span className="text-xs text-gray-300">
                              Viewing Trip {safeTripIndex + 1} of {upcomingTrips.length}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full custom-scrollbar">
                            {upcomingTrips.map((t: any, idx: number) => {
                              const isSelected = idx === safeTripIndex
                              const tTitle = t.package?.name || t.destination?.name || t.destination || t.packageType || `Trip #${idx + 1}`
                              const d = t.checkIn || t.preferredDate || t.travelDate
                              const dStr = d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''
                              return (
                                <button
                                  key={t.id || idx}
                                  onClick={() => setSelectedTripIndex(idx)}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                                    isSelected
                                      ? 'bg-white text-brand-dark shadow-md ring-2 ring-brand-orange font-bold scale-[1.02]'
                                      : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
                                  }`}
                                >
                                  <span>{idx + 1}. {tTitle}</span>
                                  {dStr && <span className="opacity-75 text-[10px]">({dStr})</span>}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                        <div className="flex-1 min-w-0">
                          {/* Top Tag & Countdown Badge */}
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <span className="inline-flex items-center gap-1.5 bg-brand-orange text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                              <Sparkles className="w-3.5 h-3.5" />
                              {isToday ? '🔥 Your Adventure is Today!' : daysLeft === 1 ? '✨ Starts Tomorrow!' : `🎉 Starts in ${daysLeft} Days!`}
                            </span>
                            <span className="bg-white/10 text-gray-200 text-xs px-2.5 py-1 rounded-full border border-white/10">
                              {tripDateStr}
                            </span>
                            <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold capitalize ${
                              tripStatus === 'confirmed' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                              tripStatus === 'ready' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' :
                              tripStatus === 'in_progress' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold' :
                              tripStatus === 'completed' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                              'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}>
                              ● {tripStatus.replace('_', ' ')}
                            </span>
                          </div>

                          {/* Trip Title */}
                          <h3 className="font-bold text-xl sm:text-2xl text-white mb-2 leading-tight">
                            {tripTitle}
                          </h3>

                          {/* Trip Meta Strip & Accurate Payment (No Fake 10%) */}
                          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-300 mb-4">
                            <span className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-brand-orange" />
                              <span>{tripLocation}</span>
                            </span>
                            <span className="flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-brand-teal" />
                              <span>{tripGuests} Traveler{tripGuests !== 1 ? 's' : ''}</span>
                            </span>
                            <span className="flex items-center gap-1.5 font-mono">
                              <span className="text-gray-400">Total:</span>
                              <span className="text-white font-bold">₹{tripAmount.toLocaleString()}</span>
                            </span>
                            <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold ${
                              tripPaid >= tripAmount && tripAmount > 0
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : tripPaid > 0
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-white/10 text-gray-300 border border-white/10'
                            }`}>
                              {tripPaid >= tripAmount && tripAmount > 0
                                ? '✓ 100% Paid'
                                : tripPaid > 0
                                ? `Paid: ₹${tripPaid.toLocaleString()} (Due: ₹${tripBalance.toLocaleString()})`
                                : `Paid: ₹0 (Due: ₹${tripAmount.toLocaleString()})`}
                            </span>
                          </div>

                          {/* Dynamic 5-Step Operational Progress Stepper */}
                          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 sm:p-4 mb-4">
                            <div className="flex items-center justify-between text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
                              <span>Live Operational Status</span>
                              <span className="text-brand-orange font-bold normal-case text-xs">
                                Stage {tripProgress.currentStep + 1} of 5: {tripProgress.steps[tripProgress.currentStep]?.label}
                              </span>
                            </div>
                            <div className="grid grid-cols-5 gap-1 sm:gap-2 text-center text-[10px] sm:text-xs">
                              {tripProgress.steps.map((step, sIdx) => {
                                const isDone = sIdx < tripProgress.currentStep
                                const isCurrent = sIdx === tripProgress.currentStep
                                return (
                                  <div key={sIdx} className="flex flex-col items-center gap-1">
                                    <div
                                      className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                        isDone
                                          ? 'bg-emerald-500 text-white shadow-sm'
                                          : isCurrent
                                          ? 'bg-brand-orange text-white ring-4 ring-brand-orange/20 animate-pulse shadow-md'
                                          : 'bg-white/10 text-gray-500 border border-white/20'
                                      }`}
                                    >
                                      {isDone ? '✓' : sIdx + 1}
                                    </div>
                                    <span className={`font-semibold leading-tight line-clamp-1 ${
                                      isDone ? 'text-emerald-400' : isCurrent ? 'text-brand-orange' : 'text-gray-500'
                                    }`}>
                                      {step.label}
                                    </span>
                                    <span className="text-[9px] text-gray-400 hidden sm:inline leading-none">
                                      {step.desc}
                                    </span>
                                  </div>
                                )
                              })}
                            </div>
                          </div>

                          {/* Smart Packing & Preparation Checklist */}
                          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-gray-300">
                            <span className="text-brand-gold font-semibold flex items-center gap-1">
                              <ShieldCheck className="w-3.5 h-3.5" /> Checklist:
                            </span>
                            {(((currentTrip as any)._checklist as string[]) || ['🪪 Valid Govt ID', '⏰ Reach 15m Early']).map((item: string, cIdx: number) => (
                              <span key={cIdx} className="bg-white/10 px-2 py-0.5 rounded-md border border-white/5">
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Action Buttons Right Column */}
                        <div className="flex flex-row lg:flex-col gap-2.5 w-full lg:w-48 shrink-0">
                          {tripPaid > 0 && (
                          <Button
                            onClick={() => {
                              const bId = currentTrip.id || 'DT-BOOKING'
                              const vData: BookingVoucherData = {
                                bookingId: bId,
                                bookingType: tripType as any,
                                title: tripTitle || 'Adventure Booking',
                                subtitle: currentTrip.package?.subtitle || currentTrip.subtitle || null,
                                category: currentTrip.package?.category || currentTrip.category || null,
                                guestName: currentTrip.fullName || currentTrip.name || user?.name || 'Traveler',
                                guestEmail: currentTrip.email || user?.email || '',
                                guestPhone: currentTrip.mobile || currentTrip.phone || user?.phone || '',
                                travelDate: tripDateStr,
                                pickupLocation: tripLocation || 'Rishikesh Reporting Point',
                                travelers: tripGuests || 1,
                                totalPrice: tripAmount || 0,
                                originalPrice: currentTrip.originalPrice ?? currentTrip.package?.originalPrice ?? null,
                                basePrice: currentTrip.basePrice ?? currentTrip.package?.price ?? null,
                                unitPrice: currentTrip.unitPrice ?? null,
                                couponDiscount: currentTrip.discountAmount || 0,
                                isHotel: !!(currentTrip.additionalNotes && typeof currentTrip.additionalNotes === 'string' && currentTrip.additionalNotes.includes('"isHotel":true')),
                                hotelBreakdown: (() => {
                                  try {
                                    if (currentTrip.additionalNotes && currentTrip.additionalNotes.includes('"isHotel":true')) {
                                      const p = JSON.parse(currentTrip.additionalNotes)
                                      return p.isHotel ? p : null
                                    }
                                  } catch {}
                                  return null
                                })(),
                                isCamping: !!(currentTrip.additionalNotes && typeof currentTrip.additionalNotes === 'string' && currentTrip.additionalNotes.includes('"isCamping":true')),
                                campingBreakdown: (() => {
                                  try {
                                    if (currentTrip.additionalNotes && currentTrip.additionalNotes.includes('"isCamping":true')) {
                                      const p = JSON.parse(currentTrip.additionalNotes)
                                      return p.isCamping ? p : null
                                    }
                                  } catch {}
                                  return null
                                })(),
                                amountPaid: tripPaid,
                                balanceDue: tripBalance,
                                paymentStatus: tripPaid >= tripAmount && tripAmount > 0 ? 'completed' : tripPaid > 0 ? 'partial' : 'pending',
                                status: tripStatus || 'confirmed',
                                createdAt: currentTrip.createdAt || new Date().toISOString(),
                              }
                              setVoucherData(vData)
                              setVoucherModalOpen(true)
                            }}
                            className="flex-1 lg:w-full bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold py-2.5 rounded-xl shadow-lg text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <Receipt className="w-4 h-4" />
                            <span>Download Ticket</span>
                          </Button>
                          )}
                          {tripPaid <= 0 && (
                            <p className="text-[11px] text-amber-700 mt-1 text-center">Ticket will be available after 10% advance payment.</p>
                          )}

                          <a
                            href={`https://wa.me/916396919007?text=${encodeURIComponent(`Hi Divine Travels Coordinator, I have an upcoming trip for "${tripTitle}" on ${tripDateStr}. Need reporting details / pickup assistance.`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 lg:w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-xl text-xs sm:text-sm shadow-md transition-colors text-center"
                          >
                            <MessageCircle className="w-4 h-4" />
                            <span>Trip Help (WhatsApp)</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

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

                  {/* Payment Requests Alert */}
                  {(paymentRequests as any[]).filter((pr: any) => pr.status === 'pending').length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                          <Clock className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="font-medium text-brand-dark text-sm">You have payment requests pending</p>
                          <p className="text-xs text-muted-foreground">Complete your balance payments to confirm bookings</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {(paymentRequests as any[]).filter((pr: any) => pr.status === 'pending').map((pr: any) => (
                          <div key={pr.id} className="flex items-center justify-between bg-white rounded-lg p-3 border border-amber-100">
                            <div>
                              <p className="text-sm font-medium text-brand-dark">{pr.bookingType}</p>
                              <p className="text-xs text-muted-foreground">Due: ₹{pr.balanceAmount}</p>
                            </div>
                            <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white h-8 text-xs" onClick={() => {
                              const bType = pr.bookingType === 'taxi' ? 'tour' : pr.bookingType === 'destination' ? 'destination' : pr.bookingType
                              fetch(`/api/booking-flow/${bType}/${pr.bookingId}/payments`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json', ...getAuthHeaders(), },
                                body: JSON.stringify({ method: 'online', payType: 'balance' }),
                              }).then(async (res) => {
                                if (!res.ok) { const d = await res.json(); toast.error(d.error || 'Payment failed'); return }
                                const payData = await res.json()
                                localStorage.setItem('dt_payment_id', payData.payment_id)
                                localStorage.setItem('dt_booking_id', pr.bookingId)
                                localStorage.setItem('dt_user_id', user?.id || '')
                                localStorage.setItem('dt_service', 'unified')
                                localStorage.setItem('dt_booking_type', bType)
                                localStorage.setItem('dt_pay_type', 'balance')
                                window.location.href = payData.payment_page
                              }).catch(() => toast.error('Failed to initiate payment'))
                            }}>
                              Pay ₹{pr.balanceAmount}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

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
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-brand-dark">Recent Bookings</h3>
                      {allBookings.length > 5 && (
                        <Button variant="ghost" size="sm" className="text-brand-orange" onClick={() => { sessionStorage.setItem('dt_dashboard_tab', 'package-bookings'); setActiveTab('package-bookings') }}>
                          View All
                        </Button>
                      )}
                    </div>
                    {allBookings.length === 0 ? (
                      <p className="text-muted-foreground text-sm">No bookings yet. Start exploring!</p>
                    ) : (
                      <div className="space-y-3">
                        {allBookings.slice(0, 5).map((booking: any) => {
                          const isDest = booking.destination && typeof booking.destination === 'object'
                          const isPkg = booking.package && typeof booking.package === 'object'
                          const isTaxi = !isDest && !isPkg && (booking.packageType?.startsWith('Taxi') || (typeof booking.adminNotes === 'string' && booking.adminNotes.includes('taxi-booking')))
                          let taxiRoute = ''
                          if (isTaxi && typeof booking.adminNotes === 'string') {
                            try {
                              const n = JSON.parse(booking.adminNotes)
                              if (n.pickupLocation && n.dropLocation) taxiRoute = `${n.pickupLocation} → ${n.dropLocation}`
                            } catch {}
                          }
                          const title = isDest ? booking.destination.name : isPkg ? booking.package.name : isTaxi ? 'Taxi Booking Inquiry' : (booking.packageType || booking.destination || 'Booking')
                          const img = isDest ? booking.destination.image : isPkg ? booking.package.image : undefined
                          const dateVal = isDest ? booking.checkIn : isPkg ? booking.preferredDate : booking.travelDate
                          const isAdvancePending = isPkg && booking.status === 'confirmed' && (booking.paymentStatus === 'pending' || !booking.paymentStatus)
                          const isAdvancePaid = isPkg && booking.status === 'confirmed' && booking.paymentStatus === 'advance_paid'
                          const isFullyPaid = isPkg && booking.paymentStatus === 'completed'
                          const statusBadge = booking.status === 'pending'
                            ? 'bg-amber-100 text-amber-700'
                            : booking.status === 'confirmed' || booking.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : booking.status === 'rejected'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-600'
                          return (
                            <div key={`${booking._bookingType || 'b'}-${booking.id}`} className="flex items-center gap-3 p-3 rounded-lg bg-brand-cream/50 hover:bg-brand-cream transition-colors">
                              <img src={img || '/placeholder.svg'} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm text-brand-dark truncate">{title}</p>
                                {taxiRoute && (
                                  <p className="text-[11px] text-muted-foreground truncate">{taxiRoute}</p>
                                )}
                                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                  {dateVal ? new Date(dateVal).toLocaleDateString() : '—'}
                                  <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${statusBadge}`}>
                                    {booking.status}
                                  </span>
                                </p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                {isAdvancePending && (
                                  <Button size="sm" className="bg-brand-orange hover:bg-brand-orange/90 text-white h-8 text-xs" onClick={(e) => { e.stopPropagation(); handlePayNow(booking) }}>
                                    <CreditCard className="w-3 h-3 mr-1" /> Pay ₹{Math.ceil((booking.totalPrice || 0) * 0.1).toLocaleString()} (10%)
                                  </Button>
                                )}
                                {isAdvancePaid && (
                                  <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white h-8 text-xs" onClick={(e) => {
                                    e.stopPropagation()
                                    const bType = booking._bookingType === 'dest' ? 'destination' : booking._bookingType === 'tour' || booking._bookingType === 'taxi' ? 'tour' : 'package'
                                    const total = booking.totalPrice || 0
                                    const paid = booking.paymentAmount || Math.ceil(total * 0.1)
                                    const balance = Math.max(0, total - paid)
                                    handlePayBalance(booking, bType)
                                  }}>
                                    <CreditCard className="w-3 h-3 mr-1" /> Pay ₹{Math.max(0, (booking.totalPrice || 0) - (booking.paymentAmount || Math.ceil((booking.totalPrice || 0) * 0.1))).toLocaleString()} (Balance)
                                  </Button>
                                )}
                                 {(isAdvancePaid || isFullyPaid) && (
                                 <Button
                                   size="sm"
                                   variant="outline"
                                   className="h-8 text-xs cursor-pointer border-brand-teal/30 hover:bg-brand-teal/10 text-brand-teal"
                                   onClick={(e) => {
                                     e.stopPropagation()
                                     const bType = booking._bookingType === 'dest' ? 'destination' : booking._bookingType === 'tour' || booking._bookingType === 'taxi' ? 'tour' : 'package'
                                     const total = booking.totalPrice || 0
                                     const paid = booking.paymentAmount || (isFullyPaid ? total : booking.paymentStatus === 'advance_paid' ? Math.ceil(total * 0.1) : 0)
                                     const balance = Math.max(0, total - paid)
                                     setVoucherData({
                                       bookingId: booking.id || 'DT-BOOKING',
                                       bookingType: bType,
                                       title: title || booking.package?.name || booking.destination?.name || 'Booking Voucher',
                                       guestName: booking.fullName || booking.name || user?.name || 'Valued Traveler',
                                       guestPhone: booking.mobile || booking.phone || user?.phone,
                                       guestEmail: user?.email,
                                       travelDate: dateVal ? new Date(dateVal).toLocaleDateString('en-IN') : '',
                                       travelers: booking.numberOfPeople || booking.travelers || booking.guests || 1,
                                       pickupLocation: booking.package?.location || booking.destination?.name || null,
                                       totalPrice: total,
                                       amountPaid: paid,
                                       balanceDue: balance,
                                       paymentStatus: booking.paymentStatus || 'pending',
                                       status: booking.status || 'pending',
                                       createdAt: booking.createdAt,
                                     })
                                     setVoucherModalOpen(true)
                                   }}
                                 >
                                   <Receipt className="w-3 h-3 mr-1" /> Receipt
                                 </Button>
                                 )}
                              </div>
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
                    <button onClick={() => setActiveTab('cart')} className="bg-gradient-to-r from-brand-orange to-brand-gold text-white rounded-xl p-5 text-left hover:shadow-lg transition-shadow">
                      <ShoppingCart className="w-6 h-6 mb-2" />
                      <h4 className="font-semibold">My Cart</h4>
                      <p className="text-white/80 text-sm mt-1">{cartItems.length} item{cartItems.length > 1 ? 's' : ''} added</p>
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

              {activeTab === 'tours' && (
                <motion.div key="tours" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <UserTourBookings />
                </motion.div>
              )}

              {activeTab === 'taxi' && (
                <motion.div key="taxi" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <UserTaxiBookings />
                </motion.div>
              )}

              {activeTab === 'wishlist' && (
                <motion.div key="wishlist" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <UserWishlist />
                </motion.div>
              )}

              {activeTab === 'cart' && (
                <motion.div key="cart" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <UserCartPanel navigate={navigate} />
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

              {activeTab === 'payment-requests' && (
                <motion.div key="payment-requests" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6">
                      <h3 className="font-serif text-xl text-brand-dark mb-4">Payment Requests</h3>
                      {(paymentRequests as any[]).length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">No payment requests. All clear!</p>
                      ) : (
                        <div className="space-y-4">
                          {(paymentRequests as any[]).map((pr: any) => (
                            <div key={pr.id} className={`border rounded-xl p-4 ${
                              pr.status === 'pending' ? 'border-amber-200 bg-amber-50/30' :
                              pr.status === 'paid' ? 'border-green-200 bg-green-50/30' :
                              'border-gray-200 bg-gray-50/30'
                            }`}>
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <p className="font-medium text-brand-dark">{pr.bookingType}</p>
                                  <p className="text-xs text-muted-foreground">Booking ID: {pr.bookingId}</p>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                  pr.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                  pr.status === 'paid' ? 'bg-green-100 text-green-700' :
                                  'bg-gray-100 text-gray-600'
                                }`}>
                                  {pr.status === 'pending' ? '⏳ Pending' : pr.status === 'paid' ? '✓ Paid' : 'Cancelled'}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm text-muted-foreground">
                                    Balance Due: <span className="font-bold text-brand-dark">₹{pr.balanceAmount}</span>
                                  </p>
                                  {pr.message && <p className="text-xs text-muted-foreground mt-1">{pr.message}</p>}
                                </div>
                                {pr.status === 'pending' && (
                                  <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white h-8 text-xs" onClick={() => {
                                    const bType = pr.bookingType === 'taxi' ? 'tour' : pr.bookingType === 'destination' ? 'destination' : pr.bookingType
                                    fetch(`/api/booking-flow/${bType}/${pr.bookingId}/payments`, {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json', ...getAuthHeaders(), },
                                      body: JSON.stringify({ method: 'online', payType: 'balance' }),
                                    }).then(async (res) => {
                                      if (!res.ok) { const d = await res.json(); toast.error(d.error || 'Payment failed'); return }
                                      const payData = await res.json()
                                      localStorage.setItem('dt_payment_id', payData.payment_id)
                                      localStorage.setItem('dt_booking_id', pr.bookingId)
                                      localStorage.setItem('dt_user_id', user?.id || '')
                                      localStorage.setItem('dt_service', 'unified')
                                      localStorage.setItem('dt_booking_type', bType)
                                      localStorage.setItem('dt_pay_type', 'balance')
                                      window.location.href = payData.payment_page
                                    }).catch(() => toast.error('Failed to initiate payment'))
                                  }}>
                                    Pay Now
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
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

      {/* Global Booking Voucher / Receipt Modal */}
      <BookingVoucherModal
        isOpen={!!voucherData}
        onClose={() => {
          setVoucherData(null)
          setVoucherModalOpen(false)
        }}
        booking={voucherData}
      />
    </div>
  )
}
