'use client'

import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BookingOffers } from './BookingOffers'
import { BookingPayments } from './BookingPayments'

export function BookingCardActions({
  type,
  id,
  isAdmin,
  userId,
}: {
  type: string
  id: string
  isAdmin: boolean
  userId?: string | null
}) {
  useEffect(() => {
    if (userId && typeof window !== 'undefined') localStorage.setItem('dt_user_id', userId)
  }, [userId])

  const { data, isLoading } = useQuery({
    queryKey: ['booking-detail', type, id],
    queryFn: async () => {
      const res = await fetch(`/api/booking-flow/${type}/${id}`, {
        headers: { 'x-user-id': userId || (typeof window !== 'undefined' ? localStorage.getItem('dt_user_id') || '' : '') },
      })
      if (!res.ok) throw new Error('Failed')
      return res.json()
    },
  })

  if (isLoading) return <div className="text-xs text-muted-foreground">Loading…</div>
  if (!data) return null

  return (
    <div className="space-y-4">
      <BookingOffers type={type} id={id} isAdmin={isAdmin} offers={data.offers} />
      <BookingPayments
        type={type}
        id={id}
        isAdmin={isAdmin}
        summary={data.summary}
        receipts={data.receipts}
        userId={userId}
      />
    </div>
  )
}
