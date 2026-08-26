'use client'

import { useQuery } from '@tanstack/react-query'
import { ShoppingCart, ShoppingBag, Trash2, ArrowRight, Star, MapPin, Clock, Globe, Mountain } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/lib/cart'
import { useAppStore } from '@/lib/store'

export function UserCartPanel({ navigate }: { navigate: (view: string, destId?: string | null, pkgId?: string | null) => void }) {
  const { items, removeItem, clear } = useCart()

  const packageIds = items.filter((i) => i.type === 'package').map((i) => i.refId).filter(Boolean).join(',')
  const destinationIds = items.filter((i) => i.type === 'destination').map((i) => i.refId).filter(Boolean).join(',')

  const { data: cartDetails } = useQuery({
    queryKey: ['cart-details', packageIds, destinationIds],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (packageIds) params.set('packageIds', packageIds)
      if (destinationIds) params.set('destinationIds', destinationIds)
      const res = await fetch(`/api/cart-items?${params.toString()}`)
      return res.json()
    },
    enabled: items.length > 0,
  })

  const enrichedItems = items.map((item) => {
    if (item.type === 'package' && cartDetails?.packages) {
      const pkg = cartDetails.packages.find((p: any) => p.id === item.refId)
      if (pkg) return { ...item, ...pkg }
    }
    if (item.type === 'destination' && cartDetails?.destinations) {
      const dest = cartDetails.destinations.find((d: any) => d.id === item.refId)
      if (dest) return { ...item, ...dest }
    }
    return item
  })

  const getCategoryIcon = (category: string) => {
    if (!category) return <Globe className="w-3 h-3" />
    const c = category.toLowerCase()
    if (c.includes('international')) return <Globe className="w-3 h-3" />
    if (c.includes('domestic') || c.includes('trek') || c.includes('mountain')) return <Mountain className="w-3 h-3" />
    if (c.includes('spiritual') || c.includes('pilgrimage')) return <Star className="w-3 h-3" />
    return <MapPin className="w-3 h-3" />
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl text-brand-dark">My Cart</h2>
        {items.length > 0 && (
          <Button variant="outline" size="sm" className="text-red-500 border-red-200 hover:bg-red-50" onClick={clear}>
            Clear Cart
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <ShoppingBag className="w-14 h-14 text-gray-300 mx-auto mb-4" />
          <h3 className="font-semibold text-brand-dark mb-1">Your cart is empty</h3>
          <p className="text-muted-foreground text-sm mb-6">Add destinations and packages to plan your trip.</p>
          <Button className="bg-brand-orange hover:bg-brand-orange/90 text-white" onClick={() => navigate('landing')}>
            Explore Packages
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {enrichedItems.map((item) => {
            const displayName = item.name || item.title || 'Untitled'
            const displayImage = item.image || '/placeholder.svg'
            const displayPrice = item.price ?? null
            const displayCategory = item.category || (item.type === 'destination' ? 'destination' : 'package')
            const displayDuration = item.duration || ''
            const displayDescription = item.tagline || item.subtitle || item.description || ''
            const displayRating = item.rating ?? null
            const displayReviewCount = item.reviewCount ?? 0

            return (
              <div key={item.key} className="bg-white rounded-2xl shadow-sm border border-border/50 overflow-hidden flex flex-col">
                {/* Image section */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={displayImage}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Delete button */}
                  <button
                    onClick={() => removeItem(item.key)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-sm"
                    aria-label="Remove from cart"
                  >
                    <Trash2 className="w-4 h-4 text-gray-600" />
                  </button>

                  {/* Text overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-semibold text-lg leading-tight">{displayName}</h3>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full">
                        {getCategoryIcon(displayCategory)}
                        {displayCategory}
                      </span>
                      {displayDuration && (
                        <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full">
                          <Clock className="w-3 h-3" />
                          {displayDuration}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Content section */}
                <div className="p-4 flex flex-col flex-1">
                  {displayDescription && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{displayDescription}</p>
                  )}

                  <div className="mt-auto flex items-center justify-between">
                    {/* Rating */}
                    <div className="flex items-center gap-1">
                      {displayRating != null && displayRating > 0 ? (
                        <>
                          <Star className="w-4 h-4 text-brand-gold fill-brand-gold" />
                          <span className="text-sm font-medium text-brand-dark">{displayRating}</span>
                          {displayReviewCount > 0 && (
                            <span className="text-xs text-muted-foreground">({displayReviewCount})</span>
                          )}
                        </>
                      ) : (
                        <span className="text-sm text-muted-foreground">New</span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Price */}
                      {displayPrice != null && (
                        <span className="text-lg font-bold text-brand-orange">
                          ₹{displayPrice.toLocaleString('en-IN')}
                        </span>
                      )}

                      {/* Book button */}
                      <Button
                        size="sm"
                        className="bg-brand-orange hover:bg-brand-orange/90 text-white h-9 px-4 rounded-lg text-sm font-medium"
                        onClick={() => {
                          if (item.type === 'destination') navigate('destination-detail', item.refId)
                          else if (item.type === 'package') navigate('package-detail', null, item.refId)
                          else navigate('landing')
                        }}
                      >
                        Book <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {items.length > 0 && (
        <p className="text-xs text-muted-foreground text-center pt-4">
          {items.length} item{items.length > 1 ? 's' : ''} in your cart
        </p>
      )}
    </div>
  )
}
