'use client'

import React, { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import AdminSidebar from '@/components/admin/layout/AdminSidebar'
import AdminTopbar from '@/components/admin/layout/AdminTopbar'
import AdminAuthGuard from '@/components/admin/layout/AdminAuthGuard'
import { useOrderStore } from '@/store/orderStore'
import { useSettingsStore } from '@/store/settingsStore'
import toast from 'react-hot-toast'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const orders = useOrderStore(state => state.orders)
  const markAsSeen = useOrderStore(state => state.markAsSeen)
  const settings = useSettingsStore(state => state.settings)

  // 1. Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey) {
        switch (e.key.toLowerCase()) {
          case 'd':
            e.preventDefault()
            router.push('/admin/dashboard')
            break
          case 'o':
            e.preventDefault()
            router.push('/admin/orders')
            break
          case 'p':
            e.preventDefault()
            router.push('/admin/products')
            break
          case 's':
            e.preventDefault()
            router.push('/admin/settings')
            break
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [router])

  // 2. Play Notification Sound via Web Audio API
  const playChime = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioContextClass) return
      const ctx = new AudioContextClass()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = 880
      gain.gain.setValueAtTime(0.3, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.6)
    } catch (e) {
      console.warn('Web Audio Context blocked or not supported by browser:', e)
    }
  }

  // 3. New Orders Polling Checker (every 15s)
  useEffect(() => {
    if (pathname === '/admin/login') return

    const checkNewOrders = () => {
      const fiveMinsAgo = Date.now() - 5 * 60 * 1000
      const unseenNewOrders = orders.filter(
        o => o.status === 'placed' && !o.seenByAdmin && new Date(o.createdAt).getTime() > fiveMinsAgo
      )

      if (unseenNewOrders.length > 0) {
        // Always trigger notification toast
        playChime()

        unseenNewOrders.forEach(order => {
          toast.success(
            (t) => (
              <div className="flex flex-col gap-1 font-body text-[13px]">
                <strong className="font-brand font-bold text-brand-black">
                  🔔 New Order Received!
                </strong>
                <span>
                  Customer: {order.customerName} (₹{order.total.toLocaleString('en-IN')})
                </span>
                <button
                  onClick={() => {
                    toast.dismiss(t.id)
                    router.push(`/admin/orders/${order.id}`)
                  }}
                  className="text-brand-red font-semibold text-left underline mt-1"
                >
                  View Order →
                </button>
              </div>
            ),
            { duration: 8000 }
          )
          markAsSeen(order.id)
        })
      }
    }

    // Initial check and set interval
    checkNewOrders()
    const poll = setInterval(checkNewOrders, 15000)

    return () => clearInterval(poll)
  }, [orders, markAsSeen, pathname, router])

  const isLoginPage = pathname === '/admin/login'

  return (
    <AdminAuthGuard>
      {isLoginPage ? (
        <div className="min-h-screen bg-brand-surface">{children}</div>
      ) : (
        <div className="flex flex-row h-screen overflow-hidden bg-brand-surface">
          {/* Sidebar Navigation */}
          <AdminSidebar />

          {/* Right Core Content Area */}
          <div className="flex flex-col flex-1 overflow-hidden">
            <AdminTopbar />
            <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#FAFAFA]">{children}</main>
          </div>
        </div>
      )}
    </AdminAuthGuard>
  )
}
