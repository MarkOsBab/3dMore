---
name: 3dmore-design-system
description: Design system for 3dMore — Uruguayan emprendimiento selling 3D-printed cyberpunk/neon accessories for motorcycle helmets. Use this skill when designing anything for 3dMore: storefront pages, admin panels, social posts, landing pages, emails, decks.
---

# 3dMore Design System

Use this skill when the user asks you to design ANYTHING for **3dMore** — an Uruguayan small business selling 3D-printed motorcycle helmet accessories (demon horns, cat ears, kawaii bows, punk crests). The aesthetic is **cyberpunk / darkrider / neon-Tokyo**, addressed to riders who want to stand out.

If the user mentions "3dMore", "3DMORE", "cuernitos", "orejitas", "rodada", or shows the pink→blue gradient + dark helmet imagery, this skill applies.

## Files in this skill

- `README.md` — **start here.** Full brand context, content rules, visual foundations, iconography guidance.
- `colors_and_type.css` — drop-in CSS token set. Import it and use the variables (`--accent-pink`, `--bg-dark`, `--gradient-primary`, etc).
- `assets/` — brand mark (raster + SVG), 4 product photos, wordmark SVG. Copy the files you need into your output.
- `ui_kits/storefront/` — reference recreation of the customer-facing shop (Hero, ProductCard, PDP, CartDrawer). Read these files to see the system composed.
- `ui_kits/admin/` — reference recreation of the `/admin` panel (Sidebar, Dashboard, Products table + edit drawer, Promo codes).
- `preview/` — small HTML specimen cards showing individual tokens/components. Handy reference.

## How to use this skill

1. **Read `README.md` end-to-end.** It defines Spanish-Uruguay voice, the all-caps-CTA rule, the single-gradient-word-per-headline rule, glass cards, colored shadows, and the specific hype vocabulary ("rodada", "darkrider", "asfalto").
2. **Load `colors_and_type.css`.** Use its tokens for colors, radii, shadows, gradient. Don't invent new colors — use `--accent-pink` (#ff2a85), `--accent-blue` (#3b82f6), `--bg-dark` (#0a0a0f), `--gradient-primary`.
3. **Copy only the assets you need** from `assets/` into your output directory. Don't bulk-copy.
4. **For new components**, follow the patterns in `ui_kits/`:
   - Glass cards: `rgba(21,21,32,0.6)` + `backdrop-filter: blur(12px)` + hairline white border + 16–24px radius.
   - Primary CTAs: pill-shaped (`border-radius: 9999px`), gradient fill, `0 0 15px rgba(255,42,133,0.5)` pink glow, ALL-CAPS label.
   - Headlines: Outfit 800, one word gradient-filled via `background-clip: text`.
   - Icons: Lucide, stroke 2, rounded caps. Size matches surrounding text.

## Must-follow rules (the things that break if you ignore them)

- **Spanish (Uruguay), not English.** Prices in UYU without thousands separators. `$850 UYU`, not `$850.00`.
- **ALL-CAPS for primary CTAs** (`AGREGAR AL CARRITO`) and section titles (`NUESTROS PRODUCTOS`). Title Case for product names. lowercase for categories.
- **Exactly ONE gradient-filled word per headline.** Never more. Never the whole headline.
- **Dark backgrounds only.** `#0a0a0f` canvas. No white-background designs. No daylight photography.
- **All shadows are colored** (pink or blue tinted). Never neutral gray drop-shadows.
- **Hairline white borders at 5–15% alpha.** Colored borders are reserved for selected state (pink), semantic state (success green), and the WhatsApp button (#25D366 outline).
- **Icon set is Lucide.** Don't substitute Material, Heroicons, or Feather variants.
- **No AI-slop emoji clusters** (✨🚀🎉). Emoji are paired with bold labels inline (`✅ Material:`, `💳 PAGAR CON MERCADO PAGO`) and that's the only place they appear.
- **Glassmorphism everywhere.** Any element on top of the canvas gets `.glass` treatment.

## Common tasks

- **New storefront page?** Start from `ui_kits/storefront/index.html`. Mimic the Hero blur-blob layout, the glass product cards, the sticky glass navbar with the pink count bubble.
- **New admin screen?** Start from `ui_kits/admin/index.html`. Use the 240px sidebar with the 3px pink left-border on the active row, and the stat-card pattern (glass + 4px solid accent on left edge).
- **Social post / deck slide?** 1920×1080 dark canvas, pink and blue blurred blobs in opposite corners, Outfit 800 headline with one gradient word, product image in a rounded frame.
- **Email or PPTX export?** See `README.md` — **Fonts caveat**. Outfit loads from Google Fonts; for offline output, download the TTFs and swap the `@import`.

## What's NOT in this skill

- **Illustration style** — the brand relies on photography, not illustrations. Don't generate SVG illustrations for products; use the provided product photos or placeholders.
- **A component library** — this is a token + pattern system, not React primitives. The `ui_kits/` are reference implementations, not a package. Reimplement components inline for each output, following the patterns.
- **Lifestyle photography** — no smiling-humans-using-the-product shots. Only the established cyberpunk-render style.

## If you get stuck

- The user's Instagram handle is the source of truth for voice — check `3dMore.uy` on Instagram for current tone if accessible.
- The GitHub repo `MarkOsBab/3dMore` mirrors the live codebase. Read `app/globals.css` and `app/page.tsx` there for authoritative token values.
- When in doubt, favor **more pink glow, more dark surface, more aggressive copy, more single-word gradient emphasis** over the safer choice.
