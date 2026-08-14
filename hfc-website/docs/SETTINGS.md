# ⚙️ HFC Settings Panel — Complete Documentation

> **URL:** `/admin/settings`  
> **File:** `app/admin/settings/page.tsx`  
> **Store:** `store/settingsStore.ts` (key: `hfc-settings`)  
> **Supabase Path:** `public.settings` rows `site_settings` and `site_settings_private` (JSONB)

---

## Overview

The Settings page is the **business configuration hub** that drives live site behavior across the entire HFC application. Settings are split into:
1. **Cards 1–5**: Core settings saved via the "Save settings" form submission.
2. **Card 6**: Delivery Areas (managed dynamically with instant auto-save).
3. **Card 7**: Subscription Plans (managed dynamically with instant auto-save).

Any change here automatically upserts to Supabase and broadcasts to all clients in **real-time** (< 1s).

---

## 💾 Save & Sync Behavior

- **Initial Load**: On page mount, `fetchAndSyncSettings()` fetches both `site_settings` (public values) and `site_settings_private` (credentials) from Supabase.
- **Real-time Sync**: The page subscribes to Postgres changes on the `settings` table. If settings are updated on another device, they sync live.
- **Sensitive Data Isolation**: To prevent exposing Meta Cloud API access tokens to anonymous clients, API keys are synced separately to `site_settings_private`. Public values like delivery fees and UPI IDs go to `site_settings`.

---

## 🃏 Card 1 — License

Shows the active product licensing details. Gated client-side to prevent unauthorized domain usage.

| Field | Type | Notes |
|-------|------|-------|
| License Key | textarea | HFC product license key |
| Status Badge | text | Active (green check) or Not licensed (amber alert) |

---

## 🎨 Card 2 — Branding

Controls brand information displayed across pages and messages.

| Field | Type | Notes |
|-------|------|-------|
| Kitchen / Site Name | text | e.g. "HFC Consultancy Services" |
| Logo | file upload | Uploads image and converts to Base64 format |
| Phone | text | Used in Navbar, Footer, and tracker "Call HFC" link |
| WhatsApp Number | text | Numeric only with country code, e.g. `919912799855` |
| Kitchen Address | textarea | Displayed in invoice bills and footer |

**Live impact:** Changes to branding update footer contacts, invoice headers, and the WhatsApp message recipient target instantly.

---

## 🧾 Card 3 — GST

Controls split tax calculations displayed during checkout and on printed bills.

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| GST Mode | select | `exclusive` | `none` (no GST) / `inclusive` (in price) / `exclusive` (added at checkout) |
| GST % | number | `5` | Split evenly as CGST and SGST on customer bills |

**Calculation logic:** CGST and SGST are calculated at half of the total GST percentage each (e.g. 5% total split into 2.5% CGST + 2.5% SGST on invoice).

---

## 🛵 Card 4 — Delivery & Payment

Configures checkout rates, payment modes, and payment targets.

| Field | Type | Default | Notes |
|-------|------|---------|-------|
| Delivery Fee | number | `50` | Charged on delivery orders |
| Free Delivery Above | number | `500` | Free delivery threshold (0 = never free) |
| Currency Symbol | text | `₹` | Used for all currency labels |
| UPI ID | text | - | target for checkout QR code generation (leave blank to hide QR) |
| Accept Cash | checkbox | `true` | Allows Cash on Delivery option |
| Accept Online (UPI/QR) | checkbox | `true` | Allows UPI payment option |

---

## 📱 Card 5 — WhatsApp Auto-Send

Configures webhook triggers to Meta Cloud APIs for automatic status message dispatching.

| Field | Type | Description |
|-------|------|-------------|
| Cloud API access token | password | Permanent or temporary Meta token |
| Phone number ID | text | Meta API phone node reference |

---

## 📍 Card 6 — Delivery Areas

Manage the delivery zones where HFC delivers.

### Delivery Area Fields

| Field | Type | Notes |
|-------|------|-------|
| Area Name | text | e.g. "Labour Colony", "Maruthi Nagar" |
| Is Active | badge | Active zones appear in customer checkout selection dropdown |

### Actions
- **Add area**: Type name and hit Enter or click Add area.
- **Active / Paused toggle**: Toggle availability instantly.
- **Delete**: Remove area with inline confirm trigger.

---

## 📦 Card 7 — Subscription Plans

Informational meal plans displayed to regular clients registerable on sign-up sheets.

### Subscription Plan Fields

| Field | Type | Notes |
|-------|------|-------|
| Plan Name | text | e.g. "Basic Tier", "Gold Meal Plan" |
| Price / month | number | Cost of tiffin plan in ₹ |
| Is Active | badge | Active plans appear in registration options |

---

## 🔄 Settings Store Schema

```typescript
interface Settings {
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
```

---

## 🔗 Settings → Live Site Impact Map

| Setting Changed | Live Impact |
|----------------|-------------|
| `siteName` | Tab titles, checkout header, WhatsApp order templates |
| `logoBase64` | Navbar logo and order confirmation displays |
| `phone` / `whatsappNumber` | Target recipients for ordering, customer assistance links |
| `deliveryFee` / `freeDeliveryAbove` | Checkout subtotal/total calculations |
| `upiId` | Generated UPI deep link / QR code on order tracker |
| `gstMode` / `gstPercent` | CGST + SGST line calculations on bills and checkout drawers |
| `deliveryAreas` | Address zone selector list during checkout |
