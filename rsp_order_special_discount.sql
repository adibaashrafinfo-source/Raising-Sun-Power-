-- Special discount: a flat amount an admin takes off an order by hand from the
-- order dialog. orders.total already includes it (total = subtotal - coupon
-- discount - special_discount + delivery), so existing reports that sum
-- total keep working. Idempotent.

alter table orders
  add column if not exists special_discount numeric(12,2) not null default 0
  check (special_discount >= 0);

notify pgrst, 'reload schema';
