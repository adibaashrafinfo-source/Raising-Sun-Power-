-- ============================================================================
-- Products a wholesale enquiry asks about
-- The Wholesale page's trade-enquiry form lets a buyer pick products from the
-- catalogue; the names land here so the sales team sees exactly what to price.
-- Names rather than ids, so an old lead stays readable after a rename.
-- APPLIED 2026-10-01 as migration leads_interested_products.
-- ============================================================================

alter table leads
  add column if not exists interested_products text[] not null default '{}';

notify pgrst, 'reload schema';
