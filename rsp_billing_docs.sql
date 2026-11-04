-- ============================================================================
-- Billing (invoices, quotations, finance, customers, catalog, settings)
-- One table holds every billing record as a JSON document, keyed by
-- (col, id). col = invoices | customers | products | expenses | activities | config.
--
-- Who can do what (enforced here, not just in the screen):
--   admin, sales, accountant : read and write invoices, customers, catalog, activities
--   admin only               : delete anything, write settings (config),
--                              and read/write expenses (the Finance screen)
-- Run once in the Supabase SQL editor. Safe to re-run.
-- ============================================================================

create table if not exists billing_docs (
  col text not null,
  id text not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (col, id)
);

create index if not exists idx_billing_docs_col_updated on billing_docs (col, updated_at desc);

create or replace function fn_is_billing() returns boolean language sql stable security definer as $$
  select exists (select 1 from profiles where id = auth.uid() and role in ('admin','sales','accountant'));
$$;

alter table billing_docs enable row level security;

drop policy if exists "billing_docs_select" on billing_docs;
create policy "billing_docs_select" on billing_docs for select to authenticated
using (
  case when col = 'expenses' then fn_is_admin() else fn_is_billing() end
);

drop policy if exists "billing_docs_insert" on billing_docs;
create policy "billing_docs_insert" on billing_docs for insert to authenticated
with check (
  case when col in ('expenses', 'config') then fn_is_admin() else fn_is_billing() end
);

drop policy if exists "billing_docs_update" on billing_docs;
create policy "billing_docs_update" on billing_docs for update to authenticated
using (case when col in ('expenses', 'config') then fn_is_admin() else fn_is_billing() end)
with check (case when col in ('expenses', 'config') then fn_is_admin() else fn_is_billing() end);

drop policy if exists "billing_docs_delete" on billing_docs;
create policy "billing_docs_delete" on billing_docs for delete to authenticated
using (fn_is_admin());

notify pgrst, 'reload schema';
