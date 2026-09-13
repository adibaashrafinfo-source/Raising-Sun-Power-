-- ============================================================================
-- Rising Sun Power BD (RSP) — Site Content: Social Links & Contact Messages
-- Supabase / PostgreSQL Schema Addition
-- ============================================================================
-- HOW TO USE:
--   Run this once in the Supabase SQL Editor (reuses fn_is_admin() from the
--   Inventory & Finance schema). Idempotent — safe to re-run.
--
-- WHAT THIS ADDS:
--   1. Widens the existing single-row `settings` table with social media
--      links, a public contact email, and a WhatsApp number — all editable
--      from /admin/settings so RSP can add/update them without a deploy.
--   2. contact_messages — stores submissions from the new /contact page's
--      form. Publicly insertable (anyone can submit) but only admins can
--      read/update/delete.
-- ============================================================================

alter table settings add column if not exists facebook_url text;
alter table settings add column if not exists instagram_url text;
alter table settings add column if not exists youtube_url text;
alter table settings add column if not exists linkedin_url text;
alter table settings add column if not exists tiktok_url text;
alter table settings add column if not exists contact_email text;
alter table settings add column if not exists whatsapp_number text default '8801705742208';

create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  subject text not null,
  message text not null,
  status text not null default 'new' check (status in ('new','read')),
  created_at timestamptz not null default now()
);

alter table contact_messages enable row level security;

drop policy if exists "public_insert_contact_messages" on contact_messages;
create policy "public_insert_contact_messages" on contact_messages for insert with check (true);

drop policy if exists "admin_select_contact_messages" on contact_messages;
create policy "admin_select_contact_messages" on contact_messages for select using (fn_is_admin());

drop policy if exists "admin_update_contact_messages" on contact_messages;
create policy "admin_update_contact_messages" on contact_messages for update using (fn_is_admin());

drop policy if exists "admin_delete_contact_messages" on contact_messages;
create policy "admin_delete_contact_messages" on contact_messages for delete using (fn_is_admin());

notify pgrst, 'reload schema';

-- ============================================================================
-- END OF SITE CONTENT SCHEMA ADDITION
-- ============================================================================
