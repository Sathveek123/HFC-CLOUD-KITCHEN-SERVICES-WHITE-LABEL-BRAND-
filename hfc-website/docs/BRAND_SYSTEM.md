# 🎨 HFC Brand System

## Brand Identity

**HFC Consultancy Services** operates on a strict **white / red / black / gold** design system. No gradients, no dark theme, no AI-template aesthetics.

---

## 🎨 Color Palette

### Core Brand Colors (Tailwind Config)

| Token | Hex | Usage |
|-------|-----|-------|
| `brand-red` | `#CC0000` | Primary CTA, badges, active states, logo |
| `brand-redHover` | `#AA0000` | Hover state for red buttons |
| `brand-redLight` | `#FFF5F5` | Light red background tints |
| `brand-black` | `#1A1A1A` | Headlines, primary text |
| `brand-body` | `#3A3A3A` | Body text |
| `brand-muted` | `#6A6A6A` | Captions, placeholders |
| `brand-border` | `#E8E8E8` | All dividers, card borders |
| `brand-surface` | `#FAFAFA` | Page backgrounds, table headers |
| `brand-gold` | `#C9973A` | Stars, premium accents |
| `white` | `#FFFFFF` | Card backgrounds, containers |

### Status Colors (Used in Badges)

| Status | Color |
|--------|-------|
| `placed` | Gray |
| `accepted` | Blue |
| `ready` | Amber/Orange |
| `picked-up` | Teal/Purple |
| `delivered` | Dark Green `#166534` |
| `cancelled` | Gray-400 |
| `rejected` | Red-600 |
| `paid` | Green |
| `unpaid` | Amber |

---

## 🔤 Typography

### Font Families

| Token | Font | Usage |
|-------|------|-------|
| `font-brand` | **Montserrat** (ExtraBold/Bold/SemiBold) | Logo, buttons, labels, headings |
| `font-display` | **Playfair Display** (Bold/Black) | Hero headings, page titles |
| `font-tagline` | **Lora** (Italic) | Taglines, quotes, subheadings |
| `font-body` | **Inter** (Regular/Medium) | Body text, descriptions, table data |

### Font Sizes (Common)

| Usage | Size |
|-------|------|
| Hero H1 | 60px (desktop) / 38px (mobile) |
| Page title | 28px |
| Card heading | 16–18px |
| Body text | 13–14px |
| Labels / captions | 10–12px |
| Micro text | 9–11px |

---

## 📐 Spacing & Shape Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `rounded-btn` | `8px` | Buttons |
| `rounded-card` | `12px` | Cards |
| `rounded-pill` | `9999px` | Badges, pills |
| `shadow-card` | `0 2px 12px rgba(0,0,0,0.06)` | Card elevation |
| `shadow-float` | `0 8px 24px rgba(0,0,0,0.12)` | Floating elements |
| `shadow-cardHover` | `0 6px 20px rgba(0,0,0,0.10)` | Card hover elevation |

---

## 🌊 Motion & Animation System

### Framer Motion Conventions

- **Page-level entrances**: `initial={{ opacity:0, y:20 }}` → `animate={{ opacity:1, y:0 }}` at `duration: 0.5`
- **Staggered lists**: `transition={{ delay: index * 0.05 }}`
- **Spring-bounce**: `type:'spring', stiffness:400, damping:10, mass:0.6` (2 keyframes only — spring limitation)
- **Continuous rotation**: `animate={{ rotate:360 }}`, `repeat:Infinity`, linear, no repeat delay
- **Float effect**: `animate={{ y:[0,-8,0] }}`, `duration:4`, `ease:'easeInOut'`, `repeat:Infinity`

> ⚠️ **Framer Motion Spring Limitation**: Spring and inertia animations only support exactly 2 keyframes (start → end). Never use `[0, 1.2, 1]` style arrays with `type:'spring'` — use `tween` easing for multi-keyframe animations.

### Splash Screen Motion (10-Phase Sequence)

| Phase | Timing | Element | Animation |
|-------|--------|---------|-----------|
| 1 | 0–900ms | Outer red ring | SVG `pathLength` 0→1 draw |
| 2 | 700–1400ms | Inner dashed ring | SVG `pathLength` 0→1 draw |
| 3 | 1200–1600ms | Cloche icon | SVG path draw + scale |
| 4 | 1500–1900ms | H, F, C letters | Individual `y:12→0, opacity:0→1` stagger |
| 5 | 1900–2100ms | Divider line | `scaleX: 0→1` from left |
| 6 | 2050–2350ms | "Consultancy Services" | Letter-spacing 1px→5px + fade |
| 7 | 2300–2700ms | ★★★★★ stars | Spring bounce stagger per star |
| 8 | 2700–3100ms | Tagline | `y:8→0, opacity:0→1` |
| 9 | 3100–3500ms | "Crafting F&B Brands Since 2011" | Fade in |
| 10A | 3900–4100ms | Badge group | `scale:1→0.92, opacity:1→0` |
| 10B | 4050–4700ms | Container | `translateY: 0→-100vh` slide exit |

---

## 🃏 Component Patterns

### Form Fields
```css
.field-input {
  height: 44px;
  border: 1px solid #E8E8E8;
  border-radius: 8px;
  padding: 0 12px;
  font-family: Inter;
  font-size: 13px;
}
.field-input:focus {
  border-color: #CC0000;
  outline: none;
  box-shadow: 0 0 0 3px rgba(204,0,0,0.08);
}
```

### Primary Button
```css
.btn-primary {
  background: #CC0000;
  color: white;
  height: 48px;
  border-radius: 8px;
  font-family: Montserrat;
  font-weight: 700;
  font-size: 13px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
}
.btn-primary:hover { background: #AA0000; }
```

### Status Badge Colors
| Status | Background | Text | Border |
|--------|-----------|------|--------|
| placed | `gray-100` | `gray-700` | `gray-300` |
| accepted | `blue-50` | `blue-700` | `blue-200` |
| ready | `amber-50` | `amber-700` | `amber-200` |
| picked-up | `teal-50` | `teal-700` | `teal-200` |
| delivered | `#166534` | `white` | `#166534` |
| cancelled | `gray-50` | `gray-500` | `gray-200` |
| rejected | `red-50` | `red-700` | `red-200` |
