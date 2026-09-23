'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { lazyView } from '@/lib/lazy-retry'
import { useAppStore } from '@/lib/store'
import { useCart } from '@/lib/cart'
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
import { DestinationDetail } from '@/components/destination/DestinationDetail'
import { BookingSuccess } from '@/components/booking/BookingSuccess'
import { AboutUs } from '@/components/pages/AboutUs'
import { Contact } from '@/components/pages/Contact'
import { BlogSection } from '@/components/landing/BlogSection'
import { CompanyDetail } from '@/components/company/CompanyDetail'
import { PrivacyPolicy } from '@/components/pages/PrivacyPolicy'
import { BlogArchive } from '@/components/blog/BlogArchive'
import { BlogSingle } from '@/components/blog/BlogSingle'
import { HotelDetail } from '@/components/hotel/HotelDetail'
import { TermsOfService } from '@/components/pages/TermsOfService'
import { RefundPolicy } from '@/components/pages/RefundPolicy'
import { CancellationPolicy } from '@/components/pages/CancellationPolicy'
import { CookiePolicy } from '@/components/pages/CookiePolicy'
import { WhatsAppWidget } from '@/components/ui/WhatsAppWidget'
import { CookieConsent } from '@/components/ui/CookieConsent'
import { TrustGuarantee } from '@/components/landing/TrustGuarantee'
import { FAQSection } from '@/components/landing/FAQSection'
import { CreatorCollaborationPage } from '@/components/landing/CreatorCollaborationPage'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { BootSplash } from '@/components/ui/BootSplash'
import { ViewLoader } from '@/components/ui/ViewLoader'

const UserDashboard = lazyView(() => import('@/components/user/UserDashboard'), 'UserDashboard')
const AdminDashboard = lazyView(() => import('@/components/admin/AdminDashboard'), 'AdminDashboard')
const RaftingPackages = lazyView(() => import('@/components/rafting/RaftingPackages'), 'RaftingPackages')
const BikePackages = lazyView(() => import('@/components/bike-rental/BikePackages'), 'BikePackages')
const TaxiPackages = lazyView(() => import('@/components/taxi-booking/TaxiPackages'), 'TaxiPackages')
const TaxiBookingForm = lazyView(() => import('@/components/taxi-booking/TaxiBookingForm'), 'TaxiBookingForm')
const TrekkingPackages = lazyView(() => import('@/components/trekking/TrekkingPackages'), 'TrekkingPackages')
const AdventurePackages = lazyView(() => import('@/components/adventure/AdventurePackages'), 'AdventurePackages')
const DomesticPackages = lazyView(() => import('@/components/domestic/DomesticPackages'), 'DomesticPackages')
const SpiritualPackages = lazyView(() => import('@/components/spiritual/SpiritualPackages'), 'SpiritualPackages')
const InternationalPackages = lazyView(() => import('@/components/international/InternationalPackages'), 'InternationalPackages')
const GalleryPage = lazyView(() => import('@/components/gallery/GalleryPage'), 'GalleryPage')
const RishikeshTour = lazyView(() => import('@/components/tours/RishikeshTour'), 'RishikeshTour')
const HaridwarTour = lazyView(() => import('@/components/tours/HaridwarTour'), 'HaridwarTour')
const MussoorieTour = lazyView(() => import('@/components/tours/MussoorieTour'), 'MussoorieTour')
const NainitalTour = lazyView(() => import('@/components/tours/NainitalTour'), 'NainitalTour')
const HillStationsTour = lazyView(() => import('@/components/tours/HillStationsTour'), 'HillStationsTour')
const CharDhamTour = lazyView(() => import('@/components/tours/CharDhamTour'), 'CharDhamTour')
const HotelPackages = lazyView(() => import('@/components/stay/HotelPackages'), 'HotelPackages')
const CampingPackages = lazyView(() => import('@/components/stay/CampingPackages'), 'CampingPackages')
const PackageDetail = lazyView(() => import('@/components/package/PackageDetail'), 'PackageDetail')
const PackageBookingForm = lazyView(() => import('@/components/package/PackageBookingForm'), 'PackageBookingForm')

const selfContainedViews = [
  'admin-dashboard', 'company-detail', 'collaborate', 'cookie-policy',
  'rafting-packages', 'bike-rental', 'taxi-booking', 'taxi-booking-form',
  'trekking', 'adventure', 'domestic-tours', 'spiritual-tours', 'international-tours',
  'gallery', 'rishikesh-tour', 'haridwar-tour', 'mussoorie-tour', 'nainital-tour',
  'hill-stations-tour', 'char-dham-tour', 'hotel-packages', 'camping-packages',
  'package-detail', 'about-us', 'contact', 'privacy-policy', 'terms-of-service',
  'refund-policy', 'cancellation-policy', 'blog-archive', 'blog-single',
]

export default function Home() {
  const { currentView, navigate, voucherModalOpen } = useAppStore()
  const [renderError, setRenderError] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      useAppStore.persist.rehydrate()
      useCart.persist.rehydrate()
    } catch {}
    setHydrated(true)
  }, [])

  useEffect(() => {
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        try { useAppStore.persist.rehydrate() } catch {}
        setHydrated(true)
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityOrFocus)
    window.addEventListener('focus', handleVisibilityOrFocus)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus)
      window.removeEventListener('focus', handleVisibilityOrFocus)
    }
  }, [])

  useEffect(() => {
    if (renderError) {
      localStorage.removeItem('divine-travel-store')
      navigate('landing')
      setRenderError(false)
    }
  }, [renderError, navigate])

  useEffect(() => {
    if (!hydrated) return
    const redirect = localStorage.getItem('dt_redirect')
    if (redirect) {
      localStorage.removeItem('dt_redirect')
      navigate(redirect)
    }
  }, [navigate, hydrated])

  const renderLanding = () => (
    <>
      <Navbar />
      <ActivityBar />
      <HeroBanner />
      <TrustGuarantee />
      <DestinationCarousel />
      <CompanySection />
      <TopDestinations />
      <StaySection />
      <BlogSection />
      <TestimonialsSection />
      <FAQSection />
      <PartnersSection />
      <SocialCTASection />
      <CTABanner />
      <Footer />
    </>
  )

  const renderView = useCallback(() => {
    try {
      switch (currentView) {
        case 'user-dashboard': return <Suspense fallback={<ViewLoader />}><UserDashboard /></Suspense>
        case 'admin-dashboard': return <Suspense fallback={<ViewLoader />}><AdminDashboard /></Suspense>
        case 'destination-detail': return <DestinationDetail />
        case 'booking-success': return <BookingSuccess />
        case 'rafting-packages': return <Suspense fallback={<ViewLoader />}><RaftingPackages /></Suspense>
        case 'bike-rental': return <Suspense fallback={<ViewLoader />}><BikePackages /></Suspense>
        case 'taxi-booking': return <Suspense fallback={<ViewLoader />}><TaxiPackages /></Suspense>
        case 'taxi-booking-form': return <Suspense fallback={<ViewLoader />}><TaxiBookingForm /></Suspense>
        case 'trekking': return <Suspense fallback={<ViewLoader />}><TrekkingPackages /></Suspense>
        case 'adventure': return <Suspense fallback={<ViewLoader />}><AdventurePackages /></Suspense>
        case 'domestic-tours': return <Suspense fallback={<ViewLoader />}><DomesticPackages /></Suspense>
        case 'spiritual-tours': return <Suspense fallback={<ViewLoader />}><SpiritualPackages /></Suspense>
        case 'international-tours': return <Suspense fallback={<ViewLoader />}><InternationalPackages /></Suspense>
        case 'gallery': return <Suspense fallback={<ViewLoader />}><GalleryPage /></Suspense>
        case 'rishikesh-tour': return <Suspense fallback={<ViewLoader />}><RishikeshTour /></Suspense>
        case 'haridwar-tour': return <Suspense fallback={<ViewLoader />}><HaridwarTour /></Suspense>
        case 'mussoorie-tour': return <Suspense fallback={<ViewLoader />}><MussoorieTour /></Suspense>
        case 'nainital-tour': return <Suspense fallback={<ViewLoader />}><NainitalTour /></Suspense>
        case 'hill-stations-tour': return <Suspense fallback={<ViewLoader />}><HillStationsTour /></Suspense>
        case 'char-dham-tour': return <Suspense fallback={<ViewLoader />}><CharDhamTour /></Suspense>
        case 'hotel-packages': return <Suspense fallback={<ViewLoader />}><HotelPackages /></Suspense>
        case 'camping-packages': return <Suspense fallback={<ViewLoader />}><CampingPackages /></Suspense>
        case 'package-detail': return <Suspense fallback={<ViewLoader />}><PackageDetail /></Suspense>
        case 'package-booking': return <Suspense fallback={<ViewLoader />}><PackageBookingForm /></Suspense>
        case 'about-us': return <AboutUs />
        case 'contact': return <Contact />
        case 'company-detail': return <CompanyDetail />
        case 'privacy-policy': return <PrivacyPolicy />
        case 'terms-of-service': return <TermsOfService />
        case 'refund-policy': return <RefundPolicy />
        case 'cancellation-policy': return <CancellationPolicy />
        case 'cookie-policy': return <CookiePolicy />
        case 'blog-archive': return <BlogArchive />
        case 'blog-single': return <BlogSingle />
        case 'hotel-detail': return <HotelDetail />
        case 'collaborate': return <CreatorCollaborationPage />
        case 'landing':
        default: return renderLanding()
      }
    } catch {
      return renderLanding()
    }
  }, [currentView])

  return (
    <ErrorBoundary fallback={renderLanding()}>
      <main className="min-h-screen flex flex-col">
        {hydrated && !selfContainedViews.includes(currentView) && currentView !== 'landing' && <Navbar />}
        <div key={hydrated ? (currentView || 'landing') : 'splash'} className="flex-1">
          {hydrated ? renderView() : <ViewLoader />}
        </div>
        {hydrated && currentView !== 'admin-dashboard' && !voucherModalOpen && <WhatsAppWidget />}
        <CookieConsent />
        <BootSplash visible={!hydrated} />
      </main>
    </ErrorBoundary>
  )
}
