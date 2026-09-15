import { type CompressOptions, compressImage } from "@/lib/compress-image"
import { supabase } from "@/lib/supabase"

export type UploadedImage = {
  url: string
  /** Size of the file the admin picked. */
  originalSize: number
  /** Size actually stored. */
  size: number
  /** True when the file was re-encoded smaller before upload. */
  compressed: boolean
}

/**
 * Shared upload path for every admin image: optimise in the browser, then store
 * in the given public bucket with the correct content type and a long cache
 * lifetime (names are UUIDs, so stored objects are immutable).
 */
export async function uploadImageToBucket(
  bucket: string,
  file: File,
  options?: CompressOptions,
): Promise<UploadedImage> {
  const { file: optimized, originalSize, compressed } = await compressImage(file, options)
  const ext = optimized.name.split(".").pop() || "jpg"
  const path = `${crypto.randomUUID()}.${ext}`

  const { error } = await supabase.storage.from(bucket).upload(path, optimized, {
    contentType: optimized.type,
    cacheControl: "31536000",
  })
  if (error) throw error

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return { url: data.publicUrl, originalSize, size: optimized.size, compressed }
}
