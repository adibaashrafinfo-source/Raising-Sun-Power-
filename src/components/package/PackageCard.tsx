import { ArrowRight, Check, Package as PackageIcon } from "lucide-react"
import { Link } from "react-router-dom"

import { formatBDT } from "@/lib/utils"
import type { SolarPackage } from "@/types/database"

/** One package tile: capacity, what's inside, price, and a way in. */
export function PackageCard({ pkg }: { pkg: SolarPackage }) {
  const image = pkg.images[0]
  const isOnSale = pkg.sale_price != null && pkg.sale_price < pkg.price
  const price = isOnSale ? pkg.sale_price! : pkg.price
  const highlights = Object.entries(pkg.specifications ?? {}).slice(0, 4)

  return (
    <Link
      to={`/package/${pkg.slug}`}
      className="group flex flex-col overflow-hidden rounded-[20px] border border-border bg-surface no-underline shadow-[var(--shadow-sm)] transition-[transform,box-shadow,border-color] duration-250 hover:-translate-y-1 hover:border-blue-500/40 hover:shadow-[var(--shadow)]"
    >
      <div className="flex items-start justify-between gap-3 border-b border-border p-4">
        <div className="min-w-0">
          {pkg.capacity_kw != null && (
            <div className="font-heading text-[30px] font-extrabold leading-none tabular-nums text-orange-500">
              {pkg.capacity_kw}
              <span className="ml-1 text-sm font-bold text-muted">kW</span>
            </div>
          )}
          <div className="mt-1.5 line-clamp-2 font-heading text-[15px] font-bold leading-snug text-text">
            {pkg.name}
          </div>
        </div>
        {pkg.category && (
          <span className="shrink-0 rounded-full bg-blue/12 px-2.5 py-1 text-[11px] font-extrabold text-blue">
            {pkg.category.name}
          </span>
        )}
      </div>

      {image && (
        <div className="relative aspect-[16/9] overflow-hidden">
          <img
            src={image}
            alt={pkg.name}
            loading="lazy"
            className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}

      <div className="flex flex-1 flex-col p-4">
        {pkg.short_description && (
          <p className="mb-3 line-clamp-2 text-[13px] leading-relaxed text-muted">
            {pkg.short_description}
          </p>
        )}

        {highlights.length > 0 && (
          <ul className="mb-4 flex flex-col gap-1.5">
            {highlights.map(([key, value]) => (
              <li key={key} className="flex items-start gap-2 text-[12.5px] text-muted">
                <Check className="mt-0.5 size-3.5 shrink-0 text-green-600" />
                <span className="min-w-0">
                  <span className="font-semibold text-text">{key}:</span> {value}
                </span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-border pt-3.5">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-muted">Package price</div>
            <div className="flex items-baseline gap-2">
              <span className="font-heading text-xl font-extrabold tabular-nums text-text">
                {formatBDT(price)}
              </span>
              {isOnSale && (
                <span className="text-[12.5px] text-muted line-through">{formatBDT(pkg.price)}</span>
              )}
            </div>
          </div>
          <span className="flex items-center gap-1.5 text-[13px] font-bold text-blue">
            Details
            <ArrowRight className="size-[15px] transition-transform duration-200 group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}

/** Shown when a filter matches nothing, so the grid never collapses silently. */
export function PackagesEmpty({ message }: { message: string }) {
  return (
    <div className="rounded-[20px] border border-dashed border-border bg-surface p-10 text-center">
      <span className="mb-3 inline-flex size-12 items-center justify-center rounded-2xl bg-surface-2">
        <PackageIcon className="size-6 text-muted" />
      </span>
      <p className="text-sm text-muted">{message}</p>
    </div>
  )
}
