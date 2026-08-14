'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAdminAuthStore } from '@/store/adminAuthStore'

export default function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const isAuthenticated = useAdminAuthStore(state => state.isAuthenticated)
  const checkSession = useAdminAuthStore(state => state.checkSession)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    let cancelled = false

    const instantLocalCheck = (): boolean => {
      try {
        const stored = localStorage.getItem('hfc_admin_local_auth')
        if (stored) {
          const parsed = JSON.parse(stored)
          if (parsed && parsed.authenticated === true) return true
        }
      } catch (_) {}
      try {
        const match = document.cookie.match(/(^| )hfc_admin_auth=([^;]+)/)
        if (match && decodeURIComponent(match[2]) === '1') return true
      } catch (_) {}
      try {
        if (sessionStorage.getItem('hfc_admin_auth') === '1') return true
      } catch (_) {}
      return false
    }

    const init = async () => {
      const localOk = instantLocalCheck()
      if (localOk) {
        ;(useAdminAuthStore as any).setState({ isAuthenticated: true })
      }

      await checkSession()
      if (!cancelled) setChecking(false)
    }
    init()

    return () => { cancelled = true }
  }, [checkSession])

  useEffect(() => {
    if (!checking) {
      if (!isAuthenticated && pathname !== '/admin/login') {
        router.replace('/admin/login')
      }
    }
  }, [isAuthenticated, checking, pathname, router])

  if (checking || (!isAuthenticated && pathname !== '/admin/login')) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-red border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return <>{children}</>
}
