'use client'

import React from 'react'
import { format } from 'date-fns'
import Link from 'next/link'
import { OrderRecord } from '@/store/orderStore'
import OrderTableRow from './OrderTableRow'
import OrderStatusBadge from './OrderStatusBadge'
import EmptyState from '@/components/admin/shared/EmptyState'
import PaymentDropdown from './PaymentDropdown'
import AgentDropdown from './AgentDropdown'

interface OrdersTableProps {
  orders: OrderRecord[]
}

export default function OrdersTable({ orders }: OrdersTableProps) {
  if (orders.length === 0) {
    return <EmptyState message="No orders match the selected filters." />
  }

  return (
    <div className="bg-white border border-brand-border rounded-[12px] overflow-hidden shadow-sm">
      {/* 1. DESKTOP VIEW — TABLE GRID */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#FAFAFA] border-b border-brand-border">
              <th className="px-4 py-3.5 font-brand font-semibold text-[10px] text-brand-muted uppercase tracking-[1.2px] text-left">
                Order
              </th>
              <th className="px-4 py-3.5 font-brand font-semibold text-[10px] text-brand-muted uppercase tracking-[1.2px] text-left">
                Customer
              </th>
              <th className="px-4 py-3.5 font-brand font-semibold text-[10px] text-brand-muted uppercase tracking-[1.2px] text-left">
                Type
              </th>
              <th className="px-4 py-3.5 font-brand font-semibold text-[10px] text-brand-muted uppercase tracking-[1.2px] text-left">
                Total
              </th>
              <th className="px-4 py-3.5 font-brand font-semibold text-[10px] text-brand-muted uppercase tracking-[1.2px] text-left w-[180px]">
                Payment
              </th>
              <th className="px-4 py-3.5 font-brand font-semibold text-[10px] text-brand-muted uppercase tracking-[1.2px] text-left w-[190px]">
                Agent
              </th>
              <th className="px-4 py-3.5 font-brand font-semibold text-[10px] text-brand-muted uppercase tracking-[1.2px] text-left">
                Status
              </th>
              <th className="px-4 py-3.5 font-brand font-semibold text-[10px] text-brand-muted uppercase tracking-[1.2px] text-left min-w-[200px]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <OrderTableRow key={order.id} order={order} />
            ))}
          </tbody>
        </table>
      </div>

      {/* 2. MOBILE VIEW — CARD STACK */}
      <div className="md:hidden divide-y divide-brand-border bg-white">
        {orders.map(order => {
          const isNew = order.status === 'placed'
          const customerPhone = order.phoneNumber || ''
          const customerName = order.customerName || ''

          return (
            <div
              key={order.id}
              className={`p-4 space-y-3 transition-colors ${isNew ? 'bg-[#FFFBF0]' : 'bg-white'}`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div>
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="font-mono font-bold text-[13px] text-brand-black hover:underline"
                  >
                    {order.id}
                  </Link>
                  <div className="font-body text-[11px] text-brand-muted mt-0.5">
                    {format(new Date(order.createdAt), 'dd MMM, h:mm aa')}
                  </div>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>

              {/* Customer + Amount Row */}
              <div className="flex items-center justify-between font-body">
                <div>
                  <div className="font-brand font-semibold text-[13px] text-brand-black">
                    {customerName}
                  </div>
                  <a href={`tel:${customerPhone}`} className="text-[11px] text-brand-muted hover:underline">
                    {customerPhone}
                  </a>
                </div>
                <div className="text-right">
                  <div className="font-brand font-bold text-[15px] text-brand-black">
                    ₹{order.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                  <div
                    className={`font-brand font-semibold text-[10px] ${
                      order.paymentStatus === 'paid' ? 'text-green-700' : 'text-amber-600'
                    }`}
                  >
                    {order.paymentStatus === 'paid' ? '✓ Paid' : '⚠ Unpaid'}
                  </div>
                </div>
              </div>

              {/* Type, Agent & Payment Dropdowns */}
              <div className="grid grid-cols-2 gap-3 bg-brand-surface p-3 rounded-btn border border-brand-border">
                <div>
                  <span className="block font-brand font-semibold text-[9px] text-brand-muted uppercase tracking-[0.5px] mb-1">
                    Agent Assignment
                  </span>
                  <AgentDropdown order={order} />
                </div>
                <div>
                  <span className="block font-brand font-semibold text-[9px] text-brand-muted uppercase tracking-[0.5px] mb-1">
                    Payment Method / Status
                  </span>
                  <PaymentDropdown order={order} />
                </div>
              </div>

              {/* Actions row wrapping (rendered via TableRow action layout inside a custom cell wrapper) */}
              <div className="flex gap-2 flex-wrap pt-1.5 border-t border-dashed border-brand-border">
                {/* We render a lightweight mini action block */}
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="bg-brand-red text-white font-brand font-bold text-[10px] px-3.5 py-1.5 rounded uppercase hover:bg-brand-redHover inline-block text-center flex-1"
                >
                  View Details
                </Link>
                <Link
                  href={`/admin/bills?highlight=${order.id}`}
                  className="bg-white border border-brand-border text-brand-black font-brand font-bold text-[10px] px-3.5 py-1.5 rounded uppercase hover:bg-[#F5F5F5] inline-block text-center flex-1"
                >
                  View Bill
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
