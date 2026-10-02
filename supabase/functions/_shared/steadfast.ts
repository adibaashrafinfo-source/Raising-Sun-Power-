// Shared helpers for the Steadfast Courier edge functions.
//
// Every call to Steadfast happens here, server-side: the API key and secret
// live in the courier_settings table, are read with the service role, and never
// reach the browser.

import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2"

export const STEADFAST_BASE = "https://portal.packzy.com/api/v1"
export const PROVIDER = "steadfast"

/** Steadfast's own status values, plus our own "pending" before the first sync. */
export const FINAL_STATUSES = ["delivered", "cancelled", "returned"]

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  })
}

/** An error the caller is meant to read and act on. */
export class CourierError extends Error {
  status: number
  constructor(message: string, status = 400) {
    super(message)
    this.status = status
  }
}

/** Service-role client: used for the reads and writes the function owns. */
export function serviceClient(): SupabaseClient {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  )
}

/**
 * Only staff may move orders to a courier. The caller's own JWT decides that —
 * the service role is never handed to whoever called the function.
 */
export async function requireStaff(req: Request, admin: SupabaseClient): Promise<string> {
  const authHeader = req.headers.get("Authorization") ?? ""
  const token = authHeader.replace(/^Bearer\s+/i, "")
  if (!token) throw new CourierError("Sign in to use the courier integration.", 401)

  const { data, error } = await admin.auth.getUser(token)
  if (error || !data.user) throw new CourierError("Your session has expired — sign in again.", 401)

  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle()

  const role = profile?.role ?? ""
  if (!["admin", "manager", "staff", "delivery"].includes(role)) {
    throw new CourierError("Your account is not allowed to send orders to a courier.", 403)
  }
  return data.user.id
}

export type CourierCredentials = { apiKey: string; secretKey: string }

export async function loadCredentials(admin: SupabaseClient): Promise<CourierCredentials> {
  const { data, error } = await admin
    .from("courier_settings")
    .select("api_key, secret_key, is_active")
    .eq("provider", PROVIDER)
    .maybeSingle()

  if (error) throw new CourierError("Couldn't read the courier settings.", 500)
  if (!data?.api_key || !data?.secret_key) {
    throw new CourierError(
      "Steadfast API keys are not set up yet. Add them in Admin → Settings → Courier Integration.",
      412,
    )
  }
  if (!data.is_active) {
    throw new CourierError("The Steadfast integration is switched off in Settings.", 412)
  }
  return { apiKey: data.api_key, secretKey: data.secret_key }
}

/** One call to Steadfast, with a timeout and readable errors. */
export async function steadfastFetch(
  path: string,
  creds: CourierCredentials,
  init: RequestInit = {},
  timeoutMs = 20000,
): Promise<{ status: number; body: Record<string, unknown> }> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(`${STEADFAST_BASE}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        "Api-Key": creds.apiKey,
        "Secret-Key": creds.secretKey,
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(init.headers ?? {}),
      },
    })

    const text = await res.text()
    let body: Record<string, unknown> = {}
    try {
      body = text ? JSON.parse(text) : {}
    } catch {
      // Steadfast occasionally answers with an HTML error page.
      body = { message: text.slice(0, 300) }
    }

    // Logged (never the keys) so a rejection can be diagnosed from the
    // function logs rather than guessed at from a generic message.
    if (res.status >= 400) {
      console.error(`Steadfast ${path} -> HTTP ${res.status}: ${text.slice(0, 500)}`)
    }

    if (res.status === 401 || res.status === 403) {
      // Steadfast's own wording matters here: the same key pair can pass
      // /get_balance and still be refused for order creation, which reads very
      // differently from "the keys are wrong".
      const detail = String(body.message ?? body.error ?? "").trim()
      throw new CourierError(
        detail
          ? `Steadfast refused this request (HTTP ${res.status}): ${detail}`
          : `Steadfast refused this request (HTTP ${res.status}). The same keys pass the balance check, so the account may not have order-creation access enabled yet — check with Steadfast support.`,
        401,
      )
    }
    if (res.status >= 500) {
      throw new CourierError("Steadfast is not responding right now. Try again in a moment.", 503)
    }
    return { status: res.status, body }
  } catch (err) {
    if (err instanceof CourierError) throw err
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new CourierError("Steadfast timed out. The order was not sent — try again.", 504)
    }
    throw new CourierError(`Couldn't reach Steadfast: ${(err as Error).message}`, 502)
  } finally {
    clearTimeout(timer)
  }
}

/** Steadfast wants a plain 11-digit Bangladeshi mobile number. */
export function normalisePhone(raw: string | null | undefined): string {
  const digits = (raw ?? "").replace(/\D/g, "")
  const local = digits.startsWith("880") ? digits.slice(3) : digits.replace(/^0?(?=1)/, "0")
  const withZero = local.startsWith("0") ? local : `0${local}`
  if (!/^01[3-9]\d{8}$/.test(withZero)) {
    throw new CourierError(
      `"${raw ?? ""}" is not a valid Bangladeshi mobile number. Fix the phone number and try again.`,
      422,
    )
  }
  return withZero
}

/** Whatever Steadfast reports, lower-cased and trimmed to our own vocabulary. */
export function normaliseStatus(value: unknown): string {
  const raw = String(value ?? "").toLowerCase().trim().replace(/\s+/g, "_")
  return raw || "pending"
}
