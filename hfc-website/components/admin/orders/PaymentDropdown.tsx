'use client'

import React from 'react'
import toast from 'react-hot-toast'
import { useOrderStore, OrderRecord, PaymentStatus } from '@/store/orderStore'

interface PaymentDropdownProps {
  order: OrderRecord
}

export default function PaymentDropdown({ order }: PaymentDropdownProps) {
  const updatePaymentMethod = useOrderStore(state => state.updatePaymentMethod)
  const updatePaymentStatus = useOrderStore(state => state.updatePaymentStatus)

  const handleMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updatePaymentMethod(order.id, e.target.value as OrderRecord['paymentMethod'])
    toast.success(`Payment method set to ${e.target.value}`)
  }

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as PaymentStatus
    updatePaymentStatus(order.id, val)
    
    if (val === 'paid') {
      toast.success('Payment marked as Paid ✓')
      
      // Visual flash event feedback on table cell total can be handled on the parent row
      const cell = document.getElementById(`order-total-${order.id}`)
      if (cell) {
        cell.classList.add('bg-green-100')
        setTimeout(() => cell.classList.remove('bg-green-100'), 1500)
      }
    } else {
      toast.success(`Payment set to ${val.toUpperCase()}`)
    }
  }

  return (
    <div className="flex flex-col gap-2 w-[160px]" onClick={e => e.stopPropagation()}>
      {/* Payment Method select */}
      <select
        value={order.paymentMethod || 'Cash'}
        onChange={handleMethodChange}
        className="w-[160px] h-[32px] border border-brand-border rounded-[6px] px-3 font-body text-[12px] text-brand-black bg-white cursor-pointer outline-none focus:border-brand-red hover:border-brand-black transition-colors"
      >
        <option value="Cash">Cash</option>
        <option value="UPI">UPI</option>
        <option value="Online">Online</option>
        <option value="Card">Card</option>
      </select>

      {/* Payment Status select */}
      <select
        value={order.paymentStatus}
        onChange={handleStatusChange}
        className={`w-[160px] h-[32px] border rounded-[6px] px-3 font-brand font-semibold text-[11px] cursor-pointer outline-none transition-all ${
          order.paymentStatus === 'paid'
            ? 'border-green-300 bg-green-50 text-green-700'
            : order.paymentStatus === 'partial'
            ? 'border-amber-300 bg-amber-50 text-amber-700'
            : 'border-[#FDE68A] bg-[#FFF8E1] text-amber-700'
        }`}
      >
        <option value="unpaid">Unpaid</option>
        <option value="paid">Paid</option>
        <option value="partial">Partial</option>
      </select>
    </div>
  )
}
