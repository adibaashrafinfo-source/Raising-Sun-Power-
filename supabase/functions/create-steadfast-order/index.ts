// Books one order with Steadfast and records the consignment on the order row.
//
// Input:  { order_id, recipient_name?, recipient_phone?, recipient_address?, cod_amount? }
// Output: { consignment_id, tracking_code, courier_status }
//
// The optional fields let the admin correct the recipient in the confirmation
// dialog without editing the order itself.

import {
  CourierError,
  PROVIDER,
  corsHeaders,
  json,
  loadCredentials,
  normalisePhone,
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
    const orderId = String(payload.order_id ?? "")
    if (!orderId) throw new CourierError("No order was given.", 400)

    const { data: order, error } = await admin
      .from("orders")
      .select(
        "id, order_number, guest_name, guest_phone, address_line, landmark, upazila, district, division, total, due_amount, delivery_method, consignment_id, courier_provider",
      )
      .eq("id", orderId)
      .maybeSingle()

    if (error) throw new CourierError("Couldn't read that order.", 500)
    if (!order) throw new CourierError("That order no longer exists.", 404)

    // Never book the same order twice.
    if (order.consignment_id) {
      throw new CourierError(
        `This order is already with ${order.courier_provider ?? "a courier"} (consignment ${order.consignment_id}).`,
        409,
      )
    }
    if (order.delivery_method === "pickup") {
      throw new CourierError("This is a pick-up order — the customer collects it from the office.", 422)
    }

    const recipientName = String(payload.recipient_name ?? order.guest_name ?? "").trim()
    if (!recipientName) throw new CourierError("This order has no customer name.", 422)

    const recipientPhone = normalisePhone(payload.recipient_phone ?? order.guest_phone)

    const addressParts = [order.address_line, order.upazila, order.district, order.division]
      .map((part) => (part ?? "").trim())
      .filter(Boolean)
    const recipientAddress = String(payload.recipient_address ?? addressParts.join(", ")).trim()
    if (recipientAddress.length < 10) {
      throw new CourierError("This order has no usable delivery address.", 422)
    }

    // What is still owed: a prepaid order is delivered without collecting cash.
    const codAmount = Number(payload.cod_amount ?? order.due_amount ?? order.total ?? 0)
    if (!Number.isFinite(codAmount) || codAmount < 0) {
      throw new CourierError("The amount to collect is not a valid number.", 422)
    }

    const { data: items } = await admin
      .from("order_items")
      .select("product_name, qty")
      .eq("order_id", orderId)

    const note = (items ?? [])
      .map((item) => `${item.product_name} x${item.qty}`)
      .join(", ")
      .slice(0, 400)

    const creds = await loadCredentials(admin)
    const { status, body } = await steadfastFetch("/create_order", creds, {
      method: "POST",
      body: JSON.stringify({
        invoice: order.order_number,
        recipient_name: recipientName,
        recipient_phone: recipientPhone,
        recipient_address: recipientAddress,
        cod_amount: codAmount,
        note: note || `Order ${order.order_number}`,
      }),
    })

    const consignment = (body.consignment ?? {}) as Record<string, unknown>
    const consignmentId = consignment.consignment_id ?? body.consignment_id
    const trackingCode = consignment.tracking_code ?? body.tracking_code

    if (status >= 400 || !consignmentId) {
      // Steadfast reports field problems in `errors`; surface them verbatim so
      // the admin can fix the order and retry.
      const errors = body.errors as Record<string, string[]> | undefined
      const detail = errors
        ? Object.entries(errors)
            .map(([field, messages]) => `${field}: ${(messages ?? []).join(" ")}`)
            .join(" · ")
        : String(body.message ?? "Steadfast rejected this order.")
      throw new CourierError(detail, 422)
    }

    const courierStatus = String(consignment.status ?? "pending").toLowerCase()
    const now = new Date().toISOString()

    const { error: updateError } = await admin
      .from("orders")
      .update({
        courier_provider: PROVIDER,
        consignment_id: String(consignmentId),
        courier_tracking_code: trackingCode ? String(trackingCode) : null,
        courier_status: courierStatus,
        courier_status_updated_at: now,
        sent_to_courier_at: now,
      })
      .eq("id", orderId)
      // Only if nobody else booked it in the meantime.
      .is("consignment_id", null)

    if (updateError) {
      throw new CourierError(
        `Steadfast accepted the order (consignment ${consignmentId}) but saving it here failed: ${updateError.message}. Record it by hand.`,
        500,
      )
    }

    return json({
      consignment_id: String(consignmentId),
      tracking_code: trackingCode ? String(trackingCode) : null,
      courier_status: courierStatus,
      sent_to_courier_at: now,
    })
  } catch (err) {
    const error = err as CourierError
    return json({ error: error.message ?? "Something went wrong." }, error.status ?? 500)
  }
})
