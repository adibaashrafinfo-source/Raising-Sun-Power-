# Rising Sun Power BD

E-commerce platform for a solar & electrical products supplier in Bangladesh, built with Vite, React, TypeScript, Tailwind CSS and Supabase.

See `RSP_ClaudeCode_Build_Prompt.md` for the full build spec and `RSP_Supabase_Schema.sql` for the database schema. Design reference exports live in `design-reference/`.

## Status

**Phase 1 — Storefront shell (in progress)**

- [x] Project scaffold: Vite + React + TypeScript + Tailwind v4 + path aliases
- [x] Design tokens (brand colors, fonts, radii) ported as CSS variables / Tailwind theme
- [x] Light/dark theme provider (class-based, localStorage-persisted, pixel-matched to design)
- [x] Shared component library: Button, Input, Card, Badge, Tabs, Dialog, Toast, Skeleton, Stepper
- [x] Global shell: announcement bar, sticky header w/ mega-menu, cart drawer, mobile menu drawer, mobile bottom nav, footer
- [x] Homepage: hero, trust chips, category grid, best sellers, deals countdown, shop-by-solution, new arrivals, brands strip, why-choose-us, testimonials, CTA band, newsletter

**Phase 2 — Catalog (done, pending live data)**

- [x] Supabase client wired to a connected project (`.env`), with a 10s fetch timeout + query error states
- [x] Database types + TanStack Query hooks for categories/brands/products/reviews
- [x] Product Listing Page (`/products`, `/category/:slug`) — filters, sort, pagination, grid/list view, mobile filter sheet
- [x] Product Details Page (`/product/:slug`) — gallery, spec tabs, reviews, related products, sticky mobile add-to-cart bar
- [ ] Run the migration + seed (see below) to see real data instead of the empty/error states
- [ ] Phase 3+: cart/checkout, solar calculator, accounts, admin panel

## Supabase setup

A Supabase project is connected (`.env` has `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`), but **the migration has not been run yet** — this dev environment's outbound network is blocked from reaching `*.supabase.co`, so the schema and seed data must be applied manually:

1. Open your project's [SQL Editor](https://supabase.com/dashboard/project/kjjizhtrlhxgxdxfjciz/sql/new).
2. Paste the full contents of `RSP_Supabase_Schema.sql` and run it. This creates every table, the `is_admin()` helper, and all RLS policies.
3. Paste the full contents of `supabase/seed.sql` and run it. This adds the 8 categories, 12 brands and 8 sample products used by the catalog pages (safe to re-run — it upserts by slug).
4. Confirm in **Table Editor** that `products`, `categories`, `brands` etc. have rows, then reload the app — `/products` and the homepage will start pulling live data.

If you'd rather use the Supabase CLI locally: `supabase link --project-ref kjjizhtrlhxgxdxfjciz`, then `supabase db push` (schema) followed by running `supabase/seed.sql` via `psql "$DATABASE_URL" -f supabase/seed.sql`.

## Getting started

```bash
npm install
npm run dev
```

`.env` already has the connected project's URL/anon key (gitignored — never commit it). Use `.env.example` as the template for a different environment.

## Tech stack

Vite, React 19, TypeScript, Tailwind CSS v4, shadcn/ui-style components (Radix primitives), TanStack Query, React Router, React Hook Form + Zod, Zustand, Supabase.
