'use client'

import { useEffect, useState } from 'react'
import CategoryTabs from './CategoryTabs'
import MenuGrid from './MenuGrid'
import MenuSearchBar from './MenuSearchBar'
import { useProductsStore } from '@/store/productsStore'
import { subscribeToProductsRealtime } from '@/lib/supabaseSync'

export default function MenuSection() {
  const [activeCategory, setActiveCategory] = useState('starters')
  const [searchQuery, setSearchQuery] = useState('')
  const fetchAndSyncProducts = useProductsStore(state => state.fetchAndSyncProducts)
  const upsertProductFromSupabase = useProductsStore(state => state.upsertProductFromSupabase)
  const removeProductFromSupabase = useProductsStore(state => state.removeProductFromSupabase)
  const rawItems = useProductsStore(state => state.items)

  useEffect(() => {
    // Load latest products from Supabase on mount
    fetchAndSyncProducts()
    // Subscribe to realtime product changes (admin edits appear instantly on menu)
    const unsubscribe = subscribeToProductsRealtime(
      upsertProductFromSupabase,
      removeProductFromSupabase
    )
    return () => unsubscribe()
  }, [fetchAndSyncProducts, upsertProductFromSupabase, removeProductFromSupabase])

  const isSearching = searchQuery.trim().length > 0

  // Count results when searching
  const searchResultCount = isSearching
    ? rawItems.filter(item => {
        if (!item.isAvailable) return false
        const q = searchQuery.trim().toLowerCase()
        return (
          item.name.toLowerCase().includes(q) ||
          (item.description ?? '').toLowerCase().includes(q) ||
          item.categoryId.toLowerCase().includes(q)
        )
      }).length
    : 0

  return (
    <section id="menu-section" className="bg-white py-[80px] lg:py-[100px]">
      {/* Section Header */}
      <div className="text-center max-w-[680px] mx-auto px-6 mb-12">
        <div className="w-[60px] h-[2px] bg-brand-red mx-auto" />
        <p className="font-brand font-semibold text-[11px] text-brand-red tracking-[5px] uppercase mt-3">
          ★ OUR MENU ★
        </p>
        <h2 className="font-display font-bold text-[32px] sm:text-[42px] text-brand-black mt-3">
          Crafted With Passion, Served With Pride
        </h2>
        <p className="font-body text-[16px] sm:text-[17px] text-brand-body mt-4 leading-[1.75]">
          Every dish is built around flavor, quality, and the kind of experience your guests will come back for.
        </p>
      </div>

      {/* Search Bar */}
      <MenuSearchBar value={searchQuery} onChange={setSearchQuery} />

      {/* Search result count chip */}
      {isSearching && (
        <div className="max-w-[1280px] mx-auto px-6 mb-4">
          <p className="font-body text-[13px] text-brand-muted">
            <span className="font-semibold text-brand-black">{searchResultCount}</span>{' '}
            {searchResultCount === 1 ? 'result' : 'results'} for{' '}
            <span className="text-brand-red font-semibold">&ldquo;{searchQuery.trim()}&rdquo;</span>
          </p>
        </div>
      )}

      {/* Category Tabs — hidden during search */}
      <div
        className={`transition-all duration-200 ${
          isSearching ? 'opacity-30 pointer-events-none select-none' : 'opacity-100'
        }`}
      >
        <CategoryTabs active={activeCategory} onChange={setActiveCategory} />
      </div>

      {/* Grid Container */}
      <div className="max-w-[1280px] mx-auto px-6 mt-12">
        <MenuGrid category={activeCategory} searchQuery={searchQuery} />
      </div>
    </section>
  )
}
