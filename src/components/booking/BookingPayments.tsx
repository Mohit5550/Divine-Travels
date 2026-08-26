'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CreditCard, Receipt, Wallet, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface Summary {
  total: number
  advanceDue: number
  paid: number
  balanceDue: number
  advancePaid: boolean
  fullyPaid: boolean
  paymentStatus: string
}

interface Receipt {
  id: string
  amount: number
  method: string
  type: string
  addedBy: string
  txnId?: string | null
  note?: string | null
  createdAt: string
}

export function BookingPayments({
  type,
  id,
  isAdmin,
  summary: initialSummary,
  receipts: initialReceipts,
  userId,
}: {
  type: string
  id: string
  isAdmin: boolean
  summary: Summary
  receipts: Receipt[]
  userId?: string | null
}) {
  const [summary, setSummary] = useState<Summary>(initialSummary)
  const [receipts, setReceipts] = useState<Receipt[]>(initialReceipts || [])
  const [cashAmount, setCashAmount] = useState('')
  const [cashMethod, setCashMethod] = useState<'cash' | 'manual'>('cash')
  const [cashType, setCashType] = useState<'advance' | 'balance' | 'full'>('balance')
  const qc = useQueryClient()

  const uid = userId || (typeof window !== 'undefined' ? localStorage.getItem('dt_user_id') : '') || ''
  const fmt = (n: number) => `₹${Number(n).toLocaleString()}`
  const refresh = () => qc.invalidateQueries({ queryKey: ['booking-detail', type, id] })

  const payOnline = useMutation({
    mutationFn: async (payType: 'advance' | 'balance' | 'full') => {
      const res = await fetch(`/api/booking-flow/${type}/${id}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': uid },
        body: JSON.stringify({ method: 'online', payType }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error || 'Failed')
      }
      return res.json()
    },
    onSuccess: (data) => {
      localStorage.setItem('dt_payment_id', data.payment_id)
      localStorage.setItem('dt_booking_id', id)
      localStorage.setItem('dt_user_id', uid)
      localStorage.setItem('dt_service', 'unified')
      localStorage.setItem('dt_booking_type', type)
      localStorage.setItem('dt_pay_type', data.payType || 'balance')
      window.location.href = data.payment_page
    },
    onError: (e: any) => toast.error(e.message),
  })

  const recordCash = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/booking-flow/${type}/${id}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': uid },
        body: JSON.stringify({ method: cashMethod, payType: cashType, amount: Number(cashAmount), note: '' }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error || 'Failed')
      }
      return res.json()
    },
    onSuccess: (data) => {
      setReceipts((p) => [...p, data.receipt])
      setSummary(data.summary)
      setCashAmount('')
      toast.success('Payment recorded')
      refresh()
    },
    onError: (e: any) => toast.error(e.message),
  })

  const requestBalance = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/booking-flow/${type}/${id}/request-balance`, {
        method: 'POST',
        headers: { 'x-user-id': uid },
      })
      if (!res.ok) throw new Error('Failed')
      return res.json()
    },
    onSuccess: () => toast.success('Balance payment request sent to customer'),
    onError: () => toast.error('Failed to send request'),
  })

  const statusBadge = (() => {
    if (summary.fullyPaid) return <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Fully Paid</span>
    if (summary.advancePaid) return <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">Advance Paid</span>
    if (summary.paid > 0) return <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">Partial</span>
    return <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">Unpaid</span>
  })()

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-brand-dark text-sm flex items-center gap-1.5">
          <Wallet className="w-4 h-4 text-brand-teal" /> Payment
        </h4>
        {statusBadge}
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-brand-cream rounded-lg p-2">
          <p className="text-muted-foreground">Total</p>
          <p className="font-bold text-brand-dark">{fmt(summary.total)}</p>
        </div>
        <div className="bg-brand-cream rounded-lg p-2">
          <p className="text-muted-foreground">10% Advance</p>
          <p className="font-bold text-brand-orange">{fmt(summary.advanceDue)}</p>
        </div>
        <div className="bg-brand-cream rounded-lg p-2">
          <p className="text-muted-foreground">Paid</p>
          <p className="font-bold text-green-600">{fmt(summary.paid)}</p>
        </div>
        <div className="bg-brand-cream rounded-lg p-2">
          <p className="text-muted-foreground">Balance Due</p>
          <p className="font-bold text-red-500">{fmt(summary.balanceDue)}</p>
        </div>
      </div>

      {!isAdmin && !summary.fullyPaid && (
        <div className="flex gap-2">
          {!summary.advancePaid && (
            <Button
              size="sm"
              className="flex-1 bg-brand-orange hover:bg-brand-orange/90 text-white"
              disabled={payOnline.isPending}
              onClick={() => payOnline.mutate('advance')}
            >
              <CreditCard className="w-3 h-3 mr-1" /> Pay Advance {fmt(summary.advanceDue)}
            </Button>
          )}
          {summary.balanceDue > 0 && (
            <Button
              size="sm"
              className="flex-1 bg-brand-teal hover:bg-brand-teal/90 text-white"
              disabled={payOnline.isPending}
              onClick={() => payOnline.mutate('balance')}
            >
              <CreditCard className="w-3 h-3 mr-1" /> Pay Balance {fmt(summary.balanceDue)}
            </Button>
          )}
        </div>
      )}

      {isAdmin && (
        <div className="rounded-lg border border-border bg-white p-3 space-y-2">
          <div className="flex gap-2">
            <input
              type="number"
              value={cashAmount}
              onChange={(e) => setCashAmount(e.target.value)}
              placeholder="Amount ₹"
              className="flex-1 px-2 py-1.5 border border-border rounded-lg text-sm focus:outline-none focus:border-brand-orange"
            />
            <select
              value={cashMethod}
              onChange={(e) => setCashMethod(e.target.value as any)}
              className="px-2 py-1.5 border border-border rounded-lg text-sm"
            >
              <option value="cash">Cash</option>
              <option value="manual">Manual</option>
            </select>
            <select
              value={cashType}
              onChange={(e) => setCashType(e.target.value as any)}
              className="px-2 py-1.5 border border-border rounded-lg text-sm"
            >
              <option value="advance">Advance</option>
              <option value="balance">Balance</option>
              <option value="full">Full</option>
            </select>
          </div>
          <Button
            size="sm"
            className="w-full bg-brand-dark hover:bg-brand-dark/90 text-white"
            disabled={!cashAmount || Number(cashAmount) <= 0 || recordCash.isPending}
            onClick={() => recordCash.mutate()}
          >
            <Wallet className="w-3 h-3 mr-1" /> Record Payment
          </Button>
          {!summary.fullyPaid && (
            <Button
              size="sm"
              variant="outline"
              className="w-full text-xs"
              disabled={requestBalance.isPending}
              onClick={() => requestBalance.mutate()}
            >
              <Send className="w-3 h-3 mr-1" /> Send Balance Request to Customer
            </Button>
          )}
        </div>
      )}

      {receipts.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1">
            <Receipt className="w-3 h-3" /> Receipts
          </p>
          <div className="space-y-1">
            {receipts.map((r) => (
              <div key={r.id} className="flex items-center justify-between text-xs bg-brand-cream rounded-lg px-2.5 py-1.5">
                <span className="text-brand-dark font-medium">{fmt(r.amount)}</span>
                <span className="text-muted-foreground capitalize">
                  {r.method} · {r.addedBy} · {new Date(r.createdAt).toLocaleDateString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
