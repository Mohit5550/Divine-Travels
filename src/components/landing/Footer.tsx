'use client'

import { Mail, Phone, MapPin, MessageCircle, ArrowUpRight } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { useSettings } from '@/lib/useSettings'
import { SpaLink } from '@/components/ui/SpaLink'

interface FooterLink {
  label: string
  view?: string
}

const QUICK_LINKS_MOBILE: FooterLink[] = [
  { label: 'Home', view: 'landing' },
  { label: 'Destinations' },
  { label: '✨ Creator Program', view: 'collaborate' },
  { label: 'About Us', view: 'about-us' },
  { label: 'Blog', view: 'blog-archive' },
  { label: 'Contact Us', view: 'contact' },
  { label: 'Privacy Policy', view: 'privacy-policy' },
  { label: 'Terms & Conditions', view: 'terms-of-service' },
  { label: 'Refund Policy', view: 'refund-policy' },
  { label: 'Cancellation Policy', view: 'cancellation-policy' },
  { label: 'Cookie Policy', view: 'cookie-policy' },
]

const QUICK_LINKS_DESKTOP: FooterLink[] = [
  { label: 'Home', view: 'landing' },
  { label: 'Destinations' },
  { label: '✨ Creator Program', view: 'collaborate' },
  { label: 'About Us', view: 'about-us' },
  { label: 'Contact Us', view: 'contact' },
  { label: 'Privacy Policy', view: 'privacy-policy' },
  { label: 'Terms & Conditions', view: 'terms-of-service' },
  { label: 'Refund Policy', view: 'refund-policy' },
  { label: 'Cancellation Policy', view: 'cancellation-policy' },
  { label: 'Cookie Policy', view: 'cookie-policy' },
]

export function Footer() {
  const { navigate } = useAppStore()
  const s = useSettings()

  const handleDestClick = () => {
    navigate('landing')
    setTimeout(() => {
      const el = document.getElementById('destinations')
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  return (
    <footer className="bg-brand-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Mobile: Brand → Quick+Services side-by-side → Contact below */}
        {/* Desktop (lg): 4 separate columns — Brand | Quick Links | Our Services | Contact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 sm:gap-10">
          {/* Brand */}
          <div>
            <div className="mb-4">
              <img loading="lazy" decoding="async"
                src="/logo-white.png"
                alt="Divine Travel"
                className="h-12 w-auto object-contain"
                draggable={false}
              />
            </div>
            <p className="text-white/60 text-sm leading-relaxed">
              Your trusted partner for exploring the divine beauty of India. From spiritual pilgrimages to adventure getaways — we craft experiences that stay with you forever.
            </p>
            <a
              href={`https://wa.me/${(s.whatsapp || '').replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 text-sm text-green-400 hover:text-green-300 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Chat on WhatsApp
            </a>
          </div>

          {/* Quick Links + Our Services — side-by-side on sm, hidden on lg (replaced by separate columns below) */}
          <div className="sm:col-span-2 lg:hidden">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-sm mb-4 text-brand-orange">Quick Links</h4>
                <div className="flex flex-col gap-2">
                  {QUICK_LINKS_MOBILE.map((link) => (
                    link.view ? (
                      <SpaLink
                        key={link.label}
                        view={link.view}
                        className="text-white/60 text-sm hover:text-brand-orange transition-colors text-left flex items-center gap-1"
                      >
                        {link.label}
                        {['Privacy Policy', 'Terms & Conditions', 'Refund Policy', 'Cancellation Policy', 'Cookie Policy'].includes(link.label) && (
                          <ArrowUpRight className="w-3 h-3" />
                        )}
                      </SpaLink>
                    ) : (
                      <button
                        key={link.label}
                        onClick={handleDestClick}
                        className="text-white/60 text-sm hover:text-brand-orange transition-colors text-left flex items-center gap-1"
                      >
                        {link.label}
                      </button>
                    )
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-4 text-brand-orange">Our Services</h4>
                <div className="flex flex-col gap-2">
                  {[
                    { label: 'River Rafting', view: 'rafting-packages' },
                    { label: 'Trekking', view: 'trekking' },
                    { label: 'Adventure Activities', view: 'adventure' },
                    { label: 'Bike Rental', view: 'bike-rental' },
                    { label: 'Taxi Booking', view: 'taxi-booking' },
                    { label: 'Domestic Tours', view: 'domestic-tours' },
                    { label: 'Spiritual Tours', view: 'spiritual-tours' },
                  ].map((svc) => (
                    <SpaLink
                      key={svc.label}
                      view={svc.view}
                      className="text-white/60 text-sm hover:text-brand-orange transition-colors text-left"
                    >
                      {svc.label}
                    </SpaLink>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links — desktop only (lg) */}
          <div className="hidden lg:block">
            <h4 className="font-semibold text-sm mb-4 text-brand-orange">Quick Links</h4>
            <div className="flex flex-col gap-2">
              {QUICK_LINKS_DESKTOP.map((link) => (
                link.view ? (
                  <SpaLink
                    key={link.label}
                    view={link.view}
                    className="text-white/60 text-sm hover:text-brand-orange transition-colors text-left flex items-center gap-1"
                  >
                    {link.label}
                    {['Privacy Policy', 'Terms & Conditions', 'Refund Policy', 'Cancellation Policy', 'Cookie Policy'].includes(link.label) && (
                      <ArrowUpRight className="w-3 h-3" />
                    )}
                  </SpaLink>
                ) : (
                  <button
                    key={link.label}
                    onClick={handleDestClick}
                    className="text-white/60 text-sm hover:text-brand-orange transition-colors text-left flex items-center gap-1"
                  >
                    {link.label}
                  </button>
                )
              ))}
            </div>
          </div>

          {/* Our Services — desktop only (lg) */}
          <div className="hidden lg:block">
            <h4 className="font-semibold text-sm mb-4 text-brand-orange">Our Services</h4>
            <div className="flex flex-col gap-2">
              {[
                { label: 'River Rafting', view: 'rafting-packages' },
                { label: 'Trekking', view: 'trekking' },
                { label: 'Adventure Activities', view: 'adventure' },
                { label: 'Bike Rental', view: 'bike-rental' },
                { label: 'Taxi Booking', view: 'taxi-booking' },
                { label: 'Domestic Tours', view: 'domestic-tours' },
                { label: 'Spiritual Tours', view: 'spiritual-tours' },
              ].map((svc) => (
                <SpaLink
                  key={svc.label}
                  view={svc.view}
                  className="text-white/60 text-sm hover:text-brand-orange transition-colors text-left"
                >
                  {svc.label}
                </SpaLink>
              ))}
            </div>
          </div>

          {/* Contact Us — full width on sm, own column on lg */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h4 className="font-semibold text-sm mb-4 text-brand-orange">Contact Us</h4>
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 sm:gap-6 lg:gap-3">
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <Phone className="w-4 h-4 text-brand-orange shrink-0" />
                <a href={`tel:${s.phone || ''}`} className="hover:text-brand-orange transition-colors">{s.phone || ''}</a>
              </div>
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <Mail className="w-4 h-4 text-brand-orange shrink-0" />
                <a href={`mailto:${s.email}`} className="hover:text-brand-orange transition-colors">{s.email}</a>
              </div>
              <div className="flex items-start gap-2 text-white/60 text-sm">
                <MapPin className="w-4 h-4 text-brand-orange mt-0.5 shrink-0" />
                <span>{s.address}</span>
              </div>
              <SpaLink
                view="contact"
                className="text-brand-orange text-sm hover:underline text-left"
              >
                Send us a message →
              </SpaLink>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10">
              <a
                href={`https://wa.me/${(s.whatsapp || '').replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-white/60 hover:text-green-400 transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-green-400" />
                WhatsApp: {s.whatsapp}
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm">
            © 2026 Divine Travels. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <SpaLink view="privacy-policy" className="text-white/40 text-xs hover:text-white/60 transition-colors">Privacy Policy</SpaLink>
            <SpaLink view="terms-of-service" className="text-white/40 text-xs hover:text-white/60 transition-colors">Terms of Service</SpaLink>
            <SpaLink view="refund-policy" className="text-white/40 text-xs hover:text-white/60 transition-colors">Refund Policy</SpaLink>
          </div>
        </div>
      </div>
    </footer>
  )
}
