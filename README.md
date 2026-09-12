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
- [ ] Supabase migration (waiting on a connected Supabase project)
- [ ] Phase 2+: catalog, cart/checkout, solar calculator, accounts, admin panel

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in Supabase URL/anon key when ready
npm run dev
```

## Tech stack

Vite, React 19, TypeScript, Tailwind CSS v4, shadcn/ui-style components (Radix primitives), TanStack Query, React Router, React Hook Form + Zod, Zustand, Supabase.
