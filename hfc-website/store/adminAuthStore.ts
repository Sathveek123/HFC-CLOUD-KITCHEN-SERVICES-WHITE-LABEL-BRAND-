import { create } from 'zustand'
import { authenticateAdminSupabase, checkSupabaseAuthSession } from '@/lib/supabaseAuth'

interface AdminAuthStore {
  isAuthenticated: boolean
  login: (username: string, pin: string) => Promise<boolean> | boolean
  logout: () => void
  checkSession: () => void
}

export const useAdminAuthStore = create<AdminAuthStore>((set) => ({
  isAuthenticated: false,

  login: async (username: string, pin: string) => {
    const isValid = await authenticateAdminSupabase(username, pin)
    if (isValid) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('hfc-admin-auth', 'true')
      }
      set({ isAuthenticated: true })
      return true
    }
    return false
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('hfc-admin-auth')
    }
    set({ isAuthenticated: false })
  },

  checkSession: async () => {
    if (typeof window !== 'undefined') {
      const active = sessionStorage.getItem('hfc-admin-auth') === 'true'
      const session = await checkSupabaseAuthSession()
      set({ isAuthenticated: active || !!session })
    }
  },
}))
