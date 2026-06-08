'use client'

import { useAppStore } from '@/lib/store'
import { AnimatePresence, motion } from 'framer-motion'
import { Navbar } from '@/components/landing/Navbar'
import { ActivityBar } from '@/components/landing/ActivityBar'
import { HeroBanner } from '@/components/landing/HeroBanner'
import { DestinationCarousel } from '@/components/landing/DestinationCarousel'
import { TopDestinations } from '@/components/landing/TopDestinations'
import { CompanySection } from '@/components/landing/CompanySection'
import { StaySection } from '@/components/landing/StaySection'
import { CTABanner } from '@/components/landing/CTABanner'
import { TestimonialsSection } from '@/components/landing/TestimonialsSection'
import { PartnersSection } from '@/components/landing/PartnersSection'
import { SocialCTASection } from '@/components/landing/SocialCTASection'
import { Footer } from '@/components/landing/Footer'
import { UserDashboard } from '@/components/user/UserDashboard'
import { AdminDashboard } from '@/components/admin/AdminDashboard'
import { DestinationDetail } from '@/components/destination/DestinationDetail'
import { BookingSuccess } from '@/components/booking/BookingSuccess'
import { RaftingPackages } from '@/components/rafting/RaftingPackages'
import { BikePackages } from '@/components/bike-rental/BikePackages'
import { TaxiPackages } from '@/components/taxi-booking/TaxiPackages'
import { TaxiBookingForm } from '@/components/taxi-booking/TaxiBookingForm'
import { TrekkingPackages } from '@/components/trekking/TrekkingPackages'
import { AdventurePackages } from '@/components/adventure/AdventurePackages'
import { DomesticPackages } from '@/components/domestic/DomesticPackages'
import { SpiritualPackages } from '@/components/spiritual/SpiritualPackages'
import { InternationalPackages } from '@/components/international/InternationalPackages'
import { GalleryPage } from '@/components/gallery/GalleryPage'
import { RishikeshTour } from '@/components/tours/RishikeshTour'
import { HaridwarTour } from '@/components/tours/HaridwarTour'
import { MussoorieTour } from '@/components/tours/MussoorieTour'
import { NainitalTour } from '@/components/tours/NainitalTour'
import { HillStationsTour } from '@/components/tours/HillStationsTour'
import { CharDhamTour } from '@/components/tours/CharDhamTour'
import { HotelPackages } from '@/components/stay/HotelPackages'
import { CampingPackages } from '@/components/stay/CampingPackages'
import { PackageDetail } from '@/components/package/PackageDetail'
import { PackageBookingForm } from '@/components/package/PackageBookingForm'
import { AboutUs } from '@/components/pages/AboutUs'
import { Contact } from '@/components/pages/Contact'
import { CompanyDetail } from '@/components/company/CompanyDetail'
import { PrivacyPolicy } from '@/components/pages/PrivacyPolicy'
import { TermsOfService } from '@/components/pages/TermsOfService'
import { RefundPolicy } from '@/components/pages/RefundPolicy'
import { CancellationPolicy } from '@/components/pages/CancellationPolicy'

export default function Home() {
  const { currentView, navigate } = useAppStore()

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
      case 'bike-rental':
        return <BikePackages />
      case 'taxi-booking':
        return <TaxiPackages />
      case 'taxi-booking-form':
        return <TaxiBookingForm />
      case 'trekking':
        return <TrekkingPackages />
      case 'adventure':
        return <AdventurePackages />
      case 'domestic-tours':
        return <DomesticPackages />
      case 'spiritual-tours':
        return <SpiritualPackages />
      case 'international-tours':
        return <InternationalPackages />
      case 'gallery':
        return <GalleryPage />
      case 'rishikesh-tour':
        return <RishikeshTour />
      case 'haridwar-tour':
        return <HaridwarTour />
      case 'mussoorie-tour':
        return <MussoorieTour />
      case 'nainital-tour':
        return <NainitalTour />
      case 'hill-stations-tour':
        return <HillStationsTour />
      case 'char-dham-tour':
        return <CharDhamTour />
      case 'hotel-packages':
        return <HotelPackages />
      case 'camping-packages':
        return <CampingPackages />
      case 'package-detail':
        return <PackageDetail />
      case 'package-booking':
        return <PackageBookingForm />
      case 'about-us':
        return <AboutUs />
      case 'contact':
        return <Contact />
      case 'company-detail':
        return <CompanyDetail />
      case 'privacy-policy':
        return <PrivacyPolicy />
      case 'terms-of-service':
        return <TermsOfService />
      case 'refund-policy':
        return <RefundPolicy />
      case 'cancellation-policy':
        return <CancellationPolicy />
      case 'landing':
      default:
        return (
          <>
            <Navbar />
            <ActivityBar />
            <HeroBanner />
            <DestinationCarousel />
            <CompanySection />
            <TopDestinations />
            <StaySection />
            <TestimonialsSection />
            <PartnersSection />
            <SocialCTASection />
            <CTABanner />
            <Footer />
          </>
        )
    }
  }

  // Views that should NOT show the Navbar (handled internally)
  const hideNavbarViews = ['admin-dashboard', 'rafting-packages', 'bike-rental', 'taxi-booking', 'taxi-booking-form', 'trekking', 'adventure', 'domestic-tours', 'spiritual-tours', 'international-tours', 'gallery', 'rishikesh-tour', 'haridwar-tour', 'mussoorie-tour', 'nainital-tour', 'hill-stations-tour', 'char-dham-tour', 'hotel-packages', 'camping-packages', 'company-detail']

  return (
    <main className="min-h-screen flex flex-col">
      {!hideNavbarViews.includes(currentView) && currentView !== 'landing' && <Navbar />}

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
