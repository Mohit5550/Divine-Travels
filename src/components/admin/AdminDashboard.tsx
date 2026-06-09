'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  MapPin,
  CalendarCheck,
  Users,
  LogOut,
  Compass,
  ChevronLeft,
  Menu,
  Package,
  Waves,
  Mountain,
  Bike,
  Car,
  Globe,
  Map,
  Landmark,
  Star,
  Settings,
  Mail,
  Ticket,
  Image,
  FileText,
  Bed,
  Tent,
  Camera,
  ChevronDown,
  ChevronRight,
  Building2,
  Bell,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AdminOverview } from './AdminOverview'
import { AdminDestinations } from './AdminDestinations'
import { AdminBookings } from './AdminBookings'
import { AdminUsers } from './AdminUsers'
import { AdminPackages } from './AdminPackages'
import { AdminPackageBookings } from './AdminPackageBookings'
import { AdminReviews } from './AdminReviews'
import { AdminSettings } from './AdminSettings'
import { AdminInquiries } from './AdminInquiries'
import { AdminCoupons } from './AdminCoupons'
import { AdminMedia } from './AdminMedia'
import { AdminReports } from './AdminReports'
import { AdminTourBookings } from './AdminTourBookings'
import { AdminTourDestinations } from './AdminTourDestinations'
import { AdminAvailability } from './AdminAvailability'
import { AdminNotificationBell } from './AdminNotificationBell'
import { AdminGallery } from './AdminGallery'
import { AdminTaxiBookings } from './AdminTaxiBookings'
import { AdminCompanyPlans } from './AdminCompanyPlans'
import { AdminHeroNotices } from './AdminHeroNotices'
import { AdminBookingsPanel } from './AdminBookingsPanel'

export type AdminTab = 'overview' | 'destinations' | 'bookings' | 'users' | 'packages'
  | 'svc-rafting' | 'svc-trekking' | 'svc-adventure' | 'svc-bike-rental' | 'svc-taxi-booking'
  | 'svc-domestic-tours' | 'svc-spiritual-tours' | 'svc-international-tours'
  | 'svc-hotel-packages' | 'svc-camping-packages'
  | 'reviews' | 'settings' | 'inquiries' | 'coupons' | 'media' | 'gallery' | 'reports'
  | 'tour-bookings' | 'tour-destinations' | 'availability'   | 'company-plans' | 'hero-notices'
  | 'bkg-rafting' | 'bkg-trekking' | 'bkg-adventure' | 'bkg-bike-rental' | 'bkg-taxi'
  | 'bkg-domestic-tours' | 'bkg-spiritual-tours' | 'bkg-international-tours'
  | 'bkg-stay-hotel' | 'bkg-stay-camping' | 'bkg-tour'

const mainTabs = [
  { id: 'overview' as AdminTab, label: 'Overview', icon: LayoutDashboard },
  { id: 'destinations' as AdminTab, label: 'Destinations', icon: MapPin },
  { id: 'users' as AdminTab, label: 'Users', icon: Users },
  { id: 'reviews' as AdminTab, label: 'Reviews', icon: Star },
  { id: 'inquiries' as AdminTab, label: 'Inquiries', icon: Mail },
  { id: 'coupons' as AdminTab, label: 'Coupons', icon: Ticket },
  { id: 'media' as AdminTab, label: 'Media', icon: Image },
  { id: 'gallery' as AdminTab, label: 'Gallery', icon: Camera },
  { id: 'settings' as AdminTab, label: 'Settings', icon: Settings },
  { id: 'reports' as AdminTab, label: 'Reports', icon: FileText },
  { id: 'tour-destinations' as AdminTab, label: 'Tour Content', icon: Map },
  { id: 'availability' as AdminTab, label: 'Availability', icon: CalendarCheck },
  { id: 'company-plans' as AdminTab, label: 'Company Plans', icon: Building2 },
  { id: 'hero-notices' as AdminTab, label: 'Hero Notices', icon: Bell },
]

const bookingSubTabs = [
  { id: 'bkg-bike-rental' as AdminTab, label: 'Bike Rental', icon: Bike, serviceType: 'package' as const, category: 'bike-rental', color: 'bg-orange-600' },
  { id: 'bkg-rafting' as AdminTab, label: 'Rafting', icon: Waves, serviceType: 'package' as const, category: 'rafting', color: 'bg-blue-500' },
  { id: 'bkg-trekking' as AdminTab, label: 'Trekking', icon: Mountain, serviceType: 'package' as const, category: 'trekking', color: 'bg-emerald-500' },
  { id: 'bkg-adventure' as AdminTab, label: 'Adventure', icon: Package, serviceType: 'package' as const, category: 'adventure', color: 'bg-red-500' },
  { id: 'bkg-taxi' as AdminTab, label: 'Taxi', icon: Car, serviceType: 'taxi' as const, color: 'bg-amber-500' },
  { id: 'bkg-domestic-tours' as AdminTab, label: 'Domestic Tours', icon: Map, serviceType: 'package' as const, category: 'domestic-tours', color: 'bg-teal-500' },
  { id: 'bkg-spiritual-tours' as AdminTab, label: 'Spiritual Tours', icon: Landmark, serviceType: 'package' as const, category: 'spiritual-tours', color: 'bg-amber-600' },
  { id: 'bkg-international-tours' as AdminTab, label: 'International', icon: Globe, serviceType: 'package' as const, category: 'international-tours', color: 'bg-indigo-500' },
  { id: 'bkg-stay-hotel' as AdminTab, label: 'Hotel', icon: Bed, serviceType: 'package' as const, category: 'stay-hotel', color: 'bg-amber-600' },
  { id: 'bkg-stay-camping' as AdminTab, label: 'Camping', icon: Tent, serviceType: 'package' as const, category: 'stay-camping', color: 'bg-emerald-600' },
  { id: 'bkg-tour' as AdminTab, label: 'Day Tours', icon: CalendarCheck, serviceType: 'tour' as const, color: 'bg-brand-orange' },
]

const bookingCountKeys: Record<string, string> = {
  'bkg-bike-rental': 'package-bike-rental',
  'bkg-rafting': 'package-rafting',
  'bkg-trekking': 'package-trekking',
  'bkg-adventure': 'package-adventure',
  'bkg-taxi': 'taxi',
  'bkg-domestic-tours': 'package-domestic-tours',
  'bkg-spiritual-tours': 'package-spiritual-tours',
  'bkg-international-tours': 'package-international-tours',
  'bkg-stay-hotel': 'package-stay-hotel',
  'bkg-stay-camping': 'package-stay-camping',
  'bkg-tour': 'tour',
}

const serviceTabs = [
  { id: 'svc-rafting' as AdminTab, label: 'Rafting', icon: Waves, color: 'bg-blue-500' },
  { id: 'svc-trekking' as AdminTab, label: 'Trekking', icon: Mountain, color: 'bg-emerald-500' },
  { id: 'svc-adventure' as AdminTab, label: 'Adventure', icon: Compass, color: 'bg-red-500' },
  { id: 'svc-bike-rental' as AdminTab, label: 'Bike Rental', icon: Bike, color: 'bg-orange-600' },
  { id: 'svc-taxi-booking' as AdminTab, label: 'Taxi Booking', icon: Car, color: 'bg-amber-500' },
  { id: 'svc-domestic-tours' as AdminTab, label: 'Domestic Tours', icon: Map, color: 'bg-teal-500' },
  { id: 'svc-spiritual-tours' as AdminTab, label: 'Spiritual Tours', icon: Landmark, color: 'bg-amber-600' },
  { id: 'svc-international-tours' as AdminTab, label: 'International', icon: Globe, color: 'bg-indigo-500' },
  { id: 'svc-hotel-packages' as AdminTab, label: 'Hotel Packages', icon: Bed, color: 'bg-amber-600' },
  { id: 'svc-camping-packages' as AdminTab, label: 'Camping Packages', icon: Tent, color: 'bg-emerald-600' },
]

const categoryFromTab: Record<string, string> = {
  'svc-rafting': 'rafting',
  'svc-trekking': 'trekking',
  'svc-adventure': 'adventure',
  'svc-bike-rental': 'bike-rental',
  'svc-taxi-booking': 'taxi-booking',
  'svc-domestic-tours': 'domestic-tours',
  'svc-spiritual-tours': 'spiritual-tours',
  'svc-international-tours': 'international-tours',
  'svc-hotel-packages': 'stay-hotel',
  'svc-camping-packages': 'stay-camping',
}

interface SidebarContentProps {
  user: { name?: string; email?: string } | null
  sidebarCollapsed: boolean
  activeTab: AdminTab
  setActiveTab: (tab: AdminTab) => void
  setMobileMenuOpen: (open: boolean) => void
  navigate: (view: string) => void
  logout: () => void
  bookingsExpanded: boolean
  setBookingsExpanded: (v: boolean) => void
  bookingCounts: Record<string, number>
  searchParams?: string
}

function SidebarContent({ user, sidebarCollapsed, activeTab, setActiveTab, setMobileMenuOpen, navigate, logout, bookingsExpanded, setBookingsExpanded, bookingCounts }: SidebarContentProps) {
  const totalPending = Object.values(bookingCounts).reduce((a, b) => a + b, 0)

  return (
    <>
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-orange flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">{user?.name?.charAt(0)}</span>
          </div>
          {!sidebarCollapsed && (
            <div className="min-w-0">
              <h3 className="font-semibold text-white text-sm truncate">{user?.name}</h3>
              <p className="text-white/50 text-xs truncate">{user?.email}</p>
              <span className="inline-flex items-center text-[10px] bg-brand-orange/20 text-brand-orange px-1.5 py-0.5 rounded mt-1">
                Admin
              </span>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto custom-scrollbar">
        {/* Bookings Collapsible */}
        <div>
          <button
            onClick={() => setBookingsExpanded(!bookingsExpanded)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab.startsWith('bkg-')
                ? 'bg-brand-orange/20 text-brand-orange'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <div className="relative flex-shrink-0">
              <CalendarCheck className="w-4 h-4" />
              {totalPending > 0 && (
                <span className="absolute -top-1.5 -right-1.5 inline-flex items-center justify-center min-w-[14px] h-3.5 px-1 rounded-full bg-red-500 text-white text-[8px] font-bold leading-none">
                  {totalPending > 9 ? '9+' : totalPending}
                </span>
              )}
            </div>
            {!sidebarCollapsed && (
              <>
                <span className="flex-1 text-left">Bookings</span>
                {bookingsExpanded ? <ChevronDown className="w-3 h-3 text-white/40" /> : <ChevronRight className="w-3 h-3 text-white/40" />}
              </>
            )}
          </button>

          {!sidebarCollapsed && bookingsExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pl-2 mt-0.5 space-y-0.5 border-l border-white/10 ml-[18px]">
                {bookingSubTabs.map((tab) => {
                  const Icon = tab.icon
                  const countKey = bookingCountKeys[tab.id]
                  const count = countKey ? bookingCounts[countKey] || 0 : 0
                  return (
                    <button
                      key={tab.id}
                      onClick={() => { setActiveTab(tab.id); setMobileMenuOpen(false) }}
                      className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'bg-brand-orange/20 text-brand-orange'
                          : 'text-white/60 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <div className={`w-3.5 h-3.5 rounded ${tab.color || 'bg-gray-500'} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-2.5 h-2.5 text-white" />
                      </div>
                      <span className="flex-1 text-left truncate">{tab.label}</span>
                      {count > 0 && (
                        <span className="flex-shrink-0 inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold leading-none">
                          {count}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}
        </div>

        {/* Main Tabs */}
        {mainTabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setMobileMenuOpen(false) }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-brand-orange text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!sidebarCollapsed && tab.label}
            </button>
          )
        })}

        {!sidebarCollapsed && (
          <div className="pt-3 pb-1 px-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40">Services</p>
          </div>
        )}

        {serviceTabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setMobileMenuOpen(false) }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-brand-orange text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className={`w-4 h-4 rounded ${tab.color} flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-3 h-3 text-white" />
              </div>
              {!sidebarCollapsed && tab.label}
            </button>
          )
        })}
      </nav>

      <div className="p-3 border-t border-white/10 space-y-1">
        <button
          onClick={() => navigate('landing')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-colors"
        >
          <Compass className="w-4 h-4 flex-shrink-0" />
          {!sidebarCollapsed && 'View Site'}
        </button>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!sidebarCollapsed && 'Logout'}
        </button>
      </div>
    </>
  )
}

export function AdminDashboard() {
  const { user, logout, navigate } = useAppStore()
  const [activeTab, setActiveTab] = useState<AdminTab>('overview')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [bookingsExpanded, setBookingsExpanded] = useState(true)

  const { data: countsData } = useQuery({
    queryKey: ['admin-booking-counts', user?.id],
    queryFn: async () => {
      const res = await fetch('/api/admin/booking-counts', {
        headers: { 'x-user-id': user?.id || '' },
      })
      if (!res.ok) return { counts: {} }
      const data = await res.json()
      return data as { counts: Record<string, number> }
    },
    refetchInterval: 10000,
  })

  const bookingCounts = countsData?.counts || {}

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <AdminOverview />
      case 'destinations':
        return <AdminDestinations />
      case 'bookings':
        return <AdminBookings />
      case 'packages':
        return <AdminPackages />
      case 'users':
        return <AdminUsers />
      case 'reviews':
        return <AdminReviews />
      case 'settings':
        return <AdminSettings />
      case 'inquiries':
        return <AdminInquiries />
      case 'coupons':
        return <AdminCoupons />
      case 'media':
        return <AdminMedia />
      case 'gallery':
        return <AdminGallery />
      case 'reports':
        return <AdminReports />
      case 'tour-bookings':
        return <AdminTourBookings />
      case 'tour-destinations':
        return <AdminTourDestinations />
      case 'availability':
        return <AdminAvailability />
      case 'company-plans':
        return <AdminCompanyPlans />
      case 'hero-notices':
        return <AdminHeroNotices />

      // Booking sub-tabs
      case 'bkg-rafting':
        return <AdminBookingsPanel serviceType="package" category="rafting" />
      case 'bkg-trekking':
        return <AdminBookingsPanel serviceType="package" category="trekking" />
      case 'bkg-adventure':
        return <AdminBookingsPanel serviceType="package" category="adventure" />
      case 'bkg-bike-rental':
        return <AdminBookingsPanel serviceType="package" category="bike-rental" />
      case 'bkg-domestic-tours':
        return <AdminBookingsPanel serviceType="package" category="domestic-tours" />
      case 'bkg-spiritual-tours':
        return <AdminBookingsPanel serviceType="package" category="spiritual-tours" />
      case 'bkg-international-tours':
        return <AdminBookingsPanel serviceType="package" category="international-tours" />
      case 'bkg-stay-hotel':
        return <AdminBookingsPanel serviceType="package" category="stay-hotel" />
      case 'bkg-stay-camping':
        return <AdminBookingsPanel serviceType="package" category="stay-camping" />
      case 'bkg-taxi':
        return <AdminBookingsPanel serviceType="taxi" />
      case 'bkg-tour':
        return <AdminBookingsPanel serviceType="tour" />

      default:
        if (activeTab.startsWith('svc-')) {
          const category = categoryFromTab[activeTab]
          if (category) {
            return <AdminPackages categoryFilter={category} />
          }
        }
        return <AdminOverview />
    }
  }

  return (
    <div className="min-h-screen bg-brand-cream flex">
      <div
        className={`hidden lg:flex flex-col bg-brand-dark transition-all duration-300 ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div className="p-4 flex items-center justify-between border-b border-white/10">
          {!sidebarCollapsed && (
            <img
              src="/logo.png?v=2"
              alt="Divine Travel"
              className="h-9 w-auto object-contain"
              draggable={false}
            />
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <ChevronLeft className={`w-4 h-4 text-white transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
        <SidebarContent
          user={user}
          sidebarCollapsed={sidebarCollapsed}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setMobileMenuOpen={setMobileMenuOpen}
          navigate={navigate}
          logout={logout}
          bookingsExpanded={bookingsExpanded}
          setBookingsExpanded={setBookingsExpanded}
          bookingCounts={bookingCounts}
        />
      </div>

      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="bg-brand-dark text-white rounded-lg w-10 h-10 p-0"
        >
          <Menu className="w-5 h-5" />
        </Button>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="w-64 h-full bg-brand-dark flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-white/10">
                <img
                  src="/logo.png?v=2"
                  alt="Divine Travel"
className="h-9 w-auto object-contain"
                  draggable={false}
                />
              </div>
              <SidebarContent
                user={user}
                sidebarCollapsed={false}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                setMobileMenuOpen={setMobileMenuOpen}
                navigate={navigate}
                logout={logout}
                bookingsExpanded={bookingsExpanded}
                setBookingsExpanded={setBookingsExpanded}
                bookingCounts={bookingCounts}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 min-w-0 overflow-auto">
        <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-end gap-3 shadow-sm">
          <AdminNotificationBell />
          <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
            <div className="w-8 h-8 rounded-full bg-brand-orange flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-brand-dark leading-tight">{user?.name}</p>
              <p className="text-[10px] text-muted-foreground leading-tight">Admin</p>
            </div>
          </div>
        </div>
        <div className="p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
