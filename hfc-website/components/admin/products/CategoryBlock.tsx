'use client'

import React, { useState, useMemo } from 'react'
import { AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useProductsStore, ProductCategory } from '@/store/productsStore'
import ProductRow from './ProductRow'
import AddItemRow from './AddItemRow'

interface CategoryBlockProps {
  category: ProductCategory
  searchQuery: string
}

export default function CategoryBlock({ category, searchQuery }: CategoryBlockProps) {
  const rawItems = useProductsStore(state => state.items)
  const items = useMemo(
    () =>
      rawItems
        .filter(item => item.categoryId === category.id)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [rawItems, category.id]
  )
  const renameCategory = useProductsStore(state => state.renameCategory)
  const deleteCategory = useProductsStore(state => state.deleteCategory)

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showRenameInput, setShowRenameInput] = useState(false)
  const [renameValue, setRenameValue] = useState(category.name)

  const handleRename = () => {
    if (!renameValue.trim()) return
    renameCategory(category.id, renameValue.trim())
    setShowRenameInput(false)
    toast.success(`Category renamed to "${renameValue.trim()}" ✓`)
  }

  const handleDelete = () => {
    deleteCategory(category.id)
    toast.success(`"${category.name}" and all its items deleted`)
  }

  // Filter items based on search query
  const matchingItems = items.filter(
    item =>
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const hasMatches = matchingItems.length > 0 || !searchQuery

  return (
    <div id={`cat-${category.id}`} className="bg-white border border-brand-border rounded-[12px] overflow-hidden shadow-sm">
      {/* Category Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border bg-[#FAFAFA] flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <span className="text-[20px]">{category.emoji}</span>
          {showRenameInput ? (
            <div className="flex items-center gap-2">
              <input
                value={renameValue}
                onChange={e => setRenameValue(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleRename()
                  if (e.key === 'Escape') setShowRenameInput(false)
                }}
                autoFocus
                className="h-9 px-3 border border-brand-red rounded-[6px] font-display font-bold text-[16px] text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-red/10 w-48"
              />
              <button
                onClick={handleRename}
                className="h-8 px-3 bg-brand-red text-white font-brand font-bold text-[11px] uppercase rounded-[5px] hover:bg-brand-redHover transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => { setShowRenameInput(false); setRenameValue(category.name) }}
                className="h-8 px-3 border border-brand-border text-brand-body font-brand font-medium text-[11px] uppercase rounded-[5px] hover:bg-[#F5F5F5] transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <h2 className="font-display font-bold text-[19px] text-brand-black">{category.name}</h2>
          )}
          <span className="font-body text-[12px] text-brand-muted bg-white border border-brand-border rounded-full px-2.5 py-0.5 ml-1">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {!showRenameInput && (
            <button
              onClick={() => { setShowRenameInput(true); setRenameValue(category.name) }}
              className="h-[34px] px-4 bg-white border border-brand-border text-brand-black font-brand font-semibold text-[12px] uppercase tracking-[0.5px] rounded-[6px] hover:border-brand-black transition-all"
            >
              Rename
            </button>
          )}
          <button
            onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
            className="h-[34px] px-4 bg-white border border-red-300 text-red-600 font-brand font-semibold text-[12px] uppercase tracking-[0.5px] rounded-[6px] hover:bg-red-50 transition-all"
          >
            Delete category
          </button>
        </div>
      </div>

      {/* Inline Delete Category confirm row */}
      {showDeleteConfirm && (
        <div className="bg-red-50 border-b border-red-200 px-6 py-3 flex items-center gap-3 flex-wrap">
          <AlertTriangle size={15} className="text-red-500 flex-shrink-0" />
          <span className="font-body text-[13px] text-red-700 flex-1">
            Delete <strong>"{category.name}"</strong> and all <strong>{items.length}</strong> items inside it? This cannot be undone and items will disappear from the live menu immediately.
          </span>
          <button
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 text-white font-brand font-bold text-[12px] px-4 py-2 rounded-[6px] transition-colors cursor-pointer"
          >
            Delete Category
          </button>
          <button
            onClick={() => setShowDeleteConfirm(false)}
            className="border border-red-300 text-red-600 font-brand font-medium text-[12px] px-4 py-2 rounded-[6px] hover:bg-red-50 cursor-pointer"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Column Header Row — matching reference exactly: PHOTO | ITEM | PRICE | VEG | AVAILABLE | ACTIONS */}
      <div
        className="grid gap-3 px-6 py-2.5 bg-white border-b border-brand-border"
        style={{ gridTemplateColumns: '70px 1fr 120px 50px 80px 130px' }}
      >
        {['Photo', 'Item', 'Price', 'Veg', 'Available', 'Actions'].map(label => (
          <span key={label} className="font-brand font-semibold text-[10px] text-brand-muted uppercase tracking-[1px]">
            {label}
          </span>
        ))}
      </div>

      {/* Item Rows */}
      {hasMatches ? (
        <>
          {searchQuery
            ? matchingItems.map(item => (
                <ProductRow key={item.id} item={item} searchQuery={searchQuery} />
              ))
            : items.map(item => (
                <ProductRow key={item.id} item={item} searchQuery={searchQuery} />
              ))}
        </>
      ) : (
        <div className="px-6 py-5 text-brand-muted italic font-body text-[13px] text-center border-b border-brand-border">
          No matches in this category
        </div>
      )}

      {/* Add Item Row — always last */}
      <AddItemRow categoryId={category.id} categoryName={category.name} />
    </div>
  )
}
