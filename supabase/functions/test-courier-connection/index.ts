// Checks a key pair against Steadfast's balance endpoint before it is saved.
//
// Input:  { api_key?, secret_key? } — omitted means "test what is already saved"
// Output: { balance, currency }

import {
  CourierError,
  corsHeaders,
  json,
  loadCredentials,
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
    const apiKey = String(payload.api_key ?? "").trim()
    const secretKey = String(payload.secret_key ?? "").trim()

    // Testing before saving uses the typed keys; testing afterwards uses the
    // stored ones, which the browser never receives.
    const creds = apiKey && secretKey ? { apiKey, secretKey } : await loadCredentials(admin)

    const { status, body } = await steadfastFetch("/get_balance", creds, {}, 15000)
    if (status >= 400) {
      throw new CourierError(String(body.message ?? "Steadfast rejected these keys."), 401)
    }

    return json({
      balance: Number(body.current_balance ?? body.balance ?? 0),
      currency: "BDT",
    })
  } catch (err) {
    const error = err as CourierError
    return json({ error: error.message ?? "Something went wrong." }, error.status ?? 500)
  }
})
