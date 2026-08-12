'use client'

import { useMemo } from 'react'
import { useProductsStore } from '@/store/productsStore'

interface CategoryTabsProps {
  active: string
  onChange: (id: string) => void
}

export default function CategoryTabs({ active, onChange }: CategoryTabsProps) {
  const rawCategories = useProductsStore(state => state.categories)
  const categories = useMemo(
    () => [...rawCategories].sort((a, b) => a.sortOrder - b.sortOrder),
    [rawCategories]
  )

  return (
    <div className="sticky top-[72px] z-30 bg-white border-b border-brand-border shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-2">
          {categories.map((cat) => {
            const isActive = active === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => onChange(cat.id)}
                className={`flex items-center gap-2 px-6 py-3.5 font-brand font-semibold text-[13px] whitespace-nowrap transition-all duration-200 border-b-[3px] rounded-t-btn ${
                  isActive
                    ? 'text-brand-red border-brand-red bg-brand-redLight'
                    : 'text-brand-body border-transparent hover:text-brand-red hover:bg-[rgba(204,0,0,0.02)]'
                }`}
              >
                <span className="text-[18px]">{cat.emoji}</span>
                <span>{cat.name}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
