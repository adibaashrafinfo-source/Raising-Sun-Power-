import { brands } from "@/data/home-content"

export function BrandsStrip() {
  const loop = [...brands, ...brands]

  return (
    <section className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 sm:py-12">
      <div className="mb-5 text-center">
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-muted">
          Brands we stock
        </span>
      </div>
      <div className="overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
        <div className="flex w-max animate-[rsp-marquee_26s_linear_infinite] gap-11">
          {loop.map((brand, i) => (
            <span
              key={`${brand}-${i}`}
              className="whitespace-nowrap font-heading text-xl font-extrabold text-muted opacity-55 transition-[opacity,color] duration-250 hover:text-blue hover:opacity-100"
            >
              {brand}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
