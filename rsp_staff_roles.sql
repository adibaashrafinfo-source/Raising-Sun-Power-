-- ============================================================================
-- Four more staff roles: sales, accountant, delivery, content_editor
-- Each one opens a slice of the admin panel, and the database enforces the same
-- split so a role can never load data its pages would not show it. Admin is
-- included in every helper, so an admin keeps full access.
-- APPLIED 2026-10-01 as migrations staff_roles_sales_accountant_delivery_content
-- and content_editor_catalogue_policies.
-- ============================================================================

create or replace function fn_is_sales() returns boolean language sql stable security definer as $$
  select exists (select 1 from profiles where id = auth.uid() and role in ('admin','sales'));
$$;

create or replace function fn_is_accountant() returns boolean language sql stable security definer as $$
  select exists (select 1 from profiles where id = auth.uid() and role in ('admin','accountant'));
$$;

create or replace function fn_is_delivery() returns boolean language sql stable security definer as $$
  select exists (select 1 from profiles where id = auth.uid() and role in ('admin','delivery'));
$$;

create or replace function fn_is_content_editor() returns boolean language sql stable security definer as $$
  select exists (select 1 from profiles where id = auth.uid() and role in ('admin','content_editor'));
$$;

-- Orders: sales and delivery work them; accountants read them.
drop policy if exists "role_select_orders" on orders;
create policy "role_select_orders" on orders for select to authenticated
using (fn_is_sales() or fn_is_delivery() or fn_is_accountant());

drop policy if exists "role_update_orders" on orders;
create policy "role_update_orders" on orders for update to authenticated
using (fn_is_sales() or fn_is_delivery()) with check (fn_is_sales() or fn_is_delivery());

drop policy if exists "role_select_order_items" on order_items;
create policy "role_select_order_items" on order_items for select to authenticated
using (fn_is_sales() or fn_is_delivery() or fn_is_accountant());

-- Leads, messages, coupons and the customer list belong to sales.
drop policy if exists "sales_select_leads" on leads;
create policy "sales_select_leads" on leads for select to authenticated using (fn_is_sales());

drop policy if exists "sales_update_leads" on leads;
create policy "sales_update_leads" on leads for update to authenticated
using (fn_is_sales()) with check (fn_is_sales());

drop policy if exists "sales_select_contact_messages" on contact_messages;
create policy "sales_select_contact_messages" on contact_messages for select to authenticated
using (fn_is_sales());

drop policy if exists "sales_update_contact_messages" on contact_messages;
create policy "sales_update_contact_messages" on contact_messages for update to authenticated
using (fn_is_sales()) with check (fn_is_sales());

drop policy if exists "sales_write_coupons" on coupons;
create policy "sales_write_coupons" on coupons for all to authenticated
using (fn_is_sales()) with check (fn_is_sales());

drop policy if exists "sales_select_profiles" on profiles;
create policy "sales_select_profiles" on profiles for select to authenticated using (fn_is_sales());

-- Finance belongs to the accountant.
drop policy if exists "accountant_write_expenses" on expenses;
create policy "accountant_write_expenses" on expenses for all to authenticated
using (fn_is_accountant()) with check (fn_is_accountant());

drop policy if exists "accountant_write_ledger" on ledger_entries;
create policy "accountant_write_ledger" on ledger_entries for all to authenticated
using (fn_is_accountant()) with check (fn_is_accountant());

-- The catalogue, packages and site content belong to the content editor.
drop policy if exists "content_editor_write_products" on products;
create policy "content_editor_write_products" on products for all to authenticated
using (fn_is_content_editor()) with check (fn_is_content_editor());

drop policy if exists "content_editor_read_products" on products;
create policy "content_editor_read_products" on products for select to authenticated
using (fn_is_content_editor());

drop policy if exists "content_editor_write_categories" on categories;
create policy "content_editor_write_categories" on categories for all to authenticated
using (fn_is_content_editor()) with check (fn_is_content_editor());

drop policy if exists "content_editor_write_brands" on brands;
create policy "content_editor_write_brands" on brands for all to authenticated
using (fn_is_content_editor()) with check (fn_is_content_editor());

drop policy if exists "content_editor_write_packages" on packages;
create policy "content_editor_write_packages" on packages for all to authenticated
using (fn_is_content_editor()) with check (fn_is_content_editor());

drop policy if exists "content_editor_write_package_items" on package_items;
create policy "content_editor_write_package_items" on package_items for all to authenticated
using (fn_is_content_editor()) with check (fn_is_content_editor());

drop policy if exists "content_editor_write_package_categories" on package_categories;
create policy "content_editor_write_package_categories" on package_categories for all to authenticated
using (fn_is_content_editor()) with check (fn_is_content_editor());

drop policy if exists "content_editor_update_site_content" on site_content;
create policy "content_editor_update_site_content" on site_content for update to authenticated
using (fn_is_content_editor()) with check (fn_is_content_editor());

drop policy if exists "content_editor_write_hero_slides" on hero_slides;
create policy "content_editor_write_hero_slides" on hero_slides for all to authenticated
using (fn_is_content_editor()) with check (fn_is_content_editor());

notify pgrst, 'reload schema';
