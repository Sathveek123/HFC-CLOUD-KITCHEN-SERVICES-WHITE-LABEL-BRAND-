'use client'

import React from 'react'
import { Phone, MessageSquare } from 'lucide-react'

import { useSettingsStore } from '@/store/settingsStore'

export default function MenuUnavailableFallback() {
  const settings = useSettingsStore(state => state.settings)
  const phone = settings?.phone || '9912799855'
  const whatsappNumber = settings?.whatsappNumber || '919912799855'
  const formattedPhone = settings?.phone
    ? `+91 ${settings.phone.slice(0, 5)} ${settings.phone.slice(5)}`
    : '+91 99127 99855'

  return (
    <div className="max-w-[700px] mx-auto my-16 px-6 text-center">
      <div className="bg-brand-surface border border-brand-border rounded-[16px] p-8 md:p-12 shadow-sm">
        <h2 className="font-display font-bold text-[24px] text-brand-black mb-3">
          Menu Temporarily Offline
        </h2>
        <p className="font-body text-[14.5px] text-[#6A6A6A] leading-relaxed mb-8 max-w-[500px] mx-auto">
          We are experiencing a temporary network glitch loading our live menu. Don't worry, you can still order your favorites directly via call or WhatsApp!
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {/* Call button */}
          <a
            href={`tel:+91${phone}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-brand-red hover:bg-brand-redHover text-white font-brand font-bold text-[13px] uppercase tracking-[1px] h-12 px-6 rounded-[8px] transition-colors"
          >
            <Phone size={16} />
            Call: {formattedPhone}
          </a>

          {/* WhatsApp button */}
          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#166534] hover:bg-[#15803d] text-white font-brand font-bold text-[13px] uppercase tracking-[1px] h-12 px-6 rounded-[8px] transition-colors"
          >
            <MessageSquare size={16} />
            WhatsApp Order
          </a>
        </div>
      </div>
    </div>
  )
}
