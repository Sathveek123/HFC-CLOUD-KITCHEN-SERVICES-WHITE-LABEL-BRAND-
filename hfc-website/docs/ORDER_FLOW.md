# 🔄 HFC Order Flow — End-to-End Documentation

## Complete Order Lifecycle

```
Customer Website → Admin Panel → Delivery Agent Portal → Order Tracker
```

---

## 📊 Order Status Progression

```
placed → accepted → ready → picked-up → delivered
                                ↘
                            (dine-in/takeaway skips "picked-up")
                                ↗
                              ready → delivered

At any point: → rejected | cancelled
```

### Status Definitions

| Status | Who Sets It | Meaning |
|--------|-------------|---------|
| `placed` | Customer (auto) | Order created, awaiting admin review |
| `accepted` | Admin | Admin confirmed and will prepare |
| `ready` | Admin | Food is prepared, ready for pickup/dispatch |
| `picked-up` | Admin or Agent | Delivery agent has picked up the order |
| `delivered` | Admin or Agent | Order delivered to customer |
| `rejected` | Admin | Order declined (out of stock, wrong area, etc.) |
| `cancelled` | Admin | Order cancelled after placement |

---

## 🔄 Step-by-Step Flow

### Step 1 — Customer Places Order

```
Browser: http://localhost:3000/
```

1. Customer browses menu, adds items to cart
2. Cart drawer opens (item review step)
3. Customer enters name, phone, order type, address (sanitized via `sanitizeInput`)
4. Optional: applies coupon code
5. Clicks **"💬 Send Order via WhatsApp"**
   - Generates collision-proof Order ID via `crypto.randomUUID()` e.g. `HFC-F6B776C7`
   - WhatsApp opens in new tab with formatted order text
   - Cart drawer shows confirmation screen: *"WhatsApp is open! Tap Send in WhatsApp to submit your order."*
6. Customer clicks **"✓ Yes, I sent the message"**

**System Actions (On Confirmation):**
- `orderStore.addOrder()` creates order with `status: 'placed'`
- `billsStore.createBill()` auto-creates a linked bill
- Cart cleared, drawer closes
- Browser redirects to `/track/[orderId]`

---

### Step 2 — Admin Receives Order

```
Browser: http://localhost:3000/admin/orders
```

- New order appears at top of Active orders tab
- Unseen orders have a pulsing red dot indicator
- Admin can see order details: customer info, items, total, payment method

**Admin Actions Available:**
| Button | Sets Status To |
|--------|---------------|
| Accept Order | `accepted` |
| Mark Prepared | `ready` |
| Out For Delivery | `picked-up` |
| Mark Delivered | `delivered` |
| Reject Order | `rejected` |
| Cancel Order | `cancelled` |

---

### Step 3 — Admin Assigns Delivery Agent (Delivery Orders Only)

```
Browser: http://localhost:3000/admin/orders/[orderId]
```

1. Admin opens order detail page
2. Selects agent from the **AgentDropdown** (shows only `isActive` agents)
3. `orderStore.assignAgent(orderId, agentName)` stores the assignment
4. Optional: clicks **"Notify agent"** → WhatsApp message to agent's phone with full delivery details

---

### Step 4 — Admin Marks Order Ready

```
Admin clicks "Mark Prepared" button
→ order.status = 'ready'
→ Agent sees order appear in "New Assignments" tab
```

---

### Step 5 — Agent Picks Up and Delivers

```
Browser: http://localhost:3000/agent/orders
```

Agent logs in → My Orders page:

1. Clicks **"Start Delivery"** → `status = 'picked-up'`
2. Drives to customer, collects payment
3. Clicks **"Mark Delivered"**
   - If Cash payment: inline confirmation appears ("Confirm ₹XXX cash collected?")
   - On confirm: `status = 'delivered'` AND `paymentStatus = 'paid'` (auto-flip)
   - Bills store synced automatically

---

### Step 6 — Customer Sees Delivered Status

```
Browser: http://localhost:3000/track/[orderId]
→ Polls every 6 seconds
→ All 5 stepper stages now filled green
→ Payment block shows "Cash Payment Received ✓"
```

---

## 💰 Payment Flow

### COD (Cash on Delivery) — Most Common

```
Order placed → paymentStatus: 'unpaid'
Agent delivers, cash collected → paymentStatus: 'paid'  ← AUTO via updateOrderStatus
```

**Auto-pay Logic (Built Into `orderStore.updateOrderStatus`):**
```typescript
// When status becomes 'delivered' for HOME DELIVERY orders:
if (status === 'delivered' && order.orderType === 'delivery' && paymentMethod === 'Cash' && paymentStatus !== 'paid') {
  paymentStatus = 'paid'  // auto-flip
  billsStore.syncPayment()  // also sync to bills
}
```

> **Guard:** Counter payments (dine-in / takeaway) are not auto-flipped to paid — admin manages counter payments separately.

### UPI Payment

```
Customer receives WhatsApp → UPI deep link included
Customer pays via PhonePe/GPay/Paytm → sends screenshot to admin
Admin manually updates paymentStatus to 'paid' in order detail
```

### Payment Statuses

| Status | Meaning |
|--------|---------|
| `unpaid` | Payment not yet collected |
| `paid` | Payment confirmed |
| `partial` | Partial payment (edge case) |

---

## 🎟️ Coupon Integration in Order Flow

```
CartDrawer: Customer enters coupon code
  ↓
couponsStore.validateCoupon(code, subtotal, orderType)
  ↓
Returns: { isValid, discountAmount, error? }
  ↓
If valid: discount applied to total calculation
If invalid: error message shown
  ↓
On order placement: couponsStore.incrementUsedCount(code)
Order saved with: couponCode, discountAmount
```

---

## 🏷️ Order ID Format

Orders use a collision-proof 8-character hex code generated via native `crypto.randomUUID()`:

```typescript
export function generateOrderId(): string {
  const uid = crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()
  return `HFC-${uid}`
}
// Example: HFC-F6B776C7, HFC-3A9D12B4
```

---

## 📊 Auto-Bill Creation

Every time a new order is placed, a corresponding bill is **automatically created** in `billsStore`:

```typescript
// Inside orderStore.addOrder():
const { useBillsStore } = require('./billsStore')
useBillsStore.getState().createBill(order)
```

Bills are linked to orders via `orderId`. Payment status changes sync bidirectionally:
- `orderStore.updatePaymentStatus()` → syncs to `billsStore`
- `orderStore.updateOrderStatus('delivered')` on COD → syncs to `billsStore`

---

## ⚡ Real-Time Sync Architecture

Real-time sync across all surfaces is powered by **Supabase Realtime WebSockets**:

| Surface | Sync Mechanism | Latency |
|---------|----------------|---------|
| **Customer Tracker** (`/track/[orderId]`) | `subscribeToOrderRealtime(orderId)` | **< 0.5s (Sub-second)** |
| **Admin Panel** (`/admin/orders`) | `subscribeToAllOrdersRealtime()` | **< 0.5s (Sub-second)** |
| **Delivery Agent Portal** (`/agent/orders`) | `subscribeToAllOrdersRealtime()` | **< 0.5s (Sub-second)** |

**Cross-Device Live Behavior:**
- When an admin on a laptop accepts or marks an order ready, the delivery agent's phone updates **instantly** (< 0.5s).
- When a rider on a motorcycle marks an order delivered, the customer's phone tracker and admin dashboard update **instantly** without polling.
- If network connection drops, local storage maintains state, automatically syncing when reconnected.
