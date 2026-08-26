import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  key: string
  type: 'destination' | 'package'
  refId: string | null
  title: string | null
  image?: string | null
  price?: number | null
}

interface CartState {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (key: string) => void
  clear: () => void
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        if (get().items.some((i) => i.key === item.key)) return
        set((s) => ({ items: [...s.items, item] }))
      },
      removeItem: (key) => set((s) => ({ items: s.items.filter((i) => i.key !== key) })),
      clear: () => set({ items: [] }),
    }),
    { name: 'divine-travel-cart' }
  )
)
