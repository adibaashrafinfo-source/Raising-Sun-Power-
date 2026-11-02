-- ============================================================================
-- Quotations and invoices — full module
--
-- 1. quotations: saved quotations (list, edit, duplicate, status, convert to
--    an invoice). Visible to admin and sales, like orders.
-- 2. orders: the extra fields an invoice needs (due date, VAT, customer email
--    and company). Admin-made invoices are orders numbered INV-..., so their
--    payments, stock and reports share the orders tables.
--
-- Run once in the Supabase SQL editor. Safe to re-run.
-- ============================================================================

-- ---------- Quotations ----------
create table if not exists quotations (
  id uuid primary key default gen_random_uuid(),
  number text not null unique,
  quote_date date not null default current_date,
  valid_until date,
  status text not null default 'draft'
    check (status in ('draft', 'sent', 'accepted', 'rejected', 'converted')),
  customer jsonb not null default '{}'::jsonb,   -- name, phone, email, company, location
  lines jsonb not null default '[]'::jsonb,      -- product_name, qty, unit_price, unit, warranties, serial
  fees jsonb not null default '{}'::jsonb,       -- service, installation, delivery, other, discount
  vat_percent numeric(5,2) not null default 0,
  notes text,
  terms text,
  subtotal numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  invoice_id uuid references orders(id) on delete set null,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_quotations_created on quotations (created_at desc);
create index if not exists idx_quotations_status on quotations (status);

alter table quotations enable row level security;

drop policy if exists "quotations_sales_select" on quotations;
create policy "quotations_sales_select" on quotations
  for select to authenticated using (fn_is_sales());

drop policy if exists "quotations_sales_insert" on quotations;
create policy "quotations_sales_insert" on quotations
  for insert to authenticated with check (fn_is_sales());

drop policy if exists "quotations_sales_update" on quotations;
create policy "quotations_sales_update" on quotations
  for update to authenticated using (fn_is_sales()) with check (fn_is_sales());

drop policy if exists "quotations_sales_delete" on quotations;
create policy "quotations_sales_delete" on quotations
  for delete to authenticated using (fn_is_sales());

-- ---------- Invoice fields on orders ----------
alter table orders add column if not exists due_date date;
alter table orders add column if not exists vat_percent numeric(5,2) not null default 0;
alter table orders add column if not exists vat_amount numeric(12,2) not null default 0;
alter table orders add column if not exists customer_email text;
alter table orders add column if not exists customer_company text;

-- Orders could not be deleted before: RLS was on with no DELETE policy.
-- Included here so one file does it all (same as rsp_orders_delete_policy.sql).
drop policy if exists "role_delete_orders" on orders;
create policy "role_delete_orders" on orders for delete to authenticated
using (fn_is_sales());

-- Editing an invoice replaces its items, so order_items needs a delete policy
-- too (it only had select and insert).
drop policy if exists "order_items_sales_delete" on order_items;
create policy "order_items_sales_delete" on order_items for delete to authenticated
using (fn_is_sales());

notify pgrst, 'reload schema';
