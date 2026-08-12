# 📚 HFC Cloud Kitchen — Documentation Index

> **HFC Consultancy Services** — Premium Food & F&B Consultancy  
> Full-stack Next.js application: Customer Website + Admin Panel + Delivery Agent Portal

---

## 📁 Documentation Files

| File | Description |
|------|-------------|
| [OVERVIEW.md](./OVERVIEW.md) | Project overview, tech stack, architecture |
| [BRAND_SYSTEM.md](./BRAND_SYSTEM.md) | Design tokens, color palette, typography |
| [WEBSITE.md](./WEBSITE.md) | Customer-facing website — all sections & features |
| [ORDER_FLOW.md](./ORDER_FLOW.md) | Complete end-to-end order lifecycle |
| [ADMIN_PANEL.md](./ADMIN_PANEL.md) | Admin panel — all pages & functionality |
| [DELIVERY_PORTAL.md](./DELIVERY_PORTAL.md) | Delivery agent portal — login, orders, report |
| [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md) | Zustand stores — data models & actions |
| [COMPONENTS.md](./COMPONENTS.md) | Component architecture & directory structure |
| [COUPONS_OFFERS.md](./COUPONS_OFFERS.md) | Promotions system — coupons, offers, reward tiers |
| [SETTINGS.md](./SETTINGS.md) | Settings panel — all configuration options |
| [SUPABASE_INTEGRATION.md](./SUPABASE_INTEGRATION.md) | Supabase Cloud DB, schema, WebSockets, rate-limiting queue |
| [AUDIT_AND_HARDENING.md](./AUDIT_AND_HARDENING.md) | Production technical audit, security hardening, E2E results |
| [CHANGELOG.md](./CHANGELOG.md) | Build history & feature changelog |

---

## 🚀 Quick Start

```bash
cd hfc-website
npm install
npm run dev        # http://localhost:3000
```

**Key URLs:**

| Surface | URL |
|---------|-----|
| Customer Website | `http://localhost:3000/` |
| Admin Login | `http://localhost:3000/admin/login` |
| Admin Dashboard | `http://localhost:3000/admin/dashboard` |
| Agent Login | `http://localhost:3000/agent/login` |
| Order Tracker | `http://localhost:3000/track/[orderId]` |

---

## 🔐 Default Credentials

### Admin Panel
| Field | Value |
|-------|-------|
| Username | `admin` |
| Password | `hfc2024` |

### Agent Portal (Seed Agents)
| Agent | Username | Password |
|-------|----------|----------|
| Rajesh Kumar | `rajesh` | `raj123` |
| Suresh Raina | `suresh` | `sur123` |

---

*Last updated: v1.11.0 (Production Hardened & Audited) — August 2026*
