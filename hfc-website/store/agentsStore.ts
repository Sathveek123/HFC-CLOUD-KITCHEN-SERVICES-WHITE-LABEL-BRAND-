import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { syncAgentToSupabase, deleteAgentFromSupabase } from '@/lib/supabaseSync'

export interface Agent {
  id: string
  name: string
  whatsapp: string              // numeric with country code e.g. "919876543210"
  username: string              // unique, lowercase
  password: string              // Stored for local lookup only — actual auth managed via Supabase Auth
  isActive: boolean
  vehicleType: 'bike' | 'bicycle' | 'scooter' | 'on-foot' | null
  coverageArea: string | null
  createdAt: string
  totalDeliveries: number
}

interface AgentsStore {
  agents: Agent[]
  addAgent: (agent: Omit<Agent, 'id' | 'createdAt' | 'totalDeliveries'>) => void
  upsertAgents: (incoming: Agent[]) => void
  updateAgent: (id: string, updates: Partial<Agent>) => void
  deleteAgent: (id: string) => void
  toggleAgentActive: (id: string) => void
  incrementDeliveries: (id: string) => void
  isUsernameAvailable: (username: string, excludeId?: string) => boolean
  getActiveAgents: () => Agent[]
  getAgentByUsername: (username: string) => Agent | undefined
}

// Seed agents — passwords intentionally blank (credentials live in Supabase Auth only)
const seedAgents: Agent[] = [
  {
    id: 'ag-1', name: 'Rajesh Kumar', whatsapp: '919988776655',
    username: 'rajesh', password: '',
    isActive: true, vehicleType: 'bike', coverageArea: 'Maruthi Nagar, Labour Colony',
    createdAt: new Date().toISOString(), totalDeliveries: 0,
  },
  {
    id: 'ag-2', name: 'Suresh Raina', whatsapp: '919988776644',
    username: 'suresh', password: '',
    isActive: true, vehicleType: 'scooter', coverageArea: 'Sarojinidevi, Flat Area',
    createdAt: new Date().toISOString(), totalDeliveries: 0,
  },
]

export const useAgentsStore = create<AgentsStore>()(
  persist(
    (set, get) => ({
      agents: seedAgents,

      addAgent: (newAgent) => {
        const id = `ag-${Date.now()}`
        const agent: Agent = { ...newAgent, id, createdAt: new Date().toISOString(), totalDeliveries: 0 }
        set({ agents: [...get().agents, agent] })
        syncAgentToSupabase(agent)
      },

      upsertAgents: (incoming) => {
        const existing = get().agents
        const existingMap = new Map(existing.map(a => [a.id, a]))
        incoming.forEach(a => existingMap.set(a.id, a))
        set({ agents: Array.from(existingMap.values()) })
      },

      updateAgent: (id, updates) => {
        set({ agents: get().agents.map(a => a.id === id ? { ...a, ...updates } : a) })
        const updated = get().agents.find(a => a.id === id)
        if (updated) {
          syncAgentToSupabase(updated)
        }
      },

      deleteAgent: (id) => {
        set({ agents: get().agents.filter(a => a.id !== id) })
        deleteAgentFromSupabase(id)
      },

      toggleAgentActive: (id) => {
        set({ agents: get().agents.map(a => a.id === id ? { ...a, isActive: !a.isActive } : a) })
        const updated = get().agents.find(a => a.id === id)
        if (updated) {
          syncAgentToSupabase(updated)
        }
      },

      incrementDeliveries: (id) => {
        set({ agents: get().agents.map(a => a.id === id ? { ...a, totalDeliveries: a.totalDeliveries + 1 } : a) })
        const updated = get().agents.find(a => a.id === id)
        if (updated) {
          syncAgentToSupabase(updated)
        }
      },

      isUsernameAvailable: (username, excludeId) => {
        return !get().agents.some(a =>
          a.username.toLowerCase() === username.toLowerCase() && a.id !== excludeId
        )
      },

      getActiveAgents: () => get().agents.filter(a => a.isActive),

      getAgentByUsername: (username) =>
        get().agents.find(a => a.username.toLowerCase() === username.toLowerCase()),
    }),
    { name: 'hfc-agents' }
  )
)
