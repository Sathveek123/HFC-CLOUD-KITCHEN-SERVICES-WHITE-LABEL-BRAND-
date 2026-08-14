'use client'

import { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useProductsStore } from '@/store/productsStore'
import MenuCard from './MenuCard'

interface MenuGridProps {
  category: string
  searchQuery?: string
}

export default function MenuGrid({ category, searchQuery }: MenuGridProps) {
  const rawItems = useProductsStore(state => state.items)

  const isSearching = searchQuery && searchQuery.trim().length > 0

  const items = useMemo(() => {
    const available = rawItems.filter(item => item.isAvailable)
    if (isSearching) {
      const q = searchQuery!.trim().toLowerCase()
      return available
        .filter(
          item =>
            item.name.toLowerCase().includes(q) ||
            (item.description ?? '').toLowerCase().includes(q) ||
            item.categoryId.toLowerCase().includes(q)
        )
        .sort((a, b) => a.sortOrder - b.sortOrder)
    }
    return available
      .filter(item => item.categoryId === category)
      .sort((a, b) => a.sortOrder - b.sortOrder)
  }, [rawItems, category, searchQuery, isSearching])

  // Empty state for search
  if (isSearching && items.length === 0) {
    return (
      <motion.div
        key="no-results"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <span className="text-[48px] mb-4">🍽️</span>
        <p className="font-brand font-semibold text-[18px] text-brand-black">
          No dishes found
        </p>
        <p className="font-body text-[14px] text-brand-muted mt-1.5">
          Try a different name, e.g. &ldquo;Biryani&rdquo; or &ldquo;Starter&rdquo;
        </p>
      </motion.div>
    )
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={isSearching ? `search-${searchQuery}` : category}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.25 }}
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
