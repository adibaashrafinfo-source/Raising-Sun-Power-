import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase env vars are missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local.",
  )
}

const FETCH_TIMEOUT_MS = 10_000
// Uploads (datasheets are up to 60MB) legitimately take longer than an API
// call, so a 10-second cap aborted them with "signal is aborted without reason".
const UPLOAD_TIMEOUT_MS = 15 * 60_000

function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit) {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url
  const isUpload = url.includes("/storage/v1/object/") && init?.method !== "GET"
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), isUpload ? UPLOAD_TIMEOUT_MS : FETCH_TIMEOUT_MS)
  // Honour a cancel from the caller too, not just our own timer.
  init?.signal?.addEventListener("abort", () => controller.abort(), { once: true })
  return fetch(input, { ...init, signal: controller.signal }).finally(() => clearTimeout(timeout))
}

export const supabase = createClient(supabaseUrl ?? "", supabaseAnonKey ?? "", {
  global: { fetch: fetchWithTimeout },
})
