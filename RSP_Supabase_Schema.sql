-- ============================================================
-- Rising Sun Power BD — Supabase Schema
-- Run as initial migration. Assumes Supabase Auth is enabled
-- (auth.users table exists out of the box).
-- ============================================================

-- ---------- PROFILES ----------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'customer' check (role in ('customer','admin')),
  created_at timestamptz not null default now()
);

-- auto-create profile on signup
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'phone');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------- CATEGORIES ----------
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  icon text,
  parent_id uuid references public.categories(id),
  sort_order int default 0,
  created_at timestamptz not null default now()
);

-- ---------- BRANDS ----------
create table public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  logo_url text,
  created_at timestamptz not null default now()
);

-- ---------- PRODUCTS ----------
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  category_id uuid references public.categories(id),
  brand_id uuid references public.brands(id),
  sku text unique,
  price numeric(12,2) not null,
  sale_price numeric(12,2),
  stock_qty int not null default 0,
  description text,
  specifications jsonb default '{}',
  badges text[] default '{}',
  images text[] default '{}',
  status text not null default 'draft' check (status in ('draft','published','archived')),
  rating_avg numeric(2,1) default 0,
  rating_count int default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_products_category on public.products(category_id);
create index idx_products_brand on public.products(brand_id);
create index idx_products_status on public.products(status);

-- ---------- REVIEWS ----------
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid references public.profiles(id),
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

-- ---------- WISHLIST ----------
create table public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

-- ---------- ADDRESSES ----------
create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  label text,
  full_name text not null,
  phone text not null,
  division text not null,
  district text not null,
  upazila text,
  address_line text not null,
  landmark text,
  is_default boolean default false,
  created_at timestamptz not null default now()
);

-- ---------- COUPONS ----------
create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_type text not null check (discount_type in ('percent','flat')),
  discount_value numeric(12,2) not null,
  usage_limit int,
  used_count int not null default 0,
  expires_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------- ORDERS ----------
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid references public.profiles(id),
  guest_name text,
  guest_phone text,
  status text not null default 'pending'
    check (status in ('pending','confirmed','shipped','delivered','cancelled')),
  payment_method text not null check (payment_method in ('cod','bkash','nagad')),
  payment_reference text,       -- customer-entered txn id for bkash/nagad
  payment_sender_number text,
  division text not null,
  district text not null,
  upazila text,
  address_line text not null,
  landmark text,
  delivery_method text not null default 'courier' check (delivery_method in ('courier','pickup')),
  courier_status text,          -- placeholder for future Steadfast sync
  subtotal numeric(12,2) not null,
  delivery_charge numeric(12,2) not null default 0,
  discount numeric(12,2) not null default 0,
  coupon_id uuid references public.coupons(id),
  total numeric(12,2) not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_orders_user on public.orders(user_id);
create index idx_orders_status on public.orders(status);

-- ---------- ORDER ITEMS ----------
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id),
  product_name text not null,   -- snapshot at time of order
  unit_price numeric(12,2) not null,
  qty int not null,
  line_total numeric(12,2) not null
);

-- ---------- LEADS (Solar Calculator / Quotation Request) ----------
create table public.leads (
  id uuid primary key default gen_random_uuid(),
  ref_id text not null unique,           -- e.g. RSP-Q-10234
  name text not null,
  phone text not null,
  email text,
  division text not null,
  district text not null,
  load_watt numeric(12,2),
  backup_hours numeric(4,1),
  budget_range text,
  roof_type text,
  timeline text,
  notes text,
  source text not null default 'direct' check (source in ('calculator','direct')),
  status text not null default 'new'
    check (status in ('new','contacted','quoted','converted','lost')),
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- SETTINGS (single-row config table) ----------
create table public.settings (
  id int primary key default 1,
  delivery_charge_inside_dhaka numeric(12,2) not null default 60,
  delivery_charge_outside_dhaka numeric(12,2) not null default 120,
  free_delivery_threshold numeric(12,2) default 5000,
  cod_enabled boolean not null default true,
  bkash_enabled boolean not null default true,
  nagad_enabled boolean not null default true,
  support_phone text default '+8801705742208',
  constraint single_row check (id = 1)
);
insert into public.settings (id) values (1);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.brands enable row level security;
alter table public.products enable row level security;
alter table public.reviews enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.addresses enable row level security;
alter table public.coupons enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.leads enable row level security;
alter table public.settings enable row level security;

-- helper: is current user an admin?
create function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql stable security definer;

-- PROFILES: user reads/updates own row; admin reads all
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (auth.uid() = id or public.is_admin());
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- CATEGORIES / BRANDS: public read, admin write
create policy "categories_public_read" on public.categories for select using (true);
create policy "categories_admin_write" on public.categories for all using (public.is_admin());
create policy "brands_public_read" on public.brands for select using (true);
create policy "brands_admin_write" on public.brands for all using (public.is_admin());

-- PRODUCTS: public read published only; admin full access
create policy "products_public_read_published" on public.products
  for select using (status = 'published' or public.is_admin());
create policy "products_admin_write" on public.products
  for insert with check (public.is_admin());
create policy "products_admin_update" on public.products
  for update using (public.is_admin());
create policy "products_admin_delete" on public.products
  for delete using (public.is_admin());

-- REVIEWS: public read; authenticated users create own; admin manage
create policy "reviews_public_read" on public.reviews for select using (true);
create policy "reviews_own_insert" on public.reviews
  for insert with check (auth.uid() = user_id);
create policy "reviews_admin_delete" on public.reviews
  for delete using (public.is_admin());

-- WISHLIST: user manages own only
create policy "wishlist_own" on public.wishlist_items
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ADDRESSES: user manages own only; admin can view all
create policy "addresses_own" on public.addresses
  for all using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id);

-- COUPONS: admin only (validation happens server-side/edge function on checkout)
create policy "coupons_admin_only" on public.coupons for all using (public.is_admin());

-- ORDERS: user sees own; guest orders visible only via admin or server-side lookup;
--         admin sees/manages all
create policy "orders_owner_select" on public.orders
  for select using (auth.uid() = user_id or public.is_admin());
create policy "orders_insert_any" on public.orders
  for insert with check (true);  -- allows guest checkout; lock down further via edge function if needed
create policy "orders_admin_update" on public.orders
  for update using (public.is_admin());

-- ORDER ITEMS: follow parent order visibility
create policy "order_items_select" on public.order_items
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and (o.user_id = auth.uid() or public.is_admin())
    )
  );
create policy "order_items_insert" on public.order_items
  for insert with check (true);

-- LEADS: anyone can insert (public quotation form); only admin can read/update
create policy "leads_public_insert" on public.leads
  for insert with check (true);
create policy "leads_admin_select" on public.leads
  for select using (public.is_admin());
create policy "leads_admin_update" on public.leads
  for update using (public.is_admin());

-- SETTINGS: public read (needed for delivery charge calc on frontend); admin write
create policy "settings_public_read" on public.settings for select using (true);
create policy "settings_admin_update" on public.settings for update using (public.is_admin());
