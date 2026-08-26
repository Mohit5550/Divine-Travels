'use client'

import { useState, Fragment } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAppStore } from '@/lib/store'
import { ChevronDown, ChevronUp, Download, FileSpreadsheet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/ui/Pagination'
import { BookingCardActions } from '../booking/BookingCardActions'
import { toast } from 'sonner'

export function AdminAllBookings() {
  const { user } = useAppStore()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-all-bookings', user?.id, page, search, typeFilter, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (search.trim()) params.set('search', search.trim())
      if (typeFilter) params.set('type', typeFilter)
      if (statusFilter) params.set('status', statusFilter)
      const res = await fetch(`/api/admin/all-bookings?${params.toString()}`, {
        headers: { 'x-user-id': user?.id || '' },
      })
      return res.json()
    },
    refetchInterval: 10000,
  })

  const bookings = data?.data || []
  const totalPages = data?.totalPages || 1

  const updateFilter = (setter: (v: string) => void, value: string) => {
    setter(value)
    setPage(1)
  }

  const clearFilters = () => {
    setSearch('')
    setTypeFilter('')
    setStatusFilter('')
    setPage(1)
  }

  const hasFilters = !!(search || typeFilter || statusFilter)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700'
      case 'pending': return 'bg-amber-100 text-amber-700'
      case 'cancelled':
      case 'rejected': return 'bg-red-100 text-red-700'
      case 'completed': return 'bg-blue-100 text-blue-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const exportToCSV = () => {
    if (!bookings.length) {
      toast.error('No bookings to export')
      return
    }
    const headers = ['Booking ID', 'Guest Name', 'Email', 'Service Title', 'Type', 'Travel Date', 'Amount (INR)', 'Status', 'Booking Date']
    const rows = bookings.map((b: any) => [
      `"${b.id}"`,
      `"${(b.guest || '').replace(/"/g, '""')}"`,
      `"${(b.email || '').replace(/"/g, '""')}"`,
      `"${(b.title || '').replace(/"/g, '""')}"`,
      `"${b.displayType || b.type}"`,
      `"${b.date ? new Date(b.date).toLocaleDateString('en-IN') : 'N/A'}"`,
      b.amount || 0,
      `"${b.status}"`,
      `"${b.createdAt ? new Date(b.createdAt).toLocaleDateString('en-IN') : 'N/A'}"`,
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e: any) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `Divine_Travels_Bookings_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Manifest exported to CSV successfully')
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl text-brand-dark mb-1">All Bookings</h2>
          <p className="text-sm text-muted-foreground">
            Destination, Package, Day Tour &amp; Taxi bookings in one place.
          </p>
        </div>
        <Button
          onClick={exportToCSV}
          size="sm"
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl gap-2 font-medium shadow-sm self-start sm:self-auto"
        >
          <FileSpreadsheet className="w-4 h-4" />
          Export to Excel / CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-muted-foreground mb-1">Search by name / email</label>
            <input
              type="text"
              value={search}
              onChange={(e) => updateFilter(setSearch, e.target.value)}
              placeholder="e.g. Admin or customer@test.com"
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Booking Type</label>
            <select
              value={typeFilter}
              onChange={(e) => updateFilter(setTypeFilter, e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange"
            >
              <option value="">All Types</option>
              <option value="destination">Destination</option>
              <option value="package">Package (other)</option>
              <option value="tour">Day Tour</option>
              <option value="taxi">Taxi</option>
              <option value="bike-rental">Bike Rental</option>
              <option value="stay-hotel">Hotel</option>
              <option value="stay-camping">Camping</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => updateFilter(setStatusFilter, e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange/40 focus:border-brand-orange"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="approved">Approved</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
        {hasFilters && (
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {data?.total ?? 0} result{(data?.total ?? 0) === 1 ? '' : 's'}
            </span>
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs text-brand-orange hover:text-brand-orange/80 font-medium cursor-pointer"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading bookings...</div>
        ) : bookings.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No bookings found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-brand-cream/50 border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Guest</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Service</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Details</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking: {
                  id: string
                  type: 'destination' | 'package' | 'tour' | 'taxi'
                  displayType: string
                  guest: string
                  email: string
                  title: string
                  date: string | null
                  amount: number
                  status: string
                }) => (
                  <Fragment key={booking.id}>
                    <tr className="border-b border-border/50 hover:bg-brand-cream/30">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-brand-dark">{booking.guest}</p>
                          <p className="text-xs text-muted-foreground">{booking.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-brand-dark">{booking.title}</p>
                          <p className="text-[10px] text-muted-foreground capitalize">{booking.displayType}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {booking.date
                          ? new Date(booking.date).toLocaleDateString('en-IN')
                          : <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="py-3 px-4 font-medium">₹{(booking.amount || 0).toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <select
                          value={booking.status || 'pending'}
                          onClick={(e) => e.stopPropagation()}
                          onChange={async (e) => {
                            const newStatus = e.target.value
                            try {
                              const res = await fetch('/api/admin/bookings/update-status', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json', 'x-user-id': user?.id || '' },
                                body: JSON.stringify({
                                  bookingId: booking.id,
                                  type: booking.type || 'package',
                                  status: newStatus,
                                }),
                              })
                              if (!res.ok) throw new Error()
                              toast.success(`Booking status updated: ${newStatus.replace('_', ' ').toUpperCase()}`)
                              queryClient.invalidateQueries({ queryKey: ['admin-all-bookings'] })
                              queryClient.invalidateQueries({ queryKey: ['upcoming-bookings'] })
                              queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
                            } catch {
                              toast.error('Failed to update status')
                            }
                          }}
                          className={`text-xs font-semibold rounded-lg px-2.5 py-1 border cursor-pointer transition-colors focus:ring-2 focus:ring-brand-orange/20 outline-none ${
                            booking.status === 'confirmed' ? 'bg-green-50 text-green-700 border-green-200' :
                            booking.status === 'ready' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                            booking.status === 'in_progress' ? 'bg-blue-50 text-blue-700 border-blue-200 font-bold' :
                            booking.status === 'completed' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                            booking.status === 'cancelled' || booking.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                            'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          <option value="pending">🟡 Pending</option>
                          <option value="confirmed">🟢 Confirmed</option>
                          <option value="ready">🟠 Ready (Guide/Cab)</option>
                          <option value="in_progress">🔵 In-Progress</option>
                          <option value="completed">🟣 Completed</option>
                          <option value="cancelled">🔴 Cancelled</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedId(expandedId === booking.id ? null : booking.id)}
                        >
                          {expandedId === booking.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </Button>
                      </td>
                    </tr>
                    {expandedId === booking.id && (
                      <tr key={`${booking.id}-expanded`}>
                        <td colSpan={6} className="bg-brand-cream/30 px-4 py-4">
                          <BookingCardActions type={booking.type} id={booking.id} isAdmin={true} userId={user?.id} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-4 border-t border-border p-4">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  )
}
