'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Gift, Copy, Calendar, Tag, CheckCircle, Sparkles, Check, ArrowRight, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function UserCoupons() {
  const [manualCode, setManualCode] = useState('')
  const [validating, setValidating] = useState(false)
  const [validatedCoupon, setValidatedCoupon] = useState<any>(null)

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

  const handleValidateManual = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualCode.trim()) return
    setValidating(true)
    try {
      const res = await fetch(`/api/coupons/validate?code=${encodeURIComponent(manualCode.trim().toUpperCase())}`)
      const data = await res.json()
      if (!res.ok || !data.valid) {
        toast.error(data.error || 'Invalid or expired promo code')
        setValidatedCoupon(null)
      } else {
        setValidatedCoupon(data)
        toast.success(`Code "${data.code}" is valid! (${data.discountPct}% OFF)`)
      }
    } catch {
      toast.error('Failed to validate code')
    } finally {
      setValidating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-muted rounded-2xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-serif text-2xl sm:text-3xl text-brand-dark font-bold">Coupons &amp; Offers</h2>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Explore public discount codes or apply your creator/referral promo code during checkout.
        </p>
      </div>

      {/* Manual Referral / Influencer Code Check Box */}
      <div className="bg-gradient-to-r from-brand-teal/10 via-brand-orange/10 to-amber-500/10 border border-brand-orange/30 p-5 rounded-2xl">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-brand-orange" />
          <h3 className="font-bold text-sm text-gray-900">Have a Creator or Referral Code?</h3>
        </div>
        <p className="text-xs text-gray-600 mb-3">
          Influencer &amp; friend referral codes are exclusive. Enter your code below to verify your special discount:
        </p>
        <form onSubmit={handleValidateManual} className="flex gap-2 max-w-md">
          <input
            type="text"
            placeholder="e.g. ROHAN10, POOJA10, FIRSTTRIP"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value.toUpperCase())}
            className="flex-1 bg-white border border-gray-200 rounded-xl px-3.5 py-2 text-xs font-mono font-bold uppercase focus:outline-none focus:ring-2 focus:ring-brand-orange/20"
          />
          <Button
            type="submit"
            disabled={validating}
            className="bg-brand-orange hover:bg-brand-orange/90 text-white text-xs font-bold px-4 rounded-xl"
          >
            {validating ? 'Verifying...' : 'Verify Code'}
          </Button>
        </form>

        {validatedCoupon && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center justify-between"
          >
            <div>
              <span className="font-bold font-mono text-sm mr-2">{validatedCoupon.code}</span>
              <span>— {validatedCoupon.discountPct}% OFF {validatedCoupon.maxDiscount ? `(up to ₹${validatedCoupon.maxDiscount})` : ''}</span>
              {validatedCoupon.applicableCategory !== 'all' && (
                <span className="block text-[11px] text-emerald-700">Valid on: {validatedCoupon.applicableCategory}</span>
              )}
            </div>
            <span className="bg-emerald-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-full uppercase">
              Verified
            </span>
          </motion.div>
        )}
      </div>

      {/* Public Available Coupons */}
      <div className="space-y-4">
        <h3 className="font-bold text-sm text-gray-800 uppercase tracking-wider">Available Public Promo Codes</h3>

        {coupons.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <Gift className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-semibold text-brand-dark mb-1">No public promo codes available right now</h3>
            <p className="text-gray-500 text-xs">Stay tuned for seasonal discounts, or use your influencer referral code at checkout!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {coupons.map((coupon: any, idx: number) => (
              <motion.div
                key={coupon.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200/80 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="bg-gradient-to-r from-brand-orange to-amber-500 p-4 text-white">
                  <div className="flex items-center justify-between">
                    <Tag className="w-5 h-5 opacity-90" />
                    <span className="text-xl font-bold font-mono tracking-wider">{coupon.code}</span>
                  </div>
                  <p className="text-sm mt-1 font-semibold opacity-95">
                    {coupon.discountPct}% OFF {coupon.maxDiscount ? `(up to ₹${coupon.maxDiscount.toLocaleString()})` : ''}
                  </p>
                </div>
                <div className="p-4 space-y-3">
                  {coupon.description && <p className="text-xs text-gray-600 leading-relaxed">{coupon.description}</p>}

                  <div className="flex flex-wrap gap-2 text-[11px] text-gray-500">
                    {coupon.applicableCategory && coupon.applicableCategory !== 'all' && (
                      <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium capitalize">
                        Valid on: {coupon.applicableCategory}
                      </span>
                    )}
                    {coupon.userEligibility === 'new_users_only' && (
                      <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-medium">
                        First Booking Only
                      </span>
                    )}
                    {coupon.minAmount && (
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-emerald-500" /> Min. ₹{coupon.minAmount.toLocaleString()}
                      </span>
                    )}
                    {coupon.expiresAt && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gray-400" /> Expires {new Date(coupon.expiresAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <Button
                    onClick={() => copyCode(coupon.code)}
                    className="w-full bg-brand-dark hover:bg-brand-dark/90 text-white text-xs h-9 rounded-xl font-medium"
                  >
                    <Copy className="w-3.5 h-3.5 mr-1.5" /> Copy Code
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
