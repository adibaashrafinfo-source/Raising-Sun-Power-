import { supabase } from "@/lib/supabase"
import { type UploadedImage, uploadImageToBucket } from "@/lib/upload-image"
import type { SiteContent } from "@/types/database"

export async function fetchSiteContent(): Promise<SiteContent> {
  const { data, error } = await supabase.from("site_content").select("*").eq("id", 1).single()
  if (error) throw error
  return data
}

export async function updateSiteContent(patch: Partial<SiteContent>) {
  const { error } = await supabase.from("site_content").update(patch).eq("id", 1)
  if (error) throw error
}

// Uploads an image to the public `site-assets` bucket. Used by the CMS for
// logos, the hero image and any other site imagery. The hero is full-bleed, so
// site assets keep a larger budget than product photos.
export function uploadSiteAsset(file: File): Promise<UploadedImage> {
  return uploadImageToBucket("site-assets", file, { maxDimension: 2000, maxBytes: 400_000 })
}
