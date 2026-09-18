import { brands } from "@/data/home-content"

export function BrandsStrip() {
  const loop = [...brands, ...brands]

  return (
    <section className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 sm:py-12">
      <div className="mb-5 flex flex-col items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-muted">
          Brands we stock
        </span>
        <span className="h-px w-16 bg-[linear-gradient(90deg,transparent,var(--border),transparent)]" />
      </div>
      <div className="overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
        <div className="flex w-max animate-[rsp-marquee_55s_linear_infinite] gap-3.5 py-1">
          {loop.map((brand, i) => (
            <span
              key={`${brand}-${i}`}
              className="whitespace-nowrap rounded-2xl border border-border bg-surface px-5 py-2.5 font-heading text-[17px] font-extrabold text-muted shadow-[var(--shadow-sm)] transition-[color,border-color,transform] duration-250 hover:-translate-y-0.5 hover:border-blue-500/40 hover:text-blue"
            >
              {brand}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
