import { ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"

import { PackageCard } from "@/components/package/PackageCard"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { usePackageCategories, usePackages } from "@/hooks/use-packages"
import { SectionHeader } from "@/pages/home/SectionHeader"

/** Package category tiles plus the packages an admin ticked "show on homepage". */
export function PackagesSection() {
  const { data: categories = [] } = usePackageCategories()
  const featured = usePackages({ featuredOnly: true, limit: 6 })
  const latest = usePackages({ limit: 6 })

  const packages = featured.data?.length ? featured.data : (latest.data ?? [])
  const isLoading = featured.isLoading || latest.isLoading

  // Nothing published yet — say nothing rather than show an empty shelf.
  if (!isLoading && packages.length === 0 && categories.length === 0) return null

  return (
    <section className="mx-auto max-w-[1280px] px-4 pb-6 pt-10 sm:px-6 sm:pt-12">
      <SectionHeader
        kicker="Sized & priced together"
        kickerColor="#F49E09"
        title="Solar packages"
        linkTo="/packages"
        linkLabel="Browse all packages"
      />

      {categories.length > 0 && (
        <div className="mb-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-8">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/packages?category=${cat.slug}`}
              className="flex flex-col items-center gap-1 rounded-[16px] border border-border bg-surface px-2 py-3 text-center no-underline shadow-[var(--shadow-sm)] transition-[transform,border-color] duration-250 hover:-translate-y-1 hover:border-orange-500/45"
            >
              <span className="font-heading text-[13px] font-bold leading-tight text-text">{cat.name}</span>
              {cat.description && (
                <span className="line-clamp-2 text-[11px] leading-tight text-muted">{cat.description}</span>
              )}
            </Link>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[340px] w-full rounded-[20px]" />
          ))}
        </div>
      ) : packages.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {packages.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
          <div className="mt-7 flex justify-center">
            <Button asChild size="lg" variant="outline">
              <Link to="/packages">
                Browse all packages <ArrowRight className="size-[18px]" />
              </Link>
            </Button>
          </div>
        </>
      ) : null}
    </section>
  )
}
