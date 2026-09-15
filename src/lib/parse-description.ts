// Turns a raw product description — whether an admin carefully formatted it with
// the markdown toolbar, or just pasted one long run-on paragraph — into a list of
// structured blocks the <ProductDescription> component renders as premium,
// section-by-section content.
//
// Two paths:
//   1. Structured: the text has line breaks / markdown markers (## heading,
//      - bullet, 1. numbered, ✅ checklist, **bold**). We respect the author's
//      structure.
//   2. Unstructured: a single glued blob (the common copy-paste case). We
//      auto-format it — pulling ✅ feature bullets into a checklist and breaking
//      the remaining prose into readable paragraphs with the odd heading.

export type DescriptionBlock =
  | { type: "heading"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "checklist"; items: string[] }
  | { type: "crosslist"; items: string[] }
  | { type: "bullets"; items: string[] }
  | { type: "ordered"; items: string[] }
  | { type: "table"; header: string[]; rows: string[][] }

const CHECK_CHARS = "✅✔☑✓"
const CHECK_LINE = new RegExp(`^\\s*(?:[${CHECK_CHARS}]\\uFE0F?|-\\s*\\[[ xX]\\])\\s*`)
const CHECK_SPLIT = new RegExp(`[${CHECK_CHARS}]\\uFE0F?`, "g")
// Non-global companions for boolean checks — .test() on a /g regex is stateful.
const HAS_CHECK = new RegExp(`[${CHECK_CHARS}]`)
const STARTS_WITH_CHECK = new RegExp(`^\\s*[${CHECK_CHARS}]`)
// "Don't do this" lines, the mirror of the ✅ checklist.
const CROSS_CHARS = "❌✖✗"
const CROSS_LINE = new RegExp(`^\\s*[${CROSS_CHARS}]\\uFE0F?\\s*`)
const BULLET_LINE = /^\s*[-*•]\s+/
const ORDERED_LINE = /^\s*\d+[.)]\s+/
const HEADING_LINE = /^\s*#{1,6}\s+/
// Markdown table: a `| a | b |` row followed by a `|---|---|` separator.
const TABLE_ROW = /^\s*\|.*\|\s*$/
const TABLE_SEP = /^\s*\|[\s:|-]+\|\s*$/

function splitTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((c) => c.trim())
}

// Phrases that, when they lead a short sentence, deserve to become a section
// heading in an otherwise unstructured blob.
const HEADING_KEYWORDS =
  /^(specifications?|key\s+specs?|technical\s+specs?|features?|key\s+features?|highlights?|warranty|guarantee|package\s+(?:includes?|contents?)|what'?s\s+in\s+the\s+box|installation|why\s+(?:choose|buy)|benefits?|overview|about|applications?|compatibility|price\s+in\s+bangladesh)\b/i

// A checklist item is a short, scannable line. Anything longer is really prose
// that happened to sit behind a ✅, so we route it to the paragraph builder.
const MAX_CHECK_ITEM_LEN = 110

export function parseDescription(raw: string | null | undefined): DescriptionBlock[] {
  const text = (raw ?? "").replace(/\r\n/g, "\n").trim()
  if (!text) return []
  return /\n/.test(text) ? parseStructured(text) : parseUnstructured(text)
}

function parseStructured(text: string): DescriptionBlock[] {
  const lines = text.split("\n")
  const blocks: DescriptionBlock[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    if (!line.trim()) {
      i++
      continue
    }

    if (HEADING_LINE.test(line)) {
      blocks.push({ type: "heading", text: line.replace(HEADING_LINE, "").trim() })
      i++
      continue
    }

    if (TABLE_ROW.test(line) && i + 1 < lines.length && TABLE_SEP.test(lines[i + 1])) {
      const header = splitTableRow(line)
      i += 2 // skip the header and the separator
      const rows: string[][] = []
      while (i < lines.length && TABLE_ROW.test(lines[i]) && !TABLE_SEP.test(lines[i])) {
        rows.push(splitTableRow(lines[i]))
        i++
      }
      blocks.push({ type: "table", header, rows })
      continue
    }

    if (CHECK_LINE.test(line)) {
      const items: string[] = []
      while (i < lines.length && CHECK_LINE.test(lines[i])) {
        items.push(lines[i].replace(CHECK_LINE, "").trim())
        i++
      }
      blocks.push({ type: "checklist", items: items.filter(Boolean) })
      continue
    }

    if (CROSS_LINE.test(line)) {
      const items: string[] = []
      while (i < lines.length && CROSS_LINE.test(lines[i])) {
        items.push(lines[i].replace(CROSS_LINE, "").trim())
        i++
      }
      blocks.push({ type: "crosslist", items: items.filter(Boolean) })
      continue
    }

    if (BULLET_LINE.test(line)) {
      const items: string[] = []
      while (i < lines.length && BULLET_LINE.test(lines[i])) {
        items.push(lines[i].replace(BULLET_LINE, "").trim())
        i++
      }
      blocks.push({ type: "bullets", items: items.filter(Boolean) })
      continue
    }

    if (ORDERED_LINE.test(line)) {
      const items: string[] = []
      while (i < lines.length && ORDERED_LINE.test(lines[i])) {
        items.push(lines[i].replace(ORDERED_LINE, "").trim())
        i++
      }
      blocks.push({ type: "ordered", items: items.filter(Boolean) })
      continue
    }

    // Plain prose — gather consecutive plain lines into one paragraph.
    const para: string[] = []
    while (
      i < lines.length &&
      lines[i].trim() &&
      !HEADING_LINE.test(lines[i]) &&
      !CHECK_LINE.test(lines[i]) &&
      !CROSS_LINE.test(lines[i]) &&
      !BULLET_LINE.test(lines[i]) &&
      !ORDERED_LINE.test(lines[i]) &&
      !TABLE_ROW.test(lines[i])
    ) {
      para.push(lines[i].trim())
      i++
    }
    if (para.length) blocks.push({ type: "paragraph", text: para.join(" ") })
  }

  return blocks
}

function parseUnstructured(text: string): DescriptionBlock[] {
  const blocks: DescriptionBlock[] = []
  const items: string[] = []
  const proseParts: string[] = []

  if (HAS_CHECK.test(text)) {
    const startsWithCheck = STARTS_WITH_CHECK.test(text)
    const segments = text
      .split(CHECK_SPLIT)
      .map((s) => s.trim())
      .filter(Boolean)

    segments.forEach((seg, idx) => {
      // Leading text before the very first ✅ is intro prose, not an item.
      if (idx === 0 && !startsWithCheck) {
        proseParts.push(seg)
        return
      }
      if (seg.length <= MAX_CHECK_ITEM_LEN) items.push(seg)
      else proseParts.push(seg)
    })
  } else {
    proseParts.push(text)
  }

  if (items.length) blocks.push({ type: "checklist", items })
  for (const part of proseParts) blocks.push(...paragraphize(part))

  return blocks
}

// Break a prose blob into readable paragraphs (~3 sentences each), promoting
// heading-like lead sentences to their own heading block.
function paragraphize(text: string): DescriptionBlock[] {
  const blocks: DescriptionBlock[] = []
  const sentences = splitSentences(text)
  let group: string[] = []

  const flush = () => {
    if (group.length) {
      blocks.push({ type: "paragraph", text: group.join(" ") })
      group = []
    }
  }

  for (const sentence of sentences) {
    const heading = asHeading(sentence)
    if (heading) {
      flush()
      blocks.push({ type: "heading", text: heading })
      continue
    }
    group.push(sentence)
    if (group.length >= 3) flush()
  }
  flush()

  return blocks
}

// Split on whitespace that follows sentence punctuation and precedes the start
// of a new sentence. Using split (not match) means no text is ever dropped, and
// the lookahead/lookbehind avoids breaking model numbers like "S6-EH1P9.9K03"
// or decimals, where the period isn't followed by a space.
function splitSentences(text: string): string[] {
  const parts = text
    .split(/(?<=[.!?])\s+(?=["'([]?[A-Z0-9])/)
    .map((s) => s.trim())
    .filter(Boolean)
  return parts.length ? parts : [text.trim()].filter(Boolean)
}

// A sentence becomes a heading when it's short and either ends with a colon or
// opens with a recognised section keyword. We strip a trailing colon/period.
function asHeading(sentence: string): string | null {
  const trimmed = sentence.trim()
  if (trimmed.length > 64) return null
  const endsWithColon = /:\s*$/.test(trimmed)
  const startsWithKeyword = HEADING_KEYWORDS.test(trimmed)
  if (!endsWithColon && !startsWithKeyword) return null
  return trimmed.replace(/[:.]\s*$/, "").trim()
}

// Splits a string on **bold** markers into segments for inline rendering.
export function parseInline(text: string): { text: string; bold: boolean }[] {
  const out: { text: string; bold: boolean }[] = []
  const regex = /\*\*(.+?)\*\*/g
  let last = 0
  let match: RegExpExecArray | null
  while ((match = regex.exec(text))) {
    if (match.index > last) out.push({ text: text.slice(last, match.index), bold: false })
    out.push({ text: match[1], bold: true })
    last = match.index + match[0].length
  }
  if (last < text.length) out.push({ text: text.slice(last), bold: false })
  return out.length ? out : [{ text, bold: false }]
}
