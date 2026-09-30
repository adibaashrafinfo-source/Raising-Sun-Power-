import { useEffect, useRef, useState } from "react"
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { heroSlides } from "@/data/home-content"
import { useSiteContent } from "@/hooks/use-site-content"
import { cn } from "@/lib/utils"

const AUTO_ADVANCE_MS = 5500

/**
 * The banner carousel at the top of the homepage. Slides auto-advance, pause
 * while the pointer or keyboard focus is inside, and can be driven by the
 * arrows or the dots. The first slide takes its headline from the CMS so the
 * existing hero copy keeps working.
 */
export function HeroSlider() {
  const { data: cms } = useSiteContent()
  const [index, setIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const slides = heroSlides.map((slide, i) =>
    i === 0
      ? {
          ...slide,
          badge: cms?.hero_badge || slide.badge,
          title: cms?.hero_headline_prefix || slide.title,
          highlight: cms?.hero_headline_highlight || slide.highlight,
          body: cms?.hero_subheading || slide.body,
        }
      : slide,
  )

  const count = slides.length
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
            key={slide.title}
            aria-hidden={i !== index}
            className={cn(
              "transition-opacity duration-500",
              i === index ? "opacity-100" : "pointer-events-none absolute inset-0 opacity-0",
            )}
          >
            <SlidePanel slide={slide} />
          </div>
        ))}
      </div>

      {count > 1 && (
        <>
          <CarouselButton side="left" onClick={() => go(index - 1)} />
          <CarouselButton side="right" onClick={() => go(index + 1)} />
          <div className="absolute inset-x-0 bottom-3 z-20 flex justify-center gap-2">
            {slides.map((slide, i) => (
              <button
                key={slide.title}
                onClick={() => go(i)}
                aria-label={`Slide ${i + 1}`}
                aria-current={i === index}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  i === index ? "w-7 bg-orange-500" : "w-2 bg-[var(--hero-text)]/35",
                )}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}

function SlidePanel({ slide }: { slide: (typeof heroSlides)[number] }) {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 z-0" style={{ background: "var(--hero-bg)" }}>
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
        <span
          className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold text-[var(--hero-text)] sm:text-xs"
          style={{ background: "var(--hero-chip-bg)", borderColor: "var(--hero-chip-border)" }}
        >
          <span className="size-[7px] shrink-0 rounded-full bg-green-500" />
          {slide.badge}
        </span>

        <h1 className="mt-4 max-w-[860px] text-balance font-heading text-[clamp(25px,5.4vw,48px)] font-extrabold leading-[1.12] tracking-tight text-[var(--hero-text)]">
          {slide.title}{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: "var(--hero-highlight)" }}
          >
            {slide.highlight}
          </span>
        </h1>

        <p className="mx-auto mt-4 max-w-[560px] text-[clamp(14px,3.4vw,17px)] leading-relaxed text-[var(--hero-muted)]">
          {slide.body}
        </p>

        <div className="mt-5 flex w-full flex-row flex-nowrap justify-center gap-2.5 sm:w-auto sm:gap-3.5">
          <Button asChild size="lg" className="min-w-0 flex-1 px-4 text-sm sm:flex-none sm:px-6 sm:text-base">
            <Link to={slide.ctaTo}>
              {slide.ctaLabel} <ArrowRight className="size-[18px]" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            className="min-w-0 flex-1 border bg-[var(--hero-ghost-bg)] px-4 text-sm text-[var(--hero-text)] hover:brightness-95 sm:flex-none sm:px-6 sm:text-base"
            style={{ borderColor: "var(--hero-ghost-border)" }}
          >
            <Link to={slide.secondaryTo}>{slide.secondaryLabel}</Link>
          </Button>
        </div>
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
