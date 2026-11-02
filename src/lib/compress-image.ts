// Browser-side image optimisation applied before anything is uploaded to
// Supabase Storage.
//
// Admins routinely pick straight-from-the-camera or AI-generated files that run
// to several megabytes. Those are slow to upload, slow to render, and a large
// or subtly malformed file is the difference between a product photo that shows
// and one that silently falls back to a placeholder. Re-encoding through a
// canvas both shrinks the file and normalises it into a format the browser has
// just proven it can decode.
//
// Every failure path returns the original file — optimisation must never be the
// reason an upload fails.

export type CompressOptions = {
  /** Longest edge of the output, in pixels. Images smaller than this are never upscaled. */
  maxDimension?: number
  /** Stop lowering quality once the encoded file is at or below this size. */
  maxBytes?: number
  /** Starting encoder quality (0–1). */
  quality?: number
  /**
   * Fit the whole picture onto a square canvas (white behind a JPEG,
   * transparent behind a WebP) instead of keeping its own proportions. Product
   * cards and galleries show images in square frames, so a square file is shown
   * whole rather than cropped at the edges.
   */
  square?: boolean
}

const DEFAULTS = {
  maxDimension: 1600,
  maxBytes: 300_000,
  quality: 0.86,
  square: false,
} satisfies Required<CompressOptions>

/** Quality ladder tried in order until the result fits under `maxBytes`. */
const QUALITY_STEPS = [0.86, 0.76, 0.66, 0.56, 0.46]

/** Formats we must not re-encode: vectors lose nothing, GIFs lose animation. */
const PASSTHROUGH = new Set(["image/svg+xml", "image/gif"])

/** Source formats that may carry transparency, so they re-encode to WebP. */
const MAY_HAVE_ALPHA = new Set(["image/png", "image/webp", "image/avif"])

export type CompressResult = {
  file: File
  /** Bytes of the original file. */
  originalSize: number
  /** True when the returned file is a newly encoded, smaller one. */
  compressed: boolean
}

export async function compressImage(
  file: File,
  options: CompressOptions = {},
): Promise<CompressResult> {
  const { maxDimension, maxBytes, quality, square } = { ...DEFAULTS, ...options }
  const unchanged: CompressResult = { file, originalSize: file.size, compressed: false }

  if (!file.type.startsWith("image/") || PASSTHROUGH.has(file.type)) return unchanged

  try {
    const bitmap = await decode(file)
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height))
    const width = Math.max(1, Math.round(bitmap.width * scale))
    const height = Math.max(1, Math.round(bitmap.height * scale))

    // WebP keeps transparency and still compresses hard; JPEG is the safer,
    // most universally decodable choice for everything else.
    const type = MAY_HAVE_ALPHA.has(file.type) ? "image/webp" : "image/jpeg"

    const side = Math.max(width, height)
    const canvas = document.createElement("canvas")
    canvas.width = square ? side : width
    canvas.height = square ? side : height
    const ctx = canvas.getContext("2d")
    if (!ctx) return unchanged
    // A JPEG has no alpha, so anything transparent would turn black.
    if (type === "image/jpeg") {
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
    ctx.drawImage(bitmap, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height)
    if ("close" in bitmap) bitmap.close()

    const ladder = QUALITY_STEPS.filter((step) => step <= quality)
    let blob: Blob | null = null
    for (const q of ladder.length ? ladder : [quality]) {
      blob = await toBlob(canvas, type, q)
      if (blob && blob.size <= maxBytes) break
    }
    if (!blob) return unchanged

    // Re-encoding an already-small or already-efficient file can make it bigger —
    // but a square fit is a change of shape the admin asked for, so it stays.
    if (!square && blob.size >= file.size) return unchanged

    const ext = blob.type === "image/webp" ? "webp" : "jpg"
    const base = file.name.replace(/\.[^.]+$/, "") || "image"
    return {
      file: new File([blob], `${base}.${ext}`, { type: blob.type }),
      originalSize: file.size,
      compressed: true,
    }
  } catch {
    // Corrupt file, tainted canvas, unsupported codec — upload the original.
    return unchanged
  }
}

async function decode(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file)
    } catch {
      // Fall through to the <img> path, which tolerates some files
      // createImageBitmap rejects.
    }
  }
  const url = URL.createObjectURL(file)
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error("Could not decode image"))
      img.src = url
    })
  } finally {
    URL.revokeObjectURL(url)
  }
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality))
}

/** "1.9 MB", "184 KB" — for upload feedback. */
export function formatBytes(bytes: number): string {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`
  return `${Math.max(1, Math.round(bytes / 1000))} KB`
}
