import { ChevronRight } from "lucide-react"
import { Link, useSearchParams } from "react-router-dom"

import { PackageCard, PackagesEmpty } from "@/components/package/PackageCard"
import { Skeleton } from "@/components/ui/skeleton"
import { SEO_KEYWORDS } from "@/data/company"
import { usePackageCategories, usePackages } from "@/hooks/use-packages"
import { useSeo } from "@/hooks/use-seo"
import { cn } from "@/lib/utils"

export default function PackagesPage() {
  useSeo({
    title: "Solar Packages",
    description:
      "Ready-to-install solar packages for homes, shops and farms in Bangladesh — panel, inverter, battery and accessories priced as one bundle.",
    keywords: SEO_KEYWORDS,
  })

  const [params, setParams] = useSearchParams()
  const active = params.get("category")
  const { data: categories = [] } = usePackageCategories()
  const { data: packages = [], isLoading } = usePackages({ categorySlug: active ?? undefined })

  const setCategory = (slug: string | null) => {
    if (slug) setParams({ category: slug })
    else setParams({})
  }

  return (
    <main className="mx-auto max-w-[1280px] px-4 pb-16 pt-5 sm:px-6 sm:pt-7">
      <div className="mb-4 flex items-center gap-2 text-[13px] text-muted">
        <Link to="/" className="-my-1 py-1 text-muted no-underline hover:text-blue">
          Home
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="font-semibold text-text">Packages</span>
      </div>

      <div className="mb-7 max-w-[680px]">
        <span className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-orange-500">
          <span className="size-1.5 rounded-full bg-orange-500" /> Ready-to-install
        </span>
        <h1 className="mt-2.5 font-heading text-[clamp(26px,4vw,38px)] font-extrabold tracking-tight text-text">
          Solar packages
        </h1>
        <p className="mt-2.5 text-[15px] leading-relaxed text-muted">
          Panel, inverter, battery and accessories sized and priced together. Every package can be
          adjusted — tell us your load and we'll tune it before quoting.
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <FilterChip label="All packages" active={!active} onClick={() => setCategory(null)} />
        {categories.map((cat) => (
          <FilterChip
            key={cat.id}
            label={cat.name}
            active={active === cat.slug}
            onClick={() => setCategory(cat.slug)}
          />
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[360px] w-full rounded-[20px]" />
          ))}
        </div>
      ) : packages.length === 0 ? (
        <PackagesEmpty
          message={
            active
              ? "No packages in this category yet. Try another one, or ask us for a custom build."
              : "Packages are being prepared. Call or WhatsApp us and we'll size one for you today."
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} />
          ))}
        </div>
      )}
    </main>
  )
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-4 py-2 text-[13px] font-bold transition-colors",
        active
          ? "border-orange-500 bg-orange-500 text-white"
          : "border-border bg-surface text-muted hover:border-blue-500/40 hover:text-blue",
      )}
    >
      {label}
    </button>
  )
}
