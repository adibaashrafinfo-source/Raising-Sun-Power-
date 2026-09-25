import { supabase } from "@/lib/supabase"

export const DATASHEET_BUCKET = "product-datasheets"
export const DATASHEET_MAX_BYTES = 10 * 1024 * 1024

export type UploadedDatasheet = { url: string; filename: string; path: string }

/** Thrown for a file the admin can fix by picking a different one. */
export class DatasheetRejectedError extends Error {}

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
  return safe.toLowerCase().endsWith(".pdf") ? safe : `${safe}.pdf`
}

/** True when the file really starts with the PDF magic number. */
async function looksLikePdf(file: File): Promise<boolean> {
  const head = new Uint8Array(await file.slice(0, 5).arrayBuffer())
  return String.fromCharCode(...head) === "%PDF-"
}

/**
 * Validates and stores one datasheet. Extension, MIME type and the file's own
 * first bytes are all checked, so a renamed .exe or .jpg is refused before it
 * reaches storage — and the bucket is configured to accept application/pdf up
 * to 10MB only, so the same limits hold server-side.
 */
export async function uploadDatasheet(file: File): Promise<UploadedDatasheet> {
  const filename = sanitizeFilename(file.name)

  if (!file.name.toLowerCase().endsWith(".pdf")) {
    throw new DatasheetRejectedError("Only PDF files are allowed — pick a file ending in .pdf.")
  }
  if (file.type !== "application/pdf") {
    throw new DatasheetRejectedError("That file isn't a PDF. Only PDF datasheets can be uploaded.")
  }
  if (file.size > DATASHEET_MAX_BYTES) {
    throw new DatasheetRejectedError(
      `That PDF is ${(file.size / 1024 / 1024).toFixed(1)}MB. The limit is 10MB.`,
    )
  }
  if (!(await looksLikePdf(file))) {
    throw new DatasheetRejectedError("That file isn't really a PDF — its contents don't match.")
  }

  const path = `${crypto.randomUUID()}.pdf`
  const { error } = await supabase.storage.from(DATASHEET_BUCKET).upload(path, file, {
    contentType: "application/pdf",
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
