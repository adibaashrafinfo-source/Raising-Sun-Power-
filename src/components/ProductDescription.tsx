import { Check, X } from "lucide-react"

import { parseDescription, parseInline, type DescriptionBlock } from "@/lib/parse-description"

function Inline({ text }: { text: string }) {
  return (
    <>
      {parseInline(text).map((seg, i) =>
        seg.bold ? (
          <strong key={i} className="font-semibold text-text">
            {seg.text}
          </strong>
        ) : (
          <span key={i}>{seg.text}</span>
        ),
      )}
    </>
  )
}

function Block({ block }: { block: DescriptionBlock }) {
  switch (block.type) {
    case "heading":
      return (
        <h3 className="mt-7 flex items-center gap-2.5 font-heading text-lg font-extrabold tracking-tight text-text first:mt-0">
          <span className="h-5 w-1 rounded-full bg-[linear-gradient(180deg,#217CCA,#67A70E)]" />
          {block.text}
        </h3>
      )
    case "paragraph":
      return (
        <p className="text-[15px] leading-relaxed text-muted">
          <Inline text={block.text} />
        </p>
      )
    case "checklist":
      return (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {block.items.map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-2.5 rounded-xl border border-border bg-surface p-3 shadow-[var(--shadow-sm)]"
            >
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-green-500/16">
                <Check className="size-3.5 text-green-600" />
              </span>
              <span className="text-[14px] leading-snug text-text">
                <Inline text={item} />
              </span>
            </div>
          ))}
        </div>
      )
    case "crosslist":
      return (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {block.items.map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-2.5 rounded-xl border border-red-500/25 bg-red-500/[0.06] p-3"
            >
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-red-500/16">
                <X className="size-3.5 text-red-500" />
              </span>
              <span className="text-[14px] leading-snug text-text">
                <Inline text={item} />
              </span>
            </div>
          ))}
        </div>
      )
    case "bullets":
      return (
        <ul className="flex flex-col gap-2">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5 text-[15px] leading-relaxed text-muted">
              <span className="mt-[9px] size-1.5 shrink-0 rounded-full bg-orange-500" />
              <span>
                <Inline text={item} />
              </span>
            </li>
          ))}
        </ul>
      )
    case "table":
      return (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-2">
                {block.header.map((h, i) => (
                  <th key={i} className="px-4 py-3 font-heading text-[13px] font-bold text-text">
                    <Inline text={h} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, ri) => (
                <tr key={ri} className="border-b border-border last:border-0">
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-4 py-3 text-[13.5px] text-muted">
                      <Inline text={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    case "ordered":
      return (
        <ol className="flex flex-col gap-2.5">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-[15px] leading-relaxed text-muted">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-blue/12 font-heading text-xs font-bold text-blue">
                {i + 1}
              </span>
              <span className="pt-0.5">
                <Inline text={item} />
              </span>
            </li>
          ))}
        </ol>
      )
  }
}

/**
 * Renders a product description as premium, auto-formatted sections. Accepts raw
 * text (formatted with the admin toolbar or a plain pasted blob) and, if empty,
 * shows the provided fallback.
 */
export function ProductDescription({ text, fallback }: { text: string | null | undefined; fallback?: React.ReactNode }) {
  const blocks = parseDescription(text)
  if (blocks.length === 0) return <>{fallback}</>
  return (
    <div className="flex flex-col gap-3.5">
      {blocks.map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </div>
  )
}

/**
 * The same premium block renderer for any long-form content that isn't a
 * product description — blog posts, guides, policy pages.
 */
export function RichText({ text }: { text: string | null | undefined }) {
  return <ProductDescription text={text} />
}
