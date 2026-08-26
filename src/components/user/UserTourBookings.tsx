'use client'

import { useQuery } from '@tanstack/react-query'
import { useAppStore } from '@/lib/store'
import { CalendarDays, Users, FileText, Tag, Clock } from 'lucide-react'
import { BookingCardActions } from '../booking/BookingCardActions'

export function UserTourBookings() {
  const { user } = useAppStore()
  const { data: rawBookings = [], isLoading } = useQuery({
    queryKey: ['user-tour-bookings', user?.id],
    queryFn: async () => {
      const res = await fetch('/api/tour-bookings?excludeTaxi=true', { headers: { 'x-user-id': user?.id || '' } })
      if (!res.ok) return []
      return res.json()
    },
  })

  // Filter out any taxi bookings so Tours tab ONLY shows actual day tours & spiritual packages
  const bookings = rawBookings.filter((b: any) => {
    const isTaxi = b.packageType?.startsWith('Taxi') ||
      b.packageType?.toLowerCase().includes('taxi') ||
      (typeof b.adminNotes === 'string' && b.adminNotes.includes('taxi-booking'))
    return !isTaxi
  })

  if (isLoading) return <p className="text-muted-foreground text-sm">Loading…</p>
  if (bookings.length === 0) return <p className="text-muted-foreground text-sm">No tour inquiries yet.</p>

  return (
    <div className="space-y-4">
      {bookings.map((b: any) => {
        const programs = (() => {
          try {
            const arr = JSON.parse(b.selectedPrograms)
            return Array.isArray(arr) ? arr : []
          } catch {
            return []
          }
        })()
        return (
          <div key={b.id} className="bg-white rounded-2xl shadow-sm border border-border/50 p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
              <div>
                <h3 className="font-bold text-brand-dark text-base">{b.packageType || b.destination}</h3>
                <p className="text-xs text-muted-foreground">{b.destination}{b.days ? ` · ${b.days}-day tour` : ''}</p>
              </div>
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  b.status === 'confirmed'
                    ? 'bg-green-100 text-green-700'
                    : b.status === 'rejected'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {b.status}
              </span>
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mb-2">
              <span className="flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" /> {b.travelDate}</span>
              <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {b.travelers} traveler(s)</span>
              {b.negotiatedPrice != null && (
                <span className="flex items-center gap-1 text-brand-orange"><Tag className="w-3.5 h-3.5" /> Agreed ₹{b.negotiatedPrice}</span>
              )}
              {!b.priceLocked && <span className="flex items-center gap-1 text-amber-600"><Clock className="w-3.5 h-3.5" /> Price pending</span>}
            </div>

            {programs.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {programs.map((p: string, i: number) => (
                  <span key={i} className="text-[11px] bg-brand-orange/10 text-brand-orange px-2 py-0.5 rounded-full">{p}</span>
                ))}
              </div>
            )}

            {b.note && (
              <p className="text-xs text-muted-foreground bg-brand-cream rounded-lg p-2 mb-2 flex items-start gap-1">
                <FileText className="w-3.5 h-3.5 mt-0.5 shrink-0" /> {b.note}
              </p>
            )}

            <div className="border-t border-border/50 pt-3 mt-1">
              <BookingCardActions type="tour" id={b.id} isAdmin={false} userId={user?.id} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
