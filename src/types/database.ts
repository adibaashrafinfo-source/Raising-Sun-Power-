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

export type Settings = {
  id: number
  delivery_charge_inside_dhaka: number
  delivery_charge_outside_dhaka: number
  free_delivery_threshold: number
  cod_enabled: boolean
  bkash_enabled: boolean
  nagad_enabled: boolean
  support_phone: string
}

export type Coupon = {
  id: string
  code: string
  discount_type: "percent" | "flat"
  discount_value: number
  usage_limit: number | null
  used_count: number
  expires_at: string | null
  active: boolean
}

export type PaymentMethod = "cod" | "bkash" | "nagad"
export type DeliveryMethod = "courier" | "pickup"
export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled"

export type OrderItemInsert = {
  product_id: string | null
  product_name: string
  unit_price: number
  qty: number
  line_total: number
}

export type OrderInsert = {
  order_number: string
  guest_name: string
  guest_phone: string
  status: OrderStatus
  payment_method: PaymentMethod
  payment_reference: string | null
  payment_sender_number: string | null
  division: string
  district: string
  upazila: string | null
  address_line: string
  landmark: string | null
  delivery_method: DeliveryMethod
  subtotal: number
  delivery_charge: number
  discount: number
  coupon_id: string | null
  total: number
  notes: string | null
}

export type Order = OrderInsert & {
  id: string
  user_id: string | null
  courier_status: string | null
  created_at: string
  updated_at: string
}

export type OrderItem = OrderItemInsert & {
  id: string
  order_id: string
}

export type LeadSource = "calculator" | "direct"
export type LeadStatus = "new" | "contacted" | "quoted" | "converted" | "lost"

export type LeadInsert = {
  ref_id: string
  name: string
  phone: string
  email: string | null
  division: string
  district: string
  load_watt: number | null
  backup_hours: number | null
  budget_range: string | null
  roof_type: string | null
  timeline: string | null
  notes: string | null
  source: LeadSource
  status: LeadStatus
}

export type Lead = LeadInsert & {
  id: string
  admin_notes: string | null
  created_at: string
  updated_at: string
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
