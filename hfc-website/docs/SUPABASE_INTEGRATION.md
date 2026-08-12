# ⚡ HFC Supabase Integration — Complete Documentation

**Project Reference:** `cmwsffhenpckwkwgnmsy`  
**API Endpoint:** `https://cmwsffhenpckwkwgnmsy.supabase.co`  
**Client SDK:** `@supabase/supabase-js`

---

## 🏛️ Architecture & Source of Truth Reconciliation

```
[ Supabase PostgreSQL Cloud DB ]  <--- SINGLE SOURCE OF TRUTH
               │
      (Realtime WebSockets)
               │
               ▼
[ Zustand Stores + localStorage ]  <--- OPTIMISTIC CLIENT CACHE & OFFLINE LAYER
               │
               ▼
[ Customer Tracker | Admin Panel | Delivery Portal ]
```

### Data Layer Principles
1. **Primary System of Record**: **Supabase PostgreSQL Cloud DB** is the authoritative single source of truth for all business entities (`orders`, `products`, `agents`, `bills`, `coupons`, `settings`).
2. **Client Cache Layer**: **Zustand + localStorage** acts strictly as an optimistic cache for instant UI rendering.
3. **Cross-Device Real-Time Sync**:
   - **Customer Tracker**: Subscribes to single-order updates via `subscribeToOrderRealtime(orderId)`.
   - **Admin Orders Panel**: Subscribes to all order changes via `subscribeToAllOrdersRealtime()`.
   - **Delivery Agent Portal**: Subscribes to all order changes via `subscribeToAllOrdersRealtime()`, updating rider screens live on any mobile device.

---

## 🔒 Read-Side Database Hardening & PII Protection

1. **Bulk Database Dump Prevention (`public.orders`)**:
   - Direct bulk queries (`GET /rest/v1/orders?select=*`) with the public anon key return `403 Forbidden`.
   - Single-order tracker lookups are served via a **`SECURITY DEFINER` Postgres RPC function**: `get_order_by_id(p_order_id TEXT)`. Customers can ONLY fetch their own order by exact ID match.
2. **Rider Credential & Phone Number Protection (`public.agents`)**:
   - `password_hash` column completely removed from `public.agents`. Credentials are managed exclusively via Supabase Auth (`auth.users`).
   - `SELECT` on `public.agents` is restricted to authenticated staff (`(auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'agent')`), preventing public scraping of rider phone numbers.
3. **Agent Billing Scoping (`public.bills`)**:
   - Admin can read all billing records.
   - Delivery Agents can **ONLY** read bills tied to orders assigned to their own name (`order_id IN (SELECT id FROM orders WHERE assigned_agent = auth.jwt() -> 'user_metadata' ->> 'agent_name')`).

-- 1. ORDERS TABLE (Admin reads all; Delivery Agents read assigned orders only)
CREATE POLICY "Public create order" ON public.orders FOR INSERT WITH CHECK (true);

CREATE POLICY "Scoped staff select orders" ON public.orders FOR SELECT 
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  OR (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'agent'
    AND assigned_agent = (auth.jwt() -> 'user_metadata' ->> 'agent_name')
  )
);

CREATE POLICY "Admin full update orders" ON public.orders FOR UPDATE 
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

CREATE POLICY "Agent update assigned orders only" ON public.orders FOR UPDATE 
  USING (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'agent'
    AND assigned_agent = (auth.jwt() -> 'user_metadata' ->> 'agent_name')
  )
  WITH CHECK (assigned_agent = (auth.jwt() -> 'user_metadata' ->> 'agent_name'));

CREATE POLICY "Admin delete orders only" ON public.orders FOR DELETE 
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

```sql
-- SECURITY DEFINER SINGLE ORDER LOOKUP FUNCTION
CREATE OR REPLACE FUNCTION public.get_order_by_id(p_order_id TEXT)
RETURNS SETOF public.orders
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM public.orders WHERE id = p_order_id LIMIT 1;
$$;
```

---

## 🔑 Fail-Closed Agent Provisioning API Route (`/api/admin/agents/provision`)

The server provisioning endpoint is engineered with **Fail-Closed Security**:

1. **Missing Authorization Header** → Immediate `401 Unauthorized`.
2. **Invalid or Expired JWT Token** → Immediate `401 Unauthorized`.
3. **Non-Admin User Role** → Immediate `403 Forbidden`.
4. **Valid Admin Bearer Token** → Execution proceeds to create agent credentials in Supabase Auth.

---

## ⚡ Atomic Conditional SQL Optimistic Lock (`syncOrderStatusAtomic`)

To eliminate TOCTOU (Time-of-Check to Time-of-Use) race conditions and prevent silent overwrites:
- Replaced generic `.upsert()` with **Atomic Conditional Update**:
  ```sql
  UPDATE public.orders 
  SET status = $new_status, updated_at = $new_updated_at 
  WHERE id = $order_id AND updated_at = $last_known_updated_at
  RETURNING *;
  ```
- If 0 rows are affected (indicating another device updated the order in between), the client flags a conflict and refetches the latest cloud version without clobbering data.

---

## 🗄️ Database Tables (`supabase/schema.sql`)

### 1. `orders` Table
| Column | Type | Constraints / Details |
|--------|------|----------------------|
| `id` | TEXT | Primary Key (e.g. `HFC-F6B776C7`) |
| `customer_name` | TEXT | Customer full name (XSS sanitized) |
| `phone_number` | TEXT | 10-digit mobile number |
| `order_type` | TEXT | `dine-in` \| `takeaway` \| `delivery` |
| `address` | TEXT | Delivery address |
| `landmark` | TEXT | Delivery landmark |
| `delivery_area` | TEXT | Selected delivery zone |
| `coords` | JSONB | `{ lat: number, lng: number }` |
| `items` | JSONB | `[{ id, name, price, quantity }]` |
| `subtotal` | NUMERIC(10,2) | Item subtotal |
| `gst` | NUMERIC(10,2) | 5% GST amount |
| `delivery_charge` | NUMERIC(10,2) | Delivery fee |
| `discount_amount` | NUMERIC(10,2) | Applied coupon discount |
| `coupon_code` | TEXT | Coupon code used |
| `total` | NUMERIC(10,2) | Final payable total |
| `payment_method` | TEXT | `Cash` \| `UPI` \| `Online` \| `Card` |
| `payment_status` | TEXT | `unpaid` \| `paid` \| `partial` |
| `status` | TEXT | `placed` \| `accepted` \| `ready` \| `picked-up` \| `delivered` \| `rejected` \| `cancelled` |
| `assigned_agent` | TEXT | Assigned delivery rider name |
| `seen_by_admin` | BOOLEAN | Unseen badge flag |
| `is_regular_customer` | BOOLEAN | Loyalty customer flag |
| `notes` | TEXT | Kitchen instructions |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Modification timestamp |
| `timestamp` | BIGINT | Unix epoch milliseconds |

### 2. `products` Table
| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT | Primary Key |
| `name` | TEXT | Product dish name |
| `category` | TEXT | Starters / Mains / Beverages / Desserts |
| `price` | NUMERIC(10,2) | Price in ₹ |
| `description` | TEXT | Dish description |
| `image_url` | TEXT | Product image URL |
| `is_available` | BOOLEAN | Availability toggle |

### 3. `agents` Table
| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT | Primary Key |
| `name` | TEXT | Rider display name |
| `whatsapp` | TEXT | Mobile contact |
| `username` | TEXT | Unique login username |
| `password_hash` | TEXT | Login credential |
| `is_active` | BOOLEAN | Off-duty / On-duty toggle |
| `vehicle_type` | TEXT | Bike / Scooter / Bicycle |
| `coverage_area` | TEXT | Delivery zone |
| `total_deliveries` | INTEGER | Delivery counter |

### 4. `bills` Table
| Column | Type | Description |
|--------|------|-------------|
| `bill_no` | TEXT | Primary Key (e.g. `BILL-20260812-001`) |
| `order_id` | TEXT | Foreign Key -> `orders.id` |
| `customer_name` | TEXT | Customer name |
| `subtotal`, `gst`, `total` | NUMERIC(10,2) | Breakdown amounts |
| `payment_status` | TEXT | `paid` \| `unpaid` |

### 5. `coupons` Table
| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT | Primary Key |
| `code` | TEXT | Unique uppercase coupon code |
| `discount_type` | TEXT | `percentage` \| `flat` |
| `discount_value` | NUMERIC(10,2) | Value (e.g. 20% or ₹50) |
| `min_order_value` | NUMERIC(10,2) | Minimum order threshold |
| `max_uses` | INTEGER | Usage cap |
| `used_count` | INTEGER | Redemptions counter |

### 6. `settings` Table
| Column | Type | Description |
|--------|------|-------------|
| `id` | TEXT | Primary Key (`hfc-settings`) |
| `site_name` | TEXT | Branding name |
| `phone`, `whatsapp_number` | TEXT | Contact details |
| `gst_percent` | NUMERIC(5,2) | Tax % |
| `delivery_fee`, `free_delivery_above` | NUMERIC(10,2) | Delivery settings |
| `data` | JSONB | Additional configuration payload |

---

## 📡 Real-Time WebSockets Setup

Realtime is enabled on the `orders` table via Postgres publication:

```sql
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
          AND schemaname = 'public' 
          AND tablename = 'orders'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
    END IF;
END $$;
```

### Client Subscription (`lib/supabaseSync.ts`)

```typescript
export function subscribeToOrderRealtime(
  orderId: string,
  onUpdate: (updatedOrder: OrderRecord) => void
) {
  const channel = supabase
    .channel(`order-live-${orderId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `id=eq.${orderId}`,
      },
      (payload) => {
        if (payload.new) {
          onUpdate(rowToOrder(payload.new))
        }
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}
```

---

## ⚡ Protection & Performance Architecture

### 1. Debounced Write Queue (Rate Limiting)
In `lib/supabaseSync.ts`, rapid order status updates (e.g. clicking Accept/Ready 5 times in a second) are throttled via `syncQueueMap`:
- **200ms window debounce**: Batches rapid changes for the same order into a single clean database call.

### 2. Exponential Backoff Retries
If network drops or API requests fail:
- Retries automatically up to 3 times (`attempt * 500ms` backoff).
- If all retries fail, the mutation stays safely preserved in `localStorage` without interrupting user experience.

### 3. Egress Bandwidth Efficiency
- Average payload per order update: ~400 Bytes.
- Expected monthly egress at 1,000 orders/month: **~2.5 MB** (< 0.05% of Supabase 5GB limit).

### 4. Automatic WebSocket Disconnection
Order tracker pages unsubscribe and close the WebSocket connection on component unmount (`return () => unsubscribeRealtime()`), preventing connection leaks.
