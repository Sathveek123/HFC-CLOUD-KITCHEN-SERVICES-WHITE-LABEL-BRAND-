-- ══════════════════════════════════════════════════════════════════════════════
-- HFC CLOUD KITCHEN — SUPABASE DATABASE SCHEMA & REALTIME SETUP
-- Project: cmwsffhenpckwkwgnmsy
-- ══════════════════════════════════════════════════════════════════════════════

-- 1. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,                       -- e.g. "HFC-F6B776C7"
    customer_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    order_type TEXT NOT NULL CHECK (order_type IN ('dine-in', 'takeaway', 'delivery')),
    address TEXT,
    landmark TEXT,
    delivery_area TEXT,
    coords JSONB,                             -- { lat: number, lng: number }
    items JSONB NOT NULL DEFAULT '[]'::jsonb, -- [{ id, name, price, quantity }]
    subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
    gst NUMERIC(10,2) NOT NULL DEFAULT 0,
    delivery_charge NUMERIC(10,2) NOT NULL DEFAULT 0,
    discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    coupon_code TEXT,
    total NUMERIC(10,2) NOT NULL DEFAULT 0,
    payment_method TEXT NOT NULL DEFAULT 'Cash' CHECK (payment_method IN ('Cash', 'UPI', 'Online', 'Card')),
    payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'partial')),
    status TEXT NOT NULL DEFAULT 'placed' CHECK (status IN ('placed', 'accepted', 'ready', 'picked-up', 'delivered', 'rejected', 'cancelled')),
    assigned_agent TEXT,
    seen_by_admin BOOLEAN NOT NULL DEFAULT FALSE,
    is_regular_customer BOOLEAN NOT NULL DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    timestamp BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
);

-- Index for fast order tracking lookup
CREATE INDEX IF NOT EXISTS idx_orders_id ON public.orders(id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_assigned_agent ON public.orders(assigned_agent);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- Enable Realtime on orders table for instant live updates on Tracker and Agent Portal (Safe/Idempotent check)
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

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    description TEXT,
    image_url TEXT,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. AGENTS TABLE (Credentials managed via Supabase Auth auth.users)
CREATE TABLE IF NOT EXISTS public.agents (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    vehicle_type TEXT,
    coverage_area TEXT,
    total_deliveries INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. BILLS TABLE
CREATE TABLE IF NOT EXISTS public.bills (
    bill_no TEXT PRIMARY KEY,                 -- e.g. "BILL-20260812-001"
    order_id TEXT REFERENCES public.orders(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
    gst NUMERIC(10,2) NOT NULL DEFAULT 0,
    delivery_charge NUMERIC(10,2) NOT NULL DEFAULT 0,
    discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    total NUMERIC(10,2) NOT NULL DEFAULT 0,
    payment_status TEXT NOT NULL DEFAULT 'unpaid',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. COUPONS TABLE
CREATE TABLE IF NOT EXISTS public.coupons (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'flat')),
    discount_value NUMERIC(10,2) NOT NULL,
    min_order_value NUMERIC(10,2) NOT NULL DEFAULT 0,
    max_uses INTEGER,                         -- NULL = unlimited
    used_count INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    applicable_order_types TEXT[] NOT NULL DEFAULT ARRAY['dine-in', 'takeaway', 'delivery'],
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════════════════════════
-- 7. PRODUCTION ROW LEVEL SECURITY (RLS) POLICIES
-- ══════════════════════════════════════════════════════════════════════════════

-- Enable RLS on all tables
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- ─── 1. ORDERS TABLE POLICIES ────────────────────────────────────────────────
DROP POLICY IF EXISTS "Public create order" ON public.orders;
DROP POLICY IF EXISTS "Public select order by id" ON public.orders;
-- ONLY Admin (all orders) and Delivery Agents (assigned orders only) can run SELECT queries!
DROP POLICY IF EXISTS "Staff select orders" ON public.orders;
DROP POLICY IF EXISTS "Scoped staff select orders" ON public.orders;

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
WITH CHECK (
  assigned_agent = (auth.jwt() -> 'user_metadata' ->> 'agent_name')
);

CREATE POLICY "Admin delete orders only" ON public.orders FOR DELETE 
USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- ─── 7. SECURITY DEFINER SINGLE ORDER LOOKUP FUNCTION ─────────────────────────
-- Public can ONLY fetch a single order by exact ID (prevents bulk DB dumps!)
CREATE OR REPLACE FUNCTION public.get_order_by_id(p_order_id TEXT)
RETURNS SETOF public.orders
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM public.orders WHERE id = p_order_id LIMIT 1;
$$;

-- Explicitly grant execute permission to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.get_order_by_id(TEXT) TO anon, authenticated, service_role;

-- ─── 2. SETTINGS TABLE POLICIES ───────────────────────────────────────────────
-- Public can read site_name, gst, delivery fee, upi_id (needed for checkout QR)
-- ONLY Admin can insert, update, or delete settings! Prevents UPI ID hijacking.
DROP POLICY IF EXISTS "Public read settings" ON public.settings;
DROP POLICY IF EXISTS "Admin write settings" ON public.settings;

CREATE POLICY "Public read settings" ON public.settings FOR SELECT USING (true);

CREATE POLICY "Admin write settings" ON public.settings FOR ALL
USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- ─── 3. BILLS TABLE POLICIES ──────────────────────────────────────────────────
-- ONLY authenticated Admin can read all bills; Agents can ONLY read bills for their assigned deliveries!
DROP POLICY IF EXISTS "Public read bills" ON public.bills;
DROP POLICY IF EXISTS "Staff read bills" ON public.bills;
DROP POLICY IF EXISTS "Agent read assigned delivery bills" ON public.bills;
DROP POLICY IF EXISTS "Admin write bills" ON public.bills;

CREATE POLICY "Agent read assigned delivery bills" ON public.bills FOR SELECT 
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  OR (
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'agent'
    AND order_id IN (
      SELECT id FROM public.orders 
      WHERE assigned_agent = (auth.jwt() -> 'user_metadata' ->> 'agent_name')
    )
  )
);

CREATE POLICY "Admin write bills" ON public.bills FOR ALL 
USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- ─── 4. AGENTS TABLE POLICIES ─────────────────────────────────────────────────
-- ONLY authenticated staff (Admin/Agent) can read agent records (prevents rider phone number leaks!)
-- ONLY Admin can create, modify, or delete agent accounts!
DROP POLICY IF EXISTS "Public read active agents" ON public.agents;
DROP POLICY IF EXISTS "Staff read agents" ON public.agents;
DROP POLICY IF EXISTS "Admin write agents" ON public.agents;

CREATE POLICY "Staff read agents" ON public.agents FOR SELECT 
USING ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'agent'));

CREATE POLICY "Admin write agents" ON public.agents FOR ALL 
USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- ─── 5. COUPONS TABLE POLICIES ────────────────────────────────────────────────
DROP POLICY IF EXISTS "Public read active coupons" ON public.coupons;
DROP POLICY IF EXISTS "Admin write coupons" ON public.coupons;

CREATE POLICY "Public read active coupons" ON public.coupons FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admin write coupons" ON public.coupons FOR ALL 
USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- ─── 6. PRODUCTS TABLE POLICIES ───────────────────────────────────────────────
DROP POLICY IF EXISTS "Public read products" ON public.products;
DROP POLICY IF EXISTS "Admin write products" ON public.products;

CREATE POLICY "Public read products" ON public.products FOR SELECT USING (true);

CREATE POLICY "Admin write products" ON public.products FOR ALL 
USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');


