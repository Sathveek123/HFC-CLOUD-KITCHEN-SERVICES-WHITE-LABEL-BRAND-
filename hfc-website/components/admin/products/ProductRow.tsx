'use client'

import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { ImageIcon, Save, Trash2, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useProductsStore, ProductItem } from '@/store/productsStore'

interface ProductRowProps {
  item: ProductItem
  searchQuery: string
}

export default function ProductRow({ item, searchQuery }: ProductRowProps) {
  const updateItem = useProductsStore(state => state.updateItem)
  const deleteItem = useProductsStore(state => state.deleteItem)

  // Local draft state
  const [draft, setDraft] = useState({
    name: item.name,
    description: item.description,
    price: String(item.price),
    mrp: item.mrp ? String(item.mrp) : '',
    isVeg: item.isVeg,
    isAvailable: item.isAvailable,
    imageUrl: item.imageUrl,
  })

  const [isDirty, setIsDirty] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [flashGreen, setFlashGreen] = useState(false)
  const [imageRemoving, setImageRemoving] = useState(false)
  const [imageWarning, setImageWarning] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Sync draft when item changes externally (e.g., from store)
  useEffect(() => {
    setDraft({
      name: item.name,
      description: item.description,
      price: String(item.price),
      mrp: item.mrp ? String(item.mrp) : '',
      isVeg: item.isVeg,
      isAvailable: item.isAvailable,
      imageUrl: item.imageUrl,
    })
    setIsDirty(false)
  }, [item.id])

  const updateDraft = (field: string, value: any) => {
    setDraft(prev => ({ ...prev, [field]: value }))
    setIsDirty(true)
  }

  // Validate
  const priceNum = parseFloat(draft.price)
  const mrpNum = draft.mrp ? parseFloat(draft.mrp) : null
  const priceValid = !isNaN(priceNum) && priceNum > 0
  const mrpValid = !mrpNum || mrpNum >= priceNum
  const nameValid = draft.name.trim().length > 0
  const canSave = isDirty && priceValid && mrpValid && nameValid

  const handleSave = () => {
    if (!canSave) return

    const finalImageUrl = imageRemoving ? null : draft.imageUrl

    updateItem(item.id, {
      name: draft.name.trim(),
      description: draft.description.trim(),
      price: priceNum,
      mrp: mrpNum,
      isVeg: draft.isVeg,
      isAvailable: draft.isAvailable,
      imageUrl: finalImageUrl,
    })

    setIsDirty(false)
    setImageRemoving(false)
    setFlashGreen(true)
    setTimeout(() => setFlashGreen(false), 500)
    toast.success(`${draft.name} updated ✓`)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 500 * 1024) {
      setImageWarning('Large image — consider compressing')
    } else {
      setImageWarning('')
    }

    const reader = new FileReader()
    reader.onload = () => {
      updateDraft('imageUrl', reader.result as string)
      setImageRemoving(false)
    }
    reader.readAsDataURL(file)
  }

  const handleDelete = () => {
    deleteItem(item.id)
    toast.success(`${item.name} deleted`)
  }

  // Highlight search match
  const isMatch =
    !searchQuery ||
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())

  if (!isMatch) return null

  const displayImage = imageRemoving ? null : draft.imageUrl

  return (
    <div
      className={`transition-colors duration-300 border-b border-brand-border last:border-0 ${
        flashGreen ? 'bg-green-50' : draft.isAvailable ? 'hover:bg-[#FAFAFA]' : 'opacity-60 bg-gray-50/50 hover:bg-gray-50'
      }`}
    >
      {/* Main Row Grid — matches reference: Photo | Item | Price | Veg | Available | Actions */}
      <div className="grid gap-3 px-6 py-4 items-start" style={{ gridTemplateColumns: '70px 1fr 120px 50px 80px 130px' }}>

        {/* Col 1: Photo */}
        <div className="flex flex-col gap-1.5">
          <div className="w-14 h-14 rounded-[8px] overflow-hidden border border-brand-border bg-[#FAFAFA] relative flex-shrink-0">
            {displayImage ? (
              <Image src={displayImage} alt={draft.name} fill className="object-cover" unoptimized />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-brand-muted">
                <ImageIcon size={16} />
              </div>
            )}
          </div>
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={imageRemoving}
              onChange={e => {
                setImageRemoving(e.target.checked)
                setIsDirty(true)
              }}
              className="w-3 h-3 accent-brand-red"
            />
            <span className="font-body text-[10px] text-brand-muted">Remove</span>
          </label>
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageChange}
            />
            <span className="block bg-white border border-brand-border rounded-[5px] px-2 py-1 font-body text-[10px] text-brand-black hover:bg-[#F5F5F5] transition-colors text-center w-full cursor-pointer">
              Choose File
            </span>
          </label>
          {imageWarning && (
            <span className="text-[9px] text-amber-600 leading-tight">{imageWarning}</span>
          )}
        </div>

        {/* Col 2: Item name + description */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1.5">
            <input
              value={draft.name}
              onChange={e => updateDraft('name', e.target.value)}
              className="flex-1 h-[36px] border border-brand-border rounded-[6px] px-3 font-brand font-semibold text-[13.5px] text-brand-black focus:border-brand-red focus:outline-none focus:ring-2 focus:ring-brand-red/10 transition-all"
              placeholder="Item name"
            />
            {!draft.isAvailable && (
              <span className="bg-[#F0F0F0] text-brand-muted font-brand font-semibold text-[9px] uppercase px-2 py-0.5 rounded-[4px] whitespace-nowrap">
                Hidden
              </span>
            )}
            {item.isBestseller && (
              <span className="bg-amber-50 text-amber-700 font-brand font-semibold text-[9px] uppercase px-2 py-0.5 rounded-[4px] whitespace-nowrap">
                ⭐ Best
              </span>
            )}
          </div>
          <input
            value={draft.description}
            onChange={e => updateDraft('description', e.target.value)}
            className="w-full h-[32px] border border-brand-border rounded-[6px] px-3 font-body text-[12px] text-brand-body focus:border-brand-red focus:outline-none focus:ring-2 focus:ring-brand-red/10 transition-all"
            placeholder="Short description shown to customers"
          />
        </div>

        {/* Col 3: Price + MRP */}
        <div className="flex flex-col gap-2">
          <input
            type="number"
            step="1"
            min="1"
            value={draft.price}
            onChange={e => updateDraft('price', e.target.value)}
            className={`w-full h-[36px] border rounded-[6px] px-3 font-brand font-bold text-[13.5px] text-brand-red focus:outline-none focus:ring-2 focus:ring-brand-red/10 transition-all ${
              !priceValid && draft.price ? 'border-red-400' : 'border-brand-border focus:border-brand-red'
            }`}
            placeholder="0.00"
          />
          <input
            type="number"
            step="1"
            value={draft.mrp}
            onChange={e => updateDraft('mrp', e.target.value)}
            className={`w-full h-[32px] border rounded-[6px] px-3 font-body text-[11px] text-brand-muted focus:outline-none focus:ring-2 focus:ring-brand-red/10 transition-all ${
              !mrpValid ? 'border-red-400' : 'border-brand-border focus:border-brand-red'
            }`}
            placeholder="MRP (optional)"
          />
          {!mrpValid && (
            <span className="text-[9px] text-brand-red font-semibold -mt-1">MRP should be ≥ price</span>
          )}
        </div>

        {/* Col 4: Veg toggle */}
        <div className="flex flex-col items-center gap-1.5 pt-2">
          <input
            type="checkbox"
            checked={draft.isVeg}
            onChange={e => updateDraft('isVeg', e.target.checked)}
            className="w-4 h-4 accent-green-600 cursor-pointer"
          />
          <span className={`w-2 h-2 rounded-full ${draft.isVeg ? 'bg-green-600' : 'bg-brand-red'}`} />
        </div>

        {/* Col 5: Available toggle */}
        <div className="flex flex-col items-center gap-1.5 pt-2">
          <input
            type="checkbox"
            checked={draft.isAvailable}
            onChange={e => updateDraft('isAvailable', e.target.checked)}
            className="w-4 h-4 accent-brand-red cursor-pointer"
          />
          <span className={`font-body text-[9px] uppercase tracking-[0.5px] ${draft.isAvailable ? 'text-green-700' : 'text-brand-muted'}`}>
            {draft.isAvailable ? 'On' : 'Off'}
          </span>
        </div>

        {/* Col 6: Actions */}
        <div className="flex flex-col gap-2 pt-0.5">
          <button
            onClick={handleSave}
            disabled={!canSave}
            className={`h-[30px] font-brand font-bold text-[11px] uppercase tracking-[0.5px] rounded-[6px] px-4 transition-all ${
              canSave
                ? 'bg-brand-red hover:bg-brand-redHover text-white cursor-pointer'
                : 'bg-gray-100 text-brand-muted cursor-not-allowed'
            }`}
          >
            Save
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="h-[30px] bg-white border border-red-300 text-red-600 font-brand font-bold text-[11px] uppercase tracking-[0.5px] rounded-[6px] hover:bg-red-50 transition-all cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Delete confirm inline row */}
      {showDeleteConfirm && (
        <div className="mx-6 mb-4 bg-red-50 border border-red-200 rounded-[6px] px-4 py-3 flex items-center gap-3">
          <AlertTriangle size={14} className="text-red-500 flex-shrink-0" />
          <span className="font-body text-[12px] text-red-700 flex-1">
            Delete "<strong>{item.name}</strong>"? It will be removed from the live menu immediately.
          </span>
          <button
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 text-white text-[11px] font-brand font-bold px-3 py-1.5 rounded-[5px] cursor-pointer transition-colors"
          >
            Delete
          </button>
          <button
            onClick={() => setShowDeleteConfirm(false)}
            className="border border-red-300 text-red-600 text-[11px] font-brand font-medium px-3 py-1.5 rounded-[5px] hover:bg-red-50 cursor-pointer"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}
