# Rising Sun Power BD — Claude Code Build Prompt
### Build a production e-commerce platform from the attached `index.html` design reference

---

## 0. WHAT YOU'RE BUILDING

**Rising Sun Power BD** — an e-commerce site for a solar & electrical products supplier in Bangladesh (MCB, MCCB, solar panels, inverters, batteries, cables, accessories).

I'm attaching an `index.html` (and additional exported design screens) produced in Claude Design. **Use it as the visual/design-system reference** — exact colors, typography, spacing, component shapes, dark/light mode behavior, and page layouts. Do **not** just embed or lightly wrap the HTML — **rebuild everything as proper React components** using the tech stack below, matching the design faithfully (colors, radii, shadows, motion) but with real component architecture, state, and data.

If any interaction or page isn't fully specified below, infer it from the design reference and keep it consistent with the rest of the site.

---

## 1. TECH STACK (mandatory)

- **Vite + React + TypeScript**
- **Tailwind CSS** + **shadcn/ui** components
- **TanStack Query** for server state / data fetching
- **React Router** for routing
- **React Hook Form + Zod** for all forms and validation
- **Zustand** for cart + UI state (theme, drawers)
- **Supabase** (Postgres + Auth + Storage) — client via `@supabase/supabase-js`
- Icons: `lucide-react`

Set up **path aliases** (`@/components`, `@/lib`, `@/hooks`, `@/pages`) and a clean `src/` structure from the start.

---

## 2. DESIGN SYSTEM — PORT FROM index.html

Extract and set up as Tailwind theme tokens / CSS variables (do not hardcode hex codes in components):

```
Brand:
  navy-900:  #052C6E
  blue-700:  #0B3F94
  blue-500:  #217CCA
  blue-100:  #E3EFFB
  orange-500:#F49E09   (primary CTA / price)
  orange-400:#FFB43D
  gold-400:  #F4D560
  green-600: #2A6B08
  green-500: #4C9412
  green-400: #67A70E

Light mode: bg #F5F8FD, surface #FFFFFF, surface-2 #EEF3FA, text #0A1B33, border #E1E8F2
Dark mode:  bg #060C18, surface #0E1626, surface-2 #16203A, text #EAF1FB, border #233150
```

- Implement **dark/light mode** with a proper theme provider (class-based, `localStorage` persisted, header toggle), matching the design reference exactly — not a generic shadcn default theme.
- Fonts: `Plus Jakarta Sans` (headings), `Inter` (body). Load via `next/font`-equivalent or `@fontsource`.
- Radius scale: cards/buttons 16px, inputs 12px, pills 999px.
- Rebuild the full shared component library first (Button variants, Input, Card, Badge, Tabs, Modal, Toast, Skeleton, Stepper) before building pages — every page reuses these.

---

## 3. SUPABASE SETUP

- Use the schema in the companion file **`RSP_Supabase_Schema.sql`** — run it as the initial migration.
- Enable **Row Level Security** on every table per the policies defined in that file.
- Set up Supabase Auth (email/password + phone OTP if feasible) for customer accounts, with a `profiles` table (role: `customer` | `admin`) auto-created on signup via trigger.
- Use **Supabase Storage** for product images (bucket: `product-images`, public read) and any lead attachments if needed.
- Read Supabase URL/anon key from environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) — never hardcode.

---

## 4. ROUTES / PAGES TO BUILD

Build in this order — each phase should be a complete, working vertical slice before moving to the next:

**Phase 1 — Storefront shell**
- `/` Homepage (all sections from design: hero, category grid, deals w/ countdown, best sellers, shop-by-solution, new arrivals, brands strip, why-choose-us, testimonials, CTA band, newsletter)
- Global: sticky header w/ mega-menu, announcement bar, cart drawer, wishlist, mobile bottom nav, footer

**Phase 2 — Catalog**
- `/products` and `/category/:slug` — Product Listing (filters: category, brand, price range, spec attributes, in-stock toggle; sort; pagination)
- `/product/:slug` — Product Details (gallery, price/stock, qty stepper, add to cart/buy now, spec tabs, reviews, related products, sticky mobile add-to-cart bar)

**Phase 3 — Cart & Checkout**
- Cart drawer + `/cart` full page
- `/checkout` — contact info, cascading **Division → District → Upazila** address selector (seed this as static JSON data, Bangladesh divisions/districts), delivery method (courier vs shop pickup), payment method (COD default / bKash / Nagad — manual reference-number capture, no live payment gateway integration yet), order notes, order summary sidebar
- `/order-confirmation/:orderId` — Thank You page with order summary, delivery ETA, WhatsApp support link

**Phase 4 — Solar Calculator + Quotation (see Section 6 for exact logic)**
- `/solar-calculator` — 3-step wizard → result cards → CTA into quotation form
- `/get-quotation` — lead capture form (pre-fillable from calculator via route state or query params)
- `/quotation-received/:refId` — confirmation screen (same visual pattern as order confirmation)

**Phase 5 — Customer account**
- `/account` dashboard, `/account/orders` (+ order detail w/ status timeline), `/account/wishlist`, `/account/addresses`, `/account/profile`
- Auth pages: `/login`, `/register`, `/forgot-password`

**Phase 6 — Admin panel** (route-guarded, `role = admin` only, separate layout with collapsible sidebar)
- `/admin` dashboard (KPI cards: today's sales, orders, pending, low-stock; recent orders; top products)
- `/admin/orders` (table, status update, filters) + order detail drawer
- `/admin/products` (table + create/edit form: images upload, category/brand, price, stock, specs as key-value, description, status)
- `/admin/categories`, `/admin/brands`
- `/admin/customers`
- `/admin/coupons`
- `/admin/leads` — table of Solar Calculator / Quotation Request submissions (columns: name, phone, location, load, backup, budget, status pipeline `new → contacted → quoted → converted/lost`, source), with a detail view to update status and add notes
- `/admin/settings` — delivery charges (inside/outside Dhaka), payment method toggles, store contact info

---

## 5. BANGLADESH-SPECIFIC BUSINESS LOGIC

- **Currency:** ৳ (BDT), formatted with comma separators, no decimals unless needed.
- **Address:** cascading Division → District → Upazila selects (seed a small static dataset; don't call an external API).
- **Delivery charge:** computed from a `delivery_zones` table/setting — flat "Inside Dhaka" vs "Outside Dhaka" rate, editable from `/admin/settings`.
- **Payment methods:** COD (default, no extra fields), bKash/Nagad (customer enters their sending number + transaction ID, stored on the order for manual admin verification — do **not** build a real payment gateway integration unless explicitly asked later).
- **Courier:** store a `courier_status` field on orders (placeholder for future Steadfast API integration — stub the service call, don't fake real tracking data).
- **SMS notifications:** stub a `sendSms(phone, message)` service function (placeholder for sms.net.bd integration later) — call it (no-op or console.log for now) on order confirmation and lead submission.
- Support both English and Bangla UI strings where the design reference shows Bangla — set up a simple i18n string map, not a full i18n library unless the app grows.

---

## 6. SOLAR CALCULATOR — EXACT CALCULATION LOGIC

Implement as a pure function, unit-tested if practical:

```
totalLoadWatt = sum(appliance.qty * appliance.watt)  // from Step 1
backupHours = user input (1–12)

inverterVA = ceil(totalLoadWatt * 1.275)              // round up to nearest common size: 400/600/800/1000/1500/2000/2600VA
batteryAh  = (totalLoadWatt * backupHours) / (12 * 0.5 * 0.85)   // assume 12V battery, 50% DoD, 85% inverter efficiency
solarWp    = ceil((totalLoadWatt * dailyUsageHours) / 4.5)       // 4.5 = avg BD sun-hours; dailyUsageHours default = backupHours if not otherwise specified, expose as adjustable assumption
```

Round `batteryAh` and `solarWp` to sensible market sizes (e.g., nearest 10Ah, nearest 55W panel multiples) and show the underlying numbers in the "How we calculated this" accordion exactly as designed.

This is a **client-side calculation only** — no database write for the calculator itself. Only the Quotation Request submission writes to `leads`.

---

## 7. AUTH / ROLES / RLS SUMMARY

- Three effective access levels: **guest** (browse, checkout as guest, submit quotation), **customer** (all guest actions + account/orders/wishlist history), **admin** (full CRUD via `/admin/*`, protected by a route guard checking `profiles.role = 'admin'`).
- Guest checkout must work without forcing signup — collect name/phone/address inline on the order.
- Enforce authorization in Supabase RLS (see SQL file), **not just in the frontend** — every admin table must reject non-admin writes at the database level.

---

## 8. NON-FUNCTIONAL REQUIREMENTS

- Fully responsive, mobile-first (most BD traffic is mobile) — validate every page at 375px width.
- Dark mode must be pixel-correct with the design reference, not a generic inversion.
- Loading states: skeleton loaders for lists/cards, spinners for form submits, optimistic UI for cart actions where safe.
- Toast notifications for add-to-cart, order placed, lead submitted, errors.
- Reasonable SEO basics: page titles, meta descriptions, semantic HTML, product schema markup on PDP.
- Keep bundle size sane — lazy-load admin routes and heavy pages.

---

## 9. WHAT NOT TO DO

- Don't invent a payment gateway integration (Stripe/PayPal) — Bangladesh uses COD/bKash/Nagad manual-reference flow as described.
- Don't build a live courier tracking integration — stub it.
- Don't restyle away from the `index.html` design reference — match its tokens and layout precisely.
- Don't skip RLS — every table needs real policies, this will hold real customer data.

---

## 10. BUILD APPROACH

1. Scaffold project + Tailwind theme + shadcn setup + fonts + dark/light provider.
2. Run the Supabase migration from `RSP_Supabase_Schema.sql`.
3. Build the shared component library (Section 2).
4. Build phases in the order listed in Section 4, confirming each phase renders correctly with real Supabase data (seed a handful of sample products/categories) before moving on.
5. Wire the Solar Calculator → Quotation Request → Leads pipeline last within Phase 4, end-to-end tested.

Ask me before making any architectural decision not covered above (e.g., state management for a feature not listed, third-party libraries not named here).
