'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'
import { Clock, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getAuthHeaders } from '@/lib/auth-client'

export function AdminPaymentRequests() {
  const { user } = useAppStore()
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-payment-requests', user?.id, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (statusFilter) params.set('status', statusFilter)
      const res = await fetch(`/api/admin/payment-requests?${params.toString()}`, {
        headers: { ...getAuthHeaders() },
      })
      if (!res.ok) return []
      return res.json()
    },
    refetchInterval: 10000,
  })

  const handleMarkPaid = async (id: string) => {
    try {
      const res = await fetch(`/api/payment-requests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders(), },
      })
      if (!res.ok) throw new Error()
      toast.success('Payment marked as paid')
      queryClient.invalidateQueries({ queryKey: ['admin-payment-requests'] })
      queryClient.invalidateQueries({ queryKey: ['notifications-count'] })
    } catch {
      toast.error('Failed to update payment request')
    }
  }

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading payment requests...</div>
  }

  const requests = data || []
  const pendingCount = requests.filter((r: any) => r.status === 'pending').length

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="font-serif text-2xl text-brand-dark mb-1">Payment Requests</h2>
          <p className="text-sm text-muted-foreground">
            {pendingCount} pending payment request{pendingCount !== 1 ? 's' : ''} from users
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {requests.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Clock className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No payment requests found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-brand-cream/50 border-b border-border">
                  <th className="text-left py-3 px-3 font-medium text-muted-foreground">User</th>
                  <th className="text-left py-3 px-3 font-medium text-muted-foreground">Booking Type</th>
                  <th className="text-left py-3 px-3 font-medium text-muted-foreground">Amount</th>
                  <th className="text-left py-3 px-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-right py-3 px-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((pr: any) => (
                  <tr key={pr.id} className="border-b border-border/50 hover:bg-brand-cream/30">
                    <td className="py-3 px-3">
                      <p className="font-medium text-brand-dark text-sm">{pr.user?.name || 'N/A'}</p>
                      <p className="text-xs text-muted-foreground">{pr.user?.email}</p>
                    </td>
                    <td className="py-3 px-3 text-sm capitalize">{pr.bookingType}</td>
                    <td className="py-3 px-3 text-sm font-medium">₹{pr.balanceAmount}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        pr.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        pr.status === 'paid' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {pr.status === 'pending' ? '⏳ Pending' : pr.status === 'paid' ? '✓ Paid' : 'Cancelled'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {pr.status === 'pending' && (
                        <Button size="sm" variant="outline" className="text-amber-600 border-amber-300 hover:bg-amber-50 h-8 text-xs" onClick={() => handleMarkPaid(pr.id)}>
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Mark Paid
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
