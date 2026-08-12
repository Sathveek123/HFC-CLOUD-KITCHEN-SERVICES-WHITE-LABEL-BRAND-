import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface DeliveryArea {
  id: string
  name: string
  isActive: boolean
}

export interface SubscriptionPlan {
  id: string
  name: string
  pricePerMonth: number
  isActive: boolean
}

export interface Settings {
  // License
  licenseKey: string
  isLicensed: boolean
  licensedDomain: string
  licenseValidUntil: string

  // Branding
  siteName: string
  logoBase64: string | null
  phone: string
  whatsappNumber: string
  kitchenAddress: string

  // GST
  gstMode: 'none' | 'inclusive' | 'exclusive'
  gstPercent: number

  // Delivery & Payment
  deliveryFee: number
  freeDeliveryAbove: number
  currencySymbol: string
  upiId: string
  acceptCash: boolean
  acceptOnline: boolean

  // WhatsApp Auto-send
  cloudApiToken: string
  cloudApiPhoneId: string

  // Delivery Areas
  deliveryAreas: DeliveryArea[]

  // Subscription Plans
  subscriptionPlans: SubscriptionPlan[]
}

const defaultSettings: Settings = {
  licenseKey: 'HFC-PRO-2026-ENTERPRISE-88X',
  isLicensed: true,
  licensedDomain: 'hfc-consultancy.com',
  licenseValidUntil: '31 Dec 2026',

  siteName: 'HFC Consultancy Services',
  logoBase64: null,
  phone: '9912799855',
  whatsappNumber: '919912799855',
  kitchenAddress: 'Labour Colony, Maruthi Nagar, near HFC Outlet, Rajam',

  gstMode: 'exclusive',
  gstPercent: 5,

  deliveryFee: 50,
  freeDeliveryAbove: 500,
  currencySymbol: '₹',
  upiId: '9912799855@okbizaxis',
  acceptCash: true,
  acceptOnline: true,

  cloudApiToken: '',
  cloudApiPhoneId: '',

  deliveryAreas: [
    { id: 'area-1', name: 'Maruthi Nagar', isActive: true },
    { id: 'area-2', name: 'Labour Colony', isActive: true },
    { id: 'area-3', name: 'Sarojinidevi Flat Area', isActive: true }
  ],

  subscriptionPlans: [
    { id: 'plan-1', name: 'Basic Tier', pricePerMonth: 3000, isActive: true },
    { id: 'plan-2', name: 'Premium Cloud Plan', pricePerMonth: 5000, isActive: true }
  ]
}

interface SettingsStore {
  settings: Settings
  updateSettings: (newSettings: Partial<Settings>) => void
  addDeliveryArea: (name: string) => void
  toggleDeliveryArea: (id: string) => void
  deleteDeliveryArea: (id: string) => void
  addSubscriptionPlan: (name: string, price: number) => void
  toggleSubscriptionPlan: (id: string) => void
  deleteSubscriptionPlan: (id: string) => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,

      updateSettings: (newSettings) => {
        set({ settings: { ...get().settings, ...newSettings } })
      },

      addDeliveryArea: (name) => {
        const newArea: DeliveryArea = {
          id: `area-${Date.now()}`,
          name: name.trim(),
          isActive: true
        }
        set({
          settings: {
            ...get().settings,
            deliveryAreas: [...get().settings.deliveryAreas, newArea]
          }
        })
      },

      toggleDeliveryArea: (id) => {
        set({
          settings: {
            ...get().settings,
            deliveryAreas: get().settings.deliveryAreas.map(a =>
              a.id === id ? { ...a, isActive: !a.isActive } : a
            )
          }
        })
      },

      deleteDeliveryArea: (id) => {
        set({
          settings: {
            ...get().settings,
            deliveryAreas: get().settings.deliveryAreas.filter(a => a.id !== id)
          }
        })
      },

      addSubscriptionPlan: (name, price) => {
        const newPlan: SubscriptionPlan = {
          id: `plan-${Date.now()}`,
          name: name.trim(),
          pricePerMonth: price,
          isActive: true
        }
        set({
          settings: {
            ...get().settings,
            subscriptionPlans: [...get().settings.subscriptionPlans, newPlan]
          }
        })
      },

      toggleSubscriptionPlan: (id) => {
        set({
          settings: {
            ...get().settings,
            subscriptionPlans: get().settings.subscriptionPlans.map(p =>
              p.id === id ? { ...p, isActive: !p.isActive } : p
            )
          }
        })
      },

      deleteSubscriptionPlan: (id) => {
        set({
          settings: {
            ...get().settings,
            subscriptionPlans: get().settings.subscriptionPlans.filter(p => p.id !== id)
          }
        })
      }
    }),
    {
      name: 'hfc-settings'
    }
  )
)
