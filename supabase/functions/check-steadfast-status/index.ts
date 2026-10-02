// Refreshes one order's courier status from Steadfast.
//
// Input:  { order_id } or { consignment_id }
// Output: { courier_status, courier_status_updated_at }

import {
  CourierError,
  corsHeaders,
  json,
  loadCredentials,
  normaliseStatus,
  requireStaff,
  serviceClient,
  steadfastFetch,
} from "../_shared/steadfast.ts"

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })

  const admin = serviceClient()
  try {
    await requireStaff(req, admin)

    const payload = await req.json().catch(() => ({}))
    const orderId = payload.order_id ? String(payload.order_id) : null
    let consignmentId = payload.consignment_id ? String(payload.consignment_id) : null

    if (orderId && !consignmentId) {
      const { data: order } = await admin
        .from("orders")
        .select("consignment_id")
        .eq("id", orderId)
        .maybeSingle()
      consignmentId = order?.consignment_id ?? null
    }
    if (!consignmentId) throw new CourierError("This order has not been sent to a courier yet.", 404)

    const creds = await loadCredentials(admin)
    const { status, body } = await steadfastFetch(`/status_by_cid/${consignmentId}`, creds)

    if (status >= 400) {
      throw new CourierError(String(body.message ?? "Steadfast could not find this consignment."), 404)
    }

    const courierStatus = normaliseStatus(body.delivery_status ?? body.status)
    const now = new Date().toISOString()

    const query = admin
      .from("orders")
      .update({ courier_status: courierStatus, courier_status_updated_at: now })
    const { error } = orderId
      ? await query.eq("id", orderId)
      : await query.eq("consignment_id", consignmentId)

    if (error) throw new CourierError(`Couldn't save the new status: ${error.message}`, 500)

    return json({ courier_status: courierStatus, courier_status_updated_at: now })
  } catch (err) {
    const error = err as CourierError
    return json({ error: error.message ?? "Something went wrong." }, error.status ?? 500)
  }
})
