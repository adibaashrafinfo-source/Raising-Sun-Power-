import { supabase } from "@/lib/supabase"
import type { Brand, Category, Product, ProductFilters, Review } from "@/types/database"

const PRODUCT_SELECT =
  "*, category:categories(id,name,slug), brand:brands(id,name,slug,logo_url)"

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function fetchBrands(): Promise<Brand[]> {
  const { data, error } = await supabase.from("brands").select("*").order("name")
  if (error) throw error
  return data ?? []
}

export async function fetchProducts(
  filters: ProductFilters,
): Promise<{ products: Product[]; count: number }> {
  const page = filters.page ?? 1
  const pageSize = filters.pageSize ?? 12
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from("products")
    .select(PRODUCT_SELECT, { count: "exact" })
    .eq("status", "published")

  const categorySlugs = filters.categorySlug
    ? [filters.categorySlug]
    : filters.categorySlugs
  if (categorySlugs?.length) {
    const { data: cats } = await supabase
      .from("categories")
      .select("id")
      .in("slug", categorySlugs)
    const ids = (cats ?? []).map((c) => c.id)
    query = query.in("category_id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"])
  }
  if (filters.brandSlugs?.length) {
    const { data: brandRows } = await supabase
      .from("brands")
      .select("id")
      .in("slug", filters.brandSlugs)
    const ids = (brandRows ?? []).map((b) => b.id)
    if (ids.length) query = query.in("brand_id", ids)
  }
  if (filters.maxPrice != null) {
    query = query.lte("price", filters.maxPrice)
  }
  if (filters.inStockOnly) {
    query = query.gt("stock_qty", 0)
  }
  if (filters.search) {
    query = query.ilike("name", `%${filters.search}%`)
  }

  switch (filters.sort) {
    case "price-asc":
      query = query.order("price", { ascending: true })
      break
    case "price-desc":
      query = query.order("price", { ascending: false })
      break
    case "newest":
      query = query.order("created_at", { ascending: false })
      break
    case "rating":
      query = query.order("rating_avg", { ascending: false })
      break
    default:
      query = query.order("rating_count", { ascending: false })
  }

  const { data, error, count } = await query.range(from, to)
  if (error) throw error
  return { products: (data as unknown as Product[]) ?? [], count: count ?? 0 }
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle()
  if (error) throw error
  return data as unknown as Product | null
}

export async function fetchRelatedProducts(
  categoryId: string | null,
  excludeId: string,
): Promise<Product[]> {
  if (!categoryId) return []
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("category_id", categoryId)
    .eq("status", "published")
    .neq("id", excludeId)
    .limit(4)
  if (error) throw error
  return (data as unknown as Product[]) ?? []
}

export async function fetchReviews(productId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: false })
  if (error) throw error
  return data ?? []
}
