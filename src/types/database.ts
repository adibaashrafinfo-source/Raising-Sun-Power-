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
  unit: string
  cost_price: number
  warranty_months: number
  has_serial_tracking: boolean
  reorder_level: number
  is_active: boolean
  category?: Pick<Category, "id" | "name" | "slug"> | null
  brand?: Pick<Brand, "id" | "name" | "slug" | "logo_url"> | null
}

export type Location = {
  id: string
  name: string
  address: string | null
  phone: string | null
  is_active: boolean
  is_default: boolean
  created_at: string
}

export type ProductStock = {
  id: string
  product_id: string
  location_id: string
  quantity: number
  min_stock_level: number
  updated_at: string
  location?: Pick<Location, "id" | "name">
  product?: Pick<Product, "id" | "name" | "sku"> & {
    category?: Pick<Category, "id" | "name"> | null
  }
}

export type StockMovementType = "in" | "out" | "transfer_in" | "transfer_out" | "adjustment"

export type StockMovement = {
  id: string
  product_id: string
  location_id: string
  movement_type: StockMovementType
  quantity: number
  reference_type: string | null
  reference_id: string | null
  reason: string | null
  created_by: string | null
  created_at: string
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
  user_id?: string | null
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

export type ProfileRole = "customer" | "admin"

export type Profile = {
  id: string
  full_name: string | null
  phone: string | null
  role: ProfileRole
  created_at: string
}

export type AddressInsert = {
  user_id: string
  label: string | null
  full_name: string
  phone: string
  division: string
  district: string
  upazila: string | null
  address_line: string
  landmark: string | null
  is_default: boolean
}

export type Address = AddressInsert & {
  id: string
  created_at: string
}

export type WishlistItem = {
  id: string
  user_id: string
  product_id: string
  created_at: string
  product?: Product
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
