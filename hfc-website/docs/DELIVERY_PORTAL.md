# 🛵 HFC Delivery Agent Portal — Complete Documentation

**URL:** `http://localhost:3000/agent`  
**Login:** `/agent/login`

---

## Overview

The Delivery Agent Portal is a **lightweight, mobile-first** interface for HFC delivery riders. It is completely separate from the admin panel but reads from the same `orderStore` and `agentsStore` (shared localStorage).

**Key principle:** Agents see **only their own assigned orders** — filtered by `order.assignedAgent === agent.name`.

---

## 🔐 Authentication

**Store:** `store/agentAuthStore.ts`  
**Seeded from:** `store/agentsStore.ts`

### Login Flow

1. Agent navigates to `/agent/login`
2. Enters username + password
3. `agentAuthStore.login()` validates against `agentsStore.agents`
4. On success: agent ID stored in `sessionStorage` (`hfc-agent-session`)
5. Redirected to `/agent/orders`

### Validation Logic

```typescript
login(username, password) {
  const cleanUsername = username.trim().toLowerCase()
  const cleanPassword = password.trim()

  const agent = agents.find(
    a => a.username.trim().toLowerCase() === cleanUsername
  )

  if (!agent || agent.password.trim() !== cleanPassword) {
    return { success: false, error: 'Incorrect username or password.' }
  }

  if (!agent.isActive) {
    return { success: false, error: 'Account inactive. Contact HFC admin.' }
  }

  sessionStorage.setItem('hfc-agent-session', agent.id)
  set({ isAuthenticated: true, loggedInAgentId: agent.id })
  return { success: true }
}
```

### Session Persistence
- Uses `sessionStorage` (not `localStorage`) — session clears when tab is closed
- `checkSession()` is called in the agent layout on mount to restore session

### Seed Agent Credentials

| Agent | Username | Password | Vehicle | Coverage Area |
|-------|----------|----------|---------|---------------|
| Rajesh Kumar | `rajesh` | `raj123` | Bike | Maruthi Nagar, Labour Colony |
| Suresh Raina | `suresh` | `sur123` | Scooter | Sarojinidevi, Flat Area |

---

## 📐 Portal Layout

**File:** `app/agent/layout.tsx`

```
┌───────────────────────────────────────────┐
│ HFC  🛵 Delivery Portal    [Agent Name ▾] │
├───────────────────────────────────────────┤
│                                           │
│  [My Orders]    [My Report]               │
│  ──────────────────────────               │
│                                           │
│           Page Content Area              │
│                                           │
└───────────────────────────────────────────┘
```

- Simple top bar: HFC logo, portal label, agent name + logout
- Tab navigation: My Orders / My Report
- Auth guard: redirects to `/agent/login` if not authenticated

---

## 📋 My Orders Page

**URL:** `/agent/orders`  
**File:** `app/agent/orders/page.tsx`

### Order Filtering

Orders are filtered by: `order.assignedAgent === agent.name`

Only orders explicitly assigned to the logged-in agent appear here.

### Status Filter Tabs

| Tab | Shows Orders With Status |
|-----|------------------------|
| **New Assignments** | `accepted` OR `ready` (both are actionable) |
| **Out for Delivery** | `picked-up` |
| **Delivered** | `delivered` |
| **All** | All agent's orders |

> ⚠️ **Important:** "New Assignments" shows both `accepted` AND `ready` orders because admin may mark an order Ready before the agent starts the delivery. Both statuses trigger the "Start Delivery" button.

### Date Filter
- From/To date pickers
- Filters by `order.createdAt` date
- Reset Dates button clears the filter

### Orders Table

| Column | Notes |
|--------|-------|
| Order | ID + date/time |
| Customer | Name + phone (clickable to call) |
| Address | Delivery address + "Open map" link if GPS available |
| Total | Order total in ₹ |
| Payment | Method + Paid/Unpaid status |
| Status | AdminBadge component with color coding |
| Actions | Status-dependent action buttons (see below) |

### Action Buttons (Status-Dependent)

| Current Status | Button Shown | Action |
|---------------|--------------|--------|
| `accepted` | 🟣 **Start Delivery** | Sets `status = 'picked-up'` |
| `ready` | 🟣 **Start Delivery** | Sets `status = 'picked-up'` |
| `picked-up` | 🟢 **Mark Delivered** | Triggers cash confirmation (if Cash) |
| `delivered` | 🔴 **View Bill** | Opens `/track/[orderId]` in new tab |

### Cash Collection Confirmation

When agent clicks "Mark Delivered" on a Cash order:

```
┌──────────────────────────────────────────────────────────┐
│ ⚠️ Confirm ₹XXX.XX cash collected for order HFC-XXXXX?  │
│                                                          │
│  [Confirm]   [Not yet]                                   │
└──────────────────────────────────────────────────────────┘
```

On "Confirm":
1. `updateOrderStatus(orderId, 'delivered')` → also auto-flips `paymentStatus` to `paid` (via store logic)
2. `updatePaymentStatus(orderId, 'paid')` (redundant safety call)
3. Toast: "Delivered ✓ Payment marked as Paid"
4. Bills store synced automatically

---

## 📈 My Report Page

**URL:** `/agent/report`  
**File:** `app/agent/report/page.tsx`

### Overview
A personal performance summary for the logged-in agent — **read-only**, no actions.

### Date Range Filter

**Component:** `components/agent/report/ReportDateFilter.tsx`

| Field | Default |
|-------|---------|
| From | Start of current month |
| To | Today |

"Filter" button applies the range. "Reset" clears to defaults.

### 3 Stat Cards

**Component:** `components/agent/report/ReportStatCards.tsx`

| Card | Metric |
|------|--------|
| 📦 Assigned Orders | Total orders assigned to agent in date range |
| ✅ Delivered | Orders with `status === 'delivered'` in range |
| 💰 Delivered Value | Sum of `order.total` for delivered orders |

### Report Table

**Component:** `components/agent/report/ReportOrdersTable.tsx`

All orders assigned to the agent in the date range, sorted by date descending.

| Column | Contents |
|--------|----------|
| Order ID | HFC-XXXXX |
| Date | Formatted date + time |
| Customer | Customer name |
| Total | Order total |
| Status | Delivered / Other |

---

## 🔒 Security Considerations

> **Note:** This is an internal tool — security is MVP-level.

| Concern | Current Approach |
|---------|-----------------|
| Password storage | Plain text in `agentsStore` (persisted to localStorage) |
| Session management | `sessionStorage` (tab-scoped) |
| Route protection | Client-side redirect in layout.tsx |
| Data isolation | Filtered by `agent.name` — no server-side enforcement |

**Recommended improvements for production:**
- Hash passwords (bcrypt)
- Use JWT or server-side sessions
- Move to a proper backend API with role-based access control

---

## 📱 Mobile Optimization

The agent portal is designed to be used primarily on **smartphones** while riding:

- Large tap targets (buttons min 44px height)
- High contrast status colors
- Phone numbers are clickable `tel:` links
- Map links open Google Maps directly
- Simple tab navigation (no nested menus)
- Clean white background (readable in sunlight)
