import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface RewardTier {
  id: string
  minOrderAmount: number
  rewardType: 'flat' | 'percent' | 'free-delivery'
  rewardValue: number | null
  validDays: number
  isActive: boolean
  createdAt: string
}

export interface Coupon {
  id: string
  code: string
  discountType: 'percent' | 'flat' | 'free-delivery'
  discountValue: number | null
  maxDiscountCap: number | null
  minOrderAmount: number
  usageLimit: number | null
  usedCount: number
  validFrom: string | null
  validUntil: string | null
  isActive: boolean
  applicableCustomerPhone: string | null
  createdAt: string
}

export interface Offer {
  id: string
  offerType: 'free-item' | 'bundle-discount' | 'happy-hour' | 'first-order'
  title: string
  freeItemId: string | null
  minOrderAmount: number
  validFrom: string | null
  validUntil: string | null
  isActive: boolean
  createdAt: string
}

interface PromotionsStore {
  rewardTiers: RewardTier[]
  coupons: Coupon[]
  offers: Offer[]

  // Reward Tier actions
  addRewardTier: (tier: Omit<RewardTier, 'id' | 'createdAt'>) => void
  toggleRewardTierActive: (id: string) => void
  deleteRewardTier: (id: string) => void

  // Coupon actions
  addCoupon: (coupon: Omit<Coupon, 'id' | 'usedCount' | 'createdAt'>) => void
  toggleCouponActive: (id: string) => void
  deleteCoupon: (id: string) => void
  incrementCouponUsage: (code: string) => void
  isCodeAvailable: (code: string) => boolean

  // Offer actions
  addOffer: (offer: Omit<Offer, 'id' | 'createdAt'>) => void
  toggleOfferActive: (id: string) => void
  deleteOffer: (id: string) => void

  // Selectors
  getActiveOffers: () => Offer[]
  getValidCoupon: (code: string, orderTotal: number) => { valid: boolean; coupon?: Coupon; error?: string }
}

const genId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

export const usePromotionsStore = create<PromotionsStore>()(
  persist(
    (set, get) => ({
      rewardTiers: [],
      coupons: [],
      offers: [],

      addRewardTier: (tier) => {
        const newTier: RewardTier = { ...tier, id: genId(), createdAt: new Date().toISOString() }
        set({ rewardTiers: [...get().rewardTiers, newTier] })
      },

      toggleRewardTierActive: (id) => {
        set({
          rewardTiers: get().rewardTiers.map(t => t.id === id ? { ...t, isActive: !t.isActive } : t),
        })
      },

      deleteRewardTier: (id) => {
        set({ rewardTiers: get().rewardTiers.filter(t => t.id !== id) })
      },

      addCoupon: (coupon) => {
        const newCoupon: Coupon = { ...coupon, id: genId(), usedCount: 0, createdAt: new Date().toISOString() }
        set({ coupons: [...get().coupons, newCoupon] })
      },

      toggleCouponActive: (id) => {
        set({
          coupons: get().coupons.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c),
        })
      },

      deleteCoupon: (id) => {
        set({ coupons: get().coupons.filter(c => c.id !== id) })
      },

      incrementCouponUsage: (code) => {
        set({
          coupons: get().coupons.map(c =>
            c.code.toUpperCase() === code.toUpperCase() ? { ...c, usedCount: c.usedCount + 1 } : c
          ),
        })
      },

      isCodeAvailable: (code) => {
        return !get().coupons.some(c => c.code.toUpperCase() === code.toUpperCase())
      },

      addOffer: (offer) => {
        const newOffer: Offer = { ...offer, id: genId(), createdAt: new Date().toISOString() }
        set({ offers: [...get().offers, newOffer] })
      },

      toggleOfferActive: (id) => {
        set({
          offers: get().offers.map(o => o.id === id ? { ...o, isActive: !o.isActive } : o),
        })
      },

      deleteOffer: (id) => {
        set({ offers: get().offers.filter(o => o.id !== id) })
      },

      getActiveOffers: () => {
        const now = new Date()
        return get().offers.filter(o => {
          if (!o.isActive) return false
          if (o.validFrom && new Date(o.validFrom) > now) return false
          if (o.validUntil && new Date(o.validUntil) < now) return false
          return true
        })
      },

      getValidCoupon: (code, orderTotal) => {
        const coupon = get().coupons.find(c => c.code.toUpperCase() === code.toUpperCase())
        if (!coupon) return { valid: false, error: 'Invalid coupon code' }
        if (!coupon.isActive) return { valid: false, error: 'Coupon is inactive' }

        const now = new Date()
        if (coupon.validFrom && new Date(coupon.validFrom) > now)
          return { valid: false, error: 'Coupon is not valid yet' }
        if (coupon.validUntil && new Date(coupon.validUntil) < now)
          return { valid: false, error: 'Coupon has expired' }
        if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit)
          return { valid: false, error: 'Coupon usage limit reached' }
        if (coupon.minOrderAmount > 0 && orderTotal < coupon.minOrderAmount)
          return { valid: false, error: `Minimum order of ₹${coupon.minOrderAmount} required` }

        return { valid: true, coupon }
      },
    }),
    { name: 'hfc-promotions' }
  )
)
