import { BadgeCheck, HeartHandshake, ShieldCheck, Truck } from "lucide-react"

import { whyRsp } from "@/data/home-content"
import { SectionHeader } from "@/pages/home/SectionHeader"

const ICONS = [BadgeCheck, ShieldCheck, Truck, HeartHandshake]

export function WhyChooseUs() {
  return (
    <section className="mx-auto max-w-[1280px] px-4 pb-6 pt-10 sm:px-6 sm:pt-12">
      <SectionHeader
        kicker="Why choose RSP"
        kickerColor="#F49E09"
        title="Bought right, backed properly"
      />
      <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-4">
        {whyRsp.map((item, i) => {
          const Icon = ICONS[i]
          return (
            <div
              key={item.title}
              className="group relative overflow-hidden rounded-[18px] border border-border bg-surface p-6 shadow-[var(--shadow-sm)] transition-[transform,box-shadow,border-color] duration-250 hover:-translate-y-1 hover:shadow-[var(--shadow)]"
            >
              {/* A wash of the card's own accent, revealed on hover. */}
              <span
                className="pointer-events-none absolute -right-10 -top-10 size-28 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-25"
                style={{ background: item.color }}
              />
              <span className="absolute right-5 top-5 font-heading text-[28px] font-extrabold leading-none text-text opacity-[0.07]">
                0{i + 1}
              </span>
              <span
                className="relative mb-4 flex size-[50px] items-center justify-center rounded-2xl transition-transform duration-250 group-hover:scale-105"
                style={{ background: item.tint }}
              >
                <Icon className="size-6" style={{ color: item.color }} />
              </span>
              <div className="relative font-heading text-base font-bold text-text">{item.title}</div>
              <p className="relative mt-2 text-[13.5px] leading-relaxed text-muted">{item.body}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
