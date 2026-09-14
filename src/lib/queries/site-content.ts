import { supabase } from "@/lib/supabase"
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

// Uploads an image to the public `site-assets` bucket and returns its URL.
// Used by the CMS for logos, the hero image and any other site imagery.
export async function uploadSiteAsset(file: File): Promise<string> {
  const ext = file.name.split(".").pop()
  const path = `${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage.from("site-assets").upload(path, file)
  if (error) throw error
  const { data } = supabase.storage.from("site-assets").getPublicUrl(path)
  return data.publicUrl
}
