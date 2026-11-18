import { useEffect, useState } from "react"

import { useAuth } from "@/lib/auth-provider"
import {
  fetchCustomerDueTotal,
  fetchLedgerSummary,
  fetchStockValuation,
  fetchSupplierDuesView,
} from "@/lib/queries/admin"
import { supabase } from "@/lib/supabase"

type FinanceOverview = {
  stockValue: number
  supplierDue: number
  /** Money owed by website-order customers. */
  ordersDue: number
  /** This calendar month, from the finance ledger. */
  ledgerIncome: number
  ledgerExpense: number
  ledgerNet: number
}

async function loadOverview(): Promise<FinanceOverview> {
  const [stock, suppliers, ordersDue, ledger] = await Promise.all([
    fetchStockValuation(),
    fetchSupplierDuesView(),
    fetchCustomerDueTotal(),
    fetchLedgerSummary(),
  ])
  const now = new Date()
  const key = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  const thisMonth = ledger.find((row) => String(row.month).startsWith(key))
  return {
    stockValue: stock.reduce((sum, r) => sum + Number(r.stock_value), 0),
    supplierDue: suppliers.reduce((sum, r) => sum + Number(r.current_due), 0),
    ordersDue,
    ledgerIncome: Number(thisMonth?.total_income ?? 0),
    ledgerExpense: Number(thisMonth?.total_expense ?? 0),
    ledgerNet: Number(thisMonth?.net_cash_flow ?? 0),
  }
}

type BillingView = "dashboard" | "invoices" | "quotes" | "finance" | "customers" | "catalog" | "settings"

declare global {
  interface Window {
    __rspBilling?: {
      supabase: typeof supabase
      user: { u: string; name: string; role: "admin" | "staff" }
      /** Live figures from the main database, shown on the Finance screen. */
      loadOverview: () => Promise<FinanceOverview>
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
      loadOverview,
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
