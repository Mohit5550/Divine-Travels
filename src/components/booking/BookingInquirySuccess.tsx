'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, Clock, CalendarDays, Users, Wallet, FileText, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BookingInquirySuccessProps {
  bookingId?: string
  title: string
  typeLabel?: string
  date?: string
  travelers?: number | string
  total?: number
  advanceAmount?: number
  details?: Record<string, string>
  isBooking?: boolean
  note?: string
  redirectSeconds?: number
  onGoDashboard: () => void
}

function fmt(n: number) {
  return `₹${Math.round(Number(n) || 0).toLocaleString('en-IN')}`
}

export function BookingInquirySuccess({
  bookingId,
  title,
  typeLabel = 'Booking',
  date,
  travelers,
  total,
  advanceAmount,
  details,
  isBooking = true,
  note,
  redirectSeconds = 10,
  onGoDashboard,
}: BookingInquirySuccessProps) {
  const [secs, setSecs] = useState(redirectSeconds)

  useEffect(() => {
    if (secs <= 0) {
      onGoDashboard()
      return
    }
    const t = setTimeout(() => setSecs((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [secs, onGoDashboard])

  const rows: { icon: React.ReactNode; label: string; value: string }[] = []
  if (bookingId) rows.push({ icon: <FileText className="w-4 h-4" />, label: 'Booking Reference', value: bookingId })
  if (date) rows.push({ icon: <CalendarDays className="w-4 h-4" />, label: 'Travel Date', value: date })
  if (travelers != null && travelers !== '') rows.push({ icon: <Users className="w-4 h-4" />, label: 'Travelers', value: String(travelers) })
  if (total != null) rows.push({ icon: <Wallet className="w-4 h-4" />, label: 'Total Amount', value: fmt(total) })
  if (advanceAmount != null) rows.push({ icon: <Wallet className="w-4 h-4" />, label: '10% Advance Due', value: fmt(advanceAmount) })
  if (details) {
    for (const [label, value] of Object.entries(details)) {
      if (value) rows.push({ icon: <FileText className="w-4 h-4" />, label, value })
    }
  }

  return (
    <div className="min-h-screen bg-brand-cream flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg border border-border/60 overflow-hidden">
          <div className="bg-gradient-to-r from-brand-orange to-brand-gold px-6 py-5 text-center">
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            <h2 className="font-serif text-2xl text-white">Request Received!</h2>
            <p className="text-white/90 text-sm mt-1">Your {typeLabel} is submitted successfully.</p>
          </div>

          <div className="p-6 space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">{typeLabel}</p>
              <h3 className="font-bold text-brand-dark text-lg leading-tight">{title}</h3>
            </div>

            <div className="rounded-xl border border-border/60 divide-y divide-border/50">
              {rows.map((r, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3">
                  <span className="flex items-center gap-2 text-sm text-muted-foreground">
                    {r.icon}
                    {r.label}
                  </span>
                  <span className="text-sm font-semibold text-brand-dark text-right">{r.value}</span>
                </div>
              ))}
            </div>

            {isBooking ? (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <p className="text-xs text-amber-800">
                  Status: <strong>Pending</strong> — awaiting admin confirmation. Once confirmed, you will be asked to pay the 10% advance to lock your booking.
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
                <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                <p className="text-xs text-blue-800">
                  Status: <strong>Received</strong> — our team will get back to you within 24 hours.
                </p>
              </div>
            )}

            {note && <p className="text-xs text-muted-foreground text-center">{note}</p>}

            <div className="text-center">
              <p className="text-sm text-brand-orange font-medium mb-3">
                Redirecting to your dashboard in {secs} second{secs === 1 ? '' : 's'}…
              </p>
              <Button onClick={onGoDashboard} className="w-full bg-brand-orange hover:bg-brand-orange/90 text-white">
                Go to Dashboard Now <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
