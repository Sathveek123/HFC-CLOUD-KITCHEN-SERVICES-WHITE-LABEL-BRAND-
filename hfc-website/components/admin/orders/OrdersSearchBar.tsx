'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, SlidersHorizontal } from 'lucide-react'

interface OrdersSearchBarProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  fromDate: string
  setFromDate: (date: string) => void
  toDate: string
  setToDate: (date: string) => void
  orderTypeFilter: string
  setOrderTypeFilter: (type: string) => void
  paymentStatusFilter: string
  setPaymentStatusFilter: (status: string) => void
  filteredCount: number
  totalCount: number
}

export default function OrdersSearchBar({
  searchQuery,
  setSearchQuery,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  orderTypeFilter,
  setOrderTypeFilter,
  paymentStatusFilter,
  setPaymentStatusFilter,
  filteredCount,
  totalCount,
}: OrdersSearchBarProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleClearAll = () => {
    setSearchQuery('')
    setFromDate('')
    setToDate('')
    setOrderTypeFilter('all')
    setPaymentStatusFilter('all')
  }

  const hasActiveFilters =
    searchQuery || fromDate || toDate || orderTypeFilter !== 'all' || paymentStatusFilter !== 'all'

  return (
    <div className="mb-5">
      {/* Search Input and Toggle Button */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-[380px]">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Search by Order ID, Name, Phone..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full h-[40px] pl-10 pr-9 border border-brand-border rounded-[8px] font-body text-[13px] text-brand-black placeholder:text-brand-muted bg-white focus:outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/10 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-black transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`h-[40px] font-brand font-bold text-[13px] uppercase tracking-[1px] px-6 rounded-[8px] flex items-center gap-2 transition-colors border ${
            showAdvanced || hasActiveFilters
              ? 'bg-brand-red text-white border-brand-red hover:bg-brand-redHover'
              : 'bg-white text-brand-black border-brand-border hover:border-brand-black'
          }`}
        >
          <SlidersHorizontal size={14} />
          Filter
        </button>
      </div>

      {/* Advanced Filters Drawer */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-4 mt-3 pt-4 border-t border-brand-border font-body text-[13px]">
              {/* From Date */}
              <div className="flex flex-col gap-1">
                <span className="font-brand font-semibold text-[10px] text-brand-muted uppercase tracking-[0.5px]">From Date</span>
                <input
                  type="date"
                  value={fromDate}
                  onChange={e => setFromDate(e.target.value)}
                  className="h-10 px-3 border border-brand-border rounded-btn bg-white focus:outline-none focus:border-brand-red outline-none"
                />
              </div>

              {/* To Date */}
              <div className="flex flex-col gap-1">
                <span className="font-brand font-semibold text-[10px] text-brand-muted uppercase tracking-[0.5px]">To Date</span>
                <input
                  type="date"
                  value={toDate}
                  onChange={e => setToDate(e.target.value)}
                  className="h-10 px-3 border border-brand-border rounded-btn bg-white focus:outline-none focus:border-brand-red outline-none"
                />
              </div>

              {/* Order Type */}
              <div className="flex flex-col gap-1">
                <span className="font-brand font-semibold text-[10px] text-brand-muted uppercase tracking-[0.5px]">Order Type</span>
                <select
                  value={orderTypeFilter}
                  onChange={e => setOrderTypeFilter(e.target.value)}
                  className="h-10 px-3 border border-brand-border rounded-btn bg-white focus:outline-none focus:border-brand-red outline-none cursor-pointer"
                >
                  <option value="all">All Types</option>
                  <option value="delivery">Delivery</option>
                  <option value="dine-in">Dine-In</option>
                  <option value="takeaway">Takeaway</option>
                </select>
              </div>

              {/* Payment Status */}
              <div className="flex flex-col gap-1">
                <span className="font-brand font-semibold text-[10px] text-brand-muted uppercase tracking-[0.5px]">Payment Status</span>
                <select
                  value={paymentStatusFilter}
                  onChange={e => setPaymentStatusFilter(e.target.value)}
                  className="h-10 px-3 border border-brand-border rounded-btn bg-white focus:outline-none focus:border-brand-red outline-none cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="paid">Paid</option>
                  <option value="unpaid">Unpaid</option>
                  <option value="partial">Partial</option>
                </select>
              </div>

              {/* Clear Link */}
              {hasActiveFilters && (
                <div className="flex items-end pb-2">
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="text-brand-red font-brand font-bold text-[11px] uppercase hover:underline"
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results details text */}
      <div className="mt-3 font-body text-[12px] text-brand-muted">
        {searchQuery ? (
          <span>
            Results for &quot;<strong className="text-brand-black font-semibold">{searchQuery}</strong>&quot; —{' '}
          </span>
        ) : null}
        <span>
          Showing {filteredCount} of {totalCount} orders
        </span>
      </div>
    </div>
  )
}
