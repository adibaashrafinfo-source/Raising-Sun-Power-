import { useEffect, useRef, useState } from "react"
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { heroSlides } from "@/data/home-content"
import { useHeroSlides } from "@/hooks/use-hero-slides"
import { useSiteContent } from "@/hooks/use-site-content"
import { cn } from "@/lib/utils"

const AUTO_ADVANCE_MS = 5500

/** Kept in step with the built-in slides so uploaded banners are lit the same. */
const GLOWS = [
  "radial-gradient(circle,#217CCA 0%,transparent 70%)",
  "radial-gradient(circle,#67A70E 0%,transparent 70%)",
  "radial-gradient(circle,#F49E09 0%,transparent 70%)",
]

type Slide = {
  key: string
  image?: string
  badge: string
  title: string
  highlight: string
  body: string
  ctaLabel: string
  ctaTo: string
  secondaryLabel: string
  secondaryTo: string
  glow: string
}

/**
 * The banner carousel at the top of the homepage. Slides auto-advance, pause
 * while the pointer or keyboard focus is inside, and can be driven by the
 * arrows or the dots.
 *
 * Slides come from the hero_slides table, uploaded and ordered from Admin →
 * Hero Slider. With none set up it falls back to the built-in slides, whose
 * first one still takes its copy from the CMS hero fields.
 */
export function HeroSlider() {
  const { data: cms } = useSiteContent()
  const { data: uploaded = [] } = useHeroSlides()
  const [index, setIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const slides: Slide[] = uploaded.length
    ? uploaded.map((row, i) => ({
        key: row.id,
        image: row.image_url ?? undefined,
        badge: row.badge ?? "",
        title: row.title ?? "",
        highlight: row.highlight ?? "",
        body: row.body ?? "",
        ctaLabel: row.cta_label ?? "",
        ctaTo: row.cta_href || "/products",
        secondaryLabel: row.secondary_label ?? "",
        secondaryTo: row.secondary_href || "/products",
        glow: GLOWS[i % GLOWS.length],
      }))
    : heroSlides.map((slide, i) => ({
        ...slide,
        key: slide.title,
        badge: i === 0 ? cms?.hero_badge || slide.badge : slide.badge,
        title: i === 0 ? cms?.hero_headline_prefix || slide.title : slide.title,
        highlight: i === 0 ? cms?.hero_headline_highlight || slide.highlight : slide.highlight,
        body: i === 0 ? cms?.hero_subheading || slide.body : slide.body,
      }))

  const count = slides.length
  const safeIndex = index < count ? index : 0
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (isPaused || count < 2) return
    timer.current = setInterval(() => setIndex((i) => (i + 1) % count), AUTO_ADVANCE_MS)
    return () => {
      if (timer.current) clearInterval(timer.current)
    }
  }, [isPaused, count])

  const go = (next: number) => setIndex(((next % count) + count) % count)

  return (
    <section
      data-hero
      aria-roledescription="carousel"
      aria-label="Offers"
      className="relative overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
    >
      <div className="relative">
        {slides.map((slide, i) => (
          <div
            key={slide.key}
            aria-hidden={i !== safeIndex}
            className={cn(
              "transition-opacity duration-500",
              i === safeIndex ? "opacity-100" : "pointer-events-none absolute inset-0 opacity-0",
            )}
          >
            <SlidePanel slide={slide} />
          </div>
        ))}
      </div>

      {count > 1 && (
        <>
          <CarouselButton side="left" onClick={() => go(safeIndex - 1)} />
          <CarouselButton side="right" onClick={() => go(safeIndex + 1)} />
          <div className="absolute inset-x-0 bottom-3 z-20 flex justify-center gap-2">
            {slides.map((slide, i) => (
              <button
                key={slide.key}
                onClick={() => go(i)}
                aria-label={`Slide ${i + 1}`}
                aria-current={i === safeIndex}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  i === safeIndex ? "w-7 bg-orange-500" : "w-2 bg-[var(--hero-text)]/35",
                )}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}

function SlidePanel({ slide }: { slide: Slide }) {
  const hasCopy = !!(slide.badge || slide.title || slide.highlight || slide.body)

  // A designed banner with no copy on top of it is shown whole — cropping it to
  // fit a text layout would cut off the artwork the image already carries.
  if (slide.image && !hasCopy) {
    const banner = (
      <img
        src={slide.image}
        alt={slide.ctaLabel || "Rising Sun Power BD"}
        className="block max-h-[70vh] w-full object-cover"
      />
    )
    return (
      <div className="relative overflow-hidden" style={{ background: "var(--hero-bg)" }}>
        {slide.ctaTo ? (
          <Link to={slide.ctaTo} className="block no-underline">
            {banner}
          </Link>
        ) : (
          banner
        )}
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 z-0" style={{ background: "var(--hero-bg)" }}>
        {/* An image behind copy is dimmed, so the headline stays readable
            whatever the photo is. */}
        {slide.image && (
          <>
            <img src={slide.image} alt="" className="absolute inset-0 size-full object-cover" />
            <div className="absolute inset-0 bg-black/45" />
          </>
        )}
        <div
          className="pointer-events-none absolute -left-[10%] -top-[15%] size-[420px] rounded-full blur-[70px] sm:size-[560px]"
          style={{ background: slide.glow, opacity: "var(--hero-glow-opacity)" }}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(var(--hero-grid) 1px,transparent 1px),linear-gradient(90deg,var(--hero-grid) 1px,transparent 1px)",
            backgroundSize: "56px 56px",
            opacity: "var(--hero-grid-opacity)",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[1280px] flex-col items-center px-4 py-10 text-center sm:px-6 sm:py-14 lg:py-16">
        {slide.badge && (
          <span
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold sm:text-xs",
              slide.image ? "border-white/25 bg-white/15 text-white" : "text-[var(--hero-text)]",
            )}
            style={
              slide.image
                ? undefined
                : { background: "var(--hero-chip-bg)", borderColor: "var(--hero-chip-border)" }
            }
          >
            <span className="size-[7px] shrink-0 rounded-full bg-green-500" />
            {slide.badge}
          </span>
        )}

        <h1
          className={cn(
            "mt-4 max-w-[860px] text-balance font-heading text-[clamp(25px,5.4vw,48px)] font-extrabold leading-[1.12] tracking-tight",
            slide.image ? "text-white drop-shadow" : "text-[var(--hero-text)]",
          )}
        >
          {slide.title}{" "}
          <span
            className={slide.image ? "text-orange-400" : "bg-clip-text text-transparent"}
            style={slide.image ? undefined : { backgroundImage: "var(--hero-highlight)" }}
          >
            {slide.highlight}
          </span>
        </h1>

        {slide.body && (
          <p
            className={cn(
              "mx-auto mt-4 max-w-[560px] text-[clamp(14px,3.4vw,17px)] leading-relaxed",
              slide.image ? "text-white/85" : "text-[var(--hero-muted)]",
            )}
          >
            {slide.body}
          </p>
        )}

        {(slide.ctaLabel || slide.secondaryLabel) && (
          <div className="mt-5 flex w-full flex-row flex-nowrap justify-center gap-2.5 sm:w-auto sm:gap-3.5">
            {slide.ctaLabel && (
              <Button asChild size="lg" className="min-w-0 flex-1 px-4 text-sm sm:flex-none sm:px-6 sm:text-base">
                <Link to={slide.ctaTo}>
                  {slide.ctaLabel} <ArrowRight className="size-[18px]" />
                </Link>
              </Button>
            )}
            {slide.secondaryLabel && (
              <Button
                asChild
                size="lg"
                className={cn(
                  "min-w-0 flex-1 border px-4 text-sm hover:brightness-95 sm:flex-none sm:px-6 sm:text-base",
                  slide.image
                    ? "border-white/30 bg-white/15 text-white"
                    : "bg-[var(--hero-ghost-bg)] text-[var(--hero-text)]",
                )}
                style={slide.image ? undefined : { borderColor: "var(--hero-ghost-border)" }}
              >
                <Link to={slide.secondaryTo}>{slide.secondaryLabel}</Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function CarouselButton({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight
  return (
    <button
      onClick={onClick}
      aria-label={side === "left" ? "Previous slide" : "Next slide"}
      className={cn(
        "absolute top-1/2 z-20 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--hero-chip-border)] bg-[var(--hero-chip-bg)] text-[var(--hero-text)] backdrop-blur-sm transition-colors hover:brightness-95 sm:flex",
        side === "left" ? "left-3" : "right-3",
      )}
    >
      <Icon className="size-5" />
    </button>
  )
}
