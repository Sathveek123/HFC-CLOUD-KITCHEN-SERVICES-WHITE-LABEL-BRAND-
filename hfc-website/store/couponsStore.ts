import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface PromoCoupon {
  id: string
  code: string
  discountType: 'percentage' | 'fixed' | 'free-delivery'
  discountValue: number
  minOrder?: number
  maxDiscount?: number
  usageLimit?: number
  usedCount: number
  validFrom: string
  validUntil: string
  isActive: boolean
  applicableOn?: string[]
  description?: string
}

interface CouponsStore {
  coupons: PromoCoupon[]
  addCoupon: (coupon: Omit<PromoCoupon, 'id' | 'usedCount'>) => void
  updateCoupon: (id: string, updated: Partial<PromoCoupon>) => void
  deleteCoupon: (id: string) => void
  toggleCouponStatus: (id: string) => void
  incrementUsedCount: (code: string) => void
  validateCoupon: (code: string, cartTotal: number, orderType: string) => { isValid: boolean; discountAmount: number; error?: string }
}

export const useCouponsStore = create<CouponsStore>()(
  persist(
    (set, get) => ({
      coupons: [
        { id: 'cp-1', code: 'HFC50', discountType: 'percentage', discountValue: 50, minOrder: 300, maxDiscount: 150, usageLimit: 100, usedCount: 0, validFrom: '2026-08-01', validUntil: '2026-12-31', isActive: true, applicableOn: ['delivery', 'takeaway', 'dine-in'], description: 'Get 50% off up to ₹150 on orders above ₹300' },
        { id: 'cp-2', code: 'FREEBY', discountType: 'free-delivery', discountValue: 0, minOrder: 250, usageLimit: 500, usedCount: 0, validFrom: '2026-08-01', validUntil: '2026-12-31', isActive: true, applicableOn: ['delivery'], description: 'Free delivery on orders above ₹250' }
      ],

      addCoupon: (newCoupon) => {
        const id = `cp-${Date.now()}`
        set({ coupons: [...get().coupons, { ...newCoupon, id, usedCount: 0 }] })
      },

      updateCoupon: (id, updated) => {
        set({
          coupons: get().coupons.map(c => (c.id === id ? { ...c, ...updated } : c)),
        })
      },

      deleteCoupon: (id) => {
        set({ coupons: get().coupons.filter(c => c.id !== id) })
      },

      toggleCouponStatus: (id) => {
        set({
          coupons: get().coupons.map(c => (c.id === id ? { ...c, isActive: !c.isActive } : c)),
        })
      },

      incrementUsedCount: (code: string) => {
        set({
          coupons: get().coupons.map(c =>
            c.code.toUpperCase() === code.toUpperCase()
              ? { ...c, usedCount: c.usedCount + 1 }
              : c
          ),
        })
      },

      validateCoupon: (code: string, cartTotal: number, orderType: string) => {
        const coupon = get().coupons.find(c => c.code.toUpperCase() === code.toUpperCase())
        if (!coupon) return { isValid: false, discountAmount: 0, error: 'Invalid coupon code' }
        if (!coupon.isActive) return { isValid: false, discountAmount: 0, error: 'Coupon is inactive' }

        const now = new Date()
        const start = new Date(coupon.validFrom)
        const end = new Date(coupon.validUntil)
        if (now < start || now > end) return { isValid: false, discountAmount: 0, error: 'Coupon has expired' }

        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
          return { isValid: false, discountAmount: 0, error: 'Coupon limit reached' }
        }

        if (coupon.applicableOn && coupon.applicableOn.length > 0 && !coupon.applicableOn.includes(orderType)) {
          return { isValid: false, discountAmount: 0, error: `Not valid for ${orderType} orders` }
        }

        if (coupon.minOrder && cartTotal < coupon.minOrder) {
          return { isValid: false, discountAmount: 0, error: `Minimum order of ₹${coupon.minOrder} required` }
        }

        let discountAmount = 0
        if (coupon.discountType === 'percentage') {
          discountAmount = Math.round(cartTotal * (coupon.discountValue / 100))
          if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
            discountAmount = coupon.maxDiscount
          }
        } else if (coupon.discountType === 'fixed') {
          discountAmount = coupon.discountValue
        } else if (coupon.discountType === 'free-delivery') {
          discountAmount = 0 // handled separately as free delivery
        }

        return { isValid: true, discountAmount }
      }
    }),
    {
      name: 'hfc-coupons',
    }
  )
)
