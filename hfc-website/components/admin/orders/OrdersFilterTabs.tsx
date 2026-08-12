'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { OrderRecord, OrderStatus } from '@/store/orderStore'

export interface TabSpec {
  id: string
  label: string
  statuses: OrderStatus[]
}

export const statusTabs: TabSpec[] = [
  { id: 'active',           label: 'Active',           statuses: ['placed', 'accepted', 'ready', 'picked-up'] },
  { id: 'new',              label: 'New',              statuses: ['placed'] },
  { id: 'accepted',         label: 'Accepted',         statuses: ['accepted'] },
  { id: 'ready',            label: 'Ready',            statuses: ['ready'] },
  { id: 'out-for-delivery', label: 'Out for Delivery', statuses: ['picked-up'] },
  { id: 'delivered',        label: 'Delivered',        statuses: ['delivered'] },
  { id: 'cancelled',        label: 'Cancelled',        statuses: ['cancelled', 'rejected'] },
  { id: 'all',              label: 'All',              statuses: [] },
]

interface OrdersFilterTabsProps {
  activeTab: string
  setActiveTab: (tabId: string) => void
  orders: OrderRecord[]
  setSearchQuery: (query: string) => void
  setPage: (page: number) => void
}

export default function OrdersFilterTabs({
  activeTab,
  setActiveTab,
  orders,
  setSearchQuery,
  setPage,
}: OrdersFilterTabsProps) {

  // Compute counts for all tabs
  const getCount = (tab: TabSpec) => {
    if (tab.statuses.length === 0) return orders.length
    return orders.filter(o => tab.statuses.includes(o.status)).length
  }

  const newOrdersCount = orders.filter(o => o.status === 'placed').length

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId)
    setSearchQuery('')
    setPage(1)
  }

  return (
    <div className="flex items-center gap-2 flex-wrap mb-4 overflow-x-auto pb-1 scrollbar-hide">
      {statusTabs.map(tab => {
        const count = getCount(tab)
        const isActive = activeTab === tab.id
        const isNewTabWithOrders = tab.id === 'new' && newOrdersCount > 0

        return (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`font-brand text-[13px] rounded-[20px] px-5 py-2 flex items-center gap-2 transition-all duration-150 relative ${
              isActive
                ? 'bg-brand-red text-white font-bold shadow-[0_2px_8px_rgba(204,0,0,0.25)]'
                : 'bg-white border border-brand-border text-brand-body font-semibold hover:border-brand-red hover:text-brand-red'
            }`}
          >
            {tab.label}

            {count > 0 && (
              <span
                className={`font-brand font-black text-[10px] rounded-full w-5 h-5 flex items-center justify-center ${
                  isActive ? 'bg-white text-brand-red' : 'bg-brand-red text-white'
                }`}
              >
                {count}
              </span>
            )}

            {/* Pulsing warning indicator for incoming new orders tab */}
            {isNewTabWithOrders && !isActive && (
              <motion.span
                animate={{ scale: [1, 1.25, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="absolute top-0 right-0 w-3 h-3 bg-brand-red border border-white rounded-full translate-x-1 -translate-y-1"
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
