# ⚙️ HFC Settings Panel — Complete Documentation

**URL:** `/admin/settings`  
**File:** `app/admin/settings/page.tsx`  
**Store:** `store/settingsStore.ts` (key: `hfc-settings`)

---

## Overview

The Settings page is the **business configuration hub** that drives live site behavior across the entire HFC application. All 7 cards are collected together and saved atomically via a single sticky "Save Settings" button at the bottom.

---

## 💾 Save Behavior

**Sticky Save Bar** (`components/admin/settings/StickySaveBar.tsx`):

- Fixed at bottom of viewport while any setting card is dirty
- Shows "Unsaved changes" indicator when local state differs from stored state
- Single click commits **all** changes across all 7 cards simultaneously
- `settingsStore.updateSettings(payload)` → persisted to localStorage under `hfc-settings`

---

## 🃏 Card 1 — License & Verification

**Component:** `LicenseCard.tsx`

| Field | Type | Notes |
|-------|------|-------|
| License Key | text | HFC product license |
| License Status | badge | `active` / `inactive` / `trial` |

Used to gate premium features (subscription plans, advanced analytics, etc.).

---

## 🎨 Card 2 — Branding

**Component:** `BrandingCard.tsx`

| Field | Type | Notes |
|-------|------|-------|
| Site / Business Name | text | e.g. "HFC Consultancy Services" — used in page title, WhatsApp messages |
| Tagline | text | e.g. "Your Growth, Our Responsibility" |
| Phone Number | text | Used in Navbar, Footer, order tracker "Call HFC" button |
| WhatsApp Number | text | With country code, e.g. `919912799855` |
| Email Address | text | Used in footer contact column |
| Business Address | textarea | Used in footer |
| Logo URL | text | URL to logo image — replaces default HFC badge |

**Live impact:** Changes to `siteName`, `phone`, `whatsappNumber` immediately affect:
- Order WhatsApp message recipient number
- Footer contact details
- Tracker "Call HFC" button href
- Page `<title>` tag and metadata

---

## 🧾 Card 3 — GST Configuration

**Component:** `GstCard.tsx`

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| GST Enabled | toggle | `true` | Master on/off for tax calculation |
| GST Percentage (%) | number | `5` | Applied to subtotal after discounts |
| GST Number (GSTIN) | text | - | Printed on bills |

**Calculation formula:**
```
GST Amount = Math.round((subtotal - discountAmount) * (gstPercentage / 100))
Total = subtotal - discountAmount + gstAmount + deliveryCharge
```

If `gstEnabled = false`, GST line is hidden from bills and totals.

---

## 🛵 Card 4 — Delivery & Payment

**Component:** `DeliveryPaymentCard.tsx`

### Delivery Sub-section

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| Delivery Enabled | toggle | `true` | If off, "Home Delivery" option hidden in checkout |
| Delivery Charge (₹) | number | `40` | Added to order total for delivery orders |
| Free Delivery Above (₹) | number | `500` | Orders above this value: delivery charge waived |

**Logic at checkout:**
```typescript
const charge = orderType === 'delivery' && subtotal < freeDeliveryAbove
  ? deliveryCharge
  : 0
```

### Payment Sub-section

| Field | Type | Notes |
|-------|------|-------|
| UPI ID | text | e.g. `9912799855@okbizaxis` — used for QR code generation on tracker |
| Cash on Delivery | toggle | Shows "Cash" payment option in checkout |
| UPI Payment | toggle | Shows "UPI" payment option in checkout |

**UPI QR Generation:**
```
upi://pay?pa={upiId}&pn={siteName}&am={total}&cu=INR
```
This deep link is converted to a QR code on the order tracker page using `qrcode.react`.

---

## 📱 Card 5 — WhatsApp Auto-Send

**Component:** `WhatsAppAutoSendCard.tsx`

Controls which order status events trigger automatic WhatsApp notifications to the customer.

| Toggle | Event | Message Sent |
|--------|-------|--------------|
| Auto-Send Enabled | Master toggle | Enables/disables all auto-sends |
| On Order Placed | Customer places order | Order confirmation + tracker link |
| On Order Accepted | Admin accepts | "Your order is being prepared" |
| On Order Delivered | Delivered status | "Your order has been delivered" |

> **Note:** Currently the WhatsApp "sending" is implemented as a link opener (window.open). True automated sending would require WhatsApp Business API or a webhook relay.

---

## 📍 Card 6 — Delivery Areas

**Component:** `DeliveryAreasCard.tsx`

Manage the delivery zones where HFC delivers.

### Delivery Area Fields

| Field | Type | Notes |
|-------|------|-------|
| Area Name | text | e.g. "Kasibugga Main", "Labour Colony", "Flat Area" |
| Is Active | toggle | Active areas shown in customer checkout area dropdown |

### Actions
- Add new area (name input + Add button)
- Toggle area active/inactive inline
- Delete area (with inline confirm)

### `DeliveryArea` Type

```typescript
interface DeliveryArea {
  id: string
  name: string
  isActive: boolean
}
```

**Customer-facing:** The delivery area names appear as a dropdown in the checkout form when order type is "Home Delivery". Customer selects their area for the admin to reference for routing.

---

## 📦 Card 7 — Subscription Plans

**Component:** `SubscriptionPlansCard.tsx`

HFC offers subscription meal plans to regular customers (e.g., monthly tiffin service).

### Subscription Plan Fields

| Field | Type | Notes |
|-------|------|-------|
| Plan Name | text | e.g. "Basic Tiffin", "Premium Lunch Plan" |
| Price Per Month (₹) | number | Monthly subscription fee |
| Meals Per Day | number | Number of meals included daily |
| Description | textarea | What's included in the plan |
| Is Active | toggle | Show/hide plan from website |

### `SubscriptionPlan` Type

```typescript
interface SubscriptionPlan {
  id: string
  name: string
  pricePerMonth: number
  mealsPerDay: number
  description: string
  isActive: boolean
}
```

### Actions
- Add new plan (inline form expansion)
- Edit plan (inline)
- Toggle active/inactive
- Delete plan (with confirm)

---

## 🔄 Settings Store Schema

**Full `Settings` interface:**

```typescript
interface Settings {
  // Card 1 — License
  licenseKey: string
  licenseStatus: 'active' | 'inactive' | 'trial'

  // Card 2 — Branding
  siteName: string
  tagline: string
  phone: string
  whatsappNumber: string
  email: string
  address: string
  logoUrl: string

  // Card 3 — GST
  gstEnabled: boolean
  gstPercentage: number
  gstNumber: string

  // Card 4 — Delivery & Payment
  deliveryEnabled: boolean
  deliveryCharge: number
  freeDeliveryAbove: number
  upiId: string
  cashEnabled: boolean
  upiEnabled: boolean

  // Card 5 — WhatsApp Auto-send
  whatsappAutoSend: boolean
  autoSendOnPlaced: boolean
  autoSendOnAccepted: boolean
  autoSendOnDelivered: boolean

  // Card 6 — Delivery Areas
  deliveryAreas: DeliveryArea[]

  // Card 7 — Subscription Plans
  subscriptionPlans: SubscriptionPlan[]
}
```

### Default Settings Values

| Setting | Default |
|---------|---------|
| siteName | "HFC Consultancy Services" |
| phone | "9912799855" |
| whatsappNumber | "919912799855" |
| gstEnabled | true |
| gstPercentage | 5 |
| deliveryEnabled | true |
| deliveryCharge | 40 |
| freeDeliveryAbove | 500 |
| upiId | "9912799855@okbizaxis" |
| cashEnabled | true |
| upiEnabled | true |
| licenseStatus | "trial" |

---

## 🔗 Settings → Live Site Impact Map

| Setting Changed | Live Impact |
|----------------|-------------|
| `siteName` | Page titles, WhatsApp messages, UPI QR payer name |
| `phone` | Footer "Call" link, Tracker "Call HFC" button |
| `whatsappNumber` | Order WhatsApp recipient, Agent notification link |
| `upiId` | UPI QR code on order tracker |
| `gstEnabled` / `gstPercentage` | Cart total calculation, bill line items |
| `deliveryEnabled` | Checkout order type options |
| `deliveryCharge` / `freeDeliveryAbove` | Cart delivery charge calculation |
| `deliveryAreas` | Checkout delivery area dropdown |
| `subscriptionPlans` | Customer-facing plan cards (if implemented) |
