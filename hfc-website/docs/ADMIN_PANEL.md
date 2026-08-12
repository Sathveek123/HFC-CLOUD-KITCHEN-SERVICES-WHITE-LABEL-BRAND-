# 🛠️ HFC Admin Panel — Complete Documentation

**URL:** `http://localhost:3000/admin`  
**Login:** `/admin/login` → redirects to `/admin/dashboard`

---

## 🔐 Authentication

**File:** `store/adminAuthStore.ts`

| Field | Value |
|-------|-------|
| Username | `admin` |
| Password | `hfc2024` |

- Session stored in `sessionStorage` (not persisted across browser restarts)
- Protected routes redirect to `/admin/login` if not authenticated
- Admin layout wraps all `/admin/*` routes with auth guard

---

## 📐 Admin Panel Layout

**File:** `app/admin/layout.tsx`

```
┌─────────────────────────────────────────────────────────┐
│  [HFC Logo]  ADMIN PANEL              [🔔] [👤] [Logout]│
├──────────────┬──────────────────────────────────────────┤
│              │                                          │
│  Dashboard   │                                          │
│  Orders  🔴N │           Page Content Area              │
│  Products    │                                          │
│  Bills       │                                          │
│  Coupons     │                                          │
│  Agents      │                                          │
│  Settings    │                                          │
│              │                                          │
└──────────────┴──────────────────────────────────────────┘
```

- Fixed left sidebar with navigation icons + labels
- Active page highlighted in brand-red
- `Orders` tab shows pulsing red badge with unseen order count
- Responsive: sidebar collapses to bottom tab bar on mobile

---

## 📊 Dashboard Page

**URL:** `/admin/dashboard`  
**File:** `app/admin/dashboard/page.tsx`

### Date Range Filter
- Default: **Start of current month → Today**
- Optional: filter by specific delivery agent
- Reset button to return to defaults

### KPI Stat Cards (Top Row)

| Card | Metric | Source |
|------|--------|--------|
| Total Orders | Count of filtered orders | `filteredOrders.length` |
| Completed | Accepted + Ready + Picked-up + Delivered | status filter |
| Delivered | Only `delivered` status | status filter |
| Pending | Only `placed` status | status filter |
| Total Revenue | Sum of all order totals | `order.total` sum |
| Avg Order Value | Revenue / order count | calculated |
| New Today | Orders placed today with `placed` status | date + status filter |

### Agent Performance Table
- Lists all agents with their delivery stats for the date range
- Columns: Agent Name, Total Assigned, Delivered, Pending, Revenue Handled

### Recent Orders Table
- Last 10 orders (most recent first)
- Columns: Order ID, Customer, Type, Total, Status, Assigned Agent
- Click row → navigates to `/admin/orders/[orderId]`

---

## 📦 Orders List Page

**URL:** `/admin/orders`  
**File:** `app/admin/orders/page.tsx`

### Page Header Live Stats Chips

| Chip | Shows |
|------|-------|
| Orders Today | Count of today's orders |
| Pending | Count of `placed` status orders |
| Revenue Today | Sum of paid orders today |

### Status Filter Tabs

| Tab | Shows Orders With Status |
|-----|------------------------|
| Active | placed, accepted, ready, picked-up |
| New | placed |
| Accepted | accepted |
| Ready | ready |
| Out for Delivery | picked-up |
| Delivered | delivered |
| Cancelled | cancelled, rejected |
| All | everything |

### Search Bar
- Searches by: Order ID, Customer Name, Phone Number
- Phone search strips `+91` prefix and non-digits for flexible matching

### Advanced Filters
- From Date / To Date date range pickers
- Order Type: Dine-In / Takeaway / Delivery
- Payment Status: Unpaid / Paid

### Orders Table
- Pagination: 10 per page
- Columns: Order ID + time, Customer + phone, Type, Total, Payment, Status, Agent, Actions
- Row click → navigates to order detail

---

## 📋 Order Detail Page

**URL:** `/admin/orders/[orderId]`  
**File:** `app/admin/orders/[orderId]/page.tsx`

### Layout — 2-Column Grid

**Left Column (Order Info):**
- Order summary card: ID, date/time, order type, status badge
- Customer info: name, phone, address, GPS map link, landmark, notes
- Items table: product name, quantity, unit price, line total
- Totals breakdown: subtotal, GST, delivery charge, discount, **Total**
- Payment card: method, status, update controls

**Right Column (Action Panel):**
- **Card 5 — Update Order Status** buttons (one per status):
  - Accept Order (blue)
  - Mark Prepared (amber)
  - Out For Delivery (purple)
  - Mark Delivered (green)
  - Reject Order (red, small)
  - Cancel Order (gray, small)
- **Card 6 — Agent Assignment**:
  - Dropdown of active agents
  - "Notify agent" WhatsApp button (sends full delivery assignment message)
- **Card 7 — Payment Management**:
  - Payment method selector (Cash/UPI/Online/Card)
  - Payment status toggle (Unpaid/Paid/Partial)
- **Card 8 — Quick Actions**:
  - View tracker link (opens `/track/[orderId]`)
  - Duplicate order button
  - Mark as Regular Customer toggle
  - Resend WhatsApp link

---

## 🍽️ Products Page

**URL:** `/admin/products`  
**File:** `app/admin/products/page.tsx`

### Product Form (Add / Edit)

| Field | Type | Notes |
|-------|------|-------|
| Product Name | text | Required |
| Category | text | e.g. "Starters", "Mains", "Beverages" |
| Price (₹) | number | Required, min 0 |
| Description | textarea | Optional |
| Is Available | toggle | Shows/hides from customer menu |
| Image URL | text | Optional product image |

### Products Table
- Columns: Name, Category, Price, Available, Actions
- Toggle availability inline (no page reload)
- Edit opens inline edit form in the row
- Delete with inline confirmation band
- Category filter tabs auto-generated from existing categories

---

## 🧾 Bills Page

**URL:** `/admin/bills`  
**File:** `app/admin/bills/page.tsx`

### Overview
Bills are **auto-created** whenever an order is placed. Linked to orders via `orderId`.

### Bill Fields
| Field | Source |
|-------|--------|
| Bill No | Auto-generated (`BILL-[shortcode]`) |
| Order ID | Linked order |
| Customer Name | From order |
| Date | Order creation date |
| Items | From order |
| Subtotal / GST / Total | From order calculations |
| Payment Status | Synced with order payment status |

### Features
- Date range filter (default: current month)
- Search by bill number or customer name
- Payment status filter
- Columns: Bill No, Order ID, Customer, Date, Amount, Payment Status, Actions
- "Mark Paid" quick action
- "View Bill" → opens printable bill card

### Bills Summary Bar
- Total Bills count
- Total Revenue (all bills)
- Paid Revenue
- Unpaid Revenue

---

## 🎟️ Coupons & Offers Page

**URL:** `/admin/coupons`  
**File:** `app/admin/coupons/page.tsx`

*See [COUPONS_OFFERS.md](./COUPONS_OFFERS.md) for complete documentation.*

### 3 Sections on One Page:
1. **Auto-Reward Tiers** — Automatic loyalty discounts triggered by order value
2. **Coupons** — Manual discount codes customers enter at checkout
3. **Offers** — Free-item or bundled promotions shown to customers

---

## 🛵 Delivery Agents Page

**URL:** `/admin/agents`  
**File:** `app/admin/agents/page.tsx`

### Add Agent Form

| Field | Required | Notes |
|-------|----------|-------|
| Full Name | ✅ | Agent's display name (used in order assignment) |
| WhatsApp Number | ✅ | With country code, e.g. `919988776655` |
| Username | ✅ | Unique lowercase, used for agent login |
| Password | ✅ | Plain text (internal tool only) |
| Vehicle Type | Optional | Bike / Bicycle / Scooter / On Foot |
| Coverage Area | Optional | Text description |

### Agents Table

| Column | Notes |
|--------|-------|
| Agent | Name + vehicle type chip |
| Username | Login credential |
| WhatsApp | Clickable to open WhatsApp chat |
| Coverage Area | Delivery zone text |
| Deliveries | Total completed deliveries count |
| Status | Active (green) / Off Duty (gray) toggle |
| Actions | Edit (modal) / Delete (inline confirm) |

### Features
- **Active Status Toggle**: Inactive agents don't appear in order assignment dropdowns
- **Edit Modal**: Modify all fields including credentials and vehicle
- **Inline Delete**: Confirms before delete; automatically unassigns agent from active orders
- **Seed Agents** (pre-loaded): Rajesh Kumar (`rajesh`/`raj123`), Suresh Raina (`suresh`/`sur123`)

---

## ⚙️ Settings Page

**URL:** `/admin/settings`  
**File:** `app/admin/settings/page.tsx`

*See [SETTINGS.md](./SETTINGS.md) for complete documentation.*

### 7 Settings Cards:
1. License & Verification
2. Branding
3. GST Configuration
4. Delivery & Payment
5. WhatsApp Auto-send
6. Delivery Areas
7. Subscription Plans

---

## 🔔 Notification System

The admin panel includes a real-time notification indicator:

- Sidebar Orders icon shows a **pulsing red badge** with count of unseen orders
- When admin visits `/admin/orders`, all current orders are marked `seenByAdmin: true`
- New orders from customers (status: `placed`, `seenByAdmin: false`) trigger the badge
- Badge auto-updates as `orderStore` is reactive

---

## 📱 Responsive Behavior

| Screen Size | Layout |
|-------------|--------|
| Desktop (lg+) | Fixed left sidebar + content area |
| Tablet (md) | Collapsible sidebar with hamburger |
| Mobile (sm) | Bottom navigation bar |
