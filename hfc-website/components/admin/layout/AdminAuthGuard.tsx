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
    checkSession()
    setChecking(false)
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
