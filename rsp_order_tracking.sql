-- ============================================================================
-- Guest order tracking
-- Applied already — kept here as the record of what ran.
--
-- Guest orders have no user_id, so RLS never lets the browser read them back.
-- This SECURITY DEFINER function returns one order plus its items, but only
-- when the caller supplies BOTH the order number and the phone number that
-- was used to place it — so nobody can enumerate other people's orders.
-- APPLIED 2026-09-25 as migration guest_order_tracking.
-- ============================================================================

create or replace function public.fn_track_order(
  p_order_number text,
  p_phone text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order orders%rowtype;
  v_items jsonb;
  v_phone text;
begin
  -- Compare digits only: 01711-000000, +8801711000000 and 01711000000 all match.
  v_phone := right(regexp_replace(coalesce(p_phone, ''), '\D', '', 'g'), 10);
  if length(v_phone) < 10 or coalesce(p_order_number, '') = '' then
    return null;
  end if;

  select * into v_order
  from orders
  where upper(order_number) = upper(trim(p_order_number))
    and right(regexp_replace(guest_phone, '\D', '', 'g'), 10) = v_phone
  limit 1;

  if not found then
    return null;
  end if;

  select coalesce(jsonb_agg(to_jsonb(oi) order by oi.product_name), '[]'::jsonb)
  into v_items
  from order_items oi
  where oi.order_id = v_order.id;

  return jsonb_build_object('order', to_jsonb(v_order), 'items', v_items);
end;
$$;

revoke all on function public.fn_track_order(text, text) from public;
grant execute on function public.fn_track_order(text, text) to anon, authenticated;

notify pgrst, 'reload schema';
