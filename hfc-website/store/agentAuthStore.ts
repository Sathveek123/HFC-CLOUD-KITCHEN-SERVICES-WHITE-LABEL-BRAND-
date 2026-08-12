import { create } from 'zustand'
import { useAgentsStore, Agent } from './agentsStore'
import { authenticateAgentSupabase, checkSupabaseAuthSession } from '@/lib/supabaseAuth'

interface AgentAuthStore {
  isAuthenticated: boolean
  loggedInAgentId: string | null
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  checkSession: () => void
  getLoggedInAgent: () => Agent | undefined
}

export const useAgentAuthStore = create<AgentAuthStore>((set, get) => ({
  isAuthenticated: false,
  loggedInAgentId: null,

  login: async (username: string, password: string) => {
    const agents = useAgentsStore.getState().agents
    const cleanUsername = username.trim().toLowerCase()
    const cleanPassword = password.trim()

    const agent = agents.find(
      a => (a.username || '').trim().toLowerCase() === cleanUsername
    )

    if (!agent || (agent.password || '').trim() !== cleanPassword) {
      return { success: false, error: 'Incorrect username or password.' }
    }

    if (!agent.isActive) {
      return {
        success: false,
        error: 'Your account is currently inactive. Contact HFC admin.'
      }
    }

    // Authenticate with Supabase Auth for RLS JWT token issuance
    await authenticateAgentSupabase(username, password)

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('hfc-agent-session', agent.id)
    }

    set({ isAuthenticated: true, loggedInAgentId: agent.id })
    return { success: true }
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('hfc-agent-session')
    }
    set({ isAuthenticated: false, loggedInAgentId: null })
  },

  checkSession: () => {
    if (typeof window !== 'undefined') {
      const agentId = sessionStorage.getItem('hfc-agent-session')
      if (agentId) {
        const agent = useAgentsStore.getState().agents.find(a => a.id === agentId)
        if (agent && agent.isActive) {
          set({ isAuthenticated: true, loggedInAgentId: agentId })
          return
        }
      }
      set({ isAuthenticated: false, loggedInAgentId: null })
    }
  },

  getLoggedInAgent: () => {
    const { loggedInAgentId } = get()
    if (!loggedInAgentId) return undefined
    return useAgentsStore.getState().agents.find(a => a.id === loggedInAgentId)
  }
}))
