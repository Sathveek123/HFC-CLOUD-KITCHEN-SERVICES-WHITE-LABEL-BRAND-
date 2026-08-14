'use client'

import React from 'react'
import { AlertCircle, Phone, RefreshCw } from 'lucide-react'

import { useSettingsStore } from '@/store/settingsStore'

interface Props {
  orderId?: string
}

export default function TrackerErrorBoundaryFallback({ orderId }: Props) {
  const settings = useSettingsStore(state => state.settings)
  const phone = settings?.phone || '9912799855'
  const formattedPhone = settings?.phone
    ? `+91 ${settings.phone.slice(0, 5)} ${settings.phone.slice(5)}`
    : '+91 99127 99855'

  return (
    <div className="min-h-screen bg-brand-surface flex items-center justify-center p-4">
      <div className="w-full max-w-[500px] bg-white border border-brand-border rounded-[16px] p-8 text-center shadow-sm">
        <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 mx-auto mb-5 animate-bounce">
          <AlertCircle size={32} />
        </div>
        <h2 className="font-display font-bold text-[22px] text-brand-black mb-2">
          Tracker Connection Interrupted
        </h2>
        {orderId && (
          <p className="font-mono text-[13px] bg-brand-surface border border-brand-border rounded-[6px] px-3 py-1.5 inline-block text-brand-black mb-4">
            Order: {orderId}
          </p>
        )}
        <p className="font-body text-[14px] text-[#6A6A6A] leading-relaxed mb-8">
          We encountered an issue pulling live updates for this order. It is likely a temporary database connection hiccup.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 bg-brand-red hover:bg-brand-redHover text-white font-brand font-bold text-[12px] uppercase tracking-[1px] h-12 rounded-[8px] transition-colors cursor-pointer"
          >
            <RefreshCw size={14} />
            Retry Tracker
          </button>
          
          <a
            href={`tel:+91${phone}`}
            className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 border border-brand-border hover:bg-[#F9F9F9] text-brand-black font-brand font-bold text-[12px] uppercase tracking-[1px] h-12 rounded-[8px] transition-colors"
          >
            <Phone size={14} />
            Call: {formattedPhone}
          </a>
        </div>
      </div>
    </div>
  )
}
