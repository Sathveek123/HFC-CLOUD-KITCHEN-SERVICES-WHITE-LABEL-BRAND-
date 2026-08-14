import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { syncSettingToSupabase, fetchSettingFromSupabase } from '@/lib/supabaseSync'

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

  // Supabase sync actions
  fetchAndSyncPromotions: () => Promise<void>
  setPromotionsFromSupabase: (promoData: { rewardTiers?: RewardTier[]; coupons?: Coupon[]; offers?: Offer[] }) => void

  // Selectors
  getActiveOffers: () => Offer[]
  getValidCoupon: (code: string, orderTotal: number) => { valid: boolean; coupon?: Coupon; error?: string }
}

const genId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

// Helper to push all local state to Supabase JSONB setting
const syncLocalToSupabase = async (state: any) => {
  const payload = {
    rewardTiers: state.rewardTiers,
    coupons: state.coupons,
    offers: state.offers,
  }
  await syncSettingToSupabase('promotions', payload)
}

export const usePromotionsStore = create<PromotionsStore>()(
  persist(
    (set, get) => ({
      rewardTiers: [],
      coupons: [
        { id: 'cp-1', code: 'HFC50', discountType: 'percent', discountValue: 50, minOrderAmount: 300, maxDiscountCap: 150, usageLimit: 100, usedCount: 0, validFrom: '2026-08-01', validUntil: '2026-12-31', isActive: true, applicableCustomerPhone: null, createdAt: new Date().toISOString() },
        { id: 'cp-2', code: 'FREEBY', discountType: 'free-delivery', discountValue: null, minOrderAmount: 250, maxDiscountCap: null, usageLimit: 500, usedCount: 0, validFrom: '2026-08-01', validUntil: '2026-12-31', isActive: true, applicableCustomerPhone: null, createdAt: new Date().toISOString() }
      ],
      offers: [],

      addRewardTier: (tier) => {
        const newTier: RewardTier = { ...tier, id: genId(), createdAt: new Date().toISOString() }
        const updated = [...get().rewardTiers, newTier]
        set({ rewardTiers: updated })
        syncLocalToSupabase({ ...get(), rewardTiers: updated })
      },

      toggleRewardTierActive: (id) => {
        const updated = get().rewardTiers.map(t => t.id === id ? { ...t, isActive: !t.isActive } : t)
        set({ rewardTiers: updated })
        syncLocalToSupabase({ ...get(), rewardTiers: updated })
      },

      deleteRewardTier: (id) => {
        const updated = get().rewardTiers.filter(t => t.id !== id)
        set({ rewardTiers: updated })
        syncLocalToSupabase({ ...get(), rewardTiers: updated })
      },

      addCoupon: (coupon) => {
        const newCoupon: Coupon = { ...coupon, id: genId(), usedCount: 0, createdAt: new Date().toISOString() }
        const updated = [...get().coupons, newCoupon]
        set({ coupons: updated })
        syncLocalToSupabase({ ...get(), coupons: updated })
      },

      toggleCouponActive: (id) => {
        const updated = get().coupons.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c)
        set({ coupons: updated })
        syncLocalToSupabase({ ...get(), coupons: updated })
      },

      deleteCoupon: (id) => {
        const updated = get().coupons.filter(c => c.id !== id)
        set({ coupons: updated })
        syncLocalToSupabase({ ...get(), coupons: updated })
      },

      incrementCouponUsage: (code) => {
        const updated = get().coupons.map(c =>
          c.code.toUpperCase() === code.toUpperCase() ? { ...c, usedCount: c.usedCount + 1 } : c
        )
        set({ coupons: updated })
        syncLocalToSupabase({ ...get(), coupons: updated })
      },

      isCodeAvailable: (code) => {
        return !get().coupons.some(c => c.code.toUpperCase() === code.toUpperCase())
      },

      addOffer: (offer) => {
        const newOffer: Offer = { ...offer, id: genId(), createdAt: new Date().toISOString() }
        const updated = [...get().offers, newOffer]
        set({ offers: updated })
        syncLocalToSupabase({ ...get(), offers: updated })
      },

      toggleOfferActive: (id) => {
        const updated = get().offers.map(o => o.id === id ? { ...o, isActive: !o.isActive } : o)
        set({ offers: updated })
        syncLocalToSupabase({ ...get(), offers: updated })
      },

      deleteOffer: (id) => {
        const updated = get().offers.filter(o => o.id !== id)
        set({ offers: updated })
        syncLocalToSupabase({ ...get(), offers: updated })
      },

      // Fetch promotions configuration from Supabase
      fetchAndSyncPromotions: async () => {
        try {
          const promoData = await fetchSettingFromSupabase('promotions')
          if (promoData) {
            set({
              rewardTiers: promoData.rewardTiers || [],
              coupons: promoData.coupons || [],
              offers: promoData.offers || [],
            })
          } else {
            // First time load: seed existing default coupons to Supabase
            console.log('No promotions found in Supabase. Seeding defaults...')
            await syncLocalToSupabase(get())
          }
        } catch (err) {
          console.warn('Failed to fetch promotions from Supabase:', err)
        }
      },

      // Update state when realtime change is received
      setPromotionsFromSupabase: (promoData) => {
        set({
          rewardTiers: promoData.rewardTiers || [],
          coupons: promoData.coupons || [],
          offers: promoData.offers || [],
        })
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
