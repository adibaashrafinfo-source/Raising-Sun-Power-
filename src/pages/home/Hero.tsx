import { ArrowRight, CheckCircle2 } from "lucide-react"
import { Link } from "react-router-dom"

import { ProductArt } from "@/components/product/ProductArt"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="relative mx-auto max-w-[1280px] overflow-hidden px-4 pb-10 pt-8 sm:px-6 sm:pt-16">
      <div
        className="pointer-events-none absolute -top-10 left-[6%] size-[340px] rounded-full opacity-15 blur-[18px]"
        style={{ background: "radial-gradient(circle,#217CCA 0%,transparent 68%)" }}
      />
      <div
        className="pointer-events-none absolute right-[2%] top-[120px] size-[380px] rounded-full opacity-15 blur-[20px]"
        style={{ background: "radial-gradient(circle,#F49E09 0%,transparent 66%)" }}
      />
      <div className="relative grid items-center gap-8 sm:gap-12 lg:grid-cols-2">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-semibold text-muted shadow-[var(--shadow-sm)]">
            <span className="size-[7px] rounded-full bg-green-400 shadow-[0_0_0_4px_rgba(103,167,14,.2)]" />
            Bangladesh's trusted solar &amp; electrical store
          </span>
          <h1 className="mt-5 text-balance font-heading text-[clamp(34px,5.2vw,56px)] font-extrabold leading-[1.08] tracking-tight text-text">
            Powering Bangladesh with{" "}
            <span className="bg-[linear-gradient(120deg,#217CCA,#F49E09_52%,#67A70E)] bg-clip-text text-transparent">
              clean, reliable energy.
            </span>
          </h1>
          <p className="mt-5 max-w-[520px] text-[clamp(15px,2vw,18px)] leading-relaxed text-muted">
            Genuine solar panels, inverters, batteries, MCB &amp; MCCB and complete power
            solutions — delivered nationwide with Cash on Delivery, bKash &amp; Nagad.
          </p>
          <div className="mt-7 flex flex-wrap gap-3.5">
            <Button asChild size="lg">
              <Link to="/products">
                Shop Solar <ArrowRight className="size-[18px]" />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link to="/products">Explore Products</Link>
            </Button>
          </div>
          <div className="mt-9 flex flex-wrap gap-5 sm:gap-7">
            <Stat value="12,000+" label="Orders delivered" />
            <div className="w-px bg-border" />
            <Stat value="500+" label="Products in stock" />
            <div className="w-px bg-border" />
            <Stat value="5★" label="Rated service" color="#67A70E" />
          </div>
        </div>

        <div className="relative">
          <div className="relative overflow-hidden rounded-3xl bg-[linear-gradient(160deg,#217CCA,#052C6E)] p-7 pb-10 shadow-[0_24px_60px_rgba(5,44,110,.4)]">
            <span className="relative inline-flex items-center gap-1.5 rounded-full bg-[linear-gradient(135deg,#F4D560,#F49E09)] px-3 py-1.5 text-xs font-extrabold text-[#3a2600]">
              ☀ Best Seller
            </span>
            <div className="relative mt-5 flex h-[190px] items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#EAF1FB,#C9DCF3)] shadow-[inset_0_1px_0_rgba(255,255,255,.7)]">
              <ProductArt art="panel" className="h-[120px] w-[150px]" />
            </div>
            <div className="relative mt-5 flex items-end justify-between gap-3">
              <div>
                <div className="font-heading text-base font-bold text-[#EAF1FB]">
                  Longi Hi-MO 550W Mono Panel
                </div>
                <div className="mt-1 text-[13px] text-[#B7D2F2]">
                  Tier-1 · 25-yr performance warranty
                </div>
              </div>
              <div className="text-right">
                <div className="text-[13px] text-[#93A2BC] line-through">৳21,000</div>
                <div className="font-heading text-2xl font-extrabold tabular-nums text-orange-400">
                  ৳18,500
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-5 -left-3.5 flex items-center gap-2.5 rounded-2xl border border-border bg-surface px-4 py-3 shadow-[var(--shadow)]">
            <span className="flex size-9 items-center justify-center rounded-[10px] bg-green-500/15">
              <CheckCircle2 className="size-[18px] text-green-600" />
            </span>
            <div>
              <div className="text-[13px] font-bold text-text">In stock · COD available</div>
              <div className="text-xs text-muted">Steadfast courier · 2–4 days</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Stat({ value, label, color }: { value: string; label: string; color?: string }) {
  return (
    <div>
      <div
        className="font-heading text-[clamp(22px,3vw,26px)] font-extrabold tabular-nums text-text"
        style={color ? { color } : undefined}
      >
        {value}
      </div>
      <div className="text-[13px] font-medium text-muted">{label}</div>
    </div>
  )
}
