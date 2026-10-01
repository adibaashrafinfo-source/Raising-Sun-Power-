import { supabase } from "@/lib/supabase"
import type { HeroSlideRow } from "@/types/database"

export type HeroSlideInput = Omit<HeroSlideRow, "id" | "created_at" | "updated_at"> & { id?: string }

/** What the homepage shows: active slides only, in the admin's order. */
export async function fetchHeroSlides(): Promise<HeroSlideRow[]> {
  const { data, error } = await supabase
    .from("hero_slides")
    .select("*")
    .eq("is_active", true)
    .order("sort_order")
    .order("created_at")
  if (error) throw error
  return data ?? []
}

/** The admin list, which includes the slides that are switched off. */
export async function fetchHeroSlidesAdmin(): Promise<HeroSlideRow[]> {
  const { data, error } = await supabase
    .from("hero_slides")
    .select("*")
    .order("sort_order")
    .order("created_at")
  if (error) throw error
  return data ?? []
}

export async function upsertHeroSlide(slide: HeroSlideInput) {
  const { error } = await supabase.from("hero_slides").upsert(slide)
  if (error) throw error
}

export async function deleteHeroSlide(id: string) {
  const { error } = await supabase.from("hero_slides").delete().eq("id", id)
  if (error) throw error
}
