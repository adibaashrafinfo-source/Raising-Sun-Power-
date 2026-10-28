-- Removes the sample catalogue loaded by supabase/seed.sql (the 8 demo
-- products, identified by their seed slugs). Products an admin uploaded are
-- NOT touched. A demo product that real orders, stock or packages still point
-- at can't be deleted without breaking that history, so it is archived
-- instead — hidden from the website, still there for the records.
-- Safe to re-run.

do $$
declare
  demo_slug text;
begin
  foreach demo_slug in array array[
    'longi-himo-550w-mono-solar-panel',
    'luminous-2kva-pure-sine-solar-inverter',
    'hoppecke-200ah-tall-tubular-battery',
    'schneider-63a-mccb-3-pole-breaker',
    'rsp-100ah-lifepo4-lithium-battery',
    'growatt-5kw-hybrid-on-off-grid-inverter',
    'brb-2-5mm-copper-cable-100-yd-coil',
    'havells-32a-mcb-single-pole-type-c'
  ]
  loop
    begin
      delete from public.products where slug = demo_slug;
    exception when foreign_key_violation then
      update public.products set status = 'archived' where slug = demo_slug;
    end;
  end loop;
end $$;

notify pgrst, 'reload schema';
