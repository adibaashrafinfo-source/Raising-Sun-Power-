export type Category = {
  id: string
  name: string
  slug: string
  icon: string | null
  parent_id: string | null
  sort_order: number
  created_at: string
}

export type Brand = {
  id: string
  name: string
  slug: string
  logo_url: string | null
  created_at: string
}

export type ProductStatus = "draft" | "published" | "archived"

export type Product = {
  id: string
  name: string
  slug: string
  category_id: string | null
  brand_id: string | null
  sku: string | null
  price: number
  sale_price: number | null
  stock_qty: number
  description: string | null
  specifications: Record<string, string>
  badges: string[]
  images: string[]
  status: ProductStatus
  rating_avg: number
  rating_count: number
  created_at: string
  updated_at: string
  category?: Pick<Category, "id" | "name" | "slug"> | null
  brand?: Pick<Brand, "id" | "name" | "slug" | "logo_url"> | null
}

export type Review = {
  id: string
  product_id: string
  user_id: string | null
  rating: number
  comment: string | null
  created_at: string
}

export type ProductSort = "popular" | "price-asc" | "price-desc" | "newest" | "rating"

export type ProductFilters = {
  categorySlug?: string
  categorySlugs?: string[]
  brandSlugs?: string[]
  maxPrice?: number
  inStockOnly?: boolean
  sort?: ProductSort
  page?: number
  pageSize?: number
  search?: string
}
