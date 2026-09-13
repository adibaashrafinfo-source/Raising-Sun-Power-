import { ArrowRight, Building2, Factory, Home } from "lucide-react"
import { Link } from "react-router-dom"

import { solutions } from "@/data/home-content"

const ICONS = [Home, Building2, Factory]

export function ShopBySolution() {
  return (
    <section className="mx-auto max-w-[1280px] px-4 pb-6 pt-10 sm:px-6 sm:pt-12">
      <div className="mb-6">
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-blue">
          Shop by solution
        </span>
        <h2 className="mt-2 font-heading text-[clamp(24px,3.2vw,32px)] font-extrabold tracking-tight text-text">
          Built for every kind of load
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-3">
        {solutions.map((solution, i) => {
          const Icon = ICONS[i]
          return (
            <Link
              key={solution.title}
              to="/products"
              className="relative flex min-h-[230px] flex-col justify-end overflow-hidden rounded-[20px] p-6 no-underline shadow-[var(--shadow)] transition-transform hover:-translate-y-1"
              style={{ background: solution.grad }}
            >
              <span className="absolute left-[18px] top-[18px] flex size-[46px] items-center justify-center rounded-[13px] bg-white/20">
                <Icon className="size-6 text-white" />
              </span>
              <div className="relative text-white">
                <div className="font-heading text-xl font-extrabold">{solution.title}</div>
                <p className="my-2 text-[13.5px] leading-relaxed text-white/85">{solution.body}</p>
                <span className="inline-flex items-center gap-1.5 text-[13.5px] font-bold">
                  Explore <ArrowRight className="size-[15px]" />
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
