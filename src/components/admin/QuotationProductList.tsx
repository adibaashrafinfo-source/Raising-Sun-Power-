import { useMemo, useState } from "react"
import { Plus, Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import { useAllProductsAdmin } from "@/hooks/use-admin"
import { currentPrice } from "@/lib/quotation"
import { formatBDT } from "@/lib/utils"
import type { Product } from "@/types/database"

/** Every uploaded product, searchable; clicking one hands it to the quotation or invoice. */
export function QuotationProductList({ onPick }: { onPick: (product: Product) => void }) {
  const { data: products = [], isLoading } = useAllProductsAdmin()
  const [query, setQuery] = useState("")

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase()
    return products
      .filter((p) => p.status !== "archived")
      .filter((p) => !q || p.name.toLowerCase().includes(q) || (p.category?.name ?? "").toLowerCase().includes(q))
  }, [products, query])

  return (
    <div>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products…" className="pl-9" />
      </div>
      <div className="mt-2.5 max-h-[260px] overflow-y-auto rounded-[var(--radius-sm)] border border-border">
        {isLoading ? (
          <p className="p-4 text-center text-[13px] text-muted">Loading products…</p>
        ) : matches.length === 0 ? (
          <p className="p-4 text-center text-[13px] text-muted">No products match that search.</p>
        ) : (
          matches.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => onPick(product)}
              className="flex w-full items-center gap-2.5 border-b border-border px-3 py-2.5 text-left last:border-0 hover:bg-surface-2"
            >
              <Plus className="size-4 shrink-0 text-blue" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13.5px] font-medium text-text">{product.name}</span>
                <span className="text-[11.5px] text-muted">
                  {product.category?.name}
                  {product.status === "draft" && <span className="ml-2 text-orange-500">draft</span>}
                </span>
              </span>
              <span className="shrink-0 text-[13px] font-semibold tabular-nums text-text">
                {formatBDT(currentPrice(product))}
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
