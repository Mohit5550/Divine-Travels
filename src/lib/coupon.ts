// "Get up to X% OFF" coupon text with the admin-set rupee cap.
// threshold = booking amount at which the full capped discount applies.
// e.g. 20% + max ₹500 -> "Get up to 20% OFF (up to ₹500 on bookings ₹2,500+)"
export function couponUpToText(discountPct: number, maxDiscount?: number | null): string {
  const pct = Number(discountPct) || 0
  if (pct <= 0) return 'Special discount'
  if (maxDiscount && maxDiscount > 0) {
    const threshold = Math.ceil(maxDiscount / (pct / 100))
    return `Get up to ${pct}% OFF (up to ₹${maxDiscount.toLocaleString('en-IN')} on bookings ₹${threshold.toLocaleString('en-IN')}+)`;
  }
  return `Get ${pct}% OFF on your booking`;
}
