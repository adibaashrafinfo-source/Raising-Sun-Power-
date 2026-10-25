-- Orders could never actually be deleted: RLS is enabled on the orders
-- table (select/insert/update policies exist), but no DELETE policy was ever
-- added. With no matching policy, PostgREST's delete filters every row out
-- and returns 200 with an empty result — no error, so the admin panel's
-- "Order deleted" toast was lying; nothing was removed.
--
-- Scoped to the roles that manage orders day to day (admin + sales), not
-- delivery (dispatch-only) or accountant (read-only), matching
-- role_update_orders' intent.
--
-- Idempotent — safe to re-run.

drop policy if exists "role_delete_orders" on orders;
create policy "role_delete_orders" on orders for delete to authenticated
using (fn_is_sales());

notify pgrst, 'reload schema';
