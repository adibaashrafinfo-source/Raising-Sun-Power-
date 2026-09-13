import { AlertTriangle, Boxes, TrendingDown, TrendingUp, Truck, Users } from "lucide-react"
import { Link } from "react-router-dom"

import { Skeleton } from "@/components/ui/skeleton"
import {
  useCustomerDueTotal,
  useLedgerSummary,
  useLowStockAlert,
  useStockValuation,
  useSupplierDuesView,
} from "@/hooks/use-admin"
import { formatBDT } from "@/lib/utils"

export default function AdminFinanceDashboardPage() {
  const { data: stockRows, isLoading: loadingStock } = useStockValuation()
  const { data: supplierDues, isLoading: loadingSupplier } = useSupplierDuesView()
  const { data: customerDueTotal, isLoading: loadingCustomer } = useCustomerDueTotal()
  const { data: ledger, isLoading: loadingLedger } = useLedgerSummary()
  const { data: lowStock = [], isLoading: loadingLowStock } = useLowStockAlert()

  const isLoading = loadingStock || loadingSupplier || loadingCustomer || loadingLedger

  const totalStockValue = (stockRows ?? []).reduce((sum, r) => sum + Number(r.stock_value), 0)
  const totalSupplierDue = (supplierDues ?? []).reduce((sum, s) => sum + Number(s.current_due), 0)
  const thisMonth = ledger?.[0]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-extrabold text-text">Finance Dashboard</h1>
        <p className="mt-0.5 text-sm text-muted">Stock value, dues, and this month's cash flow.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard icon={Boxes} label="Total Stock Value" value={formatBDT(totalStockValue)} color="#217CCA" />
          <KpiCard icon={Truck} label="Total Supplier Due" value={formatBDT(totalSupplierDue)} color="#F49E09" />
          <KpiCard icon={Users} label="Total Customer Due" value={formatBDT(customerDueTotal ?? 0)} color="#E23B3B" />
          <KpiCard
            icon={thisMonth && thisMonth.net_cash_flow >= 0 ? TrendingUp : TrendingDown}
            label="This Month Net Cash Flow"
            value={formatBDT(thisMonth?.net_cash_flow ?? 0)}
            color={thisMonth && thisMonth.net_cash_flow >= 0 ? "#67A70E" : "#E23B3B"}
          />
        </div>
      )}

      {thisMonth && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-surface p-4">
            <div className="text-xs text-muted">This month's income</div>
            <div className="font-heading text-xl font-extrabold tabular-nums text-green-600">
              {formatBDT(thisMonth.total_income)}
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-4">
            <div className="text-xs text-muted">This month's expense</div>
            <div className="font-heading text-xl font-extrabold tabular-nums text-red-500">
              {formatBDT(thisMonth.total_expense)}
            </div>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-surface p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-heading text-base font-extrabold text-text">
            <AlertTriangle className="size-[18px] text-red-500" />
            Low Stock Alert
          </div>
          <Link to="/admin/inventory/reports" className="text-sm font-semibold text-blue no-underline">
            View reports →
          </Link>
        </div>
        {loadingLowStock ? (
          <Skeleton className="h-24 w-full" />
        ) : lowStock.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted">No low-stock items right now.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {lowStock.slice(0, 8).map((row) => (
              <div
                key={`${row.product_id}-${row.location_id}`}
                className="flex items-center justify-between rounded-xl border border-border p-3 text-sm"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold text-text">{row.name}</div>
                  <div className="text-xs text-muted">{row.location_name}</div>
                </div>
                <span className="font-bold tabular-nums text-red-500">
                  {row.quantity} / {row.min_stock_level}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function KpiCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
  label: string
  value: string
  color: string
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <span
        className="mb-3 flex size-10 items-center justify-center rounded-xl"
        style={{ background: `${color}20` }}
      >
        <Icon className="size-5" style={{ color }} />
      </span>
      <div className="font-heading text-xl font-extrabold tabular-nums text-text">{value}</div>
      <div className="mt-0.5 text-xs text-muted">{label}</div>
    </div>
  )
}
