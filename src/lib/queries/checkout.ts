import { supabase } from "@/lib/supabase"
import type { Coupon, Order, OrderInsert, OrderItemInsert, Settings } from "@/types/database"

export async function fetchSettings(): Promise<Settings> {
  const { data, error } = await supabase.from("settings").select("*").eq("id", 1).single()
  if (error) throw error
  return data
}

export async function fetchCouponByCode(code: string): Promise<Coupon | null> {
  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .ilike("code", code)
    .eq("active", true)
    .maybeSingle()
  if (error) throw error
  return data
}

export function generateOrderNumber(): string {
  const stamp = Date.now().toString(36).toUpperCase()
  const rand = Math.random().toString(36).slice(2, 5).toUpperCase()
  return `RSP-${stamp}-${rand}`
}

export function generateRefId(): string {
  const num = Math.floor(10000 + Math.random() * 90000)
  return `RSP-Q-${num}`
}

export async function createOrder(
  order: OrderInsert,
  items: OrderItemInsert[],
): Promise<Order> {
  // Guest orders have no user_id, so the `orders_owner_select` RLS policy can't
  // match them — Postgres applies SELECT policies to INSERT...RETURNING too, so
  // chaining .select().single() here would silently return zero rows even
  // though the insert succeeded. Generate the id client-side and insert
  // "fire and forget" instead; the caller already has everything it needs to
  // render the confirmation without reading the row back.
  const id = crypto.randomUUID()
  const now = new Date().toISOString()
  const { error: orderError } = await supabase
    .from("orders")
    .insert({ ...order, id })
  if (orderError) throw orderError

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(items.map((item) => ({ ...item, order_id: id })))
  if (itemsError) throw itemsError

  return { ...order, id, user_id: order.user_id ?? null, courier_status: null, created_at: now, updated_at: now }
}

export async function fetchOrder(orderId: string): Promise<Order | null> {
  const { data, error } = await supabase.from("orders").select("*").eq("id", orderId).maybeSingle()
  if (error) throw error
  return data
}

export async function fetchOrderItems(orderId: string) {
  const { data, error } = await supabase.from("order_items").select("*").eq("order_id", orderId)
  if (error) throw error
  return data ?? []
}
