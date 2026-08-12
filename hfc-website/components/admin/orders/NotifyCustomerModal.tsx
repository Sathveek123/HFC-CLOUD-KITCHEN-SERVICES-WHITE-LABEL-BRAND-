'use client'

import React, { useState, useEffect } from 'react'
import { X, MessageCircle } from 'lucide-react'
import { OrderRecord } from '@/store/orderStore'
import AdminModal from '@/components/admin/shared/AdminModal'

interface NotifyCustomerModalProps {
  isOpen: boolean
  onClose: () => void
  order: OrderRecord
}

interface TemplateSpec {
  id: string
  label: string
  text: string
  preview: string
}

export default function NotifyCustomerModal({
  isOpen,
  onClose,
  order,
}: NotifyCustomerModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState('confirmed')
  const [customText, setCustomText] = useState('')
  const [livePreview, setLivePreview] = useState('')

  const customerPhone = order.phoneNumber || ''
  const customerName = order.customerName || ''

  const templates: TemplateSpec[] = [
    {
      id: 'confirmed',
      label: 'Order Confirmed',
      text: `✅ *Order Confirmed!*\nHi {name}, your order *{id}* has been accepted by HFC Consultancy Services.\n🕐 Estimated time: {time}\n💰 Total: ₹{total}\nTrack live: https://hfc-consultancy.vercel.app/track/{id}\nThank you! 🍽️`,
      preview: 'Hi {name}, your order #{id} has been confirmed...',
    },
    {
      id: 'ready',
      label: 'Order Ready',
      text: `🔔 *Order Ready!*\nHi {name}, your order *{id}* is freshly prepared and ready!\n📍 Please pickup from HFC Consultancy Services counter.\n💰 Total: ₹{total}\nTrack: https://hfc-consultancy.vercel.app/track/{id}\nEnjoy your meal!`,
      preview: 'Hi {name}, your order is ready for pickup/delivery...',
    },
    {
      id: 'out-for-delivery',
      label: 'Out for Delivery',
      text: `🛵 *Out for Delivery!*\nHi {name}, your order *{id}* is on its way with our delivery executive.\n📱 Tracker: https://hfc-consultancy.vercel.app/track/{id}\n💰 Cash/UPI on delivery: ₹{total}\nGet ready for a delicious meal!`,
      preview: 'Hi {name}, your order is on its way! Track: ...',
    },
    {
      id: 'payment',
      label: 'Payment Reminder',
      text: `💳 *Payment Reminder — HFC*\nHi {name}, please complete the payment of *₹{total}* for your order *{id}*.\n📱 Pay via UPI: upi://pay?pa=9912799855@okbizaxis&pn=HFC&am={total}&cu=INR\nReply with payment screenshot to confirm dispatch. Thanks!`,
      preview: 'Hi {name}, please complete payment of ₹{total}...',
    },
    {
      id: 'delayed',
      label: 'Delivery Delayed',
      text: `⚠️ *Order Update — Delay*\nHi {name}, we are experiencing slight kitchen delays. Your order *{id}* is being prepared and will reach you slightly late.\nWe sincerely regret the inconvenience. For updates, reply here.`,
      preview: 'Hi {name}, slight delay in your order, sorry...',
    },
    {
      id: 'custom',
      label: 'Custom Message',
      text: '',
      preview: 'Type a custom message manually...',
    },
  ]

  useEffect(() => {
    if (selectedTemplate === 'custom') {
      setLivePreview(customText)
      return
    }

    const template = templates.find(t => t.id === selectedTemplate)
    if (!template) return

    // Replace variables
    let resolved = template.text
      .replace(/{name}/g, customerName)
      .replace(/{id}/g, order.id)
      .replace(/{total}/g, String(order.total))
      .replace(/{time}/g, order.orderType === 'delivery' ? '35-45 mins' : '15-20 mins')

    setLivePreview(resolved)
  }, [selectedTemplate, customText, order, customerName])

  const handleSend = () => {
    if (!livePreview.trim()) return

    const cleanPhone = customerPhone.replace(/\D/g, '')
    const url = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(livePreview)}`
    window.open(url, '_blank')
    onClose()
  }

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title="Notify Customer"
      size="sm"
    >
      <div className="space-y-4 font-body text-[13.5px]">
        {/* Customer subtitle */}
        <div className="bg-brand-surface p-3 border border-brand-border rounded-btn text-[12px] text-brand-muted">
          <span>Customer: </span>
          <strong className="text-brand-black font-semibold">{customerName}</strong>
          <span> · Phone: </span>
          <strong className="text-brand-black font-semibold">{customerPhone}</strong>
        </div>

        {/* Templates selector list */}
        <div className="space-y-2">
          <label className="block font-brand font-semibold text-[10px] text-brand-muted uppercase tracking-[1.5px]">
            Choose a message template
          </label>

          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
            {templates.map(template => {
              const isSelected = selectedTemplate === template.id
              return (
                <label
                  key={template.id}
                  className={`flex items-start gap-3 p-3.5 rounded-[8px] border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-brand-red bg-brand-redLight'
                      : 'border-brand-border bg-white hover:bg-brand-surface'
                  }`}
                >
                  <input
                    type="radio"
                    name="notify-template"
                    value={template.id}
                    checked={isSelected}
                    onChange={() => setSelectedTemplate(template.id)}
                    className="mt-0.5 accent-brand-red"
                  />
                  <div className="flex-1">
                    <div className="font-brand font-semibold text-[12px] text-brand-black">
                      {template.label}
                    </div>
                    <div className="text-[11px] text-brand-muted mt-0.5 line-clamp-2">
                      {template.preview}
                    </div>
                  </div>
                </label>
              )
            })}
          </div>
        </div>

        {/* Custom Text Area */}
        {selectedTemplate === 'custom' && (
          <div className="space-y-1">
            <label className="block font-brand font-semibold text-[10px] text-brand-muted uppercase tracking-[1.5px]">
              Custom message text
            </label>
            <textarea
              rows={3}
              value={customText}
              onChange={e => setCustomText(e.target.value)}
              placeholder="Type your message details here..."
              className="w-full p-3 border border-brand-border rounded-btn outline-none focus:border-brand-red font-body text-[13px]"
            />
          </div>
        )}

        {/* Live Preview block */}
        <div className="space-y-1">
          <label className="block font-brand font-semibold text-[10px] text-brand-muted uppercase tracking-[1.5px]">
            Message Preview
          </label>
          <div className="bg-brand-surface border border-brand-border rounded-[8px] p-4 text-[12px] text-brand-black leading-relaxed whitespace-pre-wrap font-mono">
            {livePreview || <span className="italic text-brand-muted">Preview content will show here...</span>}
          </div>
        </div>

        {/* Footer buttons */}
        <div className="flex justify-end gap-3 border-t border-brand-border pt-4 mt-6">
          <button
            onClick={handleSend}
            disabled={!livePreview.trim()}
            className="h-11 px-5 bg-brand-whatsapp hover:bg-[#1da851] text-white font-brand font-bold text-[12px] uppercase tracking-[1px] rounded-btn inline-flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
          >
            <MessageCircle size={15} /> Send via WhatsApp
          </button>
          <button
            type="button"
            onClick={onClose}
            className="h-11 px-4 text-brand-muted hover:text-brand-red font-brand font-semibold text-[12px] uppercase transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </AdminModal>
  )
}
