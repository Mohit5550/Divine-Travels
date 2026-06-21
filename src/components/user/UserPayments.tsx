'use client'

import { useQuery } from '@tanstack/react-query'
import { useAppStore } from '@/lib/store'
import { motion } from 'framer-motion'
import { CreditCard, Download, CheckCircle, Clock, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function UserPayments() {
  const { user } = useAppStore()

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['user-payments', user?.id],
    queryFn: async () => {
      const res = await fetch('/api/payments', { headers: { 'x-user-id': user?.id || '' } })
      if (!res.ok) return []
      return res.json()
    },
  })

  const downloadInvoice = (payment: any) => {
    const invoice = {
      'Invoice #': payment.id.slice(-8).toUpperCase(),
      Date: new Date(payment.createdAt).toLocaleDateString(),
      Amount: `₹${payment.amount.toLocaleString()}`,
      Method: payment.method,
      'Transaction ID': payment.transactionId || 'N/A',
      Status: payment.status,
    }
    const text = Object.entries(invoice).map(([k, v]) => `${k}: ${v}`).join('\n')
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `invoice-${payment.id.slice(-8).toUpperCase()}.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Invoice downloaded')
  }

  const statusIcon: Record<string, any> = {
    completed: <CheckCircle className="w-4 h-4 text-green-600" />,
    pending: <Clock className="w-4 h-4 text-amber-500" />,
    failed: <XCircle className="w-4 h-4 text-red-500" />,
    refunded: <CreditCard className="w-4 h-4 text-blue-500" />,
  }

  if (isLoading) {
    return <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />)}</div>
  }

  return (
    <div>
      <h2 className="font-serif text-2xl sm:text-3xl text-brand-dark mb-6">Payment History</h2>
      {payments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-brand-dark mb-2">No payments yet</h3>
          <p className="text-muted-foreground text-sm">Your payment history will appear here after you make a booking.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-brand-cream/50">
                  <th className="text-left p-4 font-medium text-muted-foreground">Date</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Amount</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Method</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Transaction ID</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Invoice</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment: any, idx: number) => (
                  <motion.tr
                    key={payment.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.03 }}
                    className="border-b border-border/50 hover:bg-brand-cream/30"
                  >
                    <td className="p-4 text-brand-dark">{new Date(payment.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 font-semibold text-brand-dark">₹{payment.amount.toLocaleString()}</td>
                    <td className="p-4 capitalize text-muted-foreground">{payment.method}</td>
                    <td className="p-4 text-xs text-muted-foreground font-mono">{payment.transactionId || '—'}</td>
                    <td className="p-4">
                      <span className={`flex items-center gap-1 text-xs font-medium ${payment.status === 'completed' ? 'text-green-600' : payment.status === 'pending' ? 'text-amber-600' : payment.status === 'refunded' ? 'text-blue-600' : 'text-red-600'}`}>
                        {statusIcon[payment.status]} {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Button variant="ghost" size="sm" onClick={() => downloadInvoice(payment)} className="text-brand-teal hover:text-brand-teal/80">
                        <Download className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
