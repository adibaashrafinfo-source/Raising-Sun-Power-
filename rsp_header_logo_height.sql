-- ============================================================================
-- Admin-controlled header logo size
-- Run this once in the Supabase SQL editor. Until it is run the admin CMS
-- hides the "Header logo size" slider and the header falls back to its own
-- default height, so nothing breaks either way.
-- APPLIED 2026-10-01 as migration site_content_header_logo_height.
-- ============================================================================

alter table site_content
  add column if not exists header_logo_height integer not null default 56;

-- Keep the live row at the new, smaller default rather than the old 116px tile.
update site_content set header_logo_height = 56 where id = 1;

notify pgrst, 'reload schema';
