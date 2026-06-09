'use client'

import { Mail, Phone, MapPin, MessageCircle, ArrowUpRight } from 'lucide-react'
import { useAppStore } from '@/lib/store'

export function Footer() {
  const { navigate } = useAppStore()

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          {/* Brand */}
          <div>
            <div className="mb-4">
              <img
                src="/logo.png?v=2"
                alt="Divine Travel"
                className="h-12 w-auto object-contain invert"
                draggable={false}
              />
            </div>
            <p className="text-white/60 text-sm leading-relaxed">
              Your trusted partner for exploring the divine beauty of India. From spiritual pilgrimages to adventure getaways — we craft experiences that stay with you forever.
            </p>
            <a
              href="https://wa.me/916396919007"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 text-sm text-green-400 hover:text-green-300 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Chat on WhatsApp
            </a>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-sm mb-4 text-brand-orange">Quick Links</h4>
            <div className="flex flex-col gap-2">
              {[
                { label: 'Home', action: () => navigate('landing') },
                { label: 'Destinations', action: handleDestClick },
                { label: 'About Us', action: () => navigate('about-us') },
                { label: 'Contact Us', action: () => navigate('contact') },
                { label: 'Privacy Policy', action: () => navigate('privacy-policy') },
                { label: 'Terms & Conditions', action: () => navigate('terms-of-service') },
                { label: 'Refund Policy', action: () => navigate('refund-policy') },
                { label: 'Cancellation Policy', action: () => navigate('cancellation-policy') },
              ].map((link) => (
                <button
                  key={link.label}
                  onClick={link.action}
                  className="text-white/60 text-sm hover:text-brand-orange transition-colors text-left flex items-center gap-1"
                >
                  {link.label}
                  {['Privacy Policy', 'Terms & Conditions', 'Refund Policy', 'Cancellation Policy'].includes(link.label) && (
                    <ArrowUpRight className="w-3 h-3" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Our Services */}
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
                <button
                  key={svc.label}
                  onClick={() => navigate(svc.view)}
                  className="text-white/60 text-sm hover:text-brand-orange transition-colors text-left"
                >
                  {svc.label}
                </button>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-sm mb-4 text-brand-orange">Contact Us</h4>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <Phone className="w-4 h-4 text-brand-orange" />
                <a href="tel:+916396919007" className="hover:text-brand-orange transition-colors">+91 63969 19007</a>
              </div>
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <Mail className="w-4 h-4 text-brand-orange" />
                <a href="mailto:info@divinetravels.in" className="hover:text-brand-orange transition-colors">info@divinetravels.in</a>
              </div>
              <div className="flex items-start gap-2 text-white/60 text-sm">
                <MapPin className="w-4 h-4 text-brand-orange mt-0.5" />
                <span>Near Swami Narayan Ashram, Muni Ki Reti, Rishikesh - 249137</span>
              </div>
              <button
                onClick={() => navigate('contact')}
                className="text-brand-orange text-sm hover:underline mt-2 text-left"
              >
                Send us a message →
              </button>
            </div>

            {/* Social / WhatsApp */}
            <div className="mt-4 pt-4 border-t border-white/10">
              <a
                href="https://wa.me/916396919007"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-white/60 hover:text-green-400 transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-green-400" />
                WhatsApp: +91 63969 19007
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm">
            © 2026 Divine Travels. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <button onClick={() => navigate('privacy-policy')} className="text-white/40 text-xs hover:text-white/60 transition-colors">Privacy Policy</button>
            <button onClick={() => navigate('terms-of-service')} className="text-white/40 text-xs hover:text-white/60 transition-colors">Terms of Service</button>
            <button onClick={() => navigate('refund-policy')} className="text-white/40 text-xs hover:text-white/60 transition-colors">Refund Policy</button>
          </div>
        </div>
      </div>
    </footer>
  )
}
