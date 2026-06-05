'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAppStore } from '@/lib/store'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, MapPin, Star, ArrowRight, Trash2, Package, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function UserWishlist() {
  const { user, navigate } = useAppStore()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<'destinations' | 'packages'>('destinations')

  const { data: destWishlist = [], isLoading: destLoading } = useQuery({
    queryKey: ['wishlist', user?.id],
    queryFn: async () => {
      const res = await fetch('/api/wishlist', { headers: { 'x-user-id': user?.id || '' } })
      return res.json()
    },
  })

  const { data: pkgWishlist = [], isLoading: pkgLoading } = useQuery({
    queryKey: ['package-wishlist', user?.id],
    queryFn: async () => {
      const res = await fetch('/api/package-wishlist', { headers: { 'x-user-id': user?.id || '' } })
      return res.json()
    },
  })

  const removeDestWishlist = async (destinationId: string) => {
    try {
      await fetch('/api/wishlist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user?.id || '' },
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
        headers: { 'Content-Type': 'application/json', 'x-user-id': user?.id || '' },
        body: JSON.stringify({ packageId }),
      })
      toast.success('Removed from wishlist')
      queryClient.invalidateQueries({ queryKey: ['package-wishlist'] })
    } catch { toast.error('Failed to remove') }
  }

  const isLoading = destLoading || pkgLoading
  const isEmpty = tab === 'destinations' ? destWishlist.length === 0 : pkgWishlist.length === 0
  const items = tab === 'destinations' ? destWishlist : pkgWishlist

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
          </button>
          <button
            onClick={() => setTab('packages')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === 'packages' ? 'bg-white shadow-sm text-brand-dark' : 'text-muted-foreground'}`}
          >
            <Package className="w-3.5 h-3.5 inline mr-1" />Packages
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
            {tab === 'destinations' ? (
              destWishlist.map((item: any) => (
                <motion.div key={item.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-xl shadow-sm overflow-hidden group">
                  <div className="relative h-40">
                    <img src={item.destination?.image || '/placeholder.svg'} alt={item.destination?.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <button onClick={() => removeDestWishlist(item.destination.id)} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-red-500/80 transition-colors">
                      <Trash2 className="w-3.5 h-3.5 text-white" />
                    </button>
                    <div className="absolute bottom-3 left-3">
                      <h3 className="text-white font-semibold">{item.destination?.name}</h3>
                      <div className="flex items-center gap-1 text-white/70 text-xs"><MapPin className="w-3 h-3" />{item.destination?.state}</div>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-muted-foreground text-sm line-clamp-1">{item.destination?.tagline}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1"><Star className="w-4 h-4 fill-brand-gold text-brand-gold" /><span className="text-sm font-medium">{item.destination?.rating}</span></div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-brand-orange">₹{item.destination?.price?.toLocaleString()}</span>
                        <Button size="sm" className="bg-brand-orange hover:bg-brand-orange/90 text-white text-xs h-8" onClick={() => navigate('destination-detail', item.destination.id)}>Book <ArrowRight className="w-3 h-3 ml-1" /></Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              pkgWishlist.map((item: any) => (
                <motion.div key={item.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-xl shadow-sm overflow-hidden group">
                  <div className="relative h-40">
                    <img src={item.package?.image || '/placeholder.svg'} alt={item.package?.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <button onClick={() => removePkgWishlist(item.package.id)} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-red-500/80 transition-colors">
                      <Trash2 className="w-3.5 h-3.5 text-white" />
                    </button>
                    <div className="absolute bottom-3 left-3">
                      <h3 className="text-white font-semibold">{item.package?.name}</h3>
                      <div className="flex items-center gap-1 text-white/70 text-xs"><Package className="w-3 h-3" />{item.package?.category} {item.package?.duration ? `• ${item.package.duration}` : ''}</div>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-muted-foreground text-sm line-clamp-1">{item.package?.tagline}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-brand-gold text-brand-gold" />
                        <span className="text-sm font-medium">{item.package?.rating}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-brand-orange">₹{item.package?.price?.toLocaleString()}</span>
                        <Button size="sm" className="bg-brand-orange hover:bg-brand-orange/90 text-white text-xs h-8" onClick={() => navigate('package-detail', null, item.package.id)}>
                          Book <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}
