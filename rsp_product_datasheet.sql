-- ============================================================================
-- Product datasheet (PDF)
-- Applied already — kept here as the record of what ran.
--
-- APPLIED 2026-09-25 as migration product_datasheet_pdf. Kept here so the repo
-- and the database read the same.
--
-- Adds two optional columns to products and a public-read, staff-write bucket
-- for the files. The policies mirror the live product-images bucket exactly,
-- including its fn_is_inventory_staff() check (admin, manager or staff — the
-- same people who edit a product), so no new auth pattern is introduced.
-- ============================================================================

alter table products add column if not exists datasheet_url text;
alter table products add column if not exists datasheet_filename text;

-- Storage bucket. The 10 MB cap and application/pdf are enforced by storage
-- itself, so a bad upload is rejected even if the browser check is bypassed.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-datasheets', 'product-datasheets', true, 10485760, array['application/pdf'])
on conflict (id) do update
  set public = true,
      file_size_limit = 10485760,
      allowed_mime_types = array['application/pdf'];

drop policy if exists "public_read_product_datasheets" on storage.objects;
create policy "public_read_product_datasheets" on storage.objects
for select using (bucket_id = 'product-datasheets');

drop policy if exists "staff_upload_product_datasheets" on storage.objects;
create policy "staff_upload_product_datasheets" on storage.objects
for insert to authenticated
with check (bucket_id = 'product-datasheets' and fn_is_inventory_staff());

drop policy if exists "staff_update_product_datasheets" on storage.objects;
create policy "staff_update_product_datasheets" on storage.objects
for update to authenticated
using (bucket_id = 'product-datasheets' and fn_is_inventory_staff());

drop policy if exists "staff_delete_product_datasheets" on storage.objects;
create policy "staff_delete_product_datasheets" on storage.objects
for delete to authenticated
using (bucket_id = 'product-datasheets' and fn_is_inventory_staff());

notify pgrst, 'reload schema';
