'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useAgentAuthStore } from '@/store/agentAuthStore'

export default function AgentLoginPage() {
  const router = useRouter()
  const login = useAgentAuthStore(state => state.login)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password) {
      setErrorMsg('Please enter username and password.')
      return
    }

    const res = await login(username, password)
    if (res.success) {
      router.push('/agent/orders')
    } else {
      setErrorMsg(res.error || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4">
      <div className="w-full max-w-[420px] bg-white border border-brand-border rounded-[16px] shadow-[0_8px_40px_rgba(0,0,0,0.10)] p-8">
        
        {/* HFC Badge */}
        <div className="flex justify-center mb-4">
          <div className="w-[60px] h-[60px] rounded-full bg-brand-red flex items-center justify-center text-white font-brand font-black text-[22px] shadow-sm">
            HFC
          </div>
        </div>

        {/* Title */}
        <h1 className="font-display font-bold text-[24px] text-brand-black text-center">
          Agent Login
        </h1>
        <p className="font-body text-[12px] text-[#6A6A6A] text-center mt-1">
          HFC Consultancy Services — Delivery Portal
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-[8px] text-red-600 font-body text-[12px]">
              <AlertCircle size={15} className="flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block font-brand font-semibold text-[11px] text-[#6A6A6A] uppercase tracking-[0.5px] mb-1.5">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={e => {
                setUsername(e.target.value)
                setErrorMsg('')
              }}
              placeholder="e.g. rajesh"
              className="w-full h-[46px] border border-brand-border rounded-[8px] px-4 font-body text-[14px] text-brand-black focus:border-brand-red focus:outline-none focus:ring-2 focus:ring-brand-red/10 transition-all bg-white"
            />
          </div>

          <div>
            <label className="block font-brand font-semibold text-[11px] text-[#6A6A6A] uppercase tracking-[0.5px] mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => {
                  setPassword(e.target.value)
                  setErrorMsg('')
                }}
                placeholder="••••••••"
                className="w-full h-[46px] border border-brand-border rounded-[8px] px-4 pr-11 font-body text-[14px] text-brand-black focus:border-brand-red focus:outline-none focus:ring-2 focus:ring-brand-red/10 transition-all bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-black transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full h-[48px] bg-brand-red hover:bg-brand-redHover text-white font-brand font-bold text-[14px] uppercase tracking-[1px] rounded-[8px] transition-colors mt-2 shadow-sm cursor-pointer"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  )
}
