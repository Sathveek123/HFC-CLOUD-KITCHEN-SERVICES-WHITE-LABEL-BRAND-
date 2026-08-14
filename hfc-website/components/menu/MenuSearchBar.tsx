'use client'

import { useEffect, useRef, useState } from 'react'
import { Search, X } from 'lucide-react'

interface MenuSearchBarProps {
  value: string
  onChange: (val: string) => void
}

export default function MenuSearchBar({ value, onChange }: MenuSearchBarProps) {
  const [localValue, setLocalValue] = useState(value)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Debounce 200ms before calling parent
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    setLocalValue(raw)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => onChange(raw), 200)
  }

  const handleClear = () => {
    setLocalValue('')
    onChange('')
    inputRef.current?.focus()
  }

  // Sync if parent resets externally
  useEffect(() => {
    if (value === '') setLocalValue('')
  }, [value])

  return (
    <div className="max-w-[1280px] mx-auto px-6 mb-6">
      <div
        className={`relative flex items-center bg-white border-2 rounded-[12px] transition-all duration-200 shadow-[0_2px_12px_rgba(0,0,0,0.06)] ${
          localValue
            ? 'border-brand-red shadow-[0_2px_20px_rgba(204,0,0,0.12)]'
            : 'border-brand-border hover:border-[#d0d0d0]'
        }`}
      >
        <Search
          size={18}
          className={`absolute left-4 flex-shrink-0 transition-colors duration-200 ${
            localValue ? 'text-brand-red' : 'text-brand-muted'
          }`}
        />

        <input
          ref={inputRef}
          id="menu-search-input"
          type="search"
          autoComplete="off"
          spellCheck={false}
          value={localValue}
          onChange={handleChange}
          placeholder="Search for dishes, e.g. Paneer Tikka…"
          className="w-full font-body text-[15px] text-brand-black placeholder:text-brand-muted bg-transparent outline-none py-3.5 pl-11 pr-10"
        />

        {localValue && (
          <button
            onClick={handleClear}
            aria-label="Clear search"
            className="absolute right-3 p-1.5 rounded-full text-brand-muted hover:text-brand-red hover:bg-brand-redLight transition-all duration-150"
          >
            <X size={15} />
          </button>
        )}
      </div>
    </div>
  )
}
