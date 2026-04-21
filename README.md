# 3dMore Design System

Design system for **3dMore**, an Uruguayan small-business (emprendimiento) selling **3D-printed accessories for motorcycle helmets** — demon horns ("cuernitos"), cat ears ("orejitas"), kawaii bows, neon punk crests, etc. Target audience: riders who want to stand out. Aesthetic: cyberpunk / darkrider / neon-Tokyo.

> **Tagline in product copy:** "PERSONALIZA TU RODADA" — personalize your ride.

---

## Sources consulted

| Source | Path / URL | Notes |
|---|---|---|
| Local Next.js 16 codebase | `3dMore/` (attached read-only) | Primary source of truth. App Router, Prisma + Supabase + Mercado Pago + WhatsApp checkout. |
| GitHub repo | `MarkOsBab/3dMore` | Mirror of the above. |
| Brand logo | `uploads/387824596_122141592002011696_6886888108398867438_n.jpg` | Instagram-style square, gradient bg, white helmet-with-horns mark. |
| Product imagery | `3dMore/public/images/*.webp` | 4 product photos — cyberpunk-rendered helmets at night, heavy neon lighting. |

Non-public sources (DB dumps, Figma, style guides) were not provided — the system was reverse-engineered from the codebase's inline styles, tokens in `app/globals.css`, and the brand mark.

---

## Index

| File / folder | Purpose |
|---|---|
| `README.md` | This file — brand context, content rules, visual foundations, iconography. |
| `colors_and_type.css` | Raw CSS tokens: colors, gradients, shadows, radii, typography. Drop-in. |
| `SKILL.md` | Agent-skill manifest for downloading this system into Claude Code. |
| `assets/` | Logos, product imagery, exported SVG logotypes. |
| `fonts/` | *(Outfit is loaded from Google Fonts — no local TTFs stored; see "Fonts" caveat below.)* |
| `preview/` | Static HTML cards that populate the Design System tab in this project. |
| `ui_kits/storefront/` | High-fidelity recreation of the customer-facing storefront (hero, catalog, PDP, cart). |
| `ui_kits/admin/` | Recreation of the admin panel (sidebar, dashboard, products table, promos table). |

---

## Products represented

The codebase covers **one product** (the 3dMore web app), which has **two distinct surfaces**:

1. **Storefront** — public shop (`app/page.tsx`, `app/products/[id]`). Dark, glowy, neon-forward. Checkout is dual-rail: Mercado Pago OR WhatsApp (UYU pricing).
2. **Admin panel** — `/admin`, Basic-Auth-gated. Same dark theme, quieter — sidebar nav, cards with colored left-border accents, tables, forms. Manages products, variants (color options), promo codes.

Both surfaces share one token set.

---

## Content fundamentals

**Language:** Spanish (Uruguay). `html lang="es"`. Currency is **UYU** (`$850 UYU`). Dates formatted `es-UY`.

**Tone:** Hype, edgy, direct. Short sentences. Addresses the rider as **"vos/tú"** implicitly (imperative verbs dominate). No corporate softening. Brand speaks from inside the biker subculture.

**Voice examples** (verbatim from codebase):
- Hero headline: **"PERSONALIZA TU RODADA"**
- Hero sub: *"Accesorios impresos en 3D para cascos. Orejitas, cuernos de demonio y más. Expresa tu estilo en el asfalto."*
- Section title: **"NUESTROS PRODUCTOS"** / sub: *"Diseños únicos para destacar en cada viaje."*
- Product description: *"Cuernos impresos en 3D super resistentes con anclaje universal para cualquier casco. Ideales para un look agresivo y darkrider."*
- Cart empty state: *"Tu carrito está vacío."*
- WhatsApp auto-message: *"Hola 3DMORE! Me gustaría hacer un pedido: … ¡Gracias!"*

**Casing rules:**
- **ALL-CAPS** for: primary CTAs (`AGREGAR AL CARRITO`, `VER CATÁLOGO`, `PAGAR CON MERCADO PAGO`), section titles (`NUESTROS PRODUCTOS`, `TU CARRITO`), logomark (`3DMORE`), the headline action verb.
- **Title case** for: product names (`Cuernos de Demonio`, `Orejitas de Gato`, `Moño Kawaii`).
- **lowercase** for: categories (`cuernos`, `orejas`, `moños`, `accesorios`).
- Sentence case for: body copy, descriptions, form labels.

**Gradient emphasis rule:** in any display headline, **exactly one key word** is colored with the pink→blue gradient (`.text-gradient`): *"PERSONALIZA TU **RODADA**"*, *"NUESTROS **PRODUCTOS**"*, the `3DMORE` wordmark in the navbar, the total amount in the cart.

**Emoji usage:** Light and functional, never decorative clusters. Codebase uses: 🪖 (product fallback), 💳 (pay with MP), 💬 (pay via WhatsApp), ✅ ✈️ 🛡️ (product info strip), 🚧 (empty state), 🔒 (admin warning). **Never** use AI-slop emoji clusters (✨🚀🎉). Emoji are always paired with **<strong>bold label:</strong>** pattern in info strips.

**Hype words that recur:** *rodada, asfalto, darkrider, look agresivo, destacar, estilo, resistente, universal, hazte notar*.

**Numbers & money:** No thousands separator (`$850`, `$1200`). Price rendered as `toFixed(0)` — always integers. Discounts shown as `{N}% OFF` pill.

---

## Visual foundations

### Color vibe
Dark, moody, **cyberpunk-neon**. Near-black canvas (`#0a0a0f`) with two saturated accents — **hot pink `#ff2a85`** and **electric blue `#3b82f6`** — linked by a 135° gradient that is the single most recognizable brand element. Every piece of imagery is shot at night with wet pavement, neon signage, and hot colored rim-light. Warm pinks/reds on the subject, cool blues behind. No daylight photography, no white backgrounds.

### The gradient
`linear-gradient(135deg, #ff2a85 0%, #3b82f6 100%)` appears on:
- Primary button fills (+ pink glow shadow)
- Brand wordmark `3DMORE` (background-clip: text)
- One key word in every display headline
- Admin sidebar: **active nav row** (soft 15% variant) with a 3px solid pink left border
- The cart total amount
- Admin primary button `Nuevo Producto / Nuevo Código`

### Glow treatment
Buttons and hero use the actual pink/blue at 50% alpha as a **blurred 100–150px radial blob** behind hero content, and a `box-shadow: 0 0 15px` aura under primary CTAs. Hover lifts the CTA 2px and **swaps the glow from pink → blue** (the gradient traversing visually). This glow-swap-on-hover is a signature.

### Typography
- **Family:** [Outfit](https://fonts.google.com/specimen/Outfit) (Google Fonts). Geometric sans, high weights read as poster-like.
- **Weights used:** 800 (hero), 700 (section headers, totals), 600 (product titles, UI labels), 500 (nav links, meta), 400 (body).
- **Scale:** hero `clamp(2.5rem, 5vw, 4rem)`, PDP h1 `clamp(2rem, 4vw, 3rem)`, section h2 `2.5rem`, card h3 `1.1rem`, body `1rem`, meta `0.85–0.9rem`, micro eyebrow `0.7rem`.
- **Tracking:** `2px` on eyebrows/micro labels, `1px` on `.ds-label`, `-2.4px` on a single 40px headline instance (page.module.css — legacy Next.js template, not part of the shipped design).
- **Gradient fill:** reserved for ONE word per headline. Never gradient-fill body text.
- **Mono:** JetBrains Mono for promo codes (`RIDER2026`), rendered pink inside a `surface-4` chip.

### Backgrounds
- Page: flat `#0a0a0f`, no pattern, no texture.
- Hero: **two blurred neon blobs** absolutely positioned — pink top-left, blue bottom-right, `filter: blur(100px)`, 30–40vw wide.
- Catalog strip: `rgba(0,0,0,0.3)` overlay on page bg to create a darker section break.
- Cards: **glassmorphism** — `rgba(21,21,32,0.6)` + `backdrop-filter: blur(12px)` + 1px hairline border. The `.glass` class is applied liberally (navbar, product card, cart drawer, PDP image, admin stat cards).
- Cart drawer has a dedicated `-10px 0 40px rgba(255,42,133,0.1)` side-shadow.
- No photos as full-bleed backgrounds. No repeating patterns. No hand-drawn illustrations.

### Animation
Minimal, understated — contrasts the loud color palette.
- `fade-in-up` keyframe: 20px translate + opacity, `0.8s ease forwards`. Staggered on card lists via `animationDelay: 0.1s * index`.
- Button hover: `translateY(-2px)` + swap glow color, `0.3s ease`.
- Product card hover: `translateY(-5px)` + pink shadow, `0.3s ease`. Inner image `scale(1.05)` at `0.4s ease`.
- No bounces, no springs, no parallax. No Framer Motion in the codebase.

### Hover / press states
| Element | Hover | Press |
|---|---|---|
| Primary CTA | `translateY(-2px)`, glow pink → blue | (browser default — no override) |
| Product card | `translateY(-5px)` + pink drop-shadow | — |
| Card image | `scale(1.05)` | — |
| Nav link | `color` transition (no underline) | — |
| Icon button | background stays `surface-3/4`, inherits color | — |
| Variant swatch | border goes from `rgba(255,255,255,0.1)` → `accent-pink` when **selected** (not hover) | — |

### Borders
All borders are **hairline white at 5–15% alpha** on the dark surface. No colored borders except:
- `accent-pink` 2px border on the **selected variant swatch**.
- Success outline `rgba(34,197,94,0.3)` on applied-promo chip.
- WhatsApp button: 2px solid `#25D366` outline.
- Admin sidebar active row: 3px solid `accent-pink` on the left edge ONLY.

### Shadows (catalogued)
```
Card hover:       0 10px 25px rgba(255, 42, 133, 0.2)
Cart drawer:      -10px 0 40px rgba(255, 42, 133, 0.1)
CTA glow pink:    0 0 15px rgba(255, 42, 133, 0.5)
CTA glow pink lg: 0 0 25px rgba(255, 42, 133, 0.5)
CTA glow blue:    0 0 15px rgba(59, 130, 246, 0.5)
```
No inner shadows. No neutral-gray shadows — every shadow is colored.

### Corner radii (ranked by usage)
- `8px` — inputs, small buttons, table cells' cart thumbnails, admin icon buttons
- `10px` — variant swatches, cart item thumbnails
- `12px` — admin stat cards, tables, forms
- `16px` — product cards, info strips, modals
- `24px` — hero image frame, PDP image frame
- `9999px` (pill) — primary CTA, OFFER badge, cart-count bubble

### Transparency & blur
- Primary surfacing technique is **semi-transparent fills + 12px backdrop blur** (glassmorphism). Used ANY time something sits on top of the dark canvas.
- Cart overlay: `rgba(0,0,0,0.7)` + `backdrop-filter: blur(4px)`.
- Admin modal overlay: `rgba(0,0,0,0.75)` + `blur(4px)`.

### Layout rules
- Max content width: `1200px` via `.container`.
- Horizontal padding: `1.5rem` mobile, scales with clamp on hero.
- Hero is ≥80vh, flex-centered.
- Catalog grid: `repeat(auto-fill, minmax(280px, 1fr))`, 2rem gap.
- PDP: `repeat(auto-fit, minmax(300px, 1fr))`, 4rem gap — image left, details right.
- Admin sidebar: fixed 240px; content grows to fill.
- Navbar: sticky, glass, 1rem vertical padding.

### Spacing scale
Rems: `0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4, 6`. Section padding vertical is `6rem`. Intra-card padding is `1.5rem` or `2rem`. Form field vertical rhythm is `1.25rem`.

### Cards anatomy
`.glass` + `border-radius: 16px` + `overflow: hidden` + **flex column** + optional `animate-fade-in-up`. No visible border on card exterior unless the `.glass` class is applied (which gives the 5%-alpha hairline). **Exception:** admin stat cards have a 4px solid accent-pink / accent-blue LEFT border on top of the glass frame. This is the one instance of the "colored left accent" pattern; use it sparingly.

---

## Iconography

**Icon library:** [Lucide React](https://lucide.dev) (`lucide-react@1.8.0`) — used everywhere. Stroke-based, 1.5px weight, rounded line-caps, simple geometric construction. Fits the geometric Outfit headlines.

**Usage rules from the codebase:**
- Always imported by name: `import { ShoppingCart, X, Trash2, Plus, Tag, CheckCircle, XCircle, ToggleRight, ToggleLeft, Package, LayoutDashboard, ArrowLeft, ArrowRight, Home, Layers } from "lucide-react"`.
- Sizes: `14, 16, 18, 20, 22, 24` — picked to match the surrounding text size. `24` in nav, `22` inside large CTA, `18` inside medium button/row, `16` inside cart item actions, `14` next to promo status text.
- `color="white"` by default (inherits). `var(--accent-pink)` for destructive (`Trash2`). `var(--success)` for the active `ToggleRight`. Never multicolor icons.

**Logo / brand mark:** `assets/logo_3dmore.jpg` — Instagram-ready 500×500 raster: gradient background (the same 135° pink→blue gradient as the tokens), a white filled silhouette of a full-face helmet with two devil/demon horns, and the `3DMORE` wordmark under it in a tall geometric sans. The "O" has been stylized as a filled circle with a missing bottom-slice, creating a record/disc visual rhyme. The horns in the logo are **the product**, so the mark is also the hero product illustration.

**SVG logotypes:** hand-simplified single-color versions of the mark live at `assets/logo_wordmark.svg` (type-only) and `assets/logo_helmet_mark.svg` (glyph-only, white-on-transparent, intended for dark backgrounds). Both are simplified approximations extracted from the raster — for pixel-perfect print use, request a vector original from the user.

**Emoji as icons:** Used sparingly inline with `<strong>Label:</strong> value` pattern (`✅ Material:`, `✈️ Envíos:`, `🛡️ Garantía:`). Also used in CTA prefixes for payment methods (`💳 PAGAR CON MERCADO PAGO`, `💬 PAGAR POR WHATSAPP`) and empty/error states (`🚧`, `🔒`). Never clustered, never decorative.

**Unicode characters as UI glyphs:** `→` used in the admin `Ver tienda →` link. `—` em-dash in copy (not `-`). `$` prefix for all money. `∞` used for "unlimited uses" in the promo table.

**Product imagery:** 1:1 square, high-contrast neon cyberpunk renders — matte-black helmets, wet streetscapes, hot rim-light, Japanese signage. Cool-biased backgrounds, warm-biased accessory glow. No lifestyle shots of humans smiling. No clean studio packshots.

---

## Fonts — caveat

**Outfit** is loaded via `next/font/google` in the live app and via `@import` from Google Fonts in `colors_and_type.css`. **No local `.ttf` / `.woff2` files** are shipped in this design system — the project had none and a Google Fonts CDN import is authoritative for the Outfit brand font.

If you need to ship offline (PPTX export, air-gapped prototype, print), download Outfit's full family from Google Fonts and drop the `woff2` files into a `fonts/` folder, then swap the `@import` in `colors_and_type.css` for local `@font-face` declarations. Flag this to the user.

---

## Content fundamentals — quick reference

Keep outputs:
- Dark bg by default (`--bg-dark`)
- One gradient accent word per headline
- ALL-CAPS for CTAs and section titles; Title Case for product names
- Glass cards with 16–24px radius
- Lucide icons, no emoji clusters
- Pink-tinted shadows, not gray
- Spanish (Uruguay) copy — imperative verbs, short sentences
- `$N UYU` for prices

---

## Wanting more?

See `SKILL.md` if you want to hand this system to a separate Claude Code agent. See `preview/` for ready-to-read specimen cards. See `ui_kits/storefront/index.html` and `ui_kits/admin/index.html` to see the full system composed.
