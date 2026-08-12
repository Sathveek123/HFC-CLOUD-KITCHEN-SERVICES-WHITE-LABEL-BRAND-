'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ShoppingBag,
  CheckCircle2,
  Clock,
  IndianRupee,
  Truck
} from 'lucide-react'
import { format, startOfMonth, parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns'
import { useOrderStore, OrderRecord, OrderStatus } from '@/store/orderStore'
import { useAgentsStore } from '@/store/agentsStore'
import AdminBadge from '@/components/admin/shared/AdminBadge'
import AdminTable from '@/components/admin/shared/AdminTable'
import EmptyState from '@/components/admin/shared/EmptyState'

export default function AdminDashboardPage() {
  const orders = useOrderStore(state => state.orders)
  const updateOrderStatus = useOrderStore(state => state.updateOrderStatus)
  const assignAgent = useOrderStore(state => state.assignAgent)
  const agents = useAgentsStore(state => state.agents)

  // Default filter dates
  const [fromDateStr, setFromDateStr] = useState('')
  const [toDateStr, setToDateStr] = useState('')
  const [selectedAgent, setSelectedAgent] = useState('All')

  // Calculated orders to render
  const [filteredOrders, setFilteredOrders] = useState<OrderRecord[]>([])

  useEffect(() => {
    // Initialize date defaults once mounted on client
    const now = new Date()
    setFromDateStr(format(startOfMonth(now), 'yyyy-MM-dd'))
    setToDateStr(format(now, 'yyyy-MM-dd'))
  }, [])

  useEffect(() => {
    if (!fromDateStr || !toDateStr) return

    const start = startOfDay(parseISO(fromDateStr))
    const end = endOfDay(parseISO(toDateStr))

    const result = orders.filter(order => {
      const orderDate = new Date(order.createdAt)
      const dateInInterval = isWithinInterval(orderDate, { start, end })

      if (!dateInInterval) return false

      if (selectedAgent !== 'All') {
        if (selectedAgent === 'unassigned') {
          return !order.assignedAgent
        }
        return order.assignedAgent === selectedAgent
      }

      return true
    })

    setFilteredOrders(result)
  }, [orders, fromDateStr, toDateStr, selectedAgent])

  const handleReset = () => {
    const now = new Date()
    setFromDateStr(format(startOfMonth(now), 'yyyy-MM-dd'))
    setToDateStr(format(now, 'yyyy-MM-dd'))
    setSelectedAgent('All')
  }

  // 1. STAT CARDS CALCULATIONS
  const totalOrders = filteredOrders.length
  
  const completedOrders = filteredOrders.filter(
    o => ['accepted', 'ready', 'picked-up', 'delivered'].includes(o.status)
  ).length
  const deliveredCount = filteredOrders.filter(o => o.status === 'delivered').length

  const pendingOrdersCount = filteredOrders.filter(o => o.status === 'placed').length

  const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.total, 0)
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0

  // Count orders placed today
  const newOrdersToday = orders.filter(o => {
    const date = new Date(o.createdAt)
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear() &&
      o.status === 'placed'
    )
  }).length

  // 2. BY DELIVERY AGENT TABLE CALCULATIONS
  const agentBreakdown = agents.map(agent => {
    const agentOrders = filteredOrders.filter(o => o.assignedAgent === agent.name)
    return {
      agentName: agent.name,
      orderCount: agentOrders.length,
      totalValue: agentOrders.reduce((sum, o) => sum + o.total, 0),
      delivered: agentOrders.filter(o => o.status === 'delivered').length,
      pending: agentOrders.filter(o => o.status === 'placed').length,
    }
  })

  // Unassigned metrics
  const unassignedOrders = filteredOrders.filter(o => !o.assignedAgent)
  const unassignedCount = unassignedOrders.length
  const unassignedValue = unassignedOrders.reduce((sum, o) => sum + o.total, 0)

  // 3. RECENT ORDERS (Last 10)
  const recentOrders = [...filteredOrders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10)

  return (
    <div className="space-y-6">
      {/* 1A — Date Range + Agent Filter Bar */}
      <div className="bg-white border border-brand-border rounded-[12px] p-5 shadow-sm flex flex-wrap items-end gap-4">
        <div className="space-y-1 flex-1 min-w-[140px]">
          <label className="block font-brand font-semibold text-[11px] text-brand-body uppercase tracking-[1px]">
            From Date
          </label>
          <input
            type="date"
            value={fromDateStr}
            onChange={e => setFromDateStr(e.target.value)}
            className="w-full h-10 px-3 border border-brand-border rounded-btn font-body text-[13px] outline-none focus:border-brand-red"
          />
        </div>

        <div className="space-y-1 flex-1 min-w-[140px]">
          <label className="block font-brand font-semibold text-[11px] text-brand-body uppercase tracking-[1px]">
            To Date
          </label>
          <input
            type="date"
            value={toDateStr}
            onChange={e => setToDateStr(e.target.value)}
            className="w-full h-10 px-3 border border-brand-border rounded-btn font-body text-[13px] outline-none focus:border-brand-red"
          />
        </div>

        <div className="space-y-1 flex-1 min-w-[160px]">
          <label className="block font-brand font-semibold text-[11px] text-brand-body uppercase tracking-[1px]">
            Delivery Agent
          </label>
          <select
            value={selectedAgent}
            onChange={e => setSelectedAgent(e.target.value)}
            className="w-full h-10 px-3 border border-brand-border rounded-btn bg-white font-body text-[13px] outline-none focus:border-brand-red cursor-pointer"
          >
            <option value="All">All Agents</option>
            <option value="unassigned">— Unassigned —</option>
            {agents.map(a => (
              <option key={a.id} value={a.name}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleReset}
          className="font-brand font-semibold text-[12px] text-brand-red hover:underline pb-2 px-2 cursor-pointer h-10 flex items-center justify-center"
        >
          Reset Filters
        </button>
      </div>

      {/* 1B — Overview Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white border border-brand-border rounded-[12px] p-5 shadow-sm">
          <div className="w-11 h-11 bg-brand-redLight text-brand-red rounded-full flex items-center justify-center">
            <ShoppingBag size={20} />
          </div>
          <div className="font-brand font-black text-[38px] text-brand-black mt-3 leading-none">
            {totalOrders}
          </div>
          <div className="font-body text-[13px] text-brand-body mt-1.5">Total Orders</div>
          {newOrdersToday > 0 && (
            <div className="font-body font-semibold text-[11px] text-brand-red mt-2">
              ↑ {newOrdersToday} new orders today
            </div>
          )}
        </div>

        {/* Card 2 */}
        <div className="bg-white border border-brand-border rounded-[12px] p-5 shadow-sm">
          <div className="w-11 h-11 bg-green-50 text-green-700 rounded-full flex items-center justify-center">
            <CheckCircle2 size={20} />
          </div>
          <div className="font-brand font-black text-[38px] text-brand-black mt-3 leading-none">
            {completedOrders}
          </div>
          <div className="font-body text-[13px] text-brand-body mt-1.5">Delivered / Active</div>
          <div className="font-body font-semibold text-[11px] text-green-700 mt-2">
            {deliveredCount} fully completed
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white border border-brand-border rounded-[12px] p-5 shadow-sm">
          <div className={`w-11 h-11 rounded-full flex items-center justify-center ${pendingOrdersCount > 0 ? 'bg-amber-100 text-amber-700 animate-pulse' : 'bg-amber-50 text-amber-600'}`}>
            <Clock size={20} />
          </div>
          <div className="font-brand font-black text-[38px] text-brand-black mt-3 leading-none">
            {pendingOrdersCount}
          </div>
          <div className="font-body text-[13px] text-brand-body mt-1.5">Pending Orders</div>
          <div className="font-body font-semibold text-[11px] text-amber-600 mt-2">
            {pendingOrdersCount > 0 ? '⚠️ Action Required' : 'All caught up'}
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white border border-brand-border rounded-[12px] p-5 shadow-sm">
          <div className="w-11 h-11 bg-brand-redLight text-brand-red rounded-full flex items-center justify-center">
            <IndianRupee size={20} />
          </div>
          <div className="font-brand font-black text-[38px] text-brand-black mt-3 leading-none">
            ₹{totalRevenue.toLocaleString('en-IN')}
          </div>
          <div className="font-body text-[13px] text-brand-body mt-1.5">Total Revenue</div>
          <div className="font-body text-[11px] text-brand-muted mt-2">
            Avg ₹{avgOrderValue} per order
          </div>
        </div>
      </div>

      {/* 1C — By Delivery Agent Breakdown Table */}
      <div className="bg-white border border-brand-border rounded-[12px] overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-brand-border bg-white flex justify-between items-center">
          <h3 className="font-brand font-bold text-[15px] text-brand-black">By Delivery Agent</h3>
        </div>

        <AdminTable
          headers={['Agent', 'Orders', 'Value', 'Delivered', 'Pending']}
          alignments={['left', 'right', 'right', 'right', 'right']}
        >
          {agentBreakdown.map(row => {
            const initials = row.agentName
              .split(' ')
              .map(n => n[0])
              .join('')
              .toUpperCase()

            return (
              <tr key={row.agentName} className="hover:bg-brand-surface transition-colors font-body text-[13px]">
                <td className="px-5 py-3.5 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-brand-redLight text-brand-red font-brand font-bold text-[11px] flex items-center justify-center">
                    {initials}
                  </div>
                  <span className="font-medium text-brand-black">{row.agentName}</span>
                </td>
                <td className="text-right px-5 py-3.5 font-brand font-semibold text-[13.5px]">
                  {row.orderCount}
                </td>
                <td className="text-right px-5 py-3.5 font-brand font-bold text-[13.5px] text-brand-red">
                  ₹{row.totalValue.toLocaleString('en-IN')}
                </td>
                <td className="text-right px-5 py-3.5 font-brand font-semibold text-green-700">
                  {row.delivered}
                </td>
                <td className="text-right px-5 py-3.5 font-brand font-semibold text-amber-600">
                  {row.pending}
                </td>
              </tr>
            )
          })}

          {/* Unassigned row */}
          {unassignedCount > 0 && (
            <tr className="bg-brand-surface hover:bg-brand-surface transition-colors font-body text-[13px] border-t border-brand-border">
              <td className="px-5 py-3.5 italic text-brand-muted font-medium">
                — Unassigned Orders —
              </td>
              <td className="text-right px-5 py-3.5 font-brand font-semibold text-[13.5px]">
                {unassignedCount}
              </td>
              <td className="text-right px-5 py-3.5 font-brand font-bold text-[13.5px] text-brand-red">
                ₹{unassignedValue.toLocaleString('en-IN')}
              </td>
              <td className="text-right px-5 py-3.5 font-semibold text-brand-muted">—</td>
              <td className="text-right px-5 py-3.5 font-semibold text-brand-muted">—</td>
            </tr>
          )}
        </AdminTable>
      </div>

      {/* 1D — Recent Orders Table */}
      <div className="bg-white border border-brand-border rounded-[12px] overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-brand-border bg-white flex items-center justify-between">
          <h3 className="font-brand font-bold text-[15px] text-brand-black">Recent Orders</h3>
          <Link
            href="/admin/orders"
            className="font-brand font-semibold text-[12px] text-brand-red hover:underline"
          >
            View All Orders →
          </Link>
        </div>

        <AdminTable
          headers={['Order ID', 'Date & Time', 'Customer', 'Type', 'Delivery Agent', 'Total', 'Status']}
          alignments={['left', 'left', 'left', 'left', 'left', 'right', 'left']}
        >
          {recentOrders.length === 0 ? (
            <EmptyState message="No orders recorded inside date filters." />
          ) : (
            recentOrders.map(order => {
              const formattedDate = format(new Date(order.createdAt), 'dd MMM, h:mm a')

              return (
                <tr
                  key={order.id}
                  className="hover:bg-brand-surface transition-colors font-body text-[13px] border-t border-brand-border"
                >
                  {/* Order ID */}
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-mono font-bold text-brand-black hover:text-brand-red hover:underline"
                    >
                      {order.id}
                    </Link>
                  </td>

                  {/* Date */}
                  <td className="px-5 py-3.5 text-brand-muted whitespace-nowrap">
                    {formattedDate}
                  </td>

                  {/* Customer */}
                  <td className="px-5 py-3.5">
                    <div className="font-semibold text-brand-black">{order.customerName}</div>
                    <div className="text-[11px] text-brand-muted">{order.phoneNumber}</div>
                  </td>

                  {/* Type */}
                  <td className="px-5 py-3.5">
                    <AdminBadge variant="type" value={order.orderType} />
                  </td>

                  {/* Delivery Agent Selector */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5">
                      {order.assignedAgent && <Truck size={14} className="text-brand-muted" />}
                      <select
                        value={order.assignedAgent || ''}
                        onChange={e => assignAgent(order.id, e.target.value || undefined)}
                        className="font-body text-[12px] text-brand-red bg-transparent font-medium cursor-pointer outline-none focus:underline"
                      >
                        <option value="">Not Assigned</option>
                        {agents.map(a => (
                          <option key={a.id} value={a.name}>
                            {a.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>

                  {/* Total */}
                  <td className="px-5 py-3.5 text-right font-brand font-bold text-brand-black">
                    ₹{order.total.toLocaleString('en-IN')}
                  </td>

                  {/* Status Dropdown selector */}
                  <td className="px-5 py-3.5">
                    <select
                      value={order.status}
                      onChange={e => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                      className="font-brand font-bold text-[10px] uppercase border border-brand-border rounded-btn bg-white px-2 py-1 outline-none cursor-pointer focus:border-brand-red"
                    >
                      <option value="placed">New</option>
                      <option value="accepted">Accepted</option>
                      <option value="ready">Ready</option>
                      <option value="picked-up">Out for Delivery</option>
                      <option value="delivered">Delivered</option>
                      <option value="rejected">Rejected</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              )
            })
          )}
        </AdminTable>
      </div>
    </div>
  )
}
