-- ============================================================================
-- Rising Sun Power BD (RSP) — Solar ROI Calculator
-- Supabase / PostgreSQL Schema Addition
-- ============================================================================
-- HOW TO USE:
--   Run this once in the Supabase SQL Editor, after the main schema and the
--   Inventory & Finance schema (it reuses fn_is_admin() and fn_set_updated_at()
--   from that schema). Idempotent — safe to re-run.
--
-- WHAT THIS ADDS:
--   1. roi_calculator_settings — a single-row, admin-editable table holding
--      every tariff/constant the ROI calculator's math depends on (BERC
--      tariffs change often — this keeps them editable without a code
--      deploy). Publicly readable (the calculator runs for anonymous
--      visitors) but only admins can update it.
--   2. Widens leads.source to accept 'roi_calculator' alongside the existing
--      'calculator' (sizing calculator) and 'direct' values, so ROI-calculator
--      leads are distinguishable in the admin Leads pipeline.
--
-- ⚠️ DEFAULTS SEEDED BELOW ARE PLACEHOLDERS — confirm with RSP before launch:
--   - cost_per_kw_installed_bdt: the single most important number, seeded at
--     85000 (a rough Bangladesh market estimate) — RSP MUST confirm their
--     actual per-kW installed price and update it from the admin panel.
--   - commercial_rate / industrial_rate: seeded from the spec's placeholder
--     figures — confirm current BERC slab before launch.
--   - residential_slabs: BERC rates effective the June 2026 billing cycle
--     per the spec — verify before launch, these change.
-- ============================================================================

create table if not exists roi_calculator_settings (
  id int primary key default 1,
  residential_slabs jsonb not null default '[
    {"minUnits":0,"maxUnits":50,"rate":5.32},
    {"minUnits":51,"maxUnits":75,"rate":6.18},
    {"minUnits":76,"maxUnits":200,"rate":8.50},
    {"minUnits":201,"maxUnits":300,"rate":9.10},
    {"minUnits":301,"maxUnits":400,"rate":9.62},
    {"minUnits":401,"maxUnits":600,"rate":15.01},
    {"minUnits":601,"maxUnits":null,"rate":17.35}
  ]'::jsonb,
  commercial_rate numeric(6,2) not null default 15.36,
  industrial_rate numeric(6,2) not null default 14.00,
  avg_peak_sun_hours_per_day numeric(4,2) not null default 4.5,
  system_efficiency_factor numeric(4,3) not null default 0.75,
  cost_per_kw_installed_bdt numeric(12,2) not null default 85000,
  panel_lifespan_years int not null default 25,
  annual_degradation_rate numeric(5,4) not null default 0.006,
  annual_electricity_price_escalation numeric(5,4) not null default 0.08,
  annual_maintenance_cost_rate numeric(5,4) not null default 0.005,
  updated_at timestamptz not null default now(),
  constraint roi_calculator_settings_single_row check (id = 1)
);

insert into roi_calculator_settings (id) values (1) on conflict (id) do nothing;

drop trigger if exists trg_roi_settings_updated_at on roi_calculator_settings;
create trigger trg_roi_settings_updated_at
before update on roi_calculator_settings for each row execute function fn_set_updated_at();

alter table roi_calculator_settings enable row level security;

-- Anonymous visitors run the calculator on the public site — settings must
-- be publicly readable. Only admins may change the tariffs/constants.
drop policy if exists "public_read_roi_settings" on roi_calculator_settings;
create policy "public_read_roi_settings" on roi_calculator_settings for select using (true);

drop policy if exists "admin_update_roi_settings" on roi_calculator_settings;
create policy "admin_update_roi_settings" on roi_calculator_settings for update using (fn_is_admin());

-- Distinguish ROI-calculator leads from the existing sizing-calculator and
-- direct-quotation leads in the admin Leads pipeline.
alter table leads drop constraint if exists leads_source_check;
alter table leads add constraint leads_source_check
  check (source in ('calculator','direct','roi_calculator'));

notify pgrst, 'reload schema';

-- ============================================================================
-- END OF ROI CALCULATOR SCHEMA ADDITION
-- ============================================================================
