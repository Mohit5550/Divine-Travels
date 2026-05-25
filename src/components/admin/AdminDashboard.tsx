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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AdminOverview } from './AdminOverview'
import { AdminDestinations } from './AdminDestinations'
import { AdminBookings } from './AdminBookings'
import { AdminUsers } from './AdminUsers'
import { AdminPackages } from './AdminPackages'
import { AdminPackageBookings } from './AdminPackageBookings'

type AdminTab = 'overview' | 'destinations' | 'bookings' | 'users' | 'packages' | 'package-bookings'

const tabs = [
  { id: 'overview' as AdminTab, label: 'Overview', icon: LayoutDashboard },
  { id: 'destinations' as AdminTab, label: 'Destinations', icon: MapPin },
  { id: 'bookings' as AdminTab, label: 'Bookings', icon: CalendarCheck },
  { id: 'packages' as AdminTab, label: 'Packages', icon: Package },
  { id: 'package-bookings' as AdminTab, label: 'Pkg Bookings', icon: Waves },
  { id: 'users' as AdminTab, label: 'Users', icon: Users },
]

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
        {tabs.map((tab) => {
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
      default:
        return <AdminOverview />
    }
  }

  return (
    <div className="min-h-screen bg-brand-cream flex">
      {/* Desktop Sidebar */}
      <div
        className={`hidden lg:flex flex-col bg-brand-dark transition-all duration-300 ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div className="p-4 flex items-center justify-between border-b border-white/10">
          {!sidebarCollapsed && (
            <span className="font-serif text-lg text-white">Divine Travel</span>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <ChevronLeft className={`w-4 h-4 text-white transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} />
          </button>
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

      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="bg-brand-dark text-white rounded-lg w-10 h-10 p-0"
        >
          <Menu className="w-5 h-5" />
        </Button>
      </div>

      {/* Mobile Sidebar */}
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

      {/* Main Content */}
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
