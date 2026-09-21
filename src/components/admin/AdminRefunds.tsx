'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAppStore } from '@/lib/store'
import { CheckCircle2, XCircle, Wallet, Send, ExternalLink, User, CreditCard, Phone, Mail, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { getAuthHeaders } from '@/lib/auth-client'

export function AdminRefunds() {
  const { user } = useAppStore()
  const qc = useQueryClient()
  const [filter, setFilter] = useState('')
  const [payingId, setPayingId] = useState<string | null>(null)
  const [payMethod, setPayMethod] = useState('upi')
  const [adminNote, setAdminNote] = useState('')

  const { data: refunds = [], isLoading } = useQuery({
    queryKey: ['admin-refunds', user?.id, filter],
    queryFn: async () => {
      const params = filter ? `?status=${filter}` : ''
      const res = await fetch(`/api/admin/refunds${params}`, { headers: { ...getAuthHeaders() } })
      if (!res.ok) return []
      return res.json()
    },
  })

  const markPaid = useMutation({
    mutationFn: async ({ refundId, status, paidMethod, adminNote }: { refundId: string; status: string; paidMethod?: string; adminNote?: string }) => {
      const res = await fetch('/api/admin/refunds', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders(), },
        body: JSON.stringify({ refundId, status, paidMethod, adminNote }),
      })
      if (!res.ok) throw new Error('Failed')
      return res.json()
    },
    onSuccess: () => {
      toast.success('Refund status updated')
      qc.invalidateQueries({ queryKey: ['admin-refunds'] })
      qc.invalidateQueries({ queryKey: ['admin-all-bookings'] })
      setPayingId(null)
      setAdminNote('')
    },
    onError: () => toast.error('Failed to update refund'),
  })

  const pending = refunds.filter((r: any) => r.status === 'pending')
  const paid = refunds.filter((r: any) => r.status === 'paid')
  const totalPending = pending.reduce((sum: number, r: any) => sum + r.refundAmount, 0)
  const totalPaid = paid.reduce((sum: number, r: any) => sum + r.refundAmount, 0)

  const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl text-brand-dark mb-1">Refund Management</h2>
          <p className="text-sm text-muted-foreground">Process refunds for cancelled bookings. User UPI IDs shown for payment.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-4 h-4 text-amber-600" />
            <span className="text-xs font-semibold text-amber-800">Pending Refunds</span>
          </div>
          <p className="text-2xl font-bold text-amber-900">{fmt(totalPending)}</p>
          <p className="text-xs text-amber-600 mt-1">{pending.length} booking{pending.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-semibold text-emerald-800">Paid Refunds</span>
          </div>
          <p className="text-2xl font-bold text-emerald-900">{fmt(totalPaid)}</p>
          <p className="text-xs text-emerald-600 mt-1">{paid.length} booking{paid.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="w-4 h-4 text-gray-600" />
            <span className="text-xs font-semibold text-gray-800">Total Refunds</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{fmt(totalPending + totalPaid)}</p>
          <p className="text-xs text-gray-600 mt-1">{refunds.length} total records</p>
        </div>
      </div>

      <div className="flex gap-2">
        {[
          { value: '', label: 'All' },
          { value: 'pending', label: 'Pending' },
          { value: 'paid', label: 'Paid' },
          { value: 'rejected', label: 'Rejected' },
        ].map((f) => (
          <Button key={f.value} size="sm" variant={filter === f.value ? 'default' : 'outline'}
            className={filter === f.value ? 'bg-brand-dark text-white' : ''}
            onClick={() => setFilter(f.value)}>
            {f.label}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />)}</div>
      ) : refunds.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-brand-dark mb-2">No refunds found</h3>
          <p className="text-muted-foreground text-sm">When users cancel paid bookings, refunds will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {refunds.map((refund: any) => (
            <div key={refund.id} className={`bg-white rounded-xl shadow-sm border-l-4 p-4 ${
              refund.status === 'pending' ? 'border-l-amber-400' :
              refund.status === 'paid' ? 'border-l-emerald-400' : 'border-l-red-400'
            }`}>
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-brand-dark text-sm truncate">{refund.bookingTitle}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      refund.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                      refund.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {refund.status}
                    </span>
                    <span className="text-[10px] text-muted-foreground capitalize">{refund.bookingType}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs mt-2">
                    <div>
                      <span className="text-muted-foreground">Total</span>
                      <p className="font-semibold">{fmt(refund.totalAmount)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Paid by User</span>
                      <p className="font-semibold text-green-700">{fmt(refund.amountPaid)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Refund ({refund.refundPct}%)</span>
                      <p className="font-bold text-brand-orange">{fmt(refund.refundAmount)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Days Before</span>
                      <p className="font-semibold">{refund.daysBefore} days</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><User className="w-3 h-3" /> {refund.user?.name}</span>
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {refund.user?.email}</span>
                    {refund.user?.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {refund.user?.phone}</span>}
                  </div>

                  {refund.user?.upiId ? (
                    <div className="mt-2 flex items-center gap-1.5 bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5 text-xs inline-flex">
                      <CreditCard className="w-3 h-3 text-blue-600" />
                      <span className="font-semibold text-blue-800">UPI: {refund.user.upiId}</span>
                    </div>
                  ) : (
                    <div className="mt-2 flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 text-xs inline-flex">
                      <AlertCircle className="w-3 h-3 text-amber-600" />
                      <span className="text-amber-800">UPI ID not provided by user</span>
                    </div>
                  )}

                  {refund.reason && (
                    <p className="text-xs text-muted-foreground mt-1 italic">&quot;{refund.reason}&quot;</p>
                  )}
                </div>

                {refund.status === 'pending' && (
                  <div className="flex flex-col gap-2 shrink-0">
                    {refund.user?.upiId && (
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1"
                        onClick={() => setPayingId(payingId === refund.id ? null : refund.id)}>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Mark as Paid
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="text-red-600 border-red-300 hover:bg-red-50 text-xs"
                      onClick={() => markPaid.mutate({ refundId: refund.id, status: 'rejected', adminNote })}>
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </Button>
                  </div>
                )}
                {refund.status === 'paid' && refund.paidAt && (
                  <div className="text-xs text-emerald-700 shrink-0">
                    Paid on {new Date(refund.paidAt).toLocaleDateString('en-IN')} via {refund.paidMethod || 'UPI'}
                  </div>
                )}
              </div>

              {payingId === refund.id && (
                <div className="mt-3 pt-3 border-t border-border flex flex-col sm:flex-row gap-2 items-end">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Payment Method</label>
                    <select value={payMethod} onChange={(e) => setPayMethod(e.target.value)}
                      className="px-2 py-1.5 border border-gray-200 rounded-lg text-xs">
                      <option value="upi">UPI Transfer</option>
                      <option value="bank">Bank Transfer</option>
                      <option value="cash">Cash</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-muted-foreground mb-1 block">Admin Note (optional)</label>
                    <input value={adminNote} onChange={(e) => setAdminNote(e.target.value)} placeholder="e.g. Refund via GooglePay"
                      className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs" />
                  </div>
                  <div className="flex gap-2">
                    <a href={`https://upi://pay?pa=${refund.user?.upiId}&am=${refund.refundAmount}&tn=Refund for ${encodeURIComponent(refund.bookingTitle || '')}`}
                      target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded-lg">
                      <ExternalLink className="w-3 h-3" /> Open UPI
                    </a>
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                      disabled={markPaid.isPending}
                      onClick={() => markPaid.mutate({ refundId: refund.id, status: 'paid', paidMethod: payMethod, adminNote })}>
                      <Send className="w-3 h-3" /> Confirm Paid
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
