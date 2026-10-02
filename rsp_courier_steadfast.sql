-- ============================================================================
-- Steadfast Courier integration
-- APPLIED 2026-10-02 to the live project.
--
-- The API key and secret live in courier_settings and are read only by the
-- edge functions (service role). The browser is deliberately not granted those
-- two columns, so even an admin session cannot read them back — it can only
-- overwrite them. has_credentials is what the Settings page reads instead.
-- ============================================================================

create table if not exists courier_settings (
  id uuid primary key default gen_random_uuid(),
  provider text not null unique,
  api_key text not null default '',
  secret_key text not null default '',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table courier_settings
  add column if not exists has_credentials boolean
  generated always as (length(coalesce(api_key,'')) > 0 and length(coalesce(secret_key,'')) > 0) stored;

drop trigger if exists trg_courier_settings_updated_at on courier_settings;
create trigger trg_courier_settings_updated_at
before update on courier_settings for each row execute function fn_set_updated_at();

alter table courier_settings enable row level security;

drop policy if exists "admin_all_courier_settings" on courier_settings;
create policy "admin_all_courier_settings" on courier_settings
for all to authenticated using (fn_is_admin()) with check (fn_is_admin());

-- Column-level grants: the keys are write-only from the browser.
revoke all on courier_settings from authenticated, anon;
grant select (id, provider, is_active, has_credentials, created_at, updated_at)
  on courier_settings to authenticated;
grant update (api_key, secret_key, is_active) on courier_settings to authenticated;

insert into courier_settings (provider) values ('steadfast')
on conflict (provider) do nothing;

-- Courier fields on orders. courier_status already existed as a placeholder for
-- exactly this, so it is reused rather than duplicated.
alter table orders add column if not exists courier_provider text;
alter table orders add column if not exists consignment_id text;
alter table orders add column if not exists courier_tracking_code text;
alter table orders add column if not exists courier_status_updated_at timestamptz;
alter table orders add column if not exists sent_to_courier_at timestamptz;

create index if not exists idx_orders_courier_provider on orders(courier_provider)
  where courier_provider is not null;

notify pgrst, 'reload schema';

-- ----------------------------------------------------------------------------
-- Optional: refresh every open consignment on a schedule.
-- Run this once, in the Supabase SQL editor, after storing the service-role key
-- in Vault. It is NOT applied automatically because it needs that secret.
--
--   create extension if not exists pg_cron;
--   create extension if not exists pg_net;
--
--   select cron.schedule(
--     'sync-courier-statuses',
--     '*/30 * * * *',
--     $$
--     select net.http_post(
--       url := 'https://kjjizhtrlhxgxdxfjciz.supabase.co/functions/v1/sync-all-courier-statuses',
--       headers := jsonb_build_object(
--         'Content-Type', 'application/json',
--         'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets
--                                        where name = 'service_role_key')
--       ),
--       body := '{}'::jsonb
--     );
--     $$
--   );
-- ----------------------------------------------------------------------------
