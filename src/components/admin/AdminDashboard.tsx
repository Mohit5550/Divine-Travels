'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
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

export type AdminTab = 'overview' | 'destinations' | 'bookings' | 'users' | 'packages' | 'package-bookings'
  | 'svc-rafting' | 'svc-trekking' | 'svc-adventure' | 'svc-bike-rental' | 'svc-taxi-booking'
  | 'svc-domestic-tours' | 'svc-spiritual-tours' | 'svc-international-tours'
  | 'svc-hotel-packages' | 'svc-camping-packages'
  | 'reviews' | 'settings' | 'inquiries' | 'coupons' | 'media' | 'reports'
  | 'tour-bookings' | 'tour-destinations' | 'availability'

const mainTabs = [
  { id: 'overview' as AdminTab, label: 'Overview', icon: LayoutDashboard },
  { id: 'destinations' as AdminTab, label: 'Destinations', icon: MapPin },
  { id: 'bookings' as AdminTab, label: 'Bookings', icon: CalendarCheck },
  { id: 'package-bookings' as AdminTab, label: 'Pkg Bookings', icon: Waves },
  { id: 'users' as AdminTab, label: 'Users', icon: Users },
  { id: 'reviews' as AdminTab, label: 'Reviews', icon: Star },
  { id: 'inquiries' as AdminTab, label: 'Inquiries', icon: Mail },
  { id: 'coupons' as AdminTab, label: 'Coupons', icon: Ticket },
  { id: 'media' as AdminTab, label: 'Media', icon: Image },
  { id: 'settings' as AdminTab, label: 'Settings', icon: Settings },
  { id: 'reports' as AdminTab, label: 'Reports', icon: FileText },
  { id: 'tour-bookings' as AdminTab, label: 'Tour Bookings', icon: CalendarCheck },
  { id: 'tour-destinations' as AdminTab, label: 'Tour Content', icon: Map },
  { id: 'availability' as AdminTab, label: 'Availability', icon: CalendarCheck },
]

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
}

function SidebarContent({ user, sidebarCollapsed, activeTab, setActiveTab, setMobileMenuOpen, navigate, logout }: SidebarContentProps) {
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

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar">
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
      case 'package-bookings':
        return <AdminPackageBookings />
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
      case 'reports':
        return <AdminReports />
      case 'tour-bookings':
        return <AdminTourBookings />
      case 'tour-destinations':
        return <AdminTourDestinations />
      case 'availability':
        return <AdminAvailability />

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
            <span className="font-serif text-lg text-white">Divine Travel</span>
          )}
          <div className="flex items-center gap-2">
            <AdminNotificationBell />
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
                <span className="font-serif text-lg text-white">Divine Travel</span>
              </div>
              <SidebarContent
                user={user}
                sidebarCollapsed={false}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                setMobileMenuOpen={setMobileMenuOpen}
                navigate={navigate}
                logout={logout}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 min-w-0 overflow-auto">
        <div className="p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
