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
          className="text-xs font-bold uppercase tracking-[0.14em]"
          style={{ color: kickerColor }}
        >
          {kicker}
        </span>
        <h2 className="mt-2 font-heading text-[clamp(24px,3.2vw,32px)] font-extrabold tracking-tight text-text">
          {title}
        </h2>
      </div>
      {linkTo && (
        <Link to={linkTo} className="whitespace-nowrap text-sm font-semibold text-blue no-underline">
          {linkLabel} →
        </Link>
      )}
    </div>
  )
}
