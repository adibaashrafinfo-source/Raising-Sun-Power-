-- ============================================================================
-- Footer branding controlled from the admin CMS
--   footer_logo_height : how tall the footer logo is (pixels)
--   footer_badges      : the "Registered & trusted" logos, as a JSON list of
--                        {url, alt, height}; the admin adds/removes/resizes them
-- Also turns on live updates for site_content so a saved change appears on open
-- pages straight away (the site re-reads every 30s even without it).
-- Run once in the Supabase SQL editor. Safe to re-run.
-- ============================================================================

alter table site_content add column if not exists footer_logo_height integer not null default 80;
alter table site_content add column if not exists footer_badges jsonb not null default '[]'::jsonb;

-- Start the list with the three logos already on the site.
update site_content
set footer_badges = '[
  {"url": "/badges/dncc.jpg", "alt": "Dhaka North City Corporation", "height": 80, "zoom": 1.65},
  {"url": "/badges/sreda-stakeholder.png", "alt": "SREDA Stakeholder", "height": 76},
  {"url": "/badges/trustpilot.png", "alt": "Review us on Trustpilot", "height": 80}
]'::jsonb
where id = 1 and jsonb_array_length(footer_badges) = 0;

do $$
begin
  alter publication supabase_realtime add table site_content;
exception when duplicate_object then null;
end $$;

notify pgrst, 'reload schema';
