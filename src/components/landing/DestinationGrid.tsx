'use client'

import { useQuery } from '@tanstack/react-query'
import { useAppStore } from '@/lib/store'
import { motion } from 'framer-motion'
import { Heart, Star, ArrowRight, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { toast } from 'sonner'
import { getAuthHeaders } from '@/lib/auth-client'

interface Destination {
  slug?: string
  id: string
  name: string
  tagline: string
  price: number
  rating: number
  reviewCount: number
  image: string
  badge: string | null
  badgeColor: string | null
  tags: string
  state: string
  category: string
}

interface DestinationGridProps {
  searchQuery?: string
  activeCategory: string
}

export function DestinationGrid({ searchQuery = '', activeCategory }: DestinationGridProps) {
  const { navigate, isAuthenticated, user } = useAppStore()
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set())

  const { data: destinations = [], isLoading } = useQuery({
    queryKey: ['destinations', activeCategory, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (activeCategory && activeCategory !== 'all') params.set('category', activeCategory)
      if (searchQuery) params.set('search', searchQuery)
      const res = await fetch(`/api/destinations?${params}`)
      return res.json() as Promise<Destination[]>
    },
  })

  // Fetch wishlist if authenticated
  useQuery({
    queryKey: ['wishlist', user?.id],
    queryFn: async () => {
      const res = await fetch('/api/wishlist', {
        headers: { ...getAuthHeaders() },
      })
      if (!res.ok) return []
      const data = await res.json() as Array<{ destinationId: string }>
      setWishlistIds(new Set(data.map((w) => w.destinationId)))
      return data
    },
    enabled: isAuthenticated,
  })

  const toggleWishlist = async (e: React.MouseEvent, destId: string) => {
    e.stopPropagation()
    if (!isAuthenticated) {
      toast.error('Please login to add to wishlist')
      return
    }
    try {
      if (wishlistIds.has(destId)) {
        await fetch('/api/wishlist', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json', ...getAuthHeaders(), },
          body: JSON.stringify({ destinationId: destId }),
        })
        setWishlistIds((prev) => {
          const next = new Set(prev)
          next.delete(destId)
          return next
        })
        toast.success('Removed from wishlist')
      } else {
        await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeaders(), },
          body: JSON.stringify({ destinationId: destId }),
        })
        setWishlistIds((prev) => new Set(prev).add(destId))
        toast.success('Added to wishlist')
      }
    } catch {
      toast.error('Failed to update wishlist')
    }
  }

  const getBadgeColorClass = (color: string | null) => {
    switch (color) {
      case 'orange': return 'bg-brand-orange text-white'
      case 'green': return 'bg-green-600 text-white'
      case 'blue': return 'bg-blue-600 text-white'
      case 'sky': return 'bg-sky-500 text-white'
      case 'amber': return 'bg-amber-600 text-white'
      default: return 'bg-white/90 text-brand-dark'
    }
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="aspect-[4/5] rounded-2xl bg-muted animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <section id="destinations" className="py-16 sm:py-20 bg-brand-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 sm:mb-14"
        >
          <span className="text-brand-orange text-sm font-semibold tracking-wider uppercase">
            Popular Destinations
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-brand-dark mt-2">
            Explore Sacred Places
          </h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            Discover handpicked destinations in the divine land of Uttarakhand
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((dest, index) => (
            <motion.div
              key={dest.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="group cursor-pointer"
              onClick={() => navigate('destination-detail', dest.slug || dest.id)}
            >
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-lg">
                {/* Image */}
                <img loading="lazy" decoding="async"
                  src={dest.image}
                  alt={dest.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Badge */}
                {dest.badge && (
                  <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold ${getBadgeColorClass(dest.badgeColor)}`}>
                    {dest.badge}
                  </div>
                )}

                {/* Heart */}
                <button
                  onClick={(e) => toggleWishlist(e, dest.id)}
                  className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all hover:bg-white/40"
                >
                  <Heart
                    className={`w-4 h-4 transition-colors ${
                      wishlistIds.has(dest.id) ? 'fill-red-500 text-red-500' : 'text-white'
                    }`}
                  />
                </button>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                  <div className="flex items-center gap-1 text-white/70 text-xs mb-1">
                    <MapPin className="w-3 h-3" />
                    {dest.state}
                  </div>
                  <h3 className="text-white font-semibold text-lg sm:text-xl">{dest.name}</h3>
                  <p className="text-white/70 text-sm mt-0.5 line-clamp-1">{dest.tagline}</p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {dest.tags.split(',').map((tag) => (
                      <span
                        key={tag}
                        className="bg-white/15 backdrop-blur-sm text-white/90 text-[10px] px-2 py-0.5 rounded-full"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>

                  {/* Price and Rating */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/20">
                    <div>
                      <span className="text-brand-orange font-bold text-lg">₹{dest.price.toLocaleString()}</span>
                      <span className="text-white/50 text-xs ml-1">/person</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-brand-gold text-brand-gold" />
                      <span className="text-white text-sm font-medium">{dest.rating}</span>
                      <span className="text-white/50 text-xs">({dest.reviewCount})</span>
                    </div>
                  </div>
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-brand-orange/0 group-hover:bg-brand-orange/10 transition-colors duration-300" />
              </div>

              {/* Uttarakhand Badge */}
              <div className="flex items-center justify-between mt-2 px-1">
                <span className="text-xs text-muted-foreground">{dest.state}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-brand-orange text-xs p-0 h-auto hover:bg-transparent"
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate('destination-detail', dest.slug || dest.id)
                  }}
                >
                  View Details <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {destinations.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">No destinations found matching your criteria.</p>
          </div>
        )}
      </div>
    </section>
  )
}
