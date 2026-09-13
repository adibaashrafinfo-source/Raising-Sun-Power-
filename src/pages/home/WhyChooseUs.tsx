import { BadgeCheck, HeartHandshake, ShieldCheck, Truck } from "lucide-react"

import { whyRsp } from "@/data/home-content"

const ICONS = [BadgeCheck, ShieldCheck, Truck, HeartHandshake]

export function WhyChooseUs() {
  return (
    <section className="mx-auto max-w-[1280px] px-4 pb-6 pt-10 sm:px-6 sm:pt-12">
      <div className="mb-6">
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-orange-500">
          Why choose RSP
        </span>
        <h2 className="mt-2 font-heading text-[clamp(24px,3.2vw,32px)] font-extrabold tracking-tight text-text">
          Bought right, backed properly
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-4">
        {whyRsp.map((item, i) => {
          const Icon = ICONS[i]
          return (
            <div
              key={item.title}
              className="rounded-[18px] border border-border bg-surface p-6 shadow-[var(--shadow-sm)]"
            >
              <span
                className="mb-4 flex size-[50px] items-center justify-center rounded-2xl"
                style={{ background: item.tint }}
              >
                <Icon className="size-6" style={{ color: item.color }} />
              </span>
              <div className="font-heading text-base font-bold text-text">{item.title}</div>
              <p className="mt-2 text-[13.5px] leading-relaxed text-muted">{item.body}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
