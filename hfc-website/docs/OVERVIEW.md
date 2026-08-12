# 🏗️ HFC Cloud Kitchen — Project Overview

## About the Project

**HFC Consultancy Services** is a premium Food & Beverage consultancy brand based in Kasibugga, Srikakulam District, Andhra Pradesh, India. This application serves as their:

1. **Customer-facing website** — Consultancy showcase + cloud kitchen ordering platform
2. **Admin panel** — Full business management dashboard for the HFC team
3. **Delivery agent portal** — Lightweight rider-facing app for order dispatch

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|------------|
| Framework | **Next.js 16.3** (App Router, React Server Components) |
| Language | **TypeScript** |
| Styling | **Tailwind CSS v4** with custom HFC design tokens |
| Animations | **Framer Motion** |
| State Management | **Zustand** with `persist` middleware (localStorage) |
| QR Codes | `qrcode.react` |
| Icons | **Lucide React** |
| Date Utilities | `date-fns` |
| Toast Notifications | `react-hot-toast` |
| Package Manager | `npm` |

---

## 📁 Directory Structure

```
hfc-website/
├── app/                        # Next.js App Router pages
│   ├── page.tsx                # Customer homepage (/)
│   ├── layout.tsx              # Root layout (Navbar + Footer + Providers)
│   ├── globals.css             # Global CSS + Tailwind imports
│   ├── admin/                  # Admin Panel routes
│   │   ├── login/page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── orders/
│   │   │   ├── page.tsx        # Orders list
│   │   │   └── [orderId]/page.tsx  # Order detail
│   │   ├── products/page.tsx
│   │   ├── bills/page.tsx
│   │   ├── coupons/page.tsx
│   │   ├── agents/page.tsx
│   │   └── settings/page.tsx
│   ├── agent/                  # Delivery Agent Portal routes
│   │   ├── layout.tsx          # Agent auth guard + topbar
│   │   ├── login/page.tsx
│   │   ├── orders/page.tsx     # My Orders
│   │   └── report/page.tsx     # My Report
│   └── track/
│       └── [orderId]/page.tsx  # Live order tracker (customer-facing)
│
├── components/                 # Reusable React components
│   ├── admin/                  # Admin panel components
│   │   ├── shared/             # AdminBadge, AdminTable, EmptyState
│   │   ├── orders/             # AgentDropdown, OrdersTable, etc.
│   │   ├── products/           # ProductForm, ProductRow, etc.
│   │   ├── bills/              # Bills table components
│   │   ├── coupons/            # CouponForm, RewardTierForm, etc.
│   │   ├── agents/             # AddAgentForm, AgentsTable, etc.
│   │   └── settings/           # Card-based settings components
│   ├── hero/                   # Hero section components
│   │   ├── HeroSection.tsx
│   │   ├── HeroBrandCircle.tsx
│   │   ├── HeroBadge.tsx
│   │   └── HeroStats.tsx
│   ├── cart/                   # Cart drawer + checkout
│   │   ├── CartDrawer.tsx
│   │   ├── CartItem.tsx
│   │   └── CartButton.tsx
│   ├── layout/                 # Site layout
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── menu/                   # Menu section components
│   └── splash/                 # Splash screen
│       └── SplashScreen.tsx
│
├── store/                      # Zustand state stores
│   ├── orderStore.ts           # Orders (single source of truth)
│   ├── agentsStore.ts          # Delivery agents
│   ├── agentAuthStore.ts       # Agent authentication session
│   ├── adminAuthStore.ts       # Admin authentication session
│   ├── cartStore.ts            # Shopping cart
│   ├── productsStore.ts        # Menu products
│   ├── couponsStore.ts         # Discount coupons
│   ├── promotionsStore.ts      # Offers & reward tiers
│   ├── billsStore.ts           # Bills / invoices
│   └── settingsStore.ts        # Business settings
│
├── lib/                        # Utility functions
│   └── whatsapp.ts             # WhatsApp message builder + link opener
│
├── hooks/                      # Custom React hooks
│   └── useSplash.ts            # Splash screen show/skip logic
│
├── data/                       # Static seed data
│   └── menuData.ts             # Default menu items
│
├── types/                      # TypeScript type definitions
│
└── docs/                       # This documentation
```

---

## 🔄 Data Architecture

All application state lives in **Zustand persisted stores** backed by **localStorage**. This means:

- **No backend server required** — pure client-side state
- All panels (website, admin, agent) read from the **same localStorage keys**
- Changes in the admin panel are instantly visible to the agent portal and order tracker in the **same browser session**
- The order tracker polls every **6 seconds** using `setInterval` to catch status updates from other browser tabs

### Key localStorage Keys

| Key | Store | Contents |
|-----|-------|----------|
| `hfc-orders` | orderStore | All customer orders |
| `hfc-agents` | agentsStore | Delivery agent accounts |
| `hfc-products` | productsStore | Menu items |
| `hfc-coupons` | couponsStore | Discount codes |
| `hfc-promotions` | promotionsStore | Offers & reward tiers |
| `hfc-bills` | billsStore | Bills & invoices |
| `hfc-settings` | settingsStore | Business configuration |

---

## 🌐 Route Map

```
/                           → Customer homepage
/track/[orderId]            → Live order tracker
/admin/login                → Admin authentication
/admin/dashboard            → Analytics & KPIs
/admin/orders               → Orders list (all statuses)
/admin/orders/[orderId]     → Order detail & management
/admin/products             → Menu product management
/admin/bills                → Bills & invoices
/admin/coupons              → Coupons, Offers & Reward Tiers
/admin/agents               → Delivery agent accounts
/admin/settings             → Business configuration
/agent/login                → Agent authentication
/agent/orders               → My Orders (agent-filtered)
/agent/report               → My Report (personal analytics)
```

---

## 📱 WhatsApp Integration

All order notifications use WhatsApp — no third-party API, zero cost:

- **Customer places order** → WhatsApp opens with full order details sent to `+91 99127 99855`
- **Admin assigns agent** → "Notify agent" button sends WhatsApp to agent's number
- **Order tracker link** is included in every WhatsApp message: `/track/[orderId]`

---

*See individual documentation files for detailed feature breakdowns.*
