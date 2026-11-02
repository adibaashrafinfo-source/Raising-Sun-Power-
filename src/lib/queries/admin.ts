import { supabase } from "@/lib/supabase"
import { type UploadedImage, uploadImageToBucket } from "@/lib/upload-image"
import type {
  Brand,
  CashBankAccount,
  Category,
  ContactMessage,
  Coupon,
  Expense,
  ExpenseCategory,
  FinancePaymentMethod,
  Lead,
  LeadStatus,
  Location,
  Order,
  OrderStatus,
  Product,
  ProductStock,
  Profile,
  ProfileRole,
  Purchase,
  PurchaseReturn,
  SalesReturn,
  Settings,
  Supplier,
} from "@/types/database"

const PRODUCT_SELECT =
  "*, category:categories(id,name,slug), brand:brands(id,name,slug,logo_url)"

// ---------- Dashboard ----------
const TREND_DAYS = 14

export type DashboardStats = Awaited<ReturnType<typeof fetchDashboardStats>>

export async function fetchDashboardStats() {
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)
  const startOfYesterday = new Date(startOfToday)
  startOfYesterday.setDate(startOfYesterday.getDate() - 1)
  const trendStart = new Date(startOfToday)
  trendStart.setDate(trendStart.getDate() - (TREND_DAYS - 1))

  const [
    todayOrders,
    yesterdayOrders,
    pendingOrders,
    allOrders,
    lowStock,
    recentOrders,
    topProducts,
    trendOrders,
    statusRows,
    customerCount,
    pendingTrendRows,
    customerTrendRows,
  ] = await Promise.all([
    supabase.from("orders").select("total").gte("created_at", startOfToday.toISOString()),
    supabase
      .from("orders")
      .select("total")
      .gte("created_at", startOfYesterday.toISOString())
      .lt("created_at", startOfToday.toISOString()),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase.from("products").select("id", { count: "exact", head: true }).lt("stock_qty", 10),
    supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(6),
    supabase.from("products").select("*").order("rating_count", { ascending: false }).limit(5),
    supabase.from("orders").select("total, created_at").gte("created_at", trendStart.toISOString()),
    supabase.from("orders").select("status"),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    // Series behind the Pending and Customers cards, over the same window as
    // the sales trend so every card's sparkline covers the same days.
    supabase
      .from("orders")
      .select("created_at")
      .eq("status", "pending")
      .gte("created_at", trendStart.toISOString()),
    supabase.from("profiles").select("created_at").gte("created_at", trendStart.toISOString()),
  ])

  const todaySales = (todayOrders.data ?? []).reduce((sum, o) => sum + Number(o.total), 0)
  const yesterdaySales = (yesterdayOrders.data ?? []).reduce((sum, o) => sum + Number(o.total), 0)
  const salesChangePct =
    yesterdaySales > 0 ? ((todaySales - yesterdaySales) / yesterdaySales) * 100 : todaySales > 0 ? 100 : 0

  const salesTrend: { date: string; sales: number; orders: number }[] = []
  for (let i = TREND_DAYS - 1; i >= 0; i--) {
    const d = new Date(startOfToday)
    d.setDate(d.getDate() - i)
    salesTrend.push({ date: d.toISOString().slice(0, 10), sales: 0, orders: 0 })
  }
  const trendMap = new Map(salesTrend.map((t) => [t.date, t]))
  for (const o of trendOrders.data ?? []) {
    const bucket = trendMap.get(String(o.created_at).slice(0, 10))
    if (bucket) {
      bucket.sales += Number(o.total)
      bucket.orders += 1
    }
  }

  /** Daily counts over the trend window, zero-filled so the line never gaps. */
  const dailyCounts = (rows: { created_at: string | null }[] | null) => {
    const buckets = new Map(salesTrend.map((t) => [t.date, 0]))
    for (const row of rows ?? []) {
      const key = String(row.created_at).slice(0, 10)
      if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1)
    }
    return [...buckets.values()]
  }

  const pendingTrend = dailyCounts(pendingTrendRows.data)
  const customerTrend = dailyCounts(customerTrendRows.data)

  /** Change across the window: its second half against its first. */
  const halfOverHalfPct = (series: number[]) => {
    const mid = Math.floor(series.length / 2)
    const first = series.slice(0, mid).reduce((a, b) => a + b, 0)
    const second = series.slice(mid).reduce((a, b) => a + b, 0)
    if (first === 0) return second > 0 ? 100 : 0
    return ((second - first) / first) * 100
  }

  const orderTrend = salesTrend.map((t) => t.orders)
  const todayOrderCount = todayOrders.data?.length ?? 0
  const yesterdayOrderCount = yesterdayOrders.data?.length ?? 0
  const ordersChangePct =
    yesterdayOrderCount > 0
      ? ((todayOrderCount - yesterdayOrderCount) / yesterdayOrderCount) * 100
      : todayOrderCount > 0
        ? 100
        : 0

  const statusCounts: Record<string, number> = {}
  for (const row of statusRows.data ?? []) {
    statusCounts[row.status] = (statusCounts[row.status] ?? 0) + 1
  }

  return {
    todaySales,
    todayOrderCount,
    salesChangePct,
    ordersChangePct,
    pendingChangePct: halfOverHalfPct(pendingTrend),
    customersChangePct: halfOverHalfPct(customerTrend),
    pendingCount: pendingOrders.count ?? 0,
    totalOrders: allOrders.count ?? 0,
    lowStockCount: lowStock.count ?? 0,
    customerCount: customerCount.count ?? 0,
    recentOrders: (recentOrders.data as Order[]) ?? [],
    topProducts: (topProducts.data as Product[]) ?? [],
    salesTrend,
    orderTrend,
    pendingTrend,
    customerTrend,
    statusCounts,
  }
}

// ---------- Orders ----------
export async function fetchAllOrders(filters: { status?: OrderStatus; search?: string }): Promise<Order[]> {
  let query = supabase.from("orders").select("*").order("created_at", { ascending: false })
  if (filters.status) query = query.eq("status", filters.status)
  if (filters.search) query = query.or(`order_number.ilike.%${filters.search}%,guest_phone.ilike.%${filters.search}%`)
  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  const { error } = await supabase.from("orders").update({ status }).eq("id", orderId)
  if (error) throw error
}

// Orders own several dependent rows. order_items cascade-delete with the order,
// but customer_payments and sales_returns reference orders WITHOUT a cascade, so
// they'd block the delete — remove them first. Each customer payment also wrote a
// ledger_entries row (via trg_customer_payment_after_insert, source_id = payment
// id, no FK), which is cleared here too so the finance ledger doesn't keep phantom
// income after the order is gone. (Deleting an order does not restore stock —
// cancel the order for that; delete is for erroneous/duplicate orders.)
export async function deleteOrder(id: string): Promise<void> {
  const { data: payments, error: paymentsFetchError } = await supabase
    .from("customer_payments")
    .select("id")
    .eq("order_id", id)
  if (paymentsFetchError) throw paymentsFetchError

  const paymentIds = (payments ?? []).map((p) => p.id)
  if (paymentIds.length > 0) {
    const { error: ledgerError } = await supabase
      .from("ledger_entries")
      .delete()
      .eq("source_type", "sale_payment")
      .in("source_id", paymentIds)
    if (ledgerError) throw ledgerError

    const { error: paymentsDeleteError } = await supabase
      .from("customer_payments")
      .delete()
      .eq("order_id", id)
    if (paymentsDeleteError) throw paymentsDeleteError
  }

  // sales_return_items cascade with their sales_returns parent.
  const { error: returnsError } = await supabase.from("sales_returns").delete().eq("order_id", id)
  if (returnsError) throw returnsError

  // Same as deleteProduct: a row-level security policy can filter the delete
  // down to zero rows without PostgREST treating that as an error, so the
  // deleted row is asked back for and an empty result is raised as a failure.
  const { data, error } = await supabase.from("orders").delete().eq("id", id).select("id")
  if (error) throw error
  if (!data || data.length === 0) {
    throw new Error("Nothing was deleted — you may not have permission to delete this order.")
  }

  await logActivity({ action: "delete", table_name: "orders", record_id: id })
}

/**
 * Sets the order's discount to a flat amount (any coupon discount is replaced).
 * total = subtotal - discount + delivery; due and payment status follow the
 * same rule the insert trigger uses. Returns the updated row so the open
 * dialog and invoice show the new figures straight away.
 */
export async function setOrderDiscount(order: Order, amount: number): Promise<Order> {
  const subtotal = Number(order.subtotal)
  const discount = Math.min(Math.max(Math.round(amount * 100) / 100, 0), subtotal)
  // An invoice with VAT charges it on what is left after the discount.
  const vatPercent = Number(order.vat_percent ?? 0)
  const vat = vatPercent > 0 ? Math.round(((subtotal - discount) * vatPercent) / 100 * 100) / 100 : 0
  const total = subtotal - discount + vat + Number(order.delivery_charge)
  const paid = Number(order.paid_amount)
  const due = Math.max(total - paid, 0)
  const paymentStatus = due <= 0 ? "paid" : paid > 0 ? "partial" : "due"

  const patch: Record<string, unknown> = { discount, total, due_amount: due, payment_status: paymentStatus }
  if (vatPercent > 0) patch.vat_amount = vat

  const { data, error } = await supabase.from("orders").update(patch).eq("id", order.id).select("*").maybeSingle()
  if (error) throw error
  if (!data) throw new Error("Nothing was updated — you may not have permission to edit this order.")

  await logActivity({ action: "update", table_name: "orders", record_id: order.id })
  return data as Order
}

// ---------- Admin-made invoices ----------
// An invoice raised by hand (phone or walk-in sale) is stored as an order whose
// number starts INV-, so it shares the orders table's payments, stock and
// reporting instead of needing a second ledger. Needs rsp_quotations_invoices.sql.

export type AdminInvoiceInput = {
  number: string
  customer: { name: string; phone: string; email: string; company: string; address: string; area: string }
  lines: { product_id: string | null; name: string; qty: number; unit_price: number; warranty_months?: number | null; serda_serial_number?: string | null }[]
  discount: number
  delivery: number
  vatPercent: number
  dueDate: string
  notes: string
  deliveryMethod: "pickup" | "courier"
  payment: { amount: number; method: FinancePaymentMethod; date: string; note: string } | null
  deductStock: boolean
}

export function newInvoiceNumber(): string {
  const d = new Date()
  const stamp = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`
  return `INV-${stamp}-${crypto.randomUUID().slice(0, 4).toUpperCase()}`
}

/** items = sum of lines; VAT is charged on items minus the discount; total = items − discount + VAT + delivery. */
export function invoiceTotals(input: Pick<AdminInvoiceInput, "lines" | "discount" | "delivery" | "vatPercent">) {
  const items = input.lines.reduce((sum, l) => sum + l.qty * l.unit_price, 0)
  const discount = Math.min(Math.max(input.discount, 0), items)
  const vat = Math.round(((items - discount) * Math.max(input.vatPercent, 0)) / 100 * 100) / 100
  const total = items - discount + vat + Math.max(input.delivery, 0)
  return { items, discount, vat, subtotal: items, total }
}

function invoiceRow(input: AdminInvoiceInput) {
  const t = invoiceTotals(input)
  return {
    t,
    row: {
      order_number: input.number.trim(),
      guest_name: input.customer.name.trim(),
      guest_phone: input.customer.phone.trim(),
      customer_email: input.customer.email.trim() || null,
      customer_company: input.customer.company.trim() || null,
      division: "—",
      district: input.customer.area.trim() || "—",
      address_line: input.customer.address.trim() || "—",
      delivery_method: input.deliveryMethod,
      subtotal: t.subtotal,
      delivery_charge: Math.max(input.delivery, 0),
      discount: t.discount,
      vat_percent: Math.max(input.vatPercent, 0),
      vat_amount: t.vat,
      total: t.total,
      due_date: input.dueDate || null,
      notes: input.notes.trim() || null,
    },
  }
}

const invoiceItemRows = (orderId: string, lines: AdminInvoiceInput["lines"]) =>
  lines.map((l) => ({
    order_id: orderId,
    product_id: l.product_id,
    product_name: l.name,
    unit_price: l.unit_price,
    qty: l.qty,
    line_total: l.qty * l.unit_price,
    warranty_months: l.warranty_months ?? null,
    serda_serial_number: l.serda_serial_number ?? null,
  }))

export async function createAdminInvoice(input: AdminInvoiceInput): Promise<{ order: Order; warning: string | null }> {
  const { t, row } = invoiceRow(input)
  if (input.payment && input.payment.amount > t.total) {
    throw new Error(`The payment (${input.payment.amount}) is more than the invoice total (${t.total}).`)
  }

  const id = crypto.randomUUID()
  const { error: orderError } = await supabase.from("orders").insert({
    ...row,
    id,
    user_id: null,
    status: "pending",
    payment_method: "cod",
    payment_reference: null,
    payment_sender_number: null,
    upazila: null,
    landmark: null,
    coupon_id: null,
  })
  if (orderError) throw orderError

  const { error: itemsError } = await supabase.from("order_items").insert(invoiceItemRows(id, input.lines))
  if (itemsError) {
    // No half-made invoice: take the empty order back out.
    await supabase.from("orders").delete().eq("id", id)
    throw itemsError
  }

  let warning: string | null = null
  if (input.payment && input.payment.amount > 0) {
    try {
      await recordCustomerPayment({
        order_id: id,
        amount: input.payment.amount,
        payment_method: input.payment.method,
        payment_date: input.payment.date,
        reference_note: input.payment.note.trim() || null,
        currentDue: t.total,
      })
    } catch (err) {
      warning = `Invoice created, but the payment wasn't recorded: ${err instanceof Error ? err.message : "unknown error"}`
    }
  }
  if (input.deductStock) {
    try {
      await updateOrderStatus(id, "confirmed")
    } catch (err) {
      warning = `${warning ? `${warning} ` : ""}Invoice created, but stock wasn't deducted: ${err instanceof Error ? err.message : "unknown error"}`
    }
  }

  await logActivity({ action: "insert", table_name: "orders", record_id: id })
  const { data } = await supabase.from("orders").select("*").eq("id", id).maybeSingle()
  if (!data) throw new Error("The invoice was saved but couldn't be read back — refresh the list.")
  return { order: data as Order, warning }
}

/**
 * Edits an invoice: customer, items, charges, due date, notes. Payments already
 * collected stay; due and payment status are recalculated against them. Stock
 * that was already deducted is not adjusted — change it from Stock.
 */
export async function updateAdminInvoice(order: Order, input: AdminInvoiceInput): Promise<Order> {
  const { t, row } = invoiceRow(input)
  const paid = Number(order.paid_amount)
  const due = Math.max(t.total - paid, 0)
  const paymentStatus = due <= 0 ? "paid" : paid > 0 ? "partial" : "due"

  const { data: updated, error } = await supabase
    .from("orders")
    .update({ ...row, due_amount: due, payment_status: paymentStatus })
    .eq("id", order.id)
    .select("*")
    .maybeSingle()
  if (error) throw error
  if (!updated) throw new Error("Nothing was updated — you may not have permission to edit this invoice.")

  // Items are replaced wholesale. Needs the order_items delete policy from
  // rsp_quotations_invoices.sql — without it the delete would silently remove nothing.
  const { data: removed, error: deleteError } = await supabase
    .from("order_items")
    .delete()
    .eq("order_id", order.id)
    .select("id")
  if (deleteError) throw deleteError
  if (!removed || removed.length === 0) {
    throw new Error("The old items couldn't be replaced — run rsp_quotations_invoices.sql in Supabase first.")
  }
  const { error: itemsError } = await supabase.from("order_items").insert(invoiceItemRows(order.id, input.lines))
  if (itemsError) throw itemsError

  await logActivity({ action: "update", table_name: "orders", record_id: order.id })
  return updated as Order
}

export async function fetchAdminInvoices(): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .like("order_number", "INV-%")
    .order("created_at", { ascending: false })
  if (error) throw error
  return data ?? []
}

// ---------- Products ----------
export async function fetchAllProductsAdmin(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .order("created_at", { ascending: false })
  if (error) throw error
  return (data as unknown as Product[]) ?? []
}

export type ProductUpsert = {
  id?: string
  name: string
  slug: string
  category_id: string | null
  brand_id: string | null
  sku: string | null
  unit: string
  price: number
  sale_price: number | null
  cost_price: number
  stock_qty: number
  reorder_level: number
  warranty_months: number
  has_serial_tracking: boolean
  serda_serial_number: string | null
  is_active: boolean
  is_best_seller: boolean
  is_new_arrival: boolean
  is_featured: boolean
  short_description: string | null
  description: string | null
  specifications: Record<string, string>
  badges: string[]
  images: string[]
  status: "draft" | "published" | "archived"
}

export async function upsertProduct(product: ProductUpsert): Promise<void> {
  if (product.id) {
    const { id, ...patch } = product
    const { error } = await supabase.from("products").update(patch).eq("id", id)
    if (error) throw error
  } else {
    const { error } = await supabase.from("products").insert(product)
    if (error) throw error
  }
}

export async function deleteProduct(id: string): Promise<void> {
  // PostgREST returns 200 with an empty result when a row-level security
  // policy filters a delete down to zero rows — no error, nothing deleted.
  // Asking for the deleted row back is what turns that into a real failure
  // instead of a false "deleted" toast.
  const { data, error } = await supabase.from("products").delete().eq("id", id).select("id")
  if (error) throw error
  if (!data || data.length === 0) {
    throw new Error("Nothing was deleted — you may not have permission to delete this product.")
  }
  await logActivity({ action: "delete", table_name: "products", record_id: id })
}

// Product photos are optimised in the browser first — see uploadImageToBucket.
// Any size is accepted: the picture is scaled down to fit a 1200px square and
// centred on it, so product cards (which are square) show the whole product.
export function uploadProductImage(file: File): Promise<UploadedImage> {
  return uploadImageToBucket("product-images", file, { maxDimension: 1200, maxBytes: 350_000, square: true })
}

// ---------- Categories ----------
export async function fetchAllCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from("categories").select("*").order("sort_order")
  if (error) throw error
  return data ?? []
}

export async function upsertCategory(category: Partial<Category> & { name: string; slug: string }) {
  if (category.id) {
    const { id, ...patch } = category
    const { error } = await supabase.from("categories").update(patch).eq("id", id)
    if (error) throw error
  } else {
    const { error } = await supabase.from("categories").insert(category)
    if (error) throw error
  }
}

export async function deleteCategory(id: string) {
  const { error } = await supabase.from("categories").delete().eq("id", id)
  if (error) throw error
}

// ---------- Brands ----------
export async function fetchAllBrands(): Promise<Brand[]> {
  const { data, error } = await supabase.from("brands").select("*").order("name")
  if (error) throw error
  return data ?? []
}

export async function upsertBrand(brand: Partial<Brand> & { name: string; slug: string }) {
  if (brand.id) {
    const { id, ...patch } = brand
    const { error } = await supabase.from("brands").update(patch).eq("id", id)
    if (error) throw error
  } else {
    const { error } = await supabase.from("brands").insert(brand)
    if (error) throw error
  }
}

export async function deleteBrand(id: string) {
  const { error } = await supabase.from("brands").delete().eq("id", id)
  if (error) throw error
}

// ---------- Customers ----------
export async function fetchCustomers(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
  if (error) throw error
  return data ?? []
}

// ---------- Coupons ----------
export async function fetchAllCoupons(): Promise<Coupon[]> {
  const { data, error } = await supabase.from("coupons").select("*").order("created_at", { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function upsertCoupon(coupon: Partial<Coupon> & { code: string }) {
  if (coupon.id) {
    const { id, ...patch } = coupon
    const { error } = await supabase.from("coupons").update(patch).eq("id", id)
    if (error) throw error
  } else {
    const { error } = await supabase.from("coupons").insert(coupon)
    if (error) throw error
  }
}

export async function deleteCoupon(id: string) {
  const { error } = await supabase.from("coupons").delete().eq("id", id)
  if (error) throw error
}

// ---------- Leads ----------
export async function fetchAllLeads(filters: { status?: LeadStatus }): Promise<Lead[]> {
  let query = supabase.from("leads").select("*").order("created_at", { ascending: false })
  if (filters.status) query = query.eq("status", filters.status)
  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function updateLead(id: string, patch: Partial<Pick<Lead, "status" | "admin_notes">>) {
  const { error } = await supabase.from("leads").update(patch).eq("id", id)
  if (error) throw error
}

// ---------- Contact Messages ----------
export async function fetchContactMessages(): Promise<ContactMessage[]> {
  const { data, error } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function markContactMessageRead(id: string) {
  const { error } = await supabase.from("contact_messages").update({ status: "read" }).eq("id", id)
  if (error) throw error
}

export async function deleteContactMessage(id: string) {
  const { error } = await supabase.from("contact_messages").delete().eq("id", id)
  if (error) throw error
}

// ---------- Settings ----------
export async function updateSettings(patch: Partial<Settings>) {
  const { error } = await supabase.from("settings").update(patch).eq("id", 1)
  if (error) throw error
}

// ---------- Locations ----------
export async function fetchLocations(): Promise<Location[]> {
  const { data, error } = await supabase.from("locations").select("*").order("name")
  if (error) throw error
  return data ?? []
}

// ---------- Stock ----------
const STOCK_SELECT =
  "*, location:locations(id,name), product:products(id,name,sku,category:categories(id,name))"

export async function fetchProductStock(): Promise<ProductStock[]> {
  const { data, error } = await supabase
    .from("product_stock")
    .select(STOCK_SELECT)
    .order("updated_at", { ascending: false })
  if (error) throw error
  return (data as unknown as ProductStock[]) ?? []
}

export async function fetchProductStockTotals(): Promise<Record<string, number>> {
  const { data, error } = await supabase.from("product_stock").select("product_id, quantity")
  if (error) throw error
  const totals: Record<string, number> = {}
  for (const row of data ?? []) {
    totals[row.product_id] = (totals[row.product_id] ?? 0) + row.quantity
  }
  return totals
}

export async function adjustStock(input: {
  productId: string
  locationId: string
  delta: number
  reason: string
}): Promise<void> {
  const { data: existing, error: fetchError } = await supabase
    .from("product_stock")
    .select("quantity")
    .eq("product_id", input.productId)
    .eq("location_id", input.locationId)
    .maybeSingle()
  if (fetchError) throw fetchError

  const newQuantity = (existing?.quantity ?? 0) + input.delta
  if (newQuantity < 0) throw new Error("Adjustment would make stock negative")

  const { error: upsertError } = await supabase
    .from("product_stock")
    .upsert(
      { product_id: input.productId, location_id: input.locationId, quantity: newQuantity },
      { onConflict: "product_id,location_id" },
    )
  if (upsertError) throw upsertError

  const { error: movementError } = await supabase.from("stock_movements").insert({
    product_id: input.productId,
    location_id: input.locationId,
    movement_type: "adjustment",
    quantity: input.delta,
    reference_type: "manual_adjustment",
    reason: input.reason,
  })
  if (movementError) throw movementError

  await logActivity({
    action: "update",
    table_name: "product_stock",
    record_id: input.productId,
    new_data: { location_id: input.locationId, delta: input.delta, reason: input.reason },
  })
}

export async function transferStock(input: {
  productId: string
  fromLocationId: string
  toLocationId: string
  quantity: number
}): Promise<void> {
  if (input.fromLocationId === input.toLocationId) {
    throw new Error("Source and destination location must be different")
  }

  const { data: source, error: sourceError } = await supabase
    .from("product_stock")
    .select("quantity")
    .eq("product_id", input.productId)
    .eq("location_id", input.fromLocationId)
    .maybeSingle()
  if (sourceError) throw sourceError
  if ((source?.quantity ?? 0) < input.quantity) {
    throw new Error("Not enough stock at the source location for this transfer")
  }

  const { data: dest, error: destError } = await supabase
    .from("product_stock")
    .select("quantity")
    .eq("product_id", input.productId)
    .eq("location_id", input.toLocationId)
    .maybeSingle()
  if (destError) throw destError

  const { error: decError } = await supabase
    .from("product_stock")
    .update({ quantity: (source?.quantity ?? 0) - input.quantity })
    .eq("product_id", input.productId)
    .eq("location_id", input.fromLocationId)
  if (decError) throw decError

  const { error: incError } = await supabase
    .from("product_stock")
    .upsert(
      { product_id: input.productId, location_id: input.toLocationId, quantity: (dest?.quantity ?? 0) + input.quantity },
      { onConflict: "product_id,location_id" },
    )
  if (incError) throw incError

  const { error: movementError } = await supabase.from("stock_movements").insert([
    {
      product_id: input.productId,
      location_id: input.fromLocationId,
      movement_type: "transfer_out",
      quantity: input.quantity,
      reference_type: "transfer",
    },
    {
      product_id: input.productId,
      location_id: input.toLocationId,
      movement_type: "transfer_in",
      quantity: input.quantity,
      reference_type: "transfer",
    },
  ])
  if (movementError) throw movementError
}

// ---------- Suppliers ----------
export async function fetchSuppliers(): Promise<Supplier[]> {
  const { data, error } = await supabase.from("suppliers").select("*").order("name")
  if (error) throw error
  return data ?? []
}

export async function upsertSupplier(supplier: Partial<Supplier> & { name: string }) {
  if (supplier.id) {
    const { id, ...patch } = supplier
    const { error } = await supabase.from("suppliers").update(patch).eq("id", id)
    if (error) throw error
  } else {
    const { error } = await supabase.from("suppliers").insert(supplier)
    if (error) throw error
  }
}

export async function deleteSupplier(id: string) {
  const { error } = await supabase.from("suppliers").delete().eq("id", id)
  if (error) throw error
}

export async function fetchSupplierPurchases(supplierId: string): Promise<Purchase[]> {
  const { data, error } = await supabase
    .from("purchases")
    .select("*, location:locations(id,name)")
    .eq("supplier_id", supplierId)
    .order("purchase_date", { ascending: false })
  if (error) throw error
  return (data as unknown as Purchase[]) ?? []
}

export async function fetchSupplierPayments(supplierId: string) {
  const { data, error } = await supabase
    .from("supplier_payments")
    .select("*")
    .eq("supplier_id", supplierId)
    .order("payment_date", { ascending: false })
  if (error) throw error
  return data ?? []
}

// ---------- Purchases ----------
const PURCHASE_SELECT = "*, supplier:suppliers(id,name,phone), location:locations(id,name)"

export async function fetchPurchases(): Promise<Purchase[]> {
  const { data, error } = await supabase
    .from("purchases")
    .select(PURCHASE_SELECT)
    .order("purchase_date", { ascending: false })
  if (error) throw error
  return (data as unknown as Purchase[]) ?? []
}

// Deleting a purchase has no DB trigger to reverse its stock-IN /
// supplier-due effects (only creation is automated), so this manually
// undoes both before removing the row — otherwise stock and supplier dues
// would silently drift from reality. purchase_items cascade-deletes with
// the parent row.
export async function deletePurchase(id: string): Promise<void> {
  const { data: purchase, error: purchaseFetchError } = await supabase
    .from("purchases")
    .select("supplier_id, due_amount, location_id")
    .eq("id", id)
    .single()
  if (purchaseFetchError) throw purchaseFetchError

  const { data: items, error: itemsError } = await supabase
    .from("purchase_items")
    .select("product_id, quantity")
    .eq("purchase_id", id)
  if (itemsError) throw itemsError

  for (const item of items ?? []) {
    const { data: stockRow, error: stockFetchError } = await supabase
      .from("product_stock")
      .select("quantity")
      .eq("product_id", item.product_id)
      .eq("location_id", purchase.location_id)
      .maybeSingle()
    if (stockFetchError) throw stockFetchError

    const { error: stockUpdateError } = await supabase
      .from("product_stock")
      .update({ quantity: Math.max((stockRow?.quantity ?? 0) - item.quantity, 0) })
      .eq("product_id", item.product_id)
      .eq("location_id", purchase.location_id)
    if (stockUpdateError) throw stockUpdateError

    const { error: movementError } = await supabase.from("stock_movements").insert({
      product_id: item.product_id,
      location_id: purchase.location_id,
      movement_type: "out",
      quantity: item.quantity,
      reference_type: "purchase_deleted",
      reference_id: id,
    })
    if (movementError) throw movementError
  }

  if (purchase.due_amount > 0) {
    const { data: supplier, error: supplierFetchError } = await supabase
      .from("suppliers")
      .select("current_due")
      .eq("id", purchase.supplier_id)
      .single()
    if (supplierFetchError) throw supplierFetchError

    const { error: supplierUpdateError } = await supabase
      .from("suppliers")
      .update({ current_due: Math.max(supplier.current_due - purchase.due_amount, 0) })
      .eq("id", purchase.supplier_id)
    if (supplierUpdateError) throw supplierUpdateError
  }

  const { error: deleteError } = await supabase.from("purchases").delete().eq("id", id)
  if (deleteError) throw deleteError

  await logActivity({ action: "delete", table_name: "purchases", record_id: id, old_data: purchase })
}

export async function fetchPurchaseItems(purchaseId: string) {
  const { data, error } = await supabase
    .from("purchase_items")
    .select("*, product:products(id,name,sku)")
    .eq("purchase_id", purchaseId)
  if (error) throw error
  return data ?? []
}

export type NewPurchaseInput = {
  invoice_number: string
  supplier_id: string
  location_id: string
  purchase_date: string
  tax_amount: number
  paid_amount: number
  items: { product_id: string; quantity: number; unit_cost: number }[]
}

export async function createPurchase(input: NewPurchaseInput): Promise<Purchase> {
  // fn_create_purchase inserts the purchase and all of its items in a single
  // implicit transaction — if any item insert fails, everything (including
  // the purchase row) is rolled back, instead of leaving a half-created
  // purchase behind like the old sequential-insert approach did.
  const { data: purchaseId, error: rpcError } = await supabase.rpc("fn_create_purchase", {
    p_invoice_number: input.invoice_number,
    p_supplier_id: input.supplier_id,
    p_location_id: input.location_id,
    p_purchase_date: input.purchase_date,
    p_tax_amount: input.tax_amount,
    p_paid_amount: input.paid_amount,
    p_items: input.items.map((item) => ({
      product_id: item.product_id,
      quantity: item.quantity,
      unit_cost: item.unit_cost,
    })),
  })
  if (rpcError) throw rpcError

  const { data: purchase, error: fetchError } = await supabase
    .from("purchases")
    .select(PURCHASE_SELECT)
    .eq("id", purchaseId)
    .single()
  if (fetchError) throw fetchError

  await logActivity({ action: "insert", table_name: "purchases", record_id: purchase.id, new_data: purchase })

  return purchase as unknown as Purchase
}

export async function recordSupplierPayment(input: {
  supplier_id: string
  purchase_id: string | null
  amount: number
  payment_method: FinancePaymentMethod
  payment_date: string
  reference_note: string | null
  currentDue: number
}) {
  if (input.amount > input.currentDue) {
    throw new Error(`Payment amount can't exceed the due amount (${input.currentDue.toFixed(2)})`)
  }
  const { error } = await supabase.from("supplier_payments").insert({
    supplier_id: input.supplier_id,
    purchase_id: input.purchase_id,
    amount: input.amount,
    payment_method: input.payment_method,
    payment_date: input.payment_date,
    reference_note: input.reference_note,
  })
  if (error) throw error
}

// ---------- Purchase Returns ----------
export async function fetchPurchaseReturns(): Promise<PurchaseReturn[]> {
  const { data, error } = await supabase
    .from("purchase_returns")
    .select("*, supplier:suppliers(id,name), purchase:purchases(id,invoice_number)")
    .order("return_date", { ascending: false })
  if (error) throw error
  return (data as unknown as PurchaseReturn[]) ?? []
}

export type NewPurchaseReturnInput = {
  purchase_id: string
  supplier_id: string
  location_id: string
  return_date: string
  reason: string
  items: { product_id: string; quantity: number; unit_cost: number }[]
}

export async function createPurchaseReturn(input: NewPurchaseReturnInput): Promise<void> {
  const total_amount = input.items.reduce((sum, i) => sum + i.quantity * i.unit_cost, 0)
  const returnNumber = `PR-${Date.now().toString(36).toUpperCase()}`

  const { data: ret, error: returnError } = await supabase
    .from("purchase_returns")
    .insert({
      return_number: returnNumber,
      purchase_id: input.purchase_id,
      supplier_id: input.supplier_id,
      return_date: input.return_date,
      total_amount,
      reason: input.reason,
    })
    .select("id")
    .single()
  if (returnError) throw returnError

  // No DB trigger exists for purchase returns (unlike purchase_items' stock-IN
  // trigger), so stock is decremented here explicitly.
  for (const item of input.items) {
    const { error: itemError } = await supabase.from("purchase_return_items").insert({
      return_id: ret.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_cost: item.unit_cost,
    })
    if (itemError) throw itemError

    const { data: stockRow, error: stockFetchError } = await supabase
      .from("product_stock")
      .select("quantity")
      .eq("product_id", item.product_id)
      .eq("location_id", input.location_id)
      .maybeSingle()
    if (stockFetchError) throw stockFetchError

    const { error: stockUpdateError } = await supabase
      .from("product_stock")
      .update({ quantity: Math.max((stockRow?.quantity ?? 0) - item.quantity, 0) })
      .eq("product_id", item.product_id)
      .eq("location_id", input.location_id)
    if (stockUpdateError) throw stockUpdateError

    const { error: movementError } = await supabase.from("stock_movements").insert({
      product_id: item.product_id,
      location_id: input.location_id,
      movement_type: "out",
      quantity: item.quantity,
      reference_type: "purchase_return",
      reference_id: ret.id,
    })
    if (movementError) throw movementError
  }
}

// ---------- Customer Payments ----------
export async function fetchOrderPayments(orderId: string) {
  const { data, error } = await supabase
    .from("customer_payments")
    .select("*")
    .eq("order_id", orderId)
    .order("payment_date", { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function recordCustomerPayment(input: {
  order_id: string
  amount: number
  payment_method: FinancePaymentMethod
  payment_date: string
  reference_note: string | null
  currentDue: number
}) {
  if (input.amount > input.currentDue) {
    throw new Error(`Payment amount can't exceed the due amount (${input.currentDue.toFixed(2)})`)
  }
  const { error } = await supabase.from("customer_payments").insert({
    order_id: input.order_id,
    amount: input.amount,
    payment_method: input.payment_method,
    payment_date: input.payment_date,
    reference_note: input.reference_note,
  })
  if (error) throw error
}

// ---------- Sales Returns ----------
export async function fetchSalesReturns(): Promise<SalesReturn[]> {
  const { data, error } = await supabase
    .from("sales_returns")
    .select("*, order:orders(id,order_number)")
    .order("return_date", { ascending: false })
  if (error) throw error
  return (data as unknown as SalesReturn[]) ?? []
}

export async function fetchDefaultLocation(): Promise<Location> {
  const { data, error } = await supabase.from("locations").select("*").eq("is_default", true).single()
  if (error) throw error
  return data
}

export type NewSalesReturnInput = {
  order_id: string
  reason: string
  items: { product_id: string; quantity: number; unit_price: number }[]
}

export async function createSalesReturn(input: NewSalesReturnInput): Promise<void> {
  const total_amount = input.items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0)
  const returnNumber = `SR-${Date.now().toString(36).toUpperCase()}`
  const defaultLocation = await fetchDefaultLocation()

  const { data: ret, error: returnError } = await supabase
    .from("sales_returns")
    .insert({
      return_number: returnNumber,
      order_id: input.order_id,
      total_amount,
      reason: input.reason,
    })
    .select("id")
    .single()
  if (returnError) throw returnError

  // No DB trigger exists for sales returns (a separate flow from the
  // purchase-in side), so stock is re-added here explicitly.
  for (const item of input.items) {
    const { error: itemError } = await supabase.from("sales_return_items").insert({
      return_id: ret.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
    })
    if (itemError) throw itemError

    const { data: stockRow, error: stockFetchError } = await supabase
      .from("product_stock")
      .select("quantity")
      .eq("product_id", item.product_id)
      .eq("location_id", defaultLocation.id)
      .maybeSingle()
    if (stockFetchError) throw stockFetchError

    const { error: stockUpsertError } = await supabase
      .from("product_stock")
      .upsert(
        { product_id: item.product_id, location_id: defaultLocation.id, quantity: (stockRow?.quantity ?? 0) + item.quantity },
        { onConflict: "product_id,location_id" },
      )
    if (stockUpsertError) throw stockUpsertError

    const { error: movementError } = await supabase.from("stock_movements").insert({
      product_id: item.product_id,
      location_id: defaultLocation.id,
      movement_type: "in",
      quantity: item.quantity,
      reference_type: "sales_return",
      reference_id: ret.id,
    })
    if (movementError) throw movementError
  }
}

// ---------- Expenses ----------
export async function fetchExpenseCategories(): Promise<ExpenseCategory[]> {
  const { data, error } = await supabase.from("expense_categories").select("*").order("name")
  if (error) throw error
  return data ?? []
}

/** Admins add their own expense categories as their bookkeeping grows. */
export async function createExpenseCategory(name: string): Promise<ExpenseCategory> {
  const { data, error } = await supabase
    .from("expense_categories")
    .insert({ name: name.trim() })
    .select()
    .single()
  if (error) throw error
  return data as ExpenseCategory
}

export async function fetchExpenses(filters: {
  categoryId?: string
  fromDate?: string
  toDate?: string
}): Promise<Expense[]> {
  let query = supabase
    .from("expenses")
    .select("*, category:expense_categories(id,name)")
    .order("expense_date", { ascending: false })
  if (filters.categoryId) query = query.eq("category_id", filters.categoryId)
  if (filters.fromDate) query = query.gte("expense_date", filters.fromDate)
  if (filters.toDate) query = query.lte("expense_date", filters.toDate)
  const { data, error } = await query
  if (error) throw error
  return (data as unknown as Expense[]) ?? []
}

export async function createExpense(input: {
  category_id: string
  amount: number
  expense_date: string
  description: string | null
  payment_method: FinancePaymentMethod
}) {
  const { error } = await supabase.from("expenses").insert(input)
  if (error) throw error
  await logActivity({ action: "insert", table_name: "expenses", new_data: input })
}

// ledger_entries.source_id isn't a foreign key (no cascade), so the matching
// ledger row is removed explicitly — otherwise a deleted expense would keep
// showing up in view_ledger_summary / view_monthly_expense_summary forever.
export async function deleteExpense(id: string): Promise<void> {
  const { error: ledgerError } = await supabase
    .from("ledger_entries")
    .delete()
    .eq("source_type", "expense")
    .eq("source_id", id)
  if (ledgerError) throw ledgerError

  const { error } = await supabase.from("expenses").delete().eq("id", id)
  if (error) throw error

  await logActivity({ action: "delete", table_name: "expenses", record_id: id })
}

// ---------- Cash & Bank Accounts ----------
export async function fetchCashBankAccounts(): Promise<CashBankAccount[]> {
  const { data, error } = await supabase.from("cash_bank_accounts").select("*").order("account_name")
  if (error) throw error
  return data ?? []
}

export async function upsertCashBankAccount(account: Partial<CashBankAccount> & { account_name: string }) {
  if (account.id) {
    const { id, ...patch } = account
    const { error } = await supabase.from("cash_bank_accounts").update(patch).eq("id", id)
    if (error) throw error
  } else {
    const { error } = await supabase.from("cash_bank_accounts").insert(account)
    if (error) throw error
  }
}

export async function deleteCashBankAccount(id: string) {
  const { error } = await supabase.from("cash_bank_accounts").delete().eq("id", id)
  if (error) throw error
}

// ---------- Reports & Finance Dashboard ----------
export type StockValuationRow = {
  product_id: string
  name: string
  sku: string | null
  total_quantity: number
  cost_price: number
  stock_value: number
}

export async function fetchStockValuation(): Promise<StockValuationRow[]> {
  const { data, error } = await supabase
    .from("view_stock_valuation")
    .select("*")
    .order("stock_value", { ascending: false })
  if (error) throw error
  return data ?? []
}

export type LowStockAlertRow = {
  product_id: string
  name: string
  sku: string | null
  location_id: string
  location_name: string
  quantity: number
  min_stock_level: number
}

export async function fetchLowStockAlert(): Promise<LowStockAlertRow[]> {
  const { data, error } = await supabase
    .from("view_low_stock_alert")
    .select("*")
    .order("quantity", { ascending: true })
  if (error) throw error
  return data ?? []
}

export type SupplierDueRow = { id: string; name: string; phone: string | null; current_due: number }

export async function fetchSupplierDuesView(): Promise<SupplierDueRow[]> {
  const { data, error } = await supabase.from("view_supplier_dues").select("*")
  if (error) throw error
  return data ?? []
}

export type MonthlyExpenseRow = { month: string; category: string; total_amount: number }

export async function fetchMonthlyExpenseSummary(): Promise<MonthlyExpenseRow[]> {
  const { data, error } = await supabase.from("view_monthly_expense_summary").select("*")
  if (error) throw error
  return data ?? []
}

export type LedgerSummaryRow = { month: string; total_income: number; total_expense: number; net_cash_flow: number }

export async function fetchLedgerSummary(): Promise<LedgerSummaryRow[]> {
  const { data, error } = await supabase
    .from("view_ledger_summary")
    .select("*")
    .order("month", { ascending: false })
    .limit(12)
  if (error) throw error
  return data ?? []
}

export type ProfitLossRow = { month: string; revenue: number; cogs: number }

export async function fetchProfitLossMonthly(): Promise<ProfitLossRow[]> {
  const { data, error } = await supabase
    .from("view_profit_loss_monthly")
    .select("*")
    .order("month", { ascending: false })
    .limit(12)
  if (error) throw error
  return data ?? []
}

export async function fetchCustomerDueTotal(): Promise<number> {
  const { data, error } = await supabase.from("orders").select("due_amount").gt("due_amount", 0)
  if (error) throw error
  return (data ?? []).reduce((sum, o) => sum + Number(o.due_amount), 0)
}

export async function fetchCustomerDueOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .gt("due_amount", 0)
    .order("due_amount", { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function fetchPurchaseHistoryReport(filters: {
  fromDate?: string
  toDate?: string
}): Promise<Purchase[]> {
  let query = supabase
    .from("purchases")
    .select(PURCHASE_SELECT)
    .order("purchase_date", { ascending: false })
  if (filters.fromDate) query = query.gte("purchase_date", filters.fromDate)
  if (filters.toDate) query = query.lte("purchase_date", filters.toDate)
  const { data, error } = await query
  if (error) throw error
  return (data as unknown as Purchase[]) ?? []
}

// ---------- Staff Management & Activity Log ----------
export async function updateProfileRole(userId: string, role: ProfileRole): Promise<void> {
  const { error } = await supabase.from("profiles").update({ role }).eq("id", userId)
  if (error) throw error
}

export async function logActivity(input: {
  action: "insert" | "update" | "delete"
  table_name: string
  record_id?: string
  old_data?: Record<string, unknown>
  new_data?: Record<string, unknown>
}): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  // Best-effort — never block the user's actual action on logging failing.
  await supabase.from("activity_logs").insert({
    user_id: user?.id ?? null,
    action: input.action,
    table_name: input.table_name,
    record_id: input.record_id ?? null,
    old_data: input.old_data ?? null,
    new_data: input.new_data ?? null,
  })
}

export async function fetchActivityLogs(limit = 50) {
  const { data, error } = await supabase
    .from("activity_logs")
    .select("*, user:profiles(id,full_name)")
    .order("created_at", { ascending: false })
    .limit(limit)
  if (error) throw error
  return data ?? []
}
