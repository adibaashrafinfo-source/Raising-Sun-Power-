-- ============================================================================
-- Solar packages
-- APPLIED 2026-09-30 as migration solar_packages. Kept here so the repo and the
-- database read the same.
--
-- A package is a sellable bundle (panels + inverter + battery + accessories)
-- with its own gallery, description, price and line items. Staff who manage
-- products manage these too — same fn_is_inventory_staff() check.
-- ============================================================================

create table if not exists package_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists packages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  category_id uuid references package_categories(id) on delete set null,
  capacity_kw numeric(8,2),
  price numeric(12,2) not null default 0,
  sale_price numeric(12,2),
  short_description text,
  description text,
  images text[] not null default '{}',
  badges text[] not null default '{}',
  specifications jsonb not null default '{}',
  is_featured boolean not null default false,
  sort_order int not null default 0,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists package_items (
  id uuid primary key default gen_random_uuid(),
  package_id uuid not null references packages(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  name text not null,
  detail text,
  qty numeric(10,2) not null default 1,
  unit text not null default 'pcs',
  sort_order int not null default 0
);

create index if not exists idx_packages_category on packages(category_id);
create index if not exists idx_packages_status on packages(status);
create index if not exists idx_package_items_package on package_items(package_id);

drop trigger if exists trg_packages_updated_at on packages;
create trigger trg_packages_updated_at
before update on packages for each row execute function fn_set_updated_at();

alter table package_categories enable row level security;
alter table packages enable row level security;
alter table package_items enable row level security;

drop policy if exists "public_read_package_categories" on package_categories;
create policy "public_read_package_categories" on package_categories
for select using (is_active);

drop policy if exists "staff_write_package_categories" on package_categories;
create policy "staff_write_package_categories" on package_categories
for all to authenticated using (fn_is_inventory_staff()) with check (fn_is_inventory_staff());

drop policy if exists "public_read_packages" on packages;
create policy "public_read_packages" on packages
for select using (status = 'published');

drop policy if exists "staff_write_packages" on packages;
create policy "staff_write_packages" on packages
for all to authenticated using (fn_is_inventory_staff()) with check (fn_is_inventory_staff());

drop policy if exists "public_read_package_items" on package_items;
create policy "public_read_package_items" on package_items
for select using (
  exists (select 1 from packages p where p.id = package_id and p.status = 'published')
);

drop policy if exists "staff_write_package_items" on package_items;
create policy "staff_write_package_items" on package_items
for all to authenticated using (fn_is_inventory_staff()) with check (fn_is_inventory_staff());

notify pgrst, 'reload schema';
