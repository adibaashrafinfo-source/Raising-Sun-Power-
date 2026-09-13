import { Link } from "react-router-dom"

import { megaCols } from "@/data/home-content"

export function MegaMenu({ onClose }: { onClose: () => void }) {
  return (
    <div
      onMouseEnter={(e) => e.stopPropagation()}
      onMouseLeave={onClose}
      className="absolute inset-x-0 top-full border-b border-border bg-surface shadow-[var(--shadow)]"
    >
      <div className="mx-auto grid max-w-[1280px] grid-cols-2 gap-6 px-6 py-6 sm:grid-cols-3 lg:grid-cols-[repeat(5,1fr)_1.2fr]">
        {megaCols.map((col) => (
          <div key={col.title}>
            <div
              className="mb-3 flex items-center gap-2 font-heading text-[13px] font-extrabold text-text"
              style={{ color: col.color }}
            >
              {col.title}
            </div>
            <div className="flex flex-col gap-2.5">
              {col.items.map((item) => (
                <Link
                  key={item}
                  to="/products"
                  onClick={onClose}
                  className="text-[13px] text-muted no-underline hover:text-blue"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>
        ))}
        <div className="flex flex-col justify-between rounded-2xl bg-[linear-gradient(160deg,#217CCA,#052C6E)] p-5 text-white">
          <div>
            <span className="inline-block rounded-full bg-[linear-gradient(135deg,#F4D560,#F49E09)] px-2.5 py-1 text-[11px] font-extrabold text-[#3a2600]">
              Combo Offer
            </span>
            <div className="mt-3 font-heading text-lg font-extrabold leading-tight">
              Solar starter kit — panel + inverter + battery
            </div>
          </div>
          <Link
            to="/products"
            onClick={onClose}
            className="mt-4 flex h-10 items-center justify-center rounded-[11px] bg-[linear-gradient(100deg,#F49E09,#FFB43D)] text-[13px] font-bold text-white no-underline"
          >
            Shop combos →
          </Link>
        </div>
      </div>
    </div>
  )
}
