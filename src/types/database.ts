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
  short_description: string | null
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
  is_best_seller: boolean
  is_new_arrival: boolean
  is_featured: boolean
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
  facebook_url: string | null
  instagram_url: string | null
  youtube_url: string | null
  linkedin_url: string | null
  tiktok_url: string | null
  contact_email: string | null
  whatsapp_number: string | null
}

export type SiteContent = {
  id: number
  header_logo_url: string | null
  footer_logo_url: string | null
  hero_image_url: string | null
  hero_badge: string | null
  hero_headline_prefix: string | null
  hero_headline_highlight: string | null
  hero_subheading: string | null
  footer_description: string | null
  footer_designed_by: string | null
  about_badge: string | null
  about_title: string | null
  about_highlight: string | null
  about_intro: string | null
  about_story: string | null
  showroom_1_name: string | null
  showroom_1_address: string | null
  showroom_2_name: string | null
  showroom_2_address: string | null
  /** Optional: present once the showroom_3_* columns exist on the row. */
  showroom_3_name?: string | null
  showroom_3_address?: string | null
  business_hours: string | null
  updated_at: string
}

export type ContactMessageStatus = "new" | "read"

export type ContactMessageInsert = {
  name: string
  email: string
  phone: string | null
  subject: string
  message: string
}

export type ContactMessage = ContactMessageInsert & {
  id: string
  status: ContactMessageStatus
  created_at: string
}

export type RoiTariffSlab = { minUnits: number; maxUnits: number | null; rate: number }

export type RoiCalculatorSettings = {
  id: number
  residential_slabs: RoiTariffSlab[]
  commercial_rate: number
  industrial_rate: number
  avg_peak_sun_hours_per_day: number
  system_efficiency_factor: number
  cost_per_kw_installed_bdt: number
  panel_lifespan_years: number
  annual_degradation_rate: number
  annual_electricity_price_escalation: number
  annual_maintenance_cost_rate: number
  first_year_degradation_rate: number
  inverter_replacement_year: number
  inverter_replacement_cost_ratio: number
  self_consumption_ratio: number
  export_credit_ratio: number
  discount_rate: number
  updated_at: string
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
  paid_amount: number
  due_amount: number
  payment_status: PurchasePaymentStatus
  created_at: string
  updated_at: string
}

export type OrderItem = OrderItemInsert & {
  id: string
  order_id: string
}

export type LeadSource = "calculator" | "direct" | "roi_calculator" | "assessment" | "wholesale"
export type LeadStatus = "new" | "contacted" | "quoted" | "converted" | "lost"

export type LeadInsert = {
  ref_id: string
  name: string
  phone: string
  email: string | null
  // The Solar Assessment form captures a single free-text `location` instead of
  // a division/district pair, so both are nullable.
  division: string | null
  district: string | null
  load_watt: number | null
  backup_hours: number | null
  budget_range: string | null
  roof_type: string | null
  timeline: string | null
  notes: string | null
  source: LeadSource
  status: LeadStatus
  customer_type?: string | null
  system_type?: string | null
  monthly_bill?: string | null
  location?: string | null
}

export type Lead = LeadInsert & {
  id: string
  admin_notes: string | null
  created_at: string
  updated_at: string
}

export type ProfileRole = "customer" | "admin" | "manager" | "staff"

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

// ---------- Inventory & Finance: Suppliers / Purchases ----------
export type FinancePaymentMethod = "cash" | "bkash" | "nagad" | "bank" | "card"
export type PurchasePaymentStatus = "due" | "partial" | "paid"

export type Supplier = {
  id: string
  name: string
  phone: string | null
  email: string | null
  address: string | null
  payment_terms: string | null
  opening_balance: number
  current_due: number
  is_active: boolean
  created_at: string
}

export type Purchase = {
  id: string
  invoice_number: string
  supplier_id: string
  po_id: string | null
  location_id: string
  purchase_date: string
  subtotal: number
  tax_amount: number
  total_amount: number
  paid_amount: number
  due_amount: number
  payment_status: PurchasePaymentStatus
  created_by: string | null
  created_at: string
  supplier?: Pick<Supplier, "id" | "name" | "phone">
  location?: Pick<Location, "id" | "name">
}

export type PurchaseItem = {
  id: string
  purchase_id: string
  product_id: string
  quantity: number
  unit_cost: number
  subtotal: number
  product?: Pick<Product, "id" | "name" | "sku">
}

export type SupplierPayment = {
  id: string
  supplier_id: string
  purchase_id: string | null
  amount: number
  payment_method: FinancePaymentMethod
  payment_date: string
  reference_note: string | null
  created_by: string | null
  created_at: string
}

export type PurchaseReturn = {
  id: string
  return_number: string
  purchase_id: string | null
  supplier_id: string
  return_date: string
  total_amount: number
  reason: string | null
  created_by: string | null
  created_at: string
  supplier?: Pick<Supplier, "id" | "name">
  purchase?: Pick<Purchase, "id" | "invoice_number">
}

export type PurchaseReturnItem = {
  id: string
  return_id: string
  product_id: string
  quantity: number
  unit_cost: number
}

// ---------- Inventory & Finance: Customer Payments / Sales Returns ----------
export type RefundStatus = "pending" | "refunded" | "rejected"

export type CustomerPayment = {
  id: string
  order_id: string
  amount: number
  payment_method: FinancePaymentMethod
  payment_date: string
  reference_note: string | null
  created_by: string | null
  created_at: string
}

export type SalesReturn = {
  id: string
  return_number: string
  order_id: string
  return_date: string
  total_amount: number
  reason: string | null
  refund_status: RefundStatus
  created_by: string | null
  created_at: string
  order?: Pick<Order, "id" | "order_number">
}

export type SalesReturnItem = {
  id: string
  return_id: string
  product_id: string
  quantity: number
  unit_price: number
}

// ---------- Inventory & Finance: Expenses / Accounts / Ledger ----------
export type CashAccountType = "cash" | "bank" | "bkash" | "nagad"
export type LedgerEntryType = "income" | "expense"

export type ExpenseCategory = {
  id: string
  name: string
}

export type Expense = {
  id: string
  category_id: string
  amount: number
  expense_date: string
  description: string | null
  payment_method: FinancePaymentMethod
  created_by: string | null
  created_at: string
  category?: Pick<ExpenseCategory, "id" | "name">
}

export type CashBankAccount = {
  id: string
  account_name: string
  account_type: CashAccountType
  account_number: string | null
  current_balance: number
  created_at: string
}

export type LedgerEntry = {
  id: string
  entry_type: LedgerEntryType
  amount: number
  source_type: string
  source_id: string | null
  description: string | null
  entry_date: string
  created_by: string | null
  created_at: string
}
