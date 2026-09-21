'use client'
import { useState, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAppStore } from '@/lib/store'
import { CheckCircle, XCircle, Trash2, Star, Package, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/ui/Pagination'
import { toast } from 'sonner'
import { getAuthHeaders } from '@/lib/auth-client'

export function AdminReviews() {
  const { user } = useAppStore()
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState<'all' | 'destination' | 'package'>('all')
  const [page, setPage] = useState(1)
  const destTotalPagesRef = useRef(1)
  const pkgTotalPagesRef = useRef(1)

  const { data: destReviews = [], isLoading: loading1 } = useQuery({
    queryKey: ['admin-reviews-dest', user?.id, page],
    queryFn: async () => {
      const res = await fetch(`/api/admin/reviews?page=${page}&limit=20&for=destination`, { headers: { ...getAuthHeaders() } })
      if (!res.ok) return []
      const json = await res.json()
      if (json && !Array.isArray(json) && json.data) {
        destTotalPagesRef.current = json.totalPages || 1
        return json.data
      }
      destTotalPagesRef.current = 1
      return Array.isArray(json) ? json : []
    },
  })

  const { data: pkgReviews = [], isLoading: loading2 } = useQuery({
    queryKey: ['admin-reviews-pkg', user?.id, page],
    queryFn: async () => {
      const res = await fetch(`/api/admin/reviews?page=${page}&limit=20&for=package`, { headers: { ...getAuthHeaders() } })
      if (!res.ok) return []
      const json = await res.json()
      if (json && !Array.isArray(json) && json.data) {
        pkgTotalPagesRef.current = json.totalPages || 1
        return json.data
      }
      pkgTotalPagesRef.current = 1
      return Array.isArray(json) ? json : []
    },
  })

  const toggleApprove = async (reviewId: string, approved: boolean, for_pkg: string) => {
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders(), },
        body: JSON.stringify({ reviewId, approved, for_pkg }),
      })
      if (!res.ok) { toast.error('Failed to update'); return }
      toast.success(approved ? 'Review approved' : 'Review hidden')
      queryClient.invalidateQueries({ queryKey: ['admin-reviews-dest'] })
      queryClient.invalidateQueries({ queryKey: ['admin-reviews-pkg'] })
    } catch { toast.error('Failed to update') }
  }

  const handleDelete = async (reviewId: string, for_pkg: string) => {
    if (!confirm('Delete this review permanently?')) return
    try {
      const res = await fetch(`/api/admin/reviews?reviewId=${reviewId}&for=${for_pkg}`, {
        method: 'DELETE', headers: { ...getAuthHeaders() },
      })
      if (!res.ok) { toast.error('Failed to delete'); return }
      toast.success('Review deleted')
      queryClient.invalidateQueries({ queryKey: ['admin-reviews-dest'] })
      queryClient.invalidateQueries({ queryKey: ['admin-reviews-pkg'] })
    } catch { toast.error('Failed to delete') }
  }

  const reviews = filter === 'all' ? [...destReviews, ...pkgReviews.map((r: Record<string, unknown>) => ({ ...r, _type: 'package' }))]
    : filter === 'destination' ? destReviews
    : pkgReviews.map((r: Record<string, unknown>) => ({ ...r, _type: 'package' }))

  const isLoading = loading1 || loading2
  const currentTotalPages = filter === 'destination' ? destTotalPagesRef.current
    : filter === 'package' ? pkgTotalPagesRef.current
    : Math.max(destTotalPagesRef.current, pkgTotalPagesRef.current)

  const handleFilterChange = (f: typeof filter) => {
    setFilter(f)
    setPage(1)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl sm:text-3xl text-brand-dark">Reviews Moderation</h2>
        <div className="flex gap-2">
          {['all', 'destination', 'package'].map((f) => (
            <Button key={f} variant={filter === f ? 'default' : 'outline'} size="sm" onClick={() => handleFilterChange(f as typeof filter)} className={filter === f ? 'bg-brand-orange text-white' : ''}>
              {f === 'all' ? 'All' : f === 'destination' ? 'Destinations' : 'Packages'}
            </Button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No reviews found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-brand-cream/50 border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">User</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">On</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Rating</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Comment</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((review: Record<string, unknown>) => (
                  <tr key={review.id as string} className="border-b border-border/50 hover:bg-brand-cream/30">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-brand-dark">{(review as { user: { name: string } }).user?.name}</p>
                        <p className="text-xs text-muted-foreground">{(review as { user: { email: string } }).user?.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        {review._type === 'package' ? <Package className="w-3.5 h-3.5 text-brand-orange" /> : <MapPin className="w-3.5 h-3.5 text-blue-500" />}
                        <span>{(review as { package?: { name: string }; destination?: { name: string } }).package?.name || (review as { destination?: { name: string } }).destination?.name || '—'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: review.rating as number }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-brand-gold text-brand-gold" />
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <p className="truncate">{review.comment as string}</p>
                    </td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">
                      {new Date(review.createdAt as string).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${review.approved ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {review.approved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        {!review.approved ? (
                          <Button variant="ghost" size="sm" className="text-green-600" onClick={() => toggleApprove(review.id as string, true, review._type as string)}>
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button variant="ghost" size="sm" className="text-amber-600" onClick={() => toggleApprove(review.id as string, false, review._type as string)}>
                            <XCircle className="w-4 h-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(review.id as string, review._type as string)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Pagination currentPage={page} totalPages={currentTotalPages} onPageChange={setPage} />
    </div>
  )
}
