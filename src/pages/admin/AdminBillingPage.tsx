import { useEffect, useState } from "react"

import { useAuth } from "@/lib/auth-provider"
import { supabase } from "@/lib/supabase"

type BillingView = "dashboard" | "invoices" | "quotes" | "finance" | "customers" | "catalog" | "settings"

declare global {
  interface Window {
    __rspBilling?: {
      supabase: typeof supabase
      user: { u: string; name: string; role: "admin" | "staff" }
    }
  }
}

/**
 * The billing workspace — invoices, quotations, finance, customers, catalog and
 * settings — served from /billing/index.html and kept in the billing_docs table.
 * It is same-origin, so it reads the signed-in admin's Supabase session through
 * window.__rspBilling instead of asking for a second login.
 */
export default function AdminBillingPage({ view }: { view: BillingView }) {
  const { profile, user } = useAuth()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!profile) return
    window.__rspBilling = {
      supabase,
      user: {
        u: user?.email ?? profile.id,
        name: profile.full_name || user?.email || "Admin",
        // Finance, settings and deletes are Admin-only inside Billing; the database enforces the same.
        role: profile.role === "admin" ? "admin" : "staff",
      },
    }
    setReady(true)
    return () => {
      delete window.__rspBilling
    }
  }, [profile, user])

  if (!ready) return <p className="p-8 text-center text-sm text-muted">Loading…</p>

  return (
    <iframe
      key={view}
      title="Billing"
      src={`/billing/index.html?view=${view}`}
      className="block h-[calc(100dvh-5.5rem)] min-h-[560px] w-full rounded-2xl border border-border bg-white"
    />
  )
}
