'use client'

import React from 'react'
import { OrderStatus } from '@/store/orderStore'

interface OrderStatusBadgeProps {
  status: OrderStatus
}

export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  let label = status.replace('-', ' ')
  let styles = ''
  let showDot = false

  switch (status) {
    case 'placed':
      label = 'NEW'
      styles = 'bg-[#FFF8E1] text-[#D97706] border border-[#FDE68A]'
      showDot = true
      break
    case 'accepted':
      label = 'ACCEPTED'
      styles = 'bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]'
      break
    case 'ready':
      label = 'READY'
      styles = 'bg-[#F0FDF4] text-[#15803D] border border-[#86EFAC]'
      break
    case 'picked-up':
      label = 'OUT FOR DELIVERY'
      styles = 'bg-[#134E4A] text-white border border-[#115e59]'
      break
    case 'delivered':
      label = 'DELIVERED'
      styles = 'bg-[#14532D] text-white border border-[#166534]'
      break
    case 'rejected':
      label = 'REJECTED'
      styles = 'bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]'
      break
    case 'cancelled':
      label = 'CANCELLED'
      styles = 'bg-[#F9FAFB] text-[#6B7280] border border-[#E5E7EB]'
      break
  }

  return (
    <span
      className={`inline-flex items-center rounded-[20px] px-3 py-1.5 font-brand font-bold text-[10px] uppercase tracking-[0.8px] whitespace-nowrap ${styles}`}
    >
      {showDot && (
        <span className="w-1.5 h-1.5 rounded-full bg-[#D97706] animate-pulse mr-1.5" />
      )}
      {label}
    </span>
  )
}
