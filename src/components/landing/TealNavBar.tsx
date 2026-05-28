'use client'

import { useState, useEffect, useRef } from 'react'
import { useAppStore } from '@/lib/store'
import { ChevronDown, Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const navLinks = [
  { label: 'Home', action: 'landing' },
  { label: 'Experiences', action: 'landing' },
  { label: 'Accommodations', action: 'landing' },
  { label: 'Transport', action: 'landing' },
  { label: 'Deals', action: 'landing' },
]

export function TealNavBar() {
  const { navigate } = useAppStore()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const moreRef = useRef<HTMLDivElement>(null)

  // Close "More" dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false)
      }
    }
    if (moreOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [moreOpen])

  const handleNavClick = (action: string) => {
    navigate(action)
    setMobileOpen(false)
    setMoreOpen(false)
  }

  const handleRaftingClick = () => {
    navigate('rafting-packages')
    setMobileOpen(false)
    setMoreOpen(false)
  }

  return (
    <nav className="bg-brand-teal sticky top-16 sm:top-[72px] z-40 shadow-sm mt-16 sm:mt-[72px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop Nav */}
        <div className="hidden md:flex items-center justify-between h-10">
          <div className="flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link.action)}
                className="px-4 py-2 text-sm font-medium text-white hover:bg-white/10 rounded-md transition-colors"
              >
                {link.label}
              </button>
            ))}
            {/* More dropdown */}
            <div className="relative" ref={moreRef}>
              <button
                onClick={() => setMoreOpen(!moreOpen)}
                className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 rounded-md transition-colors"
              >
                More
                <ChevronDown className={`w-4 h-4 transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {moreOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-100 py-2 min-w-[180px] z-50"
                  >
                    <button
                      onClick={handleRaftingClick}
                      className="w-full text-left px-4 py-2 text-sm text-brand-dark hover:bg-brand-cream transition-colors"
                    >
                      Rafting Packages
                    </button>
                    <button
                      onClick={() => handleNavClick('landing')}
                      className="w-full text-left px-4 py-2 text-sm text-brand-dark hover:bg-brand-cream transition-colors"
                    >
                      Camping
                    </button>
                    <button
                      onClick={() => handleNavClick('landing')}
                      className="w-full text-left px-4 py-2 text-sm text-brand-dark hover:bg-brand-cream transition-colors"
                    >
                      Trekking
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Mobile toggle */}
        <div className="md:hidden flex items-center justify-between h-10">
          <span className="text-white text-sm font-medium">Navigation</span>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-white p-1"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden bg-brand-teal/95"
          >
            <div className="px-4 pb-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link.action)}
                  className="text-left px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-white/10 transition-colors"
                >
                  {link.label}
                </button>
              ))}
              <button
                onClick={handleRaftingClick}
                className="text-left px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-white/10 transition-colors"
              >
                Rafting Packages
              </button>
              <button
                onClick={() => handleNavClick('landing')}
                className="text-left px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-white/10 transition-colors"
              >
                Camping
              </button>
              <button
                onClick={() => handleNavClick('landing')}
                className="text-left px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-white/10 transition-colors"
              >
                Trekking
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
