'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/landing/Navbar'
import { ActivityBar } from '@/components/landing/ActivityBar'
import { HeroBanner } from '@/components/landing/HeroBanner'
import { DestinationCarousel } from '@/components/landing/DestinationCarousel'
import { TopDestinations } from '@/components/landing/TopDestinations'
import { CompanySection } from '@/components/landing/CompanySection'
import { StaySection } from '@/components/landing/StaySection'
import { BlogSection } from '@/components/landing/BlogSection'
import { TestimonialsSection } from '@/components/landing/TestimonialsSection'
import { TrustGuarantee } from '@/components/landing/TrustGuarantee'
import { FAQSection } from '@/components/landing/FAQSection'
import { PartnersSection } from '@/components/landing/PartnersSection'
import { SocialCTASection } from '@/components/landing/SocialCTASection'
import { CTABanner } from '@/components/landing/CTABanner'
import { Footer } from '@/components/landing/Footer'
import { WhatsAppWidget } from '@/components/ui/WhatsAppWidget'
import { CookieConsent } from '@/components/ui/CookieConsent'
import { BootSplash } from '@/components/ui/BootSplash'

export default function Home() {
  const { currentView, navigate, voucherModalOpen } = useAppStore()
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      useAppStore.persist.rehydrate()
    } catch {}
    setHydrated(true)
  }, [])

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

  return (
    <main className="min-h-screen flex flex-col">
      <div key={hydrated ? (currentView || 'landing') : 'splash'} className="flex-1">
        {currentView === 'landing' && hydrated ? renderLanding() : <BootSplash visible={!hydrated} />}
      </div>
      {hydrated && <WhatsAppWidget />}
      <CookieConsent />
    </main>
  )
}
