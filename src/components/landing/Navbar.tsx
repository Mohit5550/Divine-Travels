'use client'

import { useState, useEffect, useRef } from 'react'
import { useAppStore } from '@/lib/store'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Menu, X, Heart, ShoppingCart, Loader2 } from 'lucide-react'
import { PushNotificationManager } from '@/components/ui/PushNotificationManager'
import { Button } from '@/components/ui/button'
import { LoginModal } from './LoginModal'
import { NavbarNotifications } from './NavbarNotifications'
import NavbarUserMenu from './NavbarUserMenu'
import { useCart } from '@/lib/cart'
import { getAuthHeaders } from '@/lib/auth-client'

interface SearchPackage {
  id: string
  name: string
  tagline: string
  subtitle: string
  price: number
  originalPrice: number | null
  category: string
  image: string
  slug: string
}

const categoryLabels: Record<string, string> = {
  'rafting': 'Rafting',
  'bike-rental': 'Bike Rental',
  'taxi-booking': 'Taxi Booking',
  'trekking': 'Trekking',
  'adventure': 'Adventure',
  'domestic-tours': 'Domestic Tours',
  'spiritual-tours': 'Spiritual Tours',
}

const categoryColors: Record<string, string> = {
  'rafting': 'bg-blue-500',
  'bike-rental': 'bg-orange-600',
  'taxi-booking': 'bg-amber-500',
  'trekking': 'bg-emerald-500',
  'adventure': 'bg-red-500',
  'domestic-tours': 'bg-teal-500',
  'spiritual-tours': 'bg-amber-600',
}

export function Navbar() {
  const { isAuthenticated, user, isAdmin, navigate, logout, setDashboardTab } = useAppStore()
  const [scrolled, setScrolled] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const cartCount = useCart((s) => s.items.length)
  const [mounted, setMounted] = useState(false)

  const { data: destWishlist = [] } = useQuery({
    queryKey: ['wishlist', user?.id],
    queryFn: async () => {
      if (!user?.id) return []
      const res = await fetch('/api/wishlist', { headers: { ...getAuthHeaders() } })
      if (!res.ok) return []
      return res.json()
    },
    enabled: isAuthenticated && !!user?.id,
  })

  const { data: pkgWishlist = [] } = useQuery({
    queryKey: ['package-wishlist', user?.id],
    queryFn: async () => {
      if (!user?.id) return []
      const res = await fetch('/api/package-wishlist', { headers: { ...getAuthHeaders() } })
      if (!res.ok) return []
      return res.json()
    },
    enabled: isAuthenticated && !!user?.id,
  })

  const wishlistCount = destWishlist.length + pkgWishlist.length

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const { data: searchResults = [], isFetching } = useQuery({
    queryKey: ['universal-search', searchQuery],
    queryFn: async () => {
      const res = await fetch('/api/packages/cards')
      const all = await res.json()
      const q = searchQuery.toLowerCase()
      return all.filter((p: SearchPackage) =>
        p.name.toLowerCase().includes(q) ||
        (p.tagline && p.tagline.toLowerCase().includes(q)) ||
        (p.subtitle && p.subtitle.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q))
      ).slice(0, 15)
    },
    enabled: searchQuery.trim().length >= 2,
    staleTime: 30000,
  })

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setShowDropdown(true)
    }
  }

  const handleSelectPackage = (pkg: SearchPackage) => {
    setSearchQuery('')
    setShowDropdown(false)
    navigate('package-detail', null, pkg.slug || pkg.id)
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
            <button
              onClick={() => navigate('landing')}
              className="flex items-center gap-2 cursor-pointer shrink-0"
            >
              <img loading="lazy" decoding="async"
                src="/logo.png"
                alt="Divine Travel"
                className="h-10 sm:h-12 w-auto object-contain"
                draggable={false}
              />
            </button>

            <div ref={searchRef} className="hidden md:flex flex-1 max-w-md mx-4 relative">
              <form onSubmit={handleSearchSubmit} className="w-full">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search rafting, trekking, bungee..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setShowDropdown(true) }}
                    onFocus={() => { if (searchQuery.trim().length >= 2) setShowDropdown(true) }}
                    className="w-full pl-10 pr-10 py-2 rounded-full border-2 border-brand-orange/60 bg-white text-sm focus:outline-none focus:border-brand-orange transition-colors"
                  />
                  {isFetching && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
                  )}
                </div>
              </form>
              <AnimatePresence>
                {showDropdown && searchQuery.trim().length >= 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute top-full mt-2 left-0 right-0 bg-white border border-gray-200 rounded-2xl shadow-xl max-h-96 overflow-y-auto z-50"
                  >
                    {searchResults.length === 0 ? (
                      <div className="p-6 text-center text-sm text-muted-foreground">
                        {isFetching ? 'Searching...' : 'No results found'}
                      </div>
                    ) : (
                      <div className="py-2">
                        {searchResults.map((pkg: SearchPackage, index: number) => (
                          <button
                            key={pkg.id || `search-result-${index}`}
                            onClick={() => handleSelectPackage(pkg)}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-brand-cream transition-colors text-left"
                          >
                            <img loading="lazy" decoding="async"
                              src={pkg.image}
                              alt={pkg.name}
                              className="w-10 h-10 rounded-lg object-cover shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-brand-dark truncate">{pkg.name}</span>
                                <span className={`${categoryColors[pkg.category] || 'bg-gray-500'} text-white text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0`}>
                                  {categoryLabels[pkg.category] || pkg.category}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground truncate">{pkg.tagline}</p>
                            </div>
                            <span className="text-sm font-bold text-brand-orange shrink-0">
                              {pkg.originalPrice != null && pkg.originalPrice > pkg.price ? (
                                <>
                                  <span className="line-through text-red-500 font-medium text-[10px]">₹{pkg.originalPrice}</span>
                                  {' '}₹{pkg.price}
                                  <span className="text-emerald-500 text-[10px] font-semibold ml-0.5">Save ₹{pkg.originalPrice - pkg.price}</span>
                                </>
                              ) : (
                                <>₹{pkg.price}</>
                              )}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                  <div className="sm:hidden">
                    <NavbarNotifications onNavigate={() => setMobileMenuOpen(false)} />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden rounded-full"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Search"
                  >
                    <Search className="w-5 h-5" />
                  </Button>

                {isAuthenticated ? (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => { setDashboardTab('wishlist'); navigate('user-dashboard') }}
                      className="hidden sm:flex rounded-full relative"
                      aria-label="Wishlist"
                    >
                      <Heart className="w-5 h-5" />
                      {mounted && wishlistCount > 0 && (
                        <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold leading-none">
                          {wishlistCount}
                        </span>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => { setDashboardTab('cart'); navigate('user-dashboard') }}
                      className="hidden sm:flex rounded-full relative"
                      aria-label="Cart"
                    >
                    <ShoppingCart className="w-5 h-5" />
                    {mounted && cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold leading-none">
                        {cartCount}
                      </span>
                    )}
                  </Button>
                  <div className="hidden sm:block">
                    <NavbarNotifications />
                  </div>
                  <div className="hidden sm:block">
                    <PushNotificationManager />
                  </div>
                  <NavbarUserMenu />
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
                    className="hidden sm:flex rounded-full relative"
                    onClick={() => setLoginOpen(true)}
                    aria-label="Cart"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {mounted && cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold leading-none">
                        {cartCount}
                      </span>
                    )}
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

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="sm:hidden overflow-hidden border-t border-gray-100 bg-white"
            >
              <div className="p-4 flex flex-col gap-2">
                <form onSubmit={handleSearchSubmit} className="mb-2">
                  <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search rafting, trekking, bungee..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-full border-2 border-brand-orange/60 bg-white text-sm focus:outline-none focus:border-brand-orange"
                    />
                  </div>
                </form>
                {searchQuery.trim().length >= 2 && (
                  <div className="max-h-60 overflow-y-auto mb-2">
                    {searchResults.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-2">No results found</p>
                    ) : (
                      searchResults.slice(0, 5).map((pkg: SearchPackage, index: number) => (
                        <button
                          key={pkg.id || `mobile-search-result-${index}`}
                          onClick={() => { handleSelectPackage(pkg); setMobileMenuOpen(false) }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-brand-cream transition-colors text-left"
                        >
                          <img loading="lazy" decoding="async" src={pkg.image} alt={pkg.name} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium text-brand-dark truncate block">{pkg.name}</span>
                            <span className={`${categoryColors[pkg.category] || 'bg-gray-500'} text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full inline-block`}>
                              {categoryLabels[pkg.category] || pkg.category}
                            </span>
                          </div>
                          <span className="text-xs font-bold text-brand-orange">
                            {pkg.originalPrice != null && pkg.originalPrice > pkg.price ? (
                              <>
                                <span className="line-through text-red-500 font-medium text-[9px]">₹{pkg.originalPrice}</span>
                                {' '}₹{pkg.price}
                                <span className="text-emerald-500 text-[9px] font-semibold ml-0.5">Save ₹{pkg.originalPrice - pkg.price}</span>
                              </>
                            ) : (
                              <>₹{pkg.price}</>
                            )}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}
                <button
                  onClick={() => { navigate('landing'); setMobileMenuOpen(false) }}
                  className="text-left px-3 py-2 rounded-lg hover:bg-brand-cream text-sm font-medium"
                >
                  Home
                </button>
                <button
                  onClick={() => { navigate('collaborate'); setMobileMenuOpen(false) }}
                  className="text-left px-3 py-2 rounded-lg hover:bg-brand-cream text-sm font-medium text-brand-orange flex items-center gap-1.5"
                >
                  <span>✨ Creator Program</span>
                </button>
                <button
                  onClick={() => { navigate('blog-archive'); setMobileMenuOpen(false) }}
                  className="text-left px-3 py-2 rounded-lg hover:bg-brand-cream text-sm font-medium"
                >
                  Blog
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
