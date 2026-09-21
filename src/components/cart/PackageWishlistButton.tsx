'use client'

import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Heart } from 'lucide-react'
import { toast } from 'sonner'
import { useAppStore } from '@/lib/store'
import { getAuthHeaders } from '@/lib/auth-client'

export function PackageWishlistButton({
  packageId,
  className,
  showLabel = false,
}: {
  packageId: string | null
  className?: string
  showLabel?: boolean
}) {
  const { user, isAuthenticated } = useAppStore()
  const queryClient = useQueryClient()
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || !packageId) {
      setSaved(false)
      return
    }
    let active = true
    fetch('/api/package-wishlist', { headers: { ...getAuthHeaders() } })
      .then((r) => (r.ok ? r.json() : []))
      .then((data: any[]) => {
        if (active && Array.isArray(data)) setSaved(data.some((w) => w.packageId === packageId))
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [isAuthenticated, user?.id, packageId])

  const toggle = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isAuthenticated) {
      toast.error('Please login to add to wishlist')
      return
    }
    try {
      if (!packageId) return
      if (saved) {
        const res = await fetch('/api/package-wishlist', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json', ...getAuthHeaders(), },
          body: JSON.stringify({ packageId }),
        })
        if (!res.ok) throw new Error('failed')
        setSaved(false)
        queryClient.invalidateQueries({ queryKey: ['package-wishlist'] })
        toast.success('Removed from wishlist')
      } else {
        const res = await fetch('/api/package-wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeaders(), },
          body: JSON.stringify({ packageId }),
        })
        if (!res.ok) throw new Error('failed')
        setSaved(true)
        queryClient.invalidateQueries({ queryKey: ['package-wishlist'] })
        toast.success('Added to wishlist')
      }
    } catch {
      toast.error('Failed to update wishlist')
    }
  }

  if (showLabel) {
    return (
      <button
        type="button"
        onClick={toggle}
        aria-label="Add to wishlist"
        className={`inline-flex items-center justify-center gap-2 rounded-xl border px-3 h-11 text-sm font-medium transition-colors ${
          saved
            ? 'bg-red-500 border-red-500 text-white hover:bg-red-600'
            : 'bg-white border-red-200 text-red-500 hover:bg-red-50'
        } ${className || ''}`}
      >
        <Heart className={`w-4 h-4 ${saved ? 'fill-white text-white' : 'text-red-500'}`} />
        {saved ? 'Wishlisted' : 'Wishlist'}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Add to wishlist"
      className={`flex items-center justify-center rounded-full border shadow-sm transition-colors ${
        saved ? 'bg-red-500 border-red-500' : 'bg-white/80 border-red-200 hover:bg-white'
      } ${className || 'w-9 h-9'}`}
    >
      <Heart className={`w-4 h-4 ${saved ? 'fill-white text-white' : 'text-red-500'}`} />
    </button>
  )
}
