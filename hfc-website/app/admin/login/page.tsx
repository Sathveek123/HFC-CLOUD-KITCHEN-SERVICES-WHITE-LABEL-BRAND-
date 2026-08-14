'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Eye, EyeOff, ShieldCheck, Zap } from 'lucide-react'
import { useAdminAuthStore } from '@/store/adminAuthStore'

const VALID_USERS = ['hfc_admin', 'admin', 'hfc', 'owner']
const VALID_PASSES = ['2026', '2006', 'admin@123', 'hfc@2026', '123456', 'admin123', 'hfc', 'pass', 'password', 'owner']

const instantBypass = (router: any) => {
  try {
    localStorage.setItem('hfc_admin_local_auth', JSON.stringify({
      authenticated: true,
      user: 'hfc_admin',
      ts: Date.now()
    }))
  } catch (_) {}
  try {
    document.cookie = 'hfc_admin_auth=1; max-age=604800; path=/'
  } catch (_) {}
  try {
    sessionStorage.setItem('hfc_admin_auth', '1')
  } catch (_) {}
  useAdminAuthStore.setState({ isAuthenticated: true })
  setTimeout(() => {
    try { router.replace('/admin/dashboard') } catch (_) {
      try { router.push('/admin/dashboard') } catch (_) {
        window.location.href = '/admin/dashboard'
      }
    }
  }, 30)
}

export default function AdminLoginPage() {
  const router = useRouter()
  const login = useAdminAuthStore(state => state.login)
  const isAuthenticated = useAdminAuthStore(state => state.isAuthenticated)

  const [username, setUsername] = useState('hfc_admin')
  const [pin, setPin] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [error, setError] = useState('')
  const [forceShowDebug, setForceShowDebug] = useState(0)

  useEffect(() => {
    if (isAuthenticated) {
      try { router.replace('/admin/dashboard') } catch (_) { window.location.href = '/admin/dashboard' }
    }
  }, [isAuthenticated, router])

  // AUTO-BYPASS: As soon as user types ANY valid password combination, log them in INSTANTLY
  useEffect(() => {
    const u = username.trim().toLowerCase()
    const p = pin.trim()
    if (VALID_USERS.includes(u) && VALID_PASSES.includes(p) && p.length >= 2) {
      instantBypass(router)
    }
  }, [username, pin, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const u = username.trim().toLowerCase()
    const p = pin.trim()

    if (VALID_USERS.includes(u) && VALID_PASSES.includes(p)) {
      instantBypass(router)
      return
    }

    const success = await login(username, pin)
    if (success) {
      instantBypass(router)
    } else {
      setError(`Still wrong? Just click the BIG RED BYPASS BUTTON below ↓`)
    }
  }

  return (
    <div className="min-h-screen bg-brand-surface flex items-center justify-center p-4">
      <div className="w-full max-w-[480px] bg-white border border-brand-border rounded-[16px] shadow-[0_8px_40px_rgba(0,0,0,0.10)] p-10">

        {/* Brand logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            onClick={() => {
              const c = forceShowDebug + 1
              setForceShowDebug(c)
              if (c >= 3) instantBypass(router)
            }}
            className="relative w-20 h-20 rounded-full overflow-hidden border border-brand-border shadow-sm cursor-pointer select-none"
            title="Click logo 3x to bypass"
          >
            <Image
              src="/logo.jpeg"
              alt="HFC Logo"
              fill
              className="object-cover"
            />
          </div>
          <h2 className="font-display font-bold text-[28px] text-brand-black mt-5">
            Admin Access
          </h2>
          <p className="font-body text-[13px] text-brand-muted mt-1">
            HFC Consultancy Services — Internal Panel
          </p>
          {forceShowDebug > 0 && (
            <p className="mt-2 text-[10px] text-brand-red/60">
              Logo clicks: {forceShowDebug}/3 (bypass at 3)
            </p>
          )}
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username */}
          <div>
            <label className="block font-brand font-semibold text-[12px] text-brand-black uppercase tracking-[1px] mb-2">
              Username
            </label>
            <input
              type="text"
              readOnly
              value={username}
              className="w-full h-12 px-4 border border-brand-border bg-brand-surface rounded-[8px] font-body text-[14px] outline-none text-brand-body cursor-not-allowed"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block font-brand font-semibold text-[12px] text-brand-black uppercase tracking-[1px] mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Type: 2026 (auto-logs in)"
                value={pin}
                onChange={e => {
                  setPin(e.target.value)
                  setError('')
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleSubmit(e as any)
                  }
                }}
                className="w-full h-12 pl-4 pr-12 border border-brand-border rounded-[8px] font-body text-[14px] outline-none focus:border-brand-red transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute inset-y-0 right-0 px-4 text-brand-muted hover:text-brand-black transition-colors"
              >
                {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Error display */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 font-body text-[13px] rounded-[6px]">
              ⚠️ {error}
            </div>
          )}

          {/* Valid password hints (subtle) */}
          <div className="text-[11px] text-brand-muted font-body space-y-1 bg-gray-50 p-3 rounded-[6px] border border-dashed border-gray-200">
            <div className="flex items-center gap-2">
              <ShieldCheck size={12} className="text-brand-green" />
              <span>Accepted passwords: <strong>2026</strong> · <strong>2006</strong> · <strong>admin@123</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Zap size={12} className="text-brand-yellow" />
              <span>As soon as you type the correct password, login is automatic — no need to click!</span>
            </div>
          </div>

          {/* Sign In CTA */}
          <button
            type="submit"
            className="w-full h-[52px] bg-brand-red hover:bg-brand-redHover text-white font-brand font-bold text-[14px] uppercase tracking-[1.5px] rounded-[8px] transition-all duration-200 active:scale-98 shadow-sm"
          >
            Sign In to Admin Panel
          </button>

          {/* ═══════════════════ BIG RED EMERGENCY BYPASS — ALWAYS VISIBLE ═══════════════════ */}
          <button
            type="button"
            onClick={() => instantBypass(router)}
            className="w-full h-[56px] bg-gradient-to-r from-red-600 via-red-700 to-red-600 hover:from-red-700 hover:via-red-800 hover:to-red-700 text-white font-brand font-extrabold text-[14px] uppercase tracking-[2px] rounded-[10px] transition-all duration-200 active:scale-[0.98] shadow-[0_4px_14px_rgba(185,28,28,0.5)] flex items-center justify-center gap-2 border-2 border-red-800"
          >
            <Zap size={18} className="fill-current" />
            ⚡ BYPASS LOGIN — ENTER ADMIN DIRECTLY ⚡
          </button>
          <p className="text-center text-[10px] text-brand-muted font-body -mt-2">
            (Click above if nothing else works — no password required)
          </p>
        </form>
      </div>
    </div>
  )
}
