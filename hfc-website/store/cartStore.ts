import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import toast from 'react-hot-toast'
import { CartItem, CartStore, MenuItem } from '@/types'

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item: MenuItem) => {
        const currentItems = get().items
        const existing = currentItems.find(i => i.id === item.id)

        if (existing) {
          set({
            items: currentItems.map(i =>
              i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
            ),
          })
        } else {
          set({ items: [...currentItems, { ...item, quantity: 1 }] })
        }

        toast.success(`${item.name} added to cart`, {
          style: {
            border: '1px solid #F0F0F0',
            padding: '12px 16px',
            color: '#1A1A1A',
            background: '#FFFFFF',
            fontFamily: 'var(--font-brand), sans-serif',
            fontSize: '13px',
            fontWeight: 600,
          },
          iconTheme: {
            primary: '#CC0000',
            secondary: '#FFFFFF',
          },
        })
      },

      removeItem: (id: string) => {
        set({ items: get().items.filter(i => i.id !== id) })
      },

      updateQuantity: (id: string, delta: number) => {
        const currentItems = get().items
        const target = currentItems.find(i => i.id === id)
        if (!target) return

        const newQty = target.quantity + delta
        if (newQty <= 0) {
          get().removeItem(id)
        } else {
          set({
            items: currentItems.map(i =>
              i.id === id ? { ...i, quantity: newQty } : i
            ),
          })
        }
      },

      clearCart: () => {
        set({ items: [] })
      },

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      getCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0)
      },

      getSubtotal: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      },
    }),
    {
      name: 'hfc-cart',
    }
  )
)
