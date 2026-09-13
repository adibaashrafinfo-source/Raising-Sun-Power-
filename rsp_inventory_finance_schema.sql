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
--   8. Full-site review fix: added fn_sync_product_stock_qty /
--      trg_sync_product_stock_qty (AFTER INSERT/UPDATE/DELETE on
--      product_stock) so the legacy products.stock_qty column — still used
--      everywhere on the public storefront (PDP "In Stock" badge, the
--      "In Stock Only" filter, the quantity stepper) — always equals the sum
--      of that product's per-location product_stock rows, instead of drifting
--      out of sync with the new inventory system. Zero storefront code
--      changes needed. A product with no product_stock rows yet (never
--      purchased through the inventory module) is left alone, keeping
--      whatever stock_qty an admin set by hand.
--   9. Full-site review fix: replaced fn_order_confirmed_stock_decrease with
--      a version keyed off a new orders.stock_deducted flag and switched its
--      trigger from AFTER UPDATE to BEFORE UPDATE (required so it can set
--      new.stock_deducted itself). Previously, flipping an order back to
--      "pending" and re-confirming it deducted stock a second time, and
--      cancelling a confirmed order never restored the stock at all. Now
--      stock is decremented exactly once per order no matter how many times
--      its status flips, and cancelling a previously-confirmed order restores
--      the stock (with a matching 'in' stock_movements row) and clears the
--      flag.
--   10. Full-site review fix: added fn_create_purchase(...), an atomic RPC
--      that inserts a purchases row and all of its purchase_items in a
--      single function call (one implicit transaction), replacing the
--      frontend's previous approach of inserting the purchase and then each
--      item separately from JS with no transaction — which could leave a
--      purchase half-created (some stock already incremented via triggers,
--      some items missing) if a later item's insert failed. The frontend's
--      createPurchase() now calls this RPC via supabase.rpc(...) instead of
--      looping inserts.
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

-- Keeps the storefront's products.stock_qty (used everywhere on the public
-- site — PDP "In Stock" badge, the "In Stock Only" filter, the quantity
-- stepper) equal to the real total across all locations, so the storefront
-- and the inventory system can never drift apart. Only ever touches a
-- product once it has at least one product_stock row (i.e. after its first
-- purchase) — a product with none yet keeps whatever stock_qty an admin set
-- by hand, matching the admin Products page's own fallback behavior.
create or replace function fn_sync_product_stock_qty()
returns trigger language plpgsql security definer as $$
declare
  v_product_id uuid;
  v_total int;
begin
  v_product_id := coalesce(new.product_id, old.product_id);
  select coalesce(sum(quantity), 0) into v_total from product_stock where product_id = v_product_id;
  update products set stock_qty = v_total where id = v_product_id;
  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_sync_product_stock_qty on product_stock;
create trigger trg_sync_product_stock_qty
after insert or update or delete on product_stock
for each row execute function fn_sync_product_stock_qty();

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

-- Creates a purchase and all its line items atomically. The frontend
-- previously inserted the purchases row and then each purchase_items row
-- one at a time from JS with no transaction — if an item failed partway
-- through, the purchase was left half-created (some stock already
-- incremented, some items missing) while the error toast implied nothing
-- had happened. A single function call is one implicit transaction: if any
-- insert inside raises, everything done so far in this call — including the
-- purchases row and any purchase_items already inserted — is rolled back.
create or replace function fn_create_purchase(
  p_invoice_number text,
  p_supplier_id uuid,
  p_location_id uuid,
  p_purchase_date date,
  p_tax_amount numeric,
  p_paid_amount numeric,
  p_items jsonb -- [{ "product_id": uuid, "quantity": int, "unit_cost": numeric }, ...]
)
returns uuid
language plpgsql security definer as $$
declare
  v_subtotal numeric := 0;
  v_total numeric;
  v_due numeric;
  v_status text;
  v_purchase_id uuid;
  v_item jsonb;
begin
  if not fn_is_inventory_staff() then
    raise exception 'Not authorized';
  end if;

  select coalesce(sum((item->>'quantity')::int * (item->>'unit_cost')::numeric), 0)
  into v_subtotal
  from jsonb_array_elements(p_items) as item;

  v_total := v_subtotal + p_tax_amount;
  v_due := greatest(v_total - p_paid_amount, 0);
  v_status := case when v_due <= 0 then 'paid' when p_paid_amount > 0 then 'partial' else 'due' end;

  insert into purchases (
    invoice_number, supplier_id, location_id, purchase_date,
    subtotal, tax_amount, total_amount, paid_amount, due_amount, payment_status
  )
  values (
    p_invoice_number, p_supplier_id, p_location_id, p_purchase_date,
    v_subtotal, p_tax_amount, v_total, p_paid_amount, v_due, v_status
  )
  returning id into v_purchase_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    insert into purchase_items (purchase_id, product_id, quantity, unit_cost)
    values (
      v_purchase_id,
      (v_item->>'product_id')::uuid,
      (v_item->>'quantity')::int,
      (v_item->>'unit_cost')::numeric
    );
  end loop;

  return v_purchase_id;
end;
$$;

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

-- stock_deducted tracks whether THIS order has already had its stock taken
-- out, independent of the order's current status. Without it, an admin
-- moving a confirmed order back to pending and re-confirming it (e.g. to
-- fix a mistake) would fire the decrease a second time; cancelling a
-- confirmed order also had no way to put the stock back at all.
alter table orders add column if not exists stock_deducted boolean not null default false;

-- Stock-decrease/restore trigger, adapted to the REAL order_items columns
-- (qty, not quantity) and the is_default location (web checkout doesn't ask
-- which shop fulfills the order). BEFORE UPDATE (not AFTER) so it can set
-- new.stock_deducted itself. Decrements exactly once per order regardless of
-- how many times status flips back and forth, and restores stock if a
-- deducted order is cancelled.
create or replace function fn_order_confirmed_stock_decrease()
returns trigger language plpgsql security definer as $$
declare
  v_default_location uuid;
  v_item record;
begin
  if new.status = 'confirmed' and not old.stock_deducted then
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
    new.stock_deducted := true;

  elsif new.status = 'cancelled' and old.stock_deducted and old.status is distinct from 'cancelled' then
    select id into v_default_location from locations where is_default = true limit 1;
    if v_default_location is null then
      raise exception 'No default location set for stock restoration';
    end if;

    for v_item in select product_id, qty from order_items where order_id = new.id loop
      if v_item.product_id is not null then
        update product_stock
        set quantity = quantity + v_item.qty, updated_at = now()
        where product_id = v_item.product_id and location_id = v_default_location;

        insert into stock_movements (product_id, location_id, movement_type, quantity, reference_type, reference_id)
        values (v_item.product_id, v_default_location, 'in', v_item.qty, 'order_cancelled', new.id);
      end if;
    end loop;
    new.stock_deducted := false;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_order_confirmed_stock_decrease on orders;
create trigger trg_order_confirmed_stock_decrease
before update on orders for each row execute function fn_order_confirmed_stock_decrease();

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

-- Monthly Sales Revenue and COGS (quantity x cost_price at time of query —
-- not a historical snapshot, since order_items doesn't store cost_price).
-- Only counts orders that reached a real sale state (confirmed/shipped/
-- delivered), matching the stock-decrease trigger's own status gate.
create or replace view view_profit_loss_monthly as
select
  date_trunc('month', o.created_at) as month,
  sum(oi.line_total) as revenue,
  sum(oi.qty * coalesce(p.cost_price, 0)) as cogs
from orders o
join order_items oi on oi.order_id = o.id
left join products p on p.id = oi.product_id
where o.status in ('confirmed', 'shipped', 'delivered')
group by date_trunc('month', o.created_at)
order by month desc;

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
-- Each create is preceded by its own drop-if-exists so this whole file
-- stays safe to re-run (e.g. after a partial run was interrupted).
drop policy if exists "inventory_staff_all" on purchases;
drop policy if exists "staff_select_purchases" on purchases;
create policy "staff_select_purchases" on purchases for select using (fn_is_inventory_staff());
drop policy if exists "staff_insert_purchases" on purchases;
create policy "staff_insert_purchases" on purchases for insert with check (fn_is_inventory_staff());
drop policy if exists "staff_update_purchases" on purchases;
create policy "staff_update_purchases" on purchases for update using (fn_is_inventory_staff());
drop policy if exists "admin_delete_purchases" on purchases;
create policy "admin_delete_purchases" on purchases for delete using (fn_is_admin());

drop policy if exists "inventory_staff_all" on expenses;
drop policy if exists "staff_select_expenses" on expenses;
create policy "staff_select_expenses" on expenses for select using (fn_is_inventory_staff());
drop policy if exists "staff_insert_expenses" on expenses;
create policy "staff_insert_expenses" on expenses for insert with check (fn_is_inventory_staff());
drop policy if exists "staff_update_expenses" on expenses;
create policy "staff_update_expenses" on expenses for update using (fn_is_inventory_staff());
drop policy if exists "admin_delete_expenses" on expenses;
create policy "admin_delete_expenses" on expenses for delete using (fn_is_admin());

-- ============================================================================
-- OPTIONAL ONE-TIME BACKFILL: pre-Phase-4 order payment status
-- ------------------------------------------------------------------------
-- Orders placed before the paid_amount/due_amount/payment_status columns
-- existed got backfilled to 0/0/'due' by the ALTER TABLE defaults — showing
-- an already-delivered order as having its full total still due. This marks
-- already-delivered orders as fully paid (COD is the only payment method
-- that reliably implies "paid" once delivered — 'confirmed'/'shipped'
-- orders are left alone since they may genuinely still be unpaid). Run once,
-- optionally, only if you have pre-Phase-4 orders you want corrected.
-- ============================================================================
-- update orders
-- set paid_amount = total, due_amount = 0, payment_status = 'paid'
-- where status = 'delivered' and payment_status = 'due' and paid_amount = 0;

-- ============================================================================
-- END OF SCHEMA
-- Verify each phase in the Supabase SQL Editor sequentially before moving on.
-- ============================================================================
