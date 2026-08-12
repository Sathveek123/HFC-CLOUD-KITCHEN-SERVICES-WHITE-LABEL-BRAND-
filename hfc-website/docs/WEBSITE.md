# 🌐 HFC Customer Website — Documentation

**Route:** `http://localhost:3000/`  
**File:** `app/page.tsx`

---

## Overview

The customer-facing website serves two purposes:
1. **Consultancy showcase** — presents HFC's expertise, services, and trust signals to potential clients
2. **Cloud kitchen ordering** — allows customers to browse the menu, add items to cart, and place orders

---

## 🌊 Splash Screen

**Component:** `components/splash/SplashScreen.tsx`  
**Hook:** `hooks/useSplash.ts`

### Behavior
- Shows **only once per browser session** (skipped on revisit using `sessionStorage.setItem('hfc-splash-shown', 'true')`)
- Total duration: **~4.7 seconds** of forward motion, no idle phases
- Fully responsive — mobile scales proportionally

### 10-Phase Animation Sequence
1. **Faint rotating background circles** (3 concentric, nearly invisible, continuous 40s spin)
2. **Outer red ring** draws clockwise via SVG `strokeDashoffset` (900ms)
3. **Inner dashed ring** draws in (overlapping phase 1)
4. **Official HFC Logo Image** scales in at center (`/logo.jpeg` in rounded cropped circle, spring bounce)
5. **Divider line** scales from left (200ms)
6. **"Consultancy Services"** subtitle expands letter-spacing 1px → 5px as it fades in
7. **★★★★★ stars** pop in with spring bounce stagger (one by one, 2-keyframe spring tuned physics)
8. **Tagline** fades up: *"Your Growth, Our Responsibility. All Within Your Budget."*
9. **Micro trust-line**: *"Crafting F&B Brands Since 2011"*
10. **Exit**: Badge scales/fades (200ms) → container slides up (-100vh, 650ms cubic-bezier)

---

## 🦁 Hero Section

**Component:** `components/hero/HeroSection.tsx`  
**Right Column:** `components/hero/HeroBrandCircle.tsx`

### Left Column Structure

```
┌─────────────────────────────────────────────────────────┐
│  [HFC micro-badge] [★ Trusted by 200+ F&B Brands pill]  │
│                                                         │
│  We Build Food Businesses                               │
│  That Actually Grow.  ←— animated wavy underline        │
│                                                         │
│  From concept to kitchen...                             │
│  [italic subheadline paragraph]                         │
│                                                         │
│  [Menu Engineering] [Brand Identity] [Kitchen Setup]    │
│  [Staff Training] [Cost Optimization]  ← service tags   │
│                                                         │
│  [EXPLORE OUR MENU →]   [TALK TO US]                   │
│                                                         │
│  ────────────────────────────────────────────────────   │
│  200+          15 Yrs       500+         ₹50Cr+         │
│  F&B Brands    Experience   Menus        Revenue        │
└─────────────────────────────────────────────────────────┘
```

### Right Column Structure (Desktop Only)

```
        ┌──────────────────────────────┐
        │ [Menu Ready]    ← float card │
        │ Launch in 7 Days             │
[+34%] ├──────────────────────────────┤ 
Avg    │    ← outer 480px dashed ring  │
Growth │  ← middle 380px (rotating)   │
card   │    ← inner 280px solid ring  │
       │  ┌─────────────────────────┐ │
       │  │   [HFC LOGO floating]   │ │
       │  └─────────────────────────┘ │
       └──────────────────────────────┘
             ★★★★★ 4.9 (184)
             "Best F&B consultant"
```

**Visual details:**
- 3 concentric rings with layered opacity — increasing intensity toward center creates depth-of-field
- Middle 380px dashed ring rotates continuously at 60s/revolution (echoes splash screen motion)
- Center badge floats on `y:[0,-8,0]` cycle with synchronized `boxShadow` intensity (peaks at top of float)
- 3 floating social proof cards: Menu Ready (top-right), +34% Avg Growth (mid-left), ★★★★★ (bottom-right)

---

## 🍽️ Menu Section

**Route anchor:** `#menu-section`  
**Components:** `components/menu/`

### Features
- Products loaded from `productsStore` (Zustand persisted)
- Category filter tabs (auto-generated from product categories)
- Product cards with name, description, price, and "Add to Cart" button
- Real-time cart count indicator in the sticky Navbar

---

## 🛒 Cart Drawer & Checkout

**Component:** `components/cart/CartDrawer.tsx`

### 3-Step Checkout Flow

**Step 1 — Cart Review**
- Item list with quantity +/- controls and remove buttons
- Coupon code input field
- Subtotal, GST (5%), and Total display

**Step 2 — Checkout Form**

| Field | Required | Notes |
|-------|----------|-------|
| Full Name | ✅ | Customer name (sanitized against XSS) |
| Phone Number | ✅ | 10-digit mobile, used for contact |
| Order Type | ✅ | Dine-In / Takeaway / Home Delivery |
| Delivery Address | ✅ (Delivery only) | Text input + GPS auto-fill button (sanitized) |
| Landmark / House No | ✅ (Delivery only) | Required for delivery (sanitized) |

**GPS Location Capture:**
- Triggers `navigator.geolocation.getCurrentPosition()`
- On success: auto-fills address via Nominatim reverse geocoding (OpenStreetMap)
- Coordinates stored with order as `coords: { lat, lng }`

**Step 3 — WhatsApp Confirmation (Ghost-Order Defense)**
- Opens WhatsApp in new tab with pre-filled structured message
- Displays confirmation screen: *"WhatsApp is open! Tap Send in WhatsApp to submit your order."*
- **"✓ Yes, I sent the message"** → Order saved to `orderStore`, cart cleared, router redirects to `/track/[orderId]`
- **"↩ No, open WhatsApp again"** → Re-opens WhatsApp link
- Prevents un-sent "ghost orders" from cluttering store

### Order Placement Flow

```
Customer fills form → clicks "💬 Send Order via WhatsApp"
  ↓
1. Validate form fields + sanitize input strings (XSS defense)
2. Generate collision-proof Order ID (HFC-F6B776C7 via crypto.randomUUID)
3. Open WhatsApp link in new tab
4. Show confirmation step ("Did you send the message?")
5. Customer clicks "✓ Yes, I sent the message"
  ↓
6. orderStore.addOrder() → saved to localStorage
7. If coupon applied: couponsStore.incrementUsedCount()
8. Cart cleared, drawer closes
9. Router redirects → /track/[orderId]
```

### WhatsApp Message Format
Full structured message includes:
- Order ID, Customer Name, Phone
- Order type (DINE-IN / TAKEAWAY / HOME DELIVERY)
- Delivery address + GPS link + Google Maps driving route
- Itemized list with quantities and prices
- Coupon discount (if applied)
- Total amount
- UPI deep link for instant payment
- Live order tracker link: `{origin}/track/{orderId}`

---

## 📍 Order Tracker

**Route:** `/track/[orderId]`  
**File:** `app/track/[orderId]/page.tsx`

### Real-Time Polling
- Polls `orderStore.getOrderById()` every **6 seconds**
- No fake simulation — status only changes when admin/agent actually updates it
- Shows "Order status updated ✓" green flash when status changes
- COD auto-pay safety net: if order is delivered + Cash + unpaid → auto-flips to paid

### 5-Stage Stepper (Delivery Orders)
```
[1 Placed] → [2 Accepted] → [3 Ready] → [4 Picked Up] → [5 Delivered]
```

### 4-Stage Stepper (Dine-In / Takeaway)
```
[1 Placed] → [2 Accepted] → [3 Ready] → [4 Delivered]
```

### Stepper Visual States
| State | Dot Color | Label Color | Connection Line |
|-------|-----------|-------------|-----------------|
| Completed | Red filled + ✓ | Black semibold | Red |
| Current | Red filled + pulse ring | Red bold | Red |
| Upcoming | White + border | Muted | Light gray |

### Cancelled/Rejected
- Full-width error banner replaces stepper
- Shows AlertCircle icon, reason, "Call HFC" and "Order Again" buttons

### Payment Block (Conditional)
| Condition | Shows |
|-----------|-------|
| UPI order, not yet paid | QR code scan block |
| Cash + delivered | "Cash Payment Received ✓" card |
| Online payment confirmed | "Online Payment Confirmed" green chip |

---

## 🧭 Navbar

**Component:** `components/layout/Navbar.tsx`

- Fixed/sticky at top, `z-50`
- HFC logo (wordmark or badge) on left
- Navigation links (Home, Menu, About, Services) in center
- Cart icon with item count badge on right
- Cart opens `CartDrawer` on click
- Transparent on hero, white with border on scroll

---

## 🏁 Footer

**Component:** `components/layout/Footer.tsx`

### 4-Column Grid Structure

| Column | Contents |
|--------|----------|
| **Brand** | HFC logo, brand description, star rating (4.9/5, 184 reviews), social icon row |
| **Quick Links** | Home, Our Menu, About Us, Our Services, Client Stories, Contact |
| **Our Services** | Menu Engineering, Brand Identity Design, Kitchen Setup, Staff Training, Cost Optimization, Full F&B Consulting |
| **Get in Touch** | Phone, Email, Address, Business hours (Mon–Sat 10AM–8PM), WhatsApp CTA button |

**Bottom Bar:**
- Copyright line (auto year)
- Legal links: Privacy Policy, Terms of Service, Refund Policy

**Center Tagline Strip:** *"Your Growth, Our Responsibility. All Within Your Budget."*
