import { supabase } from "@/lib/supabase"
import type { PackageCategory, PackageItem, SolarPackage } from "@/types/database"

const PACKAGE_SELECT = "*, category:package_categories(id,name,slug)"

export async function fetchPackageCategories(): Promise<PackageCategory[]> {
  const { data, error } = await supabase
    .from("package_categories")
    .select("*")
    .order("sort_order")
  if (error) throw error
  return data ?? []
}

export async function fetchPackages(filters?: {
  categorySlug?: string
  featuredOnly?: boolean
  limit?: number
}): Promise<SolarPackage[]> {
  let query = supabase
    .from("packages")
    .select(PACKAGE_SELECT)
    .eq("status", "published")
    .order("sort_order")
    .order("capacity_kw", { ascending: true })

  if (filters?.categorySlug) {
    const { data: cat } = await supabase
      .from("package_categories")
      .select("id")
      .eq("slug", filters.categorySlug)
      .maybeSingle()
    // An unknown slug must return nothing rather than the whole list.
    query = query.eq("category_id", cat?.id ?? "00000000-0000-0000-0000-000000000000")
  }
  if (filters?.featuredOnly) query = query.eq("is_featured", true)
  if (filters?.limit) query = query.limit(filters.limit)

  const { data, error } = await query
  if (error) throw error
  return (data as unknown as SolarPackage[]) ?? []
}

export async function fetchPackageBySlug(slug: string): Promise<SolarPackage | null> {
  const { data, error } = await supabase
    .from("packages")
    .select(PACKAGE_SELECT)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle()
  if (error) throw error
  if (!data) return null

  const { data: items, error: itemsError } = await supabase
    .from("package_items")
    .select("*")
    .eq("package_id", (data as unknown as SolarPackage).id)
    .order("sort_order")
  if (itemsError) throw itemsError

  return { ...(data as unknown as SolarPackage), items: (items as PackageItem[]) ?? [] }
}

// ---------- Admin ----------
export async function fetchAllPackagesAdmin(): Promise<SolarPackage[]> {
  const { data, error } = await supabase
    .from("packages")
    .select(PACKAGE_SELECT)
    .order("created_at", { ascending: false })
  if (error) throw error
  return (data as unknown as SolarPackage[]) ?? []
}

export async function fetchPackageItemsAdmin(packageId: string): Promise<PackageItem[]> {
  const { data, error } = await supabase
    .from("package_items")
    .select("*")
    .eq("package_id", packageId)
    .order("sort_order")
  if (error) throw error
  return data ?? []
}

export type PackageItemInput = Omit<PackageItem, "id" | "package_id">

/**
 * Saves a package and its contents together. The items are replaced wholesale
 * rather than diffed — a package holds a handful of lines, and a replace can't
 * leave a stale row behind.
 */
export async function upsertPackage(
  pkg: Partial<SolarPackage> & { name: string; slug: string },
  items: PackageItemInput[],
): Promise<string> {
  // Joined and server-managed fields must not go back in the write.
  const { id, category: _category, items: _items, created_at: _created, updated_at: _updated, ...patch } = pkg
  void _category
  void _items
  void _created
  void _updated

  let packageId = id
  if (packageId) {
    const { error } = await supabase.from("packages").update(patch).eq("id", packageId)
    if (error) throw error
  } else {
    const { data, error } = await supabase.from("packages").insert(patch).select("id").single()
    if (error) throw error
    packageId = data.id
  }

  const { error: clearError } = await supabase
    .from("package_items")
    .delete()
    .eq("package_id", packageId)
  if (clearError) throw clearError

  if (items.length) {
    const { error: insertError } = await supabase.from("package_items").insert(
      items.map((item, i) => ({ ...item, package_id: packageId, sort_order: i })),
    )
    if (insertError) throw insertError
  }

  return packageId!
}

export async function deletePackage(id: string): Promise<void> {
  const { error } = await supabase.from("packages").delete().eq("id", id)
  if (error) throw error
}

export async function upsertPackageCategory(
  category: Partial<PackageCategory> & { name: string; slug: string },
): Promise<void> {
  if (category.id) {
    const { id, ...patch } = category
    const { error } = await supabase.from("package_categories").update(patch).eq("id", id)
    if (error) throw error
  } else {
    const { error } = await supabase.from("package_categories").insert(category)
    if (error) throw error
  }
}

export async function deletePackageCategory(id: string): Promise<void> {
  const { error } = await supabase.from("package_categories").delete().eq("id", id)
  if (error) throw error
}
