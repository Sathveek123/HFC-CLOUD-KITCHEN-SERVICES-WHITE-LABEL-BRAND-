# 🎟️ HFC Promotions System — Coupons, Offers & Reward Tiers

**URL:** `/admin/coupons`  
**File:** `app/admin/coupons/page.tsx`  
**Stores:** `store/couponsStore.ts`, `store/promotionsStore.ts`

---

## Overview

The Promotions page has **3 independent but related sections** stacked vertically on the same page. Each has its own "Add" form at the top and a results table below — consistent form-above/table-below pattern.

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
**Store:** `promotionsStore.ts` → `rewardTiers[]`

### What Are Reward Tiers?

Automatic loyalty rewards that trigger **based on order value** — no code needed. When a customer's order total meets the minimum, the tier reward applies automatically.

**Example:**
> "Orders above ₹500 get a free Masala Chai"

### Add Tier Form Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Tier Name | text | ✅ | e.g. "Silver Reward", "Gold Tier" |
| Min Order Value (₹) | number | ✅ | Minimum subtotal to trigger reward |
| Reward Description | text | ✅ | What the customer gets, e.g. "Free Masala Chai" |
| Reward Type | select | ✅ | `discount` / `free-item` / `other` |
| Reward Value | number | ✅ | Discount ₹ amount (for discount type) |
| Active | toggle | - | Whether tier is live |

### Reward Tiers Table Columns

| Column | Notes |
|--------|-------|
| Tier Name | |
| Min Order | ₹ value |
| Reward | Description |
| Type | Badge (discount/free-item/other) |
| Status | Active / Inactive toggle |
| Actions | Edit inline, Delete with confirm |

### `RewardTier` Type (promotionsStore)

```typescript
interface RewardTier {
  id: string
  name: string
  minOrderValue: number
  rewardDescription: string
  rewardType: 'discount' | 'free-item' | 'other'
  rewardValue: number        // ₹ discount value (0 for free-item/other)
  isActive: boolean
  createdAt: string
}
```

---

## 🎫 Section 2 — Coupons

**Component:** `components/admin/coupons/CouponForm.tsx` + `CouponTable.tsx`  
**Store:** `couponsStore.ts` → `coupons[]`

### What Are Coupons?

**Manually created discount codes** that customers type in at checkout. Validated against rules: order type, minimum value, expiry, and usage limits.

### Add Coupon Form Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Coupon Code | text | ✅ | e.g. `WELCOME20`, `FLAT50` (auto-uppercase) |
| Discount Type | select | ✅ | `percentage` or `flat` |
| Discount Value | number | ✅ | e.g. 20 (for 20%) or 50 (for ₹50 flat) |
| Min Order Value (₹) | number | ✅ | Minimum subtotal required |
| Max Uses | number | - | Leave blank for unlimited |
| Applicable Order Types | checkboxes | ✅ | Dine-In / Takeaway / Delivery |
| Expiry Date | date | - | Leave blank for no expiry |
| Active | toggle | - | Enable/disable coupon |

### Coupons Table Columns

| Column | Notes |
|--------|-------|
| Code | Monospace bold |
| Discount | "20% off" or "₹50 flat" |
| Min Order | ₹ threshold |
| Uses | `5 / 100` used/max format |
| Order Types | Pills for applicable types |
| Expiry | Date or "No expiry" |
| Status | Active/Inactive toggle |
| Actions | Edit, Delete |

### `Coupon` Type (couponsStore)

```typescript
interface Coupon {
  id: string
  code: string
  discountType: 'percentage' | 'flat'
  discountValue: number
  minOrderValue: number
  maxUses: number | null          // null = unlimited
  usedCount: number
  isActive: boolean
  applicableOrderTypes: ('dine-in' | 'takeaway' | 'delivery')[]
  expiresAt: string | null        // ISO date string or null
  createdAt: string
}
```

### Coupon Validation Logic

**`couponsStore.validateCoupon(code, subtotal, orderType)`**

Validation steps (in order):
1. Find coupon by code (case-insensitive)
2. Check `isActive === true`
3. Check `usedCount < maxUses` (or `maxUses === null`)
4. Check `new Date() < new Date(expiresAt)` (or no expiry)
5. Check `subtotal >= minOrderValue`
6. Check `orderType in applicableOrderTypes`

Discount calculation:
```typescript
if (discountType === 'percentage') {
  discountAmount = Math.round((discountValue / 100) * subtotal)
} else {
  discountAmount = discountValue
}
```

Returns: `{ isValid: boolean, discountAmount: number, error?: string }`

### Coupon Usage Counter

After a successful order placement:
```typescript
couponsStore.incrementUsedCount(code)
```

This increments `coupon.usedCount` by 1. When `usedCount >= maxUses`, the coupon becomes unavailable.

---

## 🎁 Section 3 — Offers

**Component:** `components/admin/coupons/OfferForm.tsx` + `OfferTable.tsx`  
**Store:** `promotionsStore.ts` → `offers[]`

### What Are Offers?

**Visual promotional cards** shown to customers on the website (e.g., "Buy 2 Get 1 Free", "Family Bundle Deal"). Unlike coupons, these don't have an automatic discount mechanism — they're informational promotions the admin creates to highlight deals.

### Add Offer Form Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Offer Title | text | ✅ | e.g. "Weekend Special — Buy 2 Get 1 Free" |
| Description | textarea | ✅ | Full offer details |
| Offer Type | select | ✅ | `free-item` / `bundle` / `bogo` / `other` |
| Min Order Value (₹) | number | - | Minimum order to apply offer |
| Valid From | date | - | Start date |
| Valid To | date | - | End date |
| Offer Image URL | text | - | Banner image URL |
| Active | toggle | - | Show/hide on website |

### Offers Table Columns

| Column | Notes |
|--------|-------|
| Title | Offer name |
| Type | Badge (free-item/bundle/bogo/other) |
| Min Order | ₹ threshold or "No minimum" |
| Valid Period | "Aug 1 – Aug 31" or "No expiry" |
| Status | Active/Inactive toggle |
| Actions | Edit, Delete |

### `Offer` Type (promotionsStore)

```typescript
interface Offer {
  id: string
  title: string
  description: string
  offerType: 'free-item' | 'bundle' | 'bogo' | 'other'
  minOrderValue: number
  isActive: boolean
  validFrom: string | null
  validTo: string | null
  imageUrl?: string
  createdAt: string
}
```

---

## 🛒 Customer-Side Integration

### Coupon at Checkout (CartDrawer)

```
Customer enters code → [Apply] button
    ↓
couponsStore.validateCoupon(code, subtotal, orderType)
    ↓
Success: discount shown in totals, "Remove" option
Failure: error message in red
    ↓
On order placement: couponsStore.incrementUsedCount(code)
Order saved with: { couponCode: "WELCOME20", discountAmount: 50 }
```

### Display on Order Tracker

If a coupon was applied, the tracker shows:
```
Discount (WELCOME20)     -₹50
```

### WhatsApp Message

If coupon applied, the WhatsApp order message includes:
```
🎟 Coupon Applied: WELCOME20 — Saved ₹50
```

---

## 📊 Promotions Summary (All 3 Sections)

| Feature | Code Required | Auto-Apply | Visual on Site | Admin Table |
|---------|--------------|-----------|----------------|-------------|
| Reward Tier | No | Yes (by value) | Planned | ✅ |
| Coupon | Yes | At checkout | No (code entry) | ✅ |
| Offer | No | No | Yes (banner) | ✅ |
