'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CreditCard, Receipt, Wallet, Send, CheckCircle2, MessageCircle, AlertCircle, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { getAuthHeaders } from '@/lib/auth-client'

interface Summary {
  total: number
  advanceDue: number
  paid: number
  balanceDue: number
  advancePaid: boolean
  fullyPaid: boolean
  paymentStatus: string
}

interface ReceiptItem {
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
  receipts: ReceiptItem[]
  userId?: string | null
}) {
  const [summary, setSummary] = useState<Summary>(initialSummary)
  const [receipts, setReceipts] = useState<ReceiptItem[]>(initialReceipts || [])
  const [cashAmount, setCashAmount] = useState('')
  const [cashMethod, setCashMethod] = useState<'cash' | 'manual'>('cash')
  const [cashType, setCashType] = useState<'advance' | 'balance' | 'full'>('balance')
  const [customNote, setCustomNote] = useState('')
  const [showNoticeBox, setShowNoticeBox] = useState(false)
  const [lastWhatsAppUrl, setLastWhatsAppUrl] = useState<string | null>(null)
  const qc = useQueryClient()

  const uid = userId || (typeof window !== 'undefined' ? localStorage.getItem('dt_user_id') : '') || ''
  const fmt = (n: number) => `₹${Math.round(Number(n) || 0).toLocaleString('en-IN')}`
  const refresh = () => qc.invalidateQueries({ queryKey: ['booking-detail', type, id] })

  const payOnline = useMutation({
    mutationFn: async (payType: 'advance' | 'balance' | 'full') => {
      const res = await fetch(`/api/booking-flow/${type}/${id}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders(), },
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
    mutationFn: async (customParams: { amount?: number; payType?: 'advance' | 'balance' | 'full'; method?: 'cash' | 'manual' } = {}) => {
      const amt = customParams.amount ?? Number(cashAmount)
      const pType = customParams.payType ?? cashType
      const meth = customParams.method ?? cashMethod

      const res = await fetch(`/api/booking-flow/${type}/${id}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders(), },
        body: JSON.stringify({ method: meth, payType: pType, amount: amt, note: 'Admin offline/cash update' }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error || 'Failed to record cash payment')
      }
      return res.json()
    },
    onSuccess: (data) => {
      setReceipts((p) => [...p, data.receipt])
      setSummary(data.summary)
      setCashAmount('')
      toast.success('Cash payment recorded successfully & marked in user receipt!')
      refresh()
      qc.invalidateQueries({ queryKey: ['admin-all-bookings'] })
      qc.invalidateQueries({ queryKey: ['admin-package-bookings'] })
      qc.invalidateQueries({ queryKey: ['admin-tour-bookings'] })
    },
    onError: (e: any) => toast.error(e.message),
  })

  const requestBalance = useMutation({
    mutationFn: async (params: { note?: string } = {}) => {
      const res = await fetch(`/api/booking-flow/${type}/${id}/request-balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders(), },
        body: JSON.stringify({ customNote: params.note || customNote }),
      })
      if (!res.ok) throw new Error('Failed to send payment notice')
      return res.json()
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Payment notice sent to user dashboard!')
      if (data.whatsappUrl) {
        setLastWhatsAppUrl(data.whatsappUrl)
      }
      setShowNoticeBox(false)
    },
    onError: (e: any) => toast.error(e.message || 'Failed to send notice'),
  })

  const statusBadge = (() => {
    if (summary.fullyPaid) return <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-600" /> Fully Paid (No Dues)</span>
    if (summary.advancePaid) return <span className="text-[11px] font-bold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full">10% Advance Paid</span>
    if (summary.paid > 0) return <span className="text-[11px] font-bold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full">Partial Paid</span>
    return <span className="text-[11px] font-bold bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full">Payment Pending</span>
  })()

  return (
    <div className="space-y-3.5 bg-white p-3.5 rounded-xl border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-brand-dark text-sm flex items-center gap-1.5">
          <Wallet className="w-4 h-4 text-brand-teal" /> Payment Breakdown
        </h4>
        {statusBadge}
      </div>

      {/* 4-Box Metric Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="bg-gray-50 border border-gray-100 rounded-lg p-2.5">
          <p className="text-gray-500 text-[11px]">Total Package</p>
          <p className="font-bold text-gray-900 text-sm">{fmt(summary.total)}</p>
        </div>
        <div className="bg-brand-orange/5 border border-brand-orange/20 rounded-lg p-2.5">
          <p className="text-brand-orange text-[11px] font-medium">10% Advance</p>
          <p className="font-bold text-brand-orange text-sm">{fmt(summary.advanceDue)}</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-2.5">
          <p className="text-emerald-700 text-[11px] font-medium">Amount Paid</p>
          <p className="font-bold text-emerald-700 text-sm">{fmt(summary.paid)}</p>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-lg p-2.5">
          <p className="text-red-600 text-[11px] font-medium">Remaining Due</p>
          <p className="font-bold text-red-600 text-sm">{fmt(summary.balanceDue)}</p>
        </div>
      </div>

      {/* USER VIEW: Pay Online Options */}
      {!isAdmin && !summary.fullyPaid && (
        <div className="pt-1 flex flex-col sm:flex-row gap-2">
          {!summary.advancePaid && (
            <Button
              size="sm"
              className="flex-1 bg-brand-orange hover:bg-brand-orange/90 text-white font-semibold py-2.5 shadow-md"
              disabled={payOnline.isPending}
              onClick={() => payOnline.mutate('advance')}
            >
              <CreditCard className="w-4 h-4 mr-1.5" /> Pay 10% Advance ({fmt(summary.advanceDue)})
            </Button>
          )}
          {summary.advancePaid && summary.balanceDue > 0 && (
            <Button
              size="sm"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 shadow-md"
              disabled={payOnline.isPending}
              onClick={() => payOnline.mutate('balance')}
            >
              <CreditCard className="w-4 h-4 mr-1.5" /> Pay Due Balance ({fmt(summary.balanceDue)})
            </Button>
          )}
        </div>
      )}

      {/* ADMIN VIEW: Cash Recording & Push Due Notice Controls */}
      {isAdmin && (
        <div className="rounded-xl border border-amber-200/80 bg-amber-50/40 p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-orange" />
              Admin Payment Actions
            </span>
            <span className="text-[10px] text-gray-500">Instant Cash &amp; Notice</span>
          </div>

          {/* Quick 1-Click Cash Buttons */}
          {summary.balanceDue > 0 && (
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                type="button"
                className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold h-8 shadow-sm gap-1"
                disabled={recordCash.isPending}
                onClick={() => recordCash.mutate({ amount: summary.balanceDue, payType: 'balance', method: 'cash' })}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Mark Full Cash Paid ({fmt(summary.balanceDue)})
              </Button>

              {!summary.advancePaid && summary.advanceDue > 0 && (
                <Button
                  size="sm"
                  type="button"
                  variant="outline"
                  className="bg-white hover:bg-gray-50 text-emerald-800 border-emerald-300 text-xs font-semibold h-8"
                  disabled={recordCash.isPending}
                  onClick={() => recordCash.mutate({ amount: summary.advanceDue, payType: 'advance', method: 'cash' })}
                >
                  Mark 10% Advance Cash ({fmt(summary.advanceDue)})
                </Button>
              )}
            </div>
          )}

          {/* Custom Cash / Manual Input */}
          <div className="flex gap-2 pt-1">
            <input
              type="number"
              value={cashAmount}
              onChange={(e) => setCashAmount(e.target.value)}
              placeholder="Custom ₹ Amount"
              className="flex-1 px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-brand-orange"
            />
            <select
              value={cashMethod}
              onChange={(e) => setCashMethod(e.target.value as any)}
              className="px-2 py-1.5 bg-white border border-gray-300 rounded-lg text-xs"
            >
              <option value="cash">Cash (On-site)</option>
              <option value="manual">Direct UPI / Bank</option>
            </select>
            <Button
              size="sm"
              className="bg-brand-dark hover:bg-brand-dark/90 text-white text-xs h-8 px-3"
              disabled={!cashAmount || Number(cashAmount) <= 0 || recordCash.isPending}
              onClick={() => recordCash.mutate({})}
            >
              Record
            </Button>
          </div>

          {/* Notice to User if Balance is Pending */}
          {!summary.fullyPaid && (
            <div className="pt-2 border-t border-amber-200/60 space-y-2">
              <div className="flex items-center justify-between">
                <Button
                  size="sm"
                  type="button"
                  variant="outline"
                  className="bg-white hover:bg-amber-50 text-brand-dark border-amber-300 text-xs font-medium h-7 gap-1"
                  onClick={() => setShowNoticeBox(!showNoticeBox)}
                >
                  <Send className="w-3 h-3 text-brand-orange" />
                  {showNoticeBox ? 'Hide Notice Form' : 'Send Due Payment Notice to User'}
                </Button>

                {lastWhatsAppUrl && (
                  <a
                    href={lastWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-2.5 py-1 rounded-md transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    Open WhatsApp Reminder
                  </a>
                )}
              </div>

              {showNoticeBox && (
                <div className="space-y-2 bg-white p-2.5 rounded-lg border border-amber-200">
                  <p className="text-[11px] text-gray-600">
                    Sends an in-app high-priority notice to customer dashboard reminding them to clear pending balance of <strong>{fmt(summary.balanceDue)}</strong>.
                  </p>
                  <input
                    type="text"
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    placeholder="Optional message (e.g. Please clear remaining ₹X prior to reporting)"
                    className="w-full px-2.5 py-1.5 border border-gray-200 rounded-md text-xs focus:outline-none focus:border-brand-orange"
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      className="bg-brand-orange hover:bg-brand-orange/90 text-white text-xs h-7 gap-1"
                      disabled={requestBalance.isPending}
                      onClick={() => requestBalance.mutate({})}
                    >
                      <Send className="w-3 h-3" />
                      Push Notice Now
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Receipts List */}
      {receipts.length > 0 && (
        <div className="pt-1">
          <p className="text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
            <Receipt className="w-3.5 h-3.5 text-gray-500" /> Payment Receipts ({receipts.length})
          </p>
          <div className="space-y-1.5">
            {receipts.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between text-xs bg-gray-50 border border-gray-100 rounded-lg px-3 py-2"
              >
                <div>
                  <span className="font-bold text-gray-900">{fmt(r.amount)}</span>
                  <span className="text-[11px] text-gray-500 ml-2 capitalize">
                    {r.type} payment
                  </span>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase mr-1.5 ${
                    r.method === 'cash' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {r.method === 'cash' ? 'Cash at Counter' : r.method}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {new Date(r.createdAt).toLocaleDateString('en-IN')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
