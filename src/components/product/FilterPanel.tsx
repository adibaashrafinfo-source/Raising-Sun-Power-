import { Check } from "lucide-react"

import { cn, formatBDT } from "@/lib/utils"
import type { Brand, Category } from "@/types/database"

export type FilterPanelProps = {
  categories: Category[]
  brands: Brand[]
  selectedCategorySlugs: string[]
  selectedBrandSlugs: string[]
  maxPrice: number
  priceCap: number
  inStockOnly: boolean
  onToggleCategory: (slug: string) => void
  onToggleBrand: (slug: string) => void
  onPriceChange: (value: number) => void
  onToggleInStock: () => void
  onClear: () => void
}

export function FilterPanel({
  categories,
  brands,
  selectedCategorySlugs,
  selectedBrandSlugs,
  maxPrice,
  priceCap,
  inStockOnly,
  onToggleCategory,
  onToggleBrand,
  onPriceChange,
  onToggleInStock,
  onClear,
}: FilterPanelProps) {
  return (
    <div className="rounded-[18px] border border-border bg-surface p-[18px] shadow-[var(--shadow-sm)]">
      <div className="mb-3.5 flex items-center justify-between">
        <span className="font-heading text-[15px] font-extrabold text-text">Filters</span>
        <button onClick={onClear} className="text-[12.5px] font-semibold text-blue">
          Clear all
        </button>
      </div>

      <FilterGroup title="Category">
        {categories.map((cat) => (
          <CheckRow
            key={cat.id}
            label={cat.name}
            active={selectedCategorySlugs.includes(cat.slug)}
            onClick={() => onToggleCategory(cat.slug)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Brand">
        {brands.map((brand) => (
          <CheckRow
            key={brand.id}
            label={brand.name}
            active={selectedBrandSlugs.includes(brand.slug)}
            onClick={() => onToggleBrand(brand.slug)}
          />
        ))}
      </FilterGroup>

      <div className="mb-1.5 text-xs font-bold uppercase tracking-[0.1em] text-muted">Max price</div>
      <input
        type="range"
        min={500}
        max={priceCap}
        step={500}
        value={maxPrice}
        onChange={(e) => onPriceChange(Number(e.target.value))}
        className="w-full accent-orange-500"
      />
      <div className="mt-1 flex justify-between text-[12.5px] text-muted">
        <span>৳500</span>
        <span className="font-bold tabular-nums text-text">
          {maxPrice >= priceCap ? `${formatBDT(priceCap)}+` : formatBDT(maxPrice)}
        </span>
      </div>

      <div className="mt-4 border-t border-border pt-4">
        <button
          onClick={onToggleInStock}
          className="flex w-full items-center gap-3 text-left"
        >
          <span
            className={cn(
              "relative h-[23px] w-10 shrink-0 rounded-full transition-colors",
              inStockOnly ? "bg-gradient-to-r from-green-400 to-green-500" : "bg-surface-3",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 size-[19px] rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,.3)] transition-all",
                inStockOnly ? "left-[19px]" : "left-0.5",
              )}
            />
          </span>
          <span className="flex-1 text-[13.5px] font-medium text-text">In stock only</span>
        </button>
      </div>
    </div>
  )
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-[18px]">
      <div className="mb-2.5 text-xs font-bold uppercase tracking-[0.1em] text-muted">{title}</div>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  )
}

function CheckRow({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2.5 rounded-[9px] px-1.5 py-2 text-left transition-colors hover:bg-surface-2"
    >
      <span
        className={cn(
          "flex size-[19px] shrink-0 items-center justify-center rounded-[6px] border-[1.5px] transition-all",
          active ? "border-orange-500 bg-gradient-to-br from-orange-500 to-orange-400" : "border-border bg-transparent",
        )}
      >
        {active && <Check className="size-3 text-white" strokeWidth={3} />}
      </span>
      <span className="flex-1 text-[13.5px] font-medium text-text">{label}</span>
    </button>
  )
}
