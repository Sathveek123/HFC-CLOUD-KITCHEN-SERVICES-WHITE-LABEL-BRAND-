'use client'

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useProductsStore } from '@/store/productsStore'
import MenuCard from './MenuCard'

interface MenuGridProps {
  category: string
}

export default function MenuGrid({ category }: MenuGridProps) {
  const rawItems = useProductsStore(state => state.items)
  const items = useMemo(
    () =>
      rawItems
        .filter(item => item.categoryId === category && item.isAvailable)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [rawItems, category]
  )

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={category}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {items.map(item => (
          <MenuCard
            key={item.id}
            item={{
              id: item.id,
              name: item.name,
              description: item.description,
              price: item.price,
              category: item.categoryId,
              dietaryTag: item.isVeg ? 'veg' : 'non-veg',
              isBestseller: item.isBestseller,
              imageKeyword: '',
              image: item.imageUrl || undefined,
            }}
          />
        ))}
      </motion.div>
    </AnimatePresence>
  )
}
