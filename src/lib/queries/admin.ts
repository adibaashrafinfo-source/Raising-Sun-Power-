import { supabase } from "@/lib/supabase"
import type {
  Brand,
  Category,
  Coupon,
  Lead,
  LeadStatus,
  Order,
  OrderStatus,
  Product,
  Profile,
  Settings,
} from "@/types/database"

const PRODUCT_SELECT =
  "*, category:categories(id,name,slug), brand:brands(id,name,slug,logo_url)"

// ---------- Dashboard ----------
const TREND_DAYS = 14

export type DashboardStats = Awaited<ReturnType<typeof fetchDashboardStats>>

export async function fetchDashboardStats() {
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)
  const startOfYesterday = new Date(startOfToday)
  startOfYesterday.setDate(startOfYesterday.getDate() - 1)
  const trendStart = new Date(startOfToday)
  trendStart.setDate(trendStart.getDate() - (TREND_DAYS - 1))

  const [
    todayOrders,
    yesterdayOrders,
    pendingOrders,
    allOrders,
    lowStock,
    recentOrders,
    topProducts,
    trendOrders,
    statusRows,
    customerCount,
  ] = await Promise.all([
    supabase.from("orders").select("total").gte("created_at", startOfToday.toISOString()),
    supabase
      .from("orders")
      .select("total")
      .gte("created_at", startOfYesterday.toISOString())
      .lt("created_at", startOfToday.toISOString()),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase.from("products").select("id", { count: "exact", head: true }).lt("stock_qty", 10),
    supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(6),
    supabase.from("products").select("*").order("rating_count", { ascending: false }).limit(5),
    supabase.from("orders").select("total, created_at").gte("created_at", trendStart.toISOString()),
    supabase.from("orders").select("status"),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
  ])

  const todaySales = (todayOrders.data ?? []).reduce((sum, o) => sum + Number(o.total), 0)
  const yesterdaySales = (yesterdayOrders.data ?? []).reduce((sum, o) => sum + Number(o.total), 0)
  const salesChangePct =
    yesterdaySales > 0 ? ((todaySales - yesterdaySales) / yesterdaySales) * 100 : todaySales > 0 ? 100 : 0

  const salesTrend: { date: string; sales: number; orders: number }[] = []
  for (let i = TREND_DAYS - 1; i >= 0; i--) {
    const d = new Date(startOfToday)
    d.setDate(d.getDate() - i)
    salesTrend.push({ date: d.toISOString().slice(0, 10), sales: 0, orders: 0 })
  }
  const trendMap = new Map(salesTrend.map((t) => [t.date, t]))
  for (const o of trendOrders.data ?? []) {
    const bucket = trendMap.get(String(o.created_at).slice(0, 10))
    if (bucket) {
      bucket.sales += Number(o.total)
      bucket.orders += 1
    }
  }

  const statusCounts: Record<string, number> = {}
  for (const row of statusRows.data ?? []) {
    statusCounts[row.status] = (statusCounts[row.status] ?? 0) + 1
  }

  return {
    todaySales,
    todayOrderCount: todayOrders.data?.length ?? 0,
    salesChangePct,
    pendingCount: pendingOrders.count ?? 0,
    totalOrders: allOrders.count ?? 0,
    lowStockCount: lowStock.count ?? 0,
    customerCount: customerCount.count ?? 0,
    recentOrders: (recentOrders.data as Order[]) ?? [],
    topProducts: (topProducts.data as Product[]) ?? [],
    salesTrend,
    statusCounts,
  }
}

// ---------- Orders ----------
export async function fetchAllOrders(filters: { status?: OrderStatus; search?: string }): Promise<Order[]> {
  let query = supabase.from("orders").select("*").order("created_at", { ascending: false })
  if (filters.status) query = query.eq("status", filters.status)
  if (filters.search) query = query.or(`order_number.ilike.%${filters.search}%,guest_phone.ilike.%${filters.search}%`)
  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  const { error } = await supabase.from("orders").update({ status }).eq("id", orderId)
  if (error) throw error
}

// ---------- Products ----------
export async function fetchAllProductsAdmin(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .order("created_at", { ascending: false })
  if (error) throw error
  return (data as unknown as Product[]) ?? []
}

export type ProductUpsert = {
  id?: string
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
  status: "draft" | "published" | "archived"
}

export async function upsertProduct(product: ProductUpsert): Promise<void> {
  if (product.id) {
    const { id, ...patch } = product
    const { error } = await supabase.from("products").update(patch).eq("id", id)
    if (error) throw error
  } else {
    const { error } = await supabase.from("products").insert(product)
    if (error) throw error
  }
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from("products").delete().eq("id", id)
  if (error) throw error
}

export async function uploadProductImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop()
  const path = `${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage.from("product-images").upload(path, file)
  if (error) throw error
  const { data } = supabase.storage.from("product-images").getPublicUrl(path)
  return data.publicUrl
}

// ---------- Categories ----------
export async function fetchAllCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from("categories").select("*").order("sort_order")
  if (error) throw error
  return data ?? []
}

export async function upsertCategory(category: Partial<Category> & { name: string; slug: string }) {
  if (category.id) {
    const { id, ...patch } = category
    const { error } = await supabase.from("categories").update(patch).eq("id", id)
    if (error) throw error
  } else {
    const { error } = await supabase.from("categories").insert(category)
    if (error) throw error
  }
}

export async function deleteCategory(id: string) {
  const { error } = await supabase.from("categories").delete().eq("id", id)
  if (error) throw error
}

// ---------- Brands ----------
export async function fetchAllBrands(): Promise<Brand[]> {
  const { data, error } = await supabase.from("brands").select("*").order("name")
  if (error) throw error
  return data ?? []
}

export async function upsertBrand(brand: Partial<Brand> & { name: string; slug: string }) {
  if (brand.id) {
    const { id, ...patch } = brand
    const { error } = await supabase.from("brands").update(patch).eq("id", id)
    if (error) throw error
  } else {
    const { error } = await supabase.from("brands").insert(brand)
    if (error) throw error
  }
}

export async function deleteBrand(id: string) {
  const { error } = await supabase.from("brands").delete().eq("id", id)
  if (error) throw error
}

// ---------- Customers ----------
export async function fetchCustomers(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
  if (error) throw error
  return data ?? []
}

// ---------- Coupons ----------
export async function fetchAllCoupons(): Promise<Coupon[]> {
  const { data, error } = await supabase.from("coupons").select("*").order("created_at", { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function upsertCoupon(coupon: Partial<Coupon> & { code: string }) {
  if (coupon.id) {
    const { id, ...patch } = coupon
    const { error } = await supabase.from("coupons").update(patch).eq("id", id)
    if (error) throw error
  } else {
    const { error } = await supabase.from("coupons").insert(coupon)
    if (error) throw error
  }
}

export async function deleteCoupon(id: string) {
  const { error } = await supabase.from("coupons").delete().eq("id", id)
  if (error) throw error
}

// ---------- Leads ----------
export async function fetchAllLeads(filters: { status?: LeadStatus }): Promise<Lead[]> {
  let query = supabase.from("leads").select("*").order("created_at", { ascending: false })
  if (filters.status) query = query.eq("status", filters.status)
  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function updateLead(id: string, patch: Partial<Pick<Lead, "status" | "admin_notes">>) {
  const { error } = await supabase.from("leads").update(patch).eq("id", id)
  if (error) throw error
}

// ---------- Settings ----------
export async function updateSettings(patch: Partial<Settings>) {
  const { error } = await supabase.from("settings").update(patch).eq("id", 1)
  if (error) throw error
}
