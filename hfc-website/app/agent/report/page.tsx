'use client'

import React, { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { AlertCircle } from 'lucide-react'
import { useAgentAuthStore } from '@/store/agentAuthStore'
import { useOrderStore } from '@/store/orderStore'
import AdminBadge from '@/components/admin/shared/AdminBadge'

export default function AgentReportPage() {
  const getLoggedInAgent = useAgentAuthStore(state => state.getLoggedInAgent)
  const agent = getLoggedInAgent()
  const orders = useOrderStore(state => state.orders)

  // Default From/To: First day of current month -> Today
  const defaultFrom = useMemo(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0]
  }, [])

  const defaultTo = useMemo(() => {
    return new Date().toISOString().split('T')[0]
  }, [])

  const [fromDate, setFromDate] = useState(defaultFrom)
  const [toDate, setToDate] = useState(defaultTo)
  const [appliedFrom, setAppliedFrom] = useState(defaultFrom)
  const [appliedTo, setAppliedTo] = useState(defaultTo)
  const [dateError, setDateError] = useState('')

  // Filter orders by agent name and date range
  const reportData = useMemo(() => {
    if (!agent) {
      return { assignedCount: 0, deliveredCount: 0, deliveredValue: 0, tableRows: [] }
    }

    const agentOrders = orders.filter(o => o.assignedAgent === agent.name)

    const fromTime = appliedFrom ? new Date(appliedFrom).setHours(0, 0, 0, 0) : 0
    const toTime = appliedTo ? new Date(appliedTo).setHours(23, 59, 59, 999) : Infinity

    const filtered = agentOrders.filter(o => {
      const orderTime = new Date(o.createdAt).getTime()
      return orderTime >= fromTime && orderTime <= toTime
    })

    const delivered = filtered.filter(o => o.status === 'delivered')
    const deliveredValue = delivered.reduce((sum, o) => sum + o.total, 0)

    const tableRows = [...filtered].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    return {
      assignedCount: filtered.length,
      deliveredCount: delivered.length,
      deliveredValue,
      tableRows
    }
  }, [orders, agent, appliedFrom, appliedTo])

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault()
    if (fromDate && toDate && toDate < fromDate) {
      setDateError('To date must be after From date')
      return
    }
    setDateError('')
    setAppliedFrom(fromDate)
    setAppliedTo(toDate)
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Layer 1 — Page Header */}
      <div>
        <h1 className="font-display font-bold text-[26px] text-brand-black">My Report</h1>
      </div>

      {/* Layer 2 — Date Filter Bar */}
      <form onSubmit={handleFilter} className="flex items-end gap-3 flex-wrap">
        <div>
          <label className="block font-brand font-semibold text-[10px] text-[#6A6A6A] uppercase tracking-[1px] mb-1.5">
            From
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={e => {
              setFromDate(e.target.value)
              setDateError('')
            }}
            className="w-[160px] h-[42px] border border-brand-border rounded-[6px] px-3 font-body text-[13px] text-brand-black focus:border-brand-red focus:outline-none focus:ring-2 focus:ring-brand-red/10 transition-all bg-white"
          />
        </div>

        <div>
          <label className="block font-brand font-semibold text-[10px] text-[#6A6A6A] uppercase tracking-[1px] mb-1.5">
            To
          </label>
          <input
            type="date"
            value={toDate}
            onChange={e => {
              setToDate(e.target.value)
              setDateError('')
            }}
            className={`w-[160px] h-[42px] border rounded-[6px] px-3 font-body text-[13px] text-brand-black focus:outline-none transition-all bg-white ${
              dateError ? 'border-red-400 focus:ring-2 focus:ring-red-200' : 'border-brand-border focus:border-brand-red focus:ring-2 focus:ring-brand-red/10'
            }`}
          />
        </div>

        <button
          type="submit"
          className="bg-brand-red text-white font-brand font-bold text-[13px] uppercase tracking-[1px] h-[42px] px-6 rounded-[8px] hover:bg-brand-redHover transition-colors cursor-pointer"
        >
          Filter
        </button>

        {dateError && (
          <div className="flex items-center gap-1.5 text-brand-red font-body text-[12px] font-semibold mb-2">
            <AlertCircle size={14} />
            {dateError}
          </div>
        )}
      </form>

      {/* Layer 3 — 3 Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1 — Assigned Orders */}
        <div className="bg-white border border-brand-border rounded-[12px] p-5 shadow-sm">
          <div className="font-brand font-black text-[34px] text-brand-black leading-none">
            {reportData.assignedCount}
          </div>
          <div className="font-body text-[13px] text-brand-muted mt-1.5">
            Assigned orders
          </div>
        </div>

        {/* Card 2 — Delivered */}
        <div className="bg-white border border-brand-border rounded-[12px] p-5 shadow-sm">
          <div className="font-brand font-black text-[34px] text-brand-black leading-none">
            {reportData.deliveredCount}
          </div>
          <div className="font-body text-[13px] text-brand-muted mt-1.5">
            Delivered
          </div>
        </div>

        {/* Card 3 — Delivered Value */}
        <div className="bg-white border border-brand-border rounded-[12px] p-5 shadow-sm">
          <div className="font-brand font-black text-[34px] text-brand-red leading-none">
            ₹{reportData.deliveredValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="font-body text-[13px] text-brand-muted mt-1.5">
            Delivered value
          </div>
        </div>
      </div>

      {/* Layer 4 — Orders Table */}
      <div className="bg-white border border-brand-border rounded-[12px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px]">
            <thead>
              <tr className="bg-[#FAFAFA] border-b border-brand-border">
                {['Order', 'Date', 'Customer', 'Total', 'Status'].map(h => (
                  <th
                    key={h}
                    className="font-brand font-semibold text-[10px] text-[#6A6A6A] uppercase tracking-[1.2px] px-5 py-3 text-left whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {reportData.tableRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 font-body text-[14px] text-brand-muted">
                    No orders found for this date range.
                  </td>
                </tr>
              ) : (
                reportData.tableRows.map(order => {
                  const formattedDate = format(new Date(order.createdAt), 'dd MMM, h:mm aa')

                  return (
                    <tr key={order.id} className="hover:bg-[#FAFAFA] transition-colors">
                      {/* Column 1 — ORDER */}
                      <td className="px-5 py-4 align-middle whitespace-nowrap">
                        <span className="font-mono font-bold text-[13px] text-brand-black">
                          {order.id}
                        </span>
                      </td>

                      {/* Column 2 — DATE */}
                      <td className="px-5 py-4 align-middle whitespace-nowrap">
                        <span className="font-body text-[13px] text-brand-black">
                          {formattedDate}
                        </span>
                      </td>

                      {/* Column 3 — CUSTOMER */}
                      <td className="px-5 py-4 align-middle">
                        <span className="font-brand font-semibold text-[13px] text-brand-black">
                          {order.customerName}
                        </span>
                      </td>

                      {/* Column 4 — TOTAL */}
                      <td className="px-5 py-4 align-middle whitespace-nowrap">
                        <span className="font-brand font-bold text-[14px] text-brand-black">
                          ₹{order.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </td>

                      {/* Column 5 — STATUS */}
                      <td className="px-5 py-4 align-middle whitespace-nowrap">
                        <AdminBadge variant="status" value={order.status} />
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
