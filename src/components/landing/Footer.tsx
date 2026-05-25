'use client'

import { Compass, Mail, Phone, MapPin } from 'lucide-react'
import { useAppStore } from '@/lib/store'

export function Footer() {
  const { navigate } = useAppStore()

  return (
    <footer className="bg-brand-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-brand-orange flex items-center justify-center">
                <Compass className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="font-serif text-xl">Divine Travel</span>
                <p className="text-brand-gold text-[10px] tracking-widest uppercase">Explore the Sacred</p>
              </div>
            </div>
            <p className="text-white/60 text-sm leading-relaxed">
              Your trusted partner for exploring the divine beauty of Uttarakhand. From spiritual pilgrimages to adventure getaways.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-sm mb-4 text-brand-orange">Quick Links</h4>
            <div className="flex flex-col gap-2">
              {[
                { label: 'Home', action: () => navigate('landing') },
                { label: 'Destinations', action: () => navigate('landing') },
                { label: 'About Us', action: () => navigate('landing') },
                { label: 'Contact', action: () => {} },
              ].map((link) => (
                <button
                  key={link.label}
                  onClick={link.action}
                  className="text-white/60 text-sm hover:text-brand-orange transition-colors text-left"
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>

          {/* Popular Destinations */}
          <div>
            <h4 className="font-semibold text-sm mb-4 text-brand-orange">Popular Destinations</h4>
            <div className="flex flex-col gap-2">
              {['Rishikesh', 'Haridwar', 'Mussoorie', 'Auli', 'Char Dham'].map((dest) => (
                <button
                  key={dest}
                  onClick={() => navigate('landing')}
                  className="text-white/60 text-sm hover:text-brand-orange transition-colors text-left"
                >
                  {dest}
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
                +91 98765 43210
              </div>
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <Mail className="w-4 h-4 text-brand-orange" />
                hello@divinetravel.com
              </div>
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <MapPin className="w-4 h-4 text-brand-orange" />
                Dehradun, Uttarakhand
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm">
            © 2025 Divine Travel. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-white/40 text-xs hover:text-white/60 cursor-pointer">Privacy Policy</span>
            <span className="text-white/40 text-xs hover:text-white/60 cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
