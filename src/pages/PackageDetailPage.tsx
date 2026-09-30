import { useState } from "react"
import { Check, ChevronRight, FileText, MessageCircle, Package as PackageIcon, Phone } from "lucide-react"
import { Link, useParams } from "react-router-dom"

import { ProductDescription } from "@/components/ProductDescription"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { COMPANY, telLink, whatsappLink } from "@/data/company"
import { useSettings } from "@/hooks/use-checkout"
import { usePackage } from "@/hooks/use-packages"
import { useSeo } from "@/hooks/use-seo"
import { cn, formatBDT } from "@/lib/utils"

export default function PackageDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: pkg, isLoading } = usePackage(slug)
  const { data: settings } = useSettings()
  const [activeImage, setActiveImage] = useState(0)

  useSeo({
    title: pkg?.name ?? "Solar Package",
    description:
      pkg?.short_description ??
      "A complete solar package from Rising Sun Power BD — panel, inverter, battery and accessories priced together.",
  })

  if (isLoading) {
    return (
      <main className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6">
        <Skeleton className="h-[460px] w-full rounded-[24px]" />
      </main>
    )
  }

  if (!pkg) {
    return (
      <main className="mx-auto flex min-h-[50vh] max-w-[760px] flex-col items-center justify-center px-4 text-center">
        <span className="mb-4 inline-flex size-16 items-center justify-center rounded-2xl bg-surface-2">
          <PackageIcon className="size-7 text-muted" />
        </span>
        <h1 className="font-heading text-xl font-extrabold text-text">Package not found</h1>
        <p className="mt-2 text-sm text-muted">It may have been renamed or taken down.</p>
        <Button className="mt-5" asChild>
          <Link to="/packages">See all packages</Link>
        </Button>
      </main>
    )
  }

  const isOnSale = pkg.sale_price != null && pkg.sale_price < pkg.price
  const price = isOnSale ? pkg.sale_price! : pkg.price
  const specs = Object.entries(pkg.specifications ?? {})
  const phone = settings?.support_phone || COMPANY.phone

  return (
    <main className="mx-auto max-w-[1280px] px-4 pb-16 pt-5 sm:px-6 sm:pt-7">
      <div className="mb-4 flex flex-wrap items-center gap-2 text-[13px] text-muted">
        <Link to="/" className="-my-1 py-1 text-muted no-underline hover:text-blue">
          Home
        </Link>
        <ChevronRight className="size-3.5" />
        <Link to="/packages" className="-my-1 py-1 text-muted no-underline hover:text-blue">
          Packages
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="line-clamp-1 font-semibold text-text">{pkg.name}</span>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0">
          {pkg.images.length > 0 ? (
            <>
              <div className="relative aspect-[16/10] overflow-hidden rounded-[22px] border border-border bg-surface">
                <img
                  src={pkg.images[activeImage]}
                  alt={pkg.name}
                  className="absolute inset-0 size-full object-cover"
                />
              </div>
              {pkg.images.length > 1 && (
                <div className="mt-3 flex flex-wrap gap-2.5">
                  {pkg.images.map((img, i) => (
                    <button
                      key={img}
                      onClick={() => setActiveImage(i)}
                      aria-label={`Image ${i + 1}`}
                      className={cn(
                        "relative size-[72px] overflow-hidden rounded-xl border transition-colors",
                        i === activeImage ? "border-orange-500" : "border-border hover:border-blue-500/40",
                      )}
                    >
                      <img src={img} alt="" className="absolute inset-0 size-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="flex aspect-[16/10] items-center justify-center rounded-[22px] border border-dashed border-border bg-surface-2">
              <PackageIcon className="size-12 text-muted" />
            </div>
          )}

          {pkg.items && pkg.items.length > 0 && (
            <section className="mt-8">
              <h2 className="mb-4 font-heading text-xl font-extrabold text-text">What's in this package</h2>
              <div className="overflow-hidden rounded-2xl border border-border">
                {pkg.items.map((item, i) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between gap-4 px-4 py-3.5"
                    style={{ background: i % 2 === 0 ? "var(--surface)" : "var(--surface-2)" }}
                  >
                    <div className="flex min-w-0 items-start gap-2.5">
                      <Check className="mt-0.5 size-4 shrink-0 text-green-600" />
                      <div className="min-w-0">
                        <div className="text-[14px] font-semibold text-text">{item.name}</div>
                        {item.detail && (
                          <div className="mt-0.5 text-[12.5px] text-muted">{item.detail}</div>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0 whitespace-nowrap text-[13px] font-bold tabular-nums text-text">
                      {item.qty} {item.unit}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {specs.length > 0 && (
            <section className="mt-8">
              <h2 className="mb-4 font-heading text-xl font-extrabold text-text">Specifications</h2>
              <div className="max-w-[640px] overflow-hidden rounded-2xl border border-border">
                {specs.map(([k, v], i) => (
                  <div
                    key={k}
                    className="flex justify-between gap-4 px-4 py-3.5"
                    style={{ background: i % 2 === 0 ? "var(--surface)" : "var(--surface-2)" }}
                  >
                    <span className="text-[13.5px] text-muted">{k}</span>
                    <span className="text-right text-[13.5px] font-semibold text-text">{v}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {pkg.description && (
            <section className="mt-8 max-w-[820px]">
              <h2 className="mb-4 font-heading text-xl font-extrabold text-text">Details</h2>
              <ProductDescription text={pkg.description} fallback={null} />
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[22px] border border-border bg-surface p-5 shadow-[var(--shadow-sm)]">
            {pkg.category && (
              <span className="inline-block rounded-full bg-blue/12 px-2.5 py-1 text-[11px] font-extrabold text-blue">
                {pkg.category.name}
              </span>
            )}
            <h1 className="mt-2.5 font-heading text-[22px] font-extrabold leading-tight text-text">
              {pkg.name}
            </h1>
            {pkg.capacity_kw != null && (
              <div className="mt-1.5 text-[13px] font-semibold text-muted">
                System size <b className="text-text">{pkg.capacity_kw} kW</b>
              </div>
            )}
            {pkg.short_description && (
              <p className="mt-3 text-[13.5px] leading-relaxed text-muted">{pkg.short_description}</p>
            )}

            <div className="mt-4 flex items-baseline gap-2.5 border-t border-border pt-4">
              <span className="font-heading text-[28px] font-extrabold tabular-nums text-orange-500">
                {formatBDT(price)}
              </span>
              {isOnSale && (
                <span className="text-sm text-muted line-through">{formatBDT(pkg.price)}</span>
              )}
            </div>
            <p className="mt-1 text-[12px] text-muted">
              Installation and delivery are quoted separately for your address.
            </p>

            <Button asChild size="lg" className="mt-4 w-full">
              <Link to="/get-quotation" state={{ product: pkg.name }}>
                <FileText className="size-[17px]" /> Request quotation
              </Link>
            </Button>
            <div className="mt-2.5 flex gap-2.5">
              <Button asChild variant="outline" size="lg" className="flex-1">
                <a href={telLink(phone)}>
                  <Phone className="size-[17px]" /> Call
                </a>
              </Button>
              <Button asChild variant="outline" size="lg" className="flex-1">
                <a href={whatsappLink(`Hi, I'm interested in the ${pkg.name} package.`)} target="_blank" rel="noreferrer">
                  <MessageCircle className="size-[17px]" /> WhatsApp
                </a>
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </main>
  )
}
