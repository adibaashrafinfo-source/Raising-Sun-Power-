import { BadgeCheck, ShieldCheck, Truck, Wallet } from "lucide-react"

import { trustChips } from "@/data/home-content"

const ICONS = [BadgeCheck, ShieldCheck, Truck, Wallet]

export function TrustChips() {
  return (
    // Desktop only: on a phone these four cards push the products far down the
    // page, and the same promises are repeated in the footer.
    <section className="mx-auto hidden max-w-[1280px] px-4 py-2 sm:px-6 lg:block">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {trustChips.map((chip, i) => {
          const Icon = ICONS[i]
          return (
            <div
              key={chip.title}
              className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-[18px] py-4 shadow-[var(--shadow-sm)]"
            >
              <span
                className="flex size-10 shrink-0 items-center justify-center rounded-[11px]"
                style={{ background: chip.tint }}
              >
                <Icon className="size-5" style={{ color: chip.color }} />
              </span>
              <div>
                <div className="text-sm font-bold text-text">{chip.title}</div>
                <div className="text-xs text-muted">{chip.sub}</div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
