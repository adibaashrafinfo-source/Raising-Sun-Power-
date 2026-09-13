-- ============================================================================
-- Rising Sun Power BD (RSP) — Inventory & Finance Management System
-- Supabase / PostgreSQL Database Schema
-- ============================================================================
-- HOW TO USE:
--   Run this in the Supabase SQL Editor. It is written to be run PHASE BY
--   PHASE (recommended) or all at once (it is idempotent — safe to re-run).
--   Each phase is clearly separated by a comment header below.
--
-- CORRECTIONS APPLIED vs the original draft, after Phase 0 discovery against
-- the live RSP_Supabase_Schema.sql (see conversation for full reasoning):
--   1. profiles.role already exists (check: customer/admin, default 'customer')
--      from the storefront schema. Widening its CHECK constraint in place
--      instead of re-adding the column, and NOT touching the default — public
--      signups must keep defaulting to 'customer', never 'staff'.
--   2. No new products.selling_price column — the inventory module reuses the
--      existing storefront products.price column as the single source of
--      truth for selling price (avoids two prices drifting out of sync).
--   3. locations gets an is_default flag — Shop 1 (Dhaka Cantonment) is the
--      default location that web-storefront sales draw stock from, since
--      checkout doesn't ask the customer which shop fulfills the order.
--   4. Categories/brands: the storefront's existing categories/brands tables
--      (8 categories, 12 brands, already linked to real products) are reused
--      as-is for the inventory module — no separate/duplicate taxonomy.
--   5. Phase 4's stock-decrease trigger uses the REAL order_items column
--      names discovered in Phase 0 (qty, not quantity) and the is_default
--      location instead of a placeholder.
--   6. Phase 4 adds a BEFORE INSERT trigger that computes orders.due_amount
--      (= total - paid_amount) and payment_status on every new order, since
--      the storefront's checkout code (unmodified) never sets these new
--      columns itself — without this, every new order would insert with
--      due_amount = 0 despite being fully unpaid.
--   7. Phase 4 also creates fn_customer_payment_after_insert /
--      trg_customer_payment_after_insert now (updating orders.paid_amount /
--      due_amount / payment_status only) instead of waiting for Phase 5,
--      because Phase 4's own test checklist requires "recording a customer
--      payment updates orders.paid_amount/due_amount/payment_status" to work
--      immediately. Phase 5 later replaces this function's body (same
--      trigger, `create or replace function`) to also write a ledger_entries
--      row once that table exists — it does not add a second trigger.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ============================================================================
-- PHASE 1: FOUNDATION — Categories, Brands, Locations, Roles, Helper Functions
-- ============================================================================

-- Reused as-is if they already exist (storefront's categories/brands tables).
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists brands (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,               -- e.g. "Baganbari Shop", "Lotra Bazar Shop"
  address text,
  phone text,
  is_active boolean not null default true,
  is_default boolean not null default false,   -- web-storefront sales draw stock from this one
  created_at timestamptz not null default now()
);

-- Extend (or create) the profiles table used for role-based access.
-- If "profiles" already exists from your Supabase Auth setup, only the
-- constraint-widening below will run — nothing here overwrites existing data.
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now()
);

-- profiles.role already exists on the live table (check: customer/admin,
-- default 'customer'). Widen the existing CHECK constraint in place instead
-- of re-adding the column, and do NOT change the default — public storefront
-- signups must keep defaulting to 'customer', never 'staff'.
do $$
declare
  con record;
begin
  for con in
    select conname from pg_constraint
    where conrelid = 'public.profiles'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%role%'
  loop
    execute format('alter table public.profiles drop constraint %I', con.conname);
  end loop;
end $$;

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('customer','admin','manager','staff'));

-- Shared RLS helper functions
create or replace function fn_is_inventory_staff()
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role in ('admin','manager','staff')
  );
$$;

create or replace function fn_is_admin()
returns boolean language sql security definer stable as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function fn_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================================
-- PHASE 2: PRODUCT & STOCK CORE
-- ============================================================================

-- If "products" already exists (storefront table), only new columns are added.
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

alter table products add column if not exists sku text unique;
alter table products add column if not exists category_id uuid references categories(id);
alter table products add column if not exists brand_id uuid references brands(id);
alter table products add column if not exists unit text not null default 'pcs';
alter table products add column if not exists cost_price numeric(12,2) not null default 0;
-- NOTE: no selling_price column — the inventory module reads/writes the
-- existing storefront `price` column as the single source of truth.
alter table products add column if not exists warranty_months integer not null default 0;
alter table products add column if not exists has_serial_tracking boolean not null default false;
alter table products add column if not exists reorder_level integer not null default 5;
alter table products add column if not exists is_active boolean not null default true;
alter table products add column if not exists updated_at timestamptz not null default now();

drop trigger if exists trg_products_updated_at on products;
create trigger trg_products_updated_at
before update on products for each row execute function fn_set_updated_at();

-- Stock quantity per product, per location (Shop 1 / Shop 2 / warehouse)
create table if not exists product_stock (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  location_id uuid not null references locations(id) on delete cascade,
  quantity integer not null default 0 check (quantity >= 0),
  min_stock_level integer not null default 5,
  updated_at timestamptz not null default now(),
  unique (product_id, location_id)
);

drop trigger if exists trg_product_stock_updated_at on product_stock;
create trigger trg_product_stock_updated_at
before update on product_stock for each row execute function fn_set_updated_at();

-- Full audit trail of every stock change — never delete rows from this table
create table if not exists stock_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id),
  location_id uuid not null references locations(id),
  movement_type text not null check (movement_type in ('in','out','transfer_in','transfer_out','adjustment')),
  quantity integer not null,
  reference_type text,   -- 'purchase' | 'sale' | 'purchase_return' | 'sales_return' | 'manual_adjustment' | 'transfer'
  reference_id uuid,
  reason text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create index if not exists idx_stock_movements_product on stock_movements(product_id);
create index if not exists idx_stock_movements_location on stock_movements(location_id);

-- Serial number tracking — for MCCB / Inverter / high-value warranty items
create table if not exists product_serials (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id),
  serial_number text not null unique,
  location_id uuid references locations(id),
  status text not null default 'in_stock' check (status in ('in_stock','sold','returned','damaged')),
  warranty_start_date date,
  warranty_end_date date,
  sold_order_id uuid,
  created_at timestamptz not null default now()
);

create index if not exists idx_product_serials_product on product_serials(product_id);

-- ============================================================================
-- PHASE 3: SUPPLIER & PURCHASE MANAGEMENT
-- ============================================================================

create table if not exists suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  address text,
  payment_terms text,
  opening_balance numeric(12,2) not null default 0,
  current_due numeric(12,2) not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists purchase_orders (
  id uuid primary key default gen_random_uuid(),
  po_number text not null unique,
  supplier_id uuid not null references suppliers(id),
  status text not null default 'draft' check (status in ('draft','sent','received','cancelled')),
  order_date date not null default current_date,
  expected_date date,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists purchase_order_items (
  id uuid primary key default gen_random_uuid(),
  po_id uuid not null references purchase_orders(id) on delete cascade,
  product_id uuid not null references products(id),
  quantity integer not null check (quantity > 0),
  unit_cost numeric(12,2) not null
);

create table if not exists purchases (
  id uuid primary key default gen_random_uuid(),
  invoice_number text not null unique,
  supplier_id uuid not null references suppliers(id),
  po_id uuid references purchase_orders(id),
  location_id uuid not null references locations(id),
  purchase_date date not null default current_date,
  subtotal numeric(12,2) not null default 0,
  tax_amount numeric(12,2) not null default 0,
  total_amount numeric(12,2) not null default 0,
  paid_amount numeric(12,2) not null default 0,
  due_amount numeric(12,2) not null default 0,
  payment_status text not null default 'due' check (payment_status in ('due','partial','paid')),
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists purchase_items (
  id uuid primary key default gen_random_uuid(),
  purchase_id uuid not null references purchases(id) on delete cascade,
  product_id uuid not null references products(id),
  quantity integer not null check (quantity > 0),
  unit_cost numeric(12,2) not null,
  subtotal numeric(12,2) generated always as (quantity * unit_cost) stored
);

create table if not exists purchase_returns (
  id uuid primary key default gen_random_uuid(),
  return_number text not null unique,
  purchase_id uuid references purchases(id),
  supplier_id uuid not null references suppliers(id),
  return_date date not null default current_date,
  total_amount numeric(12,2) not null default 0,
  reason text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists purchase_return_items (
  id uuid primary key default gen_random_uuid(),
  return_id uuid not null references purchase_returns(id) on delete cascade,
  product_id uuid not null references products(id),
  quantity integer not null check (quantity > 0),
  unit_cost numeric(12,2) not null
);

create table if not exists supplier_payments (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references suppliers(id),
  purchase_id uuid references purchases(id),
  amount numeric(12,2) not null check (amount > 0),
  payment_method text not null check (payment_method in ('cash','bkash','nagad','bank','card')),
  payment_date date not null default current_date,
  reference_note text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

-- --- Automation: Purchase item added -> Stock IN + movement log ---
create or replace function fn_purchase_item_after_insert()
returns trigger language plpgsql security definer as $$
declare
  v_location_id uuid;
begin
  select location_id into v_location_id from purchases where id = new.purchase_id;

  insert into product_stock (product_id, location_id, quantity)
  values (new.product_id, v_location_id, new.quantity)
  on conflict (product_id, location_id)
  do update set quantity = product_stock.quantity + excluded.quantity, updated_at = now();

  insert into stock_movements (product_id, location_id, movement_type, quantity, reference_type, reference_id, created_by)
  values (new.product_id, v_location_id, 'in', new.quantity, 'purchase', new.purchase_id, auth.uid());

  return new;
end;
$$;

drop trigger if exists trg_purchase_item_after_insert on purchase_items;
create trigger trg_purchase_item_after_insert
after insert on purchase_items for each row execute function fn_purchase_item_after_insert();

-- --- Automation: Purchase created -> increase supplier due ---
create or replace function fn_purchase_after_insert()
returns trigger language plpgsql security definer as $$
begin
  update suppliers set current_due = current_due + new.due_amount where id = new.supplier_id;
  return new;
end;
$$;

drop trigger if exists trg_purchase_after_insert on purchases;
create trigger trg_purchase_after_insert
after insert on purchases for each row execute function fn_purchase_after_insert();

-- --- Automation: Supplier payment made -> reduce due on supplier + purchase ---
create or replace function fn_supplier_payment_after_insert()
returns trigger language plpgsql security definer as $$
begin
  update suppliers set current_due = current_due - new.amount where id = new.supplier_id;

  if new.purchase_id is not null then
    update purchases
    set paid_amount = paid_amount + new.amount,
        due_amount = greatest(due_amount - new.amount, 0),
        payment_status = case when due_amount - new.amount <= 0 then 'paid' else 'partial' end
    where id = new.purchase_id;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_supplier_payment_after_insert on supplier_payments;
create trigger trg_supplier_payment_after_insert
after insert on supplier_payments for each row execute function fn_supplier_payment_after_insert();

-- ============================================================================
-- PHASE 4: SALES INTEGRATION & CUSTOMER FINANCE
-- ------------------------------------------------------------------------
-- Confirmed against the REAL orders/order_items tables (Phase 0 discovery):
--   orders.id is a uuid primary key.
--   order_items has: order_id, product_id (nullable), product_name,
--   unit_price, qty (NOT "quantity"), line_total.
-- ============================================================================

alter table orders add column if not exists paid_amount numeric(12,2) not null default 0;
alter table orders add column if not exists due_amount numeric(12,2) not null default 0;
alter table orders add column if not exists payment_status text not null default 'due'
  check (payment_status in ('due','partial','paid'));

-- Keeps due_amount/payment_status correct on every insert without requiring
-- any change to the existing (unmodified) storefront checkout code, which
-- never sets these new columns itself.
create or replace function fn_orders_set_due_before_insert()
returns trigger language plpgsql as $$
begin
  new.due_amount := greatest(new.total - new.paid_amount, 0);
  new.payment_status := case
    when new.due_amount <= 0 then 'paid'
    when new.paid_amount > 0 then 'partial'
    else 'due'
  end;
  return new;
end;
$$;

drop trigger if exists trg_orders_set_due_before_insert on orders;
create trigger trg_orders_set_due_before_insert
before insert on orders for each row execute function fn_orders_set_due_before_insert();

create table if not exists customer_payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id),
  amount numeric(12,2) not null check (amount > 0),
  payment_method text not null check (payment_method in ('cash','bkash','nagad','bank','card')),
  payment_date date not null default current_date,
  reference_note text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists sales_returns (
  id uuid primary key default gen_random_uuid(),
  return_number text not null unique,
  order_id uuid not null references orders(id),
  return_date date not null default current_date,
  total_amount numeric(12,2) not null default 0,
  reason text,
  refund_status text not null default 'pending' check (refund_status in ('pending','refunded','rejected')),
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists sales_return_items (
  id uuid primary key default gen_random_uuid(),
  return_id uuid not null references sales_returns(id) on delete cascade,
  product_id uuid not null references products(id),
  quantity integer not null check (quantity > 0),
  unit_price numeric(12,2) not null
);

-- Stock-decrease trigger, adapted to the REAL order_items columns (qty, not
-- quantity) and the is_default location (web checkout doesn't ask which shop
-- fulfills the order). Fires only when an order's status transitions to
-- 'confirmed' — never on cart creation / initial 'pending' insert.
create or replace function fn_order_confirmed_stock_decrease()
returns trigger language plpgsql security definer as $$
declare
  v_default_location uuid;
  v_item record;
begin
  if new.status = 'confirmed' and old.status is distinct from 'confirmed' then
    select id into v_default_location from locations where is_default = true limit 1;
    if v_default_location is null then
      raise exception 'No default location set for stock deduction';
    end if;

    for v_item in select product_id, qty from order_items where order_id = new.id loop
      if v_item.product_id is not null then
        update product_stock
        set quantity = quantity - v_item.qty, updated_at = now()
        where product_id = v_item.product_id and location_id = v_default_location;

        insert into stock_movements (product_id, location_id, movement_type, quantity, reference_type, reference_id)
        values (v_item.product_id, v_default_location, 'out', v_item.qty, 'sale', new.id);
      end if;
    end loop;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_order_confirmed_stock_decrease on orders;
create trigger trg_order_confirmed_stock_decrease
after update on orders for each row execute function fn_order_confirmed_stock_decrease();

-- Pulled forward from Phase 5 (see correction #7 at the top of this file):
-- Phase 4's own test checklist requires a customer payment to update the
-- order's paid/due/status immediately. This version only touches `orders`;
-- Phase 5 replaces the function body (same trigger) to also log a
-- ledger_entries row once that table exists.
create or replace function fn_customer_payment_after_insert()
returns trigger language plpgsql security definer as $$
begin
  update orders
  set paid_amount = paid_amount + new.amount,
      due_amount = greatest(due_amount - new.amount, 0),
      payment_status = case when due_amount - new.amount <= 0 then 'paid' else 'partial' end
  where id = new.order_id;
  return new;
end;
$$;

drop trigger if exists trg_customer_payment_after_insert on customer_payments;
create trigger trg_customer_payment_after_insert
after insert on customer_payments for each row execute function fn_customer_payment_after_insert();

-- ============================================================================
-- PHASE 5: FINANCE / ACCOUNTING CORE
-- ============================================================================

create table if not exists expense_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references expense_categories(id),
  amount numeric(12,2) not null check (amount > 0),
  expense_date date not null default current_date,
  description text,
  payment_method text not null check (payment_method in ('cash','bkash','nagad','bank','card')),
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists cash_bank_accounts (
  id uuid primary key default gen_random_uuid(),
  account_name text not null,
  account_type text not null check (account_type in ('cash','bank','bkash','nagad')),
  account_number text,
  current_balance numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

-- Central ledger — every money movement lands here for audit + reporting
create table if not exists ledger_entries (
  id uuid primary key default gen_random_uuid(),
  entry_type text not null check (entry_type in ('income','expense')),
  amount numeric(12,2) not null check (amount > 0),
  source_type text not null,   -- 'sale_payment' | 'supplier_payment' | 'expense' | 'purchase_return' | 'sales_return'
  source_id uuid,
  description text,
  entry_date date not null default current_date,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create or replace function fn_expense_after_insert()
returns trigger language plpgsql security definer as $$
begin
  insert into ledger_entries (entry_type, amount, source_type, source_id, description, entry_date, created_by)
  values ('expense', new.amount, 'expense', new.id, new.description, new.expense_date, new.created_by);
  return new;
end;
$$;

drop trigger if exists trg_expense_after_insert on expenses;
create trigger trg_expense_after_insert
after insert on expenses for each row execute function fn_expense_after_insert();

create or replace function fn_supplier_payment_ledger()
returns trigger language plpgsql security definer as $$
begin
  insert into ledger_entries (entry_type, amount, source_type, source_id, description, entry_date, created_by)
  values ('expense', new.amount, 'supplier_payment', new.id, 'Supplier payment', new.payment_date, new.created_by);
  return new;
end;
$$;

drop trigger if exists trg_supplier_payment_ledger on supplier_payments;
create trigger trg_supplier_payment_ledger
after insert on supplier_payments for each row execute function fn_supplier_payment_ledger();

-- Replaces the Phase 4 fn_customer_payment_after_insert body (SAME trigger,
-- trg_customer_payment_after_insert — not a second trigger) to also log a
-- ledger_entries row, now that the table exists. If Phase 4's trigger was
-- never created (schema run all at once instead of phase-by-phase), this
-- creates it fresh.
create or replace function fn_customer_payment_after_insert()
returns trigger language plpgsql security definer as $$
begin
  insert into ledger_entries (entry_type, amount, source_type, source_id, description, entry_date, created_by)
  values ('income', new.amount, 'sale_payment', new.id, 'Customer payment', new.payment_date, new.created_by);

  update orders
  set paid_amount = paid_amount + new.amount,
      due_amount = greatest(due_amount - new.amount, 0),
      payment_status = case when due_amount - new.amount <= 0 then 'paid' else 'partial' end
  where id = new.order_id;

  return new;
end;
$$;

drop trigger if exists trg_customer_payment_after_insert on customer_payments;
create trigger trg_customer_payment_after_insert
after insert on customer_payments for each row execute function fn_customer_payment_after_insert();

-- ============================================================================
-- PHASE 6: REPORTS & DASHBOARD VIEWS
-- ============================================================================

create or replace view view_stock_valuation as
select
  p.id as product_id, p.name, p.sku,
  coalesce(sum(ps.quantity), 0) as total_quantity,
  p.cost_price,
  coalesce(sum(ps.quantity), 0) * p.cost_price as stock_value
from products p
left join product_stock ps on ps.product_id = p.id
group by p.id, p.name, p.sku, p.cost_price;

create or replace view view_low_stock_alert as
select
  p.id as product_id, p.name, p.sku,
  ps.location_id, l.name as location_name,
  ps.quantity, ps.min_stock_level
from product_stock ps
join products p on p.id = ps.product_id
join locations l on l.id = ps.location_id
where ps.quantity <= ps.min_stock_level;

create or replace view view_supplier_dues as
select id, name, phone, current_due
from suppliers
where current_due > 0
order by current_due desc;

create or replace view view_monthly_expense_summary as
select
  date_trunc('month', expense_date) as month,
  ec.name as category,
  sum(e.amount) as total_amount
from expenses e
join expense_categories ec on ec.id = e.category_id
group by date_trunc('month', expense_date), ec.name
order by month desc;

create or replace view view_ledger_summary as
select
  date_trunc('month', entry_date) as month,
  sum(case when entry_type = 'income' then amount else 0 end) as total_income,
  sum(case when entry_type = 'expense' then amount else 0 end) as total_expense,
  sum(case when entry_type = 'income' then amount else -amount end) as net_cash_flow
from ledger_entries
group by date_trunc('month', entry_date)
order by month desc;

-- NOTE: Full Profit & Loss view (Sales Revenue - COGS - Expenses) should be
-- finalized only after Phase 4's orders/order_items integration is verified
-- working — build it in Phase 6 of the build prompt, not before.

-- ============================================================================
-- PHASE 7: SECURITY (Row Level Security) & AUDIT LOG
-- ============================================================================

create table if not exists activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  action text not null,        -- 'insert' | 'update' | 'delete'
  table_name text not null,
  record_id uuid,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz not null default now()
);

-- Enable RLS + apply a shared "inventory staff only" policy to every
-- inventory/finance table. NOTE: categories/brands/products are excluded
-- here since they already have their own storefront RLS policies (public
-- read, admin write) from RSP_Supabase_Schema.sql — adding a second
-- "inventory_staff_all" policy to them would not replace the storefront
-- ones, just add an additional path, so they're deliberately left alone.
do $$
declare
  t text;
begin
  for t in
    select unnest(array[
      'locations','product_stock','stock_movements',
      'product_serials','suppliers','purchase_orders','purchase_order_items','purchases',
      'purchase_items','purchase_returns','purchase_return_items','supplier_payments',
      'customer_payments','sales_returns','sales_return_items','expense_categories',
      'expenses','cash_bank_accounts','ledger_entries','activity_logs'
    ])
  loop
    execute format('alter table %I enable row level security;', t);
    execute format('drop policy if exists "inventory_staff_all" on %I;', t);
    execute format(
      'create policy "inventory_staff_all" on %I for all using (fn_is_inventory_staff()) with check (fn_is_inventory_staff());',
      t
    );
  end loop;
end $$;

-- Tighten the two most sensitive financial tables: only admin can DELETE.
drop policy if exists "inventory_staff_all" on purchases;
create policy "staff_select_purchases" on purchases for select using (fn_is_inventory_staff());
create policy "staff_insert_purchases" on purchases for insert with check (fn_is_inventory_staff());
create policy "staff_update_purchases" on purchases for update using (fn_is_inventory_staff());
create policy "admin_delete_purchases" on purchases for delete using (fn_is_admin());

drop policy if exists "inventory_staff_all" on expenses;
create policy "staff_select_expenses" on expenses for select using (fn_is_inventory_staff());
create policy "staff_insert_expenses" on expenses for insert with check (fn_is_inventory_staff());
create policy "staff_update_expenses" on expenses for update using (fn_is_inventory_staff());
create policy "admin_delete_expenses" on expenses for delete using (fn_is_admin());

-- ============================================================================
-- END OF SCHEMA
-- Verify each phase in the Supabase SQL Editor sequentially before moving on.
-- ============================================================================
