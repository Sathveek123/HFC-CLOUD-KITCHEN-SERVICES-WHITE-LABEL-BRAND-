'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { MenuItem } from '@/types'
import { useCartStore } from '@/store/cartStore'

interface MenuCardProps {
  item: MenuItem
}

export default function MenuCard({ item }: MenuCardProps) {
  const addItem = useCartStore(state => state.addItem)
  const updateQuantity = useCartStore(state => state.updateQuantity)
  const cartItems = useCartStore(state => state.items)

  const cartItem = cartItems.find(i => i.id === item.id)
  const qty = cartItem ? cartItem.quantity : 0

  const imageUrl = item.image || `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80`

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}
      transition={{ duration: 0.25 }}
      className="bg-white border border-brand-border rounded-card overflow-hidden flex flex-col justify-between cursor-default"
    >
      {/* Top Image Block */}
      <div>
        <div className="relative h-[220px] w-full bg-brand-surface overflow-hidden">
          <Image
            src={imageUrl}
            alt={item.name}
            fill
            className="object-cover transition-transform duration-500 hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {/* Category Badge top-left */}
          <span className="absolute top-3 left-3 bg-brand-red text-white font-brand font-semibold text-[9px] uppercase tracking-[1px] px-2.5 py-1 rounded-pill z-10 shadow-sm">
            {item.category.replace('-', ' ')}
          </span>

          {/* Bestseller Badge top-right */}
          {item.isBestseller && (
            <span className="absolute top-3 right-3 bg-brand-gold text-white font-brand font-semibold text-[9px] uppercase tracking-[1px] px-2.5 py-1 rounded-pill z-10 shadow-sm">
              ★ Bestseller
            </span>
          )}
        </div>

        {/* Middle Info Block */}
        <div className="px-5 pt-4 pb-0">
          {/* Dietary Tag */}
          <div className="flex items-center gap-1 mb-2">
            {item.dietaryTag === 'veg' && (
              <span className="flex items-center gap-1.5 text-[11px] font-brand font-semibold text-brand-green">
                <span className="w-3 h-3 border border-brand-green rounded-sm flex items-center justify-center">
                  <span className="w-1.5 h-1.5 bg-brand-green rounded-full" />
                </span>
                Veg
              </span>
            )}
            {item.dietaryTag === 'non-veg' && (
              <span className="flex items-center gap-1.5 text-[11px] font-brand font-semibold text-brand-red">
                <span className="w-3 h-3 border border-brand-red rounded-sm flex items-center justify-center">
                  <span className="w-1.5 h-1.5 bg-brand-red rounded-full" />
                </span>
                Non-Veg
              </span>
            )}
            {item.dietaryTag === 'egg' && (
              <span className="flex items-center gap-1.5 text-[11px] font-brand font-semibold text-brand-gold">
                <span className="w-3 h-3 border border-brand-gold rounded-sm flex items-center justify-center">
                  <span className="w-1.5 h-1.5 bg-brand-gold rounded-full" />
                </span>
                Contains Egg
              </span>
            )}
          </div>

          {/* Food Name */}
          <h3 className="font-brand font-semibold text-[17px] text-brand-black leading-snug">
            {item.name}
          </h3>

          {/* Description */}
          <p className="font-body text-[13px] text-brand-muted mt-1.5 leading-[1.6] line-clamp-2">
            {item.description}
          </p>
        </div>
      </div>

      {/* Bottom Price + CTA */}
      <div className="flex items-center justify-between px-5 py-4 mt-4 border-t border-brand-border">
        <span className="font-brand font-bold text-[22px] text-brand-red">
          ₹ {item.price}
        </span>

        {qty === 0 ? (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => addItem(item)}
            className="bg-brand-red hover:bg-brand-redHover text-white font-brand font-semibold text-[11px] uppercase tracking-[1.5px] px-5 py-2.5 rounded-btn transition-colors duration-200"
          >
            + Add
          </motion.button>
        ) : (
          <div className="flex items-center border border-brand-red rounded-btn overflow-hidden bg-white">
            <button
              onClick={() => updateQuantity(item.id, -1)}
              className="w-8 h-8 flex items-center justify-center bg-brand-red text-white font-brand font-bold text-[14px] hover:bg-brand-redHover transition-colors"
            >
              −
            </button>
            <span className="font-brand font-bold text-[14px] text-brand-black min-w-[28px] text-center">
              {qty}
            </span>
            <button
              onClick={() => updateQuantity(item.id, 1)}
              className="w-8 h-8 flex items-center justify-center bg-brand-red text-white font-brand font-bold text-[14px] hover:bg-brand-redHover transition-colors"
            >
              +
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}
