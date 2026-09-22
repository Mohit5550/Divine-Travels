'use client'

import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAppStore } from '@/lib/store'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, MapPin, Star, ArrowRight, Trash2, Package, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { getAuthHeaders } from '@/lib/auth-client'

const TOUR_CATEGORIES = ['international-tours', 'domestic-tours', 'spiritual-tours']

export function UserWishlist() {
  const { user, navigate } = useAppStore()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<'destinations' | 'packages'>('destinations')

  const { data: destWishlist = [], isLoading: destLoading } = useQuery({
    queryKey: ['wishlist', user?.id],
    queryFn: async () => {
      const res = await fetch('/api/wishlist', { headers: { ...getAuthHeaders() } })
      if (!res.ok) return []
      return res.json()
    },
  })

  const { data: pkgWishlist = [], isLoading: pkgLoading } = useQuery({
    queryKey: ['package-wishlist', user?.id],
    queryFn: async () => {
      const res = await fetch('/api/package-wishlist', { headers: { ...getAuthHeaders() } })
      if (!res.ok) return []
      return res.json()
    },
  })

  const removeDestWishlist = async (destinationId: string) => {
    try {
      await fetch('/api/wishlist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders(), },
        body: JSON.stringify({ destinationId }),
      })
      toast.success('Removed from wishlist')
      queryClient.invalidateQueries({ queryKey: ['wishlist'] })
    } catch { toast.error('Failed to remove') }
  }

  const removePkgWishlist = async (packageId: string) => {
    try {
      await fetch('/api/package-wishlist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders(), },
        body: JSON.stringify({ packageId }),
      })
      toast.success('Removed from wishlist')
      queryClient.invalidateQueries({ queryKey: ['package-wishlist'] })
    } catch { toast.error('Failed to remove') }
  }

  // International / Domestic / Spiritual tour packages appear under Destinations.
  const tourPkgWishlist = pkgWishlist.filter((it: any) => TOUR_CATEGORIES.includes(it.package?.category))
  const otherPkgWishlist = pkgWishlist.filter((it: any) => !TOUR_CATEGORIES.includes(it.package?.category))

  const isLoading = destLoading || pkgLoading
  const destCount = destWishlist.length + tourPkgWishlist.length
  const pkgCount = otherPkgWishlist.length
  const isEmpty = tab === 'destinations' ? destCount === 0 : pkgCount === 0

  // Build a unified list per tab (destination items + tour package items share the Destinations tab).
  const items =
    tab === 'destinations'
      ? [
          ...destWishlist.map((d: any) => ({ kind: 'destination' as const, data: d })),
          ...tourPkgWishlist.map((p: any) => ({ kind: 'package' as const, data: p })),
        ]
      : otherPkgWishlist.map((p: any) => ({ kind: 'package' as const, data: p }))

  // Auto-select the sub-tab that actually has items.
  useEffect(() => {
    if (destCount === 0 && pkgCount > 0) setTab('packages')
    else if (pkgCount === 0 && destCount > 0) setTab('destinations')
  }, [destCount, pkgCount])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl sm:text-3xl text-brand-dark">My Wishlist</h2>
        <div className="flex bg-brand-cream rounded-lg p-1">
          <button
            onClick={() => setTab('destinations')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === 'destinations' ? 'bg-white shadow-sm text-brand-dark' : 'text-muted-foreground'}`}
          >
            <MapPin className="w-3.5 h-3.5 inline mr-1" />Destinations
            {destCount > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center min-w-[18px] h-4 px-1 rounded-full bg-brand-orange text-white text-[10px] font-bold">{destCount}</span>
            )}
          </button>
          <button
            onClick={() => setTab('packages')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === 'packages' ? 'bg-white shadow-sm text-brand-dark' : 'text-muted-foreground'}`}
          >
            <Package className="w-3.5 h-3.5 inline mr-1" />Packages
            {pkgCount > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center min-w-[18px] h-4 px-1 rounded-full bg-brand-orange text-white text-[10px] font-bold">{pkgCount}</span>
            )}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-48 bg-muted rounded-xl animate-pulse" />)}
        </div>
      ) : isEmpty ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-brand-dark mb-2">Your wishlist is empty</h3>
          <p className="text-muted-foreground text-sm mb-4">
            {tab === 'destinations' ? 'Save destinations you love!' : 'Save packages you love!'}
          </p>
          <Button onClick={() => navigate('landing')} className="bg-brand-orange hover:bg-brand-orange/90 text-white">
            Explore {tab === 'destinations' ? 'Destinations' : 'Packages'}
          </Button>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {items.map((item: any) =>
              item.kind === 'destination' ? (
                <motion.div key={`dest-${item.data.id}`} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-xl shadow-sm overflow-hidden group">
                  <div className="relative h-40">
                    <img loading="lazy" decoding="async" src={item.data.destination?.image || '/placeholder.svg'} alt={item.data.destination?.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <button onClick={() => removeDestWishlist(item.data.destination?.id)} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-red-500/80 transition-colors">
                      <Trash2 className="w-3.5 h-3.5 text-white" />
                    </button>
                    <div className="absolute bottom-3 left-3">
                      <h3 className="text-white font-semibold">{item.data.destination?.name}</h3>
                      <div className="flex items-center gap-1 text-white/70 text-xs"><MapPin className="w-3 h-3" />{item.data.destination?.state}</div>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-muted-foreground text-sm line-clamp-1">{item.data.destination?.tagline}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1"><Star className="w-4 h-4 fill-brand-gold text-brand-gold" /><span className="text-sm font-medium">{item.data.destination?.rating}</span></div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-brand-orange">₹{item.data.destination?.price?.toLocaleString()}</span>
                        <Button size="sm" className="bg-brand-orange hover:bg-brand-orange/90 text-white text-xs h-8" onClick={() => navigate('destination-detail', item.data.destination?.slug || item.data.destination?.id)}>Book <ArrowRight className="w-3 h-3 ml-1" /></Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div key={`pkg-${item.data.id}`} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-xl shadow-sm overflow-hidden group">
                  <div className="relative h-40">
                    <img loading="lazy" decoding="async" src={item.data.package?.image || '/placeholder.svg'} alt={item.data.package?.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <button onClick={() => removePkgWishlist(item.data.package?.id)} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-red-500/80 transition-colors">
                      <Trash2 className="w-3.5 h-3.5 text-white" />
                    </button>
                    <div className="absolute bottom-3 left-3">
                      <h3 className="text-white font-semibold">{item.data.package?.name}</h3>
                      <div className="flex items-center gap-1 text-white/70 text-xs"><Package className="w-3 h-3" />{item.data.package?.category} {item.data.package?.duration ? `• ${item.data.package.duration}` : ''}</div>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-muted-foreground text-sm line-clamp-1">{item.data.package?.tagline}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-brand-gold text-brand-gold" />
                        <span className="text-sm font-medium">{item.data.package?.rating}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-brand-orange">₹{item.data.package?.price?.toLocaleString()}</span>
                        <Button size="sm" className="bg-brand-orange hover:bg-brand-orange/90 text-white text-xs h-8" onClick={() => navigate('package-detail', null, item.data.package?.slug || item.data.package?.id)}>
                          Book <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}
