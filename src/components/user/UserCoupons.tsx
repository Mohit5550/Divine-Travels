'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Gift, Copy, Calendar, Tag, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function UserCoupons() {
  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ['active-coupons'],
    queryFn: async () => {
      const res = await fetch('/api/coupons/active')
      return res.json()
    },
  })

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success(`Copied "${code}" to clipboard!`)
  }

  if (isLoading) {
    return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />)}</div>
  }

  return (
    <div>
      <h2 className="font-serif text-2xl sm:text-3xl text-brand-dark mb-6">My Coupons</h2>
      {coupons.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Gift className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-brand-dark mb-2">No coupons available</h3>
          <p className="text-muted-foreground text-sm">Check back later for special offers and discounts!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {coupons.map((coupon: any, idx: number) => (
            <motion.div
              key={coupon.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-xl shadow-sm overflow-hidden border border-dashed border-brand-orange/30 hover:shadow-md transition-shadow"
            >
              <div className="bg-gradient-to-r from-brand-orange to-brand-gold p-4 text-white">
                <div className="flex items-center justify-between">
                  <Tag className="w-5 h-5 opacity-80" />
                  <span className="text-2xl font-bold font-mono tracking-wider">{coupon.code}</span>
                </div>
                <p className="text-sm mt-1 opacity-90">{coupon.discountPct}% OFF {coupon.maxDiscount ? `(up to ₹${coupon.maxDiscount.toLocaleString()})` : ''}</p>
              </div>
              <div className="p-4">
                {coupon.description && <p className="text-sm text-muted-foreground mb-3">{coupon.description}</p>}
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-3">
                  {coupon.minAmount && <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-500" /> Min. ₹{coupon.minAmount.toLocaleString()}</span>}
                  {coupon.expiresAt && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Expires {new Date(coupon.expiresAt).toLocaleDateString()}</span>}
                  {coupon.maxUses && <span>{coupon.usedCount}/{coupon.maxUses} used</span>}
                </div>
                <Button onClick={() => copyCode(coupon.code)} className="w-full bg-brand-dark hover:bg-brand-dark/90 text-white text-sm h-9">
                  <Copy className="w-3.5 h-3.5 mr-1.5" /> Copy Code
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
