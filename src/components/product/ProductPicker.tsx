import { useMemo, useState } from "react"
import { Check, Search, X } from "lucide-react"

import { Input } from "@/components/ui/input"
import { useProducts } from "@/hooks/use-catalog"

/**
 * Picks several catalogue products by name. Used by the wholesale enquiry form
 * so a buyer can say exactly what they want priced, and the sales team sees
 * that list on the lead instead of guessing from a free-text message.
 *
 * Names rather than ids are stored: the lead has to stay readable years later,
 * even if the product is renamed or removed from the catalogue.
 */
export function ProductPicker({
  value,
  onChange,
}: {
  value: string[]
  onChange: (next: string[]) => void
}) {
  const { data, isLoading } = useProducts({ sort: "newest", pageSize: 200 })
  const [query, setQuery] = useState("")

  const products = useMemo(() => data?.products ?? [], [data])
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = q ? products.filter((p) => p.name.toLowerCase().includes(q)) : products
    return list.slice(0, 50)
  }, [products, query])

  const toggle = (name: string) =>
    onChange(value.includes(name) ? value.filter((n) => n !== name) : [...value, name])

  return (
    <div className="flex flex-col gap-2.5">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((name) => (
            <span
              key={name}
              className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-blue/10 py-1 pl-3 pr-1.5 text-[12.5px] font-semibold text-blue"
            >
              <span className="truncate">{name}</span>
              <button
                type="button"
                aria-label={`Remove ${name}`}
                onClick={() => toggle(name)}
                className="flex size-5 shrink-0 items-center justify-center rounded-full bg-blue/15"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products…"
          className="pl-9"
        />
      </div>

      <div className="max-h-[220px] overflow-y-auto rounded-[var(--radius-sm)] border border-border bg-surface-2">
        {isLoading ? (
          <p className="p-4 text-center text-[13px] text-muted">Loading products…</p>
        ) : matches.length === 0 ? (
          <p className="p-4 text-center text-[13px] text-muted">No products match that search.</p>
        ) : (
          matches.map((product) => {
            const picked = value.includes(product.name)
            return (
              <button
                key={product.id}
                type="button"
                onClick={() => toggle(product.name)}
                className="flex w-full items-center gap-2.5 border-b border-border px-3 py-2.5 text-left last:border-0 hover:bg-surface-3"
              >
                <span
                  className={`flex size-[18px] shrink-0 items-center justify-center rounded-[5px] border ${
                    picked ? "border-blue bg-blue text-white" : "border-border bg-surface"
                  }`}
                >
                  {picked && <Check className="size-3" />}
                </span>
                <span className="min-w-0 flex-1 truncate text-[13.5px] font-medium text-text">
                  {product.name}
                </span>
                {product.category?.name && (
                  <span className="shrink-0 text-[11.5px] text-muted">{product.category.name}</span>
                )}
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
