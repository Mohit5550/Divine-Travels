'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAppStore } from '@/lib/store'
import { AddToCartButton } from '@/components/cart/AddToCartButton'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  MapPin,
  Star,
  Heart,
  Calendar,
  Users,
  Phone,
  MessageSquare,
  Send,
  Clock,
  Shield,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { useState } from 'react'

export function DestinationDetail() {
  const { selectedDestinationId, navigate, goBack, isAuthenticated, user } = useAppStore()
  const queryClient = useQueryClient()
  const [bookingForm, setBookingForm] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1,
    phone: '',
    specialReqs: '',
  })
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })
  const [submittingBooking, setSubmittingBooking] = useState(false)
  const [submittingReview, setSubmittingReview] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)

  const { data: destination, isLoading } = useQuery({
    queryKey: ['destination', selectedDestinationId],
    queryFn: async () => {
      const res = await fetch(`/api/destinations/${selectedDestinationId}`)
      if (!res.ok) throw new Error('Not found')
      return res.json()
    },
    enabled: !!selectedDestinationId,
  })

  // Check wishlist
  useQuery({
    queryKey: ['wishlist-check', user?.id, selectedDestinationId],
    queryFn: async () => {
      const res = await fetch('/api/wishlist', {
        headers: { 'x-user-id': user?.id || '' },
      })
      if (!res.ok) return []
      const data = await res.json()
      setIsWishlisted(data.some((w: { destinationId: string }) => w.destinationId === selectedDestinationId))
      return data
    },
    enabled: isAuthenticated && !!selectedDestinationId,
  })

  const toggleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add to wishlist')
      return
    }
    try {
      if (isWishlisted) {
        await fetch('/api/wishlist', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json', 'x-user-id': user?.id || '' },
          body: JSON.stringify({ destinationId: selectedDestinationId }),
        })
        setIsWishlisted(false)
        queryClient.invalidateQueries({ queryKey: ['wishlist'] })
        toast.success('Removed from wishlist')
      } else {
        await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-user-id': user?.id || '' },
          body: JSON.stringify({ destinationId: selectedDestinationId }),
        })
        setIsWishlisted(true)
        queryClient.invalidateQueries({ queryKey: ['wishlist'] })
        toast.success('Added to wishlist')
      }
    } catch {
      toast.error('Failed to update wishlist')
    }
  }

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated) {
      toast.error('Please login to book')
      return
    }

    if (!bookingForm.checkIn || !bookingForm.checkOut) {
      toast.error('Please select check-in and check-out dates')
      return
    }

    setSubmittingBooking(true)
    try {
      const nights = Math.ceil(
        (new Date(bookingForm.checkOut).getTime() - new Date(bookingForm.checkIn).getTime()) / (1000 * 60 * 60 * 24)
      )
      const totalPrice = destination.price * bookingForm.guests * Math.max(nights, 1)

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || '',
        },
        body: JSON.stringify({
          destinationId: selectedDestinationId,
          checkIn: bookingForm.checkIn,
          checkOut: bookingForm.checkOut,
          guests: bookingForm.guests,
          totalPrice,
          phone: bookingForm.phone,
          specialReqs: bookingForm.specialReqs,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Failed to create booking')
        return
      }

      const booking = await res.json()
      toast.success('Booking created successfully!')
      navigate('booking-success', selectedDestinationId)
      // Store booking data for success page
      queryClient.invalidateQueries({ queryKey: ['user-bookings'] })
    } catch {
      toast.error('Failed to create booking')
    } finally {
      setSubmittingBooking(false)
    }
  }

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated) {
      toast.error('Please login to write a review')
      return
    }

    setSubmittingReview(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || '',
        },
        body: JSON.stringify({
          destinationId: selectedDestinationId,
          rating: reviewForm.rating,
          comment: reviewForm.comment,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Failed to submit review')
        return
      }

      toast.success('Review submitted!')
      setReviewForm({ rating: 5, comment: '' })
      queryClient.invalidateQueries({ queryKey: ['destination', selectedDestinationId] })
    } catch {
      toast.error('Failed to submit review')
    } finally {
      setSubmittingReview(false)
    }
  }

  if (isLoading || !destination) {
    return (
      <div className="min-h-screen bg-brand-cream pt-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="h-96 bg-muted rounded-2xl animate-pulse" />
        </div>
      </div>
    )
  }

  const nights = bookingForm.checkIn && bookingForm.checkOut
    ? Math.max(Math.ceil((new Date(bookingForm.checkOut).getTime() - new Date(bookingForm.checkIn).getTime()) / (1000 * 60 * 60 * 24)), 1)
    : 1
  const totalPrice = destination.price * bookingForm.guests * nights

  return (
    <div className="min-h-screen bg-brand-cream pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => goBack()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Destinations
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative rounded-2xl overflow-hidden h-64 sm:h-96"
            >
              <img
                src={destination.image}
                alt={destination.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-center gap-2 text-white/70 text-sm mb-2">
                  <MapPin className="w-4 h-4" />
                  {destination.state}
                </div>
                <h1 className="font-serif text-3xl sm:text-4xl text-white">{destination.name}</h1>
                <p className="text-white/80 mt-1">{destination.tagline}</p>
              </div>
              <button
                onClick={toggleWishlist}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/40 transition-colors"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-white'}`} />
              </button>
            </motion.div>

            {/* Info Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                <Star className="w-5 h-5 text-brand-gold mx-auto mb-1" />
                <p className="font-bold text-lg text-brand-dark">{destination.rating}</p>
                <p className="text-xs text-muted-foreground">{destination.reviewCount} reviews</p>
              </div>
              <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                <Clock className="w-5 h-5 text-brand-teal mx-auto mb-1" />
                <p className="font-bold text-lg text-brand-dark">3-5</p>
                <p className="text-xs text-muted-foreground">Days Ideal</p>
              </div>
              <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                <Shield className="w-5 h-5 text-green-500 mx-auto mb-1" />
                <p className="font-bold text-lg text-brand-dark">Safe</p>
                <p className="text-xs text-muted-foreground">Travel Rating</p>
              </div>
            </div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <h2 className="font-serif text-xl text-brand-dark mb-3">About {destination.name}</h2>
              <p className="text-muted-foreground leading-relaxed">{destination.description}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                {(destination.tags || '').split(',').filter(Boolean).map((tag: string) => (
                  <span
                    key={tag}
                    className="bg-brand-orange/10 text-brand-orange text-sm px-3 py-1 rounded-full"
                  >
                    {tag.trim()}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Reviews */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <h2 className="font-serif text-xl text-brand-dark mb-4">
                Reviews ({destination.reviews?.length || 0})
              </h2>

              {destination.reviews?.length > 0 ? (
                <div className="space-y-4 mb-6">
                  {destination.reviews.map((review: {
                    id: string
                    rating: number
                    comment: string
                    createdAt: string
                    user: { name: string }
                  }) => (
                    <div key={review.id} className="border-b border-border/50 pb-4 last:border-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-brand-orange/10 flex items-center justify-center">
                          <span className="text-brand-orange font-semibold text-xs">
                            {review.user.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-sm text-brand-dark">{review.user.name}</p>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${i < review.rating ? 'fill-brand-gold text-brand-gold' : 'text-gray-200'}`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="ml-auto text-xs text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground ml-10">{review.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm mb-6">No reviews yet. Be the first to review!</p>
              )}

              {/* Write Review */}
              {isAuthenticated && (
                <form onSubmit={handleReview} className="border-t border-border pt-4">
                  <h3 className="font-medium text-sm text-brand-dark mb-3">Write a Review</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm text-muted-foreground">Rating:</span>
                    {[...Array(5)].map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setReviewForm({ ...reviewForm, rating: i + 1 })}
                      >
                        <Star className={`w-5 h-5 ${
                          i < reviewForm.rating ? 'fill-brand-gold text-brand-gold' : 'text-gray-200'
                        }`} />
                      </button>
                    ))}
                  </div>
                  <Textarea
                    placeholder="Share your experience..."
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    rows={3}
                    className="mb-3"
                    required
                  />
                  <Button
                    type="submit"
                    disabled={submittingReview}
                    size="sm"
                    className="bg-brand-orange hover:bg-brand-orange/90 text-white"
                  >
                    <Send className="w-3 h-3 mr-1" />
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </Button>
                </form>
              )}
            </motion.div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm p-6 sticky top-24"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-2xl font-bold text-brand-orange">₹{destination.price.toLocaleString()}</span>
                  <span className="text-muted-foreground text-sm"> /person/night</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-brand-gold text-brand-gold" />
                  <span className="font-medium">{destination.rating}</span>
                </div>
              </div>

              <form onSubmit={handleBooking} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-brand-dark mb-1 block">Check-in</label>
                    <Input
                      type="date"
                      value={bookingForm.checkIn}
                      onChange={(e) => setBookingForm({ ...bookingForm, checkIn: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                      className="h-10 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-brand-dark mb-1 block">Check-out</label>
                    <Input
                      type="date"
                      value={bookingForm.checkOut}
                      onChange={(e) => setBookingForm({ ...bookingForm, checkOut: e.target.value })}
                      min={bookingForm.checkIn || new Date().toISOString().split('T')[0]}
                      className="h-10 text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-brand-dark mb-1 block">Guests</label>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      value={bookingForm.guests}
                      onChange={(e) => setBookingForm({ ...bookingForm, guests: Number(e.target.value) })}
                      className="h-10 text-sm w-20"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-brand-dark mb-1 block">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="tel"
                      value={bookingForm.phone}
                      onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                      className="h-10 text-sm pl-10"
                      placeholder="+91 9876543210"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-brand-dark mb-1 block">Special Requests</label>
                  <Textarea
                    value={bookingForm.specialReqs}
                    onChange={(e) => setBookingForm({ ...bookingForm, specialReqs: e.target.value })}
                    rows={2}
                    className="text-sm"
                    placeholder="Any special requirements..."
                  />
                </div>

                {/* Price Summary */}
                <div className="bg-brand-cream rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">₹{destination.price.toLocaleString()} × {bookingForm.guests} guests × {nights} nights</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
                    <span>Total</span>
                    <span className="text-brand-orange">₹{totalPrice.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={submittingBooking}
                    className="flex-1 bg-brand-orange hover:bg-brand-orange/90 text-white h-12 text-base"
                  >
                    {submittingBooking ? 'Processing...' : 'Book Now'}
                  </Button>
                  <AddToCartButton
                    item={{ key: `destination:${selectedDestinationId}`, type: 'destination', refId: selectedDestinationId, title: destination.name, image: destination.image, price: destination.price }}
                    className="h-12"
                    variant="outline"
                  />
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
