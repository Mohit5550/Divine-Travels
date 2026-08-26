'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Check, ArrowLeftRight, Send, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface Offer {
  id: string
  offeredBy: string
  amount: number
  note?: string | null
  status: string
  createdAt: string
}

export function BookingOffers({
  type,
  id,
  isAdmin,
  offers: initialOffers,
}: {
  type: string
  id: string
  isAdmin: boolean
  offers: Offer[]
}) {
  const [offers, setOffers] = useState<Offer[]>(initialOffers || [])
  const [showForm, setShowForm] = useState(false)
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const qc = useQueryClient()

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['booking-detail', type, id] })
  }

  const createOffer = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/booking-flow/${type}/${id}/offers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': localStorage.getItem('dt_user_id') || '' },
        body: JSON.stringify({ amount: Number(amount), note, offeredBy: isAdmin ? 'admin' : 'user' }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error || 'Failed')
      }
      return res.json()
    },
    onSuccess: (data) => {
      setOffers((p) => [data, ...p])
      setShowForm(false)
      setAmount('')
      setNote('')
      toast.success('Offer sent')
      refresh()
    },
    onError: (e: any) => toast.error(e.message),
  })

  const acceptOffer = useMutation({
    mutationFn: async (offerId: string) => {
      const res = await fetch(`/api/booking-flow/${type}/${id}/offers/${offerId}`, {
        method: 'POST',
        headers: { 'x-user-id': localStorage.getItem('dt_user_id') || '' },
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error || 'Failed')
      }
      return res.json()
    },
    onSuccess: (data) => {
      setOffers((p) => p.map((o) => (o.id === data.offer.id ? { ...o, status: 'accepted' } : o)))
      toast.success('Offer accepted — booking confirmed at this price')
      refresh()
    },
    onError: (e: any) => toast.error(e.message),
  })

  const fmt = (n: number) => `₹${Number(n).toLocaleString()}`

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-brand-dark text-sm flex items-center gap-1.5">
          <Tag className="w-4 h-4 text-brand-orange" /> Price Negotiation
        </h4>
        <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => setShowForm((s) => !s)}>
          <ArrowLeftRight className="w-3 h-3 mr-1" /> {isAdmin ? 'Send Offer' : 'Counter Offer'}
        </Button>
      </div>

      {offers.length === 0 && !showForm && (
        <p className="text-xs text-muted-foreground">
          {isAdmin ? 'Send a price offer to the customer.' : 'Waiting for admin to send a price. You can counter once received.'}
        </p>
      )}

      <div className="space-y-2">
        {offers.map((o) => (
          <div
            key={o.id}
            className={`flex items-center justify-between rounded-lg border p-2.5 text-sm ${
              o.status === 'accepted'
                ? 'border-green-300 bg-green-50'
                : o.status === 'countered' || o.status === 'rejected'
                ? 'border-gray-200 bg-gray-50 opacity-70'
                : 'border-brand-orange/30 bg-brand-cream'
            }`}
          >
            <div>
              <p className="font-medium text-brand-dark">
                {o.offeredBy === 'admin' ? 'Admin' : 'You'} offered <strong>{fmt(o.amount)}</strong>
              </p>
              {o.note && <p className="text-xs text-muted-foreground">{o.note}</p>}
              <p className="text-[10px] text-muted-foreground capitalize">{o.status}</p>
            </div>
            {o.status === 'pending' && (isAdmin ? o.offeredBy === 'user' : o.offeredBy === 'admin') && (
              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white h-7 text-xs" onClick={() => acceptOffer.mutate(o.id)}>
                <Check className="w-3 h-3 mr-1" /> Accept
              </Button>
            )}
          </div>
        ))}
      </div>

      {showForm && (
        <div className="rounded-lg border border-border bg-white p-3 space-y-2">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Offer amount (₹)"
            className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-brand-orange"
          />
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="Note (optional)"
            className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-brand-orange"
          />
          <Button
            size="sm"
            className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white"
            disabled={!amount || Number(amount) <= 0 || createOffer.isPending}
            onClick={() => createOffer.mutate()}
          >
            <Send className="w-3 h-3 mr-1" /> {createOffer.isPending ? 'Sending…' : 'Send Offer'}
          </Button>
        </div>
      )}
    </div>
  )
}
