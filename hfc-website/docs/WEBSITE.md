# 🌐 HFC Customer Website — Documentation

> **URL:** https://hfc-cloud-kitchen-services-white-la.vercel.app  
> **Route:** `/`  
> **File:** `app/page.tsx`

---

## Overview

The customer-facing website serves two purposes:
1. **Consultancy showcase** — presents HFC's expertise, services, and trust signals to potential clients.
2. **Cloud kitchen ordering** — allows customers to browse the menu, add items to cart, apply discount coupons, and place orders.

Every config detail (delivery fees, UPI ID, coupons, menu products) is loaded from Supabase and updated in **real-time** via WebSockets without refreshing.

---

## 🌊 Splash Screen

**Component:** `components/splash/SplashScreen.tsx`  
**Hook:** `hooks/useSplash.ts`

### Behavior
- Shows **only once per browser session** (skipped on revisit using `sessionStorage.setItem('hfc-splash-shown', 'true')`).
- Total duration: **~4.7 seconds** of forward motion.
- Fully responsive — scales down proportionally on mobile.

### 10-Phase Animation Sequence
1. **Faint rotating background circles** (3 concentric, continuous 40s spin).
2. **Outer red ring** draws clockwise via SVG `strokeDashoffset` (900ms).
3. **Inner dashed ring** draws in (overlapping phase 1).
4. **Official HFC Logo Image** scales in at center (`/logo.jpeg` in rounded cropped circle, spring bounce).
5. **Divider line** scales from left (200ms).
6. **"Consultancy Services"** subtitle expands letter-spacing 1px → 5px as it fades in.
7. **★★★★★ stars** pop in with spring bounce stagger (one by one, using stiffness-tuned spring mechanics).
8. **Tagline** fades up: *"Your Growth, Our Responsibility. All Within Your Budget."*
9. **Micro trust-line**: *"Crafting F&B Brands Since 2011"*.
10. **Exit**: Badge scales/fades (200ms) → container slides up (-100vh, 650ms cubic-bezier).

---

## 🦁 Hero Section

**Component:** `components/hero/HeroSection.tsx`  
**Right Column:** `components/hero/HeroBrandCircle.tsx`

### Left Column Structure
- HFC micro-badge + "★ Trusted by 200+ F&B Brands" pill.
- Headline: "We Build Food Businesses That Actually Grow" with animated wavy SVG underline drawing on load.
- Five capability tags: `Menu Engineering`, `Brand Identity`, `Kitchen Setup`, `Staff Training`, `Cost Optimization`.
- CTAs: "EXPLORE OUR MENU" (scrolls to menu) + "TALK TO US" (WhatsApp contact).
- Trust metrics: 200+ F&B Brands, 15 Yrs Experience, 500+ Menus, ₹50Cr+ Revenue.

### Right Column Structure (Desktop Only)
- Three concentric circles creating depth of field (middle 380px ring rotates continuously).
- Floating center HFC Logo badge with box shadow synced to float y-position.
- Social proof float cards: "Menu Ready / Launch in 7 Days", "+34% Avg Growth / revenue in 6 months", "★★★★★ 4.9 (184 reviews)".

---

## 🍽️ Menu Section

**Route anchor:** `#menu-section`  
**Components:** `components/menu/`

- **Real-Time Sync**: Subscribes to postgres changes on `products` table via `subscribeToProductsRealtime()`. When the admin edits prices, updates names, or toggles availability in the admin panel, the client menu card updates instantly without page reload.
- **Dynamic Categories**: Category filter tabs are automatically populated based on active product categories.
- **Availability Guard**: Items toggled "Unavailable" in admin disappear instantly.

---

## 🛒 Cart Drawer & Checkout

**Component:** `components/cart/CartDrawer.tsx`

### 3-Step Checkout Flow

#### Step 1 — Cart Review
- Item list with quantity +/- controls.
- Coupon code input field connected to `promotionsStore`.
- Subtotal, GST, and Total calculations. Taxes CGST + SGST split evenly.

#### Step 2 — Checkout Form
- **Full Name** (sanitized against XSS).
- **Phone Number** (10 digits).
- **Order Type**: Dine-In / Takeaway / Home Delivery.
- **Delivery Area**: Dropdown populated from `site_settings.deliveryAreas` configured by admin.
- **Address & Landmark** (required for delivery).
- **GPS Location Capture**: Geolocation coordinates captured via browser and geocoded via Nominatim reverse-lookup.

#### Step 3 — WhatsApp Confirmation (Ghost-Order Defense)
- Opens WhatsApp in new tab with pre-filled order receipt details.
- Displays modal: *"WhatsApp is open! Tap Send in WhatsApp to submit your order."*
- Clicks **"✓ Yes, I sent the message"** → Order is written to Supabase, cart cleared, redirects to `/track/[orderId]`.
- Prevents dummy orders from entering the system.

---

## 📍 Order Tracker

**Route:** `/track/[orderId]`  
**File:** `app/track/[orderId]/page.tsx`

- **Sub-Second WebSocket Updates**: Subscribes to the single order channel via `subscribeToOrderRealtime(orderId)`. Any status change made by admin or assigned agent reflects on the customer tracker screen instantly (<0.5s) without any polling.
- **5-Stage Stepper (Delivery)**: Placed → Accepted → Ready → Picked Up → Delivered.
- **4-Stage Stepper (Dine-in / Takeaway)**: Placed → Accepted → Ready → Delivered.
- **Cancelled / Rejected Banner**: Replaces the stepper with contact actions.
- **Dynamic Payment Block**: Shows QR code if unpaid UPI, cash confirmation message, or online confirmation chip.
