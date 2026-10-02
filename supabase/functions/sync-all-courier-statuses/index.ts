// Refreshes every open consignment in one pass.
//
// Orders already delivered, cancelled or returned are left alone — their status
// will not change again. Meant to be called from the Courier Tracking page's
// "Refresh all" button, and from a pg_cron job on a schedule.

import {
  CourierError,
  FINAL_STATUSES,
  PROVIDER,
  corsHeaders,
  json,
  loadCredentials,
  normaliseStatus,
  requireStaff,
  serviceClient,
  steadfastFetch,
} from "../_shared/steadfast.ts"

/** Steadfast is rate limited, so the batch is paced rather than fired at once. */
const BATCH_SIZE = 5
const BATCH_PAUSE_MS = 400

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })

  const admin = serviceClient()
  try {
    // A cron job calls this with the service-role key and no user; a person
    // calls it from the admin panel with their own token.
    const authHeader = req.headers.get("Authorization") ?? ""
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    const isServiceRole = serviceKey.length > 0 && authHeader.includes(serviceKey)
    if (!isServiceRole) await requireStaff(req, admin)

    const { data: orders, error } = await admin
      .from("orders")
      .select("id, consignment_id, courier_status")
      .eq("courier_provider", PROVIDER)
      .not("consignment_id", "is", null)
      .order("sent_to_courier_at", { ascending: false })
      .limit(200)

    if (error) throw new CourierError("Couldn't list the orders to refresh.", 500)

    const open = (orders ?? []).filter(
      (order) => !FINAL_STATUSES.includes(String(order.courier_status ?? "").toLowerCase()),
    )
    if (open.length === 0) return json({ checked: 0, updated: 0, failed: 0 })

    const creds = await loadCredentials(admin)
    let updated = 0
    let failed = 0
    const now = new Date().toISOString()

    for (let i = 0; i < open.length; i += BATCH_SIZE) {
      const batch = open.slice(i, i + BATCH_SIZE)
      await Promise.all(
        batch.map(async (order) => {
          try {
            const { status, body } = await steadfastFetch(
              `/status_by_cid/${order.consignment_id}`,
              creds,
              {},
              15000,
            )
            if (status >= 400) {
              failed++
              return
            }
            const courierStatus = normaliseStatus(body.delivery_status ?? body.status)
            if (courierStatus === String(order.courier_status ?? "")) return
            await admin
              .from("orders")
              .update({ courier_status: courierStatus, courier_status_updated_at: now })
              .eq("id", order.id)
            updated++
          } catch {
            // One bad consignment must not abandon the rest of the batch.
            failed++
          }
        }),
      )
      if (i + BATCH_SIZE < open.length) await new Promise((r) => setTimeout(r, BATCH_PAUSE_MS))
    }

    return json({ checked: open.length, updated, failed })
  } catch (err) {
    const error = err as CourierError
    return json({ error: error.message ?? "Something went wrong." }, error.status ?? 500)
  }
})
