import { Phone } from "lucide-react"
import { Link } from "react-router-dom"

import { telLink, whatsappLink } from "@/data/company"

export function CtaBand() {
  return (
    <section className="mx-auto max-w-[1280px] px-4 pb-6 pt-10 sm:px-6 sm:pt-12">
      <div className="relative overflow-hidden rounded-3xl bg-[linear-gradient(160deg,#217CCA,#052C6E)] p-7 shadow-[0_24px_60px_rgba(5,44,110,.4)] sm:p-12">
        <div
          className="pointer-events-none absolute -right-8 -top-16 size-[280px] rounded-full opacity-35 blur-[10px]"
          style={{ background: "radial-gradient(circle,#F49E09,transparent 68%)" }}
        />
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-[560px]">
            <h3 className="font-heading text-[clamp(24px,3.4vw,32px)] font-extrabold leading-tight text-white">
              Need a custom solar solution?
            </h3>
            <p className="mt-3 text-[15px] text-[#B7D2F2]">
              Our engineers size the right panels, inverter and battery for your home or
              business — free consultation.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/solar-assessment"
              className="flex h-[52px] items-center gap-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-400 px-6 text-[15px] font-bold text-white no-underline shadow-[0_10px_26px_rgba(244,158,9,.35)]"
            >
              Get Free Solar Assessment
            </Link>
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noreferrer"
              className="flex h-[52px] items-center gap-2.5 rounded-2xl bg-[#25D366] px-6 text-[15px] font-bold text-[#053a1d] no-underline shadow-[0_10px_26px_rgba(37,211,102,.35)]"
            >
              WhatsApp us
            </a>
            <a
              href={telLink()}
              className="flex h-[52px] items-center gap-2.5 rounded-2xl border border-white/20 bg-white/15 px-6 text-[15px] font-bold text-white no-underline"
            >
              <Phone className="size-[18px]" />
              Call now
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
