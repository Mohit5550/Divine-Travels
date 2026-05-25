'use client'

import { useAppStore } from '@/lib/store'
import { AnimatePresence, motion } from 'framer-motion'
import { Navbar } from '@/components/landing/Navbar'
import { ActivityBar } from '@/components/landing/ActivityBar'
import { HeroBanner } from '@/components/landing/HeroBanner'
import { DestinationGrid } from '@/components/landing/DestinationGrid'
import { WhyChooseUs } from '@/components/landing/WhyChooseUs'
import { Testimonials } from '@/components/landing/Testimonials'
import { CTABanner } from '@/components/landing/CTABanner'
import { Footer } from '@/components/landing/Footer'
import { UserDashboard } from '@/components/user/UserDashboard'
import { AdminDashboard } from '@/components/admin/AdminDashboard'
import { DestinationDetail } from '@/components/destination/DestinationDetail'
import { BookingSuccess } from '@/components/booking/BookingSuccess'
import { useState } from 'react'

export default function Home() {
  const { currentView } = useAppStore()
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const renderView = () => {
    switch (currentView) {
      case 'user-dashboard':
        return <UserDashboard />
      case 'admin-dashboard':
        return <AdminDashboard />
      case 'destination-detail':
        return <DestinationDetail />
      case 'booking-success':
        return <BookingSuccess />
      case 'landing':
      default:
        return (
          <>
            <Navbar />
            <HeroBanner />
            <ActivityBar activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
            <DestinationGrid activeCategory={activeCategory} searchQuery={searchQuery} />
            <WhyChooseUs />
            <Testimonials />
            <CTABanner />
            <Footer />
          </>
        )
    }
  }

  return (
    <main className="min-h-screen flex flex-col">
      {/* Show Navbar on non-admin views */}
      {currentView !== 'admin-dashboard' && currentView !== 'landing' && (
        <Navbar />
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={currentView}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="flex-1"
        >
          {renderView()}
        </motion.div>
      </AnimatePresence>
    </main>
  )
}
