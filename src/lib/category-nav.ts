import { categories as fallbackCategories } from "@/data/home-content"
import { useCategories } from "@/hooks/use-catalog"

export type NavCategory = { slug: string; name: string; tint: string }

// Cycled through so a category added from the admin panel still gets a tile
// colour without anyone having to touch the code.
const TINTS = [
  "linear-gradient(135deg,#EAF1FB,#C9DCF3)",
  "linear-gradient(135deg,#FEF0D6,#F7D69B)",
  "linear-gradient(135deg,#EAF6DD,#CDE9B7)",
  "linear-gradient(135deg,#FDF4D2,#F3DE94)",
]

/**
 * The category list every menu renders — the mega menu, the desktop "All
 * Categories" panel and the mobile sheet. It comes from the categories table,
 * so adding, renaming, reordering or deleting a category in the admin panel is
 * all it takes. The bundled list stands in only while the first fetch is in
 * flight or if the table comes back empty, so a menu is never blank.
 */
export function useNavCategories(): NavCategory[] {
  const { data = [] } = useCategories()

  if (!data.length) {
    return fallbackCategories.map((c) => ({ slug: c.slug, name: c.name, tint: c.tint }))
  }
  return data.map((c, i) => ({ slug: c.slug, name: c.name, tint: TINTS[i % TINTS.length] }))
}
