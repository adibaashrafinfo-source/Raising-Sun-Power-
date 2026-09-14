-- ============================================================================
-- Rising Sun Power BD (RSP) — Site Content / CMS
-- Supabase / PostgreSQL Schema Addition
-- ============================================================================
-- HOW TO USE:
--   Run once in the Supabase SQL Editor (reuses fn_is_admin() and
--   fn_set_updated_at()). Idempotent — safe to re-run.
--
-- WHAT THIS ADDS:
--   1. site_content — a single-row, admin-editable table holding the site's
--      logos, hero copy/image, footer text, About-page copy, and
--      showroom/contact details. Publicly readable; only admins can update.
--   2. A public `site-assets` storage bucket for CMS image uploads (logos,
--      hero image) with public read + admin-only write policies.
--   Editable from /admin/cms.
-- ============================================================================

create table if not exists site_content (
  id int primary key default 1,
  header_logo_url text,
  footer_logo_url text,
  hero_image_url text,
  hero_badge text default 'Bangladesh''s trusted solar & electrical store',
  hero_headline_prefix text default 'Powering Bangladesh with',
  hero_headline_highlight text default 'green & renewable energy.',
  hero_subheading text default 'Genuine solar panels, inverters, batteries, MCB & MCCB and complete power solutions — delivered nationwide with Cash on Delivery, bKash & Nagad.',
  footer_description text default 'Genuine solar & electrical products with engineered reliability — powering homes and businesses across Bangladesh with clean, renewable energy.',
  footer_designed_by text default 'Abrar IT',
  about_badge text default 'Bangladesh''s trusted solar & electrical store',
  about_title text default 'Powering Bangladeshi homes and businesses',
  about_highlight text default 'since day one.',
  about_intro text,
  about_story text,
  showroom_1_name text default 'Dhaka Showroom',
  showroom_1_address text default 'Nawabpur Road, Electrical Market, Dhaka 1100',
  showroom_2_name text default 'Chattogram Branch',
  showroom_2_address text default 'Reazuddin Bazar, Kotwali, Chattogram 4000',
  business_hours text default 'Sat–Thu, 10am–8pm',
  updated_at timestamptz not null default now(),
  constraint site_content_single_row check (id = 1)
);

insert into site_content (id) values (1) on conflict (id) do nothing;

drop trigger if exists trg_site_content_updated_at on site_content;
create trigger trg_site_content_updated_at
before update on site_content for each row execute function fn_set_updated_at();

alter table site_content enable row level security;

drop policy if exists "public_read_site_content" on site_content;
create policy "public_read_site_content" on site_content for select using (true);

drop policy if exists "admin_update_site_content" on site_content;
create policy "admin_update_site_content" on site_content for update using (fn_is_admin());

-- Storage bucket for CMS-uploaded images (logos, hero, etc.)
insert into storage.buckets (id, name, public)
values ('site-assets', 'site-assets', true)
on conflict (id) do nothing;

drop policy if exists "public_read_site_assets" on storage.objects;
create policy "public_read_site_assets" on storage.objects
for select using (bucket_id = 'site-assets');

drop policy if exists "admin_insert_site_assets" on storage.objects;
create policy "admin_insert_site_assets" on storage.objects
for insert to authenticated
with check (bucket_id = 'site-assets' and fn_is_admin());

drop policy if exists "admin_update_site_assets" on storage.objects;
create policy "admin_update_site_assets" on storage.objects
for update to authenticated
using (bucket_id = 'site-assets' and fn_is_admin());

drop policy if exists "admin_delete_site_assets" on storage.objects;
create policy "admin_delete_site_assets" on storage.objects
for delete to authenticated
using (bucket_id = 'site-assets' and fn_is_admin());

notify pgrst, 'reload schema';

-- ============================================================================
-- END OF CMS SCHEMA ADDITION
-- ============================================================================
