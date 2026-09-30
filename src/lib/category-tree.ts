import { useCategories } from "@/hooks/use-catalog"
import type { Category } from "@/types/database"

export type MenuGroup = Category & { children: Category[] }

/**
 * The category tree the header's mega menus are built from: a top-level
 * category is a menu, and the categories filed under it are that menu's items.
 * Both levels come from the categories table, so the admin panel is what edits
 * the menu — add a category, give it a parent, and it appears.
 */
export function useMenuGroups(): MenuGroup[] {
  const { data: categories = [] } = useCategories()

  const byParent = new Map<string, Category[]>()
  for (const cat of categories) {
    if (!cat.parent_id) continue
    const siblings = byParent.get(cat.parent_id) ?? []
    siblings.push(cat)
    byParent.set(cat.parent_id, siblings)
  }

  const sortOrder = (a: Category, b: Category) =>
    a.sort_order - b.sort_order || a.name.localeCompare(b.name)

  return categories
    .filter((cat) => !cat.parent_id)
    .sort(sortOrder)
    .map((parent) => ({ ...parent, children: (byParent.get(parent.id) ?? []).sort(sortOrder) }))
    // A group with nothing under it would open an empty panel.
    .filter((group) => group.children.length > 0)
}
