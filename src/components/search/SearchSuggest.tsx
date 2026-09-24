import { useRef, useState } from "react"
import { ChevronDown, CornerDownLeft, LayoutGrid, Loader2, Search, X } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"

import { ProductArt } from "@/components/product/ProductArt"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useDebounced } from "@/hooks/use-debounced"
import { useCategories, useProducts } from "@/hooks/use-catalog"
import { artForCategory, tintForCategory } from "@/lib/category-art"
import { cn, formatBDT } from "@/lib/utils"

const QUICK_PICKS = ["Solar panel", "Hybrid inverter", "Tubular battery", "MCCB", "DC fan"]
const MAX_SUGGESTIONS = 6

type Scope = { label: string; slug: string | null }

/**
 * The site search. Typing a few letters queries the catalogue and drops a
 * suggestion list underneath — products first, then the "see everything"
 * escape hatch — with the arrow keys and Enter wired up so it can be driven
 * from the keyboard alone.
 */
export function SearchSuggest({
  variant = "bar",
  onNavigate,
}: {
  variant?: "bar" | "plain"
  onNavigate?: () => void
}) {
  const navigate = useNavigate()
  const { data: categories = [] } = useCategories()
  const [scope, setScope] = useState<Scope>({ label: "All", slug: null })
  const [term, setTerm] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const blurTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const query = useDebounced(term.trim())
  const isSearching = query.length >= 2
  // Nothing is fetched until two letters are in: a single letter would match
  // most of the catalogue and the request would be wasted.
  const { data, isFetching } = useProducts(
    { search: query, categorySlug: scope.slug ?? undefined, pageSize: MAX_SUGGESTIONS },
    { enabled: isSearching },
  )
  const suggestions = isSearching ? (data?.products ?? []) : []
  const total = isSearching ? (data?.count ?? 0) : 0

  const resultsPath = (q: string) => {
    const search = q ? `?search=${encodeURIComponent(q)}` : ""
    return scope.slug ? `/category/${scope.slug}${search}` : `/products${search}`
  }

  const go = (path: string) => {
    setIsOpen(false)
    setActiveIndex(-1)
    navigate(path)
    onNavigate?.()
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const picked = suggestions[activeIndex]
    go(picked ? `/product/${picked.slug}` : resultsPath(term.trim()))
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false)
      setActiveIndex(-1)
      return
    }
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (!suggestions.length) return
      e.preventDefault()
      setIsOpen(true)
      setActiveIndex((i) => {
        const next = e.key === "ArrowDown" ? i + 1 : i - 1
        if (next < -1) return suggestions.length - 1
        if (next >= suggestions.length) return -1
        return next
      })
    }
  }

  // A click on a suggestion fires after blur, so closing is deferred a beat.
  const onBlur = () => {
    blurTimer.current = setTimeout(() => setIsOpen(false), 130)
  }
  const onFocus = () => {
    if (blurTimer.current) clearTimeout(blurTimer.current)
    setIsOpen(true)
  }

  return (
    <div className={cn("relative min-w-0", variant === "bar" ? "flex-1" : "w-full")}>
      <form onSubmit={submit} className="w-full">
        <div
          className={cn(
            "flex h-11 min-w-0 w-full items-center rounded-2xl border bg-surface-2 transition-[box-shadow,border-color] duration-200",
            isOpen
              ? "border-blue-500/60 shadow-[0_0_0_4px_color-mix(in_srgb,var(--blue)_18%,transparent)]"
              : "border-border hover:border-blue-500/40",
          )}
        >
          {variant === "bar" && (
            <DropdownMenu>
              <DropdownMenuTrigger className="group flex h-full shrink-0 items-center gap-1.5 rounded-l-2xl border-r border-border px-3.5 text-[13px] font-semibold text-muted outline-none transition-colors hover:bg-surface-3 hover:text-text data-[state=open]:bg-surface-3 data-[state=open]:text-text">
                <LayoutGrid className="size-[15px]" />
                <span className="max-w-[110px] truncate">{scope.label}</span>
                <ChevronDown className="size-[13px] transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="max-h-[320px] w-60 overflow-y-auto p-1.5">
                <DropdownMenuLabel className="px-2 pb-1 text-[11px] uppercase tracking-wide text-muted">
                  Shop by category
                </DropdownMenuLabel>
                <DropdownMenuItem
                  onSelect={() => setScope({ label: "All", slug: null })}
                  className="rounded-lg text-[13.5px] font-semibold"
                >
                  <LayoutGrid className="size-4 text-blue" /> All Categories
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {categories.map((c) => (
                  <DropdownMenuItem
                    key={c.id}
                    onSelect={() => setScope({ label: c.name, slug: c.slug })}
                    className="rounded-lg text-[13.5px]"
                  >
                    <span className="size-1.5 rounded-full bg-orange-500" />
                    {c.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Search className="ml-3.5 size-[17px] shrink-0 text-muted" />
          <input
            value={term}
            onChange={(e) => {
              setTerm(e.target.value)
              setActiveIndex(-1)
              setIsOpen(true)
            }}
            onFocus={onFocus}
            onBlur={onBlur}
            onKeyDown={onKeyDown}
            role="combobox"
            aria-expanded={isOpen}
            aria-controls="search-suggestions"
            aria-label="Search products"
            placeholder="Search MCB, solar panel, inverter…"
            className="min-w-0 flex-1 bg-transparent px-3 text-base text-text outline-none placeholder:text-muted sm:text-sm"
          />
          {isFetching && isSearching && <Loader2 className="size-4 shrink-0 animate-spin text-muted" />}
          {term && (
            <button
              type="button"
              aria-label="Clear search"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setTerm("")
                setActiveIndex(-1)
              }}
              className="mx-1 flex size-7 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-surface-3 hover:text-text"
            >
              <X className="size-[15px]" />
            </button>
          )}
          <button
            type="submit"
            className="m-1 hidden h-9 shrink-0 items-center gap-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-400 px-4 text-[13px] font-bold text-white shadow-[0_6px_16px_rgba(244,158,9,.3)] transition-transform active:scale-95 sm:flex"
          >
            Search
          </button>
        </div>
      </form>

      {isOpen && (
        <div
          id="search-suggestions"
          role="listbox"
          className="absolute inset-x-0 top-[calc(100%+8px)] z-[70] overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow)]"
        >
          {!isSearching ? (
            <div className="p-3.5">
              <div className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
                Popular searches
              </div>
              <div className="flex flex-wrap gap-2">
                {QUICK_PICKS.map((pick) => (
                  <button
                    key={pick}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setTerm(pick)
                      setIsOpen(true)
                    }}
                    className="rounded-full border border-border bg-surface-2 px-3 py-1.5 text-[12.5px] font-semibold text-muted transition-colors hover:border-blue-500/40 hover:text-blue"
                  >
                    {pick}
                  </button>
                ))}
              </div>
            </div>
          ) : suggestions.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-muted">
              {isFetching ? "Searching…" : <>No product matches “{query}”.</>}
            </div>
          ) : (
            <>
              <div className="max-h-[360px] overflow-y-auto py-1.5">
                {suggestions.map((product, i) => {
                  const image = product.images[0]
                  const price =
                    product.sale_price != null && product.sale_price < product.price
                      ? product.sale_price
                      : product.price
                  return (
                    <Link
                      key={product.id}
                      to={`/product/${product.slug}`}
                      role="option"
                      aria-selected={i === activeIndex}
                      onMouseEnter={() => setActiveIndex(i)}
                      onClick={() => go(`/product/${product.slug}`)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 no-underline transition-colors",
                        i === activeIndex ? "bg-surface-2" : "bg-transparent",
                      )}
                    >
                      <span
                        className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl"
                        style={image ? undefined : { background: tintForCategory(product.category?.slug) }}
                      >
                        {image ? (
                          <img
                            src={image}
                            alt=""
                            loading="lazy"
                            className="absolute inset-0 size-full object-cover"
                          />
                        ) : (
                          <ProductArt art={artForCategory(product.category?.slug)} className="size-7" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <Highlight text={product.name} match={query} />
                        <span className="block truncate text-[11.5px] text-muted">
                          {product.category?.name}
                        </span>
                      </span>
                      <span className="shrink-0 font-heading text-[13.5px] font-extrabold tabular-nums text-text">
                        {formatBDT(price)}
                      </span>
                    </Link>
                  )
                })}
              </div>
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => go(resultsPath(query))}
                className="flex w-full items-center justify-between gap-2 border-t border-border bg-surface-2 px-4 py-2.5 text-[13px] font-bold text-blue"
              >
                <span className="truncate">
                  See all {total} results for “{query}”
                </span>
                <CornerDownLeft className="size-[15px] shrink-0" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

/** Bolds the typed letters wherever they appear in a suggestion's name. */
function Highlight({ text, match }: { text: string; match: string }) {
  const at = match ? text.toLowerCase().indexOf(match.toLowerCase()) : -1
  if (at < 0) {
    return <span className="block truncate text-[13.5px] font-semibold text-text">{text}</span>
  }
  return (
    <span className="block truncate text-[13.5px] text-text">
      {text.slice(0, at)}
      <mark className="bg-transparent font-extrabold text-blue">{text.slice(at, at + match.length)}</mark>
      {text.slice(at + match.length)}
    </span>
  )
}
