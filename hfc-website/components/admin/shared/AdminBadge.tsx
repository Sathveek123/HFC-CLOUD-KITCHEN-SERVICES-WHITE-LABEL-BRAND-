import React from 'react'

interface AdminBadgeProps {
  variant: 'type' | 'status' | 'payment'
  value: string
  className?: string
}

export default function AdminBadge({ variant, value, className = '' }: AdminBadgeProps) {
  let styles = 'font-brand font-bold text-[10px] uppercase tracking-[1px] px-3 py-1 rounded-pill border '

  if (variant === 'type') {
    if (value === 'dine-in') {
      styles += 'bg-blue-50 text-blue-700 border-blue-200'
    } else if (value === 'takeaway') {
      styles += 'bg-amber-50 text-amber-700 border-amber-200'
    } else if (value === 'delivery') {
      styles += 'bg-purple-50 text-purple-700 border-purple-200'
    } else {
      styles += 'bg-gray-50 text-gray-700 border-gray-200'
    }
  } else if (variant === 'status') {
    switch (value) {
      case 'placed':
        styles += 'bg-[#FFF3CD] text-[#856404] border-[#FFDA6A]'
        break
      case 'accepted':
        styles += 'bg-[#CCE5FF] text-[#004085] border-[#B8DAFF]'
        break
      case 'ready':
        styles += 'bg-[#FFF3CD] text-[#C9973A] border-[#C9973A]'
        break
      case 'picked-up':
        styles += 'bg-[#D4EDDA] text-[#155724] border-[#C3E6CB]'
        break
      case 'delivered':
        styles += 'bg-brand-red text-white border-brand-red'
        break
      case 'rejected':
        styles += 'bg-[#F8D7DA] text-[#721C24] border-[#F5C6CB]'
        break
      case 'cancelled':
        styles += 'bg-[#F0F0F0] text-[#6A6A6A] border-[#D0D0D0]'
        break
      default:
        styles += 'bg-gray-100 text-gray-800 border-gray-300'
    }
  } else if (variant === 'payment') {
    if (value === 'paid') {
      styles += 'bg-green-50 text-green-700 border-green-200'
    } else if (value === 'unpaid') {
      styles += 'bg-amber-50 text-amber-700 border-amber-200'
    } else {
      styles += 'bg-blue-50 text-blue-700 border-blue-200'
    }
  }

  const getLabel = () => {
    if (variant === 'status' && value === 'picked-up') return 'OUT FOR DELIVERY'
    if (variant === 'status' && value === 'placed') return 'NEW'
    return value.toUpperCase()
  }

  return <span className={`${styles} ${className}`}>{getLabel()}</span>
}
