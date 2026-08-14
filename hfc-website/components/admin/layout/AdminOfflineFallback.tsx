'use client'

import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function AdminOfflineFallback() {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white border border-brand-border rounded-[12px] shadow-sm max-w-[500px] mx-auto my-12 text-center">
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-brand-red mb-5 animate-pulse">
        <AlertTriangle size={32} />
      </div>
      <h2 className="font-display font-bold text-[20px] text-brand-black mb-2">
        Connection issue or system error
      </h2>
      <p className="font-body text-[13.5px] text-[#6A6A6A] leading-relaxed mb-6">
        We encountered a temporary connection issue with the database. The system is trying to restore the session. Please reload the page if this persists.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="inline-flex items-center gap-2 bg-brand-red hover:bg-brand-redHover text-white font-brand font-bold text-[12px] uppercase tracking-[1px] h-10 px-5 rounded-[6px] transition-colors cursor-pointer"
      >
        <RefreshCw size={14} className="animate-spin-slow" />
        Retry Connection
      </button>
    </div>
  )
}
