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
import { RaftingPackages } from '@/components/rafting/RaftingPackages'
import { PackageDetail } from '@/components/package/PackageDetail'
import { PackageBookingForm } from '@/components/package/PackageBookingForm'
import { useState } from 'react'

export default function Home() {
  const { currentView, navigate } = useAppStore()
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const handleCategoryChange = (category: string) => {
    if (category === 'rafting') {
      navigate('rafting-packages')
    } else {
      setActiveCategory(category)
    }
  }

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
      case 'rafting-packages':
        return <RaftingPackages />
      case 'package-detail':
        return <PackageDetail />
      case 'package-booking':
        return <PackageBookingForm />
      case 'landing':
      default:
        return (
          <>
            <Navbar />
            <HeroBanner />
            <ActivityBar activeCategory={activeCategory} onCategoryChange={handleCategoryChange} />
            <DestinationGrid activeCategory={activeCategory} searchQuery={searchQuery} />
            <WhyChooseUs />
            <Testimonials />
            <CTABanner />
            <Footer />
          </>
        )
    }
  }

  // Views that should NOT show the Navbar
  const hideNavbarViews = ['admin-dashboard', 'landing', 'rafting-packages', 'package-detail', 'package-booking']

  return (
    <main className="min-h-screen flex flex-col">
      {!hideNavbarViews.includes(currentView) && <Navbar />}

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
