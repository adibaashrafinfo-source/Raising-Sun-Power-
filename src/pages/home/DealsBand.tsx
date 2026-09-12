import { Link } from "react-router-dom"

import { useCountdown } from "@/hooks/use-countdown"

const DEAL_DURATION_SECONDS = 2 * 86400 + 8 * 3600 + 43 * 60 + 11

export function DealsBand() {
  const countdown = useCountdown(DEAL_DURATION_SECONDS)

  return (
    <section className="mx-auto max-w-[1280px] px-4 py-10 sm:px-6 sm:py-12">
      <div className="relative overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#F4D560,#F49E09)] p-7 shadow-[0_20px_50px_rgba(244,158,9,.32)] sm:p-11">
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div className="text-[#3a2600]">
            <span className="inline-block rounded-full bg-white/55 px-3 py-1.5 text-xs font-extrabold">
              ⚡ Solar Combo Offer
            </span>
            <h3 className="mt-3.5 max-w-[440px] font-heading text-[clamp(24px,3.4vw,34px)] font-extrabold leading-tight">
              Complete home solar kit — save up to ৳14,000
            </h3>
            <p className="mt-1.5 max-w-[440px] text-[15px] text-[#5a3f00]">
              550W panel + 3kVA inverter + 200Ah battery. Offer ends soon.
            </p>
          </div>
          <div className="flex flex-col items-start gap-4">
            <div className="flex gap-2.5">
              {countdown.map((unit) => (
                <div
                  key={unit.label}
                  className="min-w-[62px] rounded-2xl bg-white/90 px-1.5 py-2.5 text-center shadow-[inset_0_1px_0_rgba(255,255,255,.8)]"
                >
                  <div className="font-heading text-2xl font-extrabold tabular-nums text-[#052C6E]">
                    {unit.val}
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#7a6320]">
                    {unit.label}
                  </div>
                </div>
              ))}
            </div>
            <Link
              to="/products"
              className="flex h-[52px] items-center rounded-2xl bg-[#052C6E] px-7 text-[15px] font-bold text-white no-underline shadow-[0_10px_26px_rgba(5,44,110,.35)] transition-transform hover:-translate-y-0.5"
            >
              Grab the deal →
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
