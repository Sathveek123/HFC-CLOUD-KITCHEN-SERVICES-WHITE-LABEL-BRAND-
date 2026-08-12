# 🧩 HFC Component Architecture

## Overview

Components are organized by surface area (admin, hero, cart, etc.) and follow a strict separation:
- **Page files** (`app/*/page.tsx`) — routing, data fetching, state wiring
- **Component files** (`components/*/`) — pure UI, receive props

---

## 📁 Component Directory Map

```
components/
├── admin/
│   ├── shared/           # Reusable admin UI primitives
│   ├── orders/           # Orders table, row, dropdowns
│   ├── products/         # Product CRUD components
│   ├── bills/            # Bills table components
│   ├── coupons/          # Coupon/offer/reward forms & tables
│   ├── agents/           # Agent CRUD components
│   └── settings/         # Settings card components
├── hero/                 # Homepage hero section
├── cart/                 # Cart drawer & checkout flow
├── layout/               # Navbar + Footer
├── menu/                 # Menu section components
└── splash/               # Splash screen
```

---

## 🔨 Shared Admin Components (`components/admin/shared/`)

### `AdminBadge.tsx`

Renders colored status/payment/type badges consistently across all admin tables.

**Props:**
```typescript
interface AdminBadgeProps {
  variant: 'status' | 'payment' | 'orderType'
  value: string
}
```

**Usage:**
```tsx
<AdminBadge variant="status" value={order.status} />
<AdminBadge variant="payment" value={order.paymentStatus} />
<AdminBadge variant="orderType" value={order.orderType} />
```

**Status → Color mapping:**
| Value | Background | Text |
|-------|-----------|------|
| `placed` | gray-100 | gray-700 |
| `accepted` | blue-50 | blue-700 |
| `ready` | amber-50 | amber-700 |
| `picked-up` | teal-50 | teal-700 |
| `delivered` | #166534 | white |
| `cancelled` | gray-50 | gray-500 |
| `rejected` | red-50 | red-700 |
| `paid` | green-50 | green-700 |
| `unpaid` | amber-50 | amber-700 |

---

### `AdminTable.tsx`

Generic table wrapper with consistent header/body/empty state styling.

**Props:**
```typescript
interface AdminTableProps {
  headers: string[]
  children: React.ReactNode
  emptyMessage?: string
}
```

---

### `EmptyState.tsx`

Centered empty state with icon, title, and optional CTA — shown when tables have no data.

**Props:**
```typescript
interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
}
```

---

## 📦 Orders Components (`components/admin/orders/`)

### `OrdersFilterTabs.tsx`

Horizontal scrollable tab strip for status filtering.

**Props:** `activeTab`, `setActiveTab`, `orders` (for count badges), `setSearchQuery`, `setPage`

**Tabs:** Active | New | Accepted | Ready | Out for Delivery | Delivered | Cancelled | All

Each tab shows a count badge with the number of matching orders.

---

### `OrdersSearchBar.tsx`

Combined search + advanced filter expansion panel.

**Features:**
- Search input (by ID, name, phone)
- Collapsible advanced filter panel with From/To dates, Order Type, Payment Status
- Shows "X of Y results" filter count

---

### `OrdersTable.tsx`

Renders the paginated orders list table.

**Columns:** Order ID + time, Customer, Order Type, Total, Payment, Status, Assigned Agent, Actions

**Row click** → navigates to `/admin/orders/[orderId]`

---

### `AgentDropdown.tsx`

Inline agent assignment dropdown in the order detail page.

**Features:**
- Shows only `isActive` agents
- On change → `orderStore.assignAgent(orderId, agentName)`
- "Notify agent" WhatsApp button when an agent is selected
- WhatsApp message includes full order details + delivery address

**WhatsApp message includes:**
```
🛵 HFC Delivery Assignment
Order ID, Customer, Phone, Address, Landmark
Items ordered
Amount to Collect: ₹XXX (UNPAID/PAID)
```

---

## 🍽️ Products Components (`components/admin/products/`)

### `ProductForm.tsx`
Add/Edit product form with fields: Name, Category, Price, Description, Image URL, Is Available toggle.

### `ProductRow.tsx`
Single product table row with inline edit mode and availability toggle.

### `DeleteProductInline.tsx`
Red alert band confirmation row that appears when delete is initiated.

---

## 🧾 Bills Components (`components/admin/bills/`)

### `BillsTable.tsx`
Bills list with date filter, search, and payment status filter.

### `BillCard.tsx`
Printable bill card modal/view with full order details and HFC branding.

### `BillsSummaryBar.tsx`
Revenue summary: Total Bills, Total Revenue, Paid Revenue, Unpaid Revenue.

---

## 🎟️ Coupons Components (`components/admin/coupons/`)

### `RewardTierForm.tsx`
Add form for Auto-Reward Tiers. Fields: Tier Name, Min Order Value, Reward Description, Reward Type, Reward Value.

### `RewardTierTable.tsx`
Table of existing reward tiers with toggle active, edit inline, delete inline.

### `CouponForm.tsx`
Add form for Coupon codes. Fields: Code, Discount Type (%), Discount Value, Min Order Value, Max Uses, Applicable Order Types, Expiry Date.

### `CouponTable.tsx`
Table of coupons with used count, active toggle, edit, delete.

### `OfferForm.tsx`
Add form for Offers. Fields: Title, Description, Offer Type, Min Order Value, Valid From, Valid To, Image URL.

### `OfferTable.tsx`
Table of offers with date range display, active toggle, edit, delete.

---

## 🛵 Agents Components (`components/admin/agents/`)

### `AddAgentForm.tsx`
Add new delivery agent form card (top of page).

Fields: Full Name, WhatsApp, Username, Password, Vehicle Type (dropdown), Coverage Area.

Validation:
- Username uniqueness check (`agentsStore.isUsernameAvailable`)
- WhatsApp format validation

### `AgentsTable.tsx`
Full agents table with all agents listed.

### `AgentRow.tsx`
Single agent row with inline fields for the edit state.

### `DeleteAgentInline.tsx`
Inline red confirmation band. On confirm: deletes agent AND unassigns from all active orders via `useOrderStore.getState().assignAgent(orderId, null)`.

---

## ⚙️ Settings Components (`components/admin/settings/`)

Each card is a self-contained component:

| Component | Settings Section |
|-----------|-----------------|
| `LicenseCard.tsx` | License key, status |
| `BrandingCard.tsx` | Site name, tagline, phone, WhatsApp, email, address, logo URL |
| `GstCard.tsx` | GST enabled toggle, GST %, GST number |
| `DeliveryPaymentCard.tsx` | Delivery toggle, delivery charge, free delivery threshold, UPI ID, payment methods |
| `WhatsAppAutoSendCard.tsx` | Auto-send toggles for placed/accepted/delivered events |
| `DeliveryAreasCard.tsx` | Add/remove/toggle delivery area zones |
| `SubscriptionPlansCard.tsx` | Add/edit/delete customer subscription plans |
| `StickySaveBar.tsx` | Fixed bottom bar with "Save Settings" button + unsaved changes indicator |

---

## 🦁 Hero Components (`components/hero/`)

### `HeroSection.tsx`

Main hero section with left text column + right visual column.

**Left Column Contents:**
1. Badge-icon + pill credibility eyebrow
2. H1 headline with animated wavy SVG underline on "Grow."
3. Italic subheadline paragraph
4. Service capability tags row (5 tags)
5. CTA buttons (Explore Menu + Talk to Us) with ArrowRight hover micro-interaction
6. 4-stat trust metrics grid (200+ Brands, 15 Yrs, 500+ Menus, ₹50Cr+ Revenue)

### `HeroBrandCircle.tsx`

Right column visual with concentric circles + floating logo badge + 3 floating cards.

**Structure:**
- Outer 480px dashed ring (static)
- Middle 380px dashed ring (60s continuous rotation — matches splash screen motion language)
- Inner 280px solid ring
- Center: 260px floating badge with HFC logo (`/logo.jpeg`) + synchronized box-shadow animation
- 3 floating social proof cards:
  - Top-right: "Menu Ready — Launch in 7 Days"
  - Mid-left: "+34% Avg Growth — revenue in 6 months"
  - Bottom-right: "★★★★★ 4.9 (184) — Best F&B consultant"

### `HeroBadge.tsx`
Simple pill badge with star icon used as the eyebrow label component.

### `HeroStats.tsx`
4-column metric grid at the bottom of the left column.

---

## 🛒 Cart Components (`components/cart/`)

### `CartDrawer.tsx`

Main 3-step checkout component (Review → Checkout form → WhatsApp confirmation).

**State managed internally:**
- `step`: 'review' | 'checkout' | 'confirm'
- `pendingOrder`: OrderRecord | null (held during WhatsApp step before persisting)
- Form fields: name, phone, orderType, landmark, manualAddress, coords (sanitized against XSS)
- Coupon state: code, appliedCoupon, discountAmount
- Geo state: geoStatus, coords

**Key functions:**
- `captureLocation()`: triggers `navigator.geolocation` + Nominatim reverse geocoding
- `validateForm()`: validates input lengths and required fields
- `handleOpenWhatsApp()`: builds order with collision-proof `generateOrderId()`, opens WA link, transitions to `confirm` step
- `handleConfirmSent()`: writes `pendingOrder` to `orderStore`, clears cart, redirects to `/track/[orderId]`

---

## 🌊 Splash Component (`components/splash/`)

### `SplashScreen.tsx`

10-phase animated brand splash screen featuring the official HFC logo (`/logo.jpeg`).

**Key behaviors:**
- Reads `useSplash()` hook to determine whether to show
- Renders official `/logo.jpeg` image inside a rounded cropped frame with spring scale-in
- Two-part exit: badge fades at 3900ms → container slides at 4050ms
- `sessionStorage` based — shows once per browser session
- Mobile-responsive scaling

**Animation caveats:**
- All spring animations use exactly 2 keyframes (start + end) — Framer Motion spring limitation
- Overshoot scale effects achieved via spring physics tuning (`stiffness: 400, damping: 10, mass: 0.6`)

---

## 🧭 Layout Components (`components/layout/`)

### `Navbar.tsx`

Fixed top navigation bar.

**Contains:**
- HFC logo/wordmark (left)
- Navigation links: Home, Menu, About, Services (center, desktop only)
- Cart button with item count badge (right)
- Scroll-aware: adds border + shadow on scroll

### `Footer.tsx`

4-column structured footer.

**Columns:** Brand (logo + description + stars + social icons) | Quick Links | Our Services | Get in Touch

**Rows:**
1. 4-column grid
2. Center tagline strip
3. Bottom bar (copyright + legal links)

---

## 🎨 Agent Portal Components (`components/agent/`)

### `components/agent/report/ReportDateFilter.tsx`
Date range filter bar with From/To inputs and Filter + Reset buttons.

### `components/agent/report/ReportStatCards.tsx`
Row of 3 stat cards: Assigned Orders, Delivered, Delivered Value.

### `components/agent/report/ReportOrdersTable.tsx`
Simple 5-column read-only table of agent's orders in date range.
