'use client'

import React, { useState, useRef, useMemo } from 'react'
import { ImageIcon, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { useProductsStore } from '@/store/productsStore'

interface AddItemRowProps {
  categoryId: string
  categoryName: string
}

export default function AddItemRow({ categoryId, categoryName }: AddItemRowProps) {
  const addItem = useProductsStore(state => state.addItem)
  const allItems = useProductsStore(state => state.items)
  const categoryItemCount = useMemo(
    () => allItems.filter(i => i.categoryId === categoryId).length,
    [allItems, categoryId]
  )

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [mrp, setMrp] = useState('')
  const [isVeg, setIsVeg] = useState(true)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageWarning, setImageWarning] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const priceNum = parseFloat(price)
  const mrpNum = mrp ? parseFloat(mrp) : null
  const canAdd = name.trim().length > 0 && !isNaN(priceNum) && priceNum > 0

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 500 * 1024) setImageWarning('Large image — consider compressing')
    else setImageWarning('')

    const reader = new FileReader()
    reader.onload = () => setImageUrl(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleAdd = () => {
    if (!canAdd) return

    addItem(categoryId, {
      name: name.trim(),
      description: description.trim(),
      price: priceNum,
      mrp: mrpNum,
      imageUrl,
      isVeg,
      isAvailable: true,
      isBestseller: false,
      sortOrder: categoryItemCount,
    })

    toast.success(`${name.trim()} added to ${categoryName} ✓`)

    // Reset form
    setName('')
    setDescription('')
    setPrice('')
    setMrp('')
    setIsVeg(true)
    setImageUrl(null)
    setImageWarning('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="bg-[#FAFAFA] border-t-2 border-dashed border-brand-border">
      {/* Column headers for add row — matches reference screenshot */}
      <div
        className="grid gap-3 px-6 py-2.5 border-b border-brand-border/60"
        style={{ gridTemplateColumns: '70px 1fr 120px 50px 80px 130px' }}
      >
        <span className="font-brand font-semibold text-[9px] text-brand-muted uppercase tracking-[1px]">Photo</span>
        <span className="font-brand font-semibold text-[9px] text-brand-muted uppercase tracking-[1px]">New item name &amp; description</span>
        <span className="font-brand font-semibold text-[9px] text-brand-muted uppercase tracking-[1px]">Price / MRP</span>
        <span className="font-brand font-semibold text-[9px] text-brand-muted uppercase tracking-[1px]">Veg</span>
        <span className="font-brand font-semibold text-[9px] text-brand-muted uppercase tracking-[1px] hidden sm:block"></span>
        <span className="font-brand font-semibold text-[9px] text-brand-muted uppercase tracking-[1px]"></span>
      </div>

      <div
        className="grid gap-3 px-6 py-4 items-start"
        style={{ gridTemplateColumns: '70px 1fr 120px 50px 80px 130px' }}
      >
        {/* Photo */}
        <div className="flex flex-col gap-1.5">
          <div className="w-14 h-14 rounded-[8px] overflow-hidden border-2 border-dashed border-brand-border bg-white relative flex-shrink-0 flex items-center justify-center text-brand-muted">
            {imageUrl ? (
              <img src={imageUrl} alt="preview" className="w-full h-full object-cover" />
            ) : (
              <Plus size={18} className="text-brand-muted" />
            )}
          </div>
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

        {/* Name + Description */}
        <div className="flex flex-col gap-2">
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            className="w-full h-[36px] border border-brand-border rounded-[6px] px-3 font-brand font-semibold text-[13.5px] text-brand-black focus:border-brand-red focus:outline-none focus:ring-2 focus:ring-brand-red/10 transition-all"
            placeholder="New item name"
          />
          <input
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full h-[32px] border border-brand-border rounded-[6px] px-3 font-body text-[12px] text-brand-body focus:border-brand-red focus:outline-none focus:ring-2 focus:ring-brand-red/10 transition-all"
            placeholder="Description"
          />
        </div>

        {/* Price + MRP */}
        <div className="flex flex-col gap-2">
          <input
            type="number"
            min="1"
            value={price}
            onChange={e => setPrice(e.target.value)}
            className="w-full h-[36px] border border-brand-border rounded-[6px] px-3 font-brand font-bold text-[13.5px] text-brand-red focus:border-brand-red focus:outline-none focus:ring-2 focus:ring-brand-red/10 transition-all"
            placeholder="Price"
          />
          <input
            type="number"
            min="1"
            value={mrp}
            onChange={e => setMrp(e.target.value)}
            className="w-full h-[32px] border border-brand-border rounded-[6px] px-3 font-body text-[11px] text-brand-muted focus:border-brand-red focus:outline-none focus:ring-2 focus:ring-brand-red/10 transition-all"
            placeholder="MRP (optional, shown struck-through)"
          />
        </div>

        {/* Veg */}
        <div className="flex flex-col items-center gap-1.5 pt-2">
          <input
            type="checkbox"
            checked={isVeg}
            onChange={e => setIsVeg(e.target.checked)}
            className="w-4 h-4 accent-green-600 cursor-pointer"
          />
          <span className={`w-2 h-2 rounded-full ${isVeg ? 'bg-green-600' : 'bg-brand-red'}`} />
        </div>

        {/* Available — always true for new items */}
        <div className="flex flex-col items-center pt-2">
          <input type="checkbox" checked disabled className="w-4 h-4 accent-brand-red opacity-50" />
          <span className="font-body text-[9px] text-brand-muted mt-1">On</span>
        </div>

        {/* Add button */}
        <div className="pt-0.5">
          <button
            onClick={handleAdd}
            disabled={!canAdd}
            className={`h-[36px] w-full font-brand font-bold text-[12px] uppercase tracking-[0.5px] rounded-[6px] px-4 transition-all ${
              canAdd
                ? 'bg-brand-red hover:bg-brand-redHover text-white cursor-pointer'
                : 'bg-gray-100 text-brand-muted cursor-not-allowed'
            }`}
          >
            Add item
          </button>
        </div>
      </div>
    </div>
  )
}
