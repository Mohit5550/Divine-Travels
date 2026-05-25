'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAppStore } from '@/lib/store'
import { motion } from 'framer-motion'
import { Heart, MapPin, Star, ArrowRight, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function UserWishlist() {
  const { user, navigate } = useAppStore()
  const queryClient = useQueryClient()

  const { data: wishlist = [], isLoading } = useQuery({
    queryKey: ['wishlist', user?.id],
    queryFn: async () => {
      const res = await fetch('/api/wishlist', {
        headers: { 'x-user-id': user?.id || '' },
      })
      return res.json()
    },
  })

  const removeWishlist = async (destinationId: string) => {
    try {
      await fetch('/api/wishlist', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || '',
        },
        body: JSON.stringify({ destinationId }),
      })
      toast.success('Removed from wishlist')
      queryClient.invalidateQueries({ queryKey: ['wishlist'] })
    } catch {
      toast.error('Failed to remove from wishlist')
    }
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-48 bg-muted rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div>
      <h2 className="font-serif text-2xl sm:text-3xl text-brand-dark mb-6">My Wishlist</h2>

      {wishlist.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-brand-dark mb-2">Your wishlist is empty</h3>
          <p className="text-muted-foreground text-sm mb-4">Save destinations you love and plan your next trip!</p>
          <Button
            onClick={() => navigate('landing')}
            className="bg-brand-orange hover:bg-brand-orange/90 text-white"
          >
            Explore Destinations
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {wishlist.map((item: {
            id: string
            destination: {
              id: string
              name: string
              tagline: string
              image: string
              state: string
              price: number
              rating: number
            }
          }) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-sm overflow-hidden group"
            >
              <div className="relative h-40">
                <img
                  src={item.destination.image}
                  alt={item.destination.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <button
                  onClick={() => removeWishlist(item.destination.id)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-red-500/80 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 text-white" />
                </button>
                <div className="absolute bottom-3 left-3">
                  <h3 className="text-white font-semibold">{item.destination.name}</h3>
                  <div className="flex items-center gap-1 text-white/70 text-xs">
                    <MapPin className="w-3 h-3" />
                    {item.destination.state}
                  </div>
                </div>
              </div>
              <div className="p-4">
                <p className="text-muted-foreground text-sm line-clamp-1">{item.destination.tagline}</p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-brand-gold text-brand-gold" />
                    <span className="text-sm font-medium">{item.destination.rating}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-brand-orange">₹{item.destination.price.toLocaleString()}</span>
                    <Button
                      size="sm"
                      className="bg-brand-orange hover:bg-brand-orange/90 text-white text-xs h-8"
                      onClick={() => navigate('destination-detail', item.destination.id)}
                    >
                      Book <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
