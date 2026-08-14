'use client'

import React, { use, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Phone, MapPin, MessageCircle, FileText, CheckCircle2, User, HelpCircle } from 'lucide-react'
import { format } from 'date-fns'
import { useOrderStore, OrderRecord, OrderStatus } from '@/store/orderStore'
import { useAgentsStore } from '@/store/agentsStore'
import { useSettingsStore } from '@/store/settingsStore'
import { fetchAgentsFromSupabase } from '@/lib/supabaseSync'
import AdminBadge from '@/components/admin/shared/AdminBadge'
import AdminButton from '@/components/admin/shared/AdminButton'

interface OrderDetailsPageProps {
  params: Promise<{ orderId: string }>
}

export default function OrderDetailsPage({ params }: OrderDetailsPageProps) {
  const { orderId } = use(params)
  const router = useRouter()

  const order = useOrderStore(state => state.getOrderById(orderId))
  const updateOrderStatus = useOrderStore(state => state.updateOrderStatus)
  const updatePaymentStatus = useOrderStore(state => state.updatePaymentStatus)
  const assignAgent = useOrderStore(state => state.assignAgent)
  const markAsSeen = useOrderStore(state => state.markAsSeen)

  const agents = useAgentsStore(state => state.agents)
  const upsertAgents = useAgentsStore(state => state.upsertAgents)
  const settings = useSettingsStore(state => state.settings)

  useEffect(() => {
    if (orderId && order) {
      markAsSeen(orderId)
    }
  }, [orderId, order, markAsSeen])

  // Sync agents list on mount
  useEffect(() => {
    fetchAgentsFromSupabase().then(fetched => {
      if (fetched && fetched.length > 0) {
        upsertAgents(fetched)
      }
    })
  }, [upsertAgents])

  if (!order) {
    return (
      <div className="min-h-screen bg-brand-surface flex flex-col items-center justify-center p-6 text-center">
        <h2 className="font-display font-bold text-[24px] text-brand-black mb-2">Order Not Found</h2>
        <Link href="/admin/orders" className="text-brand-red font-semibold hover:underline">
          Return to Orders list
        </Link>
      </div>
    )
  }

  // 1. WhatsApp Notify Agent Message Builder
  const handleNotifyAgent = () => {
    if (!order.assignedAgent) return
    const agent = agents.find(a => a.name === order.assignedAgent)
    if (!agent) return

    const itemsSummary = order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')
    let text = `*HFC DELIVERY ASSIGNMENT*\n`
    text += `==========================\n`
    text += `🆔 *Order ID:* ${order.id}\n`
    text += `👤 *Customer Name:* ${order.customerName}\n`
    text += `📞 *Phone:* ${order.phoneNumber}\n`
    text += `🍲 *Items:* ${itemsSummary}\n`
    text += `💰 *Collect Amount:* ₹${order.total} (${order.paymentStatus === 'paid' ? 'PAID' : 'COLLECT CASH/UPI'})\n`

    if (order.address) {
      text += `🏡 *Delivery Address:* ${order.address}\n`
    }
    if (order.landmark) {
      text += `🏠 *Landmark:* ${order.landmark}\n`
    }
    if (order.coords) {
      text += `📍 *GPS Pin:* https://www.google.com/maps?q=${order.coords.lat},${order.coords.lng}\n`
    }

    const cleanPhone = agent.whatsapp.replace(/\D/g, '')
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  // 2. Share Text Bill to Customer
  const handleShareBillToCustomer = () => {
    const itemsSummary = order.items
      .map(i => `• ${i.quantity}x ${i.name} (₹${i.price * i.quantity})`)
      .join('\n')

    let text = `==========================\n`
    text += `📋 *HFC CONSULTANCY SERVICES — TAX INVOICE*\n`
    text += `==========================\n`
    text += `🆔 *Order ID:* ${order.id}\n`
    text += `👤 *Customer:* ${order.customerName}\n`
    text += `==========================\n`
    text += `🍲 *ITEMS ORDERED*\n`
    text += `${itemsSummary}\n`
    text += `==========================\n`
    text += `Subtotal: ₹${order.subtotal}\n`
    text += `GST (5%): ₹${order.gst}\n`
    text += `*Grand Total: ₹${order.total}*\n`
    text += `==========================\n`
    text += `Payment: ${order.paymentStatus.toUpperCase()} (${order.orderType.toUpperCase()})\n`
    text += `==========================\n`
    text += `_Thank you for ordering with HFC!_`

    const url = `https://wa.me/91${order.phoneNumber}?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  // 3. Print window handler
  const handlePrintBill = () => {
    const printContent = `
      <html>
        <head>
          <title>Invoice - ${order.id}</title>
          <style>
            body { font-family: sans-serif; padding: 20px; color: #1A1A1A; }
            .header { text-align: center; margin-bottom: 20px; }
            .meta { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 13px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }
            th, td { padding: 8px; border-bottom: 1px solid #F0F0F0; text-align: left; }
            th { background-color: #FAFAFA; font-weight: bold; }
            .total { text-align: right; font-weight: bold; font-size: 16px; margin-top: 10px; }
            .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #6A6A6A; font-style: italic; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>HFC CONSULTANCY SERVICES</h2>
            <p>Your Growth, Our Responsibility. All Within Your Budget.</p>
            <h3>TAX INVOICE</h3>
          </div>
          <div class="meta">
            <div>
              <strong>Order ID:</strong> ${order.id}<br/>
              <strong>Date:</strong> ${new Date(order.createdAt).toLocaleString('en-IN')}<br/>
              <strong>Type:</strong> ${order.orderType.toUpperCase()}
            </div>
            <div>
              <strong>Customer:</strong> ${order.customerName}<br/>
              <strong>Phone:</strong> ${order.phoneNumber}<br/>
              ${order.address ? `<strong>Address:</strong> ${order.address}` : ''}
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Item Description</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items
                .map(
                  i => `
                <tr>
                  <td>${i.name}</td>
                  <td>${i.quantity}</td>
                  <td>₹${i.price}</td>
                  <td>₹${i.price * i.quantity}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
          <div class="total">
            Subtotal: ₹${order.subtotal}<br/>
            GST (5%): ₹${order.gst}<br/>
            Grand Total: ₹${order.total}
          </div>
          <div class="footer">
            Thank you for ordering from HFC Consultancy Services
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `
    const win = window.open('', '_blank')
    if (win) {
      win.document.write(printContent)
      win.document.close()
    }
  }

  // Stepper Stage items
  const stepperStages: { status: OrderStatus; label: string }[] = [
    { status: 'placed', label: 'Order Placed' },
    { status: 'accepted', label: 'Accepted by Kitchen' },
    { status: 'ready', label: 'Prepared & Ready' },
    { status: 'picked-up', label: 'Out for Delivery / Dispatched' },
    { status: 'delivered', label: 'Delivered / Completed' },
  ]

  const activeIndex = stepperStages.findIndex(s => s.status === order.status)

  return (
    <div className="space-y-6">
      {/* Back to Orders */}
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-2 font-body text-[13px] text-brand-body hover:text-brand-red transition-colors"
      >
        <ArrowLeft size={16} /> Back to Orders
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN — Order Details (Col Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card 1 — Order Header Recap */}
          <div className="bg-white border border-brand-border rounded-[12px] p-6 shadow-sm flex items-center justify-between flex-wrap gap-4">
            <div>
              <span className="font-body text-[11px] uppercase tracking-[1px] text-brand-muted">Order ID</span>
              <h2 className="font-brand font-black text-[22px] text-brand-black tracking-tight mt-0.5">
                {order.id}
              </h2>
              <p className="font-body text-[12px] text-brand-muted mt-1">
                Placed on {new Date(order.createdAt).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="flex gap-2">
              <AdminBadge variant="type" value={order.orderType} />
              <AdminBadge variant="status" value={order.status} />
            </div>
          </div>

          {/* Card 2 — Customer Info */}
          <div className="bg-white border border-brand-border rounded-[12px] p-6 shadow-sm space-y-4">
            <h3 className="font-brand font-bold text-[14px] text-brand-black border-b border-brand-border pb-3 uppercase tracking-wider">
              Customer Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-body text-[13px]">
              <div>
                <span className="text-brand-muted block">Customer Name</span>
                <strong className="text-brand-black font-semibold">{order.customerName}</strong>
              </div>
              <div>
                <span className="text-brand-muted block">Phone Number</span>
                <a
                  href={`tel:${order.phoneNumber}`}
                  className="text-brand-red font-semibold hover:underline inline-flex items-center gap-1"
                >
                  <Phone size={13} /> {order.phoneNumber}
                </a>
              </div>
            </div>

            {order.address && (
              <div className="pt-2 border-t border-brand-border space-y-2">
                <span className="text-brand-muted block text-[13px]">Delivery Details</span>
                <div className="bg-brand-surface p-3.5 border border-brand-border rounded-btn text-brand-black font-body text-[13px] space-y-1">
                  <div><strong>Address:</strong> {order.address}</div>
                  {order.landmark && <div><strong>Landmark / House No:</strong> {order.landmark}</div>}
                  {order.coords && (
                    <div className="pt-2 flex flex-wrap gap-3">
                      <a
                        href={`https://www.google.com/maps?q=${order.coords.lat},${order.coords.lng}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-brand-red font-semibold hover:underline inline-flex items-center gap-1 text-[12px]"
                      >
                        <MapPin size={12} /> View GPS Location
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Card 3 — Items Ordered Table */}
          <div className="bg-white border border-brand-border rounded-[12px] p-6 shadow-sm space-y-4">
            <h3 className="font-brand font-bold text-[14px] text-brand-black border-b border-brand-border pb-3 uppercase tracking-wider">
              Dishes & Summary Receipt
            </h3>

            <div className="space-y-3 font-body text-[13px]">
              {order.items.map(item => (
                <div key={item.id} className="flex justify-between items-center py-1">
                  <div>
                    <span className="font-semibold text-brand-black">{item.quantity} ×</span> {item.name}
                  </div>
                  <div className="font-brand font-bold text-brand-black">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}

              <div className="pt-4 border-t border-brand-border space-y-1 text-brand-muted">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{order.subtotal.toLocaleString('en-IN')}</span>
                </div>
                {order.discountAmount && order.discountAmount > 0 && (
                  <div className="flex justify-between text-green-700 font-semibold">
                    <span>Discount Code ({order.couponCode})</span>
                    <span>- ₹{order.discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>GST (5%)</span>
                  <span>₹{order.gst.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between pt-3 font-brand font-bold text-[18px] text-brand-black border-t border-brand-border">
                  <span>Total Amount</span>
                  <span className="text-brand-red">₹{order.total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4 — Stepper Vertical Timeline */}
          <div className="bg-white border border-brand-border rounded-[12px] p-6 shadow-sm space-y-4">
            <h3 className="font-brand font-bold text-[14px] text-brand-black border-b border-brand-border pb-3 uppercase tracking-wider">
              Order Fulfillment Stepper
            </h3>
            
            <div className="space-y-4">
              {stepperStages.map((stage, idx) => {
                const isCompleted = idx < activeIndex
                const isActive = idx === activeIndex

                return (
                  <div key={stage.status} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-brand font-bold text-[10px] ${
                          isCompleted
                            ? 'bg-brand-red text-white'
                            : isActive
                            ? 'bg-brand-red text-white ring-4 ring-red-50'
                            : 'bg-brand-surface border border-brand-border text-brand-muted'
                        }`}
                      >
                        {idx + 1}
                      </div>
                      {idx < stepperStages.length - 1 && (
                        <div
                          className={`w-[2px] flex-1 min-h-[20px] ${
                            idx < activeIndex ? 'bg-brand-red' : 'bg-brand-border'
                          }`}
                        />
                      )}
                    </div>
                    <div className="pb-2">
                      <span
                        className={`font-brand text-[13px] uppercase tracking-[0.5px] ${
                          isActive || isCompleted ? 'font-bold text-brand-black' : 'text-brand-muted'
                        }`}
                      >
                        {stage.label}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN — Actions Panel */}
        <div className="space-y-6">
          
          {/* Card 5 — Status Management Buttons */}
          <div className="bg-white border border-brand-border rounded-[12px] p-6 shadow-sm space-y-4">
            <h3 className="font-brand font-bold text-[13px] text-brand-black uppercase tracking-wider">
              Update Order Status
            </h3>

            <div className="grid grid-cols-1 gap-2.5">
              <button
                onClick={() => updateOrderStatus(order.id, 'accepted')}
                className={`h-11 rounded-btn font-brand font-bold text-[12px] uppercase tracking-[1px] transition-colors ${
                  order.status === 'accepted'
                    ? 'bg-blue-600 text-white'
                    : 'border border-blue-600 text-blue-600 hover:bg-blue-50'
                }`}
              >
                Accept Order
              </button>

              <button
                onClick={() => updateOrderStatus(order.id, 'ready')}
                className={`h-11 rounded-btn font-brand font-bold text-[12px] uppercase tracking-[1px] transition-colors ${
                  order.status === 'ready'
                    ? 'bg-amber-500 text-white'
                    : 'border border-amber-500 text-amber-500 hover:bg-amber-50'
                }`}
              >
                Mark Prepared
              </button>

              <button
                onClick={() => updateOrderStatus(order.id, 'picked-up')}
                className={`h-11 rounded-btn font-brand font-bold text-[12px] uppercase tracking-[1px] transition-colors ${
                  order.status === 'picked-up'
                    ? 'bg-purple-600 text-white'
                    : 'border border-purple-600 text-purple-600 hover:bg-purple-50'
                }`}
              >
                Out For Delivery
              </button>

              <button
                onClick={() => updateOrderStatus(order.id, 'delivered')}
                className={`h-11 rounded-btn font-brand font-bold text-[12px] uppercase tracking-[1px] transition-colors ${
                  order.status === 'delivered'
                    ? 'bg-green-700 text-white'
                    : 'border border-green-700 text-green-700 hover:bg-green-50'
                }`}
              >
                Mark Delivered
              </button>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-brand-border">
                <button
                  onClick={() => updateOrderStatus(order.id, 'rejected')}
                  className={`h-10 rounded-btn font-brand font-bold text-[11px] uppercase tracking-[0.5px] border ${
                    order.status === 'rejected'
                      ? 'bg-red-700 text-white border-red-700'
                      : 'border-red-500 text-red-500 hover:bg-red-50'
                  }`}
                >
                  Reject Order
                </button>
                <button
                  onClick={() => updateOrderStatus(order.id, 'cancelled')}
                  className={`h-10 rounded-btn font-brand font-bold text-[11px] uppercase tracking-[0.5px] border ${
                    order.status === 'cancelled'
                      ? 'bg-gray-700 text-white border-gray-700'
                      : 'border-gray-400 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  Cancel Order
                </button>
              </div>
            </div>
          </div>

          {/* Card 6 — Agent Assignment */}
          <div className="bg-white border border-brand-border rounded-[12px] p-6 shadow-sm space-y-4">
            <h3 className="font-brand font-bold text-[13px] text-brand-black uppercase tracking-wider">
              Delivery Agent Assignment
            </h3>

            <div className="space-y-3">
              <select
                value={order.assignedAgent || ''}
                onChange={e => assignAgent(order.id, e.target.value || null)}
                className="w-full h-11 px-3 border border-brand-border rounded-btn bg-white font-body text-[13px] outline-none focus:border-brand-red cursor-pointer"
              >
                <option value="">Not Assigned</option>
                {agents.map(a => (
                  <option key={a.id} value={a.name}>
                    {a.name}
                  </option>
                ))}
              </select>

              {order.assignedAgent && (
                <button
                  onClick={handleNotifyAgent}
                  className="w-full h-10 border-2 border-brand-black text-brand-black hover:bg-brand-black hover:text-white font-brand font-semibold text-[12px] uppercase tracking-[1px] rounded-btn transition-colors inline-flex items-center justify-center gap-2"
                >
                  <MessageCircle size={15} /> Notify Agent
                </button>
              )}
            </div>
          </div>

          {/* Card 7 — Bill Actions */}
          <div className="bg-white border border-brand-border rounded-[12px] p-6 shadow-sm space-y-3">
            <h3 className="font-brand font-bold text-[13px] text-brand-black uppercase tracking-wider border-b border-brand-border pb-2.5">
              Invoicing & Payment
            </h3>

            <div className="flex justify-between items-center text-[13px] font-body">
              <span className="text-brand-muted">Payment status:</span>
              <AdminBadge variant="payment" value={order.paymentStatus} />
            </div>

            <button
              onClick={() => updatePaymentStatus(order.id, order.paymentStatus === 'paid' ? 'unpaid' : 'paid')}
              className="w-full h-11 bg-brand-surface border border-brand-border hover:bg-gray-100 font-brand font-semibold text-[12px] uppercase tracking-[0.5px] rounded-btn transition-colors text-brand-black"
            >
              {order.paymentStatus === 'paid' ? 'Mark Unpaid' : 'Mark Paid ✓'}
            </button>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-brand-border">
              <button
                onClick={handlePrintBill}
                className="h-10 border border-brand-black text-brand-black hover:bg-brand-black hover:text-white font-brand font-semibold text-[11px] uppercase rounded-btn inline-flex items-center justify-center gap-1.5 transition-colors"
              >
                <FileText size={14} /> Print Bill
              </button>
              <button
                onClick={handleShareBillToCustomer}
                className="h-10 bg-brand-whatsapp text-white hover:bg-[#1da851] font-brand font-semibold text-[11px] uppercase rounded-btn inline-flex items-center justify-center gap-1.5 transition-all duration-200"
              >
                <MessageCircle size={14} /> Share Bill
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
