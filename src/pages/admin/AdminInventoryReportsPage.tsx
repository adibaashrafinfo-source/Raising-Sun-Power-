import { useMemo, useState } from "react"
import { Download } from "lucide-react"
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  useCustomerDueOrders,
  useLedgerSummary,
  useMonthlyExpenseSummary,
  useProfitLossMonthly,
  usePurchaseHistoryReport,
  useStockValuation,
  useSupplierDuesView,
} from "@/hooks/use-admin"
import { formatBDT } from "@/lib/utils"

function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export default function AdminInventoryReportsPage() {
  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-heading text-2xl font-extrabold text-text">Reports</h1>
      <Tabs defaultValue="stock">
        <TabsList>
          <TabsTrigger value="stock">Stock Valuation</TabsTrigger>
          <TabsTrigger value="expenses">Expense Breakdown</TabsTrigger>
          <TabsTrigger value="supplier-dues">Supplier Dues</TabsTrigger>
          <TabsTrigger value="customer-dues">Customer Dues</TabsTrigger>
          <TabsTrigger value="purchases">Purchase History</TabsTrigger>
          <TabsTrigger value="profit-loss">Profit & Loss</TabsTrigger>
        </TabsList>
        <TabsContent value="stock">
          <StockValuationReport />
        </TabsContent>
        <TabsContent value="expenses">
          <ExpenseBreakdownReport />
        </TabsContent>
        <TabsContent value="supplier-dues">
          <SupplierDuesReport />
        </TabsContent>
        <TabsContent value="customer-dues">
          <CustomerDuesReport />
        </TabsContent>
        <TabsContent value="purchases">
          <PurchaseHistoryReport />
        </TabsContent>
        <TabsContent value="profit-loss">
          <ProfitLossReport />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function StockValuationReport() {
  const { data: rows = [], isLoading } = useStockValuation()
  const total = rows.reduce((sum, r) => sum + Number(r.stock_value), 0)

  const exportCsv = () => {
    downloadCsv("stock-valuation.csv", [
      ["Product", "SKU", "Quantity", "Cost Price", "Stock Value"],
      ...rows.map((r) => [r.name, r.sku ?? "", r.total_quantity, r.cost_price, r.stock_value]),
    ])
  }

  if (isLoading) return <Skeleton className="mt-4 h-40 w-full" />

  return (
    <div className="mt-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted">
          Total stock value: <b className="text-text">{formatBDT(total)}</b>
        </div>
        <Button variant="outline" size="sm" onClick={exportCsv}>
          <Download className="size-3.5" /> Export CSV
        </Button>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
        {rows.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted">No stock data yet.</p>
        ) : (
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-4 py-3 font-semibold">Product</th>
                <th className="px-4 py-3 font-semibold">SKU</th>
                <th className="px-4 py-3 font-semibold">Quantity</th>
                <th className="px-4 py-3 font-semibold">Cost Price</th>
                <th className="px-4 py-3 font-semibold">Stock Value</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.product_id} className="border-b border-border last:border-0 hover:bg-surface-2">
                  <td className="px-4 py-3 font-semibold text-text">{r.name}</td>
                  <td className="px-4 py-3 text-muted">{r.sku ?? "—"}</td>
                  <td className="px-4 py-3 tabular-nums text-text">{r.total_quantity}</td>
                  <td className="px-4 py-3 tabular-nums text-text">{formatBDT(r.cost_price)}</td>
                  <td className="px-4 py-3 font-bold tabular-nums text-orange-500">{formatBDT(r.stock_value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function ExpenseBreakdownReport() {
  const { data: rows = [], isLoading } = useMonthlyExpenseSummary()

  const byCategory = useMemo(() => {
    const map = new Map<string, number>()
    for (const row of rows) {
      map.set(row.category, (map.get(row.category) ?? 0) + Number(row.total_amount))
    }
    return Array.from(map, ([category, total]) => ({ category, total }))
  }, [rows])

  if (isLoading) return <Skeleton className="mt-4 h-64 w-full" />

  return (
    <div className="mt-4 rounded-2xl border border-border bg-surface p-5">
      <div className="mb-4 font-heading text-base font-extrabold text-text">Total expenses by category</div>
      {byCategory.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted">No expenses recorded yet.</p>
      ) : (
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byCategory} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
              <XAxis
                dataKey="category"
                tick={{ fontSize: 11, fill: "var(--muted)" }}
                axisLine={{ stroke: "var(--border)" }}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  fontSize: 12,
                }}
                formatter={(value) => [formatBDT(Number(value)), "Total"]}
              />
              <Bar dataKey="total" fill="#F49E09" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

function SupplierDuesReport() {
  const { data: rows = [], isLoading } = useSupplierDuesView()
  if (isLoading) return <Skeleton className="mt-4 h-40 w-full" />

  return (
    <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-surface">
      {rows.length === 0 ? (
        <p className="p-8 text-center text-sm text-muted">No outstanding supplier dues.</p>
      ) : (
        <table className="w-full min-w-[420px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
              <th className="px-4 py-3 font-semibold">Supplier</th>
              <th className="px-4 py-3 font-semibold">Phone</th>
              <th className="px-4 py-3 font-semibold">Due</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-border last:border-0 hover:bg-surface-2">
                <td className="px-4 py-3 font-semibold text-text">{r.name}</td>
                <td className="px-4 py-3 text-muted">{r.phone ?? "—"}</td>
                <td className="px-4 py-3 font-bold tabular-nums text-red-500">{formatBDT(r.current_due)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

function CustomerDuesReport() {
  const { data: orders = [], isLoading } = useCustomerDueOrders()
  if (isLoading) return <Skeleton className="mt-4 h-40 w-full" />

  return (
    <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-surface">
      {orders.length === 0 ? (
        <p className="p-8 text-center text-sm text-muted">No outstanding customer dues.</p>
      ) : (
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
              <th className="px-4 py-3 font-semibold">Order</th>
              <th className="px-4 py-3 font-semibold">Customer</th>
              <th className="px-4 py-3 font-semibold">Total</th>
              <th className="px-4 py-3 font-semibold">Due</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-border last:border-0 hover:bg-surface-2">
                <td className="px-4 py-3 font-semibold text-text">{o.order_number}</td>
                <td className="px-4 py-3 text-muted">{o.guest_name}</td>
                <td className="px-4 py-3 tabular-nums text-text">{formatBDT(o.total)}</td>
                <td className="px-4 py-3 font-bold tabular-nums text-red-500">{formatBDT(o.due_amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

function PurchaseHistoryReport() {
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const { data: purchases = [], isLoading } = usePurchaseHistoryReport({
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
  })

  const exportCsv = () => {
    downloadCsv("purchase-history.csv", [
      ["Invoice", "Supplier", "Date", "Total", "Due", "Status"],
      ...purchases.map((p) => [
        p.invoice_number,
        p.supplier?.name ?? "",
        p.purchase_date,
        p.total_amount,
        p.due_amount,
        p.payment_status,
      ]),
    ])
  }

  return (
    <div className="mt-4 flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <Input type="date" className="w-40" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          <Input type="date" className="w-40" value={toDate} onChange={(e) => setToDate(e.target.value)} />
        </div>
        <Button variant="outline" size="sm" onClick={exportCsv}>
          <Download className="size-3.5" /> Export CSV
        </Button>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
        {isLoading ? (
          <div className="p-4">
            <Skeleton className="h-32 w-full" />
          </div>
        ) : purchases.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted">No purchases in this range.</p>
        ) : (
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-4 py-3 font-semibold">Invoice</th>
                <th className="px-4 py-3 font-semibold">Supplier</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Total</th>
                <th className="px-4 py-3 font-semibold">Due</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-surface-2">
                  <td className="px-4 py-3 font-semibold text-text">{p.invoice_number}</td>
                  <td className="px-4 py-3 text-text">{p.supplier?.name}</td>
                  <td className="px-4 py-3 text-muted">{p.purchase_date}</td>
                  <td className="px-4 py-3 tabular-nums text-text">{formatBDT(p.total_amount)}</td>
                  <td className="px-4 py-3 tabular-nums text-text">{formatBDT(p.due_amount)}</td>
                  <td className="px-4 py-3 uppercase text-muted">{p.payment_status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function ProfitLossReport() {
  const { data: plRows = [], isLoading: loadingPl } = useProfitLossMonthly()
  const { data: ledgerRows = [], isLoading: loadingLedger } = useLedgerSummary()

  const combined = useMemo(() => {
    const expenseByMonth = new Map(ledgerRows.map((r) => [r.month, r.total_expense]))
    return plRows.map((r) => {
      const revenue = Number(r.revenue)
      const cogs = Number(r.cogs)
      const grossProfit = revenue - cogs
      const expenses = Number(expenseByMonth.get(r.month) ?? 0)
      return { month: r.month, revenue, cogs, grossProfit, expenses, netProfit: grossProfit - expenses }
    })
  }, [plRows, ledgerRows])

  if (loadingPl || loadingLedger) return <Skeleton className="mt-4 h-40 w-full" />

  return (
    <div className="mt-4 flex flex-col gap-3">
      <div className="rounded-xl border border-orange-500/30 bg-orange-500/10 p-3.5 text-xs text-text">
        <b>Verify before trusting this report.</b> "Expenses" here is every ledger_entries row of type
        'expense' — which includes supplier payments alongside rent/salary/utility-style expenses. Since
        COGS already accounts for the cost of goods sold, and supplier payments are just the cash
        settlement of that same cost, this can double-count against suppliers you've paid off. Cross-check
        a few months by hand before relying on the Net Profit figure.
      </div>
      <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
        {combined.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted">No sales data yet.</p>
        ) : (
          <table className="w-full min-w-[680px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                <th className="px-4 py-3 font-semibold">Month</th>
                <th className="px-4 py-3 font-semibold">Revenue</th>
                <th className="px-4 py-3 font-semibold">COGS</th>
                <th className="px-4 py-3 font-semibold">Gross Profit</th>
                <th className="px-4 py-3 font-semibold">Expenses</th>
                <th className="px-4 py-3 font-semibold">Net Profit</th>
              </tr>
            </thead>
            <tbody>
              {combined.map((row) => (
                <tr key={row.month} className="border-b border-border last:border-0 hover:bg-surface-2">
                  <td className="px-4 py-3 font-semibold text-text">
                    {new Date(row.month).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-text">{formatBDT(row.revenue)}</td>
                  <td className="px-4 py-3 tabular-nums text-text">{formatBDT(row.cogs)}</td>
                  <td className="px-4 py-3 tabular-nums text-text">{formatBDT(row.grossProfit)}</td>
                  <td className="px-4 py-3 tabular-nums text-red-500">{formatBDT(row.expenses)}</td>
                  <td
                    className={`px-4 py-3 font-bold tabular-nums ${row.netProfit >= 0 ? "text-green-600" : "text-red-500"}`}
                  >
                    {formatBDT(row.netProfit)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
