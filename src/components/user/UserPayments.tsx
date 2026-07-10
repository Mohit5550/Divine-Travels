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
    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Invoice ${payment.id.slice(-8).toUpperCase()}</title>
<style>
  body{font-family:Arial,sans-serif;max-width:600px;margin:40px auto;padding:20px;color:#333}
  .header{text-align:center;border-bottom:3px solid #e67e22;padding-bottom:20px;margin-bottom:20px}
  .header h1{color:#1a1a2e;margin:0;font-size:28px}
  .header p{color:#e67e22;font-weight:600;margin:4px 0 0}
  table{width:100%;border-collapse:collapse;margin:20px 0}
  td{padding:10px 0;border-bottom:1px solid #eee}
  td:first-child{color:#888;width:40%}
  td:last-child{font-weight:600;text-align:right}
  .total{font-size:20px;color:#e67e22;border-top:2px solid #1a1a2e;padding-top:15px}
  .footer{text-align:center;margin-top:30px;color:#999;font-size:12px;border-top:1px solid #eee;padding-top:15px}
  .status{display:inline-block;background:#dcfce7;color:#166534;padding:4px 12px;border-radius:20px;font-weight:600;font-size:13px}
  @media print{body{margin:0}button{display:none!important}}
</style></head><body>
  <div class="header"><h1>Divine Travels</h1><p>Payment Invoice</p></div>
  <table>
    <tr><td>Invoice #</td><td>INV-${payment.id.slice(-8).toUpperCase()}</td></tr>
    <tr><td>Date</td><td>${new Date(payment.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</td></tr>
    <tr><td>Payment Method</td><td>${payment.method}</td></tr>
    <tr><td>Transaction ID</td><td>${payment.transactionId || 'N/A'}</td></tr>
    <tr><td>Status</td><td><span class="status">${payment.status === 'completed' ? 'Paid' : payment.status}</span></td></tr>
    <tr class="total"><td>Amount Paid</td><td>₹${payment.amount.toLocaleString()}</td></tr>
  </table>
  <div class="footer">
    <p>Divine Travels | Rishikesh, Uttarakhand | divinetravels.in</p>
    <p>Thank you for choosing Divine Travels!</p>
  </div>
  <div style="text-align:center;margin-top:20px"><button onclick="window.print()" style="background:#e67e22;color:white;border:none;padding:10px 30px;border-radius:8px;font-size:15px;cursor:pointer">Print / Save as PDF</button></div>
</body></html>`
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
    toast.success('Invoice opened — use Print/Save as PDF')
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
