import { supabase } from "@/lib/supabase"
import type { CourierSettings, Order } from "@/types/database"

/** Every courier call goes through an edge function, so the keys stay server-side. */
async function invokeCourier<T>(fn: string, body: Record<string, unknown> = {}): Promise<T> {
  const { data, error } = await supabase.functions.invoke<T & { error?: string }>(fn, { body })

  // A non-2xx reply arrives as a FunctionsHttpError whose body carries our own
  // message; without digging it out the admin only ever sees "non-2xx status".
  if (error) {
    const context = (error as { context?: Response }).context
    if (context && typeof context.json === "function") {
      try {
        const payload = await context.json()
        if (payload?.error) throw new Error(String(payload.error))
      } catch (parseError) {
        if (parseError instanceof Error && parseError.message) throw parseError
      }
    }
    throw new Error(error.message || "The courier service did not respond.")
  }
  if (data && typeof data === "object" && "error" in data && data.error) {
    throw new Error(String(data.error))
  }
  return data as T
}

export async function fetchCourierSettings(): Promise<CourierSettings[]> {
  const { data, error } = await supabase
    .from("courier_settings")
    // The key columns are not granted to this role — asking for them would fail.
    .select("id, provider, is_active, has_credentials, created_at, updated_at")
    .order("provider")
  if (error) throw error
  return (data as CourierSettings[]) ?? []
}

export async function saveCourierCredentials(params: {
  provider: string
  apiKey: string
  secretKey: string
  isActive: boolean
}) {
  const patch: Record<string, unknown> = { is_active: params.isActive }
  // Blank means "leave what is stored alone" — the admin never sees the saved
  // value, so an empty box must not wipe it.
  if (params.apiKey.trim()) patch.api_key = params.apiKey.trim()
  if (params.secretKey.trim()) patch.secret_key = params.secretKey.trim()

  const { error } = await supabase
    .from("courier_settings")
    .update(patch)
    .eq("provider", params.provider)
  if (error) throw error
}

export function testCourierConnection(params?: { apiKey?: string; secretKey?: string }) {
  return invokeCourier<{ balance: number; currency: string }>("test-courier-connection", {
    api_key: params?.apiKey ?? "",
    secret_key: params?.secretKey ?? "",
  })
}

export type SendToCourierInput = {
  orderId: string
  recipientName?: string
  recipientPhone?: string
  recipientAddress?: string
  codAmount?: number
}

export function sendOrderToCourier(input: SendToCourierInput) {
  return invokeCourier<{
    consignment_id: string
    tracking_code: string | null
    courier_status: string
    sent_to_courier_at: string
  }>("create-steadfast-order", {
    order_id: input.orderId,
    recipient_name: input.recipientName,
    recipient_phone: input.recipientPhone,
    recipient_address: input.recipientAddress,
    cod_amount: input.codAmount,
  })
}

export function refreshCourierStatus(orderId: string) {
  return invokeCourier<{ courier_status: string; courier_status_updated_at: string }>(
    "check-steadfast-status",
    { order_id: orderId },
  )
}

export function syncAllCourierStatuses() {
  return invokeCourier<{ checked: number; updated: number; failed: number }>(
    "sync-all-courier-statuses",
  )
}

/** Every order that has been handed to a courier, newest first. */
export async function fetchCourierOrders(status?: string): Promise<Order[]> {
  let query = supabase
    .from("orders")
    .select("*")
    .not("courier_provider", "is", null)
    .order("sent_to_courier_at", { ascending: false })
  if (status) query = query.eq("courier_status", status)

  const { data, error } = await query
  if (error) throw error
  return (data as Order[]) ?? []
}
