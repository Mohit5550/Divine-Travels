'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAppStore } from '@/lib/store'
import { motion } from 'framer-motion'
import { Star, MessageSquare, Trash2, Edit3, Send, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { getAuthHeaders } from '@/lib/auth-client'

export function UserReviews() {
  const { user } = useAppStore()
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState<{ type: 'destination' | 'package'; id: string; name: string } | null>(null)
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })
  const [submitting, setSubmitting] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['user-reviews', user?.id],
    queryFn: async () => {
      const res = await fetch('/api/user/reviews', { headers: { ...getAuthHeaders() } })
      if (!res.ok) return { destinationReviews: [], packageReviews: [] }
      return res.json()
    },
  })

  const { data: completedBookings = [] } = useQuery({
    queryKey: ['user-package-bookings-completed', user?.id],
    queryFn: async () => {
      const res = await fetch('/api/package-bookings', { headers: { ...getAuthHeaders() } })
      if (!res.ok) return []
      const all = await res.json()
      return all.filter((b: any) => b.status === 'completed')
    },
  })

  const destReviews = data?.destinationReviews || []
  const pkgReviews = data?.packageReviews || []

  const submitReview = async () => {
    if (!showForm || !reviewForm.comment.trim()) {
      toast.error('Please write a review comment')
      return
    }
    setSubmitting(true)
    try {
      const endpoint = showForm.type === 'destination'
        ? '/api/reviews'
        : `/api/packages/${showForm.id}/reviews`
      const body = showForm.type === 'destination'
        ? { destinationId: showForm.id, rating: reviewForm.rating, comment: reviewForm.comment }
        : { rating: reviewForm.rating, comment: reviewForm.comment }
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders(), },
        body: JSON.stringify(body),
      })
      if (!res.ok) { const d = await res.json(); toast.error(d.error || 'Failed to submit review'); return }
      toast.success('Review submitted!')
      setShowForm(null)
      setReviewForm({ rating: 5, comment: '' })
      queryClient.invalidateQueries({ queryKey: ['user-reviews'] })
      queryClient.invalidateQueries({ queryKey: ['user-package-bookings-completed'] })
    } catch { toast.error('Failed to submit review') }
    finally { setSubmitting(false) }
  }

  const StarInput = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button key={s} type="button" onClick={() => onChange(s)} className={`p-1 transition-colors ${s <= value ? 'text-brand-gold' : 'text-gray-200'}`}>
          <Star className="w-6 h-6 fill-current" />
        </button>
      ))}
    </div>
  )

  return (
    <div>
      <h2 className="font-serif text-2xl sm:text-3xl text-brand-dark mb-6">My Reviews</h2>

      {/* Write Review for Completed Bookings */}
      {completedBookings.length > 0 && (
        <div className="bg-gradient-to-r from-brand-orange/5 to-brand-teal/5 rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-brand-dark mb-3 flex items-center gap-2"><Edit3 className="w-4 h-4 text-brand-orange" /> Review a completed booking</h3>
          <div className="flex flex-wrap gap-2">
            {completedBookings.slice(0, 5).map((b: any) => (
              <Button key={b.id} variant="outline" size="sm" onClick={() => setShowForm({ type: 'package', id: b.packageId, name: b.package?.name })}>
                <Star className="w-3 h-3 mr-1 text-brand-gold" />{b.package?.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Review Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowForm(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-brand-dark">Review: {showForm.name}</h3>
              <button onClick={() => setShowForm(null)}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <div className="mb-4">
              <label className="text-sm font-medium text-brand-dark mb-2 block">Rating</label>
              <StarInput value={reviewForm.rating} onChange={(v) => setReviewForm({ ...reviewForm, rating: v })} />
            </div>
            <div className="mb-4">
              <label className="text-sm font-medium text-brand-dark mb-2 block">Your Review</label>
              <Textarea value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} placeholder="Share your experience..." className="min-h-[100px]" />
            </div>
            <Button onClick={submitReview} disabled={submitting || !reviewForm.comment.trim()} className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white">
              <Send className="w-4 h-4 mr-2" />{submitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </motion.div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />)}</div>
      ) : destReviews.length === 0 && pkgReviews.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-brand-dark mb-2">No reviews yet</h3>
          <p className="text-muted-foreground text-sm">Reviews you write for destinations and packages will appear here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {destReviews.length > 0 && (
            <div>
              <h3 className="font-semibold text-brand-dark mb-3 flex items-center gap-2">Destination Reviews <span className="text-xs text-muted-foreground">({destReviews.length})</span></h3>
              <div className="space-y-3">
                {destReviews.map((r: any) => (
                  <div key={r.id} className="bg-white rounded-xl shadow-sm p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <img loading="lazy" decoding="async" src={r.destination?.image || '/placeholder.svg'} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      <div>
                        <p className="font-medium text-sm text-brand-dark">{r.destination?.name}</p>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < r.rating ? 'fill-brand-gold text-brand-gold' : 'text-gray-200'}`} />)}
                        </div>
                      </div>
                      <span className="ml-auto text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{r.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {pkgReviews.length > 0 && (
            <div>
              <h3 className="font-semibold text-brand-dark mb-3 flex items-center gap-2">Package Reviews <span className="text-xs text-muted-foreground">({pkgReviews.length})</span></h3>
              <div className="space-y-3">
                {pkgReviews.map((r: any) => (
                  <div key={r.id} className="bg-white rounded-xl shadow-sm p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <img loading="lazy" decoding="async" src={r.package?.image || '/placeholder.svg'} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      <div>
                        <p className="font-medium text-sm text-brand-dark">{r.package?.name}</p>
                        <span className="text-xs text-muted-foreground capitalize">{r.package?.category}</span>
                      </div>
                      <div className="ml-auto flex items-center gap-1">
                        {[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < r.rating ? 'fill-brand-gold text-brand-gold' : 'text-gray-200'}`} />)}
                        <span className="text-xs text-muted-foreground ml-1">{new Date(r.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{r.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
