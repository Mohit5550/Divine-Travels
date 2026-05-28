'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Menu, X, User, LogOut, LayoutDashboard, Compass, Heart, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LoginModal } from './LoginModal'

export function Navbar() {
  const { isAuthenticated, user, isAdmin, navigate, logout } = useAppStore()
  const [scrolled, setScrolled] = useState(false)
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
    }
  }

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white ${
          scrolled
            ? 'shadow-md border-b border-gray-100'
            : 'shadow-sm border-b border-gray-100'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-[72px] gap-4">
            {/* Logo - Left */}
            <button
              onClick={() => navigate('landing')}
              className="flex items-center gap-2 cursor-pointer shrink-0"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-brand-orange flex items-center justify-center">
                <Compass className="w-5 h-5 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="font-bold text-lg sm:text-xl text-brand-dark">
                Divine Travel
              </span>
            </button>

            {/* Search Bar - Center */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search for experiences"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-full border-2 border-brand-orange/60 bg-white text-sm focus:outline-none focus:border-brand-orange transition-colors"
                />
              </div>
            </form>

            {/* Right Section */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              {/* Mobile search toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden rounded-full"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Search className="w-5 h-5" />
              </Button>

              {isAuthenticated ? (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate('landing')}
                    className="hidden sm:flex rounded-full relative"
                  >
                    <Heart className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hidden sm:flex rounded-full relative"
                  >
                    <ShoppingCart className="w-5 h-5" />
                  </Button>
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
                    className="sm:hidden"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  >
                    {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hidden sm:flex rounded-full"
                    onClick={() => setLoginOpen(true)}
                  >
                    <Heart className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hidden sm:flex rounded-full"
                    onClick={() => setLoginOpen(true)}
                  >
                    <ShoppingCart className="w-5 h-5" />
                  </Button>
                  <Button
                    onClick={() => setLoginOpen(true)}
                    className="bg-brand-orange hover:bg-brand-orange/90 text-white rounded-full px-4 sm:px-6 h-9 text-sm font-medium"
                  >
                    Sign In
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="sm:hidden"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  >
                    {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="sm:hidden overflow-hidden border-t border-gray-100 bg-white"
            >
              <div className="p-4 flex flex-col gap-2">
                {/* Mobile search */}
                <form onSubmit={handleSearch} className="mb-2">
                  <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search for experiences"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-full border-2 border-brand-orange/60 bg-white text-sm focus:outline-none focus:border-brand-orange"
                    />
                  </div>
                </form>
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
                  Experiences
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
