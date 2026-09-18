import { ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"

export function SectionHeader({
  kicker,
  kickerColor,
  title,
  linkTo,
  linkLabel,
}: {
  kicker: string
  kickerColor: string
  title: string
  linkTo?: string
  linkLabel?: string
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <span
          className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em]"
          style={{
            color: kickerColor,
            borderColor: `color-mix(in srgb, ${kickerColor} 30%, transparent)`,
            background: `color-mix(in srgb, ${kickerColor} 10%, transparent)`,
          }}
        >
          <span className="size-1.5 rounded-full" style={{ background: kickerColor }} />
          {kicker}
        </span>
        <h2 className="mt-2.5 font-heading text-[clamp(24px,3.2vw,32px)] font-extrabold tracking-tight text-text">
          {title}
        </h2>
        {/* A short accent rule under the title ties the sections together. */}
        <span
          className="mt-2.5 block h-[3px] w-14 rounded-full"
          style={{ background: `linear-gradient(90deg, ${kickerColor}, transparent)` }}
        />
      </div>
      {linkTo && (
        <Link
          to={linkTo}
          className="group inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-4 py-2 text-[13px] font-bold text-blue no-underline shadow-[var(--shadow-sm)] transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-blue-500/45"
        >
          {linkLabel}
          <ArrowRight className="size-[15px] transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  )
}
