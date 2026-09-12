-- ============================================================
-- Rising Sun Power BD — sample seed data
-- Run AFTER RSP_Supabase_Schema.sql. Safe to re-run (upserts by slug/sku).
-- ============================================================

insert into public.categories (name, slug, sort_order) values
  ('Solar Panels', 'solar-panels', 1),
  ('Inverters', 'inverters', 2),
  ('Batteries', 'batteries', 3),
  ('MCB & MCCB', 'mcb-mccb', 4),
  ('Switchgear', 'switchgear', 5),
  ('Cables & Wires', 'cables-wires', 6),
  ('Complete Solutions', 'complete-solutions', 7),
  ('Accessories', 'accessories', 8)
on conflict (slug) do nothing;

insert into public.brands (name, slug) values
  ('Longi', 'longi'),
  ('Luminous', 'luminous'),
  ('Schneider', 'schneider'),
  ('Havells', 'havells'),
  ('Growatt', 'growatt'),
  ('Hoppecke', 'hoppecke'),
  ('BRB', 'brb'),
  ('Jinko', 'jinko'),
  ('Victron', 'victron'),
  ('Siemens', 'siemens'),
  ('ABB', 'abb'),
  ('Walton', 'walton')
on conflict (slug) do nothing;

insert into public.products
  (name, slug, category_id, brand_id, sku, price, sale_price, stock_qty, description, specifications, badges, images, status, rating_avg, rating_count)
select
  v.name, v.slug,
  (select id from public.categories where slug = v.category_slug),
  (select id from public.brands where slug = v.brand_slug),
  v.sku, v.price, v.sale_price, v.stock_qty, v.description, v.specifications::jsonb, v.badges, '{}'::text[],
  'published', v.rating_avg, v.rating_count
from (values
  ('Longi Hi-MO 550W Mono Solar Panel', 'longi-himo-550w-mono-solar-panel', 'solar-panels', 'longi', 'LGH-550W', 21000, 18500, 42,
    'Tier-1 monocrystalline solar panel with 25-year performance warranty, ideal for rooftop residential and commercial installs.',
    '{"Power Output":"550W","Type":"Monocrystalline","Efficiency":"21.3%","Warranty":"25 years"}', '{"Best Seller"}', 4.8, 126),
  ('Luminous 2kVA Pure Sine Solar Inverter', 'luminous-2kva-pure-sine-solar-inverter', 'inverters', 'luminous', 'LUM-2KVA', 28500, 24900, 30,
    'Pure sine wave solar inverter with MPPT charge controller, built for Bangladesh grid conditions.',
    '{"Capacity":"2kVA","Wave Type":"Pure Sine","Charge Controller":"MPPT"}', '{}', 4.7, 84),
  ('Hoppecke 200Ah Tall Tubular Battery', 'hoppecke-200ah-tall-tubular-battery', 'batteries', 'hoppecke', 'HOP-200AH', 29000, 26400, 25,
    'Deep-cycle tubular battery engineered for long backup life and frequent load-shedding cycles.',
    '{"Capacity":"200Ah","Type":"Tubular","Voltage":"12V"}', '{}', 4.9, 57),
  ('Schneider 63A MCCB 3-Pole Breaker', 'schneider-63a-mccb-3-pole-breaker', 'mcb-mccb', 'schneider', 'SCH-63A3P', 5400, 4750, 60,
    'Molded case circuit breaker for distribution boards, rated 63A across 3 poles.',
    '{"Rating":"63A","Poles":"3","Breaking Capacity":"25kA"}', '{Eco}', 4.6, 41),
  ('RSP 100Ah LiFePO4 Lithium Battery', 'rsp-100ah-lifepo4-lithium-battery', 'batteries', 'brb', 'RSP-100LFP', 38500, null, 18,
    'Long-life lithium iron phosphate battery with built-in BMS, 3000+ cycle life.',
    '{"Capacity":"100Ah","Chemistry":"LiFePO4","Cycle Life":"3000+"}', '{New}', 5.0, 49),
  ('Growatt 5kW Hybrid On/Off-Grid Inverter', 'growatt-5kw-hybrid-on-off-grid-inverter', 'inverters', 'growatt', 'GRO-5KWH', 92000, null, 12,
    'Hybrid inverter supporting both on-grid and off-grid operation with smart load management.',
    '{"Capacity":"5kW","Mode":"Hybrid","Phases":"Single"}', '{New}', 4.9, 63),
  ('BRB 2.5mm² Copper Cable — 100 yd Coil', 'brb-2-5mm-copper-cable-100-yd-coil', 'cables-wires', 'brb', 'BRB-25MM-100', 6900, null, 80,
    '100% pure copper conductor, PVC insulated, 100-yard coil for household wiring.',
    '{"Size":"2.5mm²","Length":"100 yd","Conductor":"Copper"}', '{New}', 4.9, 228),
  ('Havells 32A MCB Single Pole (Type C)', 'havells-32a-mcb-single-pole-type-c', 'mcb-mccb', 'havells', 'HAV-32A1P-C', 420, null, 300,
    'Single pole miniature circuit breaker, Type C curve, for general lighting and socket circuits.',
    '{"Rating":"32A","Poles":"1","Curve":"Type C"}', '{New}', 4.8, 312)
) as v(name, slug, category_slug, brand_slug, sku, price, sale_price, stock_qty, description, specifications, badges, rating_avg, rating_count)
on conflict (slug) do nothing;
