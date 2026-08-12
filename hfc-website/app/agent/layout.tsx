'use client'

import React, { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAgentAuthStore } from '@/store/agentAuthStore'
import { LogOut, Bell } from 'lucide-react'

export function AgentAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const isAuthenticated = useAgentAuthStore(state => state.isAuthenticated)
  const checkSession = useAgentAuthStore(state => state.checkSession)

  useEffect(() => {
    checkSession()
  }, [checkSession])

  useEffect(() => {
    if (pathname === '/agent/login') return
    if (!isAuthenticated) {
      router.replace('/agent/login')
    }
  }, [isAuthenticated, pathname, router])

  if (!isAuthenticated && pathname !== '/agent/login') {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center font-body text-[13px] text-brand-muted">
        Checking session...
      </div>
    )
  }

  return <>{children}</>
}

export function AgentTopbar() {
  const router = useRouter()
  const pathname = usePathname()
  const logout = useAgentAuthStore(state => state.logout)
  const getLoggedInAgent = useAgentAuthStore(state => state.getLoggedInAgent)
  const agent = getLoggedInAgent()

  const handleLogout = () => {
    logout()
    router.replace('/agent/login')
  }

  const initials = agent ? agent.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : 'AG'
  const firstName = agent ? agent.name.split(' ')[0] : 'Agent'

  const isOrdersActive = pathname === '/agent/orders'
  const isReportActive = pathname === '/agent/report'

  return (
    <header className="bg-white border-b border-brand-border px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-xs flex-wrap gap-3">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-red flex items-center justify-center text-white font-brand font-black text-[12px]">
            HFC
          </div>
          <span className="font-brand font-black text-[18px] text-brand-black tracking-tight">
            Delivery Portal
          </span>
        </div>

        {/* 2-Tab Switcher (My Orders / My Report) */}
        {agent && (
          <nav className="flex items-center gap-2">
            <Link
              href="/agent/orders"
              className={`px-4 py-2 rounded-[8px] font-brand text-[13px] transition-colors ${
                isOrdersActive
                  ? 'bg-brand-red text-white font-bold'
                  : 'bg-white border border-brand-border text-brand-body font-semibold hover:border-brand-red hover:text-brand-red'
              }`}
            >
              My Orders
            </Link>
            <Link
              href="/agent/report"
              className={`px-4 py-2 rounded-[8px] font-brand text-[13px] transition-colors ${
                isReportActive
                  ? 'bg-brand-red text-white font-bold'
                  : 'bg-white border border-brand-border text-brand-body font-semibold hover:border-brand-red hover:text-brand-red'
              }`}
            >
              My Report
            </Link>
          </nav>
        )}
      </div>

      {agent && (
        <div className="flex items-center gap-4 ml-auto">
          <button className="p-2 text-brand-muted hover:text-brand-black transition-colors relative cursor-pointer" title="Notifications">
            <Bell size={18} />
          </button>

          <div className="flex items-center gap-2 pl-2 border-l border-brand-border">
            <div className="w-7 h-7 rounded-full bg-brand-redLight flex items-center justify-center text-brand-red font-brand font-bold text-[11px]">
              {initials}
            </div>
            <span className="font-brand font-semibold text-[13px] text-brand-black hidden sm:inline">
              {firstName}
            </span>

            <button
              onClick={handleLogout}
              className="p-1.5 text-brand-muted hover:text-brand-red transition-colors ml-1 cursor-pointer"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      )}
    </header>
  )
}

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/agent/login'

  if (isLoginPage) {
    return <main className="min-h-screen bg-[#FAFAFA]">{children}</main>
  }

  return (
    <AgentAuthGuard>
      <div className="flex flex-col min-h-screen bg-[#FAFAFA]">
        <AgentTopbar />
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-[1200px] w-full mx-auto">{children}</main>
      </div>
    </AgentAuthGuard>
  )
}
