-- ============================================================================
-- Third office for the footer / About / Contact pages
-- Run this once in the Supabase SQL editor. Until it is run, the admin CMS
-- hides the "Office 3" fields and the site falls back to the address in
-- src/data/company.ts, so nothing breaks either way.
-- APPLIED 2026-09-25 as migration site_content_third_office.
-- ============================================================================

alter table site_content add column if not exists showroom_3_name text;
alter table site_content add column if not exists showroom_3_address text;

update site_content
set showroom_3_name = coalesce(nullif(showroom_3_name, ''), 'Local Office-2'),
    showroom_3_address = coalesce(nullif(showroom_3_address, ''), 'Paniwala Bazar, Ramgonj, Laximpur.')
where id = 1;

-- Keep the second office's label in step with the new naming.
update site_content
set showroom_2_name = 'Local Office-1'
where id = 1 and coalesce(showroom_2_name, '') in ('', 'Local Office');

notify pgrst, 'reload schema';
