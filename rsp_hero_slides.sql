-- ============================================================================
-- Homepage hero slider
-- Slides are rows now, so the banner is edited from Admin → Hero Slider:
-- upload an image, write the copy, set the buttons, order them, switch one off.
-- With no active rows the site falls back to the built-in slides in
-- src/data/home-content.ts, so the homepage is never empty.
-- Staff who manage products manage these too — same fn_is_inventory_staff().
-- APPLIED 2026-10-01 as migration hero_slides.
-- ============================================================================

create table if not exists hero_slides (
  id uuid primary key default gen_random_uuid(),
  image_url text,
  badge text,
  title text,
  highlight text,
  body text,
  cta_label text,
  cta_href text,
  secondary_label text,
  secondary_href text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_hero_slides_order on hero_slides(sort_order);

drop trigger if exists trg_hero_slides_updated_at on hero_slides;
create trigger trg_hero_slides_updated_at
before update on hero_slides for each row execute function fn_set_updated_at();

alter table hero_slides enable row level security;

drop policy if exists "public_read_hero_slides" on hero_slides;
create policy "public_read_hero_slides" on hero_slides
for select using (is_active);

drop policy if exists "staff_write_hero_slides" on hero_slides;
create policy "staff_write_hero_slides" on hero_slides
for all to authenticated using (fn_is_inventory_staff()) with check (fn_is_inventory_staff());

notify pgrst, 'reload schema';
