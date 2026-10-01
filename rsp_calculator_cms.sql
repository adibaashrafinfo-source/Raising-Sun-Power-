-- ============================================================================
-- Solar calculator, driven from the admin panel
-- calculator_settings holds the engineering constants the sizing runs on, and
-- calculator_appliances holds the quick-add tiles in step one. Both are edited
-- from Admin → Solar Calculator. The code keeps its built-in defaults, so the
-- calculator still works if either table is empty.
-- APPLIED 2026-10-01 as migration solar_calculator_cms.
-- ============================================================================

create table if not exists calculator_settings (
  id int primary key default 1 check (id = 1),
  battery_voltage numeric(6,2) not null default 12,
  depth_of_discharge numeric(4,2) not null default 0.5,
  inverter_efficiency numeric(4,2) not null default 0.85,
  avg_sun_hours numeric(4,2) not null default 4.5,
  panel_unit_wp int not null default 55,
  inverter_headroom numeric(4,3) not null default 1.275,
  inverter_sizes_va int[] not null default '{400,600,800,1000,1500,2000,2600}',
  updated_at timestamptz not null default now()
);

insert into calculator_settings (id) values (1) on conflict (id) do nothing;

create table if not exists calculator_appliances (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_bn text,
  watt int not null default 0,
  hours numeric(5,2) not null default 1,
  icon text not null default 'bulb',
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table calculator_settings enable row level security;
alter table calculator_appliances enable row level security;

drop policy if exists "public_read_calculator_settings" on calculator_settings;
create policy "public_read_calculator_settings" on calculator_settings for select using (true);

drop policy if exists "staff_write_calculator_settings" on calculator_settings;
create policy "staff_write_calculator_settings" on calculator_settings
for all to authenticated using (fn_is_inventory_staff()) with check (fn_is_inventory_staff());

drop policy if exists "public_read_calculator_appliances" on calculator_appliances;
create policy "public_read_calculator_appliances" on calculator_appliances for select using (is_active);

drop policy if exists "staff_write_calculator_appliances" on calculator_appliances;
create policy "staff_write_calculator_appliances" on calculator_appliances
for all to authenticated using (fn_is_inventory_staff()) with check (fn_is_inventory_staff());

-- Seeded with the ten appliances the calculator shipped with.
insert into calculator_appliances (name, name_bn, watt, hours, icon, sort_order)
select * from (values
  ('LED Bulb', 'এলইডি বাল্ব', 9, 6, 'bulb', 0),
  ('Ceiling Fan', 'সিলিং ফ্যান', 75, 12, 'fan', 1),
  ('Air Conditioner', 'এয়ার কন্ডিশনার', 1400, 6, 'ac', 2),
  ('LED Television', 'এলইডি টিভি', 100, 5, 'tv', 3),
  ('Refrigerator', 'ফ্রিজ', 150, 24, 'fridge', 4),
  ('Water Pump', 'ওয়াটার পাম্প', 750, 1, 'pump', 5),
  ('Computer Desktop', 'কম্পিউটার', 200, 6, 'desktop', 6),
  ('Smartphone Charger', 'মোবাইল চার্জার', 15, 4, 'phone', 7),
  ('WiFi Router', 'ওয়াইফাই রাউটার', 10, 24, 'wifi', 8),
  ('Electric Iron', 'ইস্ত্রি', 1000, 1, 'iron', 9)
) as v(name, name_bn, watt, hours, icon, sort_order)
where not exists (select 1 from calculator_appliances);

notify pgrst, 'reload schema';
