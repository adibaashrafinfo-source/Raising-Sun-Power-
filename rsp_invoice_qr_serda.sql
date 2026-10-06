-- Invoice QR + warranty + SERDA serial numbers.
--
-- Adds the three columns the invoice/quotation flow needs:
--   * products.serda_serial_number  — admin-entered SERDA tracking number,
--     printed on invoices under the product name.
--   * order_items.warranty_months   — snapshotted from the product at checkout
--     so the invoice reads correctly after a catalogue edit.
--   * order_items.serda_serial_number — same snapshotting idea for SERDA.
--
-- Idempotent — safe to re-run.

alter table products
  add column if not exists serda_serial_number text;

alter table order_items
  add column if not exists warranty_months integer;

alter table order_items
  add column if not exists serda_serial_number text;

notify pgrst, 'reload schema';
