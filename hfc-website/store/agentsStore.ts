import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Agent {
  id: string
  name: string
  whatsapp: string              // numeric with country code e.g. "919876543210"
  username: string              // unique, lowercase
  password: string              // MVP plain storage (internal tool only)
  isActive: boolean
  vehicleType: 'bike' | 'bicycle' | 'scooter' | 'on-foot' | null
  coverageArea: string | null
  createdAt: string
  totalDeliveries: number
}

interface AgentsStore {
  agents: Agent[]
  addAgent: (agent: Omit<Agent, 'id' | 'createdAt' | 'totalDeliveries'>) => void
  updateAgent: (id: string, updates: Partial<Agent>) => void
  deleteAgent: (id: string) => void
  toggleAgentActive: (id: string) => void
  incrementDeliveries: (id: string) => void
  isUsernameAvailable: (username: string, excludeId?: string) => boolean
  getActiveAgents: () => Agent[]
  getAgentByUsername: (username: string) => Agent | undefined
}

// Seed agents keep backward compat with earlier data  
const seedAgents: Agent[] = [
  {
    id: 'ag-1', name: 'Rajesh Kumar', whatsapp: '919988776655',
    username: 'rajesh', password: 'raj123',
    isActive: true, vehicleType: 'bike', coverageArea: 'Maruthi Nagar, Labour Colony',
    createdAt: new Date().toISOString(), totalDeliveries: 0,
  },
  {
    id: 'ag-2', name: 'Suresh Raina', whatsapp: '919988776644',
    username: 'suresh', password: 'sur123',
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
      },

      updateAgent: (id, updates) => {
        set({ agents: get().agents.map(a => a.id === id ? { ...a, ...updates } : a) })
      },

      deleteAgent: (id) => {
        set({ agents: get().agents.filter(a => a.id !== id) })
      },

      toggleAgentActive: (id) => {
        set({ agents: get().agents.map(a => a.id === id ? { ...a, isActive: !a.isActive } : a) })
      },

      incrementDeliveries: (id) => {
        set({ agents: get().agents.map(a => a.id === id ? { ...a, totalDeliveries: a.totalDeliveries + 1 } : a) })
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
