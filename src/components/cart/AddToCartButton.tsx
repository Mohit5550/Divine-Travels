'use client'

import { useState } from 'react'
import { ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useCart, CartItem } from '@/lib/cart'

export function AddToCartButton({
  item,
  className,
  variant = 'default',
}: {
  item: CartItem
  className?: string
  variant?: 'default' | 'outline' | 'ghost'
}) {
  const addItem = useCart((s) => s.addItem)
  const items = useCart((s) => s.items)
  const inCart = items.some((i) => i.key === item.key)
  const [busy, setBusy] = useState(false)

  return (
    <Button
      type="button"
      size="sm"
      variant={inCart ? 'outline' : variant}
      className={className}
      disabled={busy}
      onClick={(e) => {
        e.stopPropagation()
        if (inCart) {
          toast.info('Already in cart')
          return
        }
        setBusy(true)
        addItem(item)
        toast.success('Added to cart')
        setBusy(false)
      }}
    >
      <ShoppingCart className="w-3.5 h-3.5 mr-1" />
      {inCart ? 'In Cart' : 'Add to Cart'}
    </Button>
  )
}
