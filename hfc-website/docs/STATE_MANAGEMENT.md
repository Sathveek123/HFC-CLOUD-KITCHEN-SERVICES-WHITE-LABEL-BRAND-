# 🗄️ HFC State Management — Zustand & Supabase Architecture

## Source of Truth Reconciliation

- **Supabase Cloud Database (PostgreSQL)** is the **Primary System of Record (Single Source of Truth)**.
- **Zustand + localStorage** acts strictly as an **Optimistic Client Cache & Offline Layer**.
- All mutations update local state instantly for 0ms UI lag, then push to Supabase via `lib/supabaseSync.ts`.
- All three surfaces (Customer Tracker, Admin Panel, Delivery Agent Portal) subscribe to Supabase Realtime WebSockets (`subscribeToAllOrdersRealtime` / `subscribeToOrderRealtime`) for sub-second cross-device sync.

---

## 📦 orderStore.ts

**Key:** `hfc-orders`  
**Role:** Client optimistic store & cache for orders

### `OrderRecord` Type

```typescript
interface OrderRecord {
  id: string                  // Collision-proof via crypto.randomUUID() e.g. "HFC-F6B776C7"
  customerName: string
  phoneNumber: string          // Canonical phone field (sanitized)
  orderType: 'dine-in' | 'takeaway' | 'delivery'
  address?: string             // Canonical address field (sanitized)
  landmark?: string            // Sanitized landmark
  deliveryArea?: string | null
  coords?: { lat: number; lng: number }  // Canonical GPS field
  items: { id: string; name: string; price: number; quantity: number }[]
  subtotal: number
  gst: number
  deliveryCharge: number       // Required, default 0
  discountAmount: number       // Required, default 0
  couponCode?: string | null
  total: number
  paymentMethod: 'Cash' | 'UPI' | 'Online' | 'Card'  // Required, default 'Cash'
  paymentStatus: 'unpaid' | 'paid' | 'partial'
  status: OrderStatus
  assignedAgent: string | null  // Required, default null
  seenByAdmin: boolean          // Required, default false
  isRegularCustomer: boolean    // Required, default false
  notes?: string | null
  createdAt: string           // ISO string
  updatedAt: string           // ISO string (always set on write)
  timestamp: number           // Unix ms (always set on write)
}

type OrderStatus = 'placed' | 'accepted' | 'ready' | 'picked-up' | 'delivered' | 'rejected' | 'cancelled'
```

### Store Helper Utilities

| Utility | Description |
|---------|-------------|
| `generateOrderId()` | Generates an 8-char crypto-random uppercase ID (`HFC-F6B776C7`) using `crypto.randomUUID()` with a safe `Math.random()` string fallback for non-HTTPS/older engines. |
| `sanitizeInput(str)` | Escapes HTML entity characters (`<`, `>`, `"`, `'`) for XSS defense-in-depth. |

### Actions

| Action | Signature | Notes |
|--------|-----------|-------|
| `addOrder` | `(order) => void` | Also creates bill; populates defaults for required fields |
| `updateOrderStatus` | `(id, status) => void` | COD auto-pay built in for `delivered` (delivery orders only) |
| `updatePaymentStatus` | `(id, paymentStatus) => void` | Syncs to billsStore |
| `updatePaymentMethod` | `(id, method) => void` | |
| `assignAgent` | `(id, agentName \| null) => void` | |
| `cancelOrder` | `(id) => void` | Sets status to `cancelled` |
| `markSeenByAdmin` | `(ids: string[]) => void` | Batch mark seen |
| `markAsSeen` | `(id) => void` | Single mark seen |
| `addToRegularCustomers` | `(id) => void` | Writes to `hfc-regular-customers` localStorage |
| `duplicateOrder` | `(id) => OrderRecord \| undefined` | Creates copy with new collision-proof ID + `placed` status |
| `clearOrders` | `() => void` | Wipe all orders |
| `getOrderById` | `(id) => OrderRecord \| undefined` | Used by order tracker polling |
| `setHasHydrated` | `(val: boolean) => void` | Called by `onRehydrateStorage` when store is ready |

### COD Auto-Pay Guard (Inside `updateOrderStatus`)

```typescript
updateOrderStatus(id, status) {
  const order = get().orders.find(o => o.id === id)
  if (!order) return

  // COD auto-pay guard:
  // ONLY auto-flip to 'paid' for DELIVERY orders (cash collected at door).
  // Dine-in and takeaway are counter payments — admin marks paid separately.
  const isDeliveryOrder = order.orderType === 'delivery'
  const isDeliveredStatus = status === 'delivered'
  const isCashPayment = order.paymentMethod === 'Cash'
  const isUnpaid = order.paymentStatus !== 'paid'
  const autoPayment = isDeliveredStatus && isDeliveryOrder && isCashPayment && isUnpaid

  // If auto-pay triggered, also flip paymentStatus to 'paid' and sync to billsStore
}
```

### Archive System
- Orders are capped at **500 in active store**
- When exceeding 500, oldest 100 are moved to `hfc-orders-archive` (localStorage)
- Archive capped at 1000 entries

---

## 👤 agentsStore.ts

**Key:** `hfc-agents`  
**Role:** Delivery agent accounts (created by admin, used for agent login)

### `Agent` Type

```typescript
interface Agent {
  id: string
  name: string            // Display name (used in order.assignedAgent)
  whatsapp: string        // Numeric with country code: "919876543210"
  username: string        // Unique lowercase login credential
  password: string        // Plain text (internal tool only)
  isActive: boolean       // false = Off Duty, hidden from assignment dropdowns
  vehicleType: 'bike' | 'bicycle' | 'scooter' | 'on-foot' | null
  coverageArea: string | null
  createdAt: string
  totalDeliveries: number
}
```

### Seed Agents (Pre-Loaded)

```typescript
const seedAgents = [
  { id: 'ag-1', name: 'Rajesh Kumar', username: 'rajesh', password: 'raj123', ... },
  { id: 'ag-2', name: 'Suresh Raina', username: 'suresh', password: 'sur123', ... },
]
```

### Actions

| Action | Notes |
|--------|-------|
| `addAgent` | Creates new agent with auto ID |
| `updateAgent(id, updates)` | Patch any fields |
| `deleteAgent(id)` | Remove permanently |
| `toggleAgentActive(id)` | Flip isActive boolean |
| `incrementDeliveries(id)` | +1 to totalDeliveries |
| `isUsernameAvailable(username, excludeId?)` | Uniqueness check |
| `getActiveAgents()` | Returns only `isActive: true` agents |
| `getAgentByUsername(username)` | Used in auth flow |

---

## 🔑 agentAuthStore.ts

**Key:** None (not persisted — uses `sessionStorage`)  
**Role:** Agent authentication session management

### State

```typescript
{
  isAuthenticated: boolean
  loggedInAgentId: string | null
}
```

### Actions

| Action | Notes |
|--------|-------|
| `login(username, password)` | Returns `{ success, error? }` |
| `logout()` | Clears sessionStorage + state |
| `checkSession()` | Restores from sessionStorage on mount |
| `getLoggedInAgent()` | Returns full Agent object from agentsStore |

---

## 🔑 adminAuthStore.ts

**Key:** None (not persisted)  
**Role:** Admin authentication session

### Credentials
```typescript
const ADMIN_USERNAME = 'admin'
const ADMIN_PASSWORD = 'hfc2024'
```

---

## 🛒 cartStore.ts

**Key:** `hfc-cart`  
**Role:** Shopping cart (customer side)

### State

```typescript
{
  items: CartItem[]    // { id, name, price, quantity }
  isOpen: boolean      // Drawer visibility
}
```

### Actions

| Action | Notes |
|--------|-------|
| `addItem(product)` | Adds or increments quantity |
| `removeItem(id)` | Removes item entirely |
| `updateQuantity(id, qty)` | Set specific quantity (0 = remove) |
| `clearCart()` | Empty cart after order placed |
| `openCart()` / `closeCart()` | Drawer toggle |
| `getSubtotal()` | Sum of item.price × item.quantity |

---

## 📋 productsStore.ts

**Key:** `hfc-products`  
**Role:** Menu product catalog

### `Product` Type

```typescript
interface Product {
  id: string
  name: string
  category: string     // e.g. "Starters", "Mains", "Beverages"
  price: number
  description?: string
  imageUrl?: string
  isAvailable: boolean
  createdAt: string
}
```

### Actions
- `addProduct`, `updateProduct`, `deleteProduct`
- `toggleAvailability(id)` — immediate hide/show from customer menu
- `getProductsByCategory()` — for category tab filtering

---

## 🎟️ couponsStore.ts

**Key:** `hfc-coupons`  
**Role:** Discount coupon management

### `Coupon` Type

```typescript
interface Coupon {
  id: string
  code: string           // e.g. "WELCOME20"
  discountType: 'percentage' | 'flat'
  discountValue: number  // e.g. 20 (%) or 50 (₹)
  minOrderValue: number  // Minimum subtotal required
  maxUses: number | null // null = unlimited
  usedCount: number
  isActive: boolean
  applicableOrderTypes: ('dine-in' | 'takeaway' | 'delivery')[]
  expiresAt: string | null
  createdAt: string
}
```

### Key Action: `validateCoupon`

```typescript
validateCoupon(code, subtotal, orderType) => {
  isValid: boolean
  discountAmount: number
  error?: string
}
```

Checks:
1. Code exists and `isActive`
2. `usedCount < maxUses` (or unlimited)
3. `subtotal >= minOrderValue`
4. Not expired
5. `orderType` in `applicableOrderTypes`
6. Calculates: percentage → `(discountValue/100) * subtotal`, flat → `discountValue`

---

## 🎁 promotionsStore.ts

**Key:** `hfc-promotions`  
**Role:** Reward tiers and promotional offers

### Types

```typescript
interface RewardTier {
  id: string
  name: string
  minOrderValue: number
  rewardDescription: string
  rewardType: 'discount' | 'free-item' | 'other'
  rewardValue: number
  isActive: boolean
}

interface Offer {
  id: string
  title: string
  description: string
  offerType: 'free-item' | 'bundle' | 'bogo' | 'other'
  minOrderValue: number
  isActive: boolean
  validFrom: string | null
  validTo: string | null
  imageUrl?: string
}
```

---

## 🧾 billsStore.ts

**Key:** `hfc-bills`  
**Role:** Invoices/bills linked to orders

### Auto-Creation
Every `orderStore.addOrder()` call automatically creates a corresponding bill via:
```typescript
const { useBillsStore } = require('./billsStore')
useBillsStore.getState().createBill(order)
```

### Sync
- `orderStore.updatePaymentStatus()` → syncs to linked bill
- `orderStore.updateOrderStatus('delivered')` on COD → syncs to linked bill

---

## ⚙️ settingsStore.ts

**Key:** `hfc-settings`  
**Role:** Business configuration (drives live site behavior)

### Settings Schema

```typescript
interface Settings {
  // License
  licenseKey: string
  licenseStatus: 'active' | 'inactive' | 'trial'
  
  // Branding
  siteName: string
  tagline: string
  phone: string
  whatsappNumber: string
  email: string
  address: string
  logoUrl: string
  
  // GST
  gstEnabled: boolean
  gstPercentage: number
  gstNumber: string
  
  // Delivery & Payment
  deliveryEnabled: boolean
  deliveryCharge: number
  freeDeliveryAbove: number
  upiId: string
  cashEnabled: boolean
  upiEnabled: boolean
  
  // WhatsApp Auto-send
  whatsappAutoSend: boolean
  autoSendOnPlaced: boolean
  autoSendOnAccepted: boolean
  autoSendOnDelivered: boolean
  
  // Delivery Areas
  deliveryAreas: DeliveryArea[]
  
  // Subscription Plans
  subscriptionPlans: SubscriptionPlan[]
}
```
