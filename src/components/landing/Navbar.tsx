'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Menu, X, User, LogOut, LayoutDashboard, Compass, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LoginModal } from './LoginModal'

export function Navbar() {
  const { isAuthenticated, user, isAdmin, navigate, logout } = useAppStore()
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate('landing')
      setSearchOpen(false)
    }
  }

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-border'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <button
              onClick={() => navigate('landing')}
              className="flex items-center gap-2 cursor-pointer"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-brand-orange flex items-center justify-center">
                <Compass className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-xl sm:text-2xl text-brand-dark leading-tight">
                  Divine Travel
                </span>
                <span className="text-[10px] text-brand-gold tracking-widest uppercase hidden sm:block">
                  Explore the Sacred
                </span>
              </div>
            </button>

            {/* Desktop Nav Links */}
            <nav className="hidden md:flex items-center gap-8">
              <button
                onClick={() => navigate('landing')}
                className="text-sm font-medium text-brand-dark hover:text-brand-orange transition-colors"
              >
                Home
              </button>
              <button
                onClick={() => {
                  navigate('landing')
                  setTimeout(() => {
                    const el = document.getElementById('destinations')
                    el?.scrollIntoView({ behavior: 'smooth' })
                  }, 100)
                }}
                className="text-sm font-medium text-brand-dark hover:text-brand-orange transition-colors"
              >
                Destinations
              </button>
              <button
                onClick={() => {
                  navigate('landing')
                  setTimeout(() => {
                    const el = document.getElementById('why-us')
                    el?.scrollIntoView({ behavior: 'smooth' })
                  }, 100)
                }}
                className="text-sm font-medium text-brand-dark hover:text-brand-orange transition-colors"
              >
                About
              </button>
            </nav>

            {/* Right section */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchOpen(!searchOpen)}
                className="rounded-full"
              >
                <Search className="w-5 h-5" />
              </Button>

              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate('admin-dashboard')}
                      className="hidden sm:flex items-center gap-1 text-brand-teal"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Admin
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('user-dashboard')}
                    className="hidden sm:flex items-center gap-1"
                  >
                    <User className="w-4 h-4" />
                    Dashboard
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('landing')}
                    className="hidden sm:flex items-center gap-1"
                  >
                    <Heart className="w-4 h-4" />
                    Wishlist
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={logout}
                    className="hidden sm:flex items-center gap-1"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                  {/* Mobile menu */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  >
                    {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  </Button>
                </div>
              ) : (
                <>
                  <Button
                    onClick={() => setLoginOpen(true)}
                    className="bg-brand-orange hover:bg-brand-orange/90 text-white rounded-full px-4 sm:px-6"
                  >
                    <User className="w-4 h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Login</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  >
                    {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-border bg-white"
            >
              <form onSubmit={handleSearch} className="max-w-2xl mx-auto p-4">
                <div className="flex items-center gap-2 bg-brand-cream rounded-full px-4 py-2">
                  <Search className="w-5 h-5 text-brand-orange" />
                  <input
                    type="text"
                    placeholder="Search destinations, activities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-sm"
                    autoFocus
                  />
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden border-t border-border bg-white"
            >
              <div className="p-4 flex flex-col gap-2">
                <button
                  onClick={() => { navigate('landing'); setMobileMenuOpen(false) }}
                  className="text-left px-3 py-2 rounded-lg hover:bg-brand-cream text-sm font-medium"
                >
                  Home
                </button>
                <button
                  onClick={() => { navigate('landing'); setMobileMenuOpen(false) }}
                  className="text-left px-3 py-2 rounded-lg hover:bg-brand-cream text-sm font-medium"
                >
                  Destinations
                </button>
                {isAuthenticated ? (
                  <>
                    <button
                      onClick={() => { navigate('user-dashboard'); setMobileMenuOpen(false) }}
                      className="text-left px-3 py-2 rounded-lg hover:bg-brand-cream text-sm font-medium"
                    >
                      My Dashboard
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => { navigate('admin-dashboard'); setMobileMenuOpen(false) }}
                        className="text-left px-3 py-2 rounded-lg hover:bg-brand-cream text-sm font-medium text-brand-teal"
                      >
                        Admin Panel
                      </button>
                    )}
                    <button
                      onClick={() => { logout(); setMobileMenuOpen(false) }}
                      className="text-left px-3 py-2 rounded-lg hover:bg-red-50 text-sm font-medium text-red-600"
                    >
                      Logout ({user?.name})
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => { setLoginOpen(true); setMobileMenuOpen(false) }}
                    className="text-left px-3 py-2 rounded-lg bg-brand-orange text-white text-sm font-medium"
                  >
                    Login / Register
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  )
}
