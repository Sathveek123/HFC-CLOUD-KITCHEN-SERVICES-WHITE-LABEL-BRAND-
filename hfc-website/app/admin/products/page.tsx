'use client'

import React, { useState, useRef, useMemo } from 'react'
import { Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { useProductsStore } from '@/store/productsStore'
import CategoryBlock from '@/components/admin/products/CategoryBlock'

// Common food emojis for picker
const EMOJI_OPTIONS = ['🍽', '🍕', '🍔', '🍟', '🥗', '🍰', '🥤', '🍜', '🍱', '🍛', '🍛', '🍞', '🥩', '🍗', '🍖', '🥚', '🧆', '🫕', '🍲', '🥘', '🍝', '🍣', '🍱', '🍤', '🧁', '🍮', '🍩', '🍧', '🫖', '☕', '🧃', '🥛']

export default function AdminProductsPage() {
  const rawCategories = useProductsStore(state => state.categories)
  const categories = useMemo(
    () => [...rawCategories].sort((a, b) => a.sortOrder - b.sortOrder),
    [rawCategories]
  )
  const addCategory = useProductsStore(state => state.addCategory)

  const [newCatName, setNewCatName] = useState('')
  const [selectedEmoji, setSelectedEmoji] = useState('🍽')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [dupError, setDupError] = useState('')

  const endRef = useRef<HTMLDivElement>(null)

  const handleAddCategory = () => {
    const trimmed = newCatName.trim()
    if (!trimmed) return

    // Check for duplicate name (case-insensitive)
    const isDuplicate = categories.some(c => c.name.toLowerCase() === trimmed.toLowerCase())
    if (isDuplicate) {
      setDupError('A category with this name already exists')
      return
    }

    addCategory(trimmed, selectedEmoji)
    toast.success(`${trimmed} category created ✓`)
    setNewCatName('')
    setSelectedEmoji('🍽')
    setDupError('')

    // Scroll to bottom after state update
    setTimeout(() => {
      endRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8 bg-[#FAFAFA] min-h-full">

      {/* LAYER 1 — PAGE HEADER */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold text-[28px] text-brand-black">Menu</h1>
          <p className="font-body text-[12px] text-brand-muted mt-1">
            Admin / Products — changes here update the live website instantly
          </p>
        </div>

        {/* Global Search */}
        <div className="relative w-[280px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search any item across all categories..."
            className="w-full h-[38px] pl-9 pr-3 border border-brand-border rounded-[8px] font-body text-[13px] bg-white focus:border-brand-red focus:outline-none focus:ring-2 focus:ring-brand-red/10 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-red text-[18px] leading-none"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* LAYER 2 — ADD CATEGORY CARD */}
      <div className="bg-white border border-brand-border rounded-[12px] p-6 shadow-sm">
        <h2 className="font-display font-bold text-[18px] text-brand-black mb-4">Add Category</h2>

        <div className="flex items-end gap-3 flex-wrap">
          <div className="flex flex-col gap-1 flex-1 min-w-[240px] max-w-[420px]">
            <span className="font-brand font-semibold text-[10px] text-brand-muted uppercase tracking-[1px] mb-1.5">
              Category name
            </span>
            <input
              value={newCatName}
              onChange={e => {
                setNewCatName(e.target.value)
                setDupError('')
              }}
              onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
              placeholder="e.g. Starters, Beverages, Desserts"
              className={`w-full h-[42px] border rounded-[8px] px-4 font-body text-[14px] bg-white focus:outline-none focus:ring-2 focus:ring-brand-red/10 transition-all ${
                dupError ? 'border-red-400' : 'border-brand-border focus:border-brand-red'
              }`}
            />
            {dupError && (
              <span className="text-[11px] text-brand-red font-semibold mt-1">{dupError}</span>
            )}
          </div>

          {/* Emoji Picker */}
          <div className="relative flex flex-col gap-1">
            <span className="font-brand font-semibold text-[10px] text-brand-muted uppercase tracking-[1px] mb-1.5">
              Icon
            </span>
            <button
              type="button"
              onClick={() => setShowEmojiPicker(prev => !prev)}
              className="w-[42px] h-[42px] bg-white border border-brand-border rounded-[8px] text-[22px] flex items-center justify-center hover:border-brand-red transition-colors"
            >
              {selectedEmoji}
            </button>

            {showEmojiPicker && (
              <div className="absolute top-[52px] left-0 z-40 bg-white border border-brand-border rounded-[10px] shadow-lg p-3 grid grid-cols-6 gap-1.5 w-[200px]">
                {EMOJI_OPTIONS.map((em, i) => (
                  <button
                    key={i}
                    onClick={() => { setSelectedEmoji(em); setShowEmojiPicker(false) }}
                    className="w-8 h-8 text-[18px] rounded-[5px] hover:bg-brand-redLight transition-colors flex items-center justify-center"
                  >
                    {em}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleAddCategory}
            disabled={!newCatName.trim()}
            className={`h-[42px] px-6 font-brand font-bold text-[13px] uppercase tracking-[1px] rounded-[8px] transition-colors ${
              newCatName.trim()
                ? 'bg-brand-red hover:bg-brand-redHover text-white cursor-pointer'
                : 'bg-gray-100 text-brand-muted cursor-not-allowed opacity-60'
            }`}
          >
            Add category
          </button>
        </div>
      </div>

      {/* LAYER 3 — CATEGORY BLOCKS */}
      <div className="flex flex-col gap-6">
        {categories.map(category => (
          <CategoryBlock
            key={category.id}
            category={category}
            searchQuery={searchQuery}
          />
        ))}

        {categories.length === 0 && (
          <div className="bg-white border border-brand-border rounded-[12px] p-10 text-center text-brand-muted italic">
            No categories yet. Add one above to get started.
          </div>
        )}
      </div>

      {/* Scroll target for newly created categories */}
      <div ref={endRef} />
    </div>
  )
}
