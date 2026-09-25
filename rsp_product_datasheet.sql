-- ============================================================================
-- Product datasheet (PDF)
-- Run once in the Supabase SQL editor.
--
-- Adds two optional columns to products and a public-read, admin-write bucket
-- for the files. Mirrors the site-assets bucket set up in rsp_cms_schema.sql,
-- including its fn_is_admin() check — no new auth pattern is introduced.
-- Until this runs, the admin product form hides the datasheet field and never
-- writes these columns, so the site keeps working exactly as before.
-- ============================================================================

alter table products add column if not exists datasheet_url text;
alter table products add column if not exists datasheet_filename text;

-- Storage bucket. 10 MB cap and application/pdf only are enforced by storage
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

drop policy if exists "admin_insert_product_datasheets" on storage.objects;
create policy "admin_insert_product_datasheets" on storage.objects
for insert to authenticated
with check (bucket_id = 'product-datasheets' and fn_is_admin());

drop policy if exists "admin_update_product_datasheets" on storage.objects;
create policy "admin_update_product_datasheets" on storage.objects
for update to authenticated
using (bucket_id = 'product-datasheets' and fn_is_admin());

drop policy if exists "admin_delete_product_datasheets" on storage.objects;
create policy "admin_delete_product_datasheets" on storage.objects
for delete to authenticated
using (bucket_id = 'product-datasheets' and fn_is_admin());

notify pgrst, 'reload schema';
