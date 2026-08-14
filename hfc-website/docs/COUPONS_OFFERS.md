# 🎟️ HFC Promotions System — Coupons, Offers & Reward Tiers

> **URL:** `/admin/coupons`  
> **File:** `app/admin/coupons/page.tsx`  
> **Store:** `store/promotionsStore.ts` (Unified Promotions & Coupons Store)  
> **Supabase Path:** `public.settings` row where `key = 'promotions'` (JSONB)

---

## Overview

The Promotions page has **3 sections** stacked vertically on the same page. Each has its own "Add" form at the top and a results table below. Any change here automatically saves to Supabase and propagates to all clients in **real-time** (< 1s).

```
┌─────────────────────────────────────────────────────────┐
│  SECTION 1: Auto-Reward Tiers                           │
│  [Add Tier Form]                                        │
│  [Reward Tiers Table]                                   │
├─────────────────────────────────────────────────────────┤
│  SECTION 2: Coupons                                     │
│  [Add Coupon Form]                                      │
│  [Coupons Table]                                        │
├─────────────────────────────────────────────────────────┤
│  SECTION 3: Offers                                      │
│  [Add Offer Form]                                       │
│  [Offers Table]                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🏆 Section 1 — Auto-Reward Tiers

**Component:** `components/admin/coupons/RewardTierForm.tsx` + `RewardTierTable.tsx`  
**Store Path:** `promotionsStore.ts` → `settings.rewardTiers[]`

### What Are Reward Tiers?
Automatic loyalty rewards that trigger **based on order value** — no code needed. When a customer's order total meets the minimum, the tier reward applies automatically.

**Example:**
> "Orders above ₹500 get a free Masala Chai"

### Add Tier Form Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Min Order Value (₹) | number | ✅ | Minimum subtotal to trigger reward |
| Reward Type | select | ✅ | `flat` / `percent` / `free-delivery` |
| Reward Value | number | - | Discount value (e.g. 50 for ₹50 flat, 10 for 10%) |
| Valid Days | number | ✅ | Validity duration in days |
| Active | toggle | - | Whether tier is live |

### `RewardTier` Type

```typescript
interface RewardTier {
  id: string
  minOrderAmount: number
  rewardType: 'flat' | 'percent' | 'free-delivery'
  rewardValue: number | null
  validDays: number
  isActive: boolean
  createdAt: string
}
```

---

## 🎫 Section 2 — Coupons

**Component:** `components/admin/coupons/CouponForm.tsx` + `CouponTable.tsx`  
**Store Path:** `promotionsStore.ts` → `settings.coupons[]`

### What Are Coupons?
**Manually created discount codes** that customers type in at checkout. Validated in real-time against rules: minimum value, expiry, and usage limits.

### Add Coupon Form Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Coupon Code | text | ✅ | e.g. `WELCOME20`, `HFC50` (auto-uppercase) |
| Discount Type | select | ✅ | `percent` / `flat` / `free-delivery` |
| Discount Value | number | - | e.g. 20 (for 20%) or 50 (for ₹50 flat) |
| Max Discount Cap | number | - | Max cap for percentage discounts (e.g. max ₹100 off) |
| Min Order Value (₹) | number | ✅ | Minimum subtotal required to apply |
| Usage Limit | number | - | Leave blank for unlimited |
| Applicable Phone | text | - | Lock coupon to a specific customer's phone number |
| Valid From | date | - | Start date of coupon validity |
| Valid Until | date | - | Expiry date |
| Active | toggle | - | Enable/disable coupon |

### `Coupon` Type

```typescript
interface Coupon {
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
```

### Coupon Validation Logic

**`promotionsStore.getValidCoupon(code, orderTotal)`**

Validation steps:
1. Find coupon by code (case-insensitive)
2. Check `isActive === true`
3. Check `usedCount < usageLimit` (or `usageLimit === null`)
4. Check `new Date() >= new Date(validFrom)` (if validFrom is set)
5. Check `new Date() <= new Date(validUntil)` (if validUntil is set)
6. Check `orderTotal >= minOrderAmount`

Returns: `{ valid: boolean, coupon?: Coupon, error?: string }`

---

## 🎁 Section 3 — Offers

**Component:** `components/admin/coupons/OfferForm.tsx` + `OfferTable.tsx`  
**Store Path:** `promotionsStore.ts` → `settings.offers[]`

### What Are Offers?
**Visual promotional banners** shown to customers on the website (e.g., "Buy 2 Get 1 Free", "Family Bundle Deal"). These are informational promotions highlightable on the customer home page.

### `Offer` Type

```typescript
interface Offer {
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
```

---

## 📡 Real-Time WebSockets Synchronization

Promotions are fully real-time enabled. Any update in the Admin Coupons page updates the database and broadcasts to all clients:

### 1. Admin Page Hook (`app/admin/coupons/page.tsx`)
```typescript
useEffect(() => {
  // Fetch initial promotions on mount
  usePromotionsStore.getState().fetchAndSyncPromotions()

  // Subscribe to real-time changes
  const unsub = subscribeToSettingRealtime('promotions', (val) => {
    if (val) usePromotionsStore.getState().setPromotionsFromSupabase(val)
  })

  return () => unsub()
}, [])
```

### 2. Customer Homepage Hook (`app/page.tsx`)
Updates available offers, active rewards, and valid coupons live on the home page and Cart Drawer.
```typescript
useEffect(() => {
  usePromotionsStore.getState().fetchAndSyncPromotions()

  const unsub = subscribeToSettingRealtime('promotions', (val) => {
    if (val) usePromotionsStore.getState().setPromotionsFromSupabase(val)
  })

  return () => unsub()
}, [])
```

---

## 🛒 Customer-Side Checkout Integration

### Coupon Validation in Cart Drawer (`CartDrawer.tsx`)
When a customer inputs a coupon code and clicks Apply:
1. `promotionsStore.getValidCoupon(code, subtotal)` is called.
2. If valid, the cart calculates the discount amount:
   - For `flat`: `discount = coupon.discountValue`
   - For `percent`: `discount = Math.min((coupon.discountValue / 100) * subtotal, coupon.maxDiscountCap || Infinity)`
   - For `free-delivery`: `discount = deliveryCharge` (sets delivery charge to 0)
3. Upon order placement, `promotionsStore.incrementCouponUsage(code)` is called to increment `usedCount` in Supabase.
