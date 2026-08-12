'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Eye, EyeOff } from 'lucide-react'
import { useAdminAuthStore } from '@/store/adminAuthStore'

export default function AdminLoginPage() {
  const router = useRouter()
  const login = useAdminAuthStore(state => state.login)
  const isAuthenticated = useAdminAuthStore(state => state.isAuthenticated)

  const [username, setUsername] = useState('hfc_admin')
  const [pin, setPin] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/admin/dashboard')
    }
  }, [isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const success = await login(username, pin)
    if (success) {
      router.push('/admin/dashboard')
    } else {
      setError('Incorrect username or PIN. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-brand-surface flex items-center justify-center p-4">
      <div className="w-full max-w-[480px] bg-white border border-brand-border rounded-[16px] shadow-[0_8px_40px_rgba(0,0,0,0.10)] p-10">
        
        {/* Brand logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-20 h-20 rounded-full overflow-hidden border border-brand-border shadow-sm">
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

          {/* Access PIN */}
          <div>
            <label className="block font-brand font-semibold text-[12px] text-brand-black uppercase tracking-[1px] mb-2">
              Access PIN
            </label>
            <div className="relative">
              <input
                type={showPin ? 'text' : 'password'}
                maxLength={6}
                placeholder="Enter PIN"
                value={pin}
                onChange={e => {
                  setPin(e.target.value.replace(/\D/g, ''))
                  setError('')
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

          {/* Sign In CTA */}
          <button
            type="submit"
            className="w-full h-[52px] bg-brand-red hover:bg-brand-redHover text-white font-brand font-bold text-[14px] uppercase tracking-[1.5px] rounded-[8px] transition-all duration-200 active:scale-98 shadow-sm"
          >
            Sign In to Admin Panel
          </button>
        </form>
      </div>
    </div>
  )
}
