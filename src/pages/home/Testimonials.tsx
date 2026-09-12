import { useState } from "react"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"

import { testimonials } from "@/data/home-content"

export function Testimonials() {
  const [index, setIndex] = useState(0)

  const prev = () => setIndex((i) => (i - 1 + testimonials.length) % testimonials.length)
  const next = () => setIndex((i) => (i + 1) % testimonials.length)

  return (
    <section className="mx-auto max-w-[1280px] px-4 pb-6 pt-10 sm:px-6 sm:pt-12">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-blue">
            Customer stories
          </span>
          <h2 className="mt-2 font-heading text-[clamp(24px,3.2vw,32px)] font-extrabold tracking-tight text-text">
            Trusted across Bangladesh
          </h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={prev}
            aria-label="Previous"
            className="flex size-[42px] items-center justify-center rounded-xl border border-border bg-surface text-text hover:bg-surface-2"
          >
            <ChevronLeft className="size-[18px]" />
          </button>
          <button
            onClick={next}
            aria-label="Next"
            className="flex size-[42px] items-center justify-center rounded-xl border border-border bg-surface text-text hover:bg-surface-2"
          >
            <ChevronRight className="size-[18px]" />
          </button>
        </div>
      </div>
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)]"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {testimonials.map((tm) => (
            <div key={tm.name} className="box-border w-full shrink-0 px-0.5">
              <div className="rounded-[20px] border border-border bg-surface p-6 shadow-[var(--shadow-sm)] sm:p-9">
                <div className="flex gap-0.5 text-gold-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="size-[18px] fill-current" />
                  ))}
                </div>
                <p className="my-4 text-pretty text-[clamp(16px,2.2vw,20px)] font-medium leading-relaxed text-text">
                  "{tm.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <span
                    className="flex size-[46px] items-center justify-center rounded-full font-heading font-extrabold text-white"
                    style={{ background: tm.avatar }}
                  >
                    {tm.initials}
                  </span>
                  <div>
                    <div className="text-sm font-bold text-text">{tm.name}</div>
                    <div className="text-[12.5px] text-muted">{tm.role}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
