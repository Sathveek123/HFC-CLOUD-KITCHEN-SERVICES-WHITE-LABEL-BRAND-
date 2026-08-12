'use client'

import Image from 'next/image'
import { Trash2 } from 'lucide-react'
import { CartItem as CartItemType } from '@/types'
import { useCartStore } from '@/store/cartStore'

interface CartItemProps {
  item: CartItemType
}

export default function CartItem({ item }: CartItemProps) {
  const removeItem = useCartStore(state => state.removeItem)
  const updateQuantity = useCartStore(state => state.updateQuantity)

  const imageUrl = item.image || `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80`

  return (
    <div className="flex gap-4 py-4 border-b border-brand-border last:border-0 items-center">
      {/* Thumbnail Image */}
      <div className="relative w-[60px] h-[60px] rounded-[8px] overflow-hidden flex-shrink-0 border border-brand-border bg-brand-surface">
        <Image
          src={imageUrl}
          alt={item.name}
          fill
          className="object-cover"
          sizes="60px"
        />
      </div>

      {/* Item Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-brand font-semibold text-[14px] text-brand-black leading-snug truncate">
            {item.name}
          </h4>
          <button
            onClick={() => removeItem(item.id)}
            className="text-brand-red hover:text-brand-redHover flex-shrink-0 transition-colors p-0.5"
            title="Remove item"
          >
            <Trash2 size={15} />
          </button>
        </div>

        <div className="flex items-center justify-between mt-2">
          <span className="font-body text-[13px] text-brand-body">
            ₹{item.price} × {item.quantity} = <strong className="text-brand-black">₹{(item.price * item.quantity).toLocaleString('en-IN')}</strong>
          </span>

          {/* Quantity Stepper */}
          <div className="flex items-center border border-brand-border rounded-btn overflow-hidden bg-white">
            <button
              onClick={() => updateQuantity(item.id, -1)}
              className="w-7 h-7 bg-brand-red text-white flex items-center justify-center text-[13px] font-bold hover:bg-brand-redHover transition-colors"
            >
              −
            </button>
            <span className="w-7 text-center font-brand font-bold text-[13px] text-brand-black">
              {item.quantity}
            </span>
            <button
              onClick={() => updateQuantity(item.id, 1)}
              className="w-7 h-7 bg-brand-red text-white flex items-center justify-center text-[13px] font-bold hover:bg-brand-redHover transition-colors"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
