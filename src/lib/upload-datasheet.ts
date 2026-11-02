import { supabase } from "@/lib/supabase"

export const DATASHEET_BUCKET = "product-datasheets"
export const DATASHEET_MAX_BYTES = 60 * 1024 * 1024

/** What a datasheet can be, keyed by extension, with the type its bytes must start with. */
const KINDS: Record<string, { mime: string; magic: number[][] }> = {
  pdf: { mime: "application/pdf", magic: [[0x25, 0x50, 0x44, 0x46, 0x2d]] },
  doc: { mime: "application/msword", magic: [[0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]] },
  xls: { mime: "application/vnd.ms-excel", magic: [[0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]] },
  ppt: { mime: "application/vnd.ms-powerpoint", magic: [[0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]] },
  docx: {
    mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    magic: [[0x50, 0x4b, 0x03, 0x04]],
  },
  xlsx: {
    mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    magic: [[0x50, 0x4b, 0x03, 0x04]],
  },
  pptx: {
    mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    magic: [[0x50, 0x4b, 0x03, 0x04]],
  },
  zip: { mime: "application/zip", magic: [[0x50, 0x4b, 0x03, 0x04]] },
  png: { mime: "image/png", magic: [[0x89, 0x50, 0x4e, 0x47]] },
  jpg: { mime: "image/jpeg", magic: [[0xff, 0xd8, 0xff]] },
  jpeg: { mime: "image/jpeg", magic: [[0xff, 0xd8, 0xff]] },
}

export const DATASHEET_EXTENSIONS = Object.keys(KINDS)
/** For the file picker's `accept` attribute. */
export const DATASHEET_ACCEPT = DATASHEET_EXTENSIONS.map((ext) => `.${ext}`).join(",")
/** The storage bucket must allow exactly these types (see rsp_datasheet_60mb.sql). */
export const DATASHEET_MIME_TYPES = [...new Set(Object.values(KINDS).map((k) => k.mime))]

export type UploadedDatasheet = { url: string; filename: string; path: string }

/** Thrown for a file the admin can fix by picking a different one. */
export class DatasheetRejectedError extends Error {}

const extensionOf = (name: string) => (name.split(".").pop() ?? "").toLowerCase()

/**
 * Strips directories, path-traversal sequences and anything outside a safe set
 * before the name is stored or shown. Only used for display and the download
 * name — the storage key itself is a UUID.
 */
export function sanitizeFilename(name: string): string {
  const base = name.split(/[\\/]/).pop() ?? "datasheet.pdf"
  const cleaned = base
    .replace(/\.{2,}/g, ".")
    // Letters and digits in any script survive; separators and anything that
    // could be read as a path do not.
    .replace(/[^\p{L}\p{M}\p{N}._ -]/gu, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^[.\-\s]+/, "")
    .trim()
    .slice(0, 120)
  const safe = cleaned || "datasheet.pdf"
  return DATASHEET_EXTENSIONS.includes(extensionOf(safe)) ? safe : `${safe}.pdf`
}

/** True when the file really starts with the signature its extension promises. */
async function matchesSignature(file: File, ext: string): Promise<boolean> {
  const signatures = KINDS[ext].magic
  const head = new Uint8Array(await file.slice(0, 8).arrayBuffer())
  return signatures.some((sig) => sig.every((byte, i) => head[i] === byte))
}

/**
 * Validates and stores one datasheet (up to 60MB). The extension must be on the
 * allowed list and the file's own first bytes must match it, so a renamed .exe
 * is refused before it reaches storage — and the bucket enforces the same type
 * list and size server-side.
 */
export async function uploadDatasheet(file: File): Promise<UploadedDatasheet> {
  const filename = sanitizeFilename(file.name)
  const ext = extensionOf(file.name)

  if (!KINDS[ext]) {
    throw new DatasheetRejectedError(
      `.${ext || "?"} files aren't allowed. Use ${DATASHEET_EXTENSIONS.map((e) => e.toUpperCase()).join(", ")}.`,
    )
  }
  if (file.size > DATASHEET_MAX_BYTES) {
    throw new DatasheetRejectedError(
      `That file is ${(file.size / 1024 / 1024).toFixed(1)}MB. The limit is 60MB.`,
    )
  }
  if (!(await matchesSignature(file, ext))) {
    throw new DatasheetRejectedError(`That file isn't really a .${ext} — its contents don't match.`)
  }

  const path = `${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage.from(DATASHEET_BUCKET).upload(path, file, {
    contentType: KINDS[ext].mime,
    cacheControl: "31536000",
  })
  if (error) throw error

  const { data } = supabase.storage.from(DATASHEET_BUCKET).getPublicUrl(path)
  return { url: data.publicUrl, filename, path }
}

/** Recovers the storage key from a public URL so the object can be removed. */
export function datasheetPathFromUrl(url: string | null | undefined): string | null {
  if (!url) return null
  const marker = `/${DATASHEET_BUCKET}/`
  const at = url.indexOf(marker)
  return at < 0 ? null : decodeURIComponent(url.slice(at + marker.length).split("?")[0])
}

/** Best-effort removal; a failure here must not block saving the product. */
export async function deleteDatasheet(url: string | null | undefined): Promise<void> {
  const path = datasheetPathFromUrl(url)
  if (!path) return
  await supabase.storage.from(DATASHEET_BUCKET).remove([path])
}
