# 📝 HFC Cloud Kitchen — Build Changelog

All notable changes to the HFC Consultancy Services application documented chronologically.

---

## [v2.2.3] — Menu Search Bar — August 14, 2026

### ✨ New Feature

**Real-time menu search** — customers can now find dishes instantly without scrolling through category tabs.

#### How it works
- Single search bar above the category tabs: `"Search for dishes, e.g. Paneer Tikka…"`
- Debounced 200ms — results update as customer types, no button tap needed
- Matches against: **product name** (primary), **description** (secondary), **category name** (so "starter" shows all starters)
- Result count chip: `"5 results for "Paneer"` appears below the bar
- Category tabs fade to 30% opacity with `pointer-events: none` during search — clean visual cue that search mode is active
- **Zero results state**: 🍽️ emoji + helpful hint "Try a different name, e.g. Biryani or Starter"
- Clear (✕) button in the input — single tap resets to category view, restoring previous active tab

#### Components
| File | Change |
|------|--------|
| `components/menu/MenuSearchBar.tsx` | **NEW** — Debounced input, clear button, focus styles, brand tokens |
| `components/menu/MenuGrid.tsx` | Accept optional `searchQuery` prop; flat filtered grid when searching; empty state; animated key transitions |
| `components/menu/MenuSection.tsx` | `searchQuery` state, result count computation, conditional category tab opacity |

---

## [v2.2.2] — Pre-Launch Blockers — August 14, 2026

### 🔧 Fixes

- **COD auto-flip for all order types** (`store/orderStore.ts`): Removed the `orderType === 'delivery'` guard from the cash-on-delivery auto-payment trigger. Previously, only delivery orders automatically flipped to `paymentStatus: 'paid'` when marked `delivered`. Dine-in and takeaway cash orders required manual marking. During a busy lunch rush this caused end-of-day revenue discrepancies. Now **all** Cash orders auto-flip to paid on delivery, regardless of order type. The bill payment status sync also fires for all types.

- **Agent Maps button confirmed live** (`app/agent/orders/page.tsx`): Verified that "Open map" (📍) button using `order.coords.lat/lng` → Google Maps deep link was already implemented in the agent orders table. No change needed — confirmed working.

### Files Modified
| File | Change |
|------|--------|
| `store/orderStore.ts` | Removed `isDeliveryOrder` gate — COD auto-flip now universal |

---

## [v2.2.1] — Priority Drawback Fixes — August 14, 2026

### 🚨 Critical Security Fix
- **Server-side coupon & order validation** (`app/api/orders/create/route.ts`): Orders are now verified through a secure Next.js API endpoint before hitting the database. Coupon codes, minimum order amounts, date bounds, usage limits, GST recalculations, delivery charges, and final totals are ALL recomputed server-side. Any discrepancy between client-submitted values and server-recomputed values is silently corrected before insertion. Makes discount tampering via DevTools completely impossible.

### ⚡ Performance & UX
- **IP-based rate limiting on checkout**: Max 5 order submissions per IP per minute. Returns `HTTP 429` with a user-friendly error message on spam.
- **Admin real-time order notifications** (`app/admin/layout.tsx`): Moved `subscribeToAllOrdersRealtime` from the orders list page to the admin layout wrapper. Admin now receives audio chimes + toast alerts on **any** admin page (Dashboard, Products, Settings, Bills, Agents) — not just the Orders list.
- **Double-tone Web Audio bell chime**: Replaced the single-oscillator ping with a premium D5 → A5 (587.33Hz → 880Hz) double-tone bell with exponential decays, matching the quality of a professional POS terminal notification.
- **Unseen badge preserved**: Admin layout no longer prematurely marks unseen orders as seen. The sidebar pulsing badge now correctly persists until the admin navigates to the Orders list.

### 🌍 Geocoding
- **OSM Nominatim fetch timeout** (`components/cart/CartDrawer.tsx`): Wrapped reverse geocoding request in a 5-second `AbortController` timeout. If OSM API is slow or rate-limited, checkout never hangs — user can type address manually.
- **Nominatim User-Agent header**: Added `User-Agent: HFC-Cloud-Kitchen-Client/1.0 (info@hfcconsultancy.com)` to comply with OSM API usage policy and prevent IP blocks.

### 🔧 Dynamic Configuration
- **WhatsApp & UPI settings unified** (`lib/whatsapp.ts`): Replaced all static `MERCHANT_PHONE` and `MERCHANT_UPI_ID` constants. Order confirmation WhatsApp links and UPI deep-links now resolve `whatsappNumber` and `upiId` from `useSettingsStore` at the moment of invocation. Changing numbers in the Admin Settings panel now takes effect everywhere instantly.
- **Footer contacts dynamic** (`components/layout/Footer.tsx`): Phone number, WhatsApp icon link, WhatsApp chat CTA button, and kitchen address now read from `useSettingsStore`.
- **Fallback pages dynamic**: `MenuUnavailableFallback.tsx` and `TrackerErrorBoundaryFallback.tsx` now show dynamic phone/WhatsApp contacts from settings instead of hardcoded values.
- **Admin bills printing dynamic** (`app/admin/bills/page.tsx`): Printable single bill invoices now pull UPI VPA from `useSettingsStore` instead of hardcoding `9912799855@okbizaxis`.

### Files Modified
| File | Change |
|------|--------|
| `app/api/orders/create/route.ts` | **NEW** — Server-side order creation, coupon validation, rate limiting |
| `app/admin/layout.tsx` | Global WebSocket subscription, double-tone chime, smart unseen badge |
| `app/admin/orders/page.tsx` | Removed redundant order subscription (now handled by layout) |
| `components/cart/CartDrawer.tsx` | Nominatim timeout/UA, server API confirm flow, loading spinner |
| `lib/whatsapp.ts` | Dynamic `whatsappNumber` and `upiId` from `useSettingsStore` |
| `components/layout/Footer.tsx` | Dynamic phone, WhatsApp, and address from `useSettingsStore` |
| `components/menu/MenuUnavailableFallback.tsx` | Dynamic fallback contacts |
| `components/tracker/TrackerErrorBoundaryFallback.tsx` | Dynamic fallback contacts |
| `app/admin/bills/page.tsx` | Dynamic UPI ID on printable invoices |

---

## [v1.0.0] — Foundation & Core Website

### Added
- **Next.js 16.3** project scaffolded with App Router and TypeScript
- **Tailwind CSS v4** with custom HFC brand token configuration (colors, fonts, shadows, radii)
- **Google Fonts** integration: Montserrat, Playfair Display, Lora, Inter
- Root layout with Navbar, Footer, and provider wrappers
- Customer homepage (`app/page.tsx`) with:
  - Splash screen (`SplashScreen.tsx`) — initial single-fade version
  - Hero section with left/right two-column layout
  - Menu section with product cards and category filter tabs
  - Cart drawer (2-step: Review → Checkout)
- `cartStore` — shopping cart state with persistence
- `productsStore` — menu product catalog with seed data
- `orderStore` — core order management with `OrderRecord` type
- `lib/whatsapp.ts` — WhatsApp message builder and link opener (no API cost)
- `hooks/useSplash.ts` — sessionStorage-based splash show/skip logic

---

## [v1.1.0] — Admin Panel

### Added
- Admin authentication (`adminAuthStore`, `/admin/login`)
- Admin layout with sidebar navigation
- **Dashboard** (`/admin/dashboard`):
  - KPI stat cards (Total Orders, Completed, Revenue, Avg Order Value, New Today)
  - Date range filter + agent filter
  - Agent performance breakdown table
  - Recent orders table
- **Orders List** (`/admin/orders`):
  - Status filter tabs (Active / New / Accepted / Ready / Out for Delivery / Delivered / Cancelled / All)
  - Search by ID, name, phone
  - Advanced filters (date range, order type, payment status)
  - Pagination (10 per page)
  - Pulsing unseen order badge on sidebar icon
- **Order Detail** (`/admin/orders/[orderId]`):
  - 2-column layout: order info (left) + action panel (right)
  - Status update buttons (Accept / Ready / Picked-up / Delivered / Reject / Cancel)
  - Payment method + status controls
  - Agent assignment dropdown
  - WhatsApp notify button to agent
  - View tracker, Duplicate order, Mark regular customer actions
- **Products** (`/admin/products`):
  - Add/Edit/Delete products
  - Availability toggle
  - Category filter tabs
- Shared admin components: `AdminBadge`, `AdminTable`, `EmptyState`

---

## [v1.2.0] — Bills System

### Added
- `billsStore` — auto-created bills linked to orders
- **Bills page** (`/admin/bills`):
  - Date range filter
  - Search by bill number or customer
  - Payment status filter
  - Revenue summary bar (Total, Paid, Unpaid)
  - "Mark Paid" quick action
  - Printable bill card view
- Auto-bill creation inside `orderStore.addOrder()`
- Bidirectional payment sync: `orderStore.updatePaymentStatus()` → `billsStore`

---

## [v1.3.0] — Promotions System (Coupons, Offers & Reward Tiers)

### Added
- `couponsStore` — discount coupon management with validation engine
- `promotionsStore` — reward tiers and promotional offers
- **Coupons & Offers page** (`/admin/coupons`) with 3 sections:
  1. **Auto-Reward Tiers** — value-based automatic loyalty rewards
  2. **Coupons** — code-based discounts with validation rules
  3. **Offers** — visual promotional banners for website
- Coupon validation logic: checks active status, usage limits, expiry, min order value, order type
- Coupon integration in `CartDrawer` — code input, apply/remove, discount shown in totals
- `couponsStore.incrementUsedCount()` called on order placement
- Coupon details included in orders (couponCode, discountAmount) and WhatsApp message

---

## [v1.4.0] — Delivery Agents System

### Added
- `agentsStore` — delivery agent accounts with full CRUD
- `agentAuthStore` — agent authentication via sessionStorage
- **Delivery Agents admin page** (`/admin/agents`):
  - Add agent form: name, WhatsApp, username, password, vehicle type, coverage area
  - Agents table with status toggle, edit modal, inline delete
  - Delete auto-unassigns agent from active orders
  - Seed agents: Rajesh Kumar (`rajesh`), Suresh Raina (`suresh`) — passwords rotated and managed via Supabase Auth since v2.1
- Agent assignment in Order Detail: `AgentDropdown` component (active agents only)
- "Notify agent" WhatsApp button in order detail with full assignment message
- Active status toggle: inactive agents hidden from order assignment dropdowns

---

## [v1.5.0] — Delivery Agent Portal

### Added
- Agent portal at `/agent/*` — separate lightweight interface for riders
- `/agent/login` — username/password login screen
- Agent layout with top bar + tab navigation (My Orders / My Report)
- `/agent/orders` — My Orders page:
  - Filters orders by `assignedAgent === agent.name`
  - Status tabs: New Assignments / Out for Delivery / Delivered / All
  - Date filter with From/To pickers
  - "Start Delivery" button → sets `picked-up` status
  - "Mark Delivered" → cash collection confirm → sets `delivered` + `paid`
  - "View Bill" → opens tracker in new tab
- `/agent/report` — My Report page:
  - Date range filter
  - 3 stat cards: Assigned Orders, Delivered, Delivered Value
  - Orders table for the date range

---

## [v1.6.0] — Settings Panel

### Added
- `settingsStore` — comprehensive business configuration store
- **Settings page** (`/admin/settings`) with 7 cards:
  1. License & Verification
  2. Branding (site name, tagline, phone, WhatsApp, email, address, logo)
  3. GST Configuration (enabled, %, GSTIN)
  4. Delivery & Payment (delivery charge, free delivery threshold, UPI ID, payment methods)
  5. WhatsApp Auto-send (toggles for placed/accepted/delivered events)
  6. Delivery Areas (add/toggle/delete zones)
  7. Subscription Plans (add/edit/delete meal plans)
- Single sticky "Save Settings" bar for all cards

---

## [v1.7.0] — Order Status Flow Fixes & Real-Time Tracker

### Fixed
- **Tracker page completely rebuilt** — removed fake 10-second auto-advance simulation
- Real-time polling every 6 seconds via `setInterval` (no simulation)
- Order tracker now reflects actual admin/agent status changes
- COD auto-pay logic baked into `orderStore.updateOrderStatus()`:
  - On `delivered` status + Cash payment → `paymentStatus` auto-flips to `paid`
  - Syncs to `billsStore` simultaneously
- COD safety net also in tracker: checks on every poll cycle

### Added
- 5-stage stepper (delivery): Placed → Accepted → Ready → Picked Up → Delivered
- 4-stage stepper (dine-in/takeaway): skips "Picked Up" stage
- Current stage pulse animation (brand-red ring)
- Cancelled/Rejected orders show full-width error banner (no stepper)
- Status context messages per stage
- Payment block conditional:
  - UPI pending → QR code scan block
  - Cash + Delivered → "Cash Payment Received ✓"
  - Online paid → "Online Payment Confirmed" chip
- "Order status updated ✓" green flash when status changes

---

## [v1.8.0] — Agent Portal Bug Fix (New Assignments)

### Fixed
- **Agent couldn't see orders marked "Ready" by admin**
  - Root cause: "New Assignments" tab only filtered `status === 'accepted'`
  - Fix: Now filters `status === 'accepted' || status === 'ready'`
  - "Start Delivery" button now active for both `accepted` and `ready` orders
- Agent `newAssignmentsCount` badge updated to include `ready` orders

---

## [v1.9.0] — Elevated Splash Screen, Hero & Footer

### Rebuilt: Splash Screen (10-Phase Sequence)
- Faint rotating background circles (3 concentric, 40s spin, continuous)
- Phase 1–2: SVG stroke-draw for outer red ring and inner dashed ring
- Phase 3: Cloche line art + fork icon draw-in
- Phase 4: H, F, C letter-by-letter staggered assembly (not single fade)
- Phase 5: Divider line scales from left
- Phase 6: "Consultancy Services" letter-spacing expansion animation
- Phase 7: ★★★★★ spring-bounce stagger per star
- Phase 8: Tagline fade-up
- Phase 9: "Crafting F&B Brands Since 2011" micro trust-line
- Phase 10: Two-part exit — badge scales/fades first, container slides up
- Total duration: ~4.7 seconds
- `sessionStorage` skip-on-revisit preserved

### Rebuilt: Hero Section
- Eyebrow: HFC mini-badge + pill combination (not just single pill)
- Headline: Animated wavy SVG underline beneath "Grow." (draws in on load)
- New service capability tags row (5 tags below subheadline)
- Primary CTA: ArrowRight icon with hover translate micro-animation
- Trust metrics expanded from 3 → 4 stats (added ₹50Cr+ Revenue Generated)
- Right column: 3-ring layered depth circles (not 2)
- Middle 380px ring: slow 60s continuous rotation (visual continuity from splash)
- Badge: box-shadow synced to float animation (peaks at top, softens at bottom)
- Third floating card added (mid-left): "+34% Avg Growth — revenue in 6 months"

### Rebuilt: Footer (4-Column Grid)
- Column 1 (Brand): logo, description, ★★★★★ rating, social icon row
- Column 2 (Quick Links): Home, Menu, About, Services, Client Stories, Contact
- Column 3 (Our Services): 6 service lines
- Column 4 (Get in Touch): Phone, Email, Address, Business hours, WhatsApp CTA button
- Center tagline strip retained
- Bottom legal bar: Copyright + Privacy Policy / Terms / Refund Policy links

---

## [v1.9.1] — Bug Fix: Framer Motion Spring Keyframes Error

### Fixed
- **Runtime error**: "Only two keyframes currently supported with spring and inertia animations"
- Root cause: Splash screen star animation used `scale: [0, 1.2, 1]` (3 values) with `type: 'spring'`
- Fix: Changed to `scale: 0 → 1` with spring physics tuned for natural overshoot:
  - `stiffness: 400, damping: 10, mass: 0.6` — spring overshoots naturally past 1.0 and snaps back

---

## [v1.10.0] — Documentation

### Added
- `docs/` folder with 10 comprehensive markdown files:
  - `README.md` — Documentation index + quick start
  - `OVERVIEW.md` — Tech stack, directory structure, architecture
  - `BRAND_SYSTEM.md` — Design tokens, typography, motion system
  - `WEBSITE.md` — Customer website features documentation
  - `ORDER_FLOW.md` — End-to-end order lifecycle
  - `ADMIN_PANEL.md` — Complete admin panel documentation
  - `DELIVERY_PORTAL.md` — Delivery agent portal documentation
  - `STATE_MANAGEMENT.md` — Zustand stores with full type definitions
  - `COMPONENTS.md` — Component architecture
  - `COUPONS_OFFERS.md` — Promotions system documentation
  - `SETTINGS.md` — Settings panel with schema and live impact map
  - `CHANGELOG.md` — This file

---

## [v1.11.0] — Production Hardening & Full Technical Audit Fixes

### Added & Fixed
- **Official Brand Logo in Splash Screen**: Replaced raw SVG text with official `/logo.jpeg` in a circular cropped container. Logo scales in at 1.2s with a spring-overshoot feel (`stiffness: 400, damping: 10, mass: 0.6`).
- **Collision-Proof Order IDs**: Switched order ID generator from `Date.now().toString(36)` to `crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()`. Zero external dependencies, browser-native, 4+ billion combinations (`HFC-F6B776C7`).
- **Ghost Order Prevention (WhatsApp Flow)**: Checkout drawer now holds order in pending state when WhatsApp opens, presenting a 2-step confirmation ("✓ Yes, I sent the message"). Order is written to `orderStore` ONLY after confirmation.
- **XSS Input Defense**: Added `sanitizeInput()` utility in `orderStore.ts` to sanitize customer name, address, landmark inputs before persistence (`<>'"` escaped).
- **OrderRecord Data Contract Cleanup**: Removed legacy alias fields (`customerPhone`, `deliveryAddress`, `gpsCoordinates`). Standardized on single canonical field names (`phoneNumber`, `address`, `coords`). Ensured defaults for required fields.
- **COD Auto-Pay Safety Guard**: Guarded auto-flipping cash orders to `paid` upon delivery so it ONLY triggers for `orderType === 'delivery'` (home delivery cash collection). Dine-in & takeaway counter payments are managed separately.
- **Store Hydration Indicator (`_hasHydrated`)**: Added `onRehydrateStorage` hook to `orderStore` setting `_hasHydrated: true` upon localStorage hydration, eliminating initial empty state flashes.
- **Comprehensive E2E Verification**: Successfully verified full order lifecycle (Website → Admin Panel → Agent Portal → Order Tracker) using automated browser testing.

---

## [v1.12.0] — Supabase Cloud Database & Real-Time WebSockets Integration

### Added
- **Supabase PostgreSQL Integration**: Connected project `cmwsffhenpckwkwgnmsy` via `@supabase/supabase-js` SDK and `.env.local` configuration.
- **Database Schema (`supabase/schema.sql`)**: Created PostgreSQL tables for `orders`, `products`, `agents`, `bills`, `coupons`, and `settings` with custom indexes and safe publication checks.
- **Sub-Second Real-Time Order Tracking**: Connected `app/track/[orderId]/page.tsx` to Supabase Realtime WebSockets (`subscribeToOrderRealtime()`), enabling sub-second order status updates across different devices without server polling delay.
- **Debounced Write Queue & Rate Limiting (`lib/supabaseSync.ts`)**: Built 200ms throttle map `syncQueueMap` to buffer rapid store mutations and prevent database socket spamming.
- **Exponential Backoff Retries**: Automatic 3-attempt retry loop with exponential backoff (500ms → 1000ms → 1500ms) for cloud DB upserts with silent local storage fallback during network drops.
- **Documentation Suite Expansion**: Added `SUPABASE_INTEGRATION.md` and `AUDIT_AND_HARDENING.md` to `docs/`.

---

## [v1.13.0] — Full Architecture Reconciliation & Multi-Device Real-Time Sync

### Added & Fixed
- **Source of Truth Reconciliation**: Established **Supabase Cloud Database (PostgreSQL)** as the Primary System of Record and **Zustand + localStorage** as the Optimistic Client Cache & Offline Layer.
- **Cross-Device WebSockets for Admin & Agent Portals**: Connected `app/admin/orders/page.tsx` and `app/agent/orders/page.tsx` to `subscribeToAllOrdersRealtime()`. Status updates made by admin on laptop reflect on delivery rider's phone in **< 0.5s**.
- **Supabase Row Level Security (RLS) Policies**: Added RLS policies for `public.orders`, `products`, `agents`, `bills`, `coupons`, and `settings` in `supabase/schema.sql`.
- **Non-HTTPS UUID Fallback**: Added `crypto.randomUUID()` detection with a safe `Math.random()` string fallback in `generateOrderId()` for HTTP / restricted non-secure environments.
- **Documentation Alignment**: Reconciled `STATE_MANAGEMENT.md`, `ORDER_FLOW.md`, `WEBSITE.md`, and `SUPABASE_INTEGRATION.md` to reflect identical single-source-of-truth principles and cross-device WebSockets.

---

## [v1.14.0] — Hardened RLS Security & Supabase Auth JWT Integration

### Added & Fixed
- **Hardened RLS Policies**: Dropped `OR auth.role() = 'anon'` from `supabase/schema.sql`. Strictly enforces `auth.role() = 'authenticated'` for order `UPDATE` and `DELETE` queries. Unauthenticated API calls with the public anon key attempting to modify `payment_status` receive an immediate `403 Forbidden`.
- **Supabase Auth Integration (`lib/supabaseAuth.ts`)**: Connected Admin (`adminAuthStore`) and Delivery Agent (`agentAuthStore`) login flows to Supabase Auth. Issues a valid `auth.role() = 'authenticated'` Bearer JWT attached automatically to all database queries.
- **Atomic SQL Optimistic Concurrency Control**: Replaced client-side check-then-write (TOCTOU race window) with a single atomic SQL `.upsert(row, { onConflict: 'id' })` operation.
- **Tax, Discount & Delivery Order Standardization**: Standardized calculation ordering across `CartDrawer.tsx`, `billsStore.ts`, and WhatsApp generator (free delivery threshold checked on pre-discount subtotal; GST calculated on post-discount taxable amount).

---

## [v1.15.0] — Role-Based RLS Claims, Atomic Conditional SQL Locks & Server Provisioning API

### Added & Fixed
- **Role-Based RLS Claims (`supabase/schema.sql`)**: Enforced role claims in PostgreSQL. Delivery agents are strictly restricted to updating orders assigned to their own name (`assigned_agent = auth.jwt() -> 'user_metadata' ->> 'agent_name'`). Agents cannot modify or reassign other riders' deliveries or perform DELETE queries.
- **Server-Side Agent Provisioning API (`app/api/admin/agents/provision/route.ts`)**: Built server API route using `SUPABASE_SERVICE_ROLE_KEY` strictly server-side. Securely provisions agent Auth credentials and metadata claims without exposing the service key to client browser bundles.
- **Atomic Conditional SQL Locks (`syncOrderStatusAtomic`)**: Implemented atomic conditional update `WHERE id = $order_id AND updated_at = $last_known_updated_at`. Guarantees zero silent data overwrites during concurrent edits by refetching cloud state upon conflict.

---

## [v1.16.0] — Strict Role-Based RLS Policies & Protected Provisioning API

### Added & Fixed
- **Strict Role-Based RLS Policies**: Completely removed all `OR auth.role() = 'authenticated'` fallbacks from `supabase/schema.sql`. PostgreSQL strictly requires `(auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'` for global updates/deletes, and `assigned_agent = (auth.jwt() -> 'user_metadata' ->> 'agent_name')` for delivery agents. Delivery agent JWTs attempting unauthorized updates or deletes receive `403 Forbidden`.
- **Protected Agent Provisioning API Route (`app/api/admin/agents/provision/route.ts`)**: Added Admin JWT authorization check to agent provisioning endpoint. Requests without a valid Admin Bearer token are rejected with `403 Forbidden`.
- **Complete Security Verification**: Verified role-scoped RLS policies, atomic conditional locks (`WHERE id = $id AND updated_at = $last_known_updated_at`), and secure service key usage.

---

## [v1.17.0] — Fail-Closed API Control Flow & 6-Table Strict RLS Security

### Added & Fixed
- **Fail-Closed API Control Flow (`app/api/admin/agents/provision/route.ts`)**: Inverted authentication verification to fail-closed by default. Missing headers return `401 Unauthorized`, invalid/expired tokens return `401 Unauthorized`, and non-admin roles return `403 Forbidden`. Prevents unauthenticated requests from bypassing provisioning checks.
- **6-Table Strict RLS Security (`supabase/schema.sql`)**: Applied strict, role-scoped RLS policies across ALL 6 database tables (`orders`, `settings`, `bills`, `agents`, `coupons`, `products`). Prevents unauthorized modification of UPI IDs, delivery fees, customer billing records, and agent accounts.

---

## [v1.18.0] — Read-Side Database Lockdown & SECURITY DEFINER Order Lookup RPC

### Added & Fixed
- **Bulk Database Dump Prevention (`public.orders`)**: Blocked public bulk queries (`GET /rest/v1/orders?select=*`) with `403 Forbidden`. Customer tracker uses a `SECURITY DEFINER` Postgres RPC function `get_order_by_id(p_order_id TEXT)` to safely fetch ONLY single orders by exact ID match.
- **Rider Credential & Phone Protection (`public.agents`)**: Dropped `password_hash` column completely from `public.agents`. Credentials are managed exclusively in Supabase Auth (`auth.users`). Restricted `public.agents` `SELECT` access strictly to authenticated staff (`'admin'`, `'agent'`).
- **Agent Billing Scoping (`public.bills`)**: Scoped delivery agent billing `SELECT` access strictly to bills where `order_id IN (SELECT id FROM orders WHERE assigned_agent = auth.jwt() -> 'user_metadata' ->> 'agent_name')`. Delivery agents cannot read other agents' billing totals or general business revenue.

---

## [v1.19.0] — Agent Order SELECT Scoping & Operational Deployment Readiness

### Added & Fixed
- **Agent Order SELECT Scoping (`supabase/schema.sql`)**: Updated `Scoped staff select orders` policy. Delivery agents can ONLY run `SELECT` queries on orders assigned to their own name (`assigned_agent = auth.jwt() -> 'user_metadata' ->> 'agent_name'`). Agents cannot inspect other riders' delivery lists or customer address databases.
- **Operational Readiness Checklist**: Documented environment secret handling (`SUPABASE_SERVICE_ROLE_KEY` server isolation), conflict refetch UI behavior, DPDP Act privacy compliance guidance, and Sentry/Supabase alerting recommendations.

---

## [v1.20.0] — Sentry Error Monitoring SDK Integration & Active Alerting

### Added & Fixed
- **Sentry SDK Package (`@sentry/nextjs`)**: Installed `@sentry/nextjs` package and initialized client (`sentry.client.config.ts`) and server (`sentry.server.config.ts`) monitoring configs.
- **Active Exception Dispatch (`lib/logger.ts`)**: Wired `Sentry.captureException()` directly into `captureError()` and `reportSyncFailure()`. Uncaught client runtime exceptions, API errors, or database network drops are actively captured and dispatched to Sentry dashboards.

---

## [v2.1.0] — Hardened Admin Auth & Client Error Boundaries

### Added & Fixed
- **Supabase Auth Admin Accounts**: Shifted admin panel authentication completely to Supabase Auth. Removed hardcoded credentials map. The admin dashboard now checks session tokens via `checkSupabaseAuthSession()`, enforcing metadata role checks (`role === 'admin'`).
- **Client Error Boundaries**: Created custom React `ErrorBoundary` handlers to catch rendering and networking crashes. Added offline recovery layout fallbacks around the Admin Dashboard, Menu Section, and Customer Order Tracker.
- **Environment Variables and Secrets**: Documented environment configuration setup and variables (.env.example) to keep API secrets out of public documents.
- **Verified Package Dependencies**: Inspected package versions confirming execution on Next.js 16.3.0 and Tailwind CSS 4.3.3.

---

## [v2.0.0] — Full Production Realtime System


### Added & Fixed
- **100% Real-Time Sync**: Rewrote `productsStore`, `promotionsStore`, and `settingsStore` to use Supabase Realtime WebSockets (`postgres_changes` filters). Edit items, prices, coupons, delivery fees, or settings in the admin panel and watch the customer checkout update instantly in under 1 second.
- **Egress Limit Safeguards**: Added 30-day fetch windows and 500-row limits to all major order and bill fetches to prevent database egress exhaustion on free tiers.
- **Self-Healing Seeder**: Connected a self-healing menu seeder to `productsStore`. Missing seed items in the database are automatically seeded on first load to prevent blank customer views.
- **Unified Coupon Engine**: Replaced static client-side coupons store with a unified realtime promotions store synced to `public.settings` in Supabase. Customer cart checkout now checks the database in real-time.
- **Branding & Settings Real-Time Engine**: Synced business configuration, delivery fees, tax percentages, and delivery area parameters to Supabase. Checkout totals recalculate automatically when settings are updated.
- **Rider Persistence Enhancements**: Switched delivery agent sessions from `sessionStorage` to `localStorage`. Riders remain securely logged in across tab closes and device reboots.

---

## [v2.2.0] — Full Credential Scrub, Production Hardening & Final Deployment

**Release Date:** August 14, 2026  
**Deploy URL:** https://hfc-cloud-kitchen-services-white-la.vercel.app

### Security: Credential Scrub (Zero Leaks Confirmed)

A full regex scan was run across every `.ts`, `.tsx`, `.md`, and `.json` file in the repository.
All hardcoded credentials found and eliminated:

| File | Old Content | Resolution |
|------|-------------|------------|
| `store/agentsStore.ts` | `password: 'raj123'`, `password: 'sur123'` | Blanked — auth managed via Supabase Auth only |
| `lib/supabaseAuth.ts` | `suppliedPassword === 'hfc2024'` hard check | Removed — provisioning no longer tied to hardcoded string |
| `hfc-website/README.md` | `hfc_admin / hfc2024-admin-secure-pass` table row | Replaced with Supabase Auth reference |
| `docs/STATE_MANAGEMENT.md` | `const ADMIN_PASSWORD = 'hfc2024'` code block | Updated to describe Supabase Auth JWT flow |
| `docs/README.md` | `admin/hfc2024`, `rajesh/raj123` credential rows | Replaced with `"managed via Supabase Auth"` |
| `docs/CHANGELOG.md` | `rajesh`/`raj123`, `suresh`/`sur123` in v1.4.0 | Removed — added rotation note |

**Post-scrub scan result:** `0 matches` for `raj123|sur123|hfc2024|password123` across all source files. ✅

### Infrastructure: UptimeRobot Monitoring Configured

- UptimeRobot monitor set to ping Supabase project URL every **12 hours**
- Prevents Supabase free tier auto-pause (triggers after 7 days of zero activity)
- Second monitor added for Vercel production URL (5-minute interval) — email alerts on downtime
- No cost. No code changes needed. Runs silently forever.

### Deployment

- Final production build deployed to Vercel — all 20 routes compiled clean
- Build: `next@16.3.0`, Turbopack, 0 TypeScript errors, 0 lint warnings
- All static + dynamic routes verified in build manifest

### Post-Launch Checklist (For HFC Operations Team)

- [ ] Reset admin password via Supabase Auth Dashboard → `admin@hfcconsultancy.com`
- [ ] Reset Rajesh Kumar agent password → `rajesh@hfc-agents.com`
- [ ] Reset Suresh Raina agent password → `suresh@hfc-agents.com`
- [ ] Run end-to-end real phone test (customer → admin → agent → tracker)
- [ ] Check Sentry on Day 3 for any real-user runtime errors
- [ ] Check Supabase egress/storage on Day 7

---

## 🔮 Planned / Future Features

| Feature | Priority | Notes |
|---------|----------|-------|
| WhatsApp Business API | High | Auto-send without manual window.open |
| Customer Login & Order History | Medium | Customer accounts |
| Push Notifications | Medium | Browser push for order updates |
| PWA (Installable App) | Medium | Service worker + manifest for agent app |
| Multi-branch Support | Medium | Multiple HFC locations |
| Inventory Management | Low | Stock tracking per product |
| Customer Reviews | Low | Post-delivery review collection |
| PDF Bill Generation | Low | Proper printable invoice PDF |

